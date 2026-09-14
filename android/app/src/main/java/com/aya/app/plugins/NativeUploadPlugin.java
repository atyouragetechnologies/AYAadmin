package com.aya.app.plugins;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * NativeUploadPlugin
 *
 * A Capacitor plugin that bridges the JS world to the Android UploadForegroundService.
 *
 * JS interface:
 *   NativeUpload.uploadFile({
 *     fileUrl:     string,  // blob:// or file:// URL (from JS File.createObjectURL)
 *     base64Data:  string,  // alternative: raw base64 (no prefix)
 *     mimeType:    string,
 *     workerUrl:   string,
 *     releaseId:   string,
 *     token:       string,
 *     fileName:    string,
 *     totalFiles:  number,
 *     currentIndex:number,
 *   }) → Promise<{ url: string }>
 *
 * Emitted events (via notifyListeners):
 *   "uploadProgress" → { fileName, callbackId, progress }
 *   "uploadDone"     → { fileName, callbackId, url }
 *   "uploadError"    → { fileName, callbackId, error }
 */
@CapacitorPlugin(name = "NativeUpload")
public class NativeUploadPlugin extends Plugin {

    private static final String TAG = "NativeUploadPlugin";

    // Shared thread pool for writing temp files before handing off to the Foreground Service.
    // newCachedThreadPool: reuses idle threads; creates new ones only when all are busy.
    // Prevents unbounded thread creation if many files are queued simultaneously.
    private static final ExecutorService sTempWriteExecutor = Executors.newCachedThreadPool();

    // Map from callbackId → PluginCall, so we can resolve/reject async
    private final Map<String, PluginCall> pendingCalls = new ConcurrentHashMap<>();

    private BroadcastReceiver uploadReceiver;
    private boolean receiverRegistered = false;

    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public void load() {
        super.load();
        registerBroadcastReceiver();
    }

    @Override
    protected void handleOnDestroy() {
        unregisterBroadcastReceiver();
        // Clean up any pending calls to avoid memory leaks if plugin is destroyed
        // while uploads are still in-flight (the Foreground Service continues running,
        // but we can no longer route results back to JS — reject them cleanly).
        for (Map.Entry<String, PluginCall> entry : pendingCalls.entrySet()) {
            try {
                entry.getValue().reject("Upload cancelled: app context was destroyed");
            } catch (Exception ignored) {}
        }
        pendingCalls.clear();
        super.handleOnDestroy();
    }

    // ─── Main plugin method ───────────────────────────────────────────────────

