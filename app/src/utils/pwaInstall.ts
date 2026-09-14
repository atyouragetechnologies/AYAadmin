/**
 * PWA Installation Helper & Utility
 * Handles beforeinstallprompt on Android/Chrome and Safari manual guide on iOS.
 */

import { safeStorage } from './storage';
import { Capacitor } from '@capacitor/core';

let deferredPrompt: any = null;

if (typeof window !== 'undefined') {
    // Capture beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        (window as any).__ayaDeferredInstallPrompt = e;
        window.dispatchEvent(new CustomEvent('aya-install-available'));
    });

    // Detect successful installation
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        (window as any).__ayaDeferredInstallPrompt = null;
        safeStorage.set('aya_pwa_installed', 'true');
        window.dispatchEvent(new CustomEvent('aya-app-installed'));
        console.log('[PWA] AYA added to home screen successfully');
    });
}

/**
 * Checks if the app is currently running in standalone / installed PWA mode
 */
export function isPwaInstalled(): boolean {
    if (typeof window === 'undefined') return false;

    const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
    const isIosStandalone = (window.navigator as any).standalone === true;
    const isAndroidApp = document.referrer?.includes('android-app://');
    const isStorageMarked = safeStorage.get('aya_pwa_installed') === 'true';

    return Boolean(isStandaloneDisplay || isIosStandalone || isAndroidApp || isStorageMarked);
}

/**
 * Checks if the user is on an iOS device (iPhone, iPad, iPod)
 */
export function isIosDevice(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosUa = /iphone|ipad|ipod/.test(ua);
    const isIpadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return isIosUa || isIpadOs;
}

/**
 * Checks if native install prompt (Android/Chrome/Edge) is ready
 */
export function canPromptNativeInstall(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(deferredPrompt || (window as any).__ayaDeferredInstallPrompt);
}

/**
 * Triggers native PWA install dialog
 */
export async function triggerNativeInstall(): Promise<'accepted' | 'dismissed' | 'unsupported'> {
    const promptEvent = deferredPrompt || (window as any)?.__ayaDeferredInstallPrompt;
    if (!promptEvent) {
        return 'unsupported';
    }

    try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        deferredPrompt = null;
        (window as any).__ayaDeferredInstallPrompt = null;
        
        if (choice.outcome === 'accepted') {
            safeStorage.set('aya_pwa_installed', 'true');
            return 'accepted';
        }
        return 'dismissed';
    } catch (err) {
        console.warn('[PWA] Prompt error:', err);
        return 'dismissed';
    }
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKLY_PROMPT_KEY = 'aya_weekly_install_prompt_time';

/**
 * Determines whether the install / add to home screen popup should be shown.
 * Strict rules:
 * 1. ONLY for users who have NOT added to homescreen or NOT installed it.
 * 2. ONLY one time in a week (7 days cooldown).
 */
export function shouldShowInstallPrompt(profile?: any): boolean {
    if (typeof window === 'undefined') return false;

    // Rule 0: Never show inside the Native App (Capacitor)
    if (Capacitor.isNativePlatform()) return false;

    // Rule 1: Never show if already installed or added to home screen
    if (isPwaInstalled()) return false;
    if (profile?.is_installed === true) return false;
    if (safeStorage.get('aya_pwa_installed') === 'true') return false;

    // Rule 2: Only one time in a week (7 days)
    const lastShown = Number(safeStorage.get(WEEKLY_PROMPT_KEY) || 0);
    if (lastShown > 0 && (Date.now() - lastShown) < SEVEN_DAYS_MS) {
        return false;
    }

    return true;
}

/**
 * Records that the install popup has been shown (or actioned), starting the 7-day cooldown.
 */
export function recordInstallPromptShown(): void {
    safeStorage.set(WEEKLY_PROMPT_KEY, String(Date.now()));
}

