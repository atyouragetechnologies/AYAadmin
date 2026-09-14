import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./motion";
import mascot from "@/assets/aya-mascot.webp";
import mascotPose2 from "@/assets/aya-mascot-pose-2.webp.asset.json";

/**
 * The official AYA mascot. The artwork is never modified — the blink is a thin
 * eyelid overlay and all life comes from transforms on the container.
 * Pass pose={2} for the energetic jumping pose (no blink overlay on that art).
 */
export function Mascot({
  className,
  imgClassName,
  blink = true,
  float = true,
  priority = false,
  style,
  alt = "AYA mascot",
  pose = 1,
}: {
  className?: string;
  imgClassName?: string;
  blink?: boolean;
  float?: boolean;
  priority?: boolean;
  style?: CSSProperties;
  alt?: string;
  pose?: 1 | 2;
}) {
  const src = pose === 2 ? mascotPose2.url : mascot;
  if (pose === 2) blink = false;
  const reduced = usePrefersReducedMotion();
  const [closed, setClosed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!blink || reduced) return;
    let alive = true;
    const loop = () => {
      timer.current = setTimeout(
        () => {
          if (!alive) return;
          setClosed(true);
          setTimeout(() => alive && setClosed(false), 120);
          loop();
        },
        3200 + Math.random() * 3600,
      );
    };
    loop();
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [blink, reduced]);

  return (
    <div className={cn("relative select-none", className)} style={style}>
      <div className={cn(float && !reduced && "animate-float")}>
        <div className={cn("relative", !reduced && "animate-breathe")}>
          <img
            src={src}
            alt={alt}
            draggable={false}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={cn("h-auto w-full drop-shadow-[0_28px_40px_rgba(20,2,44,0.55)]", imgClassName)}
          />
          {/* eyelids: thin bars sitting exactly over the mascot's eyes */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-100"
            style={{ opacity: closed ? 1 : 0 }}
          >
            <span className="absolute left-[36%] top-[46%] h-[7.5%] w-[16%] -translate-x-1/2 rounded-full bg-[#f8bd1f]" />
            <span className="absolute left-[63%] top-[45%] h-[7.5%] w-[16%] -translate-x-1/2 rounded-full bg-[#f8bd1f]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Soft light rings behind the mascot, matching the logo's glow language. */
export function MascotAura({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <div className="aura inset-[-18%] rounded-full opacity-70" />
      <div className={cn("absolute inset-[4%]", !reduced && "animate-orbit")}>
        <div className="absolute left-1/2 top-1/2 h-[78%] w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-mulberry/50 [transform:rotateX(72deg)]" />
        <div className="absolute left-1/2 top-1/2 h-[62%] w-[132%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-pink/35 [transform:rotateX(64deg)_rotateZ(18deg)]" />
      </div>
    </div>
  );
}
