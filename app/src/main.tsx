import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { syncExistingSubscriptionIfGranted } from './utils/pushNotifications.ts';
import './utils/pwaInstall.ts';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

// CRITICAL: Must be called on every app startup.
// Tells Capgo "the new bundle is healthy — don't revert on next launch".
// Mirrors CPBS (Prem Bhakti) app index.tsx pattern.
CapacitorUpdater.notifyAppReady();

// Version is auto-injected from package.json at build time via vite.config.ts define
// To force a reload for all users, bump the version in the ROOT package.json
const FORCE_RELOAD_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// iOS Safari guard: prevent infinite reload loop
// Only allow a version-bump reload once every 10 seconds
const lastReloadTime = (() => { try { return parseInt(sessionStorage.getItem('aya_last_reload') || '0', 10); } catch { return 0; } })();
const reloadCooldownOk = Date.now() - lastReloadTime > 10000;

try {
    const storedVersion = localStorage.getItem('aya_pwa_version');
    if (storedVersion !== FORCE_RELOAD_VERSION && reloadCooldownOk) {
        localStorage.setItem('aya_pwa_version', FORCE_RELOAD_VERSION);

        // Wipe out the levels array in the Zustand store so it gets re-fetched or re-generated
        try {
            const storeStr = localStorage.getItem('aya-user-store');
            if (storeStr) {
                const store = JSON.parse(storeStr);
                if (store.state && Array.isArray(store.state.levels)) {
                    store.state.levels = [];
                    localStorage.setItem('aya-user-store', JSON.stringify(store));
                    console.log('[Cache Clear] Wiped levels from local storage');
                }
            }
        } catch (e) {
            console.error('[Cache Clear] Failed to parse local store', e);
        }

        // Wipe browser cache storage
        if ('caches' in window) {
            caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).catch(() => {});
        }

        // Record reload time before reloading (prevents iOS loop)
        try { sessionStorage.setItem('aya_last_reload', String(Date.now())); } catch {}

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for (let registration of registrations) {
                    registration.unregister();
                }
                window.location.reload();
            }).catch(() => window.location.reload());
        } else {
            window.location.reload();
        }
    }
} catch (e) {
    // localStorage blocked (iOS Private Mode) — skip version check, just boot normally
    console.warn('[AYA Boot] localStorage unavailable, skipping version check:', e);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = '/game/sw.js';
    navigator.serviceWorker.register(swUrl, { scope: '/game/' }).then(
      (registration) => {
        console.log('[SW] Service Worker registered with scope:', registration.scope);
        // Force checking for updates from Vercel immediately
        registration.update().catch(() => {});
        // Sync existing subscription if permission was previously granted (without creating new subscriptions on load)
        syncExistingSubscriptionIfGranted();
      },
      (error) => {
        console.warn('[SW] Primary /game/sw.js registration failed, trying root /sw.js:', error);
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(
          (reg) => {
            console.log('[SW] Fallback root SW registered with scope:', reg.scope);
            syncExistingSubscriptionIfGranted();
          },
          (rootErr) => {
            console.error('[SW] All Service Worker registrations failed:', rootErr);
          }
        );
      }
    );
  });
}

// Global Error Handler moved to index.html for better coverage

// ============================================================
// iOS Safari Viewport Height Fix
// Must run before React renders
// ============================================================
function setVhVariable() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set on load
setVhVariable();

// Update on resize (iOS fires this when address bar shows/hides)
window.addEventListener('resize', setVhVariable, { passive: true });
window.addEventListener('orientationchange', () => {
  setTimeout(setVhVariable, 200); // Delay for iOS orientation animation
}, { passive: true });

if (import.meta.env.DEV) {
  try {
    console.log('[AYA Boot] aya_user_id:', localStorage.getItem('aya_user_id'));
    console.log('[AYA Boot] store keys:', Object.keys(JSON.parse(localStorage.getItem('aya-user-store') || '{}')));
  } catch (e) {
    console.warn('[AYA Boot] Storage not accessible:', e);
  }
}



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Gracefully dismiss initial HTML preloader once React has rendered
const dismissHtmlLoader = () => {
  const loader = document.getElementById('app-loader');
  if (loader && loader.style.display !== 'none') {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 400);
  }
};
setTimeout(dismissHtmlLoader, 350);
