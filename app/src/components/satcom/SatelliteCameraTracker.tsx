import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { SatelliteEntry } from "./satellite-catalog";

/* ─── Constants ─── */
const EARTH_POS = new THREE.Vector3(22, 0, 0);
const KM_TO_SCENE = 1 / 3500;

/* ─── SatelliteCameraTracker — smooth camera tracking ─── */
export default function SatelliteCameraTracker({
  trackedSatellite, catalog, active,
}: {
  trackedSatellite: SatelliteEntry | null; catalog: SatelliteEntry[]; active: boolean;
}) {
  const { camera } = useThree();
  const tgt = useRef(new THREE.Vector3(0, 50, 180));
  const cur = useRef(new THREE.Vector3(0, 50, 180));
  const lerp = useRef(1);
  const tracking = useRef(false);
  const satJs = useRef<any>(null);

  // Load satellite.js lazily
  if (!satJs.current && typeof window !== "undefined") {
    import("satellite.js").then((mod) => { satJs.current = mod; });
  }

  useFrame(({ clock }) => {
    if (!active || !trackedSatellite || !satJs.current) {
      if (tracking.current) { tgt.current.set(0, 50, 180); lerp.current = 0; tracking.current = false; }
      if (lerp.current < 1) {
        lerp.current = Math.min(lerp.current + 0.02, 1);
        const s = lerp.current * lerp.current * (3 - 2 * lerp.current);
        camera.position.lerpVectors(cur.current, tgt.current, s);
        camera.lookAt(0, 0, 0);
      }
      return;
    }
    const { twoline2satrec, propagate, eciToGeodetic, geodeticToEcf } = satJs.current;
    const e = catalog.find((s) => s.noradId === trackedSatellite.noradId);
    if (!e) return;
    let satrec: any = null;
    try { satrec = twoline2satrec(e.tleLine1, e.tleLine2); } catch {}
    if (!satrec) return;
    const date = new Date(Date.now() + clock.getElapsedTime() * 1000 * 60);
    try {
      const pv = propagate(satrec, date);
      if (!pv || !pv.position) return;
      const gd = eciToGeodetic(pv.position, 0);
      const ecf = geodeticToEcf(gd);
      const swp = new THREE.Vector3(
        EARTH_POS.x + (ecf.x as number) * KM_TO_SCENE,
        EARTH_POS.y + (ecf.z as number) * KM_TO_SCENE,
        EARTH_POS.z + (-(ecf.y as number)) * KM_TO_SCENE
      );
      tgt.current.set(swp.x + 0.8, swp.y + 0.5, swp.z + 0.8);
      if (!tracking.current) { cur.current.copy(camera.position); lerp.current = 0; tracking.current = true; }
      if (lerp.current < 1) {
        lerp.current = Math.min(lerp.current + 0.03, 1);
        const s = lerp.current * lerp.current * (3 - 2 * lerp.current);
        camera.position.lerpVectors(cur.current, tgt.current, s);
      } else {
        camera.position.lerp(tgt.current, 0.05);
      }
      camera.lookAt(swp);
    } catch {}
  });

  return null;
}