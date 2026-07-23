import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import SolarSystemScene from "../components/SolarSystem";
import RendererBadge from "../components/RendererBadge";
import SatcomPanel from "../components/satcom/SatcomPanel";
import { fetchAllTle, type SatelliteEntry } from "../components/satcom/satellite-catalog";
import "../styles/cosmos.css";

export const Route = createFileRoute("/")({ component: CosmosPortal });

/* ── Real-time UTC clock (matches drev.space tickClock) ── */
function pad(n: number) { return String(n).padStart(2, "0"); }

function useUtcClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/* ── Planet info ── */
const PLANET_INFO: Record<string, { name: string; desc: string; tag: string; color: string }> = {
  Sun: { name: "Sun", desc: "Massive plasma core — the gravitational heart of our system. 1.3M Earths could fit inside.", tag: "G2V STAR", color: "#ffcc33" },
  Mercury: { name: "Mercury", desc: "Smallest planet. Cratered surface, wild temperature swings from -180°C to 430°C.", tag: "INNER WORLD", color: "#b0a090" },
  Venus: { name: "Venus", desc: "Earth's toxic twin. 470°C surface, sulfuric acid clouds, crushing 90-atm pressure.", tag: "SISTER PLANET", color: "#e8c878" },
  Earth: { name: "Earth", desc: "Our home. 71% liquid water, 8 million species, and the DREV global STEM network.", tag: "HUMANITY", color: "#4488cc" },
  Mars: { name: "Mars", desc: "The Red Planet. Olympus Mons (21km), Valles Marineris, 40% Earth gravity.", tag: "NEXT FRONTIER", color: "#c1442e" },
  Jupiter: { name: "Jupiter", desc: "Gas giant. 317 Earth masses, 95 moons, Great Red Spot storm bigger than Earth.", tag: "GIANT", color: "#d4a06a" },
  Saturn: { name: "Saturn", desc: "Ringed world. 95 Earth masses, 146 moons, rings span 280,000 km.", tag: "RING WORLD", color: "#e8d5a0" },
  Uranus: { name: "Uranus", desc: "Ice giant rotating on its side. 98° axial tilt, 27 moons, -224°C atmosphere.", tag: "SIDEWAYS WORLD", color: "#7ec8e3" },
  Neptune: { name: "Neptune", desc: "Windiest planet. 2,100 km/h winds, 16 moons, deep blue methane atmosphere.", tag: "FINAL FRONTIER", color: "#3355aa" },
};

/* ── Feed constellations ── */
const CONSTELLATIONS = [
  { group: "starlink", label: "Starlink", color: "#00bbdd", count: 42 },
  { group: "gps", label: "GPS III", color: "#44ff88", count: 31 },
  { group: "iss", label: "ISS", color: "#ff8844", count: 1 },
  { group: "hubble", label: "Hubble", color: "#aa66ff", count: 1 },
  { group: "cubesat", label: "CubeSats", color: "#ffcc00", count: 18 },
];

