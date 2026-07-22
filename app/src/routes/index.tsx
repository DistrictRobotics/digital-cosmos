import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import SolarSystemScene from "../components/SolarSystemScene";

export const Route = createFileRoute("/")({ component: CosmosPortal });

/* ─── PLANET DATA ─── */
const PLANET_INFO: Record<string, { name: string; desc: string; emoji: string }> = {
  Sun: { name: "Sun", desc: "The center of our system — a massive ball of plasma powering all life.", emoji: "\u2600\uFE0F" },
  Mercury: { name: "Mercury", desc: "The smallest planet and closest to the Sun. A cratered, barren world.", emoji: "\u{1FA90}" },
  Venus: { name: "Venus", desc: "Earth's twin — similar size but shrouded in toxic, acidic clouds.", emoji: "\u{1FA90}" },
  Earth: { name: "Earth", desc: "Our home — the only known planet with liquid water and life.", emoji: "\u{1F30D}" },
  Mars: { name: "Mars", desc: "The Red Planet — home to the tallest mountain and largest canyon.", emoji: "\u{1FA90}" },
  Jupiter: { name: "Jupiter", desc: "The largest planet — a gas giant with a storm larger than Earth.", emoji: "\u{1FA90}" },
  Saturn: { name: "Saturn", desc: "Famous for its stunning ring system made of ice and rock.", emoji: "\u{1FA90}" },
  Uranus: { name: "Uranus", desc: "An ice giant that rotates on its side.", emoji: "\u{1FA90}" },
  Neptune: { name: "Neptune", desc: "The windiest planet — the most distant and coldest world.", emoji: "\u{1FA90}" },
};

