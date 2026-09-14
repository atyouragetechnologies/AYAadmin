import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { audioManager as audioSynth } from '../../utils/audioManager';

import clsx from 'clsx';

interface AgeSelectorProps {
    value: number | null;
    onChange: (val: number) => void;
    disabled?: boolean;
    min?: number;
    max?: number;
}

export function AgeSelector({ value, onChange, disabled = false, min = 10, max = 25 }: AgeSelectorProps) {
    const handleNudge = (direction: -1 | 1) => {
        if (disabled) return;
        audioSynth.playClick();
        if (value === null || value === 0) {
            onChange(18); // Default starting value on initial click
            return;
        }
        const newValue = Math.max(min, Math.min(max, value + direction));
        onChange(newValue);
    };

    const displayVal = value && value > 0 ? Math.max(min, Math.min(max, value)) : null;

    return (
        <div className="w-full flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-3 px-2">
                <button
                    type="button"
                    disabled={disabled || (displayVal !== null && displayVal <= min)}
                    onClick={() => handleNudge(-1)}
                    className="p-3 bg-[#191923]/90 rounded-2xl border border-white/10 hover:border-[#00f1fe]/50 hover:bg-[#2b2b38] transition-all text-[#acaab5] hover:text-[#00f1fe] active:scale-95 disabled:opacity-40"
                    aria-label="Decrease age"
                >
                    <ChevronLeft size={22} />
                </button>

                <div className="flex flex-col items-center relative min-w-[120px]">
                    <motion.div
                        key={displayVal || 'unselected'}
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f1fe] to-[#99f7ff] tracking-tight drop-shadow-[0_0_15px_rgba(0,241,254,0.6)]"
                    >
                        {displayVal !== null ? displayVal : '--'}
                    </motion.div>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#00f1fe] font-bold opacity-80 mt-1 flex items-center gap-1">
                        <Calendar size={12} />
                        {displayVal !== null ? `${displayVal} Years Old` : 'Select Age'}
                    </span>
                </div>

                <button
                    type="button"
                    disabled={disabled || (displayVal !== null && displayVal >= max)}
                    onClick={() => handleNudge(1)}
                    className="p-3 bg-[#191923]/90 rounded-2xl border border-white/10 hover:border-[#00f1fe]/50 hover:bg-[#2b2b38] transition-all text-[#acaab5] hover:text-[#00f1fe] active:scale-95 disabled:opacity-40"
                    aria-label="Increase age"
                >
                    <ChevronRight size={22} />
                </button>
            </div>

            <input
                type="range"
                min={min}
                max={max}
                disabled={disabled}
                value={displayVal !== null ? displayVal : 18}
                onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    audioSynth.playClick();
                    onChange(val);
                }}
                className="w-full h-2 bg-[#191923] rounded-lg appearance-none cursor-pointer accent-[#00f1fe] hover:accent-[#7ff9ff] disabled:opacity-40"
            />
            
            <div className="flex justify-between w-full text-[10px] text-slate-500 font-mono select-none px-1 mt-2">
                {[10, 13, 16, 19, 22, 25].map(tick => (
                    <button
                        key={tick}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                            audioSynth.playClick();
                            onChange(tick);
                        }}
                        className={clsx(
                            "transition-colors hover:text-[#00f1fe] cursor-pointer font-bold",
                            displayVal === tick ? "text-[#00f1fe] scale-110" : "text-slate-500"
                        )}
                    >
                        {tick}
                    </button>
                ))}
            </div>
        </div>
    );
}
