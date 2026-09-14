import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';

export function GoogleTranslateSync() {
    const appLanguage = useUserStore((state) => state.appLanguage);

    useEffect(() => {
        const syncLanguage = () => {
            const currentCookie = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
            const currentTranslatedLang = currentCookie ? currentCookie[1] : 'en';

            if (currentTranslatedLang !== appLanguage) {
                // Prevent infinite reload loops on Capacitor (where cookies might not persist on localhost)
                const reloadCount = parseInt(sessionStorage.getItem('translate_reload_count') || '0');
                if (reloadCount > 2) {
                    console.warn('Google Translate sync aborted: cookie not persisting.');
                    return;
                }
                
                // Set the Google Translate cookie
                document.cookie = `googtrans=/en/${appLanguage}; path=/`;
                document.cookie = `googtrans=/en/${appLanguage}; path=/; domain=${window.location.hostname}`;
                
                sessionStorage.setItem('translate_reload_count', (reloadCount + 1).toString());
                
                // Force a reload to apply the translation natively
                window.location.reload();
            } else {
                sessionStorage.removeItem('translate_reload_count');
            }
        };

        syncLanguage();

        // No need for interval anymore since we handle it on mount and reload
    }, [appLanguage]);

    return null; // This is a logic-only component
}
