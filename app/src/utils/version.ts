import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

/**
 * OTA / game content version — baked in at build time from the ROOT package.json
 * (see app/vite.config.ts). This is the single source of truth used by ota-push.mjs,
 * ota-predeploy.mjs and useOtaUpdater to decide when a Capgo OTA update is available.
 */
export const OTA_APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

/**
 * Native Android shell version as configured in android/app/build.gradle at the time
 * this bundle was built. This only changes when a new APK/AAB is submitted to the
 * Play Store — it is independent of the OTA version above.
 */
export const CONFIGURED_ANDROID_VERSION_NAME = import.meta.env.VITE_ANDROID_VERSION_NAME || 'unknown';
export const CONFIGURED_ANDROID_VERSION_CODE = import.meta.env.VITE_ANDROID_VERSION_CODE || 'unknown';

const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'atyourage-e78ff';
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

export interface NativeAppInfo {
  version: string;
  build: string;
  id: string;
  name: string;
}

/** Live native app info for the device this code is actually running on (native only). */
export async function getNativeAppInfo(): Promise<NativeAppInfo | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const info = await CapApp.getInfo();
    return { version: info.version, build: info.build, id: info.id, name: info.name };
  } catch {
    return null;
  }
}

export interface LatestOtaConfig {
  version: string;
  url: string;
  checksum: string;
  message: string;
  updatedAt: string;
}

/** Fetches the currently-published OTA bundle info from Firestore ota_config/latest. */
export async function fetchLatestOtaConfig(): Promise<LatestOtaConfig | null> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/ota_config/latest?key=${FIREBASE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const f = data?.fields;
    if (!f?.version?.stringValue) return null;
    return {
      version: String(f.version.stringValue || ''),
      url: String(f.url?.stringValue || ''),
      checksum: String(f.checksum?.stringValue || ''),
      message: String(f.message?.stringValue || ''),
      updatedAt: String(f.updatedAt?.stringValue || ''),
    };
  } catch {
    return null;
  }
}
