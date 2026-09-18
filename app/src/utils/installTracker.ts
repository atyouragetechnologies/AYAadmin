import { logAnalyticsEvent, upsertUserProfile } from '../lib/firestore';
import { useUserStore } from '../store/userStore';
import { safeStorage } from './storage';
import { isPwaInstalled, isIosDevice } from './pwaInstall';

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'other';
  browser: 'chrome' | 'safari' | 'edge' | 'firefox' | 'opera' | 'samsung' | 'other';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isStandalone: boolean;
  notificationsEnabled: boolean;
  visitorId: string;
  userAgent: string;
  screenSize: string;
}

/**
 * Get or create a persistent anonymous visitor ID
 */
export function getVisitorId(): string {
  let vid = safeStorage.get('aya_visitor_id');
  if (!vid) {
    try {
      vid = crypto.randomUUID();
    } catch {
      vid = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    safeStorage.set('aya_visitor_id', vid);
  }
  return vid;
}

/**
 * Detect client OS, browser, and hardware format
 */
export function detectDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      platform: 'other',
      browser: 'other',
      deviceType: 'desktop',
      isStandalone: false,
      notificationsEnabled: false,
      visitorId: '',
      userAgent: '',
      screenSize: '0x0',
    };
  }

  const ua = (navigator.userAgent || '').toLowerCase();
  const platformStr = (navigator.platform || '').toLowerCase();

  // Platform
  let platform: DeviceInfo['platform'] = 'other';
  if (isIosDevice()) {
    platform = 'ios';
  } else if (/android/.test(ua)) {
    platform = 'android';
  } else if (/win/.test(platformStr) || /windows/.test(ua)) {
    platform = 'windows';
  } else if (/mac/.test(platformStr) || /macintosh/.test(ua)) {
    platform = 'mac';
  } else if (/linux/.test(platformStr) || /linux/.test(ua)) {
    platform = 'linux';
  }

  // Browser
  let browser: DeviceInfo['browser'] = 'other';
  if (/samsungbrowser/.test(ua)) {
    browser = 'samsung';
  } else if (/edg\//.test(ua) || /edge/.test(ua)) {
    browser = 'edge';
  } else if (/opr\//.test(ua) || /opera/.test(ua)) {
    browser = 'opera';
  } else if (/chrome|crios/.test(ua)) {
    browser = 'chrome';
  } else if (/safari/.test(ua) && !/chrome|crios/.test(ua)) {
    browser = 'safari';
  } else if (/firefox|fxios/.test(ua)) {
    browser = 'firefox';
  }

  // Device type
  let deviceType: DeviceInfo['deviceType'] = 'desktop';
  const isMobileUa = /mobi|android|iphone|ipod/.test(ua);
  const isTablet = /ipad|tablet/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isTablet) {
    deviceType = 'tablet';
  } else if (isMobileUa || window.innerWidth < 768) {
    deviceType = 'mobile';
  }

  const isStandalone = isPwaInstalled();
  const notificationsEnabled = typeof Notification !== 'undefined' && Notification.permission === 'granted';
  const visitorId = getVisitorId();
  const screenSize = `${window.innerWidth}x${window.innerHeight}`;

  return {
    platform,
    browser,
    deviceType,
    isStandalone,
    notificationsEnabled,
    visitorId,
    userAgent: navigator.userAgent || '',
    screenSize,
  };
}

/**
 * Record an app installation / add to home screen event in Supabase
 */
export async function recordAppInstall(
  method: 'native_prompt' | 'ios_guide' | 'desktop_guide' | 'android_guide' | 'standalone_verified',
  extraMeta?: Record<string, any>
): Promise<boolean> {
  const info = detectDeviceInfo();
  safeStorage.set('aya_pwa_installed', 'true');
  safeStorage.set('aya_install_method', method);
  safeStorage.set('aya_installed_at', new Date().toISOString());

  const currentUserId = useUserStore.getState().profile?.id || null;
  const payload = {
    ...info,
    install_method: method,
    installed_at: new Date().toISOString(),
    ...extraMeta,
  };

  try {
    // Log to Firestore analytics
    logAnalyticsEvent('app_installs', {
      userId: currentUserId && !currentUserId.startsWith('offline-') ? currentUserId : null,
      visitorId: info.visitorId,
      platform: info.platform,
      browser: info.browser,
      deviceType: info.deviceType,
      installMethod: method,
      isStandalone: true,
      notificationsEnabled: info.notificationsEnabled,
      userAgent: info.userAgent,
      screenSize: info.screenSize,
      installedAt: new Date().toISOString(),
      ...extraMeta,
    });
  } catch (err) {
    console.warn('[InstallTracker] Firestore log notice:', err);
  }

  // Update users doc if logged in
  if (currentUserId && !currentUserId.startsWith('offline-')) {
    try {
      await upsertUserProfile(currentUserId, {
        isInstalled: true,
        installedAt: new Date().toISOString(),
        installationPlatform: info.platform,
      });
    } catch (err) {
      console.warn('[InstallTracker] users update notice:', err);
    }
  }

  // Notify app
  window.dispatchEvent(new CustomEvent('aya-app-installed', { detail: payload }));
  return true;
}

/**
 * Record push notification prompt decision
 */
export async function recordNotificationDecision(
  decision: 'granted' | 'denied' | 'dismissed'
): Promise<void> {
  const info = detectDeviceInfo();
  const currentUserId = useUserStore.getState().profile?.id || null;

  try {
    logAnalyticsEvent('notification_decisions', {
      userId: currentUserId && !currentUserId.startsWith('offline-') ? currentUserId : null,
      visitorId: info.visitorId,
      platform: info.platform,
      browser: info.browser,
      decision,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[InstallTracker] notification decision log notice:', err);
  }
}

/**
 * Auto-detect and record standalone app launch (when opened directly from home screen)
 */
export function initStandaloneAutoTracking(): void {
  if (typeof window === 'undefined') return;

  const isStandalone = isPwaInstalled();
  const hasTracked = safeStorage.get('aya_standalone_tracked');

  if (isStandalone && !hasTracked) {
    safeStorage.set('aya_standalone_tracked', 'true');
    recordAppInstall('standalone_verified', { autoDetected: true });
  }

  window.addEventListener('appinstalled', () => {
    recordAppInstall('native_prompt', { nativeEvent: true });
  });
}

export interface InstallStats {
  totalInstalls: number;
  pushSubscribers: number;
  platformBreakdown: {
    ios: number;
    android: number;
    windows: number;
    mac: number;
    other: number;
  };
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  methodBreakdown: Record<string, number>;
  recentInstalls: Array<{
    id: string;
    visitorId: string;
    userId: string | null;
    platform: string;
    browser: string;
    deviceType: string;
    installMethod: string;
    notificationsEnabled: boolean;
    createdAt: string;
  }>;
}

/**
 * Fetch install analytics data — returns empty stats (admin analytics now in Firestore/Firebase Analytics)
 */
export async function fetchInstallStats(): Promise<InstallStats> {
  return {
    totalInstalls: 0,
    pushSubscribers: 0,
    platformBreakdown: { ios: 0, android: 0, windows: 0, mac: 0, other: 0 },
    deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
    methodBreakdown: {},
    recentInstalls: [],
  };
}
