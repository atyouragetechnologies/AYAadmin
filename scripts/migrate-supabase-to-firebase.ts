/**
 * scripts/migrate-supabase-to-firebase.ts
 *
 * ONE-SHOT data migration script.
 * Reads ALL data from Supabase PostgreSQL → writes to Firebase Firestore.
 *
 * Run with:
 *   npx ts-node --esm scripts/migrate-supabase-to-firebase.ts
 *   OR
 *   bun run scripts/migrate-supabase-to-firebase.ts
 *
 * ⚠️  Prerequisites:
 *   1. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in env
 *   2. Set FIREBASE_PROJECT_ID in env
 *   3. Place serviceAccountKey.json in the repo root
 *   4. Run ONCE against production Supabase
 *   5. Verify counts in Firebase console before switching over
 *
 * ⚠️  This script does NOT delete Supabase data. It is safe to run multiple times
 *      (it uses setDoc with merge so existing Firebase docs are updated, not duplicated).
 */

import { createClient } from '@supabase/supabase-js';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hstddacoqsmztmbvvhhr.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// Try several common locations for the service account key
const SERVICE_ACCOUNT_CANDIDATES = [
    resolve(process.cwd(), 'serviceAccountKey.json'),
    resolve(process.cwd(), 'scripts', 'serviceAccountKey.json'),
    resolve(process.cwd(), '..', 'serviceAccountKey.json'),
];
const SERVICE_ACCOUNT_PATH = SERVICE_ACCOUNT_CANDIDATES.find(p => existsSync(p) && readFileSync(p, 'utf-8').trim().length > 2);

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌  SUPABASE_SERVICE_ROLE_KEY not set in environment.');
    process.exit(1);
}

// ─────────────────────────────────────────────
// CLIENTS
// ─────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

let serviceAccount: Parameters<typeof cert>[0];
if (!SERVICE_ACCOUNT_PATH) {
    console.error('❌  serviceAccountKey.json not found or is empty.');
    console.error('    Candidates checked:', SERVICE_ACCOUNT_CANDIDATES.join(', '));
    console.error('    Download it: Firebase Console → Project Settings → Service accounts → Generate new private key');
    process.exit(1);
}
try {
    serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
} catch (e) {
    console.error(`❌  Could not parse ${SERVICE_ACCOUNT_PATH}:`, e);
    process.exit(1);
}

if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
}
const db: Firestore = getFirestore();

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const BATCH_SIZE = 400; // Firestore batch limit is 500 writes
let batchCount = 0;
let totalWrites = 0;

async function commitBatch(batch: admin.firestore.WriteBatch) {
    await batch.commit();
    batchCount++;
    console.log(`  ✓ Committed batch #${batchCount} (${totalWrites} total writes so far)`);
}

/** Fetch all rows from a Supabase table using pagination (no 1000-row limit). */
async function fetchAll(table: string, select = '*'): Promise<any[]> {
    const rows: any[] = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from(table)
            .select(select)
            .range(from, from + pageSize - 1);

        if (error) {
            console.warn(`  ⚠ Error fetching ${table}[${from}..${from + pageSize}]: ${error.message}`);
            break;
        }
        if (!data || data.length === 0) break;

        rows.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
    }

    return rows;
}

/** Remove null/undefined from an object (Firestore doesn't like undefined). */
function clean(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
    );
}

function ts(isoString: string | null | undefined): Timestamp | null {
    if (!isoString) return null;
    try { return Timestamp.fromDate(new Date(isoString)); }
    catch { return null; }
}

// ─────────────────────────────────────────────
// MIGRATION FUNCTIONS
// ─────────────────────────────────────────────

