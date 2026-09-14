package com.aya.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.SetOptions;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;

public class CustomFirebaseMessagingService extends FirebaseMessagingService {

    private static final String DEFAULT_PUSH_CHANNEL_ID = "push_notifications_v1";
    private static final String SILENT_CHANNEL_ID = "silent_notifications";

    // ── Notification ID counter ────────────────────────────────────────────
    // AtomicInteger ensures unique IDs even when messages arrive in the same
    // millisecond (common with batch sends). Starting at 2000 keeps us safely
    // above reserved IDs: media session (1), BigPicture (1001), upload (9001).
    private static final java.util.concurrent.atomic.AtomicInteger sNotifCounter =
            new java.util.concurrent.atomic.AtomicInteger(2000);

    // ── ANR FIX: Offload image download to a bounded background thread pool ──
    // getBitmapFromURL() is a blocking network call (HttpURLConnection).
    // FCM's onMessageReceived() runs on the FCM delivery thread which has a
    // ~20s deadline on Android. Slow networks (common in India) can exceed
    // this deadline → ANR / app killed by OS with no notification shown.
    // Bounded pool (max 3 threads) prevents OOM on 2 GB devices during bulk
    // FCM sends — each thread holds a 15s HTTP connection + large Bitmap.
    private static final ExecutorService sNotifExecutor =
            new java.util.concurrent.ThreadPoolExecutor(
                    1, 3,
                    60L, java.util.concurrent.TimeUnit.SECONDS,
                    new java.util.concurrent.LinkedBlockingQueue<>(50),
                    new java.util.concurrent.ThreadPoolExecutor.DiscardOldestPolicy());

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        String title = "Prem Bhakti";
        String body = "";
        String imageUrl = null;

        String payloadChannelId = DEFAULT_PUSH_CHANNEL_ID;

        // Notification payload (only delivered when app is in BACKGROUND by default)
        if (remoteMessage.getNotification() != null) {
            title = remoteMessage.getNotification().getTitle() != null ? remoteMessage.getNotification().getTitle() : title;
            body = remoteMessage.getNotification().getBody() != null ? remoteMessage.getNotification().getBody() : body;
            if (remoteMessage.getNotification().getImageUrl() != null) {
                imageUrl = remoteMessage.getNotification().getImageUrl().toString();
            }
            if (remoteMessage.getNotification().getChannelId() != null) {
                payloadChannelId = remoteMessage.getNotification().getChannelId();
            }
        }

        // Data payload (always delivered — both foreground and background)
        Map<String, String> data = remoteMessage.getData();
        if (data.containsKey("image")) imageUrl = data.get("image");
        else if (data.containsKey("imageUrl")) imageUrl = data.get("imageUrl");
        if (data.containsKey("title")) title = data.get("title");
        if (data.containsKey("body")) body = data.get("body");
        if (data.containsKey("channel_id")) payloadChannelId = data.get("channel_id");

        // Check if this is a silent notification (info, darshan, activity updates)
        boolean isSilent = "true".equals(data.get("silent"));

