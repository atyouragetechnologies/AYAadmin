package com.aya.app.plugins;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "BigPictureNotification")
public class BigPictureNotificationPlugin extends Plugin {

    // Shared thread pool — matches the pattern used in NativeDownloadPlugin.
    // Raw new Thread() is unmanaged: rapid notification triggers create N OS threads
    // each potentially holding 20s HTTP connections + large Bitmap allocations = OOM.
    private static final ExecutorService sNotifExecutor = Executors.newCachedThreadPool();

    // Single source of truth — defined in MainApplication to ensure
    // the channel is always pre-registered before any notification arrives.
    private static final String CHANNEL_ID = "push_notifications_v1";
    private static final int NOTIFICATION_ID = 1001;
    private static final String EXTRA_ACTION = "notification_action";
    private static final String EXTRA_SCREEN = "notification_screen";
    private static final String EXTRA_LINK = "notification_link";
    private static final String TAG = "BigPictureNotificationPlugin";
    private static final int MAX_REDIRECTS = 5;
    private static BigPictureNotificationPlugin instance;
    private static JSObject pendingAction;

    @Override
    public void load() {
        super.load();
        instance = this;
        // Check if there was a pending action before plugin loaded
        if (pendingAction != null) {
            flushPendingAction();
        }
    }

    @SuppressWarnings("deprecation")
    @PluginMethod
    public void show(PluginCall call) {
        String title = call.getString("title", "नित्य वाणी");
        String body = call.getString("body", "आज का विचार");
        String imageUrl = call.getString("imageUrl");
        String cachedPath = call.getString("cachedPath", null);

        if (imageUrl == null || imageUrl.isEmpty()) {
            call.reject("Image URL is required");
            return;
        }

        // Keep the call alive while the image is downloading in the background thread.
        // Without this, Capacitor can GC the call before resolve/reject is called.
        call.setKeepAlive(true);

        // Submit to shared thread pool instead of raw new Thread() to cap concurrent
        // allocations and prevent OOM on low-memory (2 GB) devices.
        sNotifExecutor.execute(() -> {
            try {
                Bitmap bitmap = null;
                if (cachedPath != null && !cachedPath.isEmpty()) {
                    String loadPath = cachedPath;
                    if (loadPath.startsWith("file://")) {
                        loadPath = loadPath.substring(7);
                    } else if (loadPath.startsWith("file:")) {
                        loadPath = loadPath.substring(5);
                    }
                    
                    try {
                        java.io.File file = new java.io.File(loadPath);
                        if (file.exists()) {
                            Log.d(TAG, "Loading from cache: " + loadPath);
                            bitmap = android.graphics.BitmapFactory.decodeFile(loadPath);
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Cache error", e);
                    }
                }
                
                if (bitmap == null) {
                    Log.d(TAG, "Loading from URL: " + imageUrl);
                    bitmap = getBitmapFromURL(imageUrl);
                }

                if (bitmap == null) {
                    Log.e(TAG, "Failed to load image");
                    call.reject("Failed to load image");
                    return;
                }

                Context context = getContext();
                NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    // Channel already registered in MainApplication.onCreate().
                    // Re-creating is a no-op on Android — safe to leave for
                    // belt-and-suspenders safety in case this runs before Application init.
                    NotificationChannel channel = new NotificationChannel(
                            CHANNEL_ID,
                            "Daily Quote",
                            NotificationManager.IMPORTANCE_HIGH
                    );
                    notificationManager.createNotificationChannel(channel);
                }

                Intent intent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
                // Fallback: getLaunchIntentForPackage can return null on some heavily
                // customized OEM ROMs or if app is disabled. Use explicit intent as safety net.
                if (intent == null) {
                    intent = new Intent(context, com.aya.app.MainActivity.class);
                }
                if (intent != null) {
                    intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    
                    String actionType = call.getString("action_type");
                    String targetScreen = call.getString("target_screen");
                    String targetLink = call.getString("target_link");
                    
                    // Fallback to "open_quotes" if it's the daily quote
                    if (actionType == null && "quote".equals(call.getString("type"))) {
                        actionType = "open_quotes";
                    } else if ("screen".equals(actionType)) {
                        actionType = "open_screen";
                    } else if ("link".equals(actionType)) {
                        actionType = "open_link";
                    }

                    applyNotificationExtras(intent, actionType, targetScreen, targetLink);
                }
                PendingIntent pendingIntent = PendingIntent.getActivity(
                        context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                int iconResId = context.getApplicationInfo().icon;
                if (iconResId == 0) iconResId = android.R.drawable.ic_dialog_info;

                NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                        .setSmallIcon(iconResId)
                        .setContentTitle(title)
                        .setContentText(body)
                        .setContentIntent(pendingIntent)
                        .setAutoCancel(true)
                        .setPriority(NotificationCompat.PRIORITY_HIGH);
                if (bitmap != null) {
                    int maxBigPicWidth = 1024;
                    int maxBigPicHeight = 1024;
                    if (bitmap.getWidth() > maxBigPicWidth || bitmap.getHeight() > maxBigPicHeight) {
                        float bpRatio = Math.min((float) maxBigPicWidth / bitmap.getWidth(), (float) maxBigPicHeight / bitmap.getHeight());
                        int bpWidth = Math.round(bpRatio * bitmap.getWidth());
                        int bpHeight = Math.round(bpRatio * bitmap.getHeight());
                        if (bpWidth > 0 && bpHeight > 0) {
                            bitmap = Bitmap.createScaledBitmap(bitmap, bpWidth, bpHeight, true);
                        }
                    }

                    NotificationCompat.BigPictureStyle style = new NotificationCompat.BigPictureStyle()
                            .bigPicture(bitmap)
                            .setBigContentTitle(title)
                            .setSummaryText(body);

                    builder.setStyle(style);

                    // Large icon for collapsed state (Square crop for perfectly smooth drag-to-expand animation)
                    int minDim = Math.min(bitmap.getWidth(), bitmap.getHeight());
                    int cropX = (bitmap.getWidth() - minDim) / 2;
                    int cropY = (bitmap.getHeight() - minDim) / 2;
                    Bitmap squareCrop = Bitmap.createBitmap(bitmap, cropX, cropY, minDim, minDim);
                    Bitmap largeIcon = Bitmap.createScaledBitmap(squareCrop, 256, 256, true);

                    builder.setLargeIcon(largeIcon);
                    style.bigLargeIcon((Bitmap) null);
                }

                notificationManager.notify(NOTIFICATION_ID, builder.build());
                call.resolve();

            } catch (Exception e) {
                Log.e(TAG, "Error showing notification", e);
                call.reject("Error showing notification", e);
            }
        });
    }



    @PluginMethod
    public void consumeLaunchAction(PluginCall call) {
        if (pendingAction != null) {
            JSObject ret = pendingAction;
            pendingAction = null;
            clearIntentExtras();
            call.resolve(ret);
            return;
        }

        Intent intent = getActivity() != null ? getActivity().getIntent() : null;
        JSObject ret = extractAction(intent, true);
        if (ret != null && getActivity() != null && intent != null) {
            getActivity().setIntent(intent);
        }
        call.resolve(ret != null ? ret : new JSObject());
    }

    /**
     * Downloads the image at {@code src} and decodes it to a Bitmap,
     * applying inSampleSize downsampling to cap memory usage.
     *
     * WHY TWO-PASS:
     *  A 4 MB JPEG can decode to 20+ MB in RAM. On a 2 GB device, showing
     *  multiple notifications = OOM. We buffer the raw bytes first, then:
     *   Pass 1: inJustDecodeBounds=true — reads dimensions without allocating pixels
     *   Pass 2: inSampleSize=N — decodes at 1/N resolution (powers of 2 only)
     *  Target: 1024 × 1024 px max — more than enough for a BigPicture notification.
     */
    private Bitmap getBitmapFromURL(String src) {
        HttpURLConnection connection = null;
        InputStream input = null;
        try {
            String currentUrl = src;
            int redirects = 0;
            while (redirects < MAX_REDIRECTS) {
                URL url = URI.create(currentUrl).toURL();
                connection = (HttpURLConnection) url.openConnection();
                connection.setConnectTimeout(20000);
                connection.setReadTimeout(20000);
                connection.setInstanceFollowRedirects(true);
                connection.setRequestProperty("User-Agent", "Mozilla/5.0");

                int status = connection.getResponseCode();
                if (status == HttpURLConnection.HTTP_MOVED_TEMP ||
                    status == HttpURLConnection.HTTP_MOVED_PERM ||
                    status == HttpURLConnection.HTTP_SEE_OTHER ||
                    status == 307 || status == 308) {
                    currentUrl = connection.getHeaderField("Location");
                    redirects++;
                    connection.disconnect();
                    continue;
                }

                if (status == HttpURLConnection.HTTP_OK) {
                    // Buffer the entire response so we can do two BitmapFactory passes.
                    input = new BufferedInputStream(connection.getInputStream());
                    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                    byte[] chunk = new byte[8192];
                    int n;
                    while ((n = input.read(chunk)) != -1) buffer.write(chunk, 0, n);
                    byte[] imageBytes = buffer.toByteArray();

                    // Pass 1: read dimensions only (no pixel allocation)
                    BitmapFactory.Options opts = new BitmapFactory.Options();
                    opts.inJustDecodeBounds = true;
                    BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length, opts);

                    // Pass 2: decode at reduced resolution
                    opts.inSampleSize = calculateInSampleSize(opts, 1024, 1024);
                    opts.inJustDecodeBounds = false;
                    return BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length, opts);
                } else {
                    return null;
                }
            }
            return null;
        } catch (Exception e) {
            return null;
        } finally {
            try {
                if (input != null) input.close();
                if (connection != null) connection.disconnect();
            } catch (Exception ignored) {}
        }
    }

    /**
     * Calculates the largest power-of-2 inSampleSize such that the decoded
     * bitmap dimensions are ≥ reqWidth × reqHeight.
     * Powers of 2 are required by Android's BitmapFactory for correct behaviour.
     */
    private static int calculateInSampleSize(BitmapFactory.Options opts, int reqWidth, int reqHeight) {
        final int rawHeight = opts.outHeight;
        final int rawWidth  = opts.outWidth;
        int inSampleSize = 1;
        if (rawHeight > reqHeight || rawWidth > reqWidth) {
            final int halfH = rawHeight / 2;
            final int halfW = rawWidth  / 2;
            // Double inSampleSize until the result would drop below our target size
            while ((halfH / inSampleSize) >= reqHeight
                    && (halfW / inSampleSize) >= reqWidth) {
                inSampleSize *= 2;
            }
        }
        return inSampleSize;
    }

    static void applyNotificationExtras(Intent intent, String action, String screen, String link) {
        if (intent == null) return;
        if (action != null) intent.putExtra(EXTRA_ACTION, action);
        if (screen != null) intent.putExtra(EXTRA_SCREEN, screen);
        if (link != null) intent.putExtra(EXTRA_LINK, link);
    }

    public static void handleIntent(Intent intent) {
        JSObject actionData = extractAction(intent, true);
        if (actionData == null) return;

        if (instance != null) {
            instance.pendingAction = actionData;
            instance.flushPendingAction();
        } else {
            // Plugin not yet initialized, store it globally
            pendingAction = actionData;
        }
    }

    private void flushPendingAction() {
        if (pendingAction == null) return;
        notifyListeners("notificationActionPerformed", pendingAction);
        pendingAction = null;
        clearIntentExtras();
    }

    private void clearIntentExtras() {
        if (getActivity() == null) return;
        Intent intent = getActivity().getIntent();
        if (intent == null) return;
        String[] keysToClear = {
            EXTRA_ACTION, EXTRA_SCREEN, EXTRA_LINK,
            "google.message_id", "google.sent_time", "google.ttl",
            "google.original_priority", "google.delivered_priority", "from",
            "gcm.notification.data", "gcm.n.e", "gcm.notification.title",
            "gcm.notification.body", "collapse_key", "action_type",
            "target_screen", "target_link", "target_mandal", "target_date",
            "target_info_id", "type", "screen", "link", "bhajanId",
            "lectureId", "videoFolder", "videoId"
        };
        for (String key : keysToClear) {
            intent.removeExtra(key);
        }
        getActivity().setIntent(intent);
    }

    private static JSObject extractAction(Intent intent, boolean clearExtras) {
        if (intent == null) return null;
        String action = intent.getStringExtra(EXTRA_ACTION);
        String screen = intent.getStringExtra(EXTRA_SCREEN);
        String link = intent.getStringExtra(EXTRA_LINK);
        if (action == null) return null;
        JSObject ret = new JSObject();
        ret.put("action", action);
        if (screen != null) ret.put("screen", screen);
        if (link != null) ret.put("link", link);
        if (clearExtras) {
            intent.removeExtra(EXTRA_ACTION);
            intent.removeExtra(EXTRA_SCREEN);
            intent.removeExtra(EXTRA_LINK);
        }
        return ret;
    }
}