function CosmosPortal() {
  const utc = useUtcClock();
  const [focusPlanet, setFocusPlanet] = useState<string | null>(null);
  const [introDone, setIntroDone] = useState(false);
  const [feedVisible, setFeedVisible] = useState<Record<string, boolean>>({
    starlink: true, gps: true, iss: true, hubble: true, cubesat: true,
  });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  /* ── SATCOM state ── */
  const [satcomOpen, setSatcomOpen] = useState(false);
  const [satelliteCatalog, setSatelliteCatalog] = useState<SatelliteEntry[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogProgress, setCatalogProgress] = useState(0);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [trackedSatellite, setTrackedSatellite] = useState<SatelliteEntry | null>(null);

  /* ── Fetch TLE catalog on mount ── */
  useEffect(() => {
    if (satelliteCatalog.length > 0) return;
    setCatalogLoading(true);
    fetchAllTle((loaded, total) => {
      setCatalogProgress(loaded);
      setCatalogTotal(total);
    }).then((catalog) => {
      setSatelliteCatalog(catalog);
      setCatalogLoading(false);
    }).catch((err) => {
      console.error("TLE fetch failed:", err);
      setCatalogLoading(false);
    });
  }, []);

  /* ── 20s intro choreography ── */
  useEffect(() => {
    const timer = setTimeout(() => setIntroDone(true), 20000);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") setIntroDone(true);
    };
    window.addEventListener("keydown", handleKey);
    return () => { clearTimeout(timer); window.removeEventListener("keydown", handleKey); };
  }, []);

  /* ── Tooltip positioning ── */
  useEffect(() => {
    if (!tooltip || !tooltipRef.current) return;
    const el = tooltipRef.current;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let x = tooltip.x + 12;
    let y = tooltip.y + 12;
    if (x + w > window.innerWidth) x = tooltip.x - w - 12;
    if (y + h > window.innerHeight) y = tooltip.y - h - 12;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }, [tooltip]);

  const handlePlanetClick = useCallback((name: string) => {
    setFocusPlanet((prev) => (prev === name ? null : name));
  }, []);

  const resetView = useCallback(() => setFocusPlanet(null), []);

  const toggleFeed = useCallback((group: string) => {
    setFeedVisible((prev) => ({ ...prev, [group]: !prev[group] }));
  }, []);

  const handleTrackSatellite = useCallback((sat: SatelliteEntry) => {
    setTrackedSatellite((prev) => prev?.noradId === sat.noradId ? null : sat);
  }, []);

  const handleToggleConstellation = useCallback((groupId: string, visible: boolean) => {
    setFeedVisible((prev) => ({ ...prev, [groupId]: visible }));
  }, []);

  const planetInfo = focusPlanet ? PLANET_INFO[focusPlanet] : null;

  return (
    <div className="relative w-full min-h-screen" style={{ background: "#000" }}>
      {/* ─── 3D CANVAS ─── */}
      <SolarSystemScene
        focusPlanet={focusPlanet}
        onPlanetClick={handlePlanetClick}
        onHover={(name, x, y) => setTooltip(name ? { x, y, text: name } : null)}
        feedVisible={feedVisible}
        introDone={introDone}
        trackedSatellite={trackedSatellite}
        satelliteCatalog={satelliteCatalog}
      />

      {/* ─── INTRO OVERLAY ─── */}
      <div className={`intro-overlay${introDone ? " done" : ""}`}>
        <div className="intro-title">DIGITAL COSMOS</div>
        <div className="intro-sub">An operational universe. Powered by District Robotics.</div>
        <div className="flex gap-3 items-center">
          <button onClick={() => setIntroDone(true)} className="btn primary lg">EXPLORE</button>
          <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
            Esc or Space to skip
          </span>
        </div>
      </div>

      {/* ─── HUD TOP BAR ─── */}
      {introDone && (
        <div className="hud-top" style={{ zIndex: 100 }}>
          <div className="hud-left">
            <span className="hud-badge">DREV.SPACE</span>
            <span className="hud-badge" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
            <span className="hud-badge">DIGITAL COSMOS</span>
            <span className="hud-clock">{utc}</span>
          </div>
          <div className="hud-right">
            {/* SATCOM button */}
            <button
              onClick={() => setSatcomOpen(true)}
              className="feed-chip"
              data-on={satcomOpen ? "1" : "0"}
              style={{ color: satcomOpen ? "#00d4ff" : undefined }}
            >
              🛰️ SATCOM {satelliteCatalog.length > 0 ? satelliteCatalog.length.toLocaleString() : ""}
            </button>

            <div className="hud-feeds">
              {CONSTELLATIONS.map((c) => (
                <button
                  key={c.group}
                  className="feed-chip"
                  data-on={feedVisible[c.group] ? "1" : "0"}
                  onClick={() => toggleFeed(c.group)}
                >
                  {c.label} {c.count}
                </button>
              ))}
            </div>
            <a
              href="https://drev.space/cosmos.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn primary"
              style={{ padding: "6px 14px", fontSize: "11px", minHeight: "auto" }}
            >
              DREV.SPACE
            </a>
          </div>
        </div>
      )}

      {/* ─── TOOLTIP ─── */}
      <div
        ref={tooltipRef}
        className={`cosmos-tooltip${tooltip ? " visible" : ""}`}
        style={{ position: "fixed", zIndex: 10 }}
      >
        {tooltip?.text}
      </div>

      {/* ─── PLANET INFO PANEL ─── */}
      {introDone && planetInfo && (
        <div
          className="glass"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "16px 24px",
            maxWidth: "520px",
            width: "calc(100% - 48px)",
            animation: "fadeUp 0.4s ease-out",
          }}
        >
          <div className="w-10 h-10 rounded-full shrink-0" style={{ background: planetInfo.color, boxShadow: `0 0 16px ${planetInfo.color}55` }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white">{planetInfo.name}</span>
              <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${planetInfo.color}22`, color: planetInfo.color }}>
                {planetInfo.tag}
              </span>
            </div>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{planetInfo.desc}</p>
          </div>
          <button
            onClick={resetView}
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <svg className="w-3 h-3" style={{ color: "rgba(255,255,255,0.4)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ─── STEM ACADEMY CTA ─── */}
      {introDone && !focusPlanet && !satcomOpen && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 45 }}>
          <a
            href="https://drev.space/stem-academy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="btn glass"
            style={{ fontSize: "13px", padding: "10px 18px" }}
          >
            <span style={{ color: "rgba(255,255,255,0.8)" }}>80 Missions</span>
            <span style={{ color: "var(--accent)" }}>→</span>
          </a>
        </div>
      )}

      {/* ─── RESET VIEW ─── */}
      {introDone && focusPlanet && (
        <button
          onClick={resetView}
          className="glass"
          style={{
            position: "fixed",
            top: "60px",
            right: "20px",
            zIndex: 50,
            padding: "8px 16px",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm9-4.5v4.5m0 0h4.5M12 12l-3 3" />
          </svg>
          RESET
        </button>
      )}

      {/* ─── SATELLITE CONTROL INTERFACE ─── */}
      {introDone && trackedSatellite && !satcomOpen && (
        <div
          className="glass"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            padding: "12px 20px",
            maxWidth: "480px",
            width: "calc(100% - 48px)",
            animation: "fadeUp 0.3s ease-out",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs">🛰️</span>
              <span className="font-display font-bold text-sm text-white">{trackedSatellite.name}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(0,212,255,0.12)", color: "#00d4ff" }}>
                TRACKING
              </span>
            </div>
            <button
              onClick={() => setTrackedSatellite(null)}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <svg className="w-3 h-3" style={{ color: "rgba(255,255,255,0.4)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
            <span>NORAD {trackedSatellite.noradId}</span>
            <span>·</span>
            <span>{trackedSatellite.perigee}-{trackedSatellite.apogee} km</span>
            <span>·</span>
            <span>{trackedSatellite.inclination.toFixed(1)}° inc</span>
            <button
              onClick={() => setSatcomOpen(true)}
              className="ml-auto px-2 py-1 rounded text-[8px] font-mono tracking-wider"
              style={{ background: "rgba(0,212,255,0.08)", color: "#00d4ff" }}
            >
              DETAILS
            </button>
          </div>
        </div>
      )}

      {/* ─── SATCOM LOADING INDICATOR ─── */}
      {catalogLoading && (
        <div className="glass" style={{
          position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)",
          zIndex: 90, padding: "8px 16px", fontSize: "10px", fontFamily: "var(--font-mono)",
          color: "rgba(0,212,255,0.6)", whiteSpace: "nowrap",
        }}>
          Loading TLE catalog... {catalogProgress}/{catalogTotal}
        </div>
      )}

      {/* ─── SATCOM PANEL ─── */}
      <SatcomPanel
        catalog={satelliteCatalog}
        isOpen={satcomOpen}
        onClose={() => setSatcomOpen(false)}
        onTrackSatellite={handleTrackSatellite}
        trackedSatellite={trackedSatellite}
        onToggleConstellation={handleToggleConstellation}
        constellationVisibility={feedVisible}
      />

      <RendererBadge />
    </div>
  );
}