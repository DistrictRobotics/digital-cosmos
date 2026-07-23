import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  type SatelliteEntry, type SatelliteBus, type OrbitType,
  type SatelliteGroup, type TelemetryData,
  searchSatellites, filterByOrbit, SATELLITE_GROUPS,
} from "./satellite-catalog";

/* ─── Constants ─── */
const ORBIT_COLORS: Record<OrbitType, string> = {
  leo: "#44ff88", meo: "#ffcc00", geo: "#ff8844",
  heo: "#ff6644", gto: "#aa66ff", ssso: "#44aaff",
};

/* ─── Satellite bus icon mapping ─── */
const BUS_ICONS: Record<SatelliteBus, string> = {
  starlink: "🛰️", "starlink-v2": "🛰️", "starlink-v3": "🛰️",
  "gps-iii": "📍", "gps-iiif": "📍",
  oneweb: "🌐",
  "cubesat-1u": "📦", "cubesat-3u": "📦", "cubesat-6u": "📦", "cubesat-12u": "📦",
  "comms-geo": "📡", "comms-leo": "📡",
  science: "🔬", telescope: "🔭",
  iss: "🏢", hubble: "🔭",
  spy: "🕵️", recon: "🕵️",
  debris: "💥", "rocket-body": "🚀",
  unknown: "❓",
};

/* ─── Simulated telemetry (in production, from satellite.js propagation) ─── */
function generateTelemetry(sat: SatelliteEntry, elapsed: number): TelemetryData {
  const phase = ((sat.noradId * 0.001 + elapsed * 0.0001) % 1);
  const lat = Math.sin(phase * Math.PI * 2) * sat.inclination;
  const lon = ((phase * 360 + sat.noradId * 0.1 + elapsed * 0.05) % 360) - 180;
  const alt = sat.perigee + (sat.apogee - sat.perigee) * Math.sin(phase * Math.PI * 4) * 0.5;
  const vel = Math.sqrt(398600 / (6371 + alt));
  return {
    lat, lon, alt: alt,
    velocity: vel,
    azimuth: (phase * 360 + 90) % 360,
    elevation: 45 + Math.sin(phase * Math.PI * 2) * 30,
    range: 350 + Math.random() * 200,
    orbitPhase: phase,
    inSunlight: Math.abs(phase - 0.5) > 0.15,
  };
}

/* ─── Props ─── */
interface SatcomPanelProps {
  catalog: SatelliteEntry[];
  isOpen: boolean;
  onClose: () => void;
  onTrackSatellite: (sat: SatelliteEntry) => void;
  trackedSatellite: SatelliteEntry | null;
  onToggleConstellation: (groupId: string, visible: boolean) => void;
  constellationVisibility: Record<string, boolean>;
}

