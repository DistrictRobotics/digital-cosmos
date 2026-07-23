/* ─── Satellite catalog types & TLE system ─── */

export type SatelliteBus =
  | "starlink" | "starlink-v2" | "starlink-v3"
  | "gps-iii" | "gps-iiif"
  | "oneweb"
  | "cubesat-1u" | "cubesat-3u" | "cubesat-6u" | "cubesat-12u"
  | "comms-geo" | "comms-leo"
  | "science" | "telescope"
  | "iss" | "hubble"
  | "spy" | "recon"
  | "debris" | "rocket-body"
  | "unknown";

export type OrbitType = "leo" | "meo" | "geo" | "heo" | "gto" | "ssso";

export interface SatelliteEntry {
  noradId: number;
  name: string;
  intlDesignator: string;
  tleLine1: string;
  tleLine2: string;
  bus: SatelliteBus;
  orbitType: OrbitType;
  launchDate?: string;
  country?: string;
  constellation?: string;
  apogee: number;        // km
  perigee: number;       // km
  inclination: number;   // degrees
  period: number;        // minutes
  radarCross?: string;   // RCS category
  status: "active" | "inactive" | "decayed" | "unknown";
}

export interface SatelliteGroup {
  id: string;
  label: string;
  color: string;
  count: number;
  filter: (s: SatelliteEntry) => boolean;
}

export interface TelemetryData {
  lat: number;
  lon: number;
  alt: number;       // km
  velocity: number;  // km/s
  azimuth: number;
  elevation: number;
  range: number;     // km
  orbitPhase: number;
  inSunlight: boolean;
  nextPass?: { lat: number; lon: number; time: Date };
}

/* ─── TLE Fetch URLs (Celestrak) ─── */
export const TLE_SOURCES: Record<string, string> = {
  starlink: "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle",
  gps: "https://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=tle",
  oneweb: "https://celestrak.org/NORAD/elements/gp.php?GROUP=oneweb&FORMAT=tle",
  iss: "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle",
  hubble: "https://celestrak.org/NORAD/elements/gp.php?CATNR=20580&FORMAT=tle",
  science: "https://celestrak.org/NORAD/elements/gp.php?GROUP=science&FORMAT=tle",
  visual: "https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle",
  geo: "https://celestrak.org/NORAD/elements/gp.php?GROUP=geo&FORMAT=tle",
  cubesat: "https://celestrak.org/NORAD/elements/gp.php?GROUP=cubesat&FORMAT=tle",
  debris: "https://celestrak.org/NORAD/elements/gp.php?GROUP=debris&FORMAT=tle",
  "active-geo": "https://celestrak.org/NORAD/elements/gp.php?GROUP=active-geo&FORMAT=tle",
  "last-30-days": "https://celestrak.org/NORAD/elements/gp.php?GROUP=last-30-days&FORMAT=tle",
  stations: "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle",
  "weather": "https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=tle",
  "resource": "https://celestrak.org/NORAD/elements/gp.php?GROUP=resource&FORMAT=tle",
};

/* ─── Bus detection from satellite name ─── */
function detectBus(name: string): SatelliteBus {
  const n = name.toUpperCase();
  if (n.includes("STARLINK") || n.includes("STAR LINK")) {
    if (n.includes("V2") || n.includes("MINI")) return "starlink-v2";
    if (n.includes("V3")) return "starlink-v3";
    return "starlink";
  }
  if (n.includes("GPS") || n.includes("NAVSTAR")) {
    if (n.includes("IIIF") || n.includes("3F")) return "gps-iiif";
    return "gps-iii";
  }
  if (n.includes("ONEWEB") || n.includes("ONE WEB")) return "oneweb";
  if (n.includes("ISS") || n.includes("ZARYA")) return "iss";
  if (n.includes("HUBBLE")) return "hubble";
  if (n.includes("CUBE") || n.includes("CUBESAT") || n.includes("CUBE SAT")) {
    if (n.includes("6U")) return "cubesat-6u";
    if (n.includes("12U") || n.includes("12 U")) return "cubesat-12u";
    if (n.includes("3U") || n.includes("3 U")) return "cubesat-3u";
    return "cubesat-1u";
  }
  if (n.includes("MILSTAR") || n.includes("AEHF") || n.includes("DSCS") || n.includes("SDS")) return "comms-geo";
  if (n.includes("IRIDIUM") || n.includes("GLOBALSTAR")) return "comms-leo";
  if (n.includes("KEYHOLE") || n.includes("KH-") || n.includes("USA-") || n.includes("NRO")) return "spy";
  if (n.includes("LANDSAT") || n.includes("SENTINEL") || n.includes("TERRA") || n.includes("AQUA") || n.includes("AURA")) return "science";
  if (n.includes("TELESCOPE") || n.includes("OBSERVATORY") || n.includes("XMM") || n.includes("CHANDRA") || n.includes("FERMI")) return "telescope";
  if (n.includes("R/B") || n.includes("ROCKET") || n.includes("DEB") || n.includes("PAM") || n.includes("SL-")) return "rocket-body";
  return "unknown";
}

function detectOrbitType(inc: number, apogee: number): OrbitType {
  if (apogee < 2000) return inc > 80 ? "ssso" : "leo";
  if (apogee < 20000) return "meo";
  if (apogee < 40000) return "geo";
  if (apogee < 100000) return "heo";
  return "gto";
}

