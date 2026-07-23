import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points } from "three";
import { ProceduralTerrain, Building } from "../shared";

/* ─── MERCURY SOLAR RESEARCH OUTPOST ─── */
/* Heat-shielded base, massive solar arrays, railgun track, observation deck facing the Sun */

function SolarFlareLight() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = 0.2 + Math.sin(clock.getElapsedTime() * 1.5) * 0.15;
      (ref.current.material as any).opacity = pulse;
    }
  });
  return (
    <mesh ref={ref} position={[15, 3, 0]}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshBasicMaterial color="#ff6600" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function HeatShieldedDome({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#ffaa44" transparent opacity={0.08} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.3, 0.38, 0.04, 12]} />
        <meshStandardMaterial color="#aabbcc" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function MegaSolarArray({ position }: { position: [number, number, number] }) {
  const panels = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      const x = (i - 3.5) * 0.8;
      arr.push({ x, rot: Math.PI / 2 + (Math.random() - 0.5) * 0.1 });
    }
    return arr;
  }, []);
  return (
    <group position={position}>
      {panels.map((p, i) => (
        <group key={i} position={[p.x, 0, 0]} rotation={[p.rot, 0, 0]}>
          <mesh>
            <planeGeometry args={[0.6, 1]} />
            <meshStandardMaterial color="#224488" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} emissive="#4488ff" emissiveIntensity={0.04} />
          </mesh>
        </group>
      ))}
      <mesh>
        <boxGeometry args={[6, 0.04, 0.04]} />
        <meshStandardMaterial color="#8899aa" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

function RailgunTrack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[6, 0.03, 0.06]} />
        <meshBasicMaterial color="#8899aa" transparent opacity={0.4} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[-2.5 + i, 0.06, 0]}>
          <boxGeometry args={[0.05, 0.05, 0.12]} />
          <meshBasicMaterial color="#ffaa44" />
        </mesh>
      ))}
    </group>
  );
}

function ObservationTower({ position }: { position: [number, number, number] }) {
  const glowRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as any).opacity = 0.2 + Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 1, 8]} />
        <meshStandardMaterial color="#8899aa" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh ref={glowRef} position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.06]} />
        <meshBasicMaterial color="#ffaa44" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function HeatShimmer() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      (ref.current.material as any).opacity = 0.02 + Math.sin(clock.getElapsedTime() * 0.5) * 0.01;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0.5, 0]}>
      <planeGeometry args={[20, 6]} />
      <meshBasicMaterial color="#ff8844" transparent opacity={0.02} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SurfaceCracks() {
  const lines = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      const x1 = (Math.random() - 0.5) * 12;
      const z1 = (Math.random() - 0.5) * 12;
      const x2 = x1 + (Math.random() - 0.5) * 1.5;
      const z2 = z1 + (Math.random() - 0.5) * 1.5;
      arr.push({ from: [x1, 0.02, z1], to: [x2, 0.02, z2] });
    }
    return arr;
  }, []);
  return (
    <group>
      {lines.map((l, i) => (
        <mesh key={i} position={[(l.from[0] + l.to[0]) / 2, 0.02, (l.from[2] + l.to[2]) / 2]}
          rotation={[0, Math.atan2(l.to[2] - l.from[2], l.to[0] - l.from[0]), 0]}>
          <planeGeometry args={[1 + Math.random() * 0.5, 0.003]} />
          <meshBasicMaterial color="#ffaa44" transparent opacity={0.05} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── MERCURY WORLD EXPORT ─── */
export default function MercuryWorld() {
  return (
    <group>
      <ProceduralTerrain width={20} depth={20} color="#887766" heightScale={0.4} bumps={10} />
      <SurfaceCracks />
      <HeatShimmer />

      {/* Main base */}
      <HeatShieldedDome position={[0, 0.05, 0]} />
      <HeatShieldedDome position={[1.2, 0.05, -0.8]} />
      <HeatShieldedDome position={[-1, 0.05, 1.2]} />

      {/* Solar arrays */}
      <MegaSolarArray position={[3, 0.05, 0]} />
      <MegaSolarArray position={[3.5, 0.05, 2]} />
      <MegaSolarArray position={[-3, 0.05, 0]} />
      <MegaSolarArray position={[-3.5, 0.05, -1.5]} />

      {/* Railgun launch track */}
      <RailgunTrack position={[0, 0.05, -3]} />

      {/* Observation towers */}
      <ObservationTower position={[0, 0.05, 3]} />
      <ObservationTower position={[2, 0.05, 2.5]} />
      <ObservationTower position={[-2, 0.05, 2.5]} />

      {/* Research buildings */}
      <Building position={[1.5, 0.05, 1.5]} w={0.4} h={0.5} d={0.4} color="#667788" />
      <Building position={[-1.5, 0.05, -1]} w={0.4} h={0.4} d={0.4} color="#667788" />

      {/* Sun-glare light */}
      <directionalLight position={[15, 5, 0]} intensity={0.8} color="#ff8844" />
      <ambientLight intensity={0.25} color="#ffaa66" />
      <SolarFlareLight />
      <pointLight distance={20} intensity={0.4} color="#ff6600" position={[10, 3, 0]} />
    </group>
  );
}
