/**
 * SocialPage.tsx
 *
 * Two-tab social hub integrated into the AYA game shell:
 *   • "Search" – find users by @username, see relationship state, act on it
 *   • "Requests" – incoming pending follow requests with Accept / Reject
 *
 * Uses the existing AYA dark-neon design language.
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  Search,
  Users,
  Bell,
  UserCheck,
  UserX,
  UserPlus,
  Loader2,
  X,
} from 'lucide-react';

import clsx from 'clsx';

import { useUserStore } from '../store/userStore';
import { audioManager as audioSynth } from '../utils/audioManager';
import { Skeleton } from '../components/ui/Skeleton';

import {
  getMyUserId,
  searchUsersByUsername,
  getIncomingFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest,
  getFollowStatus,
  sendFollowRequest,
  cancelFollowRequest,
  getOutgoingRequestId,
  getIncomingRequestId,
  unfollowUser,
  getFollowerCount,
  getFollowingCount,
  formatSupabaseError,
  type PublicUserProfile,
  type FollowRequest,
  type FollowRelationshipState,
} from '../services/followService';

// ── Follow Button ─────────────────────────────────────────────────────────────

interface FollowButtonProps {
  status: FollowRelationshipState;
  loading: boolean;
  onSend: () => void;
  onCancel: () => void;
  onAccept: () => void;
  onReject: () => void;
  onUnfollow: () => void;
}

function FollowButton({
  status,
  loading,
  onSend,
  onCancel,
  onAccept,
  onReject,
  onUnfollow,
}: FollowButtonProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center w-9 h-9">
        <Loader2
          size={16}
          className="text-[#00f2ff] animate-spin"
        />
      </div>
    );
  }

  switch (status) {
    case 'FOLLOWING':
      return (
        <button
          onClick={onUnfollow}
          title="Unfollow"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 bg-emerald-900/40 border border-emerald-500/40 text-emerald-400 hover:bg-red-900/40 hover:border-red-500/40 hover:text-red-400"
        >
          <UserCheck size={13} />
          <span>Following</span>
        </button>
      );

    case 'REQUEST_SENT':
      return (
        <button
          onClick={onCancel}
          title="Cancel request"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 bg-slate-700/60 border border-slate-500/40 text-slate-400 hover:bg-red-900/30 hover:border-red-500/30 hover:text-red-400"
        >
          <X size={13} />
          <span>Requested</span>
        </button>
      );

    case 'INCOMING_REQUEST':
      return (
        <div className="flex gap-1.5">
          <button
            onClick={onAccept}
            title="Accept"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 bg-[#00f2ff]/20 border border-[#00f2ff]/40 text-[#00f2ff] hover:bg-[#00f2ff]/30"
          >
            <UserCheck size={13} />
            <span>Accept</span>
          </button>

          <button
            onClick={onReject}
            title="Reject"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-900/50"
          >
            <UserX size={13} />
          </button>
        </div>
      );

    case 'NONE':
    default:
      return (
        <button
          onClick={onSend}
          title="Send follow request"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] hover:bg-[#00f2ff]/20 hover:border-[#00f2ff]/60 hover:scale-105"
        >
          <UserPlus size={13} />
          <span>Follow</span>
        </button>
      );
  }
}

// ── Main Social Page ──────────────────────────────────────────────────────────

type Tab = 'search' | 'requests';

interface SearchResult extends PublicUserProfile {
  status: FollowRelationshipState;
  actionLoading: boolean;
}

export function SocialPage() {
  const navigate = useNavigate();

  const profile = useUserStore(
    (state) => state.profile
  );

  const [activeTab, setActiveTab] =
    useState<Tab>('search');

  // Search state
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] =
    useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] =
    useState(false);
  const [searchError, setSearchError] =
    useState<string | null>(null);

  const debounceRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  // Requests state
  const [incomingRequests, setIncomingRequests] =
    useState<FollowRequest[]>([]);

  const [requestsLoading, setRequestsLoading] =
    useState(false);

  const [requestsError, setRequestsError] =
    useState<string | null>(null);

  // Follower/following counts
  const [followerCount, setFollowerCount] =
    useState<number>(0);

  const [followingCount, setFollowingCount] =
    useState<number>(0);

  // Diagnostic: Log profile state on render/mount
  useEffect(() => {
    console.log('[SocialPage:diagnostic] 4. profile.id from useUserStore:', profile?.id ?? 'null/undefined', {
      username: profile?.username,
      name: profile?.name,
      mobile: profile?.mobile,
      email: profile?.email
    });
  }, [profile]);

  // Helper to ensure active user ID
  const getActiveUserId = useCallback(async (): Promise<string | null> => {
    try {
      const resolved = await getMyUserId();
      console.log('[SocialPage:diagnostic] getActiveUserId resolved:', resolved, '(store profile.id was:', profile?.id, ')');
      return resolved;
    } catch (err) {
      console.error('[SocialPage:diagnostic] getActiveUserId failed to resolve:', err);
      return null;
    }
  }, [profile?.id]);

  // ── Load Requests ──────────────────────────────────────────────────────────

  const loadRequests = useCallback(async () => {
    const userId = await getActiveUserId();
    console.log('[SocialPage:diagnostic] loadRequests called with userId:', userId);
    if (!userId) return;

    setRequestsLoading(true);
    setRequestsError(null);

    try {
      const [
        requests,
        fc,
        fwc,
      ] = await Promise.all([
        getIncomingFollowRequests(),
        getFollowerCount(userId),
        getFollowingCount(userId),
      ]);

      console.log('[SocialPage:diagnostic] loadRequests received incoming requests count:', requests.length, {
        requests,
        followerCount: fc,
        followingCount: fwc
      });

      setIncomingRequests(requests);
      setFollowerCount(fc);
      setFollowingCount(fwc);
    } catch (err: unknown) {
      console.error(
        '[SocialPage:diagnostic] loadRequests error:',
        err
      );

      setRequestsError(formatSupabaseError(err));
    } finally {
      setRequestsLoading(false);
    }
  }, [getActiveUserId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // ── Debounced Search ────────────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();

    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const currentUserId = await getActiveUserId();
        if (!currentUserId) {
          throw new Error('Not authenticated');
        }

        const users =
          await searchUsersByUsername(trimmed);

        const withStatus: SearchResult[] =
          await Promise.all(
            users.map(async (user) => {
              const status =
                await getFollowStatus(
                  currentUserId,
                  user.id
                );

              return {
                ...user,
                status,
                actionLoading: false,
              };
            })
          );

        setSearchResults(withStatus);
        setSearchError(null);
      } catch (err: unknown) {
        console.error(
          '[SocialPage] search error:',
          err
        );

        setSearchError(formatSupabaseError(err));
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, getActiveUserId]);

  // ── Search Result Helpers ───────────────────────────────────────────────────

  function setResultLoading(
    userId: string,
    value: boolean
  ) {
    setSearchResults((prev) =>
      prev.map((result) =>
        result.id === userId
          ? {
            ...result,
            actionLoading: value,
          }
          : result
      )
    );
  }

  function setResultStatus(
    userId: string,
    status: FollowRelationshipState
  ) {
    setSearchResults((prev) =>
      prev.map((result) =>
        result.id === userId
          ? {
            ...result,
            status,
            actionLoading: false,
          }
          : result
      )
    );
  }

  // ── Send Request ────────────────────────────────────────────────────────────

  async function handleSend(userId: string) {
    setResultLoading(userId, true);
    setSearchError(null);

    try {
      await sendFollowRequest(userId);

      const currentUserId = await getActiveUserId();
      if (currentUserId) {
        const verified = await getFollowStatus(currentUserId, userId);
        setResultStatus(userId, verified === 'REQUEST_SENT' ? 'REQUEST_SENT' : verified);
      } else {
        setResultStatus(userId, 'REQUEST_SENT');
      }
    } catch (err: any) {
      console.error(
        '[SocialPage] sendFollowRequest error:',
        err
      );
      setSearchError(`Follow request failed: ${formatSupabaseError(err)}`);
      setResultLoading(userId, false);
    }
  }

  // ── Cancel Request ──────────────────────────────────────────────────────────

  async function handleCancel(userId: string) {
    setResultLoading(userId, true);
    setSearchError(null);

    try {
      const requestId =
        await getOutgoingRequestId(userId);

      if (requestId) {
        await cancelFollowRequest(requestId);
      }

      setResultStatus(userId, 'NONE');
    } catch (err) {
      console.error(
        '[SocialPage] cancelFollowRequest error:',
        err
      );
      setSearchError(`Cancel request failed: ${formatSupabaseError(err)}`);
      setResultLoading(userId, false);
    }
  }

  // ── Accept Search Result Request ────────────────────────────────────────────

  async function handleAccept(
    userId: string,
    requestId?: string
  ) {
    if (!requestId) return;

    setResultLoading(userId, true);
    setSearchError(null);

    try {
      await acceptFollowRequest(requestId);

      setResultStatus(
        userId,
        'FOLLOWING'
      );

      setFollowerCount((count) => count + 1);
    } catch (err) {
      console.error(
        '[SocialPage] acceptFollowRequest error:',
        err
      );
      setSearchError(`Accept request failed: ${formatSupabaseError(err)}`);
      setResultLoading(userId, false);
    }
  }

  // ── Reject Search Result Request ────────────────────────────────────────────

  async function handleReject(
    userId: string,
    requestId?: string
  ) {
    if (!requestId) return;

    setResultLoading(userId, true);
    setSearchError(null);

    try {
      await rejectFollowRequest(requestId);

      setResultStatus(
        userId,
        'NONE'
      );
    } catch (err) {
      console.error(
        '[SocialPage] rejectFollowRequest error:',
        err
      );
      setSearchError(`Reject request failed: ${formatSupabaseError(err)}`);
      setResultLoading(userId, false);
    }
  }

  // ── Unfollow ────────────────────────────────────────────────────────────────

  async function handleUnfollow(userId: string) {
    setResultLoading(userId, true);
    setSearchError(null);

    try {
      await unfollowUser(userId);

      setResultStatus(
        userId,
        'NONE'
      );
    } catch (err) {
      console.error(
        '[SocialPage] unfollowUser error:',
        err
      );
      setSearchError(`Unfollow failed: ${formatSupabaseError(err)}`);
      setResultLoading(userId, false);
    }
  }

  // ── Incoming Request Actions ────────────────────────────────────────────────

  async function handleAcceptRequest(
    request: FollowRequest
  ) {
    setRequestsError(null);
    try {
      await acceptFollowRequest(request.id);

      setIncomingRequests((prev) =>
        prev.filter(
          (item) => item.id !== request.id
        )
      );

      setFollowerCount(
        (count) => count + 1
      );
    } catch (err) {
      console.error(
        '[SocialPage] acceptRequest error:',
        err
      );
      setRequestsError(`Accept failed: ${formatSupabaseError(err)}`);
    }
  }

  async function handleRejectRequest(
    request: FollowRequest
  ) {
    setRequestsError(null);
    try {
      await rejectFollowRequest(request.id);

      setIncomingRequests((prev) =>
        prev.filter(
          (item) => item.id !== request.id
        )
      );
    } catch (err) {
      console.error(
        '[SocialPage] rejectRequest error:',
        err
      );
      setRequestsError(`Reject failed: ${formatSupabaseError(err)}`);
    }
  }

  const hasUsername =
    !!profile?.username;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950 text-white overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,#0d2b3a_0%,transparent_60%)]" />

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_right,#1a0d2e_0%,transparent_60%)]" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-12 pb-4 border-b border-slate-800">

        <button
          onClick={() => {
            audioSynth.playBack();
            navigate(-1);
          }}
          className="p-2 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-[#00f2ff]/40 transition-all active:scale-90"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-1">
          <h1 className="text-lg font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#d575ff]">
            People
          </h1>

          {profile?.username && (
            <p className="text-[10px] text-slate-500 font-mono tracking-widest">
              @{profile.username}
              &nbsp;·&nbsp;

              <span className="text-[#00f2ff]">
                {followerCount}
              </span>

              {' '}followers&nbsp;·&nbsp;

              <span className="text-[#d575ff]">
                {followingCount}
              </span>

              {' '}following
            </p>
          )}
        </div>

        <Users
          size={20}
          className="text-[#00f2ff]/60"
        />
      </div>

      {/* Tabs */}
      <div className="relative z-10 flex border-b border-slate-800">

        {(['search', 'requests'] as Tab[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => {
                audioSynth.playClick();
                setActiveTab(tab);
              }}
              className={clsx(
                'flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2',

                activeTab === tab
                  ? 'border-[#00f2ff] text-[#00f2ff]'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              )}
            >
              {tab === 'search' ? (
                <Search size={14} />
              ) : (
                <span className="relative">
                  <Bell size={14} />

                  {incomingRequests.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-black flex items-center justify-center text-white">
                      {incomingRequests.length > 9
                        ? '9+'
                        : incomingRequests.length}
                    </span>
                  )}
                </span>
              )}

              {tab === 'search'
                ? 'Search'
                : 'Requests'}
            </button>
          )
        )}
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
      >

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="p-4 flex flex-col gap-4">

            {!hasUsername && (
              <div className="bg-amber-900/30 border border-amber-500/30 rounded-2xl p-4 text-amber-400 text-sm">
                <p className="font-bold text-xs uppercase tracking-widest mb-1">
                  Username Required
                </p>

                <p className="text-xs opacity-80">
                  Set a username in Settings to search for people.
                </p>
              </div>
            )}

            {/* Search Input */}
            <div className="relative">

              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search by @username…"
                disabled={!hasUsername}
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-[#00f2ff]/60 text-white placeholder-slate-600 rounded-2xl pl-10 pr-10 py-3 text-sm font-mono outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              />

              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Searching */}
            {isSearching && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/30 rounded-2xl px-4 py-3">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-xl" />
                  </div>
                ))}
              </div>
            )}

            {/* Search Error */}
            {searchError && (
              <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl px-3 py-2">
                {searchError}
              </div>
            )}

            {/* No Results */}
            {!isSearching &&
              query.trim().length >= 2 &&
              searchResults.length === 0 &&
              !searchError && (
                <div className="text-center py-10 text-slate-600">
                  <Users
                    size={32}
                    className="mx-auto mb-3 opacity-30"
                  />

                  <p className="text-sm font-bold uppercase tracking-widest">
                    No users found
                  </p>

                  <p className="text-xs mt-1 opacity-70">
                    Try a different username
                  </p>
                </div>
              )}

            {/* Results */}
            {searchResults.length > 0 && (
              <div className="flex flex-col gap-3">

                {searchResults.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    status={user.status}
                    loading={user.actionLoading}
                    onSend={() =>
                      handleSend(user.id)
                    }
                    onCancel={() =>
                      handleCancel(user.id)
                    }
                    onAccept={async () => {
                      const requestId =
                        await getIncomingRequestId(
                          user.id
                        );

                      await handleAccept(
                        user.id,
                        requestId ?? undefined
                      );
                    }}
                    onReject={async () => {
                      const requestId =
                        await getIncomingRequestId(
                          user.id
                        );

                      await handleReject(
                        user.id,
                        requestId ?? undefined
                      );
                    }}
                    onUnfollow={() =>
                      handleUnfollow(user.id)
                    }
                  />
                ))}

              </div>
            )}

            {/* Empty State */}
            {query.trim().length < 2 &&
              !isSearching &&
              hasUsername && (
                <div className="text-center py-16 text-slate-600">
                  <Search
                    size={36}
                    className="mx-auto mb-4 opacity-20"
                  />

                  <p className="text-sm font-bold uppercase tracking-widest">
                    Find People
                  </p>

                  <p className="text-xs mt-2 opacity-60">
                    Type at least 2 characters to search
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="p-4 flex flex-col gap-3">

            {requestsLoading && (
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex flex-col gap-3 bg-slate-800/40 border border-slate-700/30 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 flex-1 rounded-xl" />
                      <Skeleton className="h-8 w-16 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {requestsError && (
              <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl px-3 py-2">
                {requestsError}
              </div>
            )}

            {!requestsLoading &&
              incomingRequests.length === 0 && (
                <div className="text-center py-16 text-slate-600">
                  <Bell
                    size={36}
                    className="mx-auto mb-4 opacity-20"
                  />

                  <p className="text-sm font-bold uppercase tracking-widest">
                    No Pending Requests
                  </p>

                  <p className="text-xs mt-2 opacity-60">
                    Follow requests will appear here
                  </p>
                </div>
              )}

            {incomingRequests.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                onAccept={() =>
                  handleAcceptRequest(request)
                }
                onReject={() =>
                  handleRejectRequest(request)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── User Row ──────────────────────────────────────────────────────────────────

interface UserRowProps {
  user: PublicUserProfile;
  status: FollowRelationshipState;
  loading: boolean;
  onSend: () => void;
  onCancel: () => void;
  onAccept: () => void;
  onReject: () => void;
  onUnfollow: () => void;
}

function UserRow({
  user,
  status,
  loading,
  onSend,
  onCancel,
  onAccept,
  onReject,
  onUnfollow,
}: UserRowProps) {
  const initials = (
    user.name ||
    user.username ||
    '?'
  )
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4 py-3 transition-all hover:border-[#00f2ff]/20">

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00f2ff]/30 to-[#d575ff]/30 border border-[#00f2ff]/20 flex items-center justify-center text-sm font-black text-[#00f2ff] flex-shrink-0">
        {initials}
      </div>

      {/* Name + Username */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">
          {user.name || user.username}
        </p>

        <p className="text-xs text-[#00f2ff]/70 font-mono tracking-widest truncate">
          @{user.username}
        </p>
      </div>

      {/* Action Button */}
      <FollowButton
        status={status}
        loading={loading}
        onSend={onSend}
        onCancel={onCancel}
        onAccept={onAccept}
        onReject={onReject}
        onUnfollow={onUnfollow}
      />
    </div>
  );
}

// ── Request Row ───────────────────────────────────────────────────────────────

interface RequestRowProps {
  request: FollowRequest;
  onAccept: () => void;
  onReject: () => void;
}

function RequestRow({
  request,
  onAccept,
  onReject,
}: RequestRowProps) {
  const [acting, setActing] =
    useState(false);

  const requester =
    request.requester;

  const initials = (
    requester?.name ||
    requester?.username ||
    '?'
  )
    .slice(0, 2)
    .toUpperCase();

  async function handleAccept() {
    setActing(true);

    try {
      await onAccept();
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    setActing(true);

    try {
      await onReject();
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4 py-4 transition-all hover:border-[#00f2ff]/20">

      <div className="flex items-center gap-3 mb-3">

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d575ff]/30 to-[#00f2ff]/30 border border-[#d575ff]/20 flex items-center justify-center text-sm font-black text-[#d575ff] flex-shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">

          <p className="text-sm font-bold text-white truncate">
            {requester?.name ||
              requester?.username ||
              'Unknown user'}
          </p>

          {requester?.username && (
            <p className="text-xs text-[#d575ff]/70 font-mono tracking-widest truncate">
              @{requester.username}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3">
        <span className="text-[#00f2ff] font-bold">
          @{requester?.username || 'someone'}
        </span>{' '}
        wants to follow you.
      </p>

      <div className="flex gap-2">

        <button
          disabled={acting}
          onClick={handleAccept}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 bg-[#00f2ff]/15 border border-[#00f2ff]/30 text-[#00f2ff] hover:bg-[#00f2ff]/25 disabled:opacity-50"
        >
          {acting ? (
            <Loader2
              size={13}
              className="animate-spin"
            />
          ) : (
            <UserCheck size={13} />
          )}

          Accept
        </button>

        <button
          disabled={acting}
          onClick={handleReject}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 bg-red-900/20 border border-red-800/30 text-red-400 hover:bg-red-900/40 disabled:opacity-50"
        >
          {acting ? (
            <Loader2
              size={13}
              className="animate-spin"
            />
          ) : (
            <UserX size={13} />
          )}

          Reject
        </button>

      </div>
    </div>
  );
}