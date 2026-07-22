import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import SolarSystemScene from "../components/SolarSystem";
import RendererBadge from "../components/RendererBadge";

export const Route = createFileRoute("/")({ component: CosmosPortal });

const PLANET_INFO: Record<string, { name: string; desc: string; tag: string }> = {
  Sun: { name: "Sun", desc: "Massive plasma core — the gravitational heart of our system.", tag: "ENERGY SOURCE" },
  Mercury: { name: "Mercury", desc: "Smallest planet. Cratered surface, extreme temperature swings.", tag: "INNER WORLD" },
  Venus: { name: "Venus", desc: "Earth's toxic twin — sulfuric clouds, crushing atmosphere.", tag: "SISTER PLANET" },
  Earth: { name: "Earth", desc: "Our home. Liquid water, life, and the DREV global STEM network.", tag: "HUMANITY" },
  Mars: { name: "Mars", desc: "The Red Planet. Future colonies, robotics labs, and rover technology.", tag: "NEXT FRONTIER" },
  Jupiter: { name: "Jupiter", desc: "Gas giant. The Great Red Spot, 95 moons, immense magnetic field.", tag: "GIANT" },
  Saturn: { name: "Saturn", desc: "Ringed world. Ice and rock particles orbit in a vast celestial highway.", tag: "RING WORLD" },
  Uranus: { name: "Uranus", desc: "Ice giant rotating on its side. Faint rings, 27 moons.", tag: "SIDEWAYS WORLD" },
  Neptune: { name: "Neptune", desc: "Windiest planet. Deep blue, supersonic storms, farthest from the Sun.", tag: "FINAL FRONTIER" },
};

function CosmosPortal() {
  const [focusPlanet, setFocusPlanet] = useState<string | null>(null);
  const [showUI, setShowUI] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const handlePlanetClick = useCallback((name: string) => {
    setFocusPlanet((prev) => (prev === name ? null : name));
  }, []);

  const resetView = useCallback(() => setFocusPlanet(null), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const planetInfo = focusPlanet ? PLANET_INFO[focusPlanet] : null;

  return (
    <div className="relative w-full min-h-screen bg-cosmos-bg text-cosmos-text overflow-x-hidden">
      <SolarSystemScene focusPlanet={focusPlanet} onPlanetClick={handlePlanetClick} />
      <RendererBadge />

      {/* ─── TOP BAR — DREV COMMAND INTERFACE ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="pointer-events-auto">
            <div className="text-[10px] font-mono tracking-[0.3em] text-cyan-400/50">DREV.SPACE</div>
            <div className="text-xs font-display font-bold text-white/80">Digital Cosmos</div>
          </div>
          <div className="flex items-center gap-4 pointer-events-auto">
            <a href="https://drev.space" target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono text-cyan-400/50 hover:text-cyan-400 transition-colors px-3 py-1.5 border border-white/5 rounded hover:border-cyan-400/20">
              ENTER PLATFORM
            </a>
          </div>
        </div>
      </div>

      {/* ─── HOLOGRAPHIC COMMAND DASHBOARD ─── */}
      <div className="fixed bottom-16 left-6 z-50 pointer-events-none">
        <div className="glass-card p-3 backdrop-blur-md bg-black/30 border-cyan-500/10">
          <div className="text-[8px] font-mono tracking-[0.2em] text-cyan-400/30">SYSTEM</div>
          <div className="text-[10px] font-mono text-cyan-400/50 mt-1">
            {focusPlanet ? `FOCUS: ${focusPlanet.toUpperCase()}` : "ORBIT: FREE NAV"}
          </div>
          <div className="flex gap-2 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/20" />
          </div>
        </div>
      </div>

      {/* ─── INTERACTION HINTS ─── */}
      {!focusPlanet && !scrolled && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          <div className="glass-card p-3 backdrop-blur-md bg-black/30 border-cyan-500/10">
            <div className="flex flex-col gap-1.5 text-[9px] font-mono text-cyan-400/40">
              <span className="flex items-center gap-2">&#x2190; &#x2192; Drag to orbit</span>
              <span className="flex items-center gap-2">&#x2191; &#x2193; Scroll to zoom</span>
              <span className="flex items-center gap-2">&#x25CF; Click to explore</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── PLANET INFO PANEL ─── */}
      {planetInfo && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-4 flex items-center gap-4 max-w-lg w-[calc(100%-48px)] animate-[fadeUp_0.4s_ease-out] backdrop-blur-md bg-black/40 border-cyan-500/20">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white">{planetInfo.name}</span>
              <span className="text-[8px] font-mono tracking-wider text-cyan-400/50 px-1.5 py-0.5 border border-cyan-400/20 rounded">{planetInfo.tag}</span>
            </div>
            <p className="text-[11px] text-cyan-200/60 mt-1 leading-relaxed font-light">{planetInfo.desc}</p>
          </div>
          <button onClick={resetView} className="shrink-0 w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10">
            <svg className="w-3 h-3 text-cyan-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* ─── RESET VIEW ─── */}
      {focusPlanet && (
        <button onClick={resetView} className="fixed top-14 right-6 z-50 glass-card px-3 py-1.5 text-[10px] font-mono text-cyan-400/50 hover:text-cyan-400 transition-colors flex items-center gap-1.5 backdrop-blur-md bg-black/30 border-cyan-500/10">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm9-4.5v4.5m0 0h4.5M12 12l-3 3" /></svg>
          RESET
        </button>
      )}

      {/* ─── CONTENT SECTIONS ─── */}
      <div className="relative z-10 mt-[100vh]">
        {/* What Is */}
        <section className="py-32" style={{ background: "linear-gradient(180deg, rgba(7,11,20,0.98) 0%, rgba(7,11,20,1) 100%)" }}>
          <div className="section-inner">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400/50 mb-4 block">01 — EXPLORE</span>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
                  Navigate a Living <span className="text-gradient">Solar System</span>
                </h2>
                <p className="text-cyan-200/50 text-base sm:text-lg leading-relaxed mb-6 font-light">
                  Every planet above is a real 3D object in an interactive universe. Drag to orbit the Sun, zoom into Earth's blue glow, or click Saturn to examine its rings up close.
                </p>
                <p className="text-cyan-200/40 text-base leading-relaxed font-light">
                  80+ STEM missions await on the full District Robotics platform. Each planet is a gateway to new discoveries, ranks, and cosmic knowledge.
                </p>
              </div>
              <div className="glass-card p-8 aspect-[4/3] flex items-center justify-center overflow-hidden" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
                <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 50%, rgba(0,212,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(99,102,241,0.15) 0%, transparent 50%)" }} />
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg" style={{ boxShadow: "0 0 30px rgba(0,212,255,0.15)" }} />
                  <div className="absolute w-32 h-32 rounded-full border border-cyan-400/20 animate-[spin_20s_linear_infinite]" />
                  <div className="absolute w-48 h-48 rounded-full border border-indigo-400/15 animate-[spin_35s_linear_infinite]" />
                  <div className="absolute w-64 h-64 rounded-full border border-cyan-400/10 animate-[spin_50s_linear_infinite_reverse]" />
                  <div className="absolute w-32 h-32 animate-[spin_20s_linear_infinite]"><div className="w-3 h-3 rounded-full bg-green-400 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg" /></div>
                  <div className="absolute w-48 h-48 animate-[spin_35s_linear_infinite]"><div className="w-4 h-4 rounded-full bg-cyan-400 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg" /></div>
                  <div className="absolute w-64 h-64 animate-[spin_50s_linear_infinite_reverse]"><div className="w-2 h-2 rounded-full bg-indigo-400 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" /></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Planet grid */}
        <section className="py-32" style={{ background: "linear-gradient(180deg, rgba(7,11,20,1) 0%, rgba(10,15,30,1) 100%)" }}>
          <div className="section-inner">
            <div className="text-center mb-16">
              <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400/50 mb-4 block">02 — DESTINATIONS</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Our Celestial <span className="text-gradient">Neighborhood</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
              {[
                { name: "Mercury", color: "#b0a090", r: 0.6 },
                { name: "Venus", color: "#e8c878", r: 0.9 },
                { name: "Earth", color: "#1a6bff", r: 1.8 },
                { name: "Mars", color: "#d4513a", r: 0.8 },
                { name: "Jupiter", color: "#d4a06a", r: 2.5 },
                { name: "Saturn", color: "#e8d5a0", r: 2.0, ring: true },
                { name: "Uranus", color: "#7ec8e3", r: 1.5 },
                { name: "Neptune", color: "#4169e1", r: 1.4 },
              ].map((p) => (
                <button key={p.name} onClick={() => { handlePlanetClick(p.name); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="glass-card p-4 text-left group cursor-pointer transition-all duration-300 hover:translate-y-[-2px]" style={{ borderColor: "rgba(0,212,255,0.06)" }}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="rounded-full shrink-0" style={{
                      background: `radial-gradient(circle at 35% 35%, ${p.color}, ${p.color}66)`,
                      boxShadow: `0 0 12px ${p.color}33`,
                      width: p.r > 2 ? "36px" : "24px",
                      height: p.r > 2 ? "36px" : "24px",
                    }} />
                    <span className="font-display font-bold text-sm text-white/80">{p.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400/30 group-hover:text-cyan-400/60 transition-colors">FOCUS CAMERA &#x2192;</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Launch Portal */}
        <section className="py-32 min-h-[60vh] flex items-center" style={{ background: "linear-gradient(180deg, rgba(10,15,30,1) 0%, rgba(7,11,20,1) 100%)" }}>
          <div className="section-inner text-center max-w-3xl mx-auto">
            <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400/50 mb-4 block">03 — LAUNCH</span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              The Future Is Built by <span className="text-gradient">Explorers</span>
            </h2>
            <p className="text-cyan-200/40 text-lg max-w-xl mx-auto mb-12 leading-relaxed font-light">
              This 3D cosmos is just the beginning. On the full District Robotics platform, 80+ STEM missions, live satellite data, and neural-rendered space exploration await.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="https://drev.space/cosmos.html" target="_blank" rel="noopener noreferrer" className="cta-orbit">
                <span>START YOUR JOURNEY</span><span className="orbit-ring" />
              </a>
              <a href="https://drev.space" target="_blank" rel="noopener noreferrer" className="cta-gateway text-sm !px-8 !py-3">VISIT DREV.SPACE</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 border-t" style={{ borderColor: "rgba(0,212,255,0.06)", background: "#070b14" }}>
          <div className="section-inner flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[11px] font-mono text-cyan-200/30">
              <span className="text-white/70 font-display">Digital Cosmos</span> by <a href="https://drev.space" target="_blank" rel="noopener noreferrer" className="text-cyan-400/50 hover:text-cyan-400 transition-colors">District Robotics</a>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-mono text-cyan-200/30">
              <a href="https://drev.space/services.html" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400/60 transition-colors">Services</a>
              <a href="https://drev.space/stem-academy.html" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400/60 transition-colors">STEM Academy</a>
              <a href="https://github.com/DistrictRobotics" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400/60 transition-colors">GitHub</a>
            </div>
            <div className="text-[10px] font-mono text-cyan-200/30">&copy; {new Date().getFullYear()} DREV.SPACE</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