async function migrateUsers() {
    console.log('\n📦  Migrating users...');
    const rows = await fetchAll('users');
    console.log(`  Found ${rows.length} users in Supabase`);

    let batch = db.batch();
    let count = 0;

    for (const u of rows) {
        if (!u.auth_user_id) {
            console.warn(`  ⚠ Skipping user ${u.id} — no auth_user_id (cannot map to Firebase UID)`);
            continue;
        }

        const uid = u.auth_user_id; // Firebase UID = Supabase auth_user_id
        const docRef = db.collection('users').doc(uid);

        batch.set(docRef, clean({
            // Identity
            supabaseId: u.id,             // Keep for cross-reference
            mobile: u.mobile,
            email: u.email,
            username: u.username,
            usernameLower: u.username?.toLowerCase() ?? null,
            name: u.name,
            age: u.age,
            isAdmin: u.is_admin ?? false,
            status: u.status ?? 'active',

            // Access
            accessType: u.access_type ?? 'free',
            accessStartDate: u.access_start_date ?? null,

            // Preferences
            preferredTheme: u.preferred_theme ?? 'city_dark',
            preferredMap: u.preferred_map ?? null,

            // Progression
            totalXp: u.total_xp ?? 0,
            level: u.level ?? 1,
            storiesCompleted: u.stories_completed ?? 0,
            storyCount: u.story_count ?? 0,
            currentStreak: u.current_streak ?? 0,
            longestStreak: u.longest_streak ?? 0,
            lastActiveDate: u.last_active_date ?? null,
            levelScores: u.level_scores ?? {},

            // Daily
            dailyFreeStories: u.daily_free_stories ?? 0,
            lastStoryDate: u.last_story_date ?? null,
            dailyChallengeCompleted: u.daily_challenge_completed ?? false,
            dailyChallengePersonality: u.daily_challenge_personality ?? null,

            // Onboarding / Assessment
            onboardingComplete: u.onboarding_complete ?? false,
            assessmentCompleted: u.assessment_completed ?? false,
            onboardingScores: u.onboarding_scores ?? null,
            gameplayScores: u.gameplay_scores ?? null,

            // Audio
            musicVolume: u.music_volume ?? null,
            sfxVolume: u.sfx_volume ?? null,
            isMusicMuted: u.is_music_muted ?? false,
            isSfxMuted: u.is_sfx_muted ?? false,

            // Timestamps
            createdAt: ts(u.created_at),
            deletedAt: ts(u.deleted_at),
        }), { merge: true });

        count++;
        totalWrites++;

        if (totalWrites % BATCH_SIZE === 0) {
            await commitBatch(batch);
            batch = db.batch();
        }
    }

    if (count % BATCH_SIZE !== 0) await commitBatch(batch);
    console.log(`  ✅  Migrated ${count} users`);
    return rows; // Return for sub-collection mapping
}

async function migratePersonalityProfiles(users: any[]) {
    console.log('\n📦  Migrating personality_profiles...');
    const rows = await fetchAll('personality_profiles');
    console.log(`  Found ${rows.length} personality profiles`);

    // Build uid lookup: supabase user id → firebase uid
    const uidMap = new Map<string, string>();
    for (const u of users) {
        if (u.auth_user_id && u.id) uidMap.set(u.id, u.auth_user_id);
    }

    let batch = db.batch();
    let count = 0;

    for (const p of rows) {
        const uid = uidMap.get(p.user_id);
        if (!uid) { console.warn(`  ⚠ Skipping personality for user ${p.user_id} — no firebase uid`); continue; }

        const docRef = db.collection('users').doc(uid).collection('personality').doc('profile');
        batch.set(docRef, clean({
            traitRiskTaker: p.trait_risk_taker ?? 50,
            traitCreative: p.trait_creative ?? 50,
            traitAnalytical: p.trait_analytical ?? 50,
            traitSocial: p.trait_social ?? 50,
            traitAmbitious: p.trait_ambitious ?? 50,
            futureArchetype: p.future_archetype ?? null,
            futureArchetypeScore: p.future_archetype_score ?? null,
            lifeResilience: p.life_resilience ?? 50,
            lifeDiscipline: p.life_discipline ?? 50,
            lifeCourage: p.life_courage ?? 50,
            lifeCreativity: p.life_creativity ?? 50,
            lifeEmotionalControl: p.life_emotional_control ?? 50,
            lifeLeadership: p.life_leadership ?? 50,
            lifeRiskIntelligence: p.life_risk_intelligence ?? 50,
            lifeConsistency: p.life_consistency ?? 50,
            totalXp: p.total_xp ?? 0,
            level: p.level ?? 1,
            storiesCompleted: p.stories_completed ?? 0,
            interestGoal: p.interest_goal ?? null,
            interestStruggle: p.interest_struggle ?? null,
            interestDomain: p.interest_domain ?? null,
            createdAt: ts(p.created_at),
        }), { merge: true });

        count++;
        totalWrites++;
        if (totalWrites % BATCH_SIZE === 0) { await commitBatch(batch); batch = db.batch(); }
    }

    if (count % BATCH_SIZE !== 0) await commitBatch(batch);
    console.log(`  ✅  Migrated ${count} personality profiles`);
}

