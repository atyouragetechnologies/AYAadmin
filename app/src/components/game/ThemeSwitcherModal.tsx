import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useUserStore, type MapTheme } from '../../store/userStore';
import { supabase } from '../../utils/supabase';
import { audioManager as audioSynth } from "../../utils/audioManager";
import { useDevicePerformance } from '../../hooks/useDevicePerformance';

interface ThemeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ThemeCard {
  id: MapTheme;
  emoji: string;
  label: string;
  subtext: string;
  borderColor: string;
  glowColor: string;
  bgGradient: string;
  previewGradient: string;
  accentColor: string;
}

const THEMES: ThemeCard[] = [
  {
    id: 'city_dark',
    emoji: '🌆',
    label: 'Neo City',
    subtext: 'Cyberpunk & Electric',
    borderColor: '#00f1fe',
    glowColor: 'rgba(0,241,254,0.5)',
    bgGradient: 'linear-gradient(135deg, #050a15 0%, #0a1528 50%, #050e1e 100%)',
    previewGradient: 'radial-gradient(ellipse at 70% 30%, #00f1fe 0%, #0050ff 30%, #000820 70%, #000 100%)',
    accentColor: '#00f1fe',
  },
  {
    id: 'light',
    emoji: '🌅',
    label: 'Classic',
    subtext: 'Clean & Minimal',
    borderColor: '#9333ea',
    glowColor: 'rgba(147,51,234,0.5)',
    bgGradient: 'linear-gradient(135deg, #f8f5ff 0%, #ede9fb 50%, #f0ecff 100%)',
    previewGradient: 'linear-gradient(135deg, #f8f5ff 0%, #e9d5ff 40%, #ddd6fe 70%, #c4b5fd 100%)',
    accentColor: '#9333ea',
  },
];

const THEME_LABELS: Record<MapTheme, string> = {
  solar: 'Solar Realm ☀️', // kept for type-safety, not rendered
  city_dark: 'Neo City 🌆',
  light: 'Classic 🌅',
};

// Floating particle for background
function Particle({ depth }: { depth: number }) {
  const size = 2 + depth * 2;
  const colors = ['#00f1fe', '#FFB347', '#9333ea', '#ff6b9d', '#ffffff'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        filter: `blur(${depth * 0.5}px)`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: 0.1 + depth * 0.15,
        boxShadow: `0 0 ${size * 3}px ${color}`,
      }}
      animate={{
        y: [0, -(20 + depth * 15), 0],
        x: [0, (Math.random() - 0.5) * 20, 0],
        opacity: [0.1 + depth * 0.15, 0.5 + depth * 0.2, 0.1 + depth * 0.15],
      }}
      transition={{
        duration: 4 + depth * 2 + Math.random() * 3,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: Math.random() * 4,
      }}
    />
  );
}

