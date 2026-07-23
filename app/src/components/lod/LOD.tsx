import { useRef, useEffect, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Group, Object3D } from "three";

/* ─── LOD (Level of Detail) — swaps children based on camera distance ─── */

interface LODLevel {
  distance: number;
  object: React.ReactNode;
}

export function LOD({ levels, position = [0, 0, 0] as [number, number, number], rotation = [0, 0, 0] as [number, number, number] }: {
  levels: LODLevel[]; position?: [number, number, number]; rotation?: [number, number, number];
}) {
  const ref = useRef<Group>(null);
  const [activeLOD, setActiveLOD] = useState(0);
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(...position));

  useFrame(() => {
    if (!ref.current) return;
    const dist = camera.position.distanceTo(pos.current);
    // Find the right level
    let idx = levels.length - 1;
    for (let i = 0; i < levels.length; i++) {
      if (dist <= levels[i].distance) { idx = i; break; }
    }
    if (idx !== activeLOD) setActiveLOD(idx);
  });

  return (
    <group ref={ref} position={position} rotation={rotation as any}>
      {levels[activeLOD]?.object}
    </group>
  );
}

/* ─── LODMesh — swaps geometry detail per camera distance ─── */
export function LODMesh({ position, highDetail, lowDetail, threshold = 40 }: {
  position?: [number, number, number]; highDetail: () => THREE.BufferGeometry;
  lowDetail: () => THREE.BufferGeometry; threshold?: number;
}) {
  const ref = useRef<Mesh>(null);
  const [detail, setDetail] = useState<"high" | "low">("high");
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(...(position || [0, 0, 0])));

  useFrame(() => {
    const dist = camera.position.distanceTo(pos.current);
    const newDetail = dist < threshold ? "high" : "low";
    if (newDetail !== detail) {
      setDetail(newDetail);
      if (ref.current) {
        ref.current.geometry.dispose();
        ref.current.geometry = newDetail === "high" ? highDetail() : lowDetail();
      }
    }
  });

  return <mesh ref={ref} position={position} geometry={highDetail()} />;
}

/* ─── LODStructure — distance-based structure detail ─── */
export function LODStructure({ children, position, threshold = 30 }: {
  children: React.ReactNode; position?: [number, number, number]; threshold?: number;
}) {
  const ref = useRef<Group>(null);
  const [visible, setVisible] = useState(true);
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(...(position || [0, 0, 0])));

  useFrame(() => {
    if (!ref.current) return;
    const dist = camera.position.distanceTo(pos.current);
    // Hide structures beyond 2x the threshold
    const shouldShow = dist < threshold * 2;
    if (shouldShow !== visible) setVisible(shouldShow);
  });

  if (!visible) return null;
  return <group ref={ref} position={position}>{children}</group>;
}

/* ─── BatchLOD — manages many structures with pooled LOD checks ─── */
export function BatchLOD({ items, checkInterval = 10 }: {
  items: { children: React.ReactNode; position: [number, number, number]; threshold?: number }[];
  checkInterval?: number;
}) {
  const ref = useRef<Group>(null);
  const [visible, setVisible] = useState<boolean[]>(items.map(() => true));
  const { camera } = useThree();
  const frameCount = useRef(0);

  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % checkInterval !== 0) return;
    const newVisible = items.map((item) => {
      const pos = new THREE.Vector3(...item.position);
      return camera.position.distanceTo(pos) < (item.threshold || 30) * 2;
    });
    setVisible(newVisible);
  });

  return (
    <group ref={ref}>
      {items.map((item, i) => visible[i] ? (
        <group key={i} position={item.position}>{item.children}</group>
      ) : null)}
    </group>
  );
}