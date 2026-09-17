import { useState, useEffect } from 'react';
import { Tag, RefreshCw, Smartphone, Globe, Cloud, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import {
    OTA_APP_VERSION,
    CONFIGURED_ANDROID_VERSION_NAME,
    CONFIGURED_ANDROID_VERSION_CODE,
    getNativeAppInfo,
    fetchLatestOtaConfig,
    type NativeAppInfo,
    type LatestOtaConfig,
} from '../../utils/version';

function formatTimestamp(iso: string) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    } catch {
        return iso;
    }
}

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    accent = 'indigo',
}: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    accent?: 'indigo' | 'cyan' | 'emerald' | 'amber';
}) {
    const accentClasses: Record<string, string> = {
        indigo: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
        cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
        emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
        amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    };
    return (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${accentClasses[accent]}`}>
                    <Icon size={16} />
                </div>
            </div>
            <div className="text-2xl font-black text-white mb-1 font-mono">{value}</div>
            {sub && <div className="text-xs text-slate-500">{sub}</div>}
        </div>
    );
}

export function VersionDetailsPanel() {
    const [nativeInfo, setNativeInfo] = useState<NativeAppInfo | null>(null);
    const [otaConfig, setOtaConfig] = useState<LatestOtaConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const isNative = Capacitor.isNativePlatform();

    const loadData = async () => {
        setLoading(true);
        try {
            const [native, ota] = await Promise.all([getNativeAppInfo(), fetchLatestOtaConfig()]);
            setNativeInfo(native);
            setOtaConfig(ota);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const isUpToDate = otaConfig ? otaConfig.version === OTA_APP_VERSION : null;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                        <Tag size={22} className="text-indigo-400" />
                        <span>Version Details</span>
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">
                        Website, game (OTA) and native Android shell versions — pulled from package.json, build.gradle, and the live Firestore OTA config.
                    </p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-400' : ''} />
                    <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 relative z-10">
                <StatCard
                    label="App / OTA Version"
                    value={`v${OTA_APP_VERSION}`}
                    sub="From root package.json — drives website + game OTA content"
                    icon={Globe}
                    accent="indigo"
                />
                <StatCard
                    label="Configured Android Shell"
                    value={`v${CONFIGURED_ANDROID_VERSION_NAME}`}
                    sub={`versionCode ${CONFIGURED_ANDROID_VERSION_CODE} — from android/app/build.gradle at build time`}
                    icon={Smartphone}
                    accent="cyan"
                />
                <StatCard
                    label="This Device's Native Shell"
                    value={isNative ? (nativeInfo ? `v${nativeInfo.version}` : loading ? '…' : 'unavailable') : 'N/A (web)'}
                    sub={isNative ? (nativeInfo ? `build ${nativeInfo.build}` : 'Could not read native info') : 'Viewing in a browser, not the Android app'}
                    icon={Smartphone}
                    accent="amber"
                />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <Cloud size={16} className="text-emerald-400" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Live Published OTA Bundle (Firestore)</span>
                </div>

                {loading ? (
                    <div className="text-sm text-slate-500">Loading…</div>
                ) : otaConfig ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-slate-500 text-xs mb-1">Published Version</div>
                            <div className="text-white font-mono font-bold flex items-center gap-2">
                                v{otaConfig.version}
                                {isUpToDate ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                                        <CheckCircle2 size={12} /> Matches this build
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                                        <AlertTriangle size={12} /> Differs from this build (v{OTA_APP_VERSION})
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-500 text-xs mb-1">Last Updated</div>
                            <div className="text-white font-mono text-xs">{formatTimestamp(otaConfig.updatedAt)}</div>
                        </div>
                        {otaConfig.message && (
                            <div className="sm:col-span-2">
                                <div className="text-slate-500 text-xs mb-1">Message</div>
                                <div className="text-slate-300">{otaConfig.message}</div>
                            </div>
                        )}
                        {otaConfig.checksum && (
                            <div className="sm:col-span-2">
                                <div className="text-slate-500 text-xs mb-1">SHA-256 Checksum</div>
                                <div className="text-slate-400 font-mono text-[11px] break-all">{otaConfig.checksum}</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-slate-500">No OTA bundle has been published yet, or it could not be reached.</div>
                )}
            </div>
        </div>
    );
}
