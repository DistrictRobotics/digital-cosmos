import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Points, Mesh } from "three";
import { twoline2satrec, propagate, eciToGeodetic, geodeticToEcf, degreesToRadians } from "satellite.js";
import type { SatelliteEntry, SatelliteBus } from "./satellite-catalog";
import { buildSatelliteModel } from "./Satellite3D";

/* ─── Constants ─── */
const EARTH_POS = new THREE.Vector3(22, 0, 0); // Earth's position in scene
const EARTH_RADIUS = 1.8; // Earth's radius in scene units
const SCENE_SCALE = 0.0004; // Convert km to scene units (Earth radius 6371km → 1.8 units, so 1 unit = 6371/1.8 ≈ 3540km, therefore 1km = 0.00028 units)
const KM_TO_SCENE = 1 / 3500; // Rough: 1km = 0.000285 scene units

const BATCH_SIZE = 200; // Process satellites in batches per frame
const MAX_DISPLAY_SATS = 2000; // Max satellites to render as points

const CONSTELLATION_COLORS: Record<string, string> = {
  starlink: "#00bbdd", gps: "#44ff88", oneweb: "#ff8844",
  iss: "#ffcc00", hubble: "#aa66ff", cubesat: "#66ffcc",
  comms: "#ff66aa", science: "#44aaff", geo: "#ffaa44",
  debris: "#888888", telescope: "#aa66ff",
};

/* ─── Cache for parsed TLEs ─── */
interface ParsedSat {
  entry: SatelliteEntry;
  satrec: ReturnType<typeof twoline2satrec>;
  bus: SatelliteBus;
}

/* ─── Satellite3DInstance — renders a single satellite with 3D model ─── */
function Satellite3DInstance({ parsed, scale = 1, isTracked = false }: {
  parsed: ParsedSat; scale?: number; isTracked?: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const built = useRef(false);

  useEffect(() => {
    if (!groupRef.current || built.current) return;
    buildSatelliteModel(parsed.bus, groupRef.current);
    built.current = true;
    // Add selection glow if tracked
    if (isTracked) {
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshBasicMaterial({ color: "#00d4ff", transparent: true, opacity: 0.08, wireframe: true, depthWrite: false })
      );
      groupRef.current.add(glow);
    }
  }, [parsed.bus, isTracked]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Propagate position
    const date = new Date(Date.now() + clock.getElapsedTime() * 1000 * 60); // 1 min per sec for visible motion
    try {
      const pv = propagate(parsed.satrec, date);
      if (!pv.position) return;
      const gd = eciToGeodetic(pv.position, 0);
      const ecf = geodeticToEcf(gd);
      const x = (ecf.x as number) * KM_TO_SCENE;
      const y = (ecf.z as number) * KM_TO_SCENE;
      const z = (-(ecf.y as number)) * KM_TO_SCENE;
      groupRef.current.position.set(
        EARTH_POS.x + x,
        EARTH_POS.y + y,
        EARTH_POS.z + z
      );
    } catch {}
  });

  return <group ref={groupRef} scale={scale} />;
}

