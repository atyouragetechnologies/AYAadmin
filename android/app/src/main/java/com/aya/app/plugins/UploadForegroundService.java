package com.aya.app.plugins;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.aya.app.MainActivity;
import com.aya.app.R;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * UploadForegroundService
 *
 * A proper Android Foreground Service that:
 *  1. Stays alive even when the user presses Home or switches apps
 *  2. Shows a persistent progress notification in the drawer
 *  3. Streams the file binary directly to the Cloudflare Worker upload endpoint
 *  4. Sends a local broadcast back to NativeUploadPlugin with progress/result
 *
 * Start via: Intent with ACTION_UPLOAD, extras: filePath, workerUrl, releaseId, token, fileName, callbackId, totalFiles, currentIndex
 */
public class UploadForegroundService extends Service {

    private static final String TAG = "UploadForegroundService";

    public static final String ACTION_UPLOAD       = "com.cpbs.bhajans.UPLOAD";
    public static final String ACTION_CANCEL       = "com.cpbs.bhajans.CANCEL_UPLOAD";

    public static final String ACTION_START_PROGRESS = "com.cpbs.bhajans.START_PROGRESS";
    public static final String ACTION_UPDATE_PROGRESS= "com.cpbs.bhajans.UPDATE_PROGRESS";
    public static final String ACTION_STOP_PROGRESS  = "com.cpbs.bhajans.STOP_PROGRESS";

    public static final String EXTRA_TITLE         = "title";

    // Broadcast actions sent back to the plugin
    public static final String BROADCAST_PROGRESS  = "com.cpbs.bhajans.UPLOAD_PROGRESS";
    public static final String BROADCAST_DONE      = "com.cpbs.bhajans.UPLOAD_DONE";
    public static final String BROADCAST_ERROR     = "com.cpbs.bhajans.UPLOAD_ERROR";

    public static final String EXTRA_CALLBACK_ID   = "callbackId";
    public static final String EXTRA_PROGRESS      = "progress";
    public static final String EXTRA_RESULT_URL    = "resultUrl";
    public static final String EXTRA_ERROR_MSG     = "errorMsg";
    public static final String EXTRA_FILE_NAME     = "fileName";
    public static final String EXTRA_CURRENT_INDEX = "currentIndex";
    public static final String EXTRA_TOTAL_FILES   = "totalFiles";

    private static final String CHANNEL_ID         = "upload_channel";
    private static final int    NOTIFICATION_ID    = 9001;

    private static final ExecutorService sExecutor = Executors.newFixedThreadPool(4);

    private NotificationManager notificationManager;
    private volatile int activeUploads = 0;

    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public void onCreate() {
        super.onCreate();
        notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) return START_NOT_STICKY;

        final String action = intent.getAction();

        if (ACTION_START_PROGRESS.equals(action)) {
            final String title    = intent.getStringExtra(EXTRA_TITLE);
            final String fileName = intent.getStringExtra(EXTRA_FILE_NAME);
            
            synchronized (UploadForegroundService.class) { activeUploads++; }
            startForeground(NOTIFICATION_ID, buildNotification(title != null ? title : "Uploading...", fileName, 0, false));
            return START_NOT_STICKY;
        }
        
        if (ACTION_UPDATE_PROGRESS.equals(action)) {
            final String title    = intent.getStringExtra(EXTRA_TITLE);
            final String fileName = intent.getStringExtra(EXTRA_FILE_NAME);
            final int progress    = intent.getIntExtra(EXTRA_PROGRESS, 0);
            
            updateNotification(title != null ? title : "Uploading...", fileName, progress, false);
            return START_NOT_STICKY;
        }
        
        if (ACTION_STOP_PROGRESS.equals(action)) {
            finishUpload();
            return START_NOT_STICKY;
        }

