import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Send, AlertTriangle, UserPlus, Trash2, Shield, 
    Search, BarChart2, Activity, BookOpen, LayoutDashboard, LogOut, Smartphone, RefreshCw, Users,
    Menu, X
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import clsx from 'clsx';
import { StoryTagsExplorer } from '../components/admin/StoryTagsExplorer';
import { StoryMetadataAuthoring } from '../components/admin/StoryMetadataAuthoring';
import { StoryRequestsDashboard } from '../components/admin/StoryRequestsDashboard';
import { InstallAnalyticsDashboard } from '../components/admin/InstallAnalyticsDashboard';
import { UsersManagementDashboard } from '../components/admin/UsersManagementDashboard';

const FeedbackDashboard = lazy(() => import('../components/admin/FeedbackDashboard').then(m => ({ default: m.FeedbackDashboard })));

export function AdminPanelPage() {
    const navigate = useNavigate();

    // Admin auth
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [currentEmail, setCurrentEmail] = useState('');
    const [activeView, setActiveView] = useState<'overview' | 'users' | 'installs' | 'feedback' | 'stories' | 'operations'>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const verifyAdmin = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    if (isMounted) setIsAdmin(false);
                    return;
                }
                if (isMounted && session.user?.email) {
                    setCurrentEmail(session.user.email);
                }

                const { data: isAdminData, error } = await supabase.rpc('is_admin_user');
                if (error) throw error;
                
                if (isMounted) {
                    setIsAdmin(!!isAdminData);
                }
            } catch (err) {
                console.error('Admin verification failed:', err);
                if (isMounted) setIsAdmin(false);
            }
        };

        verifyAdmin();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, _session: any) => {
            if (event === 'SIGNED_OUT') {
                if (isMounted) setIsAdmin(false);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                verifyAdmin();
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Operations State
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [notifStatus, setNotifStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [notifMessage, setNotifMessage] = useState('');
    
    
    
    const [adminList, setAdminList] = useState<{ id: string; email: string }[]>([]);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [adminStatus, setAdminStatus] = useState<'idle' | 'adding' | 'success' | 'error'>('idle');
    const [adminMessage, setAdminMessage] = useState('');
    
    const [subCount, setSubCount] = useState<number | null>(null);
    const [subCheckLoading, setSubCheckLoading] = useState(false);

    useEffect(() => {
        if (isAdmin && activeView === 'operations') {
            loadAdmins();
            handleCheckSubs();
        }
    }, [isAdmin, activeView]);

    const loadAdmins = async () => {
        try {
            const { data, error } = await supabase.from('admin_users').select('id, email').order('created_at', { ascending: true });
            if (error) throw error;
            setAdminList(data || []);
        } catch (err) {
            console.error('Failed to load admins:', err);
        }
    };

    const handleAddAdmin = async () => {
        const email = newAdminEmail.trim().toLowerCase();
        if (!email || !email.includes('@')) {
            setAdminStatus('error'); setAdminMessage('Please enter a valid email address.'); return;
        }
        if (adminList.some(a => a.email === email)) {
            setAdminStatus('error'); setAdminMessage('This email is already an admin.'); return;
        }
        setAdminStatus('adding');
        try {
            const { error } = await supabase.from('admin_users').insert({ email });
            if (error) throw error;
            setAdminStatus('success');
            setAdminMessage(`${email} added as admin!`);
            setNewAdminEmail('');
            await loadAdmins();
        } catch (err: any) {
            setAdminStatus('error'); setAdminMessage(err.message || 'Failed to add admin.');
        }
    };

    const handleRemoveAdmin = async (id: string, email: string) => {
        if (email === 'anitadhakad333@gmail.com') {
            setAdminStatus('error'); setAdminMessage('Cannot remove the founder account.'); return;
        }
        try {
            const { error } = await supabase.from('admin_users').delete().eq('id', id);
            if (error) throw error;
            setAdminStatus('success');
            setAdminMessage(`${email} removed.`);
            await loadAdmins();
        } catch (err: any) {
            setAdminStatus('error'); setAdminMessage(err.message || 'Failed to remove admin.');
        }
    };

    const handleCheckSubs = async () => {
        setSubCheckLoading(true);
        try {
            // Direct query to Supabase push_subscriptions table
            const { count, error } = await supabase
                .from('push_subscriptions')
                .select('*', { count: 'exact', head: true });

            if (!error && typeof count === 'number') {
                setSubCount(count);
            } else {
                // Fallback attempt via API if deployed with serverless functions
                const res = await fetch('/api/subscribe-push', { 
                    headers: { 'x-admin-email': currentEmail } 
                });
                if (res.ok) {
                    const data = await res.json();
                    setSubCount(data.count ?? 0);
                } else {
                    const { data: list } = await supabase.from('push_subscriptions').select('id');
                    setSubCount(list ? list.length : 0);
                }
            }
        } catch (err) {
            console.warn('[AdminPanel] handleCheckSubs fallback:', err);
            try {
                const { data: list } = await supabase.from('push_subscriptions').select('id');
                setSubCount(list ? list.length : 0);
            } catch {
                setSubCount(0);
            }
        } finally {
            setSubCheckLoading(false);
        }
    };

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) {
            setNotifStatus('error'); setNotifMessage('Title and body are required.'); return;
        }
        setNotifStatus('sending');  
        try {
            const res = await fetch('/api/send-notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-email': currentEmail },
                body: JSON.stringify({ title, body, url: '/game' }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP ${res.status}`);
            }
            const data = await res.json();
            
            
            
            if (data.sent === 0 && data.total === 0) {
                setNotifStatus('error'); setNotifMessage('No registered devices found.');
            } else if (data.failed > 0) {
                setNotifStatus('error'); setNotifMessage('Broadcast completed with some failures. See report.');
            } else {
                setNotifStatus('success'); setNotifMessage(`Successfully broadcasted to ${data.sent} device(s)!`);
                setTitle(''); setBody('');
            }
        } catch (err: any) {
            setNotifStatus('error'); setNotifMessage(err.message || 'An unexpected error occurred.');
        }
    };

    if (isAdmin === null) {
        return (
            <div className="min-h-[100dvh] bg-[#0a0510] flex items-center justify-center">
                <div className="text-indigo-400 text-lg animate-pulse font-bold flex items-center gap-3">
                    <Activity className="animate-spin" size={24} /> Authenticating Admin...
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-[100dvh] bg-[#0a0510] flex items-center justify-center p-6">
                <div className="bg-slate-900/80 p-8 rounded-3xl border border-rose-500/30 text-center max-w-md shadow-2xl">
                    <AlertTriangle className="mx-auto mb-4 text-rose-500" size={56} />
                    <h2 className="text-2xl font-black text-white mb-2">Access Restricted</h2>
                    <p className="text-slate-400 mb-6 font-medium">You must be granted administrative privileges to view this portal.</p>
                    <p className="text-slate-500 text-xs mb-8 font-mono bg-black/40 py-2 rounded-lg">ID: {currentEmail || 'unknown'}</p>
                    <button onClick={() => navigate('/game')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-indigo-500/25">
                        Return to Map
                    </button>
                </div>
            </div>
        );
    }

    const navigation = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'All Users', icon: Users },
        { id: 'installs', label: 'App Installs', icon: Smartphone },
        { id: 'feedback', label: 'Analytics & Feedback', icon: BarChart2 },
        { id: 'stories', label: 'Story Engine', icon: BookOpen },
        { id: 'operations', label: 'Operations & Access', icon: Shield },
    ] as const;

    return (
        <div className="flex flex-col md:flex-row h-[calc(100dvh-60px)] bg-[#0a0510] text-slate-300 font-sans overflow-hidden">
            {/* Mobile Top Header Bar */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shrink-0 z-30">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
                        aria-label="Toggle navigation menu"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                            <Activity size={16} className="text-indigo-400" />
                        </div>
                        <span className="font-black text-base text-white tracking-tight">Admin Portal</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/game')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-lg border border-slate-800 transition-colors"
                    >
                        <LogOut size={13} />
                        <span>Exit</span>
                    </button>
                </div>
            </div>

            {/* Mobile Horizontal Pill Tabs for 1-Tap Switching */}
            <div className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-950/95 border-b border-slate-800/60 overflow-x-auto no-scrollbar shrink-0 z-20">
                {navigation.map((item) => {
                    const isActive = activeView === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveView(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
                                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-800"
                            )}
                        >
                            <Icon size={13} className={isActive ? "text-white" : "text-slate-400"} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Mobile Navigation Drawer Modal */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                        />
                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                            className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col z-50 shadow-2xl px-5 pt-safe pb-safe"
                        >
                            <div className="flex items-center justify-between pb-5 border-b border-slate-800/60">
                                <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2">
                                    <Activity size={22} className="text-indigo-500" />
                                    Admin Control
                                </h1>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <nav className="flex-1 space-y-1.5 py-4 overflow-y-auto">
                                {navigation.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveView(item.id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={clsx(
                                            "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer",
                                            activeView === item.id
                                                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner"
                                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                                        )}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="pt-4 mt-auto border-t border-slate-800/60">
                                <div className="flex items-center gap-3 mb-4 px-1">
                                    <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30 text-xs">
                                        {currentEmail ? currentEmail[0].toUpperCase() : 'A'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-white truncate">{currentEmail.split('@')[0]}</p>
                                        <p className="text-[10px] text-slate-500 font-mono truncate">Administrator</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/game')}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-colors border border-slate-800"
                                >
                                    <LogOut size={14} /> Exit Portal
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar (hidden on mobile) */}
            <aside className="hidden md:flex w-64 bg-slate-950 border-r border-slate-800/60 flex-col z-20 shrink-0 h-full">
                <div className="p-6">
                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2">
                        <Activity size={24} className="text-indigo-500" />
                        Admin
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navigation.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer",
                                activeView === item.id 
                                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner" 
                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                            )}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 mt-auto border-t border-slate-800/60 bg-slate-950/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                            {currentEmail ? currentEmail[0].toUpperCase() : 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{currentEmail.split('@')[0]}</p>
                            <p className="text-[10px] text-slate-500 font-mono truncate">Administrator</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/game')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-lg transition-colors border border-slate-800 hover:border-slate-700 cursor-pointer"
                    >
                        <LogOut size={14} /> Exit Portal
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-y-auto overflow-x-hidden custom-scrollbar w-full min-w-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="p-3.5 sm:p-6 md:p-10 max-w-7xl mx-auto w-full min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeView}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="w-full min-w-0"
                        >
                            {/* OVERVIEW */}
                            {activeView === 'overview' && (
                                <div className="space-y-6 sm:space-y-8">
                                    <div className="mb-2">
                                        <h2 className="text-2xl sm:text-3xl font-black text-white">Platform Overview</h2>
                                        <p className="text-slate-400 text-xs sm:text-sm">High-level metrics, install adoption, and user demand signals.</p>
                                    </div>
                                    <InstallAnalyticsDashboard />
                                    <SearchAnalyticsView />
                                    <StoryRequestsDashboard />
                                </div>
                            )}

                            {/* ALL USERS */}
                            {activeView === 'users' && (
                                <UsersManagementDashboard />
                            )}

                            {/* APP INSTALLS */}
                            {activeView === 'installs' && (
                                <div className="space-y-6">
                                    <div className="mb-2">
                                        <h2 className="text-2xl sm:text-3xl font-black text-white">App Installations & PWA</h2>
                                        <p className="text-slate-400 text-xs sm:text-sm">Track downloads, home screen additions, and device ecosystem reach.</p>
                                    </div>
                                    <InstallAnalyticsDashboard />
                                </div>
                            )}

                            {/* FEEDBACK & ANALYTICS */}
                            {activeView === 'feedback' && (
                                <div className="space-y-6">
                                    <div className="mb-2">
                                        <h2 className="text-2xl sm:text-3xl font-black text-white">Analytics & Feedback</h2>
                                        <p className="text-slate-400 text-xs sm:text-sm">Deep dive into global metrics, story performance, and user activity.</p>
                                    </div>
                                    <div className="bg-slate-950/40 rounded-3xl border border-slate-800 p-2 md:p-6 shadow-2xl">
                                        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Analytics Dashboard...</div>}>
                                            <FeedbackDashboard />
                                        </Suspense>
                                    </div>
                                </div>
                            )}

                            {/* STORY ENGINE */}
                            {activeView === 'stories' && (
                                <div className="space-y-6 sm:space-y-8">
                                    <div className="mb-2">
                                        <h2 className="text-2xl sm:text-3xl font-black text-white">Story Engine</h2>
                                        <p className="text-slate-400 text-xs sm:text-sm">Manage tags, offline metadata, and narrative routing.</p>
                                    </div>
                                    <StoryTagsExplorer />
                                    <StoryMetadataAuthoring />
                                </div>
                            )}

                            {/* OPERATIONS */}
                            {activeView === 'operations' && (
                                <div className="space-y-6 sm:space-y-8 max-w-4xl">
                                    <div className="mb-2">
                                        <h2 className="text-2xl sm:text-3xl font-black text-white">Operations & Access</h2>
                                        <p className="text-slate-400 text-xs sm:text-sm">Broadcast push notifications and manage admin privileges.</p>
                                    </div>

                                    <form onSubmit={handleBroadcast} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                            <Send size={18} className="text-indigo-400" /> Push Notifications
                                        </h3>
                                        
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Title</label>
                                                <input
                                                    type="text" value={title} onChange={e => setTitle(e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                    placeholder="e.g. New Story Unlocked!" maxLength={50}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Message Body</label>
                                                <textarea
                                                    value={body} onChange={e => setBody(e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-h-[100px] resize-y"
                                                    placeholder="e.g. Tap here to discover your future archetype..." maxLength={150}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Devices</p>
                                                    <p className="text-lg font-black text-white flex items-center gap-2">
                                                        <span>{subCheckLoading ? 'Checking...' : subCount === null ? '—' : subCount}</span>
                                                        {typeof subCount === 'number' && subCount > 0 && (
                                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                                Active
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button" onClick={handleCheckSubs} disabled={subCheckLoading}
                                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                                                >
                                                    {subCheckLoading ? 'Checking...' : 'Refresh Count'}
                                                </button>
                                            </div>

                                            <AnimatePresence>
                                                {notifStatus !== 'idle' && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                        className={`p-4 rounded-xl border text-sm font-medium ${
                                                            notifStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                                            notifStatus === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                                                            'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                                        }`}
                                                    >
                                                        {notifStatus === 'sending' ? 'Broadcasting out to devices...' : notifMessage}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <button 
                                                type="submit" disabled={notifStatus === 'sending'}
                                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50"
                                            >
                                                {notifStatus === 'sending' ? 'SENDING...' : 'BROADCAST NOTIFICATION'}
                                            </button>
                                        </div>
                                    </form>

                                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                            <Shield size={18} className="text-emerald-400" /> Administrative Access
                                        </h3>

                                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                            <input
                                                type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)}
                                                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                placeholder="Enter email to grant access..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAdmin())}
                                            />
                                            <button
                                                type="button" onClick={handleAddAdmin} disabled={adminStatus === 'adding'}
                                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <UserPlus size={18} /> Add Admin
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {adminStatus !== 'idle' && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                    className={`mb-6 p-3 rounded-xl border text-sm font-medium ${
                                                        adminStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                                        adminStatus === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                                                        'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                                    }`}
                                                >
                                                    {adminStatus === 'adding' ? 'Processing...' : adminMessage}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="space-y-2">
                                            {adminList.length === 0 ? (
                                                <p className="text-slate-500 text-sm text-center py-6 border border-dashed border-slate-700 rounded-xl">No admins found.</p>
                                            ) : (
                                                adminList.map(admin => (
                                                    <div key={admin.id} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                                                                {admin.email[0].toUpperCase()}
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-200">
                                                                {admin.email}
                                                                {admin.email === 'anitadhakad333@gmail.com' && (
                                                                    <span className="ml-3 text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">FOUNDER</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        {admin.email !== 'anitadhakad333@gmail.com' && (
                                                            <button
                                                                onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                                                                className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-all"
                                                                title="Revoke access"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

// --- SEARCH ANALYTICS COMPONENT ---
function SearchAnalyticsView() {
    const [logs, setLogs] = useState<Array<{ id: string; query: string; matched: boolean; created_at: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<number>(7);

    const loadLogs = async () => {
        setLoading(true);
        try {
            let cutoffDateStr: string | null = null;
            if (range !== 0) {
                const date = new Date();
                date.setDate(date.getDate() - range);
                cutoffDateStr = date.toISOString();
            }

            // 1. Fetch search_logs
            let logsQuery = supabase.from('search_logs').select('*').order('created_at', { ascending: false });
            if (cutoffDateStr) logsQuery = logsQuery.gte('created_at', cutoffDateStr);

            // 2. Fetch unmatched_searches
            let unmatchedQuery = supabase.from('unmatched_searches').select('*').order('searched_at', { ascending: false });
            if (cutoffDateStr) unmatchedQuery = unmatchedQuery.gte('searched_at', cutoffDateStr);

            const [logsRes, unmatchedRes] = await Promise.all([logsQuery, unmatchedQuery]);

            const listA = (logsRes.data || []).map((x: any) => ({
                id: x.id,
                query: x.query_original || x.query || '',
                matched: !!x.matched,
                created_at: x.created_at,
            }));

            const listB = (unmatchedRes.data || []).map((x: any) => ({
                id: x.id,
                query: x.search_query || '',
                matched: false,
                created_at: x.searched_at,
            }));

            const combined = [...listA, ...listB]
                .filter(item => item.query.trim().length > 0)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setLogs(combined);
        } catch (err) {
            console.error('[SearchAnalytics] Load error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLogs(); }, [range]);

    const totalSearches = logs.length;
    const matchedCount = logs.filter(l => l.matched).length;
    const unmatchedCount = totalSearches - matchedCount;

    // Group queries
    const queryCounts: Record<string, number> = {};
    const unmatchedQueryCounts: Record<string, number> = {};

    for (const log of logs) {
        const q = log.query.trim();
        queryCounts[q] = (queryCounts[q] || 0) + 1;
        if (!log.matched) {
            unmatchedQueryCounts[q] = (unmatchedQueryCounts[q] || 0) + 1;
        }
    }

    const topSearches = Object.entries(queryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    const missingDemand = Object.entries(unmatchedQueryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    // Group unmatched by date
    const unmatchedByDate = Object.entries(
        logs.filter(l => !l.matched).reduce((acc, log) => {
            const date = new Date(log.created_at).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Search size={20} className="text-cyan-400" /> Search Analytics & User Demand
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                        Track what players are actively searching for and what stories are missing.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select 
                        value={range} onChange={e => setRange(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-cyan-500"
                    >
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={0}>All Time</option>
                    </select>

                    <button
                        onClick={loadLogs}
                        disabled={loading}
                        className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Refresh search data"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin text-cyan-400' : ''} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center text-slate-500 py-12 text-xs font-medium">Loading search data...</div>
            ) : logs.length === 0 ? (
                <div className="text-center text-slate-500 py-12 text-xs">No search logs found for this period.</div>
            ) : (
                <div className="space-y-6 relative z-10">
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Matched vs Unmatched Card */}
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-emerald-400">{matchedCount}</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Matched</div>
                                </div>
                                <div className="text-xl font-black text-slate-700">VS</div>
                                <div className="text-center">
                                    <div className="text-3xl font-black text-rose-400">{unmatchedCount}</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Unmatched</div>
                                </div>
                            </div>
                            <div className="border-t border-slate-800 pt-4">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Unmatched Demand Volume</h4>
                                <div className="flex items-end gap-1 h-16 w-full">
                                    {unmatchedByDate.length === 0 && <span className="text-xs text-slate-600">No unmatched data</span>}
                                    {unmatchedByDate.map(([, count], i) => {
                                        const max = Math.max(...unmatchedByDate.map(d => d[1]), 1);
                                        const height = Math.max(10, (count / max) * 100);
                                        return (
                                            <div key={i} className="flex-1 flex flex-col justify-end group relative">
                                                <div className="w-full bg-rose-500/30 hover:bg-rose-400 rounded-sm transition-all" style={{ height: `${height}%` }} />
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-1.5 py-0.5 rounded hidden group-hover:block z-20 text-white font-bold">
                                                    {count}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Top Searches */}
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                            <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center justify-between">
                                <span>Top Searches</span>
                                <Activity size={14} className="text-cyan-400" />
                            </h4>
                            <div className="space-y-2.5">
                                {topSearches.map(([q, count], i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className="text-xs text-slate-300 font-medium truncate pr-2 capitalize">{q}</span>
                                        <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Missing / Unmatched Demand */}
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                            <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center justify-between">
                                <span>Missing Content Demand</span>
                                <Activity size={14} className="text-rose-400" />
                            </h4>
                            <div className="space-y-2.5">
                                {missingDemand.length === 0 ? (
                                    <p className="text-xs text-slate-500 py-4">All searches matched existing content!</p>
                                ) : missingDemand.map(([q, count], i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className="text-xs text-rose-200 font-medium truncate pr-2 capitalize">{q}</span>
                                        <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Search Queries Log Table */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                        <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center justify-between">
                            <span>Recent Search Queries</span>
                            <span className="text-[10px] text-slate-500 font-mono">Latest 20 queries</span>
                        </h4>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                                        <th className="pb-3 px-2">Query</th>
                                        <th className="pb-3 px-2">Match Status</th>
                                        <th className="pb-3 px-2 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {logs.slice(0, 20).map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                                            <td className="py-2.5 px-2 font-bold text-white capitalize">
                                                {item.query}
                                            </td>
                                            <td className="py-2.5 px-2">
                                                {item.matched ? (
                                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                        ✓ Matched
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                                                        ✕ Unmatched
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-2 text-right text-slate-500 text-[11px]">
                                                {new Date(item.created_at).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
