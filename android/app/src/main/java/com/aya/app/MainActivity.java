package com.aya.app;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.aya.app.plugins.BigPictureNotificationPlugin;
import com.aya.app.plugins.NativeDownloadPlugin;
import com.aya.app.plugins.NativeUploadPlugin;

import androidx.core.view.WindowCompat;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BigPictureNotificationPlugin.class);
        registerPlugin(NativeDownloadPlugin.class);
        registerPlugin(NativeUploadPlugin.class);
        super.onCreate(savedInstanceState);
        
        // Enable edge-to-edge display (draw behind system navigation and status bars)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // Handle notification if app was opened from one (fresh start)
        Intent intent = getIntent();
        if (intent != null) {
            if ((intent.getFlags() & Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY) != 0) {
                clearNotificationExtras(intent);
                setIntent(intent);
            } else {
                BigPictureNotificationPlugin.handleIntent(intent);
                scheduleNotificationExtrasCleanup();
            }
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        if (intent != null && (intent.getFlags() & Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY) != 0) {
            clearNotificationExtras(intent);
            setIntent(intent);
            return;
        }
        setIntent(intent);

        // Handle notification if app was already running in background
        BigPictureNotificationPlugin.handleIntent(intent);
        scheduleNotificationExtrasCleanup();
    }

    private void clearNotificationExtras(Intent intent) {
        if (intent == null) return;
        String[] keysToClear = {
            "google.message_id",
            "google.sent_time",
            "google.ttl",
            "google.original_priority",
            "google.delivered_priority",
            "from",
            "gcm.notification.data",
            "gcm.n.e",
            "gcm.notification.title",
            "gcm.notification.body",
            "collapse_key",
            "action_type",
            "target_screen",
            "target_link",
            "type",
            "screen",
            "link"
        };
        for (String key : keysToClear) {
            intent.removeExtra(key);
        }
        android.util.Log.i(TAG, "Stale notification extras cleared from Intent.");
    }

    private void scheduleNotificationExtrasCleanup() {
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
            if (isFinishing() || isDestroyed()) return;
            Intent currentIntent = getIntent();
            if (currentIntent != null) {
                clearNotificationExtras(currentIntent);
                setIntent(currentIntent);
            }
        }, 3000);
    }
}
