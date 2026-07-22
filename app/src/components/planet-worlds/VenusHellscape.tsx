import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points } from "three";

/* ─── SULFUR CLOUD LAYERS ─── */
function CloudLayer({ radius, opacity, color, speed }: { radius: number; opacity: number; color: string; speed: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y += clock.getElapsedTime() * speed * 0.001;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ─── SURFACE GLOW ─── */
function SurfaceGlow() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = 0.03 + Math.sin(clock.getElapsedTime() * 0.3) * 0.01;
      (ref.current.material as any).opacity = pulse;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.7, 24, 24]} />
      <meshBasicMaterial color="#ff6622" transparent opacity={0.03} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ─── LIGHTNING FLASHES ─── */
function Lightning() {
  const ref = useRef<Points>(null);
  const flashTime = useRef(0);

  const [positions] = useMemo(() => {
    const count = 30;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;
      pos[i * 3] = 2.2 * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = 2.2 * Math.sin(phi);
      pos[i * 3 + 2] = 2.2 * Math.sin(theta) * Math.cos(phi);
    }
    return [pos];
  }, []);

  useFrame(({ clock }) => {
    flashTime.current += 0.01;
    if (ref.current) {
      const opacity = Math.max(0, Math.sin(flashTime.current * 3.7) * 0.3);
      (ref.current.material as any).opacity = opacity;
      if (Math.random() < 0.005) flashTime.current = Math.PI / 2;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#ffaa44" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ─── ACID RAIN PARTICLES ─── */
function AcidRain() {
  const ref = useRef<Points>(null);
  const [positions] = useMemo(() => {
    const count = 400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return [pos];
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const pos = (ref.current.geometry.attributes as any).position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] -= 0.01;
        if (pos[i + 1] < -2) pos[i + 1] = 2;
        pos[i] += Math.sin(clock.getElapsedTime() + i) * 0.002;
      }
      (ref.current.geometry.attributes as any).position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#ff8844" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ─── VENUS MAIN ─── */
export default function VenusHellscape() {
  return (
    <group position={[0, 0, 0]}>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshStandardMaterial color="#e8c878" emissive="#ff8844" emissiveIntensity={0.05} roughness={0.9} />
      </mesh>

      <SurfaceGlow />
      <CloudLayer radius={1.7} opacity={0.3} color="#e8c878" speed={0.3} />
      <CloudLayer radius={1.85} opacity={0.15} color="#ff8844" speed={-0.5} />
      <CloudLayer radius={2.0} opacity={0.08} color="#ffcc66" speed={0.8} />
      <Lightning />
      <AcidRain />

      <pointLight distance={10} intensity={0.5} color="#ff8844" />
    </group>
  );
}