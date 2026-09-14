/**
 * useFollow.ts
 *
 * Lightweight React hook that manages the follow relationship state
 * between the current user and a specific target user.
 *
 * Fetches from Supabase on mount and after each action.
 * Does NOT persist state globally — avoids bloating the Zustand store.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  type FollowRelationshipState,
  getFollowStatus,
  getMyUserId,
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  cancelFollowRequest,
  unfollowUser,
  getIncomingRequestId,
  getOutgoingRequestId,
  formatSupabaseError,
} from '../services/followService';

interface UseFollowReturn {
  /** Current relationship state from the current user's perspective */
  status: FollowRelationshipState;
  /** True while fetching or mutating */
  loading: boolean;
  /** Error message if the last action failed */
  error: string | null;
  /** Send a follow request to targetUserId */
  sendRequest: () => Promise<void>;
  /** Accept the incoming request from targetUserId */
  acceptRequest: () => Promise<void>;
  /** Reject the incoming request from targetUserId */
  rejectRequest: () => Promise<void>;
  /** Cancel the outgoing request to targetUserId */
  cancelRequest: () => Promise<void>;
  /** Unfollow targetUserId */
  unfollow: () => Promise<void>;
  /** Manually refresh the status */
  refresh: () => Promise<void>;
}

/**
 * @param currentUserId  Optional logged-in user's UUID (will be dynamically resolved if omitted)
 * @param targetUserId   The UUID of the user being viewed
 */
export function useFollow(
  currentUserId: string | null | undefined,
  targetUserId: string | null | undefined
): UseFollowReturn {
  const [status, setStatus] = useState<FollowRelationshipState>('NONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = Boolean(currentUserId && targetUserId && currentUserId === targetUserId);

  const fetchStatus = useCallback(async () => {
    if (!targetUserId || isSelf) return;
    setLoading(true);
    try {
      const activeId = currentUserId || (await getMyUserId().catch(() => null));
      console.log('[useFollow:diagnostic] fetchStatus activeId:', activeId, 'targetUserId:', targetUserId, '(currentUserId prop:', currentUserId, ')');
      if (!activeId || activeId === targetUserId) {
        setStatus('NONE');
        return;
      }
      const s = await getFollowStatus(activeId, targetUserId);
      setStatus(s);
      setError(null);
    } catch (err: unknown) {
      const msg = formatSupabaseError(err);
      console.error('[useFollow:diagnostic] fetchStatus error:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, targetUserId, isSelf]);

  // Fetch on mount and when either user ID changes
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const sendRequest = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    setError(null);
    try {
      await sendFollowRequest(targetUserId);
      const activeId = currentUserId || (await getMyUserId().catch(() => null));
      if (activeId) {
        const verified = await getFollowStatus(activeId, targetUserId);
        setStatus(verified === 'REQUEST_SENT' ? 'REQUEST_SENT' : verified);
      } else {
        setStatus('REQUEST_SENT');
      }
    } catch (err: unknown) {
      const msg = formatSupabaseError(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, targetUserId]);

  const acceptRequest = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    setError(null);
    try {
      const requestId = await getIncomingRequestId(targetUserId);
      if (!requestId) throw new Error('No pending incoming request found');
      await acceptFollowRequest(requestId);
      setStatus('FOLLOWING');
    } catch (err: unknown) {
      const msg = formatSupabaseError(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  const rejectRequest = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    setError(null);
    try {
      const requestId = await getIncomingRequestId(targetUserId);
      if (!requestId) throw new Error('No pending incoming request found');
      await rejectFollowRequest(requestId);
      setStatus('NONE');
    } catch (err: unknown) {
      const msg = formatSupabaseError(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  const cancelRequest = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    setError(null);
    try {
      const requestId = await getOutgoingRequestId(targetUserId);
      if (!requestId) throw new Error('No pending outgoing request found');
      await cancelFollowRequest(requestId);
      setStatus('NONE');
    } catch (err: unknown) {
      const msg = formatSupabaseError(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  const unfollow = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    setError(null);
    try {
      await unfollowUser(targetUserId);
      setStatus('NONE');
    } catch (err: unknown) {
      const msg = formatSupabaseError(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  return {
    status,
    loading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    unfollow,
    refresh: fetchStatus,
  };
}
