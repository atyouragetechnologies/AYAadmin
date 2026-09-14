import { supabase } from './supabase';
import { useUserStore } from '../store/userStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sanitize a VAPID key string by trimming whitespace and stripping enclosing quotes if present.
 */
function sanitizeBase64Url(keyStr: string): string {
  let clean = keyStr.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1).trim();
  }
  return clean;
}

/**
 * Convert a URL-safe base64 VAPID public key to the Uint8Array that
 * pushManager.subscribe() expects as `applicationServerKey`.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const cleanStr = sanitizeBase64Url(base64String);
  const padding = '='.repeat((4 - (cleanStr.length % 4)) % 4);
  const base64 = (cleanStr + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Validate that a VAPID public key string decodes to a valid 65-byte uncompressed P-256 EC public key.
 */
export function validateVapidPublicKey(keyStr: string): { valid: boolean; length?: number; error?: string } {
  try {
    const clean = sanitizeBase64Url(keyStr);
    if (!clean) return { valid: false, error: 'VAPID public key string is empty' };
    
    const uint8 = urlBase64ToUint8Array(clean);
    if (uint8.length !== 65) {
      return {
        valid: false,
        length: uint8.length,
        error: `Invalid VAPID public key byte length: expected 65 bytes, got ${uint8.length} bytes`
      };
    }
    if (uint8[0] !== 4) {
      return {
        valid: false,
        length: uint8.length,
        error: `Invalid VAPID public key prefix byte: expected 0x04, got 0x${uint8[0].toString(16)}`
      };
    }
    return { valid: true, length: uint8.length };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Failed to decode base64url string' };
  }
}

/**
 * Compare two Uint8Array buffers for equality.
 */