export function ThemeSwitcherModal({ isOpen, onClose }: ThemeSwitcherModalProps) {
  const mapTheme = useUserStore((state) => state.mapTheme);
  const setMapTheme = useUserStore((state) => state.setMapTheme);
  const profile = useUserStore((state) => state.profile);
  const { isLowEnd } = useDevicePerformance();

  const [toast, setToast] = useState<string | null>(null);
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({ id: i, depth: (i % 3) + 1 }))
  );

  const handleSelect = async (themeId: MapTheme) => {
    if (themeId === mapTheme) {
      onClose();
      return;
    }
    audioSynth.playClick();
    setMapTheme(themeId);

    const label = THEME_LABELS[themeId];
    setToast(`Switched to ${label}`);
    setTimeout(() => setToast(null), 2500);

    // Persist to Supabase
    if (profile?.mobile) {
      try {
        await supabase
          .from('users')
          .update({ preferred_theme: themeId })
          .eq('mobile', profile.mobile);
      } catch (e) {
        console.warn('Failed to persist theme to Supabase', e);
      }
    }

    setTimeout(onClose, 600);
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          style={{ background: 'rgba(2, 2, 20, 0.95)' }}
        >
          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-sm md:max-w-4xl rounded-3xl overflow-hidden"
            initial={{ scale: 0.75, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            style={{
              background: 'rgba(15, 15, 30, 0.95)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(0,241,254,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Particle Background Layer */}
            {!isLowEnd && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((p) => (
                  <Particle key={p.id} depth={p.depth} />
                ))}
                {/* Ambient conic glow */}
                <motion.div
                  className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(0,241,254,0.06) 0%, transparent 70%)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,179,71,0.05) 0%, transparent 70%)' }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            )}

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <motion.h2
                  className="text-xl font-black tracking-tight"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: '#ffffff',
                    textShadow: '0 0 20px rgba(0,241,254,0.6), 0 0 40px rgba(0,241,254,0.3)',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Choose Your World
                </motion.h2>
                <motion.p
                  className="text-xs mt-0.5"
                  style={{ color: '#6b6a88', fontFamily: "'Manrope', sans-serif" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Select your map experience
                </motion.p>
              </div>
              <motion.button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.12)' }}
                whileTap={{ scale: 0.9, y: 1 }}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.15 }}
              >
                <X size={14} className="text-white/60" />
              </motion.button>
            </div>

            {/* Theme Cards */}
            <div className="relative z-10 flex flex-col md:flex-row gap-4 px-4 md:px-8 pb-6 md:pb-8" style={{ perspective: '1200px' }}>
              {THEMES.map((theme, idx) => {
                const isActive = mapTheme === theme.id;
                const isLight = theme.id === 'light';
                return (
                  <motion.button
                    key={theme.id}
                    onClick={() => handleSelect(theme.id)}
                    className="relative w-full rounded-2xl overflow-hidden text-left transition-all"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.08, type: 'spring', damping: 18 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97, y: 1 }}
                    style={{
                      background: theme.bgGradient,
                      boxShadow: isActive
                        ? `0 0 0 2px ${theme.borderColor}, 0 0 30px ${theme.borderColor}, 0 20px 50px ${theme.glowColor}, 0 8px 20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.15)`
                        : `0 0 0 1px rgba(255,255,255,0.1), 0 8px 20px rgba(0,0,0,0.5)`,
                    }}
                  >
                    {/* Active ring glow pulse */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          boxShadow: `inset 0 0 30px ${theme.glowColor}`,
                          border: `1px solid ${theme.borderColor}`,
                        }}
                      />
                    )}

                    <div className="flex flex-row md:flex-col items-center md:items-start gap-4 p-4 md:p-6">
                      {/* Preview Thumbnail */}
                      <div
                        className="w-16 h-14 md:w-full md:h-28 rounded-xl flex-shrink-0 flex items-center justify-center relative overflow-hidden"
                        style={{
                          background: theme.previewGradient,
                          boxShadow: `0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
                        }}
                      >
                        <span className="text-2xl md:text-5xl relative z-10 drop-shadow-lg">{theme.emoji}</span>
                        {/* Inner depth shimmer */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
                          }}
                        />
                        {/* Neon scan line */}
                        {!isLight && (
                          <motion.div
                            className="absolute inset-x-0 h-px pointer-events-none"
                            style={{ background: `linear-gradient(90deg, transparent, ${theme.borderColor}80, transparent)`, top: '30%' }}
                            animate={{ top: ['20%', '80%', '20%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        )}
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 min-w-0 md:w-full">
                        <div className="flex items-center gap-2 mb-0.5 md:mb-2">
                            <span
                              className="text-sm md:text-lg font-black tracking-tight truncate"
                            style={{
                              fontFamily: "'Space Grotesk', sans-serif",
                              color: isLight ? '#1e1040' : '#ffffff',
                              textShadow: isActive ? `0 0 12px ${theme.borderColor}` : 'none',
                            }}
                          >
                            {theme.label}
                          </span>
                          {isActive && (
                            <motion.span
                              className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full flex-shrink-0"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              style={{
                                background: theme.borderColor,
                                color: '#000',
                                boxShadow: `0 0 10px ${theme.glowColor}`,
                              }}
                            >
                              ACTIVE
                            </motion.span>
                          )}
                        </div>
                        <p
                          className="text-xs md:text-sm truncate md:whitespace-normal"
                          style={{
                            color: isActive ? theme.accentColor : (isLight ? '#6b6082' : '#6b6a88'),
                            fontFamily: "'Manrope', sans-serif",
                            textShadow: isActive ? `0 0 8px ${theme.glowColor}` : 'none',
                          }}
                        >
                          {theme.subtext}
                        </p>
                      </div>

                      {/* Check / Arrow */}
                      <div
                        className="hidden w-8 h-8 rounded-full md:flex items-center justify-center flex-shrink-0 absolute bottom-4 right-4"
                        style={{
                          background: isActive ? theme.borderColor : 'rgba(255,255,255,0.05)',
                          boxShadow: isActive ? `0 0 16px ${theme.glowColor}` : 'none',
                          border: isActive ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {isActive ? (
                          <Check size={14} style={{ color: '#000', strokeWidth: 3 }} />
                        ) : (
                          <span style={{ color: theme.accentColor, fontSize: '10px', fontWeight: 900 }}>→</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toast && (
              <motion.div
                className="fixed left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-black z-[600]"
                style={{
                  bottom: 'max(2rem, env(safe-area-inset-bottom, 0px))',
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: 'rgba(12,12,29,0.97)',
                  border: '1px solid rgba(0,241,254,0.3)',
                  color: '#ffffff',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.6), 0 0 20px rgba(0,241,254,0.1)',
                }}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
