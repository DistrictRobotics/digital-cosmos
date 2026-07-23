import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Points, Mesh } from "three";

/* ═══════════════════════════════════════════
   PARTICLE SYSTEM LIBRARY
   ═══════════════════════════════════════════ */

/* ─── Helper: create a reusable points geometry ─── */
function createPointsGeometry(count: number, size: number, spread: [number, number, number]): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * spread[0];
    pos[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
  }
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return g;
}

/* ─── Dust Storm ─── */
export function DustStorm({ position = [0, 0, 0], count = 800, radius = 8, color = "#c48844" }: {
  position?: [number, number, number]; count?: number; radius?: number; color?: string;
}) {
  const ref = useRef<Points>(null);
  const nextPos = useRef<Float32Array | null>(null);
  const geo = useMemo(() => createPointsGeometry(count, 0.04, [radius * 2, radius * 0.3, radius * 2]), [count, radius]);
  const dirs = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(angle) * (0.5 + Math.random() * 0.5);
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      arr[i * 3 + 2] = Math.sin(angle) * (0.5 + Math.random() * 0.5);
    }
    return arr;
  }, [count]);
  const speeds = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = 0.5 + Math.random() * 1.5;
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += dirs[i * 3] * speeds[i] * delta * 0.5;
      pos[i * 3 + 1] += dirs[i * 3 + 1] * speeds[i] * delta * 0.3;
      pos[i * 3 + 2] += dirs[i * 3 + 2] * speeds[i] * delta * 0.5;
      if (Math.abs(pos[i * 3]) > radius) pos[i * 3] *= -0.9;
      if (Math.abs(pos[i * 3 + 2]) > radius) pos[i * 3 + 2] *= -0.9;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={position}>
      <bufferGeometry {...geo.attributes} />
      <pointsMaterial size={0.04} color={color} transparent opacity={0.15} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ─── Acid Rain ─── */
