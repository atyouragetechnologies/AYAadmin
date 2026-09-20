import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Check, X, ShieldCheck } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { upsertUserProfile, logAnalyticsEvent } from '../../lib/firestore';
import { audioManager } from '../../utils/audioManager';


interface AyaPlusModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AyaPlusModal({ isOpen, onClose }: AyaPlusModalProps) {
    const profile = useUserStore((state) => state.profile);
    // We don't need trial-related state anymore
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleUpgrade = async (plan: 'monthly' | 'semi_annual' | 'annual') => {
        audioManager.playClick();
        setIsUpgrading(true);

        // Record subscription in database if authenticated
        if (profile?.id && !profile.id.startsWith('offline-')) {
            try {
                const durationDays = plan === 'annual' ? 365 : plan === 'semi_annual' ? 180 : 30;
                const expiresAt = new Date(Date.now() + durationDays * 86400000).toISOString();
                await upsertUserProfile(profile.id, {
                    accessType: 'aya_plus',
                    accessStartDate: new Date().toISOString(),
                });
                logAnalyticsEvent('subscriptions', {
                    userId: profile.id,
                    tier: 'plus',
                    plan: plan,
                    status: 'active',
                    startsAt: new Date().toISOString(),
                    expiresAt,
                });
            } catch (err) {
                console.warn('[AyaPlus] Subscriptions insert error:', err);
            }
        }

        setIsUpgrading(false);
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            onClose();
        }, 2000);
    };

    const PLUS_FEATURES = [
        'Unlimited stories & full story library access',
        'DNA evolution based on continued gameplay and choices',
        'More refined & personalized DNA insights over time',
        'Full / deeper career recommendations',
        'Personalized story recommendations',
        'Weekly progress / DNA report (when available)',
        'All future Premium features included',
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-xl bg-gradient-to-b from-[#171329] via-[#0f0d1b] to-[#08070e] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.25)] text-white overflow-hidden"
                >
                    {/* Ambient Glow */}
                    <div className="absolute -top-24 -right-24 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                    >
                        <X size={18} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                            <Crown size={26} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                                <Sparkles size={11} /> Premium Upgrade
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                                Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">AYA+</span>
                            </h2>
                        </div>
                    </div>


                    <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                        Step beyond the 3-story limit. Transform dilemmas into deep, lasting mental models.
                    </p>

                    {/* Feature List */}
                    <div className="space-y-2 mb-6">
                        {PLUS_FEATURES.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                                <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                                    <Check size={10} strokeWidth={3} />
                                </div>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Plans */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => handleUpgrade('monthly')}
                            disabled={isUpgrading || isSuccess}
                            className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-400/60 hover:bg-white/[0.06] text-left transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">1 Month</span>
                                <span className="text-[9px] font-bold text-amber-400">Save 34%</span>
                            </div>
                            <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="line-through text-slate-500 text-xs">₹149</span>
                                <span className="text-lg font-black text-white">₹99</span>
                                <span className="text-[10px] text-slate-400">/mo</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium mt-1">Cancel anytime</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleUpgrade('semi_annual')}
                            disabled={isUpgrading || isSuccess}
                            className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/60 hover:bg-white/[0.06] text-left transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-cyan-300 uppercase">6 Months</span>
                                <span className="text-[9px] font-bold text-cyan-400">Save 87%</span>
                            </div>
                            <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="line-through text-slate-500 text-xs">₹14,999</span>
                                <span className="text-lg font-black text-white">₹1,999</span>
                            </div>
                            <div className="text-[10px] text-cyan-300/90 font-medium mt-1">₹333 / month</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleUpgrade('annual')}
                            disabled={isUpgrading || isSuccess}
                            className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/50 hover:border-amber-300 hover:bg-amber-500/20 text-left transition-all relative group shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                        >
                            <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-[9px] font-black text-slate-950 uppercase tracking-wider">
                                Best Value · Save 88%
                            </div>
                            <div className="text-[10px] font-bold text-amber-300 uppercase">12 Months Plan</div>
                            <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="line-through text-slate-400 text-xs">₹24,999</span>
                                <span className="text-lg font-black text-white">₹2,999</span>
                                <span className="text-[10px] text-slate-400">/yr</span>
                            </div>
                            <div className="text-[10px] text-amber-300/90 font-medium mt-1">₹250 / month</div>
                        </button>
                    </div>

                    {/* Status Feedback */}
                    {isSuccess ? (
                        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-center text-xs font-bold flex items-center justify-center gap-2 animate-fade-in-up">
                            <Check size={16} />
                            <span>AYA+ Activated! Welcome to deeper self-discovery.</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-amber-400" />
                                <span>Secured 256-bit payment</span>
                            </div>
                            <span>Instant Access</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
