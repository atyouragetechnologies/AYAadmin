package com.aya.app.plugins;

import android.app.DownloadManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import com.aya.app.MainActivity;
import com.aya.app.R;

public class DownloadCompleteReceiver extends BroadcastReceiver {

    // Must match the channel created in
    // NativeDownloadPlugin.createNotificationChannel()
    private static final String CHANNEL_ID = "download_channel_silent";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (DownloadManager.ACTION_DOWNLOAD_COMPLETE.equals(intent.getAction())) {
            long downloadId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
            if (downloadId != -1) {
                // R4: ACTION_DOWNLOAD_COMPLETE is a system broadcast fired for ALL
                // DownloadManager downloads on the device — including from other apps.
                // Check against the set of IDs registered by NativeDownloadPlugin so
                // we don't show incorrect notifications for another app's downloads.
                android.content.SharedPreferences prefs = context.getSharedPreferences("cpbs_downloads",
                        Context.MODE_PRIVATE);
                java.util.Set<String> activeIds = prefs.getStringSet("active_ids", new java.util.HashSet<>());
                if (!activeIds.contains(String.valueOf(downloadId))) {
                    return; // Not our download — ignore
                }

                // Remove from SharedPreferences so it doesn't leak memory over time
                java.util.Set<String> newActiveIds = new java.util.HashSet<>(activeIds);
                newActiveIds.remove(String.valueOf(downloadId));
                prefs.edit().putStringSet("active_ids", newActiveIds).apply();

                DownloadManager manager = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
                if (manager != null) {
                    DownloadManager.Query query = new DownloadManager.Query();
                    query.setFilterById(downloadId);
                    Cursor cursor = manager.query(query);
                    try {
                        if (cursor != null && cursor.moveToFirst()) {
                            int statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);
                            int titleIndex = cursor.getColumnIndex(DownloadManager.COLUMN_TITLE);

                            if (statusIndex >= 0) {
                                int status = cursor.getInt(statusIndex);
                                String title = titleIndex >= 0 ? cursor.getString(titleIndex) : "File";

                                NotificationManager notificationManager = (NotificationManager) context
                                        .getSystemService(Context.NOTIFICATION_SERVICE);
                                if (notificationManager != null) {
                                    Intent activityIntent = new Intent(context, MainActivity.class);
                                    int pendingIntentFlags = PendingIntent.FLAG_UPDATE_CURRENT;
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                        pendingIntentFlags |= PendingIntent.FLAG_IMMUTABLE;
                                    }
                                    PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, activityIntent,
                                            pendingIntentFlags);

                                    NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                                            .setSmallIcon(R.mipmap.ic_launcher)
                                            .setLargeIcon(android.graphics.BitmapFactory.decodeResource(context.getResources(), R.mipmap.ic_launcher))
                                            .setContentTitle(title)
                                            .setProgress(0, 0, false)
                                            .setOngoing(false)
                                            .setAutoCancel(true)
                                            .setContentIntent(pendingIntent);

                                    if (status == DownloadManager.STATUS_SUCCESSFUL) {
                                        builder.setContentText("Download complete");
                                        notificationManager.notify((int) downloadId, builder.build());
                                    } else if (status == DownloadManager.STATUS_FAILED) {
                                        builder.setContentText("Download failed");
                                        notificationManager.notify((int) downloadId, builder.build());
                                    }
                                }
                            }
                        }
                    } finally {
                        // Always close cursor to prevent resource leak
                        if (cursor != null)
                            cursor.close();
                    }
                }
            }
        }
    }
}
