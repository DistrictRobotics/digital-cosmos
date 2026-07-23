import { useRef, useEffect, useState, useCallback } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, InstancedMesh, Mesh } from "three";
import type { SatelliteEntry, SatelliteBus } from "./satellite-catalog";
import { buildSatelliteModel } from "./Satellite3D";

/* ─── Constants ─── */
const EARTH_POS = new THREE.Vector3(22, 0, 0);
const KM_TO_SCENE = 1 / 3500;
const BATCH_SIZE = 200;
const MAX_SATS = 2000;

/* ─── Bus type geometry + color cache ─── */
interface BusGeometry {
  geometry: THREE.BufferGeometry;
  color: string;
}
const GEO_CACHE = new Map<SatelliteBus, BusGeometry>();

/* ─── Build a merged one-piece geometry for a bus type ─── */
function getBusGeometry(bus: SatelliteBus): BusGeometry | null {
  if (GEO_CACHE.has(bus)) return GEO_CACHE.get(bus)!;

  const temp = new THREE.Group();
  try { buildSatelliteModel(bus, temp); } catch { return null; }

  const geos: THREE.BufferGeometry[] = [];
  let repColor = "#c7c7cc";

  for (const child of temp.children) {
    if (!(child instanceof THREE.Mesh) || !child.geometry) continue;
    const g = child.geometry.clone();
    g.applyMatrix4(child.matrixWorld);
    geos.push(g);
    const mat = child.material;
    if (mat instanceof THREE.MeshStandardMaterial) {
      repColor = "#" + mat.color.getHexString();
    }
  }

  if (geos.length === 0) return null;

  // Manual vertex merge
  let totalVerts = 0;
  for (const g of geos) {
    const p = g.getAttribute("position");
    if (p) totalVerts += p.count;
  }
  if (totalVerts === 0) return null;

  const pos = new Float32Array(totalVerts * 3);
  const nrm = new Float32Array(totalVerts * 3);
  let off = 0;

  for (const g of geos) {
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    if (!p) continue;
    (p.array as Float32Array).forEach((v: number, i: number) => { pos[off * 3 + i] = v; });
    if (n) {
      (n.array as Float32Array).forEach((v: number, i: number) => { nrm[off * 3 + i] = v; });
    }
    off += p.count;
    g.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
  merged.computeVertexNormals();

  const result: BusGeometry = { geometry: merged, color: repColor };
  GEO_CACHE.set(bus, result);
  return result;
}

/* ─── Parsed TLE ─── */
interface ParsedSat {
  entry: SatelliteEntry;
  satrec: any;
  bus: SatelliteBus;
}

/* ─── Satellite bus color scheme ─── */
function busColor(bus: SatelliteBus): string {
  const map: Record<string, string> = {
    starlink: "#00bbdd", "starlink-v2": "#00ccdd", "starlink-v3": "#00ddee",
    "gps-iii": "#44ff88", "gps-iiif": "#44ff88",
    oneweb: "#ff8844",
    "cubesat-1u": "#66ffcc", "cubesat-3u": "#55eebb", "cubesat-6u": "#44ddaa", "cubesat-12u": "#33cc99",
    iss: "#ffcc00", hubble: "#aa66ff",
    "comms-geo": "#ffaa44", "comms-leo": "#ff66aa",
    science: "#44aaff", telescope: "#aa66ff",
    spy: "#ff4466", recon: "#ff4466",
    debris: "#888888", "rocket-body": "#666666",
  };
  return map[bus] || "#c7c7cc";
}

/* ─── SatelliteRenderer — REAL 3D InstancedMesh for 12,000+ satellites ─── */
export default function SatelliteRenderer({
  catalog,
  feedVisible,
  trackedSatellite,
  maxSats = MAX_SATS,
}: {
  catalog: SatelliteEntry[];
  feedVisible: Record<string, boolean>;
  trackedSatellite: SatelliteEntry | null;
  maxSats?: number;
}) {
  const { camera } = useThree();
  const parsedRef = useRef<ParsedSat[]>([]);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const batchRef = useRef(0);
  const meshRefs = useRef<Map<SatelliteBus, InstancedMesh>>(new Map());
  const matricesRef = useRef<Map<SatelliteBus, Float32Array>>(new Map());
  const colorsRef = useRef<Map<SatelliteBus, Float32Array>>(new Map());
  const countsRef = useRef<Map<SatelliteBus, number>>(new Map());
  const [busList, setBusList] = useState<SatelliteBus[]>([]);
  const satJsRef = useRef<any>(null);

  // Load satellite.js lazily
  useEffect(() => {
    import("satellite.js").then((mod) => { satJsRef.current = mod; });
  }, []);

  // Phase 1: Parse TLEs in background batches
  useEffect(() => {
    if (catalog.length === 0 || !satJsRef.current) return;
    const { twoline2satrec } = satJsRef.current;
    parsedRef.current = [];
    batchRef.current = 0;
    setReady(false);
    setProgress(0);

    const go = () => {
      const start = batchRef.current;
      const end = Math.min(start + BATCH_SIZE, catalog.length);
      for (let i = start; i < end; i++) {
        const e = catalog[i];
        if (!e.tleLine1 || !e.tleLine2) continue;
        try {
          parsedRef.current.push({ entry: e, satrec: twoline2satrec(e.tleLine1, e.tleLine2), bus: e.bus });
        } catch {}
      }
      batchRef.current = end;
      setProgress(Math.round((end / catalog.length) * 100));
      if (end < catalog.length) requestIdleCallback(go, { timeout: 50 });
      else setReady(true);
    };
    go();
  }, [catalog]);

  // Phase 2: When ready, organize by bus type and build instance data
  useEffect(() => {
    if (!ready) return;
    buildInstanceData(parsedRef.current, feedVisible, trackedSatellite, maxSats, matricesRef.current, colorsRef.current, countsRef.current);
    setBusList(Array.from(matricesRef.current.keys()));
  }, [ready, feedVisible, trackedSatellite, maxSats]);

  // Phase 3: Update instance matrices each frame
  useFrame(({ clock }) => {
    if (!ready || !satJsRef.current) return;
    const { propagate, eciToGeodetic, geodeticToEcf } = satJsRef.current;
    const date = new Date(Date.now() + clock.getElapsedTime() * 1000 * 60);
    const dummy = new THREE.Object3D();
    const wp = new THREE.Vector3();
    const sc = new THREE.Color();

    for (const [bus, mesh] of meshRefs.current) {
      const mats = matricesRef.current.get(bus);
      const cols = colorsRef.current.get(bus);
      const cnt = countsRef.current.get(bus) || 0;
      if (!mats || !cols || cnt === 0) { mesh.count = 0; continue; }

      const sats = parsedRef.current.filter((p) => p.bus === bus);
      let vi = 0;

      for (let i = 0; i < Math.min(cnt, sats.length); i++) {
        try {
          const pv = propagate(sats[i].satrec, date);
          if (!pv || !pv.position) continue;
          const gd = eciToGeodetic(pv.position, 0);
          const ecf = geodeticToEcf(gd);
          const x = (ecf.x as number) * KM_TO_SCENE;
          const y = (ecf.z as number) * KM_TO_SCENE;
          const z = (-(ecf.y as number)) * KM_TO_SCENE;

          wp.set(EARTH_POS.x + x, EARTH_POS.y + y, EARTH_POS.z + z);
          const dist = camera.position.distanceTo(wp);
          if (dist > 500) continue;

          dummy.position.copy(wp);
          dummy.rotation.y = date.getTime() * 0.00001 + i;
          dummy.scale.setScalar(0.06);
          dummy.updateMatrix();
          mats.set(dummy.matrix.elements, vi * 16);

          const bright = Math.max(0.25, 1 - dist / 500);
          sc.set(busColor(bus));
          cols[vi * 3] = sc.r * bright;
          cols[vi * 3 + 1] = sc.g * bright;
          cols[vi * 3 + 2] = sc.b * bright;
          vi++;
        } catch {}
      }

      mesh.count = vi;
      mesh.instanceMatrix.array.set(mats);
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.array.set(cols);
        mesh.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* One InstancedMesh per bus type */}
      {busList.map((bus) => {
        const bg = getBusGeometry(bus);
        if (!bg) return null;
        const cnt = countsRef.current.get(bus) || 0;
        if (cnt === 0) return null;
        return (
          <BusMesh
            key={bus}
            bus={bus}
            geometry={bg.geometry}
            color={bg.color}
            count={cnt}
            meshRefs={meshRefs}
          />
        );
      })}

      {/* Tracked satellite — full 3D model separate */}
      {trackedSatellite && ready && (
        <TrackedSatelliteModel catalog={catalog} trackedSatellite={trackedSatellite} />
      )}
    </group>
  );
}

/* ─── Build per-bus instance data ─── */
function buildInstanceData(
  parsed: ParsedSat[],
  feedVisible: Record<string, boolean>,
  trackedSatellite: SatelliteEntry | null,
  maxSats: number,
  matMap: Map<SatelliteBus, Float32Array>,
  colMap: Map<SatelliteBus, Float32Array>,
  cntMap: Map<SatelliteBus, number>,
) {
  const visibleGroups = new Set(Object.entries(feedVisible).filter(([, v]) => v).map(([k]) => k));
  const busGroups = new Map<SatelliteBus, number>();

  for (const p of parsed) {
    if (trackedSatellite && p.entry.noradId === trackedSatellite.noradId) continue;
    if (!visibleGroups.has(p.entry.constellation || "")) continue;
    busGroups.set(p.bus, (busGroups.get(p.bus) || 0) + 1);
  }

  matMap.clear();
  colMap.clear();
  cntMap.clear();

  for (const [bus, total] of busGroups) {
    const count = Math.min(total, maxSats);
    const mats = new Float32Array(count * 16);
    const cols = new Float32Array(count * 3);
    const c = new THREE.Color(busColor(bus));
    // Identity matrix + initial color
    for (let i = 0; i < count; i++) {
      mats[i * 16 + 0] = 1; mats[i * 16 + 5] = 1; mats[i * 16 + 10] = 1; mats[i * 16 + 15] = 1;
      cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
    }
    matMap.set(bus, mats);
    colMap.set(bus, cols);
    cntMap.set(bus, count);
  }
}

/* ─── Single InstancedMesh wrapper ─── */
function BusMesh({
  bus, geometry, color, count, meshRefs,
}: {
  bus: SatelliteBus;
  geometry: THREE.BufferGeometry;
  color: string;
  count: number;
  meshRefs: MutableRefObject<Map<SatelliteBus, InstancedMesh>>;
}) {
  const ref = useRef<InstancedMesh>(null!);

  useEffect(() => {
    if (ref.current) {
      meshRefs.current.set(bus, ref.current);
      // Enable instanceColor
      ref.current.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
      ref.current.count = 0;
    }
    return () => { meshRefs.current.delete(bus); };
  }, [bus, count]);

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} transparent opacity={0.9} />
    </instancedMesh>
  );
}