export default function SatcomPanel({
  catalog, isOpen, onClose, onTrackSatellite,
  trackedSatellite, onToggleConstellation, constellationVisibility,
}: SatcomPanelProps) {
  const [query, setQuery] = useState("");
  const [selectedSat, setSelectedSat] = useState<SatelliteEntry | null>(null);
  const [orbitFilter, setOrbitFilter] = useState<OrbitType | "all">("all");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Telemetry tick
  useEffect(() => {
    if (!isOpen || !selectedSat) return;
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedSat]);

  // Update telemetry when selected satellite changes or time ticks
  useEffect(() => {
    if (!selectedSat) { setTelemetry(null); return; }
    setTelemetry(generateTelemetry(selectedSat, elapsed));
  }, [selectedSat, elapsed]);

  // Focus search input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search results
  const searchResults = useMemo(() => {
    if (activeGroup) {
      const group = SATELLITE_GROUPS.find((g) => g.id === activeGroup);
      if (group) return filterByOrbit(catalog.filter(group.filter), orbitFilter).slice(0, 200);
    }
    if (query.length < 2) return [];
    const results = searchSatellites(catalog, query);
    return filterByOrbit(results, orbitFilter).slice(0, 100);
  }, [catalog, query, activeGroup, orbitFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex" style={{ background: "rgba(0,0,0,0.85)" }}>
      {/* ─── MAIN PANEL ─── */}
      <div className="flex flex-col w-full max-w-[480px] h-full border-r" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.95)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div>
            <div className="text-[10px] font-mono tracking-wider" style={{ color: "rgba(0,212,255,0.5)" }}>SATCOM</div>
            <div className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>{catalog.length.toLocaleString()} satellites</div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <svg className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.4)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveGroup(null); }}
            placeholder="Search by name, NORAD ID, or constellation..."
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f5f5f7",
              fontFamily: "var(--font-mono)",
            }}
          />
        </div>

        {/* Orbit filter */}
        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {(["all", "leo", "ssso", "meo", "geo", "gto", "heo"] as const).map((o) => (
            <button key={o} onClick={() => setOrbitFilter(o)}
              className="text-[9px] font-mono tracking-wider px-2 py-1 rounded-full transition-all whitespace-nowrap"
              style={{
                background: orbitFilter === o ? `${ORBIT_COLORS[o] || "rgba(255,255,255,0.1)"}22` : "rgba(255,255,255,0.03)",
                color: orbitFilter === o ? (ORBIT_COLORS[o] || "rgba(255,255,255,0.5)") : "rgba(255,255,255,0.3)",
                border: `1px solid ${orbitFilter === o ? (ORBIT_COLORS[o] || "rgba(255,255,255,0.1)") + "44" : "rgba(255,255,255,0.06)"}`,
              }}>
              {o.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Group chips */}
        <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
          {SATELLITE_GROUPS.map((group) => {
            const isActive = activeGroup === group.id;
            const isVisible = constellationVisibility[group.id] !== false;
            return (
              <button key={group.id}
                onClick={() => setActiveGroup(isActive ? null : group.id)}
                onContextMenu={(e) => { e.preventDefault(); onToggleConstellation(group.id, !isVisible); }}
                className="text-[9px] font-mono px-2 py-1 rounded-full transition-all flex items-center gap-1"
                style={{
                  background: isActive ? `${group.color}22` : "rgba(255,255,255,0.03)",
                  color: isActive ? group.color : (isVisible ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"),
                  border: `1px solid ${isActive ? group.color + "44" : "rgba(255,255,255,0.06)"}`,
                  opacity: isVisible ? 1 : 0.5,
                }}>
                <span style={{ color: group.color }}>&#9679;</span>
                {group.label}
              </button>
            );
          })}
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {searchResults.length === 0 && query.length >= 2 && (
            <div className="text-center py-8 text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
              No satellites found
            </div>
          )}
          {searchResults.length === 0 && query.length < 2 && !activeGroup && (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">🛰️</div>
              <div className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                Search by name or NORAD ID<br/>
                or click a group above to browse
              </div>
            </div>
          )}
          <div className="space-y-1">
            {searchResults.map((sat) => {
              const isSelected = selectedSat?.noradId === sat.noradId;
              const isTracked = trackedSatellite?.noradId === sat.noradId;
              return (
                <button key={sat.noradId}
                  onClick={() => setSelectedSat(isSelected ? null : sat)}
                  onDoubleClick={() => { setSelectedSat(sat); onTrackSatellite(sat); }}
                  className="w-full text-left px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: isSelected ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isSelected ? "rgba(0,212,255,0.2)" : "transparent"}`,
                  }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs">{BUS_ICONS[sat.bus] || "🛰️"}</span>
                      <span className="text-[11px] font-mono truncate" style={{ color: "rgba(255,255,255,0.8)" }}>
                        {sat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[8px] font-mono px-1 py-0.5 rounded"
                        style={{ background: `${ORBIT_COLORS[sat.orbitType] || "#888"}22`, color: ORBIT_COLORS[sat.orbitType] || "#888" }}>
                        {sat.orbitType.toUpperCase()}
                      </span>
                      {isTracked && <span className="text-[10px]" style={{ color: "#00d4ff" }}>◎</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
                    <span>#{sat.noradId}</span>
                    <span>{sat.perigee}-{sat.apogee} km</span>
                    <span>{sat.inclination.toFixed(1)}°</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── DETAIL PANEL ─── */}
      {selectedSat && telemetry && (
        <div className="flex-1 overflow-y-auto p-6" style={{ minWidth: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{BUS_ICONS[selectedSat.bus] || "🛰️"}</span>
            <div>
              <div className="font-display font-bold text-base text-white">{selectedSat.name}</div>
              <div className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                NORAD {selectedSat.noradId} · {selectedSat.intlDesignator}
              </div>
            </div>
          </div>

          {/* Top-level badges */}
          <div className="flex gap-2 mb-6">
            <span className="text-[9px] font-mono tracking-wider px-2 py-1 rounded-full"
              style={{ background: `${ORBIT_COLORS[selectedSat.orbitType]}22`, color: ORBIT_COLORS[selectedSat.orbitType] }}>
              {selectedSat.orbitType.toUpperCase()}
            </span>
            <span className="text-[9px] font-mono tracking-wider px-2 py-1 rounded-full"
              style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff" }}>
              {selectedSat.bus.replace("-", " ").toUpperCase()}
            </span>
            {selectedSat.constellation && (
              <span className="text-[9px] font-mono tracking-wider px-2 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                {selectedSat.constellation.replace("-", " ").toUpperCase()}
              </span>
            )}
          </div>

          {/* Telemetry grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: "ALTITUDE", value: `${telemetry.alt.toFixed(0)} km` },
              { label: "VELOCITY", value: `${telemetry.velocity.toFixed(2)} km/s` },
              { label: "LATITUDE", value: `${telemetry.lat.toFixed(2)}°` },
              { label: "LONGITUDE", value: `${telemetry.lon.toFixed(2)}°` },
              { label: "AZIMUTH", value: `${telemetry.azimuth.toFixed(1)}°` },
              { label: "ELEVATION", value: `${telemetry.elevation.toFixed(1)}°` },
              { label: "RANGE", value: `${telemetry.range.toFixed(0)} km` },
              { label: "SUNLIGHT", value: telemetry.inSunlight ? "YES" : "NO", color: telemetry.inSunlight ? "#ffcc00" : "#444" },
            ].map((item) => (
              <div key={item.label} className="px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-[8px] font-mono tracking-wider mb-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>{item.label}</div>
                <div className="text-sm font-mono" style={{ color: item.color || "rgba(255,255,255,0.8)" }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Orbital elements */}
          <div className="mb-4">
            <div className="text-[10px] font-mono tracking-wider mb-2" style={{ color: "rgba(0,212,255,0.4)" }}>ORBITAL ELEMENTS</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "PERIGEE", value: `${selectedSat.perigee} km` },
                { label: "APOGEE", value: `${selectedSat.apogee} km` },
                { label: "INCLINATION", value: `${selectedSat.inclination.toFixed(2)}°` },
                { label: "PERIOD", value: `${selectedSat.period.toFixed(2)} min` },
              ].map((item) => (
                <div key={item.label} className="px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-[8px] font-mono tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>{item.label}</div>
                  <div className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.6)" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={() => onTrackSatellite(selectedSat)}
              className="flex-1 px-4 py-2.5 rounded-lg text-[11px] font-mono tracking-wider transition-all"
              style={{
                background: trackedSatellite?.noradId === selectedSat.noradId ? "rgba(0,212,255,0.15)" : "rgba(0,212,255,0.08)",
                border: `1px solid ${trackedSatellite?.noradId === selectedSat.noradId ? "rgba(0,212,255,0.3)" : "rgba(0,212,255,0.15)"}`,
                color: "#00d4ff",
              }}>
              {trackedSatellite?.noradId === selectedSat.noradId ? "TRACKING IN 3D" : "TRACK IN 3D"}
            </button>
          </div>
        </div>
      )}

      {/* Empty state for detail panel */}
      {!selectedSat && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-3">🛰️</div>
            <div className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
              Select a satellite to view telemetry<br/>
              <span className="text-[9px]">Double-click to track in 3D</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}