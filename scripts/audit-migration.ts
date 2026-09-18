/**
 * audit-migration.ts  (v2 — correct Firestore subcollection paths)
 * Compares Supabase table counts vs Firestore collection counts.
 * Run: node --experimental-strip-types scripts/audit-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hstddacoqsmztmbvvhhr.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SERVICE_ACCOUNT_PATH = resolve(process.cwd(), 'serviceAccountKey.json');

if (!SUPABASE_SERVICE_ROLE_KEY) { console.error('Set SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }
if (!existsSync(SERVICE_ACCOUNT_PATH)) { console.error('serviceAccountKey.json missing'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const sa = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

async function countSupa(table: string): Promise<number> {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    return error ? -1 : (count ?? 0);
}

async function countFire(path: string): Promise<number> {
    // Support nested path like: analytics/journey_events/events
    const parts = path.split('/');
    if (parts.length === 3) {
        const snap = await db.collection(parts[0]).doc(parts[1]).collection(parts[2]).count().get();
        return snap.data().count;
    }
    const snap = await db.collection(path).count().get();
    return snap.data().count;
}

// Supabase table → Firestore path (use /col/doc/subcol for subcollections)
const mapping: Array<{ supa: string; fire: string }> = [
    { supa: 'users',                fire: 'users' },
    { supa: 'admin_users',          fire: 'admin_users' },
    { supa: 'personality_profiles', fire: 'users' },           // stored as users/{uid}/personality/profile
    { supa: 'story_metadata',       fire: 'story_metadata' },
    { supa: 'story_tags',           fire: 'story_tags' },
    { supa: 'story_requests',       fire: 'story_requests' },
    { supa: 'story_reflections',    fire: 'analytics/story_reflections/events' },
    { supa: 'journey_events',       fire: 'analytics/journey_events/events' },
    { supa: 'journey_feedback',     fire: 'analytics/journey_feedback/events' },
    { supa: 'feature_usage',        fire: 'analytics/feature_usage/events' },
    { supa: 'search_logs',          fire: 'analytics/search_logs/events' },
    { supa: 'search_analytics',     fire: 'analytics/search/events' },
    { supa: 'dna_snapshots',        fire: 'dna_snapshots' },
    { supa: 'recommendation_logs',  fire: 'recommendation_logs' },
    { supa: 'follow_requests',      fire: 'follow_requests' },
    { supa: 'follows',              fire: 'follows' },
    { supa: 'reflections_and_actions', fire: 'reflections_and_actions' },
    { supa: 'daily_story_usage',    fire: 'daily_story_usage' },
    { supa: 'user_daily_quota',     fire: 'user_daily_quota' },
    { supa: 'admin_audit_log',      fire: 'admin_audit_log' },
    { supa: 'notification_history', fire: 'notification_history' },
    { supa: 'push_subscriptions',   fire: 'push_subscriptions' },
    { supa: 'personality_wishlist', fire: 'analytics/personality_wishlist/events' },
    { supa: 'unmatched_searches',   fire: 'analytics/unmatched_searches/events' },
];

console.log('\n\ud83d\udd0d  AYA Migration Audit v2 \u2014 Supabase vs Firebase\n');
console.log('Table'.padEnd(30) + 'Supabase'.padEnd(12) + 'Firestore'.padEnd(12) + 'Status');
console.log('\u2500'.repeat(72));

let missing: string[] = [];
let partial: string[] = [];

for (const m of mapping) {
    const sc = await countSupa(m.supa);
    const fc = await countFire(m.fire);

    let status = '';
    if (sc === 0 && fc === 0) status = '\u2705  Both empty';
    else if (sc === fc) status = '\u2705  Match';
    else if (sc > 0 && fc === 0) { status = '\u274c  MISSING'; missing.push(m.supa); }
    else if (sc === -1) status = '\u26a0\ufe0f  Supa error';
    else if (fc < sc) { status = `\u26a0\ufe0f  Partial`; partial.push(m.supa); }
    else status = `\u2139\ufe0f  Fire has more (${fc} vs ${sc})`;

    const note = m.fire.includes('/') ? ` \u2192 ${m.fire}` : '';
    console.log(
        m.supa.padEnd(30) +
        String(sc === -1 ? '?' : sc).padEnd(12) +
        String(fc).padEnd(12) +
        status + note
    );
}

console.log('\n' + '\u2500'.repeat(72));
if (missing.length === 0 && partial.length === 0) {
    console.log('\u2705  ALL DATA FULLY MIGRATED!\n');
} else {
    if (missing.length) console.log(`\u274c  Missing: ${missing.join(', ')}`);
    if (partial.length) console.log(`\u26a0\ufe0f  Partial: ${partial.join(', ')}`);
    console.log('');
}