async function migrateGameSessions(users: any[]) {
    console.log('\n📦  Migrating game_sessions...');
    const rows = await fetchAll('game_sessions');
    console.log(`  Found ${rows.length} game sessions`);

    const uidMap = new Map<string, string>();
    for (const u of users) { if (u.auth_user_id && u.id) uidMap.set(u.id, u.auth_user_id); }

    let batch = db.batch();
    let count = 0;

    for (const s of rows) {
        const uid = uidMap.get(s.user_id);
        if (!uid) continue;

        const docRef = db.collection('users').doc(uid).collection('sessions').doc(s.id);
        batch.set(docRef, clean({
            scenarioId: s.scenario_id ?? null,
            levelId: s.level_id ?? null,
            selectedPersonality: s.selected_personality ?? null,
            matchScore: s.match_score ?? null,
            stars: s.stars ?? 0,
            score: s.score ?? null,
            feedback: s.feedback ?? null,
            traitsImpact: s.traits_impact ?? null,
            choicesLog: s.choices_log ?? null,
            createdAt: ts(s.created_at),
        }), { merge: true });

        count++;
        totalWrites++;
        if (totalWrites % BATCH_SIZE === 0) { await commitBatch(batch); batch = db.batch(); }
    }

    if (count % BATCH_SIZE !== 0) await commitBatch(batch);
    console.log(`  ✅  Migrated ${count} game sessions`);
}

async function migrateFollowSystem() {
    console.log('\n📦  Migrating follow_requests & follows...');

    // Fetch users to build mobile → uid map (follow_requests uses public.users.id not auth_user_id)
    const users = await fetchAll('users');
    const appIdToAuthUid = new Map<string, string>();
    for (const u of users) { if (u.auth_user_id && u.id) appIdToAuthUid.set(u.id, u.auth_user_id); }

    // Follow Requests
    const requests = await fetchAll('follow_requests');
    let batch = db.batch();
    let count = 0;
    for (const r of requests) {
        const requesterId = appIdToAuthUid.get(r.requester_id);
        const recipientId = appIdToAuthUid.get(r.recipient_id);
        if (!requesterId || !recipientId) continue;

        const docRef = db.collection('follow_requests').doc(r.id);
        batch.set(docRef, clean({
            requesterId,
            recipientId,
            status: r.status ?? 'pending',
            createdAt: ts(r.created_at),
            respondedAt: ts(r.responded_at),
        }), { merge: true });

        count++;
        totalWrites++;
        if (totalWrites % BATCH_SIZE === 0) { await commitBatch(batch); batch = db.batch(); }
    }
    if (count % BATCH_SIZE !== 0) await commitBatch(batch);
    console.log(`  ✅  Migrated ${count} follow requests`);

    // Follows
    const follows = await fetchAll('follows');
    batch = db.batch();
    count = 0;
    for (const f of follows) {
        const followerId = appIdToAuthUid.get(f.follower_id);
        const followingId = appIdToAuthUid.get(f.following_id);
        if (!followerId || !followingId) continue;

        const docRef = db.collection('follows').doc(f.id);
        batch.set(docRef, clean({
            followerId,
            followingId,
            createdAt: ts(f.created_at),
        }), { merge: true });

        count++;
        totalWrites++;
        if (totalWrites % BATCH_SIZE === 0) { await commitBatch(batch); batch = db.batch(); }
    }
    if (count % BATCH_SIZE !== 0) await commitBatch(batch);
    console.log(`  ✅  Migrated ${count} follows`);
}