    @PluginMethod
    public void uploadFile(PluginCall call) {
        // Keep call alive — upload may take many seconds in the background
        call.setKeepAlive(true);

        // Required parameters
        final String workerUrl    = call.getString("workerUrl");
        final String releaseId    = call.getString("releaseId");
        final String token        = call.getString("token");
        final String fileName     = call.getString("fileName");
        final String base64Data   = call.getString("base64Data");
        final String mimeType     = call.getString("mimeType", "application/octet-stream");
        final int    totalFiles   = call.getInt("totalFiles", 1);
        final int    currentIndex = call.getInt("currentIndex", 1);

        if (workerUrl == null || releaseId == null || token == null || fileName == null || base64Data == null) {
            call.reject("Missing required parameters: workerUrl, releaseId, token, fileName, base64Data");
            return;
        }

        // Generate a unique ID for this upload so we can match the broadcast back
        final String callbackId = UUID.randomUUID().toString();
        pendingCalls.put(callbackId, call);

        // Write the base64 data to a temp file on a background thread.
        // Use a shared ExecutorService instead of raw Thread to prevent thread explosion
        // when many files are queued simultaneously.
        sTempWriteExecutor.execute(() -> {
            try {
                byte[] bytes = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT);
                File tempFile = new File(getContext().getCacheDir(), "upload_" + callbackId);
                try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                    fos.write(bytes);
                }

                // Start the foreground service
                Intent serviceIntent = new Intent(getContext(), UploadForegroundService.class);
                serviceIntent.setAction(UploadForegroundService.ACTION_UPLOAD);
                serviceIntent.putExtra("filePath",   tempFile.getAbsolutePath());
                serviceIntent.putExtra("workerUrl",  workerUrl);
                serviceIntent.putExtra("releaseId",  releaseId);
                serviceIntent.putExtra("token",      token);
                serviceIntent.putExtra("fileName",   fileName);
                serviceIntent.putExtra(UploadForegroundService.EXTRA_CALLBACK_ID,   callbackId);
                serviceIntent.putExtra(UploadForegroundService.EXTRA_TOTAL_FILES,   totalFiles);
                serviceIntent.putExtra(UploadForegroundService.EXTRA_CURRENT_INDEX, currentIndex);

                // startForegroundService is required on Android 8+ (API 26+)
                getContext().startForegroundService(serviceIntent);

            } catch (Exception e) {
                Log.e(TAG, "Failed to write temp file for upload: " + fileName, e);
                PluginCall pending = pendingCalls.remove(callbackId);
                if (pending != null) {
                    pending.reject("Failed to prepare file for upload: " + e.getMessage());
                }
            }
        });
    }

    // ─── Direct Notification Control for JavaScript Uploads ───────────────────

    @PluginMethod
    public void startProgressNotification(PluginCall call) {
        String title = call.getString("title", "Uploading...");
        String fileName = call.getString("fileName", "");

        Intent serviceIntent = new Intent(getContext(), UploadForegroundService.class);
        serviceIntent.setAction(UploadForegroundService.ACTION_START_PROGRESS);
        serviceIntent.putExtra(UploadForegroundService.EXTRA_TITLE, title);
        serviceIntent.putExtra(UploadForegroundService.EXTRA_FILE_NAME, fileName);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(serviceIntent);
            } else {
                getContext().startService(serviceIntent);
            }
        } catch (Exception e) {
            Log.w(TAG, "startForegroundService failed (background restriction): " + e.getMessage());
        }
        call.resolve();
    }

    @PluginMethod
    public void updateProgressNotification(PluginCall call) {
        String title = call.getString("title", "Uploading...");
        String fileName = call.getString("fileName", "");
        int progress = call.getInt("progress", 0);

        Intent serviceIntent = new Intent(getContext(), UploadForegroundService.class);
        serviceIntent.setAction(UploadForegroundService.ACTION_UPDATE_PROGRESS);
        serviceIntent.putExtra(UploadForegroundService.EXTRA_TITLE, title);
        serviceIntent.putExtra(UploadForegroundService.EXTRA_FILE_NAME, fileName);
        serviceIntent.putExtra(UploadForegroundService.EXTRA_PROGRESS, progress);

        getContext().startService(serviceIntent);
        call.resolve();
    }

    @PluginMethod
    public void stopProgressNotification(PluginCall call) {
        Intent serviceIntent = new Intent(getContext(), UploadForegroundService.class);
        serviceIntent.setAction(UploadForegroundService.ACTION_STOP_PROGRESS);
        getContext().startService(serviceIntent);
        call.resolve();
    }

    // ─── Broadcast receiver to get results from the service ──────────────────

    private void registerBroadcastReceiver() {
        if (receiverRegistered) return;

        uploadReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent == null) return;
                final String action     = intent.getAction();
                final String callbackId = intent.getStringExtra(UploadForegroundService.EXTRA_CALLBACK_ID);
                final String fileName   = intent.getStringExtra(UploadForegroundService.EXTRA_FILE_NAME);

                if (callbackId == null) return;

                if (UploadForegroundService.BROADCAST_PROGRESS.equals(action)) {
                    int progress = intent.getIntExtra(UploadForegroundService.EXTRA_PROGRESS, 0);

                    // Emit a JS event so the UI can update in-app (if user is on screen)
                    JSObject evt = new JSObject();
                    evt.put("callbackId", callbackId);
                    evt.put("fileName",   fileName);
                    evt.put("progress",   progress);
                    notifyListeners("uploadProgress", evt);

                } else if (UploadForegroundService.BROADCAST_DONE.equals(action)) {
                    String resultUrl = intent.getStringExtra(UploadForegroundService.EXTRA_RESULT_URL);

                    // Emit success event
                    JSObject evt = new JSObject();
                    evt.put("callbackId", callbackId);
                    evt.put("fileName",   fileName);
                    evt.put("url",        resultUrl);
                    notifyListeners("uploadDone", evt);

                    // Resolve the pending PluginCall
                    PluginCall pending = pendingCalls.remove(callbackId);
                    if (pending != null) {
                        JSObject ret = new JSObject();
                        ret.put("url", resultUrl);
                        pending.resolve(ret);
                    }

                } else if (UploadForegroundService.BROADCAST_ERROR.equals(action)) {
                    String errorMsg = intent.getStringExtra(UploadForegroundService.EXTRA_ERROR_MSG);

                    // Emit error event
                    JSObject evt = new JSObject();
                    evt.put("callbackId", callbackId);
                    evt.put("fileName",   fileName);
                    evt.put("error",      errorMsg);
                    notifyListeners("uploadError", evt);

                    // Reject the pending PluginCall
                    PluginCall pending = pendingCalls.remove(callbackId);
                    if (pending != null) {
                        pending.reject(errorMsg);
                    }
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction(UploadForegroundService.BROADCAST_PROGRESS);
        filter.addAction(UploadForegroundService.BROADCAST_DONE);
        filter.addAction(UploadForegroundService.BROADCAST_ERROR);

        // On Android 13+ (API 33), we need to specify RECEIVER_NOT_EXPORTED for internal broadcasts
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getContext().registerReceiver(uploadReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            getContext().registerReceiver(uploadReceiver, filter);
        }

        receiverRegistered = true;
    }

    private void unregisterBroadcastReceiver() {
        if (receiverRegistered && uploadReceiver != null) {
            try {
                getContext().unregisterReceiver(uploadReceiver);
            } catch (Exception ignored) {}
            receiverRegistered = false;
        }
    }
}
