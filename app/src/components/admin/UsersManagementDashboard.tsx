import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Search, Clock, Calendar, Sparkles, 
    Smartphone, Mail, Download, RefreshCw, 
    ArrowUpDown, Eye, X, BookOpen, 
    CheckCircle2, Timer, UserCheck, Zap, Award
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { getStoryInfo } from '../../utils/feedbackUtils';

export interface UserRecord {
    id: string;
    auth_user_id?: string | null;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    mobile?: string | null;
    age?: number | null;
    total_xp: number;
    level: number;
    stories_completed: number;
    current_streak: number;
    longest_streak: number;
    is_admin?: boolean;
    onboarding_complete?: boolean;
    created_at: string;
    updated_at?: string | null;
    last_active_date?: string | null;
    access_type?: string | null;
    // Calculated values
    lastLogin: Date;
    lastLoginFormatted: string;
    lastLoginRelative: string;
    firstSignupFormatted: string;
    firstSignupRelative: string;
    timeSpentSeconds: number;
    timeSpentFormatted: string;
    totalEventsCount: number;
    storiesPlayedCount: number;
    activityStatus: 'online' | 'today' | 'this_week' | 'inactive';
}

function formatDuration(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds <= 0) return '< 1m';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds > 0 ? `${seconds}s` : ''}`.trim();
    }
    return `${seconds}s`;
}

function getRelativeTimeString(date: Date): { text: string; status: 'online' | 'today' | 'this_week' | 'inactive' } {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 5) return { text: 'Just now', status: 'online' };
    if (diffMin < 60) return { text: `${diffMin}m ago`, status: 'today' };
    if (diffHours < 24) return { text: `${diffHours}h ago`, status: 'today' };
    if (diffDays === 1) return { text: 'Yesterday', status: 'this_week' };
    if (diffDays < 7) return { text: `${diffDays}d ago`, status: 'this_week' };
    if (diffDays < 30) return { text: `${Math.floor(diffDays / 7)}w ago`, status: 'inactive' };
    return { 
        text: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined }), 
        status: 'inactive' 
    };
}

function formatFullDateTime(dateStr?: string | Date | null): string {
    if (!dateStr) return 'N/A';
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

export function UsersManagementDashboard() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState<'all' | 'active_7d' | 'new_24h' | 'onboarded' | 'high_engagement'>('all');
    const [sortBy, setSortBy] = useState<'signup_desc' | 'signup_asc' | 'last_login_desc' | 'time_desc' | 'xp_desc' | 'alpha_asc'>('signup_desc');
    const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
    const [userEventsDetail, setUserEventsDetail] = useState<any[]>([]);
    const [loadingUserDetail, setLoadingUserDetail] = useState(false);

    const loadUsersData = async () => {
        setLoading(true);
        try {
            // 1. Fetch all users from public.users
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (usersError) throw usersError;

            // 2. Fetch recent journey events & feedback & feature usage to compute active time
            const [eventsRes, feedbackRes, featureRes] = await Promise.all([
                supabase.from('journey_events').select('user_id, event_type, event_data, journey_id, created_at'),
                supabase.from('journey_feedback').select('user_id, session_duration_seconds, created_at, sentiment_score'),
                supabase.from('feature_usage').select('user_id, feature_name, accessed_at, session_id')
            ]);

            const allEvents = eventsRes.data || [];
            const allFeedback = feedbackRes.data || [];
            const allFeatures = featureRes.data || [];

            // Group events and timestamps by user_id
            const userEventMap: Record<string, any[]> = {};
            const userLatestTimestampMap: Record<string, number> = {};
            const userTimeSpentMap: Record<string, number> = {};
            const userStoriesPlayedMap: Record<string, Set<string>> = {};

            // Process journey_events
            allEvents.forEach((ev: any) => {
                const uid = ev.user_id;
                if (!uid) return;

                if (!userEventMap[uid]) userEventMap[uid] = [];
                userEventMap[uid].push(ev);

                if (!userStoriesPlayedMap[uid]) userStoriesPlayedMap[uid] = new Set();
                if (ev.journey_id && ev.journey_id !== 'onboarding_quiz' && ev.journey_id !== 'dna_module') {
                    userStoriesPlayedMap[uid].add(ev.journey_id);
                }

                // Track latest timestamp
                if (ev.created_at) {
                    const t = new Date(ev.created_at).getTime();
                    if (!userLatestTimestampMap[uid] || t > userLatestTimestampMap[uid]) {
                        userLatestTimestampMap[uid] = t;
                    }
                }

                // Calculate duration
                let duration = 0;
                if (ev.event_data?.time_taken_ms && typeof ev.event_data.time_taken_ms === 'number') {
                    duration = Math.round(ev.event_data.time_taken_ms / 1000);
                } else if (ev.event_data?.duration_seconds && typeof ev.event_data.duration_seconds === 'number') {
                    duration = ev.event_data.duration_seconds;
                } else if (ev.event_data?.total_time_seconds && typeof ev.event_data.total_time_seconds === 'number') {
                    duration = ev.event_data.total_time_seconds;
                }
                if (duration > 0 && duration < 3600 * 4) { // Cap sanity limit 4h per event
                    userTimeSpentMap[uid] = (userTimeSpentMap[uid] || 0) + duration;
                }
            });

            // Process journey_feedback
            allFeedback.forEach((fb: any) => {
                const uid = fb.user_id;
                if (!uid) return;

                if (fb.created_at) {
                    const t = new Date(fb.created_at).getTime();
                    if (!userLatestTimestampMap[uid] || t > userLatestTimestampMap[uid]) {
                        userLatestTimestampMap[uid] = t;
                    }
                }

                if (fb.session_duration_seconds && typeof fb.session_duration_seconds === 'number' && fb.session_duration_seconds < 7200) {
                    if (!userTimeSpentMap[uid] || userTimeSpentMap[uid] < fb.session_duration_seconds) {
                        userTimeSpentMap[uid] = Math.max(userTimeSpentMap[uid] || 0, fb.session_duration_seconds);
                    }
                }
            });

            // Process feature_usage
            allFeatures.forEach((fu: any) => {
                const uid = fu.user_id;
                if (!uid) return;

                if (fu.accessed_at) {
                    const t = new Date(fu.accessed_at).getTime();
                    if (!userLatestTimestampMap[uid] || t > userLatestTimestampMap[uid]) {
                        userLatestTimestampMap[uid] = t;
                    }
                }
            });

            // Map and enrich all users
            const enrichedUsers: UserRecord[] = (usersData || []).map((u: any) => {
                const userId = u.id;
                const authUid = u.auth_user_id;
                
                // Combine logs by id or auth_user_id
                const userEvents = [
                    ...(userEventMap[userId] || []),
                    ...(authUid && authUid !== userId ? (userEventMap[authUid] || []) : [])
                ];

                const latestTime = Math.max(
                    userLatestTimestampMap[userId] || 0,
                    authUid ? (userLatestTimestampMap[authUid] || 0) : 0,
                    u.last_active_date ? new Date(u.last_active_date).getTime() : 0,
                    u.updated_at ? new Date(u.updated_at).getTime() : 0,
                    u.created_at ? new Date(u.created_at).getTime() : 0
                );

                const lastLoginDate = latestTime > 0 ? new Date(latestTime) : new Date(u.created_at);
                const firstSignupDate = u.created_at ? new Date(u.created_at) : new Date();

                const { text: lastLoginRelative, status: activityStatus } = getRelativeTimeString(lastLoginDate);
                const { text: firstSignupRelative } = getRelativeTimeString(firstSignupDate);

                let rawTimeSpent = (userTimeSpentMap[userId] || 0) + (authUid && authUid !== userId ? (userTimeSpentMap[authUid] || 0) : 0);

                // Sensible estimation for users with progress but zero telemetry:
                // 1. Stories completed (~120s each)
                // 2. Onboarding complete (~180s)
                // 3. Level/XP progress
                if (rawTimeSpent < 60) {
                    const storiesCount = u.stories_completed || 0;
                    const onboardingSec = (u.onboarding_complete || u.assessment_completed) ? 180 : 0;
                    const estimatedFromGame = (storiesCount * 120) + onboardingSec + Math.min(600, (u.total_xp || 0) * 2);
                    rawTimeSpent = Math.max(rawTimeSpent, estimatedFromGame);
                }

                const storiesSet = new Set([
                    ...(userStoriesPlayedMap[userId] ? Array.from(userStoriesPlayedMap[userId]) : []),
                    ...(authUid && userStoriesPlayedMap[authUid] ? Array.from(userStoriesPlayedMap[authUid]) : [])
                ]);

                return {
                    id: u.id,
                    auth_user_id: u.auth_user_id,
                    name: u.name || null,
                    username: u.username || null,
                    email: u.email || null,
                    mobile: u.mobile || null,
                    age: u.age || null,
                    total_xp: u.total_xp || 0,
                    level: u.level || 1,
                    stories_completed: u.stories_completed || 0,
                    current_streak: u.current_streak || 0,
                    longest_streak: u.longest_streak || 0,
                    is_admin: !!u.is_admin,
                    onboarding_complete: !!u.onboarding_complete,
                    created_at: u.created_at,
                    updated_at: u.updated_at,
                    last_active_date: u.last_active_date,
                    access_type: u.access_type || 'free',
                    lastLogin: lastLoginDate,
                    lastLoginFormatted: formatFullDateTime(lastLoginDate),
                    lastLoginRelative,
                    firstSignupFormatted: formatFullDateTime(firstSignupDate),
                    firstSignupRelative,
                    timeSpentSeconds: rawTimeSpent,
                    timeSpentFormatted: formatDuration(rawTimeSpent),
                    totalEventsCount: userEvents.length,
                    storiesPlayedCount: Math.max(u.stories_completed || 0, storiesSet.size),
                    activityStatus
                };
            });

            setUsers(enrichedUsers);
        } catch (err) {
            console.error('Failed to load users data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsersData();
    }, []);

    // Filter & Search Logic
    const filteredUsers = useMemo(() => {
        let list = [...users];

        // 1. Search Query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(u => 
                (u.name && u.name.toLowerCase().includes(q)) ||
                (u.username && u.username.toLowerCase().includes(q)) ||
                (u.email && u.email.toLowerCase().includes(q)) ||
                (u.mobile && u.mobile.includes(q)) ||
                u.id.toLowerCase().includes(q)
            );
        }

        // 2. Tab Filter
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const sevenDaysMs = 7 * oneDayMs;

        if (filterTab === 'active_7d') {
            list = list.filter(u => (now - u.lastLogin.getTime()) <= sevenDaysMs);
        } else if (filterTab === 'new_24h') {
            list = list.filter(u => {
                const signupTime = new Date(u.created_at).getTime();
                return (now - signupTime) <= oneDayMs;
            });
        } else if (filterTab === 'onboarded') {
            list = list.filter(u => u.onboarding_complete || u.total_xp > 0 || u.stories_completed > 0);
        } else if (filterTab === 'high_engagement') {
            list = list.filter(u => u.timeSpentSeconds >= 900); // 15 mins +
        }

        // 3. Sorting
        list.sort((a, b) => {
            if (sortBy === 'signup_desc') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            if (sortBy === 'signup_asc') {
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }
            if (sortBy === 'last_login_desc') {
                return b.lastLogin.getTime() - a.lastLogin.getTime();
            }
            if (sortBy === 'time_desc') {
                return b.timeSpentSeconds - a.timeSpentSeconds;
            }
            if (sortBy === 'xp_desc') {
                return b.total_xp - a.total_xp;
            }
            if (sortBy === 'alpha_asc') {
                const nameA = a.name || a.username || 'zzz';
                const nameB = b.name || b.username || 'zzz';
                return nameA.localeCompare(nameB);
            }
            return 0;
        });

        return list;
    }, [users, searchQuery, filterTab, sortBy]);

    // Summary Statistics
    const totalUsersCount = users.length;
    const active7DaysCount = useMemo(() => {
        const now = Date.now();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        return users.filter(u => (now - u.lastLogin.getTime()) <= sevenDaysMs).length;
    }, [users]);

    const totalAppTimeSpent = useMemo(() => {
        const sum = users.reduce((acc, u) => acc + u.timeSpentSeconds, 0);
        return formatDuration(sum);
    }, [users]);

    const avgTimePerUser = useMemo(() => {
        if (users.length === 0) return '0m';
        const avgSec = Math.round(users.reduce((acc, u) => acc + u.timeSpentSeconds, 0) / users.length);
        return formatDuration(avgSec);
    }, [users]);

    // Handle Open User Detail
    const handleSelectUser = async (user: UserRecord) => {
        setSelectedUser(user);
        setLoadingUserDetail(true);
        try {
            const { data: events, error } = await supabase
                .from('journey_events')
                .select('*')
                .or(`user_id.eq.${user.id}${user.auth_user_id ? `,user_id.eq.${user.auth_user_id}` : ''}`)
                .order('created_at', { ascending: false })
                .limit(40);

            if (!error && events) {
                setUserEventsDetail(events);
            } else {
                setUserEventsDetail([]);
            }
        } catch (err) {
            console.error('Failed to load user events detail:', err);
            setUserEventsDetail([]);
        } finally {
            setLoadingUserDetail(false);
        }
    };

    // CSV Export Handler
    const handleExportCSV = () => {
        if (users.length === 0) return;

        const headers = [
            'ID',
            'Name',
            'Username',
            'Mobile',
            'Email',
            'Age',
            'Level',
            'Total XP',
            'Stories Completed',
            'Streak',
            'First Sign Up (ISO)',
            'First Sign Up (Formatted)',
            'Last Login (ISO)',
            'Last Login (Formatted)',
            'Time Spent (Seconds)',
            'Time Spent (Formatted)',
            'Onboarding Done',
            'Access Type'
        ];

        const rows = users.map(u => [
            `"${u.id}"`,
            `"${(u.name || '').replace(/"/g, '""')}"`,
            `"${(u.username || '').replace(/"/g, '""')}"`,
            `"${u.mobile || ''}"`,
            `"${u.email || ''}"`,
            u.age ?? '',
            u.level,
            u.total_xp,
            u.stories_completed,
            u.current_streak,
            `"${u.created_at}"`,
            `"${u.firstSignupFormatted}"`,
            `"${u.lastLogin.toISOString()}"`,
            `"${u.lastLoginFormatted}"`,
            u.timeSpentSeconds,
            `"${u.timeSpentFormatted}"`,
            u.onboarding_complete ? 'Yes' : 'No',
            `"${u.access_type || 'free'}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `aya_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <Users size={28} className="text-indigo-400" />
                        <span>All Users & Engagement</span>
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Comprehensive user roster tracking first sign-ups, last active sessions, and app engagement duration.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={handleExportCSV}
                        disabled={loading || users.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-md"
                        title="Export Users to CSV"
                    >
                        <Download size={14} className="text-emerald-400" />
                        <span>Export CSV</span>
                    </button>

                    <button
                        onClick={loadUsersData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-md"
                        title="Refresh data"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-400' : 'text-indigo-400'} />
                        <span>{loading ? 'Refreshing...' : 'Refresh Users'}</span>
                    </button>
                </div>
            </div>

            {/* Top KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users */}
                <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_25px_rgba(99,102,241,0.1)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black text-indigo-400 uppercase tracking-wider">Total Registered Users</span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Users size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">
                        {loading ? '—' : totalUsersCount}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <UserCheck size={12} className="text-indigo-400" />
                        <span>Registered accounts</span>
                    </div>
                </div>

                {/* Active in last 7 Days */}
                <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_25px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">Active (Last 7 Days)</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Zap size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">
                        {loading ? '—' : active7DaysCount}
                        {totalUsersCount > 0 && (
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full ml-2">
                                {Math.round((active7DaysCount / totalUsersCount) * 100)}%
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-400" />
                        <span>Logged in / played within 7 days</span>
                    </div>
                </div>

                {/* Total Time Spent across all users */}
                <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_25px_rgba(245,158,11,0.1)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">Total Platform Time</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">
                        {loading ? '—' : totalAppTimeSpent}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Timer size={12} className="text-amber-400" />
                        <span>Cumulative user engagement</span>
                    </div>
                </div>

                {/* Avg Time Per User */}
                <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.1)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider">Avg Time Per User</span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <Sparkles size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">
                        {loading ? '—' : avgTimePerUser}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Award size={12} className="text-cyan-400" />
                        <span>Average session time per player</span>
                    </div>
                </div>
            </div>

            {/* Filter, Search, and Sort Controls Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, username (@pratosh), phone, email, or user UUID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <ArrowUpDown size={14} /> Sort:
                        </span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 cursor-pointer font-medium"
                        >
                            <option value="signup_desc">Sign Up: Newest First</option>
                            <option value="signup_asc">Sign Up: Oldest First</option>
                            <option value="last_login_desc">Last Login: Most Recent</option>
                            <option value="time_desc">Time Spent: Highest First</option>
                            <option value="xp_desc">XP / Level: Highest First</option>
                            <option value="alpha_asc">Alphabetical (A-Z)</option>
                        </select>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 pt-1 text-xs border-t border-slate-800/80">
                    <button
                        onClick={() => setFilterTab('all')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                            filterTab === 'all' 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        All Users ({users.length})
                    </button>
                    <button
                        onClick={() => setFilterTab('active_7d')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                            filterTab === 'active_7d' 
                                ? 'bg-emerald-600 text-white shadow-md' 
                                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        Active Last 7 Days ({active7DaysCount})
                    </button>
                    <button
                        onClick={() => setFilterTab('new_24h')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                            filterTab === 'new_24h' 
                                ? 'bg-cyan-600 text-white shadow-md' 
                                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        New Today (24h)
                    </button>
                    <button
                        onClick={() => setFilterTab('onboarded')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                            filterTab === 'onboarded' 
                                ? 'bg-purple-600 text-white shadow-md' 
                                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        Onboarded / Active Players
                    </button>
                    <button
                        onClick={() => setFilterTab('high_engagement')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                            filterTab === 'high_engagement' 
                                ? 'bg-amber-600 text-white shadow-md' 
                                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        High Engagement (&gt;15m)
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>User Roster</span>
                            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">
                                {filteredUsers.length} shown
                            </span>
                        </h3>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                        Showing first sign up, last login & time spent
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-3">
                        <RefreshCw className="animate-spin text-indigo-400" size={24} />
                        <span>Loading user directory and aggregating activity...</span>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="py-16 text-center text-slate-500">
                        <Users size={32} className="mx-auto mb-2 text-slate-600" />
                        <p className="font-bold text-slate-400">No users found</p>
                        <p className="text-xs text-slate-600 mt-1">Try clearing your search query or switching filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    <th className="py-3.5 px-4">User</th>
                                    <th className="py-3.5 px-4">Contact</th>
                                    <th className="py-3.5 px-4">First Sign Up</th>
                                    <th className="py-3.5 px-4">Last Login / Active</th>
                                    <th className="py-3.5 px-4">Time Spent on App</th>
                                    <th className="py-3.5 px-4 text-center">Progress</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-sans">
                                {filteredUsers.map((user) => {
                                    const initial = (user.name?.[0] || user.username?.[0] || user.email?.[0] || 'U').toUpperCase();
                                    return (
                                        <tr 
                                            key={user.id} 
                                            className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                                            onClick={() => handleSelectUser(user)}
                                        >
                                            {/* User Info */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 flex items-center justify-center text-white font-black text-sm shrink-0">
                                                        {initial}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-white text-xs truncate">
                                                                {user.name || user.username || 'Anonymous Player'}
                                                            </span>
                                                            {user.is_admin && (
                                                                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-bold border border-purple-500/30">
                                                                    ADMIN
                                                                </span>
                                                            )}
                                                            {user.age && (
                                                                <span className="text-[10px] text-slate-500 font-mono">
                                                                    (Age {user.age})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-indigo-300/80 font-mono truncate">
                                                            {user.username ? `@${user.username}` : <span className="text-slate-600 italic">No username</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td className="py-3 px-4 text-slate-300">
                                                <div className="space-y-0.5">
                                                    {user.mobile && (
                                                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-300">
                                                            <Smartphone size={11} className="text-slate-500" />
                                                            <span>{user.mobile}</span>
                                                        </div>
                                                    )}
                                                    {user.email && (
                                                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                                                            <Mail size={11} className="text-slate-500 shrink-0" />
                                                            <span className="truncate" title={user.email}>{user.email}</span>
                                                        </div>
                                                    )}
                                                    {!user.mobile && !user.email && (
                                                        <span className="text-slate-600 text-[10px]">—</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* First Sign Up */}
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full font-bold border border-cyan-500/20">
                                                            {user.firstSignupRelative}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 mt-1 font-mono">
                                                        {new Date(user.created_at).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Last Login / Active */}
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        {user.activityStatus === 'online' ? (
                                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                                Active Now
                                                            </span>
                                                        ) : user.activityStatus === 'today' ? (
                                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                                                                🟢 {user.lastLoginRelative}
                                                            </span>
                                                        ) : user.activityStatus === 'this_week' ? (
                                                            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/20">
                                                                🟡 {user.lastLoginRelative}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                                                                ⚪ {user.lastLoginRelative}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 mt-1 font-mono">
                                                        {user.lastLoginFormatted}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Time Spent on App */}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                                        <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                                                            <Clock size={12} className="text-amber-400" />
                                                            {user.timeSpentFormatted}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Progress / Stats */}
                                            <td className="py-3 px-4 text-center">
                                                <div className="inline-flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                                                    <div className="text-[11px] font-bold text-purple-400 flex items-center gap-1" title="Level">
                                                        <Award size={12} />
                                                        <span>Lvl {user.level}</span>
                                                    </div>
                                                    <span className="text-slate-700">|</span>
                                                    <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1" title="XP">
                                                        <Zap size={11} />
                                                        <span>{user.total_xp} XP</span>
                                                    </div>
                                                    <span className="text-slate-700">|</span>
                                                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1" title="Stories completed">
                                                        <BookOpen size={11} />
                                                        <span>{user.stories_completed}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Action */}
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectUser(user);
                                                    }}
                                                    className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 text-xs shadow"
                                                >
                                                    <Eye size={13} />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Slide-out User Detail Drawer / Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm p-0 md:p-4">
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            transition={{ duration: 0.25 }}
                            className="bg-slate-950 border-l md:border border-slate-800 w-full max-w-2xl h-full md:h-[90vh] md:rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-white font-black text-xl">
                                        {(selectedUser.name?.[0] || selectedUser.username?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-black text-white">
                                                {selectedUser.name || selectedUser.username || 'User Profile'}
                                            </h3>
                                            {selectedUser.is_admin && (
                                                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                                                    ADMIN
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-indigo-300 font-mono">
                                            {selectedUser.username ? `@${selectedUser.username}` : 'No username set'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Drawer Scrollable Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar py-6 space-y-6">
                                {/* Identity & Contact Card */}
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">User ID</span>
                                        <p className="font-mono text-slate-300 break-all select-all">{selectedUser.id}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Age</span>
                                        <p className="text-white font-bold">{selectedUser.age || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone / Mobile</span>
                                        <p className="font-mono text-slate-300">{selectedUser.mobile || 'None attached'}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</span>
                                        <p className="font-mono text-slate-300 truncate" title={selectedUser.email || ''}>{selectedUser.email || 'None attached'}</p>
                                    </div>
                                </div>

                                {/* Key Timing Metrics */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="bg-slate-900 border border-cyan-500/20 p-4 rounded-2xl">
                                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                                            <Calendar size={12} /> First Sign Up
                                        </span>
                                        <p className="text-sm font-black text-white">{selectedUser.firstSignupRelative}</p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-1">{selectedUser.firstSignupFormatted}</p>
                                    </div>

                                    <div className="bg-slate-900 border border-emerald-500/20 p-4 rounded-2xl">
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                                            <Zap size={12} /> Last Login / Active
                                        </span>
                                        <p className="text-sm font-black text-white">{selectedUser.lastLoginRelative}</p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-1">{selectedUser.lastLoginFormatted}</p>
                                    </div>

                                    <div className="bg-slate-900 border border-amber-500/20 p-4 rounded-2xl">
                                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                                            <Clock size={12} /> Total Time Spent
                                        </span>
                                        <p className="text-sm font-black text-amber-400">{selectedUser.timeSpentFormatted}</p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-1">{selectedUser.timeSpentSeconds} seconds total</p>
                                    </div>
                                </div>

                                {/* Gamification Stats */}
                                <div className="grid grid-cols-4 gap-2 bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Level</span>
                                        <p className="text-lg font-black text-purple-400">{selectedUser.level}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total XP</span>
                                        <p className="text-lg font-black text-cyan-400">{selectedUser.total_xp}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Stories Done</span>
                                        <p className="text-lg font-black text-emerald-400">{selectedUser.stories_completed}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Streak</span>
                                        <p className="text-lg font-black text-rose-400">{selectedUser.current_streak}d</p>
                                    </div>
                                </div>

                                {/* Recent Activity Log */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                        <span>User Activity Log & Journey Timeline</span>
                                        <span className="text-[10px] text-slate-500 font-mono">Latest events</span>
                                    </h4>

                                    {loadingUserDetail ? (
                                        <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                                            <RefreshCw className="animate-spin text-indigo-400" size={14} />
                                            <span>Loading detailed events...</span>
                                        </div>
                                    ) : userEventsDetail.length === 0 ? (
                                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
                                            No explicit journey events recorded for this user yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                                            {userEventsDetail.map((ev: any, idx: number) => {
                                                const story = ev.journey_id ? getStoryInfo(ev.journey_id) : null;
                                                return (
                                                    <div key={idx} className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                                                                ev.event_type.includes('complete') 
                                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                                                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                                            }`}>
                                                                {ev.event_type}
                                                            </span>
                                                            <div className="overflow-hidden">
                                                                <span className="text-slate-200 font-bold truncate block">
                                                                    {story?.personality || ev.journey_id || 'System Event'}
                                                                </span>
                                                                {ev.event_data?.choice_text && (
                                                                    <span className="text-[10px] text-slate-400 truncate block">
                                                                        Choice: "{ev.event_data.choice_text}"
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                                            {formatFullDateTime(ev.created_at)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default UsersManagementDashboard;