async function migrateContent() {
    console.log('\n📦  Migrating levels & scenarios...');

    // Levels
    const levels = await fetchAll('levels');
    let batch = db.batch();
    let count = 0;
    for (const l of levels) {
        const docRef = db.collection('levels').doc(l.id);
        batch.set(docRef, clean({
            dayNumber: l.day_number ?? null,
            title: l.title ?? null,
            description: l.description ?? null,
            personality: l.personality ?? null,
            requiredStars: l.required_stars ?? 0,
            year: l.year ?? null,
            age: l.age ?? null,
            theme: l.theme ?? null,
            archetype: l.archetype ?? null,
            bio: l.bio ?? null,
            fame: l.fame ?? null,
            achievements: l.achievements ?? null,
            lesson: l.lesson ?? null,
            avatarUrl: l.avatar_url ?? null,
            scenarioId: l.scenario_id ?? null,
            idolTraits: l.idol_traits ?? null,
            status: l.status ?? null,
            isLocked: l.is_locked ?? false,
            stars: l.stars ?? 0,
            part1: l.part1 ?? null,
            part2: l.part2 ?? null,
            placeholder: l.placeholder ?? false,
            createdAt: ts(l.created_at),
        }), { merge: true });

        count++;
        totalWrites++;
        if (totalWrites % BATCH_SIZE === 0) { await commitBatch(batch); batch = db.batch(); }
    }
    if (count % BATCH_SIZE !== 0) await commitBatch(batch);
    console.log(`  ✅  Migrated ${count} levels`);

    // Scenarios
    const scenarios = await fetchAll('scenarios');
    batch = db.batch();
    count = 0;
    for (const s of scenarios) {
        const docRef = db.collection('scenarios').doc(s.id);
        batch.set(docRef, clean({
            title: s.title ?? null,
            source: s.source ?? null,
            frames: s.frames ?? null,
            createdAt: ts(s.created_at),
        }), { merge: true });

        count++;
        totalWrites++;
        if (totalWrites % BATCH_SIZE === 0) { await commitBatch(batch); batch = db.batch(); }
    }
    if (count % BATCH_SIZE !== 0) await commitBatch(batch);
    console.log(`  ✅  Migrated ${count} scenarios`);
}

async function migrateStoryMetadata() {
    console.log('\n📦  Migrating story_metadata...');
    const rows = await fetchAll('story_metadata');
    let batch = db.batch();
    let count = 0;
    for (const m of rows) {
        // Supabase old schema uses 'story_id', new schema uses 'scenario_id'
        const docId = (m.scenario_id || m.story_id || '').toString().trim();
        if (!docId) { console.warn(`  ⚠️  Skipping story_metadata row with empty id`); continue; }
        const docRef = db.collection('story_metadata').doc(docId);
        batch.set(docRef, clean({
            storyId: docId,
            dilemmaType: m.dilemma_type ?? m.resolution_archetype ?? null,
            lifeTheme: m.life_theme ?? null,
            situationalTags: m.situational_tags ?? m.situation_tags ?? [],
            problemTags: m.problem_tags ?? [],
            emotionalTags: m.emotional_tags ?? [],
            intentTags: m.intent_tags ?? [],
            lifeStageTags: m.life_stage_tags ?? [],
            lessonTags: m.lesson_tags ?? [],
            protagonistLens: m.protagonist_lens ?? null,
            reflectionPrompt: m.reflection_prompt ?? m.why_this_story_template ?? null,
            microActionPrompt: m.micro_action_prompt ?? null,
            isPremium: m.is_premium ?? false,
            difficulty: m.difficulty ?? 'moderate',
            targetTraits: m.target_traits ?? m.trait_affinity ?? {},
            dominantTrait: m.dominant_trait ?? null,
            semanticDescription: m.semantic_description ?? null,
            era: m.era ?? null,
            ageMin: m.age_min ?? null,
            ageMax: m.age_max ?? null,
            createdAt: ts(m.created_at),
        }), { merge: true });

        count++;
        totalWrites++;
        if (totalWrites % BATCH_SIZE === 0) { await commitBatch(batch); batch = db.batch(); }
    }
    if (count % BATCH_SIZE !== 0) await commitBatch(batch);
    console.log(`  ✅  Migrated ${count} story metadata records`);
}

