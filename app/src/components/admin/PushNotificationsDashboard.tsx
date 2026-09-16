import React, { useState, useEffect } from 'react';
import {
    Send, Bell, Smartphone, Chrome, BarChart2, Clock,
    RefreshCw, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { supabase } from '../utils/supabase';

type Tab = 'overview' | 'send' | 'history' | 'tokens';
type Platform = 'both' | 'android' | 'web';

interface Sub { id: string; user_id: string | null; subscription: { endpoint: string }; created_at: string; }
interface Fcm { id: string; user_id: string | null; token: string; token_short: string; platform: string; updated_at: string; }
interface UserRow { id: string; username: string | null; email: string | null; }
interface Hist { id: string; title: string; body: string; target_platform: string; sent_at: string; sent_count: number; success_count: number; failure_count: number; }

export function PushNotificationsDashboard() {
    const [tab, setTab] = useState<Tab>('overview');
    const [subs, setSubs] = useState<Sub[]>([]);
    const [tokens, setTokens] = useState<Fcm[]>([]);
    const [userMap, setUserMap] = useState<Record<string, UserRow>>({});
    const [loading, setLoading] = useState(false);
    const [webLoading, setWebLoading] = useState(false);
    const [fcmLoading, setFcmLoading] = useState(false);

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [platform, setPlatform] = useState<Platform>('both');
    const [url, setUrl] = useState('/game');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ success: boolean; sent: number; total: number; failed: number; error?: string } | null>(null);

    const [history, setHistory] = useState<Hist[]>([]);
    const [histLoading, setHistLoading] = useState(false);
    const [histRange, setHistRange] = useState<'7d' | '30d' | 'all'>('7d');

    useEffect(() => {
        if (tab === 'overview' || tab === 'history') fetchAll();
        if (tab === 'tokens') fetchTokens();
        if (tab === 'history') fetchHistory();
    }, [tab, histRange]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            setWebLoading(true);
            const { data: w } = await supabase.from('push_subscriptions').select('*').order('created_at', { ascending: false });
            if (w) setSubs(w);
            setWebLoading(false);

            setFcmLoading(true);
            try {
                const r = await fetch('/api/fcm-tokens');
                if (r.ok) { const d = await r.json(); setTokens(d.tokens || []); }
            } catch {}
            setFcmLoading(false);
        } catch {}
        setLoading(false);
    };

    const fetchTokens = async () => {
        setFcmLoading(true);
        try {
            const r = await fetch('/api/fcm-tokens');
            if (r.ok) { const d = await r.json(); setTokens(d.tokens || []); }
        } catch {}
        setFcmLoading(false);
    };

    const fetchUsers = async () => {
        try {
            const { data } = await supabase.from('users').select('id, username, email').limit(1000);
            if (data) { const m: Record<string, UserRow> = {}; data.forEach(u => { m[u.id] = u as UserRow; }); setUserMap(m); }
        } catch {}
    };

    const fetchHistory = async () => {
        setHistLoading(true);
        try {
            let q = supabase.from('notification_history').select('*').order('sent_at', { ascending: false });
            if (histRange !== 'all') { const d = histRange === '7d' ? 7 : 30; const c = new Date(); c.setDate(c.getDate() - d); q = q.gte('sent_at', c.toISOString()); }
            const { data, error } = await q;
            if (!error) setHistory(data || []);
        } catch {}
        setHistLoading(false);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !body.trim()) return;
        setSending(true);
        setResult(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const adminEmail = session?.user?.email || null;
            const res = await fetch('/api/admin-send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title.trim(), body: body.trim(), target_platform: platform, url: url.trim() || '/game', admin_email: adminEmail })
            });
            const d = await res.json();
            if (!res.ok || !d.success) throw new Error(d.error || 'Failed');
            setResult({ success: true, total: d.total, sent: d.sent, failed: d.failed });
            if (tab === 'overview') fetchAll();
            else if (tab === 'history') fetchHistory();
        } catch (err: any) {
            setResult({ success: false, total: 0, sent: 0, failed: 0, error: err.message });
        } finally {
            setSending(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const webCount = subs.length;
    const androidCount = tokens.filter(t => t.platform === 'android').length;
    const total = webCount + androidCount;

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row gap-2">
                {([['overview', 'Overview', BarChart2], ['send', 'Send', Send], ['history', 'History', Clock], ['tokens', 'Tokens', Bell]] as [Tab, string, any][]).map(([id, label, Icon]) => (
                    <button key={id} onClick={() => setTab(id)} className={clsx("flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border", tab === id ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-slate-800")}>
                        <Icon size={16} /> {label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {tab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard title="Total Devices" value={total} icon={<Smartphone size={20} />} color="border-blue-500/30 text-blue-400 bg-blue-500/5" loading={loading} />
                            <StatCard title="Web Push (PWA)" value={webCount} icon={<Chrome size={20} />} color="border-cyan-500/30 text-cyan-400 bg-cyan-500/5" loading={webLoading || loading} />
                            <StatCard title="Android FCM" value={androidCount} icon={<Smartphone size={20} />} color="border-emerald-500/30 text-emerald-400 bg-emerald-500/5" loading={fcmLoading || loading} />
                        </div>
                        <div className="bg-slate-950/40 rounded-2xl border border-slate-800 p-6">
                            <h3 className="text-lg font-bold text-white mb-2">Platform Summary</h3>
                            <p className="text-slate-400 text-sm">{total > 0 ? `${total} devices registered — ${webCount} web, ${androidCount} Android` : 'No devices registered yet.'}</p>
                        </div>
                    </motion.div>
                )}

                {tab === 'send' && (
                    <motion.form key="send" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleSend} className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><Send size={20} className="text-indigo-400" /> Broadcast Notification</h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Title *</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all" placeholder="e.g. New Story Unlocked!" maxLength={100} />
                                    <p className="text-[10px] text-slate-500 mt-1">{100 - title.length} remaining</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Message Body *</label>
                                    <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all min-h-[120px] resize-y" placeholder="Your message..." maxLength={200} />
                                    <p className="text-[10px] text-slate-500 mt-1">{200 - body.length} remaining</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Target Platform</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {([['both', 'All Devices', <Send size={16} />], ['android', 'Android Only', <Smartphone size={16} />], ['web', 'Web Only', <Chrome size={16} />]] as [Platform, string, any][]).map(([p, lbl, ic]) => (
                                            <button key={p} type="button" onClick={() => setPlatform(p)} className={clsx("flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all border", platform === p ? "bg-purple-600/20 border-purple-500/30 text-purple-300" : "bg-slate-950 border-slate-700 text-slate-400")}>
                                                {ic} <span className="font-medium">{lbl}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Deep Link URL (Optional)</label>
                                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all" placeholder="/game/stories/new" />
                                </div>
                                <button type="submit" disabled={sending || !title.trim() || !body.trim()} className={clsx("w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg", sending || !title.trim() || !body.trim() ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-[1.02] active:scale-[0.98]")}>
                                    {sending ? <span className="flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Sending...</span> : `SEND TO ${platform.toUpperCase() === 'BOTH' ? 'ALL' : platform.toUpperCase()}`}
                                </button>
                                <AnimatePresence>
                                    {result && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={clsx("p-4 rounded-xl border text-sm", result.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400")}>
                                            {result.success ? `✓ Broadcast complete! ${result.sent} sent, ${result.failed} failed` : `✗ ${result.error}`}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.form>
                )}

                {tab === 'history' && (
                    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Clock size={20} className="text-cyan-400" /> Notification History</h3>
                            <select value={histRange} onChange={e => setHistRange(e.target.value as any)} disabled={histLoading} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-indigo-500">
                                <option value="7d">Last 7 Days</option><option value="30d">Last 30 Days</option><option value="all">All Time</option>
                            </select>
                        </div>
                        {histLoading ? <div className="text-center py-8 text-slate-400">Loading...</div> :
                            history.length === 0 ? <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-500">No history yet.</div> :
                                <div className="space-y-3">{history.map(item => (
                                    <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                                        <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-white">{item.title}</h4><span className="text-[10px] text-slate-500">{new Date(item.sent_at).toLocaleString()}</span></div>
                                        <p className="text-slate-300 text-sm mb-3">{item.body}</p>
                                        <div className="flex items-center justify-between text-xs text-slate-400"><span>{item.target_platform}</span><span className={item.failure_count > 0 ? 'text-rose-400' : 'text-emerald-400'}>{item.success_count} sent • {item.failure_count} failed</span></div>
                                    </div>
                                ))}</div>
                        }
                    </motion.div>
                )}

                {tab === 'tokens' && (
                    <motion.div key="tokens" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Bell size={20} className="text-emerald-400" /> Token Management</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Web Push ({webCount})</h4>
                                {webLoading ? <div className="text-center py-4 text-slate-400">Loading...</div> : subs.length === 0 ? <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center text-slate-500">No web subscriptions</div> :
                                    <div className="space-y-2 max-h-80 overflow-y-auto">{subs.slice(0, 50).map(s => (
                                        <div key={s.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                                            <div className="flex justify-between items-start"><div className="flex-1"><p className="text-xs text-slate-400 mb-1">{s.user_id ? (userMap[s.user_id]?.username || userMap[s.user_id]?.email || 'User') : 'Guest'}</p><p className="text-[10px] text-slate-600 font-mono truncate">{s.subscription.endpoint}</p></div></div>
                                            <p className="text-[10px] text-slate-600 mt-2">{new Date(s.created_at).toLocaleDateString()}</p>
                                        </div>
                                    ))}</div>
                                }
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Android FCM ({androidCount})</h4>
                                {fcmLoading ? <div className="text-center py-4 text-slate-400">Loading...</div> : tokens.filter(t => t.platform === 'android').length === 0 ? <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center text-slate-500">No Android devices</div> :
                                    <div className="space-y-2 max-h-80 overflow-y-auto">{tokens.filter(t => t.platform === 'android').map(t => (
                                        <div key={t.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                                            <div className="flex justify-between items-start"><div className="flex-1"><p className="text-xs text-slate-400 mb-1">{t.user_id ? (userMap[t.user_id]?.username || userMap[t.user_id]?.email || 'User') : 'Unknown'}</p><p className="text-[10px] font-mono text-slate-600">{t.token_short}</p></div></div>
                                            <p className="text-[10px] text-slate-600 mt-2">Updated: {new Date(t.updated_at).toLocaleString()}</p>
                                        </div>
                                    ))}</div>
                                }
                            </div>
                        </div>
                        <button onClick={fetchAll} disabled={loading || webLoading || fcmLoading} className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white text-xs font-bold">
                            <RefreshCw size={14} className={loading || fcmLoading ? "animate-spin mr-1" : ""} /> Refresh Tokens
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ title, value, icon, color, loading }: { title: string; value: number; icon: React.ReactNode; color: string; loading: boolean }) {
    return (
        <div className={clsx("rounded-2xl p-5 flex items-center gap-4 border", color)}>
            <div className="p-2 rounded-xl bg-black/20">{icon}</div>
            <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">{title}</p>{loading ? <div className="text-2xl font-black">—</div> : <div className="text-2xl font-black">{value}</div>}</div>
        </div>
    );
}