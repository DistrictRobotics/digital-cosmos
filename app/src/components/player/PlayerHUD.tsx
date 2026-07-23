import type { PlayerMode } from "./PlayerController";

export default function PlayerHUD({ mode }: { mode: PlayerMode }) {
  return (
    <>
      {/* Crosshair */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          pointerEvents: "none",
        }}
      >
        {/* Center dot */}
        <div
          style={{
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            backgroundColor: "#00d4ff",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.8,
          }}
        />
        {/* Ring */}
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            border: "1px solid rgba(0,212,255,0.3)",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        {/* Corner brackets */}
        {[-1, 1].map((x) =>
          [-1, 1].map((y) => (
            <div
              key={`${x}${y}`}
              style={{
                position: "absolute",
                top: `${50 + y * 12}%`,
                left: `${50 + x * 12}%`,
                width: "6px",
                height: "1px",
                backgroundColor: "rgba(0,212,255,0.4)",
                transform: `translate(-${x > 0 ? "0" : "100"}%, -${y > 0 ? "0" : "100"}%)`,
              }}
            />
          ))
        )}
      </div>

      {/* Mode indicator */}
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {/* Mode label */}
        <div
          className="glass"
          style={{
            padding: "4px 12px",
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            color: "#00d4ff",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          {mode === "walk" && "ON FOOT"}
          {mode === "drone" && "DRONE"}
          {mode === "rover" && "ROVER"}
          {mode === "craft" && "CRAFT"}
        </div>

        {/* Controls hint */}
        <div
          style={{
            padding: "6px 14px",
            fontSize: "9px",
            fontFamily: "var(--font-mono)",
            color: "rgba(255,255,255,0.3)",
            textAlign: "center",
            lineHeight: "1.6",
          }}
        >
          <span style={{ color: "rgba(0,212,255,0.5)" }}>WASD</span> Move{" "}
          <span style={{ color: "rgba(0,212,255,0.5)" }}>TAB</span> Switch Mode{" "}
          <span style={{ color: "rgba(0,212,255,0.5)" }}>E</span> Interact{" "}
          <span style={{ color: "rgba(0,212,255,0.5)" }}>F</span> Exit Vehicle
        </div>
      </div>

      {/* Mode icons */}
      <div
        style={{
          position: "fixed",
          right: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 1000,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {(["walk", "drone", "rover", "craft"] as PlayerMode[]).map((m) => (
          <div
            key={m}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              background:
                m === mode
                  ? "rgba(0,212,255,0.15)"
                  : "rgba(255,255,255,0.03)",
              border:
                m === mode
                  ? "1px solid rgba(0,212,255,0.3)"
                  : "1px solid rgba(255,255,255,0.06)",
              color: m === mode ? "#00d4ff" : "rgba(255,255,255,0.2)",
              transition: "all 0.2s",
            }}
            title={
              m === "walk"
                ? "On Foot"
                : m === "drone"
                  ? "Drone"
                  : m === "rover"
                    ? "Rover"
                    : "Craft"
            }
          >
            {m === "walk" && "🧑"}
            {m === "drone" && "🛸"}
            {m === "rover" && "🚙"}
            {m === "craft" && "🚀"}
          </div>
        ))}
      </div>
    </>
  );
}