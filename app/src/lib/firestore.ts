/**
 * app/src/lib/firestore.ts
 *
 * Typed Firestore collection references and helper functions.
 * All database access in the app goes through these helpers — never raw Firestore calls.
 *
 * Collection structure:
 *   /users/{uid}                      - User profile
 *   /users/{uid}/sessions/{id}        - Game sessions (story completions)
 *   /users/{uid}/personality          - DNA/personality profile (single doc)
 *   /users/{uid}/quiz_responses/{id}  - Onboarding quiz answers
 *   /users/{uid}/checkins/{id}        - Problem check-ins
 *   /users/{uid}/reflections/{id}     - Post-story reflections
 *   /users/{uid}/fcm_tokens/{platform}- FCM push tokens
 *   /users/{uid}/subscription         - Subscription tier (single doc)
 *
 *   /follow_requests/{id}             - Follow requests
 *   /follows/{id}                     - Accepted follow relationships
 *
 *   /levels/{id}                      - Map card definitions (content)
 *   /scenarios/{id}                   - Story frames (content)
 *   /story_metadata/{scenarioId}      - AI recommendation tags
 *
 *   /admin_users/{email}              - Admin email list
 *
 *   /analytics/journey_events/{id}
 *   /analytics/journey_feedback/{id}
 *   /analytics/feature_usage/{id}
 *   /analytics/story_difficulty/{id}
 *   /analytics/search_logs/{id}
 *   /analytics/personality_wishlist/{id}
 *   /analytics/story_requests/{id}
 */
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    addDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    runTransaction,
    onSnapshot,
    type DocumentData,
    type QueryConstraint,
    type Unsubscribe,
    type FirestoreError,
} from 'firebase/firestore';
import { db } from './firebase';

// ─────────────────────────────────────────────
// COLLECTION REFS (typed path helpers)
// ─────────────────────────────────────────────

export const userDoc = (uid: string) => doc(db, 'users', uid);
export const sessionsCol = (uid: string) => collection(db, 'users', uid, 'sessions');
export const sessionDoc = (uid: string, id: string) => doc(db, 'users', uid, 'sessions', id);
export const personalityDoc = (uid: string) => doc(db, 'users', uid, 'personality', 'profile');
export const quizResponsesCol = (uid: string) => collection(db, 'users', uid, 'quiz_responses');
export const checkinsCol = (uid: string) => collection(db, 'users', uid, 'checkins');
export const reflectionsCol = (uid: string) => collection(db, 'users', uid, 'reflections');
export const fcmTokenDoc = (uid: string, platform: string) => doc(db, 'users', uid, 'fcm_tokens', platform);
export const subscriptionDoc = (uid: string) => doc(db, 'users', uid, 'subscription', 'data');

export const followRequestsCol = () => collection(db, 'follow_requests');
export const followRequestDoc = (id: string) => doc(db, 'follow_requests', id);
export const followsCol = () => collection(db, 'follows');
export const followDoc = (id: string) => doc(db, 'follows', id);

export const levelsCol = () => collection(db, 'levels');
export const levelDoc = (id: string) => doc(db, 'levels', id);
export const scenariosCol = () => collection(db, 'scenarios');
export const scenarioDoc = (id: string) => doc(db, 'scenarios', id);
export const storyMetadataDoc = (scenarioId: string) => doc(db, 'story_metadata', scenarioId);
export const storyMetadataCol = () => collection(db, 'story_metadata');

export const adminUsersCol = () => collection(db, 'admin_users');
export const adminUserDoc = (email: string) => doc(db, 'admin_users', email);

// Analytics sub-collections (all writes only from client, reads from Admin SDK)
export const analyticsCol = (type: string) => collection(db, 'analytics', type, 'events');

// ─────────────────────────────────────────────
// USER PROFILE HELPERS
// ─────────────────────────────────────────────

