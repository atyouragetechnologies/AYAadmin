/**
 * followService.ts — Firebase Firestore replacement
 *
 * All Supabase queries replaced with Firestore SDK calls via lib/firestore.ts helpers.
 * Identity: Firebase Auth UID is used directly as the user document ID.
 */
import { auth } from '../lib/firebase';
import {
    sendFollowRequest as firestoreSendFollowRequest,
    acceptFollowRequest as firestoreAcceptFollowRequest,
    rejectFollowRequest as firestoreRejectFollowRequest,
    unfollowUser as firestoreUnfollowUser,
    getFollowState,
    getPendingFollowRequests,
    searchUsersByUsername as firestoreSearchUsers,
    followsCol,
    followRequestsCol,
    db,
    query,
    where,
    limit,
    getDocs,
    getDoc,
    doc,
    orderBy,
} from '../lib/firestore';

// ── Error Helper ─────────────────────────────────────────────────────────────

export function formatSupabaseError(error: unknown): string {
    if (!error) return 'Unknown error occurred.';
    if (typeof error === 'string') return error;
    const e = error as any;
    const parts: string[] = [];
    if (e.message) parts.push(e.message);
    if (e.code) parts.push(`(Code: ${e.code})`);
    if (parts.length === 0) {
        try { return JSON.stringify(error); } catch { return String(error); }
    }
    return parts.join(' ');
}

// ── Types ────────────────────────────────────────────────────────────────────

export type FollowRequestStatus = 'pending' | 'accepted' | 'rejected';
export type FollowRelationshipState = 'NONE' | 'REQUEST_SENT' | 'INCOMING_REQUEST' | 'FOLLOWING';

export interface PublicUserProfile {
    id: string;
    username: string;
    name: string;
}

export interface FollowRequest {
    id: string;
    requester_id: string;
    recipient_id: string;
    status: FollowRequestStatus;
    created_at: string;
    responded_at: string | null;
    requester?: PublicUserProfile;
    recipient?: PublicUserProfile;
}

// ── Identity ─────────────────────────────────────────────────────────────────

/** Returns the Firebase UID for the currently signed-in user. */
export async function getMyUserId(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('Auth session missing. Please log out and log back in to use social features.');
    }
    return user.uid;
}

async function requireAuthSession(): Promise<void> {
    await getMyUserId();
}

// ── User Search ───────────────────────────────────────────────────────────────

export async function searchUsersByUsername(queryStr: string): Promise<PublicUserProfile[]> {
    const myUid = auth.currentUser?.uid;
    return firestoreSearchUsers(queryStr, myUid);
}

// ── Follow Requests ───────────────────────────────────────────────────────────

export async function sendFollowRequest(recipientId: string): Promise<void> {
    const myUserId = await getMyUserId();
    await firestoreSendFollowRequest(myUserId, recipientId);
}

export async function getIncomingFollowRequests(): Promise<FollowRequest[]> {
    const myUserId = await getMyUserId();
    const rows = await getPendingFollowRequests(myUserId);

    // Enrich with requester profiles
    const requesterIds = [...new Set(rows.map((r: any) => r.requesterId))];
    const profileMap = new Map<string, PublicUserProfile>();
    await Promise.all(
        requesterIds.map(async (uid) => {
            const snap = await getDoc(doc(db, 'users', uid as string));
            if (snap.exists()) {
                const d = snap.data();
                profileMap.set(uid as string, { id: snap.id, username: d.username ?? '', name: d.name ?? '' });
            }
        })
    );

    return rows.map((r: any) => ({
        id: r.id,
        requester_id: r.requesterId,
        recipient_id: r.recipientId,
        status: r.status as FollowRequestStatus,
        created_at: r.createdAt?.toDate?.()?.toISOString() ?? '',
        responded_at: r.respondedAt?.toDate?.()?.toISOString() ?? null,
        requester: profileMap.get(r.requesterId),
    }));
}

export async function acceptFollowRequest(requestId: string): Promise<void> {
    const myUserId = await getMyUserId();
    await firestoreAcceptFollowRequest(requestId, myUserId);
}

export async function rejectFollowRequest(requestId: string): Promise<void> {
    const myUserId = await getMyUserId();
    await firestoreRejectFollowRequest(requestId, myUserId);
}

export async function cancelFollowRequest(requestId: string): Promise<void> {
    await requireAuthSession();
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'follow_requests', requestId));
}

// ── Follows ───────────────────────────────────────────────────────────────────

export async function unfollowUser(followingId: string): Promise<void> {
    const myUserId = await getMyUserId();
    await firestoreUnfollowUser(myUserId, followingId);
}

export async function getFollowerCount(userId: string): Promise<number> {
    const q = query(followsCol(), where('followingId', '==', userId));
    const snap = await getDocs(q);
    return snap.size;
}

export async function getFollowingCount(userId: string): Promise<number> {
    const q = query(followsCol(), where('followerId', '==', userId));
    const snap = await getDocs(q);
    return snap.size;
}

export async function getOutgoingFollowRequests(): Promise<FollowRequest[]> {
    const myUserId = await getMyUserId();
    const q = query(
        followRequestsCol(),
        where('requesterId', '==', myUserId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const recipientIds = [...new Set(rows.map((r: any) => r.recipientId))];
    const profileMap = new Map<string, PublicUserProfile>();
    await Promise.all(
        recipientIds.map(async (uid) => {
            const s = await getDoc(doc(db, 'users', uid as string));
            if (s.exists()) {
                const d = s.data();
                profileMap.set(uid as string, { id: s.id, username: d.username ?? '', name: d.name ?? '' });
            }
        })
    );

    return rows.map((r: any) => ({
        id: r.id,
        requester_id: r.requesterId,
        recipient_id: r.recipientId,
        status: r.status as FollowRequestStatus,
        created_at: r.createdAt?.toDate?.()?.toISOString() ?? '',
        responded_at: r.respondedAt?.toDate?.()?.toISOString() ?? null,
        recipient: profileMap.get(r.recipientId),
    }));
}

// ── Relationship State ────────────────────────────────────────────────────────

export async function getFollowStatus(
    currentUserIdOrTargetId: string,
    maybeTargetUserId?: string
): Promise<FollowRelationshipState> {
    let currentUserId: string;
    let targetUserId: string;

    if (maybeTargetUserId !== undefined) {
        currentUserId = currentUserIdOrTargetId;
        targetUserId = maybeTargetUserId;
    } else {
        currentUserId = await getMyUserId();
        targetUserId = currentUserIdOrTargetId;
    }

    if (currentUserId === targetUserId) return 'NONE';
    return getFollowState(currentUserId, targetUserId);
}

export async function getIncomingRequestId(targetUserId: string): Promise<string | null> {
    const myUserId = await getMyUserId();
    const q = query(
        followRequestsCol(),
        where('requesterId', '==', targetUserId),
        where('recipientId', '==', myUserId),
        where('status', '==', 'pending'),
        limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : snap.docs[0].id;
}

export async function getOutgoingRequestId(targetUserId: string): Promise<string | null> {
    const myUserId = await getMyUserId();
    const q = query(
        followRequestsCol(),
        where('requesterId', '==', myUserId),
        where('recipientId', '==', targetUserId),
        where('status', '==', 'pending'),
        limit(1)
    );
    const snap = await getDocs(q);
    return snap.empty ? null : snap.docs[0].id;
}