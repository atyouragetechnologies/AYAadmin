import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aya.app',
  appName: 'AYA',
  // Points to the React app's built output.
  // The APK bundles this code locally — Capgo OTA replaces it on update.
  webDir: 'app/dist',
  bundledWebRuntime: false,
  loggingBehavior: 'none',
  server: {
    androidScheme: 'https',
    allowNavigation: ['atyourage.app', '*.atyourage.app'],
    errorPath: 'error.html',
  },
  android: {
    backgroundColor: '#000000',
    appendUserAgent: 'AyalandApp/1.0 Android',
    minWebViewVersion: 60,
    keyboardResize: "body" as const,
  },
  plugins: {
    CapacitorUpdater: {
      appId: 'com.aya.app',
      autoUpdate: false,         // We manage OTA manually via useOtaUpdater hook
      resetWhenUpdate: false,
      directUpdate: false,
      autoDeletePrevious: true,
      autoDeleteFailed: true,
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    LocalNotifications: {
      iconColor: "#8B5CF6",
      sound: "default",
    },
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ["google.com"],
    },
  },
};

export default config;