function areUint8ArraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Return a non-sensitive browser label for the temporary push diagnostic. */
function getBrowserLabel(userAgent: string): string {
  if (/Edg\//.test(userAgent)) return 'Microsoft Edge';
  if (/OPR\//.test(userAgent)) return 'Opera';
  if (/CriOS\//.test(userAgent)) return 'Chrome on iOS';
  if (/Chrome\//.test(userAgent)) return 'Google Chrome';
  if (/Firefox\//.test(userAgent)) return 'Mozilla Firefox';
  if (/Safari\//.test(userAgent)) return 'Safari';
  return 'Unknown browser';
}

// Single-flight lock to prevent concurrent subscription calls
let isSubscribingInFlight = false;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type PushNotificationState = 'unsupported' | 'granted' | 'denied' | 'default';

/**
 * Check if the current browser supports Web Push notifications.
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Get current browser notification permission state.
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Check browser support and current Notification permission status.
 */
export function getNotificationSupportStatus(): PushNotificationState {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission as PushNotificationState;
}

/**
 * Retrieve current active push subscription if one exists.
 */
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

/**
 * Unsubscribe current browser device from push notifications.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    if (!isPushSupported()) return false;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Delete from backend Supabase table
      try {
        await fetch('/api/subscribe-push', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint })
        });
      } catch (err) {
        console.warn('[Push] Error deleting subscription from DB:', err);
      }

      console.log('[Push] Unsubscribed successfully.');
      return true;
    }
    return false;
  } catch (err) {
    console.error('[Push] unsubscribeFromPush failed:', err);
    return false;
  }
}

export async function subscribeToPush(userId?: string): Promise<PushSubscription | null> {
  return subscribeUserToPush(userId);
}

/**
 * Log notification status (enabled / not enabled / permission) to Supabase.
 */
export async function logNotificationStatus(
  userId?: string | null,
  enabled: boolean = false,
  permissionState: string = 'default'
): Promise<void> {
  const targetId = userId || useUserStore.getState().profile?.id || localStorage.getItem('aya_user_id') || null;
  if (!targetId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await supabase.from('users').update({
          notifications_enabled: enabled,
          notification_permission: permissionState,
          notification_updated_at: new Date().toISOString()
        }).eq('id', user.id);
      }
    } catch (e) {
      console.warn('[Push] Notice logging notification status to Supabase:', e);
    }
    return;
  }

  try {
    const { error } = await supabase.from('users').update({
      notifications_enabled: enabled,
      notification_permission: permissionState,
      notification_updated_at: new Date().toISOString()
    }).eq('id', targetId);
    if (error) {
      console.warn('[Push] Notice updating user notification status:', error.message);
    }
  } catch (err) {
    console.warn('[Push] Error updating user notification status in Supabase:', err);
  }
}

/**
 * Public function to subscribe user to push notifications.
 * Idempotent & protected with an in-flight guard.
 */
export async function subscribeUserToPush(passedUserId?: string): Promise<PushSubscription | null> {
  if (isSubscribingInFlight) {
    console.warn('[Push] Subscription request already in-flight. Skipping duplicate call.');
    return null;
  }

  isSubscribingInFlight = true;
  try {
    return await _subscribeUserToPushInternal(passedUserId);
  } finally {
    isSubscribingInFlight = false;
  }
}

/**
 * Internal implementation of push subscription.
 */
async function _subscribeUserToPushInternal(passedUserId?: string): Promise<PushSubscription | null> {
  console.log('[Push] Starting push notification subscription flow...');

  // ── 1. Feature Detection & Permission Check ───────────────────────────
  console.log('[Push] Checking notification permission');
  if (typeof window === 'undefined' || !('Notification' in window)) {
    await logNotificationStatus(passedUserId, false, 'unsupported');
    throw new Error('Notifications are not supported by this browser. (On iOS, add AYA to Home Screen first).');
  }

  const initialPermission = Notification.permission;
  console.log('[Push] Current notification permission state:', initialPermission);

  if (initialPermission === 'denied') {
    await logNotificationStatus(passedUserId, false, 'denied');
    throw new Error('Notifications are blocked in browser settings. Please allow notifications for this site in your browser.');
  }

  // ── 2. Request User Consent if Permission is Default ───────────────────
  if (Notification.permission === 'default') {
    console.log('[Push] Requesting Notification permission from user...');
    const permissionResult = await Notification.requestPermission();
    if (permissionResult !== 'granted') {
      await logNotificationStatus(passedUserId, false, permissionResult);
      throw new Error('Notification permission was not granted.');
    }
  }

  // Permission is granted! Log to Supabase immediately
  await logNotificationStatus(passedUserId, true, 'granted');

  // ── 3. Validate VAPID Public Key from Env ─────────────────────────────
  console.log('[Push] Validating VAPID public key...');
  const rawVapidKey = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined)?.trim();

  if (!rawVapidKey) {
    console.warn('[Push] VITE_VAPID_PUBLIC_KEY is not configured in environment variables.');
    // Browser notification permission is granted even if remote WebPush VAPID key is omitted
    return null;
  }

  const keyValidation = validateVapidPublicKey(rawVapidKey);
  console.log(`[Push] VAPID key format check: valid=${keyValidation.valid}, byteLength=${keyValidation.length ?? 'unknown'}`);

  if (!keyValidation.valid) {
    console.error(`[Push] VAPID key validation failed: ${keyValidation.error}`);
    return null;
  }
  const effectiveVapidKey = rawVapidKey;

  // ── 4. Register & Get Service Worker ──────────────────────────────────
  if (!('serviceWorker' in navigator)) {
    console.warn('[Push] Service worker not available; enabled window notifications.');
    return null;
  }

  console.log('[Push] Registering service worker');
  let registration: ServiceWorkerRegistration | undefined;
  try {
    registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
  } catch (regErr: any) {
    console.warn('[Push] Service worker register warning:', regErr?.message || regErr);
  }

  if (registration) {
    try {
      const readyPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Service worker ready timeout (5s)')), 5000)
      );
      registration = await Promise.race([readyPromise, timeoutPromise]);
      console.log(`[Push] Service worker ready (scope: ${registration?.scope}, active: ${!!registration?.active})`);
    } catch (swReadyErr: any) {
      console.warn('[Push] Service worker ready wait notice:', swReadyErr?.message || swReadyErr);
    }
  }

  if (!registration || !('PushManager' in window)) {
    console.log('[Push] PushManager or SW registration not available, browser notification permission granted.');
    return null;
  }

  // ── 5. Convert VAPID Key to Uint8Array ────────────────────────────────
  console.log('[Push] Converting VAPID key...');
  let applicationServerKey: Uint8Array;
  try {
    applicationServerKey = urlBase64ToUint8Array(effectiveVapidKey);
  } catch (e: any) {
    console.error('[Push] FAIL — Stage 5 (VAPID Conversion): Key conversion failed:', e?.message || e);
    return null;
  }

  // ── 6. Check Existing Subscription & Handle Key Mismatches ───────────
  let subscription: PushSubscription | null = null;
  let existingSub: PushSubscription | null = null;

  try {
    existingSub = await registration.pushManager.getSubscription();
    console.log('[Push] Existing browser PushSubscription found:', !!existingSub);

    if (existingSub) {
      let keysMatch = false;
      if (existingSub.options && existingSub.options.applicationServerKey) {
        const existingKeyUint8 = new Uint8Array(existingSub.options.applicationServerKey);
        keysMatch = areUint8ArraysEqual(existingKeyUint8, applicationServerKey);
      }

      if (keysMatch) {
        console.log('[Push] Existing PushSubscription matches current VAPID public key. Reusing subscription.');
        subscription = existingSub;
      } else {
        console.log('[Push] Existing PushSubscription uses a DIFFERENT VAPID key. Unsubscribing stale browser subscription...');
        await existingSub.unsubscribe().catch(() => {});
        subscription = null;
      }
    }
  } catch (existingCheckErr: any) {
    console.warn('[Push] Error checking existing subscription:', existingCheckErr?.message || existingCheckErr);
  }

  // ── 7. Call PushManager.subscribe() ──────────────────────────────────
  if (!subscription) {
    console.log('[Push] Calling pushManager.subscribe()…');
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as BufferSource,
      });
      console.log('[Push] PushSubscription created');
    } catch (subErr: any) {
      console.warn('[Push] PushManager.subscribe notice:', subErr?.message || subErr);
      // Even if background Web Push endpoint subscription has browser restrictions, permission was granted
      return null;
    }
  }

  if (!subscription) {
    return null;
  }

  // ── 8. Save Subscription to Backend ──────────────────────────────────
  let targetUserId: string | null = passedUserId || useUserStore.getState().profile?.id || localStorage.getItem('aya_user_id') || null;

  if (!targetUserId) {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) targetUserId = authUser.id;
    } catch (e) {
      console.warn('[Push] Auth check warning:', e);
    }
  }

  console.log('[Push] Saving subscription to backend');
  const subJson = subscription.toJSON();

  try {
    const apiRes = await fetch('/api/subscribe-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subJson, userId: targetUserId })
    });
    const resData = await apiRes.json().catch(() => ({}));
    if (!apiRes.ok || !resData.success) {
      console.warn(`[Push] Backend save notice: ${resData.error || apiRes.status}`);
    }
  } catch (netErr) {
    console.warn('[Push] Backend save network error:', netErr);
  }

  console.log('[Push] Subscription flow complete.');
  return subscription;
}

