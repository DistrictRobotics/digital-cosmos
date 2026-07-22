import { useState, useMemo } from "react";
import { WORLDS, RANKS, getRank } from "../catalog/worlds";
import type { World, Mission, WorldRegion, WorldDifficulty } from "../catalog/types";

const REGIONS: { key: WorldRegion; label: string; icon: string }[] = [
  { key: "inner", label: "Inner System", icon: "☀️" },
  { key: "asteroid", label: "Asteroid Belt", icon: "💎" },
  { key: "jovian", label: "Jovian System", icon: "🌀" },
  { key: "saturnian", label: "Saturnian System", icon: "💫" },
  { key: "outer", label: "Outer Worlds", icon: "❄️" },
  { key: "deep", label: "Deep Space", icon: "🌌" },
];

const DIFFICULTY_COLORS: Record<WorldDifficulty, string> = {
  cadet: "#44ff88",
  pilot: "#44aaff",
  commander: "#ffaa44",
  explorer: "#ff6644",
  scientist: "#aa66ff",
};

/* ─── PROGRESS STORAGE (session mock — replace with backend) ─── */
function getProgress(): Record<string, { completed: boolean; xp: number }> {
  try {
    const d = JSON.parse(localStorage.getItem("stem_progress") || "{}");
    return d;
  } catch { return {}; }
}
function saveProgress(p: Record<string, { completed: boolean; xp: number }>) {
  localStorage.setItem("stem_progress", JSON.stringify(p));
}

/* ─── STEM ACADEMY ─── */
export default function StemAcademy() {
  const [view, setView] = useState<"map" | "world" | "mission">("map");
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [regionFilter, setRegionFilter] = useState<WorldRegion | "all">("all");
  const [progress, setProgress] = useState(getProgress());

  const totalXp = useMemo(() => Object.values(progress).reduce((s, p) => s + (p.completed ? p.xp : 0), 0), [progress]);
  const rank = getRank(totalXp);
  const nextRank = RANKS[Math.min(rank.level + 1, RANKS.length - 1)];
  const xpToNext = nextRank.xpRequired - totalXp;
  const xpProgress = rank.level < RANKS.length - 1 ? totalXp / nextRank.xpRequired : 1;

  const filteredWorlds = useMemo(() => {
    return regionFilter === "all" ? WORLDS : WORLDS.filter((w) => w.region === regionFilter);
  }, [regionFilter]);

  const completedMissions = useMemo(
    () => Object.entries(progress).filter(([, v]) => v.completed).length,
    [progress]
  );

  function completeMission(world: World, mission: Mission) {
    const key = `${world.id}:${mission.id}`;
    const next = { ...progress, [key]: { completed: true, xp: mission.xpReward } };
    setProgress(next);
    saveProgress(next);
  }

  return (
    <div className="min-h-screen" style={{ background: "#070b14", color: "#e0e8f0" }}>
      {/* ─── TOP BAR ─── */}
      <div className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(7,11,20,0.9)", borderColor: "rgba(0,212,255,0.08)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono tracking-[0.3em]" style={{ color: "rgba(0,212,255,0.5)" }}>DREVSA · STEM ACADEMY</span>
          </div>
          <div className="flex items-center gap-6">
            {/* Rank */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{rank.badge}</span>
              <div>
                <div className="text-[11px] font-display font-bold text-white/80">{rank.name}</div>
                <div className="text-[9px] font-mono" style={{ color: "rgba(0,212,255,0.5)" }}>
                  {totalXp} XP · {completedMissions}/{WORLDS.reduce((s, w) => s + w.missions.length, 0)} missions
                </div>
              </div>
            </div>
            {/* XP bar */}
            <div className="w-24">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${xpProgress * 100}%`, background: "linear-gradient(90deg, #00d4ff, #6366f1)" }} />
              </div>
              {rank.level < RANKS.length - 1 && (
                <div className="text-[8px] font-mono text-right mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
                  {xpToNext} XP to {nextRank.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="text-[11px] font-mono tracking-[0.3em] mb-3" style={{ color: "rgba(0,212,255,0.4)" }}>
          {WORLDS.length} WORLDS · {WORLDS.reduce((s, w) => s + w.missions.length, 0)} MISSIONS
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
          STEM Digital <span className="text-gradient">Cosmos</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: "rgba(224,232,240,0.5)" }}>
          Click a world — missions open on an interactive card with AI video. Complete missions to earn XP, ranks, and certificates.
        </p>

        {/* Region filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button onClick={() => setRegionFilter("all")}
            className="px-3 py-1.5 rounded text-[10px] font-mono tracking-wider transition-all border"
            style={{
              background: regionFilter === "all" ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.03)",
              borderColor: regionFilter === "all" ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.06)",
              color: regionFilter === "all" ? "#00d4ff" : "rgba(255,255,255,0.4)",
            }}>
            ALL REGIONS
          </button>
          {REGIONS.map((r) => (
            <button key={r.key} onClick={() => setRegionFilter(r.key)}
              className="px-3 py-1.5 rounded text-[10px] font-mono tracking-wider transition-all border flex items-center gap-1.5"
              style={{
                background: regionFilter === r.key ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.03)",
                borderColor: regionFilter === r.key ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.06)",
                color: regionFilter === r.key ? "#00d4ff" : "rgba(255,255,255,0.4)",
              }}>
              <span className="text-xs">{r.icon}</span> {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── WORLD GRID ─── */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredWorlds.map((world) => {
            const completedHere = world.missions.filter((m) => progress[`${world.id}:${m.id}`]?.completed).length;
            const isLocked = false; // Replace with real unlock logic
            return (
              <button
                key={world.id}
                onClick={() => { setSelectedWorld(world); setView("world"); }}
                className="relative text-left rounded-xl p-4 transition-all duration-300 border overflow-hidden group cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${world.color}15 0%, transparent 100%)`,
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                {/* Color accent bar */}
                <div className="absolute top-0 left-0 w-1 h-full" style={{ background: world.color }} />

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full" style={{ background: world.color, boxShadow: `0 0 8px ${world.color}44` }} />
                      <span className="font-display font-bold text-sm text-white/90">{world.name}</span>
                    </div>
                    <div className="text-[10px] font-mono mt-1" style={{ color: "rgba(224,232,240,0.4)" }}>{world.planet}</div>
                  </div>
                  {/* Difficulty */}
                  <span className="text-[8px] font-mono tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: `${DIFFICULTY_COLORS[world.difficulty]}22`, color: DIFFICULTY_COLORS[world.difficulty] }}>
                    {world.difficulty.toUpperCase()}
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed mb-3 line-clamp-2" style={{ color: "rgba(224,232,240,0.45)" }}>
                  {world.description}
                </p>

                {/* Progress */}
                <div className="flex items-center justify-between text-[9px] font-mono" style={{ color: "rgba(0,212,255,0.4)" }}>
                  <span>{completedHere}/{world.missions.length} missions</span>
                  <span className="text-white/30">{world.missions.reduce((s, m) => s + m.xpReward, 0)} XP</span>
                </div>
                <div className="mt-1 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(completedHere / world.missions.length) * 100}%`, background: world.color }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── WORLD DETAIL OVERLAY ─── */}
      {view === "world" && selectedWorld && (
        <WorldDetail
          world={selectedWorld}
          progress={progress}
          onBack={() => setView("map")}
          onSelectMission={(m) => { setSelectedMission(m); setView("mission"); }}
          onComplete={(m) => completeMission(selectedWorld, m)}
        />
      )}

      {/* ─── MISSION OVERLAY ─── */}
      {view === "mission" && selectedMission && selectedWorld && (
        <MissionDetail
          world={selectedWorld}
          mission={selectedMission}
          completed={!!progress[`${selectedWorld.id}:${selectedMission.id}`]?.completed}
          onBack={() => setView("world")}
          onComplete={() => { completeMission(selectedWorld, selectedMission); setView("world"); }}
        />
      )}
    </div>
  );
}

/* ─── WORLD DETAIL ─── */
function WorldDetail({
  world, progress, onBack, onSelectMission, onComplete,
}: {
  world: World; progress: Record<string, any>;
  onBack: () => void; onSelectMission: (m: Mission) => void; onComplete: (m: Mission) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(7,11,20,0.95)" }}>
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border p-6 md:p-8"
        style={{ background: `linear-gradient(135deg, ${world.color}11 0%, rgba(7,11,20,1) 100%)`, borderColor: `${world.color}33` }}>
        <button onClick={onBack} className="text-[10px] font-mono tracking-wider mb-6 flex items-center gap-1 transition-colors"
          style={{ color: "rgba(0,212,255,0.5)" }}>&larr; BACK TO MAP</button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full" style={{ background: world.color, boxShadow: `0 0 12px ${world.color}55` }} />
          <div>
            <h2 className="font-display text-xl font-bold text-white">{world.name}</h2>
            <div className="text-[11px] font-mono" style={{ color: "rgba(224,232,240,0.4)" }}>{world.subtitle}</div>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(224,232,240,0.5)" }}>{world.description}</p>

        {/* Environment tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {Object.entries(world.environment).filter(([, v]) => v && typeof v === "string" && v !== "none" && v !== "standard").map(([k, v]) => (
            <span key={k} className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded border"
              style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(224,232,240,0.4)" }}>
              {k}: {v}
            </span>
          ))}
        </div>

        {/* Missions */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono tracking-wider mb-3" style={{ color: "rgba(0,212,255,0.4)" }}>
            MISSIONS ({world.missions.length})
          </div>
          {world.missions.map((mission) => {
            const done = !!progress[`${world.id}:${mission.id}`]?.completed;
            const locked = mission.prerequisites.some((prereq) => !progress[`${world.id}:${prereq}`]?.completed);
            return (
              <div key={mission.id}
                className="rounded-xl p-4 border flex items-center justify-between gap-4"
                style={{ borderColor: done ? `${world.color}33` : "rgba(255,255,255,0.06)", opacity: locked ? 0.4 : 1 }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-white/80">{mission.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${world.color}22`, color: world.color }}>
                      {mission.type}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "rgba(224,232,240,0.4)" }}>{mission.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-[9px] font-mono" style={{ color: "rgba(0,212,255,0.3)" }}>
                    <span>+{mission.xpReward} XP</span>
                    <span>{mission.duration}</span>
                    {locked && <span style={{ color: "#ff6644" }}>LOCKED</span>}
                  </div>
                </div>
                {done ? (
                  <span className="text-lg">✅</span>
                ) : (
                  <button onClick={() => onSelectMission(mission)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all border"
                    style={{ borderColor: world.color, color: world.color, background: `${world.color}11` }}>
                    LAUNCH
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── MISSION DETAIL (Apple-glass card) ─── */
function MissionDetail({
  world, mission, completed, onBack, onComplete,
}: {
  world: World; mission: Mission; completed: boolean;
  onBack: () => void; onComplete: () => void;
}) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(7,11,20,0.97)" }}>
      <div className="max-w-lg w-full rounded-2xl overflow-hidden border"
        style={{ background: `linear-gradient(180deg, ${world.color}15 0%, rgba(7,11,20,1) 30%)`, borderColor: `${world.color}22` }}>
        {/* Video area */}
        <div className="aspect-video flex items-center justify-center cursor-pointer relative overflow-hidden"
          style={{ background: `radial-gradient(circle at 50% 50%, ${world.color}22 0%, transparent 70%)` }}>
          {showVideo ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-[10px] font-mono mb-2" style={{ color: world.color }}>AI TRAILER GENERATING</div>
                <div className="w-40 h-1 mx-auto rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div className="h-full rounded-full animate-pulse" style={{ width: "60%", background: world.color }} />
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowVideo(true)}
              className="flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all"
                style={{ background: `${world.color}22`, border: `2px solid ${world.color}44` }}>
                <span className="ml-1" style={{ color: world.color }}>&#9654;</span>
              </div>
              <span className="text-[9px] font-mono tracking-wider" style={{ color: "rgba(0,212,255,0.4)" }}>GENERATE AI BRIEFING</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-wider" style={{ color: world.color }}>{world.name}</span>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${world.color}22`, color: world.color }}>
              {mission.type.toUpperCase()}
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-white mb-1">{mission.title}</h3>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(224,232,240,0.5)" }}>{mission.description}</p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: "rgba(0,212,255,0.4)" }}>
              <span>+{mission.xpReward} XP</span>
              <span>&middot;</span>
              <span>{mission.duration}</span>
            </div>
            {mission.stripePriceId && (
              <div className="text-[11px] font-mono" style={{ color: "#ffcc00" }}>PREMIUM MISSION</div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onBack}
              className="flex-1 px-4 py-2.5 rounded-lg text-[10px] font-mono tracking-wider border transition-all"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
              BACK
            </button>
            {!completed && (
              <button onClick={onComplete}
                className="flex-1 px-4 py-2.5 rounded-lg text-[10px] font-mono tracking-wider transition-all border"
                style={{ borderColor: world.color, color: "#fff", background: world.color }}>
                COMPLETE MISSION
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
