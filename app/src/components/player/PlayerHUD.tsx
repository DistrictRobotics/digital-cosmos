import { useRef, useEffect } from "react";
import type { PlayerMode } from "./PlayerController";

/* ─── Minimap ─── */
function Minimap({ mode }: { mode: PlayerMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw minimap border
    const size = 120;
    canvas.width = size;
    canvas.height = size;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Background
      ctx.fillStyle = "rgba(7, 11, 20, 0.7)";
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = "rgba(0, 212, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.stroke();

      // Grid lines
      ctx.strokeStyle = "rgba(0, 212, 255, 0.05)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(size / 2, size / 2);
        ctx.lineTo(size / 2 + Math.cos(angle) * size / 2, size / 2 + Math.sin(angle) * size / 2);
        ctx.stroke();
      }

      // Center dot (player)
      ctx.fillStyle = "#00d4ff";
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Direction indicator
      ctx.strokeStyle = "#00d4ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(size / 2, size / 2);
      ctx.lineTo(size / 2, size / 2 - 8);
      ctx.stroke();

      // Mode indicator
      ctx.fillStyle = "rgba(0, 212, 255, 0.4)";
      ctx.font = "6px monospace";
      ctx.textAlign = "center";
      const modeLabel = mode === "walk" ? "ON FOOT" : mode === "drone" ? "DRONE" : mode === "rover" ? "ROVER" : "CRAFT";
      ctx.fillText(modeLabel, size / 2, size - 6);
    };

    draw();
    const interval = setInterval(draw, 500);
    return () => clearInterval(interval);
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={120}
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 1000,
        width: "100px",
        height: "100px",
        pointerEvents: "none",
      }}
    />
  );
}

/* ─── Main HUD ─── */
export default function PlayerHUD({
  mode, nearbyInteraction, health = 100,
}: {
  mode: PlayerMode; nearbyInteraction: string | null; health?: number;
}) {
  return (
    <>
      {/* Crosshair */}
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1000, pointerEvents: "none" }}>
        <div style={{ width: "2px", height: "2px", borderRadius: "50%", backgroundColor: "#00d4ff", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.9 }} />
        <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "1px solid rgba(0,212,255,0.25)", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
        {/* Corner brackets */}
        {[-1, 1].map((x) => [-1, 1].map((y) => (
          <div key={`${x}${y}`} style={{
            position: "absolute", top: `${50 + y * 10}%`, left: `${50 + x * 10}%`,
            width: "5px", height: "1px", backgroundColor: "rgba(0,212,255,0.35)",
            transform: `translate(-${x > 0 ? "0" : "100"}%, -${y > 0 ? "0" : "100"}%)`,
          }} />
        )))}
      </div>

      {/* Minimap */}
      <Minimap mode={mode} />

      {/* Health bar */}
      <div style={{
        position: "fixed", bottom: "20px", left: "130px", zIndex: 1000,
        pointerEvents: "none", display: "flex", flexDirection: "column", gap: "2px",
      }}>
        <div style={{ width: "80px", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ width: `${health}%`, height: "100%", background: "linear-gradient(90deg, #00d4ff, #00ff88)", borderRadius: "2px", transition: "width 0.3s" }} />
        </div>
        <div style={{ fontSize: "7px", fontFamily: "monospace", color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>SHIELD</div>
      </div>

      {/* Mode indicator */}
      <div style={{
        position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)",
        zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
      }}>
        <div className="glass" style={{
          padding: "3px 10px", fontSize: "9px", fontFamily: "monospace",
          color: "#00d4ff", letterSpacing: "2px", textTransform: "uppercase",
        }}>
          {mode === "walk" && "ON FOOT"}
          {mode === "drone" && "DRONE"}
          {mode === "rover" && "ROVER"}
          {mode === "craft" && "CRAFT"}
        </div>
        <div style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
          WASD Move · TAB Switch · F Exit
        </div>
      </div>

      {/* Interaction prompt */}
      {nearbyInteraction && (
        <div style={{
          position: "fixed", bottom: "130px", left: "50%", transform: "translateX(-50%)",
          zIndex: 1000, pointerEvents: "none",
          padding: "6px 14px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
          borderRadius: "6px", border: "1px solid rgba(0,212,255,0.15)",
          color: "rgba(255,255,255,0.6)", fontSize: "10px", fontFamily: "monospace",
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          <span style={{
            padding: "1px 5px", background: "rgba(0,212,255,0.1)", borderRadius: "3px",
            color: "#00d4ff", fontSize: "9px", fontWeight: "bold",
          }}>E</span>
          {nearbyInteraction}
        </div>
      )}

      {/* Mode icons sidebar */}
      <div style={{
        position: "fixed", right: "12px", top: "50%", transform: "translateY(-50%)",
        zIndex: 1000, pointerEvents: "none", display: "flex", flexDirection: "column", gap: "6px",
      }}>
        {(["walk", "drone", "rover", "craft"] as PlayerMode[]).map((m) => (
          <div key={m} style={{
            width: "24px", height: "24px", borderRadius: "5px", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "10px",
            background: m === mode ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.02)",
            border: m === mode ? "1px solid rgba(0,212,255,0.25)" : "1px solid rgba(255,255,255,0.04)",
            color: m === mode ? "#00d4ff" : "rgba(255,255,255,0.15)",
          }}>
            {m === "walk" ? "🧑" : m === "drone" ? "🛸" : m === "rover" ? "🚙" : "🚀"}
          </div>
        ))}
      </div>
    </>
  );
}