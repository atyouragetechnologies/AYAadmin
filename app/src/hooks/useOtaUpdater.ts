import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'atyourage-e78ff';
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

function normalizeVersion(v: string | null | undefined): string {
  return (v || '').trim().replace(/^v/i, '');
}

function compareVersions(left: string | null | undefined, right: string | null | undefined): number {
  const l = normalizeVersion(left).split('.').map(Number);
  const r = normalizeVersion(right).split('.').map(Number);
  for (let i = 0; i < Math.max(l.length, r.length); i++) {
    const lv = Number.isFinite(l[i]) ? l[i] : 0;
    const rv = Number.isFinite(r[i]) ? r[i] : 0;
    if (lv < rv) return -1;
    if (lv > rv) return 1;
  }
  return 0;
}

function isVersionOlder(current: string | null | undefined, required: string | null | undefined): boolean {
  if (!normalizeVersion(current) || !normalizeVersion(required)) return false;
  return compareVersions(current, required) < 0;
}

interface OtaState {
  isForceUpdating: boolean;
  progress: number;
}

/**
 * useOtaUpdater — CPBS-style Capgo OTA hook for AYA app.
 *
 * On mount (native only):
 *  - Reads ota_config/latest from Firestore via REST.
 *  - If a newer version exists: shows ForceOtaUpdateScreen and downloads + applies immediately.
 *  - Silent background download option (using CapacitorUpdater.next + setMultiDelay) 
 *    queues update to apply only on next kill+reopen.
 */
export function useOtaUpdater(): OtaState {
  const [isForceUpdating, setIsForceUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const downloadListenerRef = useRef<any>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (triggeredRef.current) return;
    triggeredRef.current = true;

    const run = async () => {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/ota_config/latest?key=${FIREBASE_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        const latestVersion = String(data?.fields?.version?.stringValue || '').trim();
        const otaUrl = String(data?.fields?.url?.stringValue || '').trim();

        if (!latestVersion || !otaUrl) return;
        if (!isVersionOlder(APP_VERSION, latestVersion)) return;

        console.log(`[OTA] Update available: ${APP_VERSION} → ${latestVersion}`);

        // Force OTA: show blocking screen + download + apply immediately
        setIsForceUpdating(true);
        setProgress(0);

        if (!downloadListenerRef.current) {
          let maxProgress = 0;
          downloadListenerRef.current = await CapacitorUpdater.addListener('download', (info: any) => {
            const pct = Math.round(info.percent);
            if (pct > maxProgress) {
              maxProgress = pct;
              setProgress(maxProgress);
            }
          });
        }

        let dlId = '';
        try {
          const dl = await CapacitorUpdater.download({ url: otaUrl, version: latestVersion });
          dlId = dl.id;
        } catch (downloadErr: any) {
          console.warn('[OTA] Download error, checking existing bundles:', downloadErr);
          const list = await CapacitorUpdater.list();
          const existing = list.bundles.find(
            (b: any) => b.version === latestVersion && (b.status === 'success' || b.status === 'pending')
          );
          if (existing) {
            dlId = existing.id;
          } else {
            throw downloadErr;
          }
        }

        if (dlId) {
          // set() causes the app to instantly reload with the new bundle
          await CapacitorUpdater.set({ id: dlId });
        }
      } catch (err: any) {
        console.warn('[OTA] Update check failed (non-fatal):', err.message);
        setIsForceUpdating(false);
        setProgress(0);
        triggeredRef.current = false; // allow retry
      }
    };

    run();
  }, []);

  return { isForceUpdating, progress };
}