/**
 * Isolated Browser Diagnostic Test Function.
 * Performs ONLY browser PushManager.subscribe() without calling Supabase/backend.
 */
export async function runIsolatedPushDiagnostic(): Promise<{ success: boolean; error?: string; endpointHost?: string }> {
  console.log('[Push Diagnostic] Running isolated browser PushManager test...');
  try {
    const rawVapidKey = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined)?.trim();
    if (!rawVapidKey) {
      return { success: false, error: 'VITE_VAPID_PUBLIC_KEY environment variable is not configured' };
    }
    const applicationServerKey = urlBase64ToUint8Array(rawVapidKey);
    const registration = typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration('/sw.js') : null;
    const existing = registration ? await registration.pushManager.getSubscription() : null;

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    const userAgentData = typeof navigator !== 'undefined' && (navigator as any).userAgentData ? (navigator as any).userAgentData : null;
    const platform = typeof navigator !== 'undefined' ? navigator.platform : 'unknown';

    console.log('[Push Diagnostic] System & Environment State:', {
      userAgent,
      userAgentData,
      browser: getBrowserLabel(userAgent),
      platform,
      hasServiceWorkerSupport: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
      swState: registration ? (registration.active ? 'activated' : (registration.installing ? 'installing' : 'waiting')) : 'not registered',
      swScope: registration?.scope || 'none',
      pushManagerAvailable: typeof window !== 'undefined' && 'PushManager' in window,
      notificationPermission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported',
      appServerKeyLength: applicationServerKey ? applicationServerKey.length : 0,
      appServerKeyFirstByte: applicationServerKey ? applicationServerKey[0] : null,
      hasExistingSub: !!existing
    });

    if (!isPushSupported()) {
      return { success: false, error: 'Web Push features not supported in this browser' };
    }

    const keyValidation = validateVapidPublicKey(rawVapidKey);
    if (!keyValidation.valid) {
      return { success: false, error: `Key validation failed: ${keyValidation.error}` };
    }

    const activeReg = await navigator.serviceWorker.ready;

    if (existing && applicationServerKey) {
      const existingKeyUint8 = existing.options?.applicationServerKey ? new Uint8Array(existing.options.applicationServerKey) : null;
      const keysMatch = existingKeyUint8 ? areUint8ArraysEqual(existingKeyUint8, applicationServerKey) : false;
      if (!keysMatch) {
        console.log('[Push Diagnostic] Unsubscribing mismatched existing subscription...');
        await existing.unsubscribe();
      } else {
        console.log('[Push Diagnostic] Existing subscription matches current VAPID key.');
        return { success: true, endpointHost: new URL(existing.endpoint).hostname };
      }
    }

    console.log('[Push Diagnostic] Attempting isolated pushManager.subscribe()...');
    const sub = await activeReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as unknown as BufferSource,
    });

    const host = new URL(sub.endpoint).hostname;
    console.log('[Push Diagnostic] Isolated PushManager.subscribe() SUCCESS! Endpoint host:', host);
    return { success: true, endpointHost: host };
  } catch (err: any) {
    const exceptionName = err?.name || 'Error';
    const exceptionMessage = err?.message || String(err);
    console.error('[Push Diagnostic] Isolated PushManager.subscribe() FAILED:', {
      exceptionName,
      exceptionMessage,
    });
    return { success: false, error: `${exceptionName}: ${exceptionMessage}` };
  }
}

