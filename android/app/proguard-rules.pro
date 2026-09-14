# ─── Capacitor Core ──────────────────────────────────────────────────────────
# Plugin classes are referenced by name from JavaScript at runtime.
# If R8 renames/removes them, JS bridge calls will crash silently.
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep class * extends com.getcapacitor.Plugin { *; }

# ─── App Package ─────────────────────────────────────────────────────────────
-keep class com.aya.app.** { *; }

# ─── WebView JavaScript Interface ────────────────────────────────────────────
# JS can call @JavascriptInterface methods by name — must not be renamed/removed
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ─── AndroidX / AppCompat ────────────────────────────────────────────────────
-keep class androidx.** { *; }
-dontwarn androidx.**

# ─── Capacitor Community Plugins ─────────────────────────────────────────────
# @capacitor/local-notifications, @capacitor/share, @capacitor/network, etc.
-keep class com.capacitorjs.** { *; }
-keep class com.capgo.** { *; }

# ─── Crash Symbolication ─────────────────────────────────────────────────────
# Preserve line numbers in crash stack traces so you can debug from logcat/Crashlytics
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ─── Suppress Common Third-Party Warnings ────────────────────────────────────
-dontwarn org.bouncycastle.**
-dontwarn org.conscrypt.**
-dontwarn org.openjsse.**
-dontwarn kotlin.**
-dontwarn kotlinx.**