async function migrateAdminUsers() {
    console.log('\n📦  Migrating admin_users...');
    const rows = await fetchAll('admin_users');
    let batch = db.batch();
    let count = 0;
    for (const a of rows) {
        if (!a.email) continue;
        const docRef = db.collection('admin_users').doc(a.email);
        batch.set(docRef, { email: a.email, createdAt: ts(a.created_at) }, { merge: true });
        count++;
        totalWrites++;
        if (totalWrites % BATCH_SIZE === 0) { await commitBatch(batch); batch = db.batch(); }
    }
    if (count % BATCH_SIZE !== 0) await commitBatch(batch);
    console.log(`  ✅  Migrated ${count} admin users`);
}

async function migrateAnalytics() {
    const analyticsMap: [string, string, (r: any) => Record<string, any>][] = [
        ['journey_events', 'journey_events', (r) => ({
            userId: r.user_id ?? null, journeyId: r.journey_id, eventType: r.event_type,
            eventData: r.event_data ?? {}, createdAt: ts(r.created_at),
        })],
        ['journey_feedback', 'journey_feedback', (r) => ({
            userId: r.user_id ?? null, journeyId: r.journey_id, sentimentScore: r.sentiment_score,
            emoji: r.emoji ?? null, sessionDurationSeconds: r.session_duration_seconds ?? null,
            createdAt: ts(r.created_at),
        })],
        ['feature_usage', 'feature_usage', (r) => ({
            userId: r.user_id ?? null, featureName: r.feature_name, sessionId: r.session_id ?? null,
            accessedAt: ts(r.accessed_at),
        })],
        ['story_difficulty_feedback', 'story_difficulty', (r) => ({
            userId: r.user_id ?? null, journeyId: r.journey_id, difficultyRating: r.difficulty_rating,
            part: r.part ?? 1, createdAt: ts(r.created_at),
        })],
        ['personality_wishlist', 'personality_wishlist', (r) => ({
            userId: r.user_id ?? null, personalityName: r.personality_name, voteCount: r.vote_count ?? 1,
            requestedAt: ts(r.requested_at),
        })],
        ['search_logs', 'search_logs', (r) => ({
            query: r.query, queryOriginal: r.query_original ?? null, matched: r.matched ?? false,
            createdAt: ts(r.created_at),
        })],
        ['unmatched_searches', 'unmatched_searches', (r) => ({
            searchQuery: r.search_query ?? r.query ?? null,
            userId: r.user_id ?? null,
            createdAt: ts(r.created_at),
        })],
        ['story_reflections', 'story_reflections', (r) => ({
            userId: r.user_id ?? null, storyId: r.story_id ?? null,
            reflectionText: r.reflection_text ?? null,
            selectedChips: r.selected_chips ?? [],
            moodBefore: r.mood_before ?? null, moodAfter: r.mood_after ?? null,
            didHelp: r.did_help ?? null, wasRelevant: r.was_relevant ?? null,
            createdAt: ts(r.created_at),
        })],
    ];

    for (const [table, colName, mapper] of analyticsMap) {
        console.log(`\n📦  Migrating ${table}...`);
        const rows = await fetchAll(table);
        let batch = db.batch();
        let count = 0;

        for (const r of rows) {
            const docRef = db.collection('analytics').doc(colName).collection('events').doc(r.id);
            batch.set(docRef, clean(mapper(r)), { merge: true });
            count++;
            totalWrites++;
            if (totalWrites % BATCH_SIZE === 0) { await commitBatch(batch); batch = db.batch(); }
        }

        if (count % BATCH_SIZE !== 0) await commitBatch(batch);
        console.log(`  ✅  Migrated ${count} ${table} records`);
    }

    // Migrate story_tags (large — flat collection with composite docId)
    console.log('\n📦  Migrating story_tags...');
    const tagRows = await fetchAll('story_tags');
    let tagBatch = db.batch();
    let tagCount = 0;
    for (const t of tagRows) {
        const docId = `${t.story_id}___${(t.tag_name || '').replace(/[^a-zA-Z0-9]/g, '_')}`;
        if (!docId.trim() || docId.startsWith('___')) { continue; }
        const docRef = db.collection('story_tags').doc(docId);
        tagBatch.set(docRef, clean({
            storyId: t.story_id ?? null, tagName: t.tag_name ?? null, weight: t.weight ?? 1,
        }), { merge: true });
        tagCount++;
        totalWrites++;
        if (totalWrites % BATCH_SIZE === 0) { await commitBatch(tagBatch); tagBatch = db.batch(); }
    }
    if (tagCount % BATCH_SIZE !== 0) await commitBatch(tagBatch);
    console.log(`  ✅  Migrated ${tagCount} story_tags records`);

    // Migrate notification_history (top-level collection)
    console.log('\n📦  Migrating notification_history...');
    const notifRows = await fetchAll('notification_history');
    let notifBatch = db.batch();
    let notifCount = 0;
    for (const n of notifRows) {
        const docRef = db.collection('notification_history').doc(n.id);
        notifBatch.set(docRef, clean({
            title: n.title ?? null, body: n.body ?? null,
            targetPlatform: n.target_platform ?? null,
            sentCount: n.sent_count ?? 0, successCount: n.success_count ?? 0,
            failureCount: n.failure_count ?? 0,
            sentAt: ts(n.sent_at),
        }), { merge: true });
        notifCount++;
        totalWrites++;
        if (totalWrites % BATCH_SIZE === 0) { await commitBatch(notifBatch); notifBatch = db.batch(); }
    }
    if (notifCount % BATCH_SIZE !== 0) await commitBatch(notifBatch);
    console.log(`  ✅  Migrated ${notifCount} notification_history records`);

    // Migrate push_subscriptions
    console.log('\n📦  Migrating push_subscriptions...');
    const subRows = await fetchAll('push_subscriptions');
    let subBatch = db.batch();
    let subCount = 0;
    for (const s of subRows) {
        const docRef = db.collection('push_subscriptions').doc(s.id);
        subBatch.set(docRef, clean({
            userId: s.user_id ?? null, subscription: s.subscription ?? null,
            createdAt: ts(s.created_at),
        }), { merge: true });
        subCount++;
        totalWrites++;
        if (totalWrites % BATCH_SIZE === 0) { await commitBatch(subBatch); subBatch = db.batch(); }
    }
    if (subCount % BATCH_SIZE !== 0) await commitBatch(subBatch);
    console.log(`  ✅  Migrated ${subCount} push_subscriptions records`);
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

async function main() {
    console.log('🚀  AYA: Supabase → Firebase Migration');
    console.log('======================================');
    console.log(`Supabase:  ${SUPABASE_URL}`);
    console.log(`Firebase:  ${(serviceAccount as any).project_id}`);
    console.log('');
    console.log('⚠️  This script is READ-ONLY from Supabase and WRITE to Firestore.');
    console.log('    Your Supabase data will NOT be modified.');
    console.log('');

    const startTime = Date.now();

    const users = await migrateUsers();
    await migratePersonalityProfiles(users);
    await migrateGameSessions(users);
    await migrateFollowSystem();
    await migrateContent();
    await migrateStoryMetadata();
    await migrateAdminUsers();
    await migrateAnalytics();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n======================================');
    console.log(`✅  Migration complete!`);
    console.log(`    Total Firestore writes: ${totalWrites}`);
    console.log(`    Total batches committed: ${batchCount}`);
    console.log(`    Time elapsed: ${elapsed}s`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Verify data in Firebase Console: https://console.firebase.google.com/project/atyourage-e78ff/firestore');
    console.log('  2. Download serviceAccountKey.json and place it in repo root');
    console.log('  3. Test auth flow in the app with VITE_FIREBASE_PROJECT_ID set');
    console.log('  4. Deploy Firestore rules: firebase deploy --only firestore:rules');
    console.log('  5. Deploy Firestore indexes: firebase deploy --only firestore:indexes');
}

main().catch((err) => {
    console.error('\n❌  Migration failed:', err);
    process.exit(1);
});
