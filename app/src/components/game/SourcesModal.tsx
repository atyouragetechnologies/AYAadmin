
interface Source {
  title: string;
  type: 'book' | 'interview' | 'documentary' | 'article' | 'speech' | 'autobiography';
  detail?: string;
}

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  personalityName: string;
  age: number;
  sources: Source[];
}

const TYPE_ICON: Record<Source['type'], string> = {
  book: '📖',
  interview: '🎙',
  documentary: '🎬',
  article: '📰',
  speech: '🗣',
  autobiography: '📓',
};

export function SourcesModal({
  isOpen,
  onClose,
  personalityName,
  age,
  sources,
}: SourcesModalProps) {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        className="relative z-10 w-[90%] max-w-[340px] md:max-w-sm rounded-2xl border border-white/10 bg-[#0d1a3a] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Sources</h2>
            <p className="text-xs text-white/50 mt-0.5">
              {personalityName} · Age {age}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors text-sm"
            aria-label="Close sources"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="mb-4 h-px bg-white/10" />

        {/* Source list */}
        <ul className="space-y-3">
          {sources.map((src, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="mt-0.5 text-base shrink-0">
                {TYPE_ICON[src.type]}
              </span>
              <div>
                <p className="text-sm font-medium text-white leading-snug">
                  {src.title}
                </p>
                {src.detail && (
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                    {src.detail}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Footer note */}
        <p className="mt-5 text-[10px] text-white/30 text-center leading-relaxed">
          Stories are dramatised interpretations of documented real events.
        </p>
      </div>
    </div>
  );
}

export default SourcesModal;