/* ─── Tracked satellite — full 3D model ─── */
function TrackedSatelliteModel({ catalog, trackedSatellite }: {
  catalog: SatelliteEntry[]; trackedSatellite: SatelliteEntry;
}) {
  const grp = useRef<Group>(null);
  const built = useRef(false);
  const entry = catalog.find((s) => s.noradId === trackedSatellite.noradId);
  if (!entry) return null;

  let satrec: ReturnType<typeof twoline2satrec> | null = null;
  try { satrec = twoline2satrec(entry.tleLine1, entry.tleLine2); } catch {}

  useEffect(() => {
    if (!grp.current || built.current) return;
    buildSatelliteModel(entry.bus, grp.current);
    const g1 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), new THREE.MeshBasicMaterial({ color: "#00d4ff", transparent: true, opacity: 0.1, wireframe: true, depthWrite: false }));
    grp.current.add(g1);
    const g2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshBasicMaterial({ color: "#00d4ff", transparent: true, opacity: 0.04, wireframe: true, depthWrite: false }));
    grp.current.add(g2);
    built.current = true;
  }, [entry.bus, entry.noradId]);

  useFrame(({ clock }) => {
    if (!grp.current || !satrec) return;
    const date = new Date(Date.now() + clock.getElapsedTime() * 1000 * 60);
    try {
      const pv = propagate(satrec, date);
      if (!pv || !pv.position) return;
      const gd = eciToGeodetic(pv.position, 0);
      const ecf = geodeticToEcf(gd);
      grp.current.position.set(
        EARTH_POS.x + (ecf.x as number) * KM_TO_SCENE,
        EARTH_POS.y + (ecf.z as number) * KM_TO_SCENE,
        EARTH_POS.z + (-(ecf.y as number)) * KM_TO_SCENE
      );
      grp.current.rotation.y = clock.getElapsedTime() * 0.3;
    } catch {}
  });

return null;
}