/* ─── SatelliteRenderer main component ─── */
export default function SatelliteRenderer({
  catalog,
  feedVisible,
  trackedSatellite,
  maxDisplaySats = MAX_DISPLAY_SATS,
}: {
  catalog: SatelliteEntry[];
  feedVisible: Record<string, boolean>;
  trackedSatellite: SatelliteEntry | null;
  maxDisplaySats?: number;
}) {
  const pointsRef = useRef<Points>(null);
  const parsedRef = useRef<ParsedSat[]>([]);
  const isReady = useRef(false);
  const batchIndex = useRef(0);
  const { camera } = useThree();

  // Parse TLEs in background batches
  useEffect(() => {
    if (catalog.length === 0) return;
    isReady.current = false;
    batchIndex.current = 0;
    parsedRef.current = [];

    const processBatch = () => {
      const start = batchIndex.current;
      const end = Math.min(start + BATCH_SIZE, catalog.length);
      for (let i = start; i < end; i++) {
        const entry = catalog[i];
        if (!entry.tleLine1 || !entry.tleLine2) continue;
        try {
          const satrec = twoline2satrec(entry.tleLine1, entry.tleLine2);
          parsedRef.current.push({ entry, satrec, bus: entry.bus });
        } catch {}
      }
      batchIndex.current = end;
      if (end < catalog.length) {
        requestIdleCallback(processBatch, { timeout: 50 });
      } else {
        isReady.current = true;
      }
    };
    processBatch();
  }, [catalog]);

  // Compute visible satellites and render points
  useFrame(({ clock }) => {
    const pts = pointsRef.current;
    if (!pts || !isReady.current) return;
    const t = clock.getElapsedTime();
    const date = new Date(Date.now() + t * 1000 * 60);

    // Get visible constellation groups
    const visibleGroups = new Set(
      Object.entries(feedVisible).filter(([, v]) => v).map(([k]) => k)
    );

    // Filter catalog entries
    const visible = parsedRef.current.filter((p) => {
      if (trackedSatellite && p.entry.noradId === trackedSatellite.noradId) return false; // Render separately
      const group = p.entry.constellation || "";
      if (group && visibleGroups.has(group)) return true;
      if (!group) return true; // Show non-grouped satellites
      return false;
    });

    // Limit display count
    const display = visible.slice(0, maxDisplaySats);
    const count = display.length;
    if (count === 0) { pts.visible = false; return; }
    pts.visible = true;

    const geom = pts.geometry as THREE.BufferGeometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const colAttr = geom.attributes.color as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;
    const col = colAttr.array as Float32Array;

    // Ensure buffer is large enough
    const needed = count * 3;
    if (pos.length < needed) {
      // Resize
      const newPos = new Float32Array(needed);
      const newCol = new Float32Array(needed);
      posAttr.set(newPos);
      colAttr.set(newCol);
    }

    let idx = 0;
    for (const p of display) {
      try {
        const pv = propagate(p.satrec, date);
        if (!pv.position) continue;
        const gd = eciToGeodetic(pv.position, 0);
        const ecf = geodeticToEcf(gd);
        const x = (ecf.x as number) * KM_TO_SCENE;
        const y = (ecf.z as number) * KM_TO_SCENE;
        const z = (-(ecf.y as number)) * KM_TO_SCENE;

        // Check if within view distance
        const worldPos = new THREE.Vector3(EARTH_POS.x + x, EARTH_POS.y + y, EARTH_POS.z + z);
        const dist = camera.position.distanceTo(worldPos);
        if (dist > 500) continue; // Skip far away satellites

        pos[idx * 3] = EARTH_POS.x + x;
        pos[idx * 3 + 1] = EARTH_POS.y + y;
        pos[idx * 3 + 2] = EARTH_POS.z + z;

        const group = p.entry.constellation || "debris";
        const hex = CONSTELLATION_COLORS[group] || "#888888";
        const c = new THREE.Color(hex);
        // Distance-based brightness
        const brightness = Math.max(0.3, 1 - dist / 500);
        col[idx * 3] = c.r * brightness;
        col[idx * 3 + 1] = c.g * brightness;
        col[idx * 3 + 2] = c.b * brightness;
        idx++;
      } catch {}
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    geom.setDrawRange(0, idx);
    posAttr.count = idx;
    colAttr.count = idx;
  });

  return (
    <group>
      {/* Points for all satellites */}
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(maxDisplaySats * 3), 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[new Float32Array(maxDisplaySats * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Tracked satellite 3D model */}
      {trackedSatellite && parsedRef.current.length > 0 && (
        <TrackedSatelliteModel
          catalog={catalog}
          trackedSatellite={trackedSatellite}
        />
      )}
    </group>
  );
}

/* ─── Tracked satellite with full 3D model ─── */
function TrackedSatelliteModel({
  catalog, trackedSatellite,
}: {
  catalog: SatelliteEntry[]; trackedSatellite: SatelliteEntry;
}) {
  const groupRef = useRef<Group>(null);
  const built = useRef(false);

  const entry = catalog.find((s) => s.noradId === trackedSatellite.noradId);
  if (!entry) return null;

  let satrec: ReturnType<typeof twoline2satrec> | null = null;
  try {
    satrec = twoline2satrec(entry.tleLine1, entry.tleLine2);
  } catch {}

  useEffect(() => {
    if (!groupRef.current || built.current) return;
    buildSatelliteModel(entry.bus, groupRef.current);

    // Add glow ring
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshBasicMaterial({
        color: "#00d4ff", transparent: true, opacity: 0.1,
        wireframe: true, depthWrite: false,
      })
    );
    groupRef.current.add(glow);

    // Add label info
    built.current = true;
  }, [entry.bus, entry.noradId]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !satrec) return;
    const date = new Date(Date.now() + clock.getElapsedTime() * 1000 * 60);
    try {
      const pv = propagate(satrec, date);
      if (!pv.position) return;
      const gd = eciToGeodetic(pv.position, 0);
      const ecf = geodeticToEcf(gd);
      const x = (ecf.x as number) * KM_TO_SCENE;
      const y = (ecf.z as number) * KM_TO_SCENE;
      const z = (-(ecf.y as number)) * KM_TO_SCENE;
      groupRef.current.position.set(EARTH_POS.x + x, EARTH_POS.y + y, EARTH_POS.z + z);
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    } catch {}
  });

  return <group ref={groupRef} scale={0.15} />;
}

