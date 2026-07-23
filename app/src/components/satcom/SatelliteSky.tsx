import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Points, Mesh } from "three";
import type { SatelliteEntry } from "./satellite-catalog";

/* ─── SatelliteSky — renders visible satellites in the sky dome from a planet surface ─── */
export default function SatelliteSky({
  catalog, active, planetPosition = [0, 0, 0],
}: {
  catalog: SatelliteEntry[]; active: boolean; planetPosition?: [number, number, number];
}) {
  const ref = useRef<Points>(null);
  const satJsRef = useRef<any>(null);
  const { camera } = useThree();

  // Load satellite.js lazily
  useEffect(() => {
    import("satellite.js").then((mod) => { satJsRef.current = mod; });
  }, []);

  // Filter to brightest / most visible satellites
  const visibleSats = useMemo(() => {
    return catalog
      .filter((e) => e.bus && !["debris", "rocket-body"].includes(e.bus))
      .slice(0, 500);
  }, [catalog]);

  // Geometry
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(visibleSats.length * 3);
    const colors = new Float32Array(visibleSats.length * 3);
    const sizes = new Float32Array(visibleSats.length);
    for (let i = 0; i < visibleSats.length; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = 40 + Math.random() * 80;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
      colors[i * 3] = 0.4 + Math.random() * 0.6;
      colors[i * 3 + 1] = 0.4 + Math.random() * 0.6;
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
      sizes[i] = 0.1 + Math.random() * 0.2;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [visibleSats.length]);

  useFrame(({ clock }) => {
    if (!ref.current || !active || !satJsRef.current) return;
    const { twoline2satrec, propagate, eciToGeodetic, geodeticToEcf } = satJsRef.current;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const date = new Date(Date.now() + clock.getElapsedTime() * 1000 * 60);
    const pp = new THREE.Vector3(...planetPosition);
    const KM_TO_SKY = 1 / 200;

    // Update positions slowly — distribute updates across frames
    const start = Math.floor((clock.getElapsedTime() * 10) % visibleSats.length);
    const count = Math.min(10, visibleSats.length);

    for (let i = start; i < start + count && i < visibleSats.length; i++) {
      const e = visibleSats[i];
      if (!e.tleLine1 || !e.tleLine2) continue;
      try {
        const satrec = twoline2satrec(e.tleLine1, e.tleLine2);
        const pv = propagate(satrec, date);
        if (!pv || !pv.position) continue;
        const gd = eciToGeodetic(pv.position, 0);
        const ecf = geodeticToEcf(gd);
        const x = (ecf.x as number) * KM_TO_SKY;
        const y = (ecf.z as number) * KM_TO_SKY + 30;
        const z = (-(ecf.y as number)) * KM_TO_SKY;
        // Project into sky dome above player position
        pos[i * 3] = pp.x + x;
        pos[i * 3 + 1] = pp.y + Math.max(y, 20);
        pos[i * 3 + 2] = pp.z + z;
      } catch {}
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={ref}>
      <bufferGeometry {...geo.attributes} />
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─── SkySatelliteIndicator — ground-based satellite tracking overlay ─── */
export function SkySatelliteIndicator({ trackedSatellite, satelliteCatalog, active }: {
  trackedSatellite: SatelliteEntry | null; satelliteCatalog: SatelliteEntry[]; active: boolean;
}) {
  const ref = useRef<Mesh>(null);
  const trkPos = useRef(new THREE.Vector3(0, 60, 0));
  const satJsRef = useRef<any>(null);

  useEffect(() => {
    import("satellite.js").then((mod) => { satJsRef.current = mod; });
  }, []);

  useFrame(({ clock, camera }) => {
    if (!ref.current || !active || !trackedSatellite || !satJsRef.current) return;
    const { twoline2satrec, propagate, eciToGeodetic, geodeticToEcf } = satJsRef.current;
    const e = satelliteCatalog.find((s) => s.noradId === trackedSatellite.noradId);
    if (!e || !e.tleLine1 || !e.tleLine2) return;
    try {
      const satrec = twoline2satrec(e.tleLine1, e.tleLine2);
      const date = new Date(Date.now() + clock.getElapsedTime() * 1000 * 60);
      const pv = propagate(satrec, date);
      if (!pv || !pv.position) return;
      const gd = eciToGeodetic(pv.position, 0);
      const ecf = geodeticToEcf(gd);
      const KM_TO_SKY = 1 / 200;
      trkPos.current.set(
        (ecf.x as number) * KM_TO_SKY,
        Math.max((ecf.z as number) * KM_TO_SKY + 30, 20),
        (-(ecf.y as number)) * KM_TO_SKY
      );
      ref.current.position.lerp(trkPos.current, 0.05);
      // Look at the indicator
      const dir = new THREE.Vector3().subVectors(trkPos.current, camera.position).normalize();
      ref.current.lookAt(camera.position);
    } catch {}
  });

  if (!active || !trackedSatellite) return null;

  return (
    <mesh ref={ref} position={[0, 60, 0]}>
      <ringGeometry args={[0.15, 0.2, 16]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}