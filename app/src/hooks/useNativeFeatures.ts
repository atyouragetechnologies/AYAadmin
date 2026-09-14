import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { TextZoom } from '@capacitor/text-zoom';
import { Network } from '@capacitor/network';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../utils/supabase';

/** True when running inside the Capacitor Android/iOS app (not a browser tab) */
export const isNativeApp = Capacitor.isNativePlatform();
/** Alias for clarity in Android-specific code */
export const isAndroid = isNativeApp && Capacitor.getPlatform() === 'android';

/**
 * Plays a haptic feedback at the appropriate intensity level.
 * - 'success' → notification-type buzz (story complete, level up)
 * - 'good'    → medium impact (positive choice)
 * - 'bad'     → heavy impact (negative choice)  
 * - 'tap'     → light tap (navigation, UI)
 */
export const playHaptic = (type: 'success' | 'good' | 'bad' | 'tap' = 'tap') => {
  if (!isNativeApp) return;
  switch (type) {
    case 'success':
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      break;
    case 'good':
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      break;
    case 'bad':
      Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
      break;
    case 'tap':
    default:
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      break;
  }
};

/**
 * Hook to initialize all Capacitor Native features.
 * Keeps App.tsx clean and modular.
 */
export function useNativeFeatures() {
  useEffect(() => {
    // 1. Initialize Native Plugins
    const initNativeFeatures = async () => {
      try {
        // Tag <body> so all CSS can target Android specifically
        if (isNativeApp) {
          document.body.classList.add('is-android');

          // "?"? NATIVE PUSH NOTIFICATIONS (FIREBASE) "?"?
          // Immediately request permission on app boot as requested by user
          try {
            const permStatus = await PushNotifications.requestPermissions();
            if (permStatus.receive === 'granted') {
              await PushNotifications.register();
            }

            // Capture the FCM token
            await PushNotifications.addListener('registration', async (token) => {
              console.log('[Push] FCM Token received: ', token.value);
              localStorage.setItem('aya_fcm_token', token.value);

              // If user is logged in, attach to their profile in Supabase
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                  await supabase.from('users').update({ fcm_token: token.value }).eq('auth_user_id', session.user.id);
                }
              } catch (fcmErr) {
                console.warn('[Push] fcm_token update skipped (column may not exist yet):', fcmErr);
              }
            });

            await PushNotifications.addListener('registrationError', (error: any) => {
              console.warn('[Push] FCM Registration Error: ', JSON.stringify(error));
            });
          } catch (e) {
            console.warn('[Push] Native Push Setup Failed: ', e);
          }
        }

        await KeepAwake.keepAwake();

        // Edge-to-edge: let WebView content render behind the status bar
        // CSS env(safe-area-inset-top) will push content down appropriately
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setStyle({ style: Style.Dark });

        // Lock text zoom so system accessibility settings don't break the UI layout
        await TextZoom.set({ value: 1.0 });

        // Listen for custom events so individual screens can hide/show status bar
        const handleHideStatusBar = () => {
          StatusBar.hide().catch(() => {});
        };
        const handleShowStatusBar = () => {
          StatusBar.show().catch(() => {});
          StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
          StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
        };
        window.addEventListener('aya-hide-statusbar', handleHideStatusBar);
        window.addEventListener('aya-show-statusbar', handleShowStatusBar);

        // ── NETWORK OFFLINE INDICATOR ──────────────────────────────────────
        // Check initial connectivity and listen for changes
        const netStatus = await Network.getStatus();
        if (!netStatus.connected) {
          document.body.classList.add('is-offline');
        }
        await Network.addListener('networkStatusChange', (status) => {
          if (!status.connected) {
            document.body.classList.add('is-offline');
            // Dispatch custom event so any screen can show its own offline UI
            window.dispatchEvent(new CustomEvent('aya-offline'));
          } else {
            document.body.classList.remove('is-offline');
            window.dispatchEvent(new CustomEvent('aya-online'));
          }
        });

        // ── APP STATE CHANGE: RESUME BGM AFTER BACKGROUNDING ──────────────
        // On Android, when user switches back to the app from another app,
        // AudioContext gets suspended. This restores BGM seamlessly.
        await CapApp.addListener('appStateChange', async ({ isActive }) => {
          if (isActive) {
            // App came to foreground — resume AudioContext and BGM
            // Small delay to let the WebView re-gain focus first
            setTimeout(async () => {
              try {
                const { bgmManager } = await import('../utils/bgmManager');
                // bgmManager.unlock() resumes ctx if suspended and replays pending track
                await bgmManager.unlock();
              } catch {}
            }, 300);
          } else {
            // App went to background — pause AudioContext to save battery
            // BGM will auto-resume when app comes back (above)
            try {
              const { getCtx } = await import('../utils/audioManager');
              const ctx = getCtx();
              if (ctx && ctx.state === 'running') {
                await ctx.suspend();
              }
            } catch {}
          }
        });

        // ── HANDLE PHYSICAL BACK BUTTON ────────────────────────────────────
        await CapApp.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
          // 1. SMART POPUP CLOSER: Find any visible modal, overlay, or dialog
          // We look for elements with high z-index (Tailwind z-40/z-50) or standard dialog roles.
          const modals = Array.from(document.querySelectorAll('.fixed.z-50, .fixed.z-40, [role="dialog"], dialog[open]'));
          
          // Filter out invisible ones (e.g. fading out or hidden by classes)
          const visibleModals = modals.filter(el => {
              const style = window.getComputedStyle(el);
              return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          });

          if (visibleModals.length > 0) {
              // Take the topmost (last in DOM tree)
              const topmost = visibleModals[visibleModals.length - 1];
              
              // Look for our standard close buttons (Lucide X icon, ArrowLeft, or explicit aria labels)
              const xIcon = topmost.querySelector('svg.lucide-x, svg.lucide-arrow-left');
              const closeBtn = (xIcon?.closest('button') || topmost.querySelector('button[aria-label*="close" i], button[aria-label*="back" i]')) as HTMLElement;
              
              if (closeBtn) {
                  closeBtn.click(); // Natively click the close button to trigger React's onClose!
                  return;
              }
              
              // Fallback to sending Escape key
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
              return;
          }

          // 2. NORMAL NAVIGATION
          if (canGoBack) {
            // Prevent going "back" to a blank splash screen if we are already on the main app dashboard
            if (window.location.pathname === '/game' || window.location.pathname === '/') {
                CapApp.exitApp();
            } else {
                window.history.back();
            }
          } else {
            CapApp.exitApp();
          }
        });

        // Hide splash screen smoothly now that React has fully mounted
        await SplashScreen.hide();

      } catch (e) {
        console.log("Native features not supported on this platform", e);
      }
    };
    initNativeFeatures();

    // 2. Global Haptics Listener for interactive elements (light tap for all buttons)
    const handleGlobalHaptics = (e: MouseEvent | TouchEvent) => {
      if (!isNativeApp) return;
      const target = e.target as HTMLElement;
      if (target.closest('button, a, [role="button"]')) {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      }
    };
    
    document.addEventListener('click', handleGlobalHaptics, { capture: true, passive: true });
    
    return () => {
      document.removeEventListener('click', handleGlobalHaptics, { capture: true });
      Network.removeAllListeners();
      CapApp.removeAllListeners();
    };
  }, []);
}