/* ─── Parse TLE bulk text into entries ─── */
export function parseTleBulk(text: string, defaultConstellation?: string): SatelliteEntry[] {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const entries: SatelliteEntry[] = [];

  for (let i = 0; i + 2 < lines.length; i += 3) {
    try {
      const name = lines[i].replace(/^0 /, "").trim();
      const line1 = lines[i + 1];
      const line2 = lines[i + 2];

      if (!line1.startsWith("1 ") || !line2.startsWith("2 ")) {
        // Try 2-line format (no name line)
        const t1 = lines[i];
        const t2 = lines[i + 1];
        if (t1.startsWith("1 ") && t2.startsWith("2 ")) {
          const norad = parseInt(t1.substring(2, 7));
          if (isNaN(norad)) continue;
          const apogee = parseFloat(t2.substring(26, 33)) * 6371 + 6371;
          const perigee = parseFloat(t2.substring(24, 33)) * 6371 + 6371;
          const inc = parseFloat(t2.substring(8, 16));
          const period = parseFloat(t2.substring(52, 63));
          entries.push({
            noradId: norad,
            name: `SAT ${norad}`,
            intlDesignator: t1.substring(9, 17),
            tleLine1: t1,
            tleLine2: t2,
            bus: "unknown",
            orbitType: detectOrbitType(inc, apogee),
            apogee: Math.round(apogee - 6371),
            perigee: Math.round(perigee - 6371),
            inclination: inc,
            period: period,
            status: "unknown",
            constellation: defaultConstellation,
          });
          continue;
        }
        continue;
      }

      const norad = parseInt(line1.substring(2, 7));
      if (isNaN(norad)) continue;

      const apogee = parseFloat(line2.substring(26, 33)) * 6371 + 6371;
      const perigee = parseFloat(line2.substring(24, 33)) * 6371 + 6371;
      const inc = parseFloat(line2.substring(8, 16));
      const period = parseFloat(line2.substring(52, 63));

      entries.push({
        noradId: norad,
        name,
        intlDesignator: line1.substring(9, 17),
        tleLine1: line1,
        tleLine2: line2,
        bus: detectBus(name),
        orbitType: detectOrbitType(inc, apogee),
        apogee: Math.round(apogee - 6371),
        perigee: Math.round(perigee - 6371),
        inclination: inc,
        period: period,
        status: "active",
        constellation: defaultConstellation,
      });
    } catch {
      continue;
    }
  }
  return entries;
}

/* ─── Fetch TLE data from Celestrak ─── */
export async function fetchTleGroup(group: string): Promise<string> {
  const url = TLE_SOURCES[group];
  if (!url) throw new Error(`Unknown TLE group: ${group}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TLE fetch failed: ${res.status} for ${group}`);
  return res.text();
}

/* ─── Fetch ALL TLE groups (12,000+ satellites) ─── */
export async function fetchAllTle(
  onProgress?: (loaded: number, total: number) => void
): Promise<SatelliteEntry[]> {
  const groups = Object.keys(TLE_SOURCES);
  let all: SatelliteEntry[] = [];
  let loaded = 0;

  // Fetch in parallel batches of 3
  for (let i = 0; i < groups.length; i += 3) {
    const batch = groups.slice(i, i + 3);
    const results = await Promise.allSettled(
      batch.map((g) => fetchTleGroup(g).then((text) => parseTleBulk(text, g)))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        all.push(...result.value);
      }
    }
    loaded += batch.length;
    onProgress?.(loaded, groups.length);
  }

  // Deduplicate by NORAD ID (keep first occurrence)
  const seen = new Set<number>();
  all = all.filter((s) => {
    if (seen.has(s.noradId)) return false;
    seen.add(s.noradId);
    return true;
  });

  return all;
}

/* ─── Search/filter helpers ─── */
export function searchSatellites(
  catalog: SatelliteEntry[],
  query: string
): SatelliteEntry[] {
  const q = query.toLowerCase();
  if (!q) return [];
  return catalog.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.noradId.toString().includes(q) ||
      s.constellation?.toLowerCase().includes(q) ||
      s.bus.toLowerCase().includes(q) ||
      s.country?.toLowerCase().includes(q)
  );
}

export function filterByOrbit(
  catalog: SatelliteEntry[],
  orbitType: OrbitType | "all"
): SatelliteEntry[] {
  if (orbitType === "all") return catalog;
  return catalog.filter((s) => s.orbitType === orbitType);
}

/* ─── Default groups for the feed chips ─── */
export const SATELLITE_GROUPS: SatelliteGroup[] = [
  { id: "starlink", label: "Starlink", color: "#00bbdd", count: 7000, filter: (s) => s.bus.startsWith("starlink") },
  { id: "gps", label: "GPS III", color: "#44ff88", count: 31, filter: (s) => s.bus.startsWith("gps") },
  { id: "oneweb", label: "OneWeb", color: "#ff8844", count: 650, filter: (s) => s.bus === "oneweb" },
  { id: "iss", label: "ISS", color: "#ffcc00", count: 1, filter: (s) => s.bus === "iss" },
  { id: "hubble", label: "Hubble", color: "#aa66ff", count: 1, filter: (s) => s.bus === "hubble" },
  { id: "cubesat", label: "CubeSats", color: "#66ffcc", count: 2500, filter: (s) => s.bus.startsWith("cubesat") },
  { id: "comms", label: "Comms", color: "#ff66aa", count: 800, filter: (s) => s.bus.startsWith("comms") },
  { id: "science", label: "Science", color: "#44aaff", count: 200, filter: (s) => s.bus === "science" || s.bus === "telescope" },
  { id: "geo", label: "GEO", color: "#ffaa44", count: 600, filter: (s) => s.orbitType === "geo" },
  { id: "debris", label: "Debris", color: "#888888", count: 5000, filter: (s) => s.bus === "debris" || s.bus === "rocket-body" },
];