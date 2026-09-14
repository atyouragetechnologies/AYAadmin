import { useState, useEffect, useRef } from 'react';
import { useSpinCountdown } from '../../hooks/useSpinCountdown';
import { fetchSpinsUsed, MAX_DAILY_SPINS } from '../../utils/spinLimit';
import './VibeSpinnerButton.css';

interface VibeSpinnerButtonProps {
  streak: number;       // Retained for signature compatibility
  completed: boolean;   // Legacy prop — ignored; we rely on daily_spins_used
  onClick: () => void;
  userId: string;
}

export function VibeSpinnerButton({ onClick, userId }: VibeSpinnerButtonProps) {
  const [spinsUsed, setSpinsUsed] = useState<number | null>(null); // null = loading
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownStr = useSpinCountdown();

  // ── Fetch spin data on mount & listen to real-time spin updates ───────────
  useEffect(() => {
    let isMounted = true;

    // Fast initial check
    fetchSpinsUsed(userId).then(count => {
      if (isMounted) setSpinsUsed(count);
    });

    const handleSpinsUpdated = (e: any) => {
      if (isMounted && typeof e.detail?.count === 'number') {
        setSpinsUsed(e.detail.count);
      }
    };

    const handleSpinsReset = () => {
      if (isMounted) setSpinsUsed(0);
    };

    window.addEventListener('aya-spins-updated', handleSpinsUpdated);
    window.addEventListener('aya-spins-reset', handleSpinsReset);

    return () => {
      isMounted = false;
      window.removeEventListener('aya-spins-updated', handleSpinsUpdated);
      window.removeEventListener('aya-spins-reset', handleSpinsReset);
    };
  }, [userId]);

  const isLocked = spinsUsed !== null && spinsUsed >= MAX_DAILY_SPINS;
  const isLoading = spinsUsed === null;

  const handleClick = () => {
    if (isLocked) {
      // Show brief toast
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToastVisible(true);
      toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
      return;
    }
    if (!isLoading) {
      onClick();
    }
  };

  return (
    <div className="vsb-wrapper">
      {/* Sparkles only when unlocked */}
      {!isLocked && !isLoading && (
        <>
          <div className="vsb-sparkle vsb-sp1" />
          <div className="vsb-sparkle vsb-sp2" />
          <div className="vsb-sparkle vsb-sp3" />
        </>
      )}

      <button
        className={`vsb-pill${isLocked ? ' vsb-locked' : ''}`}
        onClick={handleClick}
        aria-label={isLocked ? `Vibe Spinner locked. Next spin in ${countdownStr}` : 'Open Vibe Spinner'}
      >
        {/* Left: mini spinning wheel — greyscale + static when locked */}
        <div className="vsb-mini-wheel-wrap">
          <div className={`vsb-mini-wheel${isLocked ? ' vsb-mini-wheel-locked' : ''}`}>
            <div className={`vsb-wheel-face${isLocked ? ' vsb-wheel-face-locked' : ''}`} />
            <div className="vsb-wheel-rim" />
            <div className="vsb-wheel-hub" />
          </div>
        </div>

        {/* Right: content */}
        {isLocked ? (
          <div className="vibe-spinner-locked">
            <span className="spinner-lock-icon">🔒</span>
            <div className="spinner-locked-text">
              <span className="spinner-locked-title">NEXT SPIN IN</span>
              <span className="spinner-countdown">{countdownStr}</span>
            </div>
          </div>
        ) : (
          <span className="vsb-title">
            {isLoading ? '...' : spinsUsed === 1 ? 'VIBE SPINNER • 1 LEFT' : 'VIBE SPINNER'}
          </span>
        )}
      </button>

      {/* Locked toast */}
      {toastVisible && (
        <div className="vsb-locked-toast">
          Come back when timer hits 00:00:00
        </div>
      )}
    </div>
  );
}
