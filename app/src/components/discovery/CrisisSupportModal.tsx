import { motion, AnimatePresence } from 'framer-motion';
import { HeartHandshake, PhoneCall, ShieldAlert, X, ExternalLink } from 'lucide-react';
import { safetyService } from '../../services/safetyService';

interface CrisisSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    customMessage?: string;
}

export function CrisisSupportModal({ isOpen, onClose, customMessage }: CrisisSupportModalProps) {
    if (!isOpen) return null;

    const helplines = safetyService.getHelplines();

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-gradient-to-b from-[#181124] to-[#0c0814] border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.25)] text-white overflow-hidden"
                >
                    {/* Ambient Glow */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                                <HeartHandshake size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-rose-200">You Are Not Alone</h3>
                                <p className="text-xs text-rose-300/70 font-medium">Safe Haven & Immediate Support</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Compassionate Message */}
                    <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 mb-5 text-sm text-rose-100/90 leading-relaxed font-medium">
                        {customMessage ||
                            "It sounds like you're navigating an extraordinarily heavy situation right now. AYA is a self-discovery and growth game, not crisis support or clinical care. Please connect with someone who can listen and support you safely right now."}
                    </div>

                    {/* Helplines List */}
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 mb-6">
                        {helplines.map((h, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-rose-400/30 transition-all"
                            >
                                <div>
                                    <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">{h.country}</div>
                                    <div className="text-sm font-bold text-white">{h.name}</div>
                                    <div className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1 mt-0.5">
                                        <PhoneCall size={12} /> {h.contact}
                                    </div>
                                </div>
                                {h.url && (
                                    <a
                                        href={h.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
                                    >
                                        Visit <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Disclaimer & Return */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                            <ShieldAlert size={14} className="text-amber-400 shrink-0" />
                            <span>Free, confidential, and available 24/7.</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider transition-all"
                        >
                            Return to App
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