/**
 * Silently sync existing push subscription with backend if permission is granted.
 * NEVER invokes pushManager.subscribe() automatically during boot.
 */
export async function syncExistingSubscriptionIfGranted(): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      const existing = await getExistingSubscription();
      if (existing) {
        console.log('[Push Boot] Found existing subscription on boot — syncing with backend...');
        let targetUserId: string | null = useUserStore.getState().profile?.id || localStorage.getItem('aya_user_id') || null;
        if (!targetUserId) {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) targetUserId = authUser.id;
        }
        await fetch('/api/subscribe-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: existing.toJSON(), userId: targetUserId })
        });
        console.log('[Push Boot] Existing subscription synced successfully.');
      } else {
        console.log('[Push Boot] Notification permission granted, but no browser subscription exists yet. Awaiting user action.');
      }
    } catch (e) {
      console.warn('[Push Boot] Silent sync error:', e);
    }
  }
}

/**
 * Trigger an instant test notification on the user's device.
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    if (!('Notification' in window)) {
      alert("Notifications are not supported by this browser.");
      return false;
    }

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      alert("Notification permission is not granted. Please allow notifications in your browser settings!");
      return false;
    }

    // Attempt 1: Service Worker Notification
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification('🌟 AYA Notifications Active!', {
            body: 'Welcome! You will receive daily mindset reminders and streak alerts.',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: 'aya-test-notification'
          } as NotificationOptions);
          return true;
        }
      } catch (swErr) {
        console.warn('[Push] ServiceWorker showNotification failed, falling back to window Notification:', swErr);
      }
    }

    // Attempt 2: Direct Window Notification fallback
    new Notification('🌟 AYA Notifications Active!', {
      body: 'Welcome! You will receive daily mindset reminders and streak alerts.',
      icon: '/icons/icon-192.png'
    });
    return true;
  } catch (err: any) {
    console.error('[Push] Failed to show test notification:', err);
    alert('Could not show notification: ' + (err?.message || err));
    return false;
  }
}

