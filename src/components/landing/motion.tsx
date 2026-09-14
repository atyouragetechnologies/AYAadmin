import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Scroll-triggered reveal. One shared observer per element, unobserved after entry. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "p" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }

    // Immediately reveal if already visible in the viewport (e.g. Hero section above the fold)
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setSeen(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0.05 },
    );
    io.observe(el);

    // Failsafe: never leave content invisible if observer stalls
    const timer = setTimeout(() => setSeen(true), 1200);

    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [seen]);

  return (
    <As
      ref={ref as never}
      className={cn("reveal", seen && "reveal-in", className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </As>
  );
}

/** Mouse-follow tilt with depth. Pointer-only; disabled for touch and reduced motion. */
export function Tilt({
  children,
  className,
  strength = 7,
  lift = 14,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  lift?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${x * strength * 2}deg`);
    el.style.setProperty("--rx", `${-y * strength * 2}deg`);
    el.style.setProperty("--tz", `${lift}px`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--tz", "0px");
  };

  return (
    <div className="scene">
      <div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={reset}
        className={cn("tilt", className)}
      >
        {children}
      </div>
    </div>
  );
}

/** Normalised pointer position (-0.5..0.5) for hero parallax layers. */
export function usePointerParallax(enabled = true) {
  const [p, setP] = useState({ x: 0, y: 0 });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!enabled || reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let frame = 0;
    const on = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setP({
          x: e.clientX / window.innerWidth - 0.5,
          y: e.clientY / window.innerHeight - 0.5,
        });
      });
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => {
      window.removeEventListener("pointermove", on);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, reduced]);

  return p;
}
