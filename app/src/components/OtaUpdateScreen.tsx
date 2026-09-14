
interface OtaUpdateScreenProps {
  progress: number;
}

/**
 * OtaUpdateScreen — Shown during a forced OTA update download.
 * Blocks all interaction until the new bundle is downloaded and applied.
 * Mirrors the ForceOtaUpdateScreen from CPBS (Prem Bhakti) app.
 */
export function OtaUpdateScreen({ progress }: OtaUpdateScreenProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0a0a0a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        color: '#fff',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      {/* AYA Logo / Icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 28,
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
        }}
      >
        <span style={{ fontSize: 40 }}>⚡</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', letterSpacing: -0.5 }}>
        Updating AYA
      </h1>
      <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 36px', maxWidth: 260, lineHeight: 1.6 }}>
        A new version is being installed. This only takes a moment...
      </p>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 280,
          height: 6,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.1)',
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            width: `${Math.min(progress, 100)}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>
        {progress < 100 ? `${progress}%` : 'Applying update...'}
      </p>
    </div>
  );
}