export function AcidRain({ position = [0, 0, 0], count = 600, width = 8, color = "#88aa44" }: {
  position?: [number, number, number]; count?: number; width?: number; color?: string;
}) {
  const ref = useRef<Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * width;
      pos[i * 3 + 1] = Math.random() * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * width;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, width]);
  const speeds = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = 1 + Math.random() * 2;
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= speeds[i] * delta;
      if (pos[i * 3 + 1] < -0.2) {
        pos[i * 3] = (Math.random() - 0.5) * width;
        pos[i * 3 + 1] = 1.8 + Math.random() * 0.4;
        pos[i * 3 + 2] = (Math.random() - 0.5) * width;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={position}>
      <bufferGeometry {...geo.attributes} />
      <pointsMaterial size={0.015} color={color} transparent opacity={0.2} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ─── Snowfall ─── */
export function Snowfall({ position = [0, 0, 0], count = 400, width = 8, color = "#ffffff" }: {
  position?: [number, number, number]; count?: number; width?: number; color?: string;
}) {
  const ref = useRef<Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * width;
      pos[i * 3 + 1] = Math.random() * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * width;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, width]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= (0.3 + Math.sin(i) * 0.2) * delta;
      pos[i * 3] += Math.sin(Date.now() * 0.001 + i) * delta * 0.1;
      if (pos[i * 3 + 1] < -0.2) {
        pos[i * 3] = (Math.random() - 0.5) * width;
        pos[i * 3 + 1] = 1.8 + Math.random() * 0.4;
        pos[i * 3 + 2] = (Math.random() - 0.5) * width;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={position}>
      <bufferGeometry {...geo.attributes} />
      <pointsMaterial size={0.02} color={color} transparent opacity={0.2} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ─── Ash Fall ─── */
export function AshFall({ position = [0, 0, 0], count = 500, width = 6, color = "#444444" }: {
  position?: [number, number, number]; count?: number; width?: number; color?: string;
}) {
  const ref = useRef<Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * width;
      pos[i * 3 + 1] = Math.random() * 2.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * width;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, width]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= (0.2 + Math.sin(i * 0.5) * 0.1) * delta;
      pos[i * 3] += Math.sin(Date.now() * 0.0005 + i * 0.3) * delta * 0.05;
      if (pos[i * 3 + 1] < -0.2) {
        pos[i * 3] = (Math.random() - 0.5) * width;
        pos[i * 3 + 1] = 2.3 + Math.random() * 0.4;
        pos[i * 3 + 2] = (Math.random() - 0.5) * width;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={position}>
      <bufferGeometry {...geo.attributes} />
      <pointsMaterial size={0.025} color={color} transparent opacity={0.12} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ─── Ice Crystals ─── */
export function IceCrystals({ position = [0, 0, 0], count = 300, radius = 5, color = "#88ddff" }: {
  position?: [number, number, number]; count?: number; radius?: number; color?: string;
}) {
  const ref = useRef<Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * radius * 0.3;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, radius]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * delta * 0.05;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={position}>
      <bufferGeometry {...geo.attributes} />
      <pointsMaterial size={0.015} color={color} transparent opacity={0.15} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ─── Bioluminescence ─── */
export function Bioluminescence({ position = [0, 0, 0], count = 200, radius = 4, color = "#44ffaa" }: {
  position?: [number, number, number]; count?: number; radius?: number; color?: string;
}) {
  const ref = useRef<Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, radius]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    (ref.current.material as THREE.PointsMaterial).opacity = 0.08 + Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
  });

  return (
    <points ref={ref} position={position}>
      <bufferGeometry {...geo.attributes} />
      <pointsMaterial size={0.025} color={color} transparent opacity={0.12} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ─── Lightning Bolt ─── */
export function LightningBolt({ position = [0, 0, 0], height = 1.5, color = "#4488ff" }: {
  position?: [number, number, number]; height?: number; color?: string;
}) {
  const ref = useRef<Mesh>(null);
  const lastStrike = useRef(0);
  const visible = useRef(false);
  // Initial geometry
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, height, 0)
  ]), [height]);
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 4, 0.01, 4, false), [curve]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const now = clock.getElapsedTime();
    if (!visible.current && now - lastStrike.current > 3 + Math.random() * 5) {
      visible.current = true;
      lastStrike.current = now;
      const pts: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
      let x = 0, z = 0;
      for (let i = 0; i < 8; i++) {
        x += (Math.random() - 0.5) * 0.1;
        z += (Math.random() - 0.5) * 0.1;
        pts.push(new THREE.Vector3(x, (i / 8) * height, z));
      }
      const c = new THREE.CatmullRomCurve3(pts);
      ref.current.geometry.dispose();
      ref.current.geometry = new THREE.TubeGeometry(c, 8, 0.008, 4, false);
    }
    if (visible.current) {
      const elapsed = now - lastStrike.current;
      (ref.current.material as any).opacity = Math.max(0, 0.6 - elapsed * 3);
      if (elapsed > 0.3) { visible.current = false; (ref.current.material as any).opacity = 0; }
    }
  });

  return (
    <mesh ref={ref} geometry={tubeGeo} position={position}>
      <meshBasicMaterial color={color} transparent opacity={0} />
    </mesh>
  );
}

/* ─── Aurora ─── */
export function Aurora({ position = [0, 0, 0], width = 8, color = "#44ff88" }: {
  position?: [number, number, number]; width?: number; color?: string;
}) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    (ref.current.material as any).opacity = 0.04 + Math.sin(clock.getElapsedTime() * 0.2) * 0.02;
    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.05) * 0.1;
  });

  return (
    <mesh ref={ref} position={position}>
      <planeGeometry args={[width, width * 0.3, 12, 4]} />
      <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ─── Bubbles ─── */
export function Bubbles({ position = [0, 0, 0], count = 100, radius = 3, color = "#88ccff" }: {
  position?: [number, number, number]; count?: number; radius?: number; color?: string;
}) {
  const ref = useRef<Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, radius]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * 0.2;
      if (pos[i * 3 + 1] > 0.3) {
        const theta = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        pos[i * 3] = Math.cos(theta) * r;
        pos[i * 3 + 1] = -0.3;
        pos[i * 3 + 2] = Math.sin(theta) * r;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} position={position}>
      <bufferGeometry {...geo.attributes} />
      <pointsMaterial size={0.015} color={color} transparent opacity={0.1} sizeAttenuation depthWrite={false} />
    </points>
  );
}