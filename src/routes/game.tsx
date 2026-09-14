import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/game")({
  component: GameLauncher,
});

function GameLauncher() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.replace("/game/index.html" + window.location.search + window.location.hash);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#07050f] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent shadow-[0_0_20px_rgba(0,242,255,0.5)]" />
        <p className="font-mono text-sm tracking-widest text-cyan-300">LAUNCHING AYA...</p>
      </div>
    </div>
  );
}