/* ─── Satellite camera tracking ─── */
export function SatelliteCameraTracker({
  trackedSatellite,
  catalog,
  active,
}: {
  trackedSatellite: SatelliteEntry | null;
  catalog: SatelliteEntry[];
  active: boolean;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 50, 180));
  const currentPos = useRef(new THREE.Vector3(0, 50, 180));
  const lerpProgress = useRef(1);
  const isTracking = useRef(false);

  let satrec: ReturnType<typeof twoline2satrec> | null = null;
  if (trackedSatellite) {
    const entry = catalog.find((s) => s.noradId === trackedSatellite.noradId);
    if (entry) {
      try { satrec = twoline2satrec(entry.tleLine1, entry.tleLine2); } catch {}
    }
  }

  useFrame(({ clock }) => {
    if (!active || !trackedSatellite || !satrec) {
      if (isTracking.current) {
        // Return to normal view
        targetPos.current.set(0, 50, 180);
        lerpProgress.current = 0;
        isTracking.current = false;
      }
      if (lerpProgress.current < 1) {
        lerpProgress.current = Math.min(lerpProgress.current + 0.02, 1);
        const t = lerpProgress.current;
        const smooth = t * t * (3 - 2 * t);
        camera.position.lerpVectors(currentPos.current, targetPos.current, smooth);
        camera.lookAt(0, 0, 0);
      }
      return;
    }

    // Propagate satellite position
    const date = new Date(Date.now() + clock.getElapsedTime() * 1000 * 60);
    try {
      const pv = propagate(satrec, date);
      if (!pv.position) return;
      const gd = eciToGeodetic(pv.position, 0);
      const ecf = geodeticToEcf(gd);
      const x = (ecf.x as number) * KM_TO_SCENE;
      const y = (ecf.z as number) * KM_TO_SCENE;
      const z = (-(ecf.y as number)) * KM_TO_SCENE;

      const satWorldPos = new THREE.Vector3(EARTH_POS.x + x, EARTH_POS.y + y, EARTH_POS.z + z);

      // Camera follows at a fixed offset
      targetPos.current.set(
        satWorldPos.x + 0.8,
        satWorldPos.y + 0.5,
        satWorldPos.z + 0.8
      );

      if (!isTracking.current) {
        currentPos.current.copy(camera.position);
        lerpProgress.current = 0;
        isTracking.current = true;
      }

      if (lerpProgress.current < 1) {
        lerpProgress.current = Math.min(lerpProgress.current + 0.03, 1);
        const t = lerpProgress.current;
        const smooth = t * t * (3 - 2 * t);
        camera.position.lerpVectors(currentPos.current, targetPos.current, smooth);
      } else {
        camera.position.lerp(targetPos.current, 0.05);
      }
      camera.lookAt(satWorldPos);
    } catch {}
  });

  return null;
}