        if (ACTION_UPLOAD.equals(action)) {
            // Extract all parameters
            final String filePath     = intent.getStringExtra("filePath");
            final String workerUrl    = intent.getStringExtra("workerUrl");
            final String releaseId    = intent.getStringExtra("releaseId");
            final String token        = intent.getStringExtra("token");
            final String fileName     = intent.getStringExtra("fileName");
            final String callbackId   = intent.getStringExtra(EXTRA_CALLBACK_ID);
            final int    totalFiles   = intent.getIntExtra(EXTRA_TOTAL_FILES, 1);
            final int    currentIndex = intent.getIntExtra(EXTRA_CURRENT_INDEX, 1);

            if (filePath == null || workerUrl == null || releaseId == null || token == null || fileName == null) {
                Log.e(TAG, "Missing required extras — ignoring upload intent");
                return START_NOT_STICKY;
            }

            // Guard: if callbackId is missing, we cannot route broadcast results back
            if (callbackId == null) {
                Log.e(TAG, "Missing callbackId extra — ignoring upload intent for: " + fileName);
                return START_NOT_STICKY;
            }

            synchronized (UploadForegroundService.class) { activeUploads++; }
            // Show foreground notification immediately so Android doesn't kill us
            startForeground(NOTIFICATION_ID, buildNotification(
                    String.format("Uploading %d of %d", currentIndex, totalFiles),
                    fileName, 0, true
            ));

            sExecutor.execute(() -> performUpload(filePath, workerUrl, releaseId, token, fileName, callbackId, totalFiles, currentIndex));
        }

        return START_NOT_STICKY;
    }

    // ─────────────────────────────────────────────────────────────────────────

    private void performUpload(
            String filePath, String workerUrl, String releaseId,
            String token, String fileName, String callbackId,
            int totalFiles, int currentIndex
    ) {
        File file = new File(filePath);
        if (!file.exists()) {
            sendError(callbackId, fileName, "File not found at path: " + filePath);
            finishUpload();
            return;
        }

        HttpURLConnection conn = null;
        try {
            // Build the URL
            String uploadUrl = workerUrl + "/upload";
            URL url = new URL(uploadUrl);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setConnectTimeout(30_000);  // 30s connect timeout
            conn.setReadTimeout(300_000);    // 5 min read timeout for large files

            // Set required headers
            conn.setRequestProperty("x-github-release-id", releaseId);
            conn.setRequestProperty("x-github-filename", fileName);
            conn.setRequestProperty("x-github-token", token);
            conn.setRequestProperty("Content-Type", "application/octet-stream");
            // Enable chunked streaming to avoid OOM on large files
            // NOTE: Do NOT set Content-Length when using chunked mode — they conflict in HTTP/1.1
            conn.setChunkedStreamingMode(64 * 1024); // 64 KB chunks

            long fileSize = file.length();
            long bytesWritten = 0;
            int lastReportedProgress = -1;

            // Stream the file to the server
            try (FileInputStream fis = new FileInputStream(file);
                 OutputStream out = conn.getOutputStream()) {

                byte[] buffer = new byte[64 * 1024]; // 64 KB read buffer
                int read;
                while ((read = fis.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                    bytesWritten += read;

                    // Report progress (only on whole-percent changes to avoid notification spam)
                    int progress = (fileSize > 0) ? (int) ((bytesWritten * 100) / fileSize) : 0;
                    if (progress != lastReportedProgress) {
                        lastReportedProgress = progress;
                        sendProgress(callbackId, fileName, progress);
                        updateNotification(
                                String.format("Uploading %d of %d", currentIndex, totalFiles),
                                fileName, progress, false
                        );
                    }
                }
            }

            int responseCode = conn.getResponseCode();
            if (responseCode == 200 || responseCode == 201) {
                // Read the JSON response to get the URL
                StringBuilder sb = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) sb.append(line);
                }

                // Parse the URL from {"url":"https://..."} — simple manual parse to avoid library dependency
                String responseBody = sb.toString();
                String resultUrl = extractJsonString(responseBody, "url");

                if (resultUrl == null || resultUrl.isEmpty()) {
                    sendError(callbackId, fileName, "Server returned empty URL. Response: " + responseBody);
                } else {
                    sendDone(callbackId, fileName, resultUrl);
                    updateNotification(
                            String.format("Uploaded %d of %d", currentIndex, totalFiles),
                            fileName, 100, false
                    );
                }
            } else {
                // Read error body
                StringBuilder sb = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getErrorStream() != null ? conn.getErrorStream() : conn.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) sb.append(line);
                }
                sendError(callbackId, fileName, "HTTP " + responseCode + ": " + sb.toString());
            }

        } catch (IOException e) {
            Log.e(TAG, "Upload error for " + fileName, e);
            // e.getMessage() can return null for some IOException subtypes (e.g. SocketException)
            // String.valueOf() safely converts null to the string "null" which is more informative
            String errMsg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            sendError(callbackId, fileName, errMsg);
        } finally {
            if (conn != null) conn.disconnect();
            // Delete the temp file after upload
            try {
                new File(filePath).delete();
            } catch (Exception ignored) {}

            finishUpload();
        }
    }

    // ─── Broadcast helpers ────────────────────────────────────────────────────

    private void sendProgress(String callbackId, String fileName, int progress) {
        Intent i = new Intent(BROADCAST_PROGRESS);
        i.setPackage(getPackageName()); // restrict to our own app only
        i.putExtra(EXTRA_CALLBACK_ID, callbackId);
        i.putExtra(EXTRA_FILE_NAME, fileName);
        i.putExtra(EXTRA_PROGRESS, progress);
        sendBroadcast(i);
    }

    private void sendDone(String callbackId, String fileName, String resultUrl) {
        Intent i = new Intent(BROADCAST_DONE);
        i.setPackage(getPackageName()); // restrict to our own app only
        i.putExtra(EXTRA_CALLBACK_ID, callbackId);
        i.putExtra(EXTRA_FILE_NAME, fileName);
        i.putExtra(EXTRA_RESULT_URL, resultUrl);
        sendBroadcast(i);
    }

    private void sendError(String callbackId, String fileName, String errorMsg) {
        Intent i = new Intent(BROADCAST_ERROR);
        i.setPackage(getPackageName()); // restrict to our own app only
        i.putExtra(EXTRA_CALLBACK_ID, callbackId);
        i.putExtra(EXTRA_FILE_NAME, fileName);
        i.putExtra(EXTRA_ERROR_MSG, errorMsg);
        sendBroadcast(i);
    }

    // ─── Lifecycle helpers ────────────────────────────────────────────────────

    private void finishUpload() {
        int remaining;
        synchronized (UploadForegroundService.class) {
            activeUploads--;
            if (activeUploads < 0) activeUploads = 0;
            remaining = activeUploads;
        }
        if (remaining <= 0) {
            // All uploads done — stop the foreground service
            if (notificationManager != null) notificationManager.cancel(NOTIFICATION_ID);
            // stopForeground(boolean) deprecated in API 33 (Android 13+)
            // Use STOP_FOREGROUND_REMOVE int constant on API 33+, boolean on older APIs
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                stopForeground(Service.STOP_FOREGROUND_REMOVE);
            } else {
                //noinspection deprecation
                stopForeground(true);
            }
            stopSelf();
        }
    }

    // ─── Notification helpers ─────────────────────────────────────────────────

    private void createNotificationChannel() {
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Uploads",
                NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Admin panel file uploads");
        channel.setSound(null, null);
        channel.enableVibration(false);
        if (notificationManager != null) {
            notificationManager.createNotificationChannel(channel);
        }
    }

    private Notification buildNotification(String title, String fileName, int progress, boolean indeterminate) {
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0,
                new Intent(this, MainActivity.class),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(fileName)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setSilent(true)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setContentIntent(pendingIntent)
                .setProgress(100, progress, indeterminate);

        return builder.build();
    }

    private void updateNotification(String title, String fileName, int progress, boolean indeterminate) {
        if (notificationManager != null) {
            notificationManager.notify(NOTIFICATION_ID, buildNotification(title, fileName, progress, indeterminate));
        }
    }

    // ─── Simple JSON string extractor (no library dependency) ────────────────

    /**
     * Extracts a string value from a flat JSON object.
     * E.g.: extractJsonString({"url":"https://example.com"}, "url") → "https://example.com"
     */
    private static String extractJsonString(String json, String key) {
        if (json == null || key == null) return null;
        String search = "\"" + key + "\"";
        int keyIndex = json.indexOf(search);
        if (keyIndex < 0) return null;
        int colonIndex = json.indexOf(':', keyIndex + search.length());
        if (colonIndex < 0) return null;
        int quoteStart = json.indexOf('"', colonIndex + 1);
        if (quoteStart < 0) return null;
        int quoteEnd = json.indexOf('"', quoteStart + 1);
        if (quoteEnd < 0) return null;
        return json.substring(quoteStart + 1, quoteEnd);
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null; // Not a bound service
    }
}
