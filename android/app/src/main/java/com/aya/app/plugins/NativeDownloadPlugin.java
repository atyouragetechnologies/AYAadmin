package com.aya.app.plugins;

import android.app.DownloadManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;

import androidx.core.app.NotificationCompat;
import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.aya.app.MainActivity;
import com.aya.app.R;

import java.io.File;
import java.util.List;
import android.content.ContentResolver;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.provider.MediaStore;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(name = "NativeDownload")
public class NativeDownloadPlugin extends Plugin {

    private static final String CHANNEL_ID = "download_channel_silent";

    // Shared thread pool for all downloads — avoids creating unbounded OS threads
    // when the user starts multiple downloads concurrently.
    // newCachedThreadPool: reuses idle threads; creates new ones only when needed.
    private static final ExecutorService sDownloadExecutor = Executors.newCachedThreadPool();

    private void createNotificationChannel(NotificationManager manager) {
        // minSdkVersion = 26 = O → NotificationChannel always available, no SDK guard
        // needed.
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Downloads",
                NotificationManager.IMPORTANCE_LOW);
        channel.setDescription("File downloads");
        channel.setSound(null, null);
        channel.enableVibration(false);
        if (manager != null) {
            manager.createNotificationChannel(channel);
        }
    }

    @PluginMethod
    public void downloadToPublicFolder(PluginCall call) {
        String url = call.getString("url");
        String filename = call.getString("filename");
        String subpath = call.getString("subpath"); // e.g., "Prem Bhakti/Audios"
        String directory = call.getString("directory", "DOWNLOADS"); // "DOWNLOADS", "PICTURES", or "MUSIC"

        if (url == null || filename == null || subpath == null) {
            call.reject("Must provide url, filename, and subpath");
            return;
        }

        try {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle(filename);
            request.setDescription("Downloading " + filename);
            // Spoof user agent to prevent Cloudflare/WAF from blocking
            // AndroidDownloadManager with 403 Forbidden
            request.addRequestHeader("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36");

            // Hide the system's default download notification so we can show our own custom one with the app icon
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_HIDDEN);

            // Set destination in standard public Downloads or Pictures directory
            String envDir = Environment.DIRECTORY_DOWNLOADS;
            if ("PICTURES".equalsIgnoreCase(directory)) {
                envDir = Environment.DIRECTORY_PICTURES;
            } else if ("MUSIC".equalsIgnoreCase(directory)) {
                envDir = Environment.DIRECTORY_MUSIC;
            }
            request.setDestinationInExternalPublicDir(envDir, subpath + "/" + filename);

            DownloadManager manager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);

            if (manager != null) {
                final long downloadId = manager.enqueue(request);

                // Save ID for DownloadCompleteReceiver so it can show the completion notification even if the app is closed
                android.content.SharedPreferences prefs = getContext().getSharedPreferences("cpbs_downloads", Context.MODE_PRIVATE);
                java.util.Set<String> activeIds = prefs.getStringSet("active_ids", new java.util.HashSet<>());
                java.util.Set<String> newActiveIds = new java.util.HashSet<>(activeIds);
                newActiveIds.add(String.valueOf(downloadId));
                prefs.edit().putStringSet("active_ids", newActiveIds).apply();

                // Keep the PluginCall alive across the background thread.
                call.setKeepAlive(true);

                // AtomicBoolean allows the polling loop to be safely cancelled
                final AtomicBoolean isDownloading = new AtomicBoolean(true);

                // Submit to shared thread pool — avoids creating a raw OS thread per download.
                sDownloadExecutor.execute(() -> {
                    boolean success = false;
                    
                    NotificationManager notificationManager = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
                    NotificationCompat.Builder builder = new NotificationCompat.Builder(getContext(), CHANNEL_ID)
                            .setSmallIcon(R.mipmap.ic_launcher)
                            .setLargeIcon(android.graphics.BitmapFactory.decodeResource(getContext().getResources(), R.mipmap.ic_launcher))
                            .setContentTitle(filename)
                            .setContentText("Downloading...")
                            .setOngoing(true)
                            .setOnlyAlertOnce(true)
                            .setProgress(100, 0, true);

                    if (notificationManager != null) {
                        notificationManager.notify((int) downloadId, builder.build());
                    }

                    while (isDownloading.get()) {
                        DownloadManager.Query q = new DownloadManager.Query();
                        q.setFilterById(downloadId);
                        Cursor cursor = manager.query(q);
                        try {
                            if (cursor != null && cursor.moveToFirst()) {
                                int statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);
                                if (statusIndex >= 0) {
                                    int status = cursor.getInt(statusIndex);

                                    int downloadedIndex = cursor
                                            .getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR);
                                    int totalIndex = cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES);

                                    if (downloadedIndex >= 0 && totalIndex >= 0) {
                                        long bytesDownloaded = cursor.getLong(downloadedIndex);
                                        long bytesTotal = cursor.getLong(totalIndex);
                                        if (bytesTotal > 0) {
                                            JSObject progress = new JSObject();
                                            progress.put("downloadId", downloadId);
                                            progress.put("bytesDownloaded", bytesDownloaded);
                                            progress.put("bytesTotal", bytesTotal);
                                            notifyListeners("onDownloadProgress", progress);
                                            
                                            if (notificationManager != null) {
                                                builder.setProgress(100, (int) (bytesDownloaded * 100 / bytesTotal), false);
                                                notificationManager.notify((int) downloadId, builder.build());
                                            }
                                        }
                                    }

                                    if (status == DownloadManager.STATUS_SUCCESSFUL) {
                                        isDownloading.set(false);
                                        success = true;
                                    } else if (status == DownloadManager.STATUS_FAILED) {
                                        isDownloading.set(false);
                                    }
                                }
                            } else {
                                isDownloading.set(false);
                            }
                        } finally {
                            if (cursor != null)
                                cursor.close();
                        }

                        if (isDownloading.get()) {
                            try {
                                Thread.sleep(500);
                            } catch (InterruptedException e) {
                                // Thread was interrupted (e.g. plugin destroyed) — exit cleanly.
                                Thread.currentThread().interrupt();
                                isDownloading.set(false);
                            }
                        }
                    }

                    if (success) {
                        JSObject ret = new JSObject();
                        ret.put("downloadId", downloadId);
                        // Return the correct root directory for each storage type
                        String rootDir = "PICTURES".equalsIgnoreCase(directory) ? "Pictures"
                                : "MUSIC".equalsIgnoreCase(directory) ? "Music"
                                        : "Download";
                        ret.put("path", rootDir + "/" + subpath + "/" + filename);
                        call.resolve(ret);
                    } else {
                        call.reject("Download failed");
                    }
                });

            } else {
                call.reject("DownloadManager service not available");
            }
        } catch (Exception e) {
            call.reject("Error queueing download: " + e.getMessage());
        }
    }

    /**
     * Opens a PDF file from the public Downloads folder using the system app
     * chooser.
     * Call from JS: NativeDownload.openPdf({ subpath: 'Prem Bhakti/Books',
     * filename: 'MyBook_17123.pdf' })
     */
    @PluginMethod
    public void openPdf(PluginCall call) {
        String subpath = call.getString("subpath"); // e.g. "Prem Bhakti/Books"
        String filename = call.getString("filename"); // e.g. "Title_12345.pdf"

        if (subpath == null || filename == null) {
            call.reject("Must provide subpath and filename");
            return;
        }

        try {
            // Resolve the file in public Downloads
            File downloadsRoot = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            File pdfFile = new File(downloadsRoot, subpath + "/" + filename);

            if (!pdfFile.exists()) {
                call.reject("File not found: " + pdfFile.getAbsolutePath());
                return;
            }

            // Build a content:// URI via FileProvider so other apps can read the file
            Uri contentUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    pdfFile);

            // Fire ACTION_VIEW chooser
            Intent viewIntent = new Intent(Intent.ACTION_VIEW);
            viewIntent.setDataAndType(contentUri, "application/pdf");
            viewIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            viewIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            // Grant permissions to all matching activities explicitly
            PackageManager pm = getContext().getPackageManager();
            List<ResolveInfo> resInfoList = pm.queryIntentActivities(viewIntent, PackageManager.MATCH_DEFAULT_ONLY);
            for (ResolveInfo resolveInfo : resInfoList) {
                String packageName = resolveInfo.activityInfo.packageName;
                getContext().grantUriPermission(packageName, contentUri, Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            }

            Intent chooser = Intent.createChooser(viewIntent, "Open PDF with…");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            // Guard: if no PDF reader is installed, startActivity throws
            // ActivityNotFoundException
            // which crashes the app. Check first before launching.
            if (viewIntent.resolveActivity(getContext().getPackageManager()) != null) {
                getContext().startActivity(chooser);
                call.resolve();
            } else {
                call.reject("No PDF reader app installed. Please install a PDF viewer from Play Store.");
            }

        } catch (Exception e) {
            call.reject("Error opening PDF: " + e.getMessage());
        }
    }

    /**
     * Opens a specific folder in the system file manager.
     * Call from JS: NativeDownload.openFolder({ subpath: 'Prem Bhakti/Audios' })
     */
    @PluginMethod
    public void openFolder(PluginCall call) {
        String subpath = call.getString("subpath");
        String directory = call.getString("directory", "DOWNLOADS"); // "DOWNLOADS", "PICTURES", or "MUSIC"

        if (subpath == null) {
            call.reject("Must provide subpath");
            return;
        }

        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);

            String rootDir = "Download";
            if ("PICTURES".equalsIgnoreCase(directory)) {
                rootDir = "Pictures";
            } else if ("MUSIC".equalsIgnoreCase(directory)) {
                rootDir = "Music";
            }

            String documentId = "primary:" + rootDir + "/" + subpath;
            Uri contentUri = android.provider.DocumentsContract
                    .buildDocumentUri("com.android.externalstorage.documents", documentId);

            intent.setDataAndType(contentUri, "vnd.android.document/directory");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            try {
                getContext().startActivity(intent);
                call.resolve();
            } catch (Exception ex) {
                // Fallback to general Downloads folder if specific folder opening fails
                try {
                    Intent fallback = new Intent(DownloadManager.ACTION_VIEW_DOWNLOADS);
                    fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(fallback);
                    call.resolve();
                } catch (Exception fallbackEx) {
                    // Ultimate fallback: ACTION_GET_CONTENT
                    Intent ultimateFallback = new Intent(Intent.ACTION_GET_CONTENT);
                    ultimateFallback.setType("*/*");
                    ultimateFallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(ultimateFallback);
                    call.resolve();
                }
            }
        } catch (Exception e) {
            call.reject("Error opening folder: " + e.getMessage());
        }
    }

    /**
     * Opens a URL strictly in the external system browser (not Custom Tabs).
     * This is ideal for file downloads so they process in the background.
     * Call from JS: NativeDownload.openExternalUrl({ url: 'https://...' })
     */
    @PluginMethod
    public void openExternalUrl(PluginCall call) {
        String urlString = call.getString("url");
        if (urlString == null) {
            call.reject("Must provide url");
            return;
        }

        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse(urlString));
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            try {
                getContext().startActivity(intent);
            } catch (Exception ex) {
                // Fallback to an intent chooser if no default browser is set or intent fails
                Intent chooser = Intent.createChooser(intent, "Open with...");
                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(chooser);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Error opening external URL: " + e.getMessage());
        }
    }

    /**
     * Deletes a file from the public Downloads folder AND removes its MediaStore entry.
     * This prevents DownloadManager from appending (1) to subsequent downloads.
     */
    @PluginMethod
    public void deleteFile(PluginCall call) {
        String subpath = call.getString("subpath");
        String filename = call.getString("filename");
        String directory = call.getString("directory", "DOWNLOADS");

        if (subpath == null || filename == null) {
            call.reject("Must provide subpath and filename");
            return;
        }

        try {
            String envDir = Environment.DIRECTORY_DOWNLOADS;
            if ("PICTURES".equalsIgnoreCase(directory)) {
                envDir = Environment.DIRECTORY_PICTURES;
            } else if ("MUSIC".equalsIgnoreCase(directory)) {
                envDir = Environment.DIRECTORY_MUSIC;
            }
            File rootDir = Environment.getExternalStoragePublicDirectory(envDir);
            File file = new File(rootDir, subpath + "/" + filename);

            if (file.exists()) {
                file.delete();
            }

            // Also delete from MediaStore to clear zombie records
            ContentResolver resolver = getContext().getContentResolver();
            Uri uri = MediaStore.Files.getContentUri("external");
            String selection = MediaStore.MediaColumns.DATA + "=?";
            String[] selectionArgs = new String[]{file.getAbsolutePath()};
            resolver.delete(uri, selection, selectionArgs);

            call.resolve();
        } catch (Exception e) {
            call.reject("Error deleting file: " + e.getMessage());
        }
    }
}