        // Always call our custom builder so notification shows in FOREGROUND too.
        // (When a custom service handles the message, Android won't auto-display it.)
        sendCustomNotification(title, body, imageUrl, data, remoteMessage.getMessageId(), isSilent, payloadChannelId);
    }

    private void sendCustomNotification(String title, String body, String imageUrl, Map<String, String> data, String messageId, boolean isSilent, String payloadChannelId) {
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        // Choose channel based on silent flag
        String channelToUse = isSilent ? SILENT_CHANNEL_ID : payloadChannelId;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Channels are already created in MainApplication.onCreate()
            // Just ensure they exist (idempotent call)
            if (isSilent) {
                NotificationChannel channel = new NotificationChannel(
                        SILENT_CHANNEL_ID,
                        "Updates & Alerts",
                        NotificationManager.IMPORTANCE_DEFAULT
                );
                channel.setSound(null, null);
                channel.enableVibration(false);
                notificationManager.createNotificationChannel(channel);
            } else {
                NotificationChannel channel = new NotificationChannel(
                        channelToUse,
                        "Push Notifications",
                        NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Admin-sent push notifications");
                notificationManager.createNotificationChannel(channel);
            }
        }

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        // IMPORTANT: Pass data payload to intent so Capacitor can handle notification tap actions
        for (Map.Entry<String, String> entry : data.entrySet()) {
            intent.putExtra(entry.getKey(), entry.getValue());
        }
        
        // VERY IMPORTANT: Capacitor PushNotifications plugin checks for this key to trigger Action Performed event!
        if (messageId != null) {
            intent.putExtra("google.message_id", messageId);
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(this, (int) System.currentTimeMillis() /* Request code */, intent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_ONE_SHOT);

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this, channelToUse)
                        .setSmallIcon(getApplicationInfo().icon)
                        .setContentTitle(title)
                        .setContentText(body)
                        .setAutoCancel(true)
                        .setContentIntent(pendingIntent)
                        .setPriority(isSilent ? NotificationCompat.PRIORITY_DEFAULT : NotificationCompat.PRIORITY_HIGH);

        // System default sound will be used because of channel priority
        // Unique notification ID from monotonic counter — avoids collisions on
        // back-to-back messages and prevents accidental overwrite of media/upload
        // notifications whose IDs overlap with time-based values.
        final int notificationId = sNotifCounter.getAndIncrement();

        if (imageUrl != null && !imageUrl.isEmpty()) {
            // ── ANR FIX: Download image on background thread ─────────────────────
            // getBitmapFromURL() blocks for up to 15s. Running it on the FCM
            // delivery thread risks exceeding Android's ~20s onMessageReceived
            // deadline, causing the app to be ANR-killed with no notification shown.
            //
            // Strategy:
            //   1. Show the text-only notification immediately (instant, no ANR risk)
            //   2. Download the image in the background
            //   3. Update (re-notify) with the rich BigPicture notification once ready
            //
            // This guarantees the user ALWAYS sees the notification, even on slow networks.
            notificationManager.notify(notificationId, notificationBuilder.build()); // show text-only first

            final String finalTitle = title;
            final String finalImageUrl = imageUrl;
            final NotificationCompat.Builder finalBuilder = notificationBuilder;

            sNotifExecutor.execute(() -> {
                Bitmap bitmap = getBitmapFromURL(finalImageUrl);
                if (bitmap != null) {
                    try {
                        // Resize if too large to avoid TransactionTooLargeException
                        int maxDim = 1024;
                        if (bitmap.getWidth() > maxDim || bitmap.getHeight() > maxDim) {
                            float scale = Math.min((float) maxDim / bitmap.getWidth(), (float) maxDim / bitmap.getHeight());
                            bitmap = Bitmap.createScaledBitmap(bitmap, Math.round(bitmap.getWidth() * scale), Math.round(bitmap.getHeight() * scale), true);
                        }

                        // IMPORTANT FOR SMOOTH DRAG ANIMATION:
                        // We create a square-cropped thumbnail for the collapsed view.
                        // When the user drags down, Android smoothly morphs this square into the full rectangular image.
                        int minDim = Math.min(bitmap.getWidth(), bitmap.getHeight());
                        int cropX = (bitmap.getWidth() - minDim) / 2;
                        int cropY = (bitmap.getHeight() - minDim) / 2;
                        Bitmap squareCrop = Bitmap.createBitmap(bitmap, cropX, cropY, minDim, minDim);
                        Bitmap thumbBitmap = Bitmap.createScaledBitmap(squareCrop, 256, 256, true);
                        squareCrop.recycle(); // free intermediate bitmap immediately

                        finalBuilder.setLargeIcon(thumbBitmap)
                                .setStyle(new NotificationCompat.BigPictureStyle()
                                        .bigPicture(bitmap)
                                        .bigLargeIcon((Bitmap) null)); // null triggers the shared-element expansion

                        // Update the same notification ID to upgrade it from text-only → rich
                        notificationManager.notify(notificationId, finalBuilder.build());
                    } catch (Exception e) {
                        android.util.Log.e("FCM", "Error processing notification bitmap", e);
                        FirebaseCrashlytics.getInstance().recordException(e);
                        // Fallback already shown (text-only notification above) — nothing more to do
                    }
                }
                // If bitmap is null (download failed), text-only notification is already visible — no action needed
            });
        } else {
            // No image — show text-only notification immediately
            notificationManager.notify(notificationId, notificationBuilder.build());
        }
    }

    private Bitmap getBitmapFromURL(String src) {
        HttpURLConnection connection = null;
        InputStream input = null;
        try {
            java.net.URL url = java.net.URI.create(src).toURL();
            connection = (HttpURLConnection) url.openConnection();
            connection.setDoInput(true);
            connection.setConnectTimeout(15000);
            connection.setReadTimeout(15000);
            connection.connect();
            input = connection.getInputStream();
            return BitmapFactory.decodeStream(input);
        } catch (Exception e) {
            android.util.Log.e("FCM", "getBitmapFromURL failed: " + e.getMessage());
            return null;
        } finally {
            // Always close stream and disconnect to prevent connection pool exhaustion
            try { if (input != null) input.close(); } catch (Exception ignored) {}
            if (connection != null) connection.disconnect();
        }
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        // Token can change after: app reinstall, Firebase project change, or periodic rotation.
        // IMPORTANT: Must save to "fcm_tokens/android" — the same path the JS side writes to
        // and the admin panel reads from. Old path was "app_config/fcm_tokens" (wrong).
        try {
            Map<String, Object> data = new HashMap<>();
            data.put(token.substring(Math.max(0, token.length() - 20)), token);
            data.put("updatedAt", System.currentTimeMillis());
            FirebaseFirestore.getInstance()
                    .collection("fcm_tokens")
                    .document("android")          // matches JS: doc(db, "fcm_tokens", "android")
                    .set(data, SetOptions.merge())
                    .addOnFailureListener(e ->
                        android.util.Log.w("FCM", "Token save failed — will auto-retry when network is available", e)
                    );
        } catch (Exception e) {
            android.util.Log.e("FCM", "Failed to save refreshed token", e);
        }
    }
}