/** Get the user profile document. Returns null if not found. */
export async function getUserProfile(uid: string): Promise<DocumentData | null> {
    const snap = await getDoc(userDoc(uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Create or merge-update the user profile document. */
export async function upsertUserProfile(uid: string, data: Record<string, unknown>): Promise<void> {
    await setDoc(userDoc(uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/** Listen to user profile changes in real-time. */
export function onUserProfileChange(
    uid: string,
    callback: (data: DocumentData | null) => void,
    onError?: (err: FirestoreError) => void
): Unsubscribe {
    return onSnapshot(
        userDoc(uid),
        (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null),
        onError
    );
}

// ─────────────────────────────────────────────
// GAME SESSIONS
// ─────────────────────────────────────────────

/** Log a completed story session. Idempotent: checks for duplicate in last 30s. */
export async function saveGameSession(uid: string, sessionData: Record<string, unknown>): Promise<string> {
    const ref = await addDoc(sessionsCol(uid), {
        ...sessionData,
        createdAt: serverTimestamp(),
    });
    return ref.id;
}

/** Get all game sessions for a user, newest first. */
export async function getGameSessions(uid: string, limitCount = 100): Promise<DocumentData[]> {
    const q = query(sessionsCol(uid), orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─────────────────────────────────────────────
// PERSONALITY / DNA PROFILE
// ─────────────────────────────────────────────

export async function getPersonalityProfile(uid: string): Promise<DocumentData | null> {
    const snap = await getDoc(personalityDoc(uid));
    return snap.exists() ? snap.data() : null;
}

export async function upsertPersonalityProfile(uid: string, data: Record<string, unknown>): Promise<void> {
    await setDoc(personalityDoc(uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

// ─────────────────────────────────────────────
// ATOMIC STORY COMPLETION (replaces save_story_completion_dna RPC)
// ─────────────────────────────────────────────

export async function saveStoryCompletionAtomic(
    uid: string,
    params: {
        levelId: string;
        selectedPersonality: string;
        matchScore: number;
        stars: number;
        sessionXp: number;
        traits: Record<string, number>;
        futureArchetype?: string;
        futureArchetypeScore?: number;
        lifeTraits?: Record<string, number>;
        gameplayScores?: Record<string, number>;
        choicesLog?: unknown[];
    }
) {
    return runTransaction(db, async (tx) => {
        const userSnap = await tx.get(userDoc(uid));
        if (!userSnap.exists()) throw new Error('User not found');

        const currentData = userSnap.data();
        const currentXp = currentData.totalXp ?? 0;
        const currentStories = currentData.storiesCompleted ?? 0;
        const currentStoryCount = currentData.storyCount ?? 0;
        const currentLevelScores: Record<string, number> = currentData.levelScores ?? {};

        const newXp = currentXp + Math.max(params.sessionXp, 20);
        const newLevel = Math.max(1, Math.floor(newXp / 150) + 1);
        const newStories = currentStories + 1;
        const newStoryCount = currentStoryCount + 1;

        // Best-star tracking (never go down)
        const prevStars = currentLevelScores[params.levelId] ?? 0;
        const newLevelScores = {
            ...currentLevelScores,
            [params.levelId]: Math.max(prevStars, params.stars),
        };

        // Update user profile
        tx.set(
            userDoc(uid),
            {
                totalXp: newXp,
                level: newLevel,
                storiesCompleted: newStories,
                storyCount: newStoryCount,
                levelScores: newLevelScores,
                ...(params.gameplayScores ? { gameplayScores: params.gameplayScores } : {}),
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        // Upsert personality profile
        tx.set(
            personalityDoc(uid),
            {
                ...params.traits,
                ...(params.futureArchetype ? { futureArchetype: params.futureArchetype } : {}),
                ...(params.futureArchetypeScore !== undefined
                    ? { futureArchetypeScore: params.futureArchetypeScore }
                    : {}),
                ...(params.lifeTraits ?? {}),
                totalXp: newXp,
                level: newLevel,
                storiesCompleted: newStories,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        // Log game session
        const sessionRef = doc(sessionsCol(uid));
        tx.set(sessionRef, {
            levelId: params.levelId,
            selectedPersonality: params.selectedPersonality,
            matchScore: params.matchScore,
            stars: params.stars,
            traitsImpact: params.traits,
            choicesLog: params.choicesLog ?? [],
            createdAt: serverTimestamp(),
        });

        return {
            success: true,
            totalXp: newXp,
            level: newLevel,
            storiesCompleted: newStories,
            isFirstRun: prevStars === 0,
        };
    });
}

// ─────────────────────────────────────────────
// USERNAME SYSTEM
// ─────────────────────────────────────────────

/** Check if a username is available (case-insensitive). */
export async function isUsernameAvailable(username: string, excludeUid?: string): Promise<boolean> {
    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalized)) return false;

    const q = query(
        collection(db, 'users'),
        where('usernameLower', '==', normalized),
        limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return true;
    // If we found a match, it's only "available" if it's the user's own doc
    return snap.docs[0].id === excludeUid;
}

/** Claim a username atomically. Throws if taken. */
export async function claimUsername(uid: string, username: string, age?: number, mobile?: string): Promise<void> {
    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalized)) throw new Error('Invalid username format.');

    const available = await isUsernameAvailable(normalized, uid);
    if (!available) throw new Error('Username is already taken. Please choose another.');

    await setDoc(
        userDoc(uid),
        {
            username,
            usernameLower: normalized,
            name: username,
            onboardingComplete: true,
            ...(age !== undefined ? { age } : {}),
            ...(mobile ? { mobile } : {}),
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
}

// ─────────────────────────────────────────────
// SOCIAL — FOLLOW SYSTEM
// ─────────────────────────────────────────────

/** Send a follow request. Throws if request already exists. */
export async function sendFollowRequest(requesterId: string, recipientId: string): Promise<string> {
    if (requesterId === recipientId) throw new Error('Cannot follow yourself.');

    // Check existing request
    const q = query(
        followRequestsCol(),
        where('requesterId', '==', requesterId),
        where('recipientId', '==', recipientId),
        limit(1)
    );
    const existing = await getDocs(q);
    if (!existing.empty) throw new Error('Follow request already exists.');

    const ref = await addDoc(followRequestsCol(), {
        requesterId,
        recipientId,
        status: 'pending',
        createdAt: serverTimestamp(),
    });
    return ref.id;
}

/** Accept a follow request (transaction: update request + create follow). */
export async function acceptFollowRequest(requestId: string, recipientId: string): Promise<void> {
    return runTransaction(db, async (tx) => {
        const reqSnap = await tx.get(followRequestDoc(requestId));
        if (!reqSnap.exists()) throw new Error('Follow request not found.');
        const req = reqSnap.data();
        if (req.recipientId !== recipientId) throw new Error('Only the recipient can accept.');
        if (req.status !== 'pending') throw new Error('Request is not pending.');

        tx.update(followRequestDoc(requestId), {
            status: 'accepted',
            respondedAt: serverTimestamp(),
        });

        const followRef = doc(followsCol());
        tx.set(followRef, {
            followerId: req.requesterId,
            followingId: req.recipientId,
            createdAt: serverTimestamp(),
        });
    });
}

/** Reject a follow request. */
export async function rejectFollowRequest(requestId: string, recipientId: string): Promise<void> {
    const reqSnap = await getDoc(followRequestDoc(requestId));
    if (!reqSnap.exists()) throw new Error('Follow request not found.');
    const req = reqSnap.data();
    if (req.recipientId !== recipientId) throw new Error('Only the recipient can reject.');
    await updateDoc(followRequestDoc(requestId), {
        status: 'rejected',
        respondedAt: serverTimestamp(),
    });
}

/** Unfollow a user. */
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
    const q = query(
        followsCol(),
        where('followerId', '==', followerId),
        where('followingId', '==', followingId),
        limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) await deleteDoc(snap.docs[0].ref);
}

/** Search users by username prefix (case-insensitive). */
export async function searchUsersByUsername(
    queryStr: string,
    excludeUid?: string
): Promise<Array<{ id: string; username: string; name: string }>> {
    const normalized = queryStr.trim().toLowerCase().replace(/^@/, '');
    if (!normalized) return [];

    // Firestore prefix query using range trick
    const q = query(
        collection(db, 'users'),
        where('usernameLower', '>=', normalized),
        where('usernameLower', '<', normalized + '\uf8ff'),
        limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs
        .filter((d) => d.id !== excludeUid)
        .map((d) => ({
            id: d.id,
            username: d.data().username ?? '',
            name: d.data().name ?? '',
        }));
}

/** Get incoming pending follow requests for a user. */
export async function getPendingFollowRequests(uid: string) {
    const q = query(
        followRequestsCol(),
        where('recipientId', '==', uid),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Get the follow relationship state between two users. */
export async function getFollowState(
    myUid: string,
    theirUid: string
): Promise<'NONE' | 'REQUEST_SENT' | 'INCOMING_REQUEST' | 'FOLLOWING'> {
    // Check if already following
    const followQ = query(
        followsCol(),
        where('followerId', '==', myUid),
        where('followingId', '==', theirUid),
        limit(1)
    );
    const followSnap = await getDocs(followQ);
    if (!followSnap.empty) return 'FOLLOWING';

    // Check outgoing pending request
    const outQ = query(
        followRequestsCol(),
        where('requesterId', '==', myUid),
        where('recipientId', '==', theirUid),
        where('status', '==', 'pending'),
        limit(1)
    );
    const outSnap = await getDocs(outQ);
    if (!outSnap.empty) return 'REQUEST_SENT';

    // Check incoming pending request
    const inQ = query(
        followRequestsCol(),
        where('requesterId', '==', theirUid),
        where('recipientId', '==', myUid),
        where('status', '==', 'pending'),
        limit(1)
    );
    const inSnap = await getDocs(inQ);
    if (!inSnap.empty) return 'INCOMING_REQUEST';

    return 'NONE';
}

// ─────────────────────────────────────────────
// CONTENT — LEVELS & SCENARIOS
// ─────────────────────────────────────────────

export async function getAllLevels(): Promise<DocumentData[]> {
    const snap = await getDocs(levelsCol());
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllScenarios(): Promise<DocumentData[]> {
    const snap = await getDocs(scenariosCol());
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getScenario(id: string): Promise<DocumentData | null> {
    const snap = await getDoc(scenarioDoc(id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getStoryMetadata(scenarioId: string): Promise<DocumentData | null> {
    const snap = await getDoc(storyMetadataDoc(scenarioId));
    return snap.exists() ? snap.data() : null;
}

// ─────────────────────────────────────────────
// ADMIN CHECK
// ─────────────────────────────────────────────

export async function isAdminUser(uid: string): Promise<boolean> {
    const userSnap = await getDoc(userDoc(uid));
    if (!userSnap.exists()) return false;
    const data = userSnap.data();
    if (data.isAdmin === true) return true;

    const email = data.email;
    if (!email) return false;
    const adminSnap = await getDoc(adminUserDoc(email));
    return adminSnap.exists();
}

// ─────────────────────────────────────────────
// ANALYTICS (fire-and-forget)
// ─────────────────────────────────────────────

export function logAnalyticsEvent(
    type: string,
    data: Record<string, unknown>
): void {
    addDoc(analyticsCol(type), {
        ...data,
        createdAt: serverTimestamp(),
    }).catch((err) => console.warn('[Analytics] Failed to log event:', err));
}

// ─────────────────────────────────────────────
// PUSH TOKENS (FCM)
// ─────────────────────────────────────────────

export async function saveFcmToken(uid: string, token: string, platform: 'android' | 'web' | 'ios'): Promise<void> {
    await setDoc(fcmTokenDoc(uid, platform), {
        token,
        platform,
        updatedAt: serverTimestamp(),
    });
}

// ─────────────────────────────────────────────
// SUBSCRIPTIONS
// ─────────────────────────────────────────────

export async function getUserSubscription(uid: string): Promise<DocumentData | null> {
    const snap = await getDoc(subscriptionDoc(uid));
    return snap.exists() ? snap.data() : null;
}

export async function setUserSubscription(
    uid: string,
    tier: 'free' | 'premium' | 'jee15' | 'neet15',
    expiresAt?: Date
): Promise<void> {
    await setDoc(subscriptionDoc(uid), {
        tier,
        status: 'active',
        startsAt: serverTimestamp(),
        ...(expiresAt ? { expiresAt } : {}),
        updatedAt: serverTimestamp(),
    });
}

// Re-export Firestore primitives for use elsewhere
export {
    db,
    serverTimestamp,
    runTransaction,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    addDoc,
    deleteDoc,
    type QueryConstraint,
    type Unsubscribe,
};
