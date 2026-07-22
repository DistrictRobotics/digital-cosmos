import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points } from "three";

/* ─── ICE TERRAIN ─── */
function IceTerrain({ color }: { color: string }) {
  const ref = useRef<Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.002;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} emissive={color} emissiveIntensity={0.02} />
    </mesh>
  );
}

/* ─── ICE CRYSTALS ─── */
function IceCrystals({ count = 200, radius = 3 }: { count?: number; radius?: number }) {
  const ref = useRef<Points>(null);
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8 + Math.random() * radius;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3;
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return [pos];
  }, [count, radius]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y += 0.001;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#ffffff" transparent opacity={0.3} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ─── CRYSTAL SPIKES ─── */
function CrystalSpikes({ color }: { color: string }) {
  const spikes = useMemo(() => {
    const s = [];
    for (let i = 0; i < 30; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      s.push({
        position: [1.55 * Math.sin(phi) * Math.cos(theta), 1.55 * Math.sin(phi) * Math.sin(theta), 1.55 * Math.cos(phi)],
        scale: 0.05 + Math.random() * 0.1,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      });
    }
    return s;
  }, []);

  return (
    <group>
      {spikes.map((s, i) => (
        <mesh key={i} position={s.position as any} scale={s.scale} rotation={s.rotation as any}>
          <coneGeometry args={[0.3, 0.5, 4]} />
          <meshStandardMaterial color={color} roughness={0.1} metalness={0.3} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── FAINT RING (for Uranus) ─── */
function FaintRing({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <mesh rotation-x={Math.PI / 2.5}>
      <ringGeometry args={[2.5, 3.0, 48]} />
      <meshBasicMaterial color="#7ec8e3" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ─── ICE WORLD MAIN ─── */
export default function IceWorld({ color, ring }: { color: string; ring?: boolean }) {
  return (
    <group>
      <IceTerrain color={color} />
      <CrystalSpikes color={color} />
      <IceCrystals count={200} radius={3} />
      <FaintRing visible={!!ring} />
      <pointLight distance={8} intensity={0.2} color={color} />
    </group>
  );
}