function CosmosPortal() {
  const [focusPlanet, setFocusPlanet] = useState<string | null>(null);
  const [showUI, setShowUI] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  const handlePlanetClick = useCallback((name: string) => {
    setFocusPlanet((prev) => (prev === name ? null : name));
  }, []);

  const resetView = useCallback(() => {
    setFocusPlanet(null);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const s = window.scrollY > 50;
      setScrolled(s);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const planetInfo = focusPlanet ? PLANET_INFO[focusPlanet] : null;

  return (
    <div className="relative w-full min-h-screen bg-cosmos-bg text-cosmos-text overflow-x-hidden">
      {/* ─── 3D Solar System ─── */}
      <SolarSystemScene focusPlanet={focusPlanet} onPlanetClick={handlePlanetClick} />

      {/* ─── Top-left Brand ─── */}
      <div className={`fixed top-6 left-6 z-50 transition-all duration-500 ${scrolled ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <a href="https://drev.space" target="_blank" rel="noopener noreferrer" className="text-xs font-medium tracking-[0.2em] uppercase text-cosmos-accent/70 hover:text-cosmos-accent transition-colors">
          District Robotics
        </a>
        <div className="text-lg sm:text-xl font-display font-bold text-white mt-1">Digital Cosmos</div>
      </div>

      {/* ─── HERO / INTRO OVERLAY ─── */}
      <div className={`fixed inset-0 z-40 flex flex-col items-center justify-center text-center px-6 pointer-events-none transition-opacity duration-1000 ${scrolled ? "opacity-0" : "opacity-100"}`}>
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-medium tracking-[0.2em] uppercase text-cosmos-accent border border-cosmos-accent/30 rounded-full backdrop-blur-sm bg-black/20">
              Interactive Solar System
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
            <span className="text-gradient">Explore the</span><br />
            <span className="text-white">Digital Cosmos</span>
          </h1>
          <p className="text-base sm:text-lg text-cosmos-text-muted max-w-lg mx-auto mb-8 leading-relaxed">
            Twist, zoom, and navigate through a living solar system.
            Click any planet to learn more.
          </p>

          {/* Interaction hints */}
          <div className="flex items-center justify-center gap-6 text-xs text-cosmos-text-muted/60 mb-10">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" /></svg>
              Drag to rotate
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-3 3 3 3-3M6 12h12" /></svg>
              Scroll to zoom
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m9 9 3-3m0 0 3 3m-3-3v12" /></svg>
              Click a planet
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })} className="cta-gateway text-sm !px-8 !py-3">
              Start Exploring
            </button>
            <a href="https://drev.space" target="_blank" rel="noopener noreferrer" className="cta-bracket text-sm">
              Visit drev.space
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto animate-bounce">
          <span className="text-[10px] text-cosmos-text-muted/40 tracking-widest uppercase">Scroll down</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-cosmos-accent/50 to-transparent" />
        </div>
      </div>

      {/* ─── Planet Info Panel ─── */}
      {planetInfo && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-4 flex items-center gap-4 max-w-md w-[calc(100%-48px)] animate-[fadeUp_0.3s_ease-out]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{planetInfo.emoji}</span>
              <span className="font-display font-bold text-sm">{planetInfo.name}</span>
            </div>
            <p className="text-xs text-cosmos-text-muted mt-1 leading-relaxed">{planetInfo.desc}</p>
          </div>
          <button onClick={resetView} className="shrink-0 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg className="w-3.5 h-3.5 text-cosmos-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* ─── RESET VIEW BUTTON (always visible when focused) ─── */}
      {focusPlanet && (
        <button
          onClick={resetView}
          className="fixed top-6 right-6 z-50 glass-card px-4 py-2 text-xs text-cosmos-text-muted hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm9-4.5v4.5m0 0h4.5M12 12l-3 3" /></svg>
          Reset View
        </button>
      )}

      {/* ─── CONTENT SECTIONS (below the fold) ─── */}
      <div className="relative z-10 mt-[100vh]">
        {/* What Is */}
        <section className="py-32 reveal-section" style={{ background: "linear-gradient(180deg, rgba(7,11,20,0.95) 0%, rgba(7,11,20,1) 100%)" }}>
          <div className="section-inner">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-cosmos-accent mb-4 block">Explore the Unknown</span>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
                  Navigate a Living <span className="text-gradient">Solar System</span>
                </h2>
                <p className="text-cosmos-text-muted text-base sm:text-lg leading-relaxed mb-6">
                  Every planet you see above is a real 3D object in an interactive cosmos. Drag to orbit the Sun, zoom into Earth's blue glow, or click Saturn to examine its rings up close.
                </p>
                <p className="text-cosmos-text-muted text-base leading-relaxed">
                  80+ STEM missions await on the full District Robotics platform. Each planet is a gateway to new discoveries, ranks, and cosmic knowledge.
                </p>
              </div>
              <div className="glass-card p-8 aspect-[4/3] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 50%, rgba(0,212,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(99,102,241,0.15) 0%, transparent 50%)" }} />
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cosmos-accent to-cosmos-accent-dim shadow-lg glow-cyan" />
                  <div className="absolute w-32 h-32 rounded-full border border-cosmos-accent/20 animate-[spin_20s_linear_infinite]" />
                  <div className="absolute w-48 h-48 rounded-full border border-cosmos-violet/15 animate-[spin_35s_linear_infinite]" />
                  <div className="absolute w-64 h-64 rounded-full border border-cosmos-accent/10 animate-[spin_50s_linear_infinite_reverse]" />
                  <div className="absolute w-32 h-32 animate-[spin_20s_linear_infinite]"><div className="w-3 h-3 rounded-full bg-cosmos-green absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg" /></div>
                  <div className="absolute w-48 h-48 animate-[spin_35s_linear_infinite]"><div className="w-4 h-4 rounded-full bg-cosmos-accent absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg" /></div>
                  <div className="absolute w-64 h-64 animate-[spin_50s_linear_infinite_reverse]"><div className="w-2 h-2 rounded-full bg-cosmos-violet absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" /></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Planets list */}
        <section className="py-32" style={{ background: "linear-gradient(180deg, rgba(7,11,20,1) 0%, rgba(10,15,30,1) 100%)" }}>
          <div className="section-inner">
            <div className="text-center mb-16">
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-cosmos-accent mb-4 block">The System</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Our Celestial <span className="text-gradient">Neighborhood</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                { name: "Sun", color: "#ffa033", r: 8 },
                { name: "Mercury", color: "#b0a090", r: 0.6 },
                { name: "Venus", color: "#e8c878", r: 0.9 },
                { name: "Earth", color: "#1a6bff", r: 1.8 },
                { name: "Mars", color: "#d4513a", r: 0.8 },
                { name: "Jupiter", color: "#d4a06a", r: 2.5 },
                { name: "Saturn", color: "#e8d5a0", r: 2.0, ring: true },
                { name: "Uranus", color: "#7ec8e3", r: 1.5 },
                { name: "Neptune", color: "#4169e1", r: 1.4 },
              ].map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    handlePlanetClick(p.name);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="glass-card p-5 text-left group cursor-pointer transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_0_30px_rgba(0,212,255,0.08)]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full shrink-0" style={{
                      background: `radial-gradient(circle at 35% 35%, ${p.color}, ${p.color}88)`,
                      boxShadow: `0 0 12px ${p.color}44`,
                      width: p.r > 2 ? "40px" : "28px",
                      height: p.r > 2 ? "40px" : "28px",
                    }} />
                    <span className="font-display font-bold text-sm text-white">{p.name}</span>
                  </div>
                  <span className="text-[10px] text-cosmos-text-muted group-hover:text-cosmos-accent transition-colors">Click to focus &rarr;</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Launch Portal */}
        <section className="py-32 min-h-[60vh] flex items-center" style={{ background: "linear-gradient(180deg, rgba(10,15,30,1) 0%, rgba(7,11,20,1) 100%)" }}>
          <div className="section-inner text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Ready for the Full <span className="text-gradient">Universe</span>?
            </h2>
            <p className="text-cosmos-text-muted text-lg max-w-xl mx-auto mb-12 leading-relaxed">
              The 3D cosmos above is just the beginning. On the full District Robotics platform, 80+ STEM missions, live satellite data, and neural-rendered space await.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="https://drev.space/cosmos.html" target="_blank" rel="noopener noreferrer" className="cta-orbit">
                <span>Enter the Cosmos</span><span className="orbit-ring" />
              </a>
              <a href="https://drev.space" target="_blank" rel="noopener noreferrer" className="cta-gateway">Visit drev.space</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-cosmos-border" style={{ background: "#070b14" }}>
          <div className="section-inner flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-cosmos-text-muted">
              <span className="font-display font-bold text-white">Digital Cosmos</span> by <a href="https://drev.space" target="_blank" rel="noopener noreferrer" className="text-cosmos-accent hover:text-white transition-colors">District Robotics</a>
            </div>
            <div className="flex items-center gap-6 text-xs text-cosmos-text-muted">
              <a href="https://drev.space/services.html" target="_blank" rel="noopener noreferrer" className="hover:text-cosmos-accent transition-colors">Services</a>
              <a href="https://drev.space/stem-academy.html" target="_blank" rel="noopener noreferrer" className="hover:text-cosmos-accent transition-colors">STEM Academy</a>
              <a href="https://github.com/DistrictRobotics" target="_blank" rel="noopener noreferrer" className="hover:text-cosmos-accent transition-colors">GitHub</a>
            </div>
            <div className="text-xs text-cosmos-text-muted">&copy; {new Date().getFullYear()} District Robotics. Web7 Command OS.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
