import { useState, useEffect } from 'react';
import { 
    Smartphone, Download, Bell, Monitor, Apple, 
    RefreshCw, CheckCircle2, Globe, Shield, Activity
} from 'lucide-react';
import { fetchInstallStats, type InstallStats } from '../../utils/installTracker';

export function InstallAnalyticsDashboard() {
    const [stats, setStats] = useState<InstallStats | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchInstallStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to load install stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const total = stats?.totalInstalls || 0;
    const pushCount = stats?.pushSubscribers || 0;

    const androidCount = stats?.platformBreakdown.android || 0;
    const iosCount = stats?.platformBreakdown.ios || 0;
    const windowsCount = stats?.platformBreakdown.windows || 0;
    const macCount = stats?.platformBreakdown.mac || 0;
    const otherCount = stats?.platformBreakdown.other || 0;

    const mobileCount = (stats?.deviceBreakdown.mobile || 0) + (stats?.deviceBreakdown.tablet || 0);
    const desktopCount = stats?.deviceBreakdown.desktop || 0;

    const getPercent = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                        <Download size={22} className="text-cyan-400" />
                        <span>App Installations & PWA Adoption</span>
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">
                        Real-time tracking of users who have installed AYA or added it to their home screen.
                    </p>
                </div>

                <button
                    onClick={loadData}
                    disabled={loading}
                    className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin text-cyan-400' : ''} />
                    <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
                </button>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
                {/* Total Installs */}
                <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.1)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider">Total Installs</span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <Smartphone size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">
                        {loading ? '—' : total}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-cyan-400" />
                        <span>Added to Homescreen / App</span>
                    </div>
                </div>

                {/* Push Notifications Enabled */}
                <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_25px_rgba(168,85,247,0.1)]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black text-purple-400 uppercase tracking-wider">Push Subscribers</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <Bell size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">
                        {loading ? '—' : pushCount}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Activity size={12} className="text-purple-400" />
                        <span>Registered push devices</span>
                    </div>
                </div>

                {/* Mobile Share */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mobile Devices</span>
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                            <Smartphone size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">
                        {loading ? '—' : `${mobileCount} (${getPercent(mobileCount)}%)`}
                    </div>
                    <div className="text-xs text-slate-500">
                        iOS & Android devices
                    </div>
                </div>

                {/* Desktop Share */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Desktop & PC</span>
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                            <Monitor size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">
                        {loading ? '—' : `${desktopCount} (${getPercent(desktopCount)}%)`}
                    </div>
                    <div className="text-xs text-slate-500">
                        Windows, Mac & Linux
                    </div>
                </div>
            </div>

            {/* Platform & Source Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 relative z-10">
                {/* Platform Distribution */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                    <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Globe size={15} className="text-cyan-400" />
                        <span>Operating System Breakdown</span>
                    </h4>

                    <div className="space-y-3">
                        {/* Android */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Android
                                </span>
                                <span className="text-slate-400 font-mono">{androidCount} ({getPercent(androidCount)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${getPercent(androidCount)}%` }} />
                            </div>
                        </div>

                        {/* iOS */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                                    <Apple size={12} className="text-purple-400" /> iOS (iPhone & iPad)
                                </span>
                                <span className="text-slate-400 font-mono">{iosCount} ({getPercent(iosCount)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-400 rounded-full transition-all duration-500" style={{ width: `${getPercent(iosCount)}%` }} />
                            </div>
                        </div>

                        {/* Windows */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400" /> Windows
                                </span>
                                <span className="text-slate-400 font-mono">{windowsCount} ({getPercent(windowsCount)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${getPercent(windowsCount)}%` }} />
                            </div>
                        </div>

                        {/* Mac */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-sky-400" /> macOS
                                </span>
                                <span className="text-slate-400 font-mono">{macCount} ({getPercent(macCount)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-400 rounded-full transition-all duration-500" style={{ width: `${getPercent(macCount)}%` }} />
                            </div>
                        </div>

                        {otherCount > 0 && (
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-300 font-bold">Other Platforms</span>
                                    <span className="text-slate-400 font-mono">{otherCount} ({getPercent(otherCount)}%)</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-500 rounded-full" style={{ width: `${getPercent(otherCount)}%` }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Installation Methods */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                    <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Shield size={15} className="text-purple-400" />
                        <span>Install Source & Methods</span>
                    </h4>

                    <div className="space-y-2.5">
                        {Object.entries(stats?.methodBreakdown || {}).length === 0 ? (
                            <p className="text-xs text-slate-500 py-4 text-center">No installation events recorded yet.</p>
                        ) : (
                            Object.entries(stats?.methodBreakdown || {}).map(([method, count]) => {
                                const label =
                                    method === 'native_prompt' ? 'Native Browser Prompt' :
                                    method === 'ios_guide' ? 'iOS Safari (Add to Homescreen)' :
                                    method === 'desktop_guide' ? 'Desktop Browser Install' :
                                    method === 'android_guide' ? 'Android Menu Install' :
                                    method === 'standalone_verified' ? 'Direct Standalone Launch' :
                                    method;

                                return (
                                    <div key={method} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                                        <span className="text-xs font-medium text-slate-300 capitalize">{label}</span>
                                        <span className="text-xs font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                                            {count}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Installations Log Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative z-10">
                <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider flex items-center justify-between">
                    <span>Recent Install Log</span>
                    <span className="text-[10px] text-slate-500 font-mono">Latest 25 entries</span>
                </h4>

                {loading ? (
                    <div className="text-center text-slate-500 py-8 text-xs">Loading installation events...</div>
                ) : stats?.recentInstalls.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 text-xs">
                        No installations recorded yet. New installs will appear here in real time.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                                    <th className="pb-3 px-2">Platform</th>
                                    <th className="pb-3 px-2">Browser</th>
                                    <th className="pb-3 px-2">Method</th>
                                    <th className="pb-3 px-2">Push Alerts</th>
                                    <th className="pb-3 px-2">User / Device</th>
                                    <th className="pb-3 px-2 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {stats?.recentInstalls.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                                        <td className="py-2.5 px-2 font-bold text-white capitalize flex items-center gap-1.5">
                                            {item.platform === 'ios' ? <Apple size={13} className="text-purple-400" /> : <Smartphone size={13} className="text-cyan-400" />}
                                            <span>{item.platform}</span>
                                        </td>
                                        <td className="py-2.5 px-2 text-slate-300 capitalize">{item.browser}</td>
                                        <td className="py-2.5 px-2 text-slate-400 text-[11px] capitalize">{item.installMethod.replace(/_/g, ' ')}</td>
                                        <td className="py-2.5 px-2">
                                            {item.notificationsEnabled ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                    <Bell size={10} /> Active
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-500">Off</span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-2 font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                                            {item.userId ? `User: ${item.userId.slice(0, 8)}...` : item.visitorId.slice(0, 10)}
                                        </td>
                                        <td className="py-2.5 px-2 text-right text-slate-500 text-[11px]">
                                            {new Date(item.createdAt).toLocaleDateString(undefined, {
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
                )}
            </div>
        </div>
    );
}
