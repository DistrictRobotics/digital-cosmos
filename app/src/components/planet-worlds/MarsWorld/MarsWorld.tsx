import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points } from "three";
import { ProceduralTerrain, Building, GroundVehicle, CityBlock } from "../shared";

/* ─── MARS COLONY WORLD ─── */
/* Expanded colony: habitat domes, research labs, rover garages, drill rigs, landing zone */

function HabitatDome({ position, scale = 1, color = "#88ccff" }: { position: [number, number, number]; scale?: number; color?: string }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      (ref.current.material as any).opacity = 0.2 + Math.sin(clock.getElapsedTime() * 0.5 + position[0]) * 0.08;
    }
  });
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.6, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.2} roughness={0.1} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner structure */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.3, 12]} />
        <meshStandardMaterial color="#8899aa" metalness={0.5} roughness={0.5} transparent opacity={0.3} />
      </mesh>
      {/* Base ring */}
      <mesh position={[0, 0.02, 0]}>
        <torusGeometry args={[0.62, 0.04, 8, 32]} />
        <meshStandardMaterial color="#7788aa" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Glow light */}
      <pointLight distance={3} intensity={0.2} color="#88ffaa" />
    </group>
  );
}

function DrillRig({ position }: { position: [number, number, number] }) {
  const armRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (armRef.current) {
      armRef.current.position.y = position[1] + 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
    }
  });
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.3, 8]} />
        <meshStandardMaterial color="#667788" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 6]} />
        <meshStandardMaterial color="#8899aa" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Drill arm */}
      <mesh ref={armRef} position={[0.3, 0.5, 0]}>
        <boxGeometry args={[0.5, 0.03, 0.03]} />
        <meshStandardMaterial color="#ffaa44" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Light */}
      <pointLight distance={2} intensity={0.3} color="#ff8844" />
    </group>
  );
}

function RoverGarage({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.5, 0.8]} />
        <meshStandardMaterial color="#556677" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0.55, 0.4, 0]}>
        <boxGeometry args={[0.05, 0.3, 0.6]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

function CargoCrates({ position }: { position: [number, number, number] }) {
  const crates = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      arr.push({
        pos: [(Math.random() - 0.5) * 1.5, 0.1 + Math.random() * 0.3, (Math.random() - 0.5) * 1.5],
        s: [0.15 + Math.random() * 0.1, 0.1 + Math.random() * 0.1, 0.15 + Math.random() * 0.1] as [number, number, number],
        color: ["#ff6644", "#44aaff", "#ffcc00", "#44ff88"][Math.floor(Math.random() * 4)],
      });
    }
    return arr;
  }, []);
  return (
    <group position={position}>
      {crates.map((c, i) => (
        <mesh key={i} position={c.pos as any}>
          <boxGeometry args={c.s} />
          <meshStandardMaterial color={c.color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function LandingZone({ position }: { position: [number, number, number] }) {
  const ringRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ringRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
      ringRef.current.scale.set(s, s, s);
    }
  });
  return (
    <group position={position}>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.5, 2, 32]} />
        <meshBasicMaterial color="#ff6644" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringRef} rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.6, 1.8, 32]} />
        <meshBasicMaterial color="#ff6644" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.5, 24]} />
        <meshBasicMaterial color="#664433" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Landing lights */}
      {[[0, 0, 1.7], [1.7, 0, 0], [0, 0, -1.7], [-1.7, 0, 0]].map((p, i) => (
        <pointLight key={i} position={p as any} distance={2} intensity={0.2} color="#ff6644" />
      ))}
    </group>
  );
}

function DustStormParticles() {
  const ref = useRef<Points>(null);
  const [positions] = useMemo(() => {
    const count = 500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = Math.random() * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return [pos];
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const pos = (ref.current.geometry.attributes as any).position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i] += 0.01 + Math.sin(clock.getElapsedTime() + i * 0.1) * 0.005;
        pos[i + 1] += Math.sin(clock.getElapsedTime() * 0.3 + i) * 0.002;
        if (pos[i] > 25) pos[i] = -25;
      }
      (ref.current.geometry.attributes as any).position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#d4884a" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function SolarFarm({ position }: { position: [number, number, number] }) {
  const panels = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 6;
      const z = (Math.random() - 0.5) * 6;
      arr.push({ x, z, rot: Math.random() * 0.3 - 0.15 });
    }
    return arr;
  }, []);
  return (
    <group position={position}>
      {panels.map((p, i) => (
        <group key={i} position={[p.x, 0.3, p.z]} rotation={[0, p.rot, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.5, 0.4]} />
            <meshStandardMaterial color="#2244aa" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} emissive="#4488ff" emissiveIntensity={0.02} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.5]} />
            <meshStandardMaterial color="#8899aa" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── MARS WORLD EXPORT ─── */
export default function MarsWorld() {
  return (
    <group>
      {/* Red terrain */}
      <ProceduralTerrain width={60} depth={60} color="#8a3a2a" heightScale={0.6} bumps={15} />

      {/* Main colony cluster */}
      <HabitatDome position={[0, 0.1, 0]} scale={1.8} />
      <HabitatDome position={[-2.5, 0.1, 1.5]} scale={1.2} color="#aaddff" />
      <HabitatDome position={[2, 0.1, -2]} scale={1.0} />
      <HabitatDome position={[-1, 0.1, -2.5]} scale={0.8} />
      <HabitatDome position={[3, 0.1, 2]} scale={1.1} />

      {/* Solar farm */}
      <SolarFarm position={[-6, 0, 0]} />
      <SolarFarm position={[-6, 0, 4]} />

      {/* Research labs */}
      <Building position={[0, 0.1, 0]} w={0.6} h={0.8} d={0.6} color="#556677" />
      <Building position={[1.5, 0.1, 1]} w={0.5} h={0.6} d={0.5} color="#445566" />

      {/* Drill rigs */}
      <DrillRig position={[5, 0.1, -3]} />
      <DrillRig position={[-4, 0.1, 5]} />
      <DrillRig position={[-5.5, 0.1, -3]} />

      {/* Rover garages */}
      <RoverGarage position={[4, 0.1, 3]} />
      <RoverGarage position={[-3.5, 0.1, -4]} />

      {/* Rovers driving */}
      <GroundVehicle path={[[-3, 0.1, 0], [-1, 0.1, 2], [2, 0.1, 1], [3, 0.1, -1], [1, 0.1, -2], [-2, 0.1, -1], [-3, 0.1, 0]]} speed={0.4} color="#ff8844" />
      <GroundVehicle path={[[2, 0.1, -3], [4, 0.1, -1], [3.5, 0.1, 2], [1, 0.1, 3], [-1, 0.1, 2], [0, 0.1, 0], [2, 0.1, -3]]} speed={0.3} color="#44aaff" />

      {/* Cargo area */}
      <CargoCrates position={[1.5, 0.1, -4]} />
      <CargoCrates position={[-2, 0.1, 4.5]} />

      {/* Landing zone */}
      <LandingZone position={[0, 0, -6]} />

      {/* Dust */}
      <DustStormParticles />

      {/* Com towers on hills */}
      {[[6, 0.4, 5], [-6, 0.3, -5]].map((p, i) => (
        <group key={i} position={p as any}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.02, 0.04, 1]} />
            <meshStandardMaterial color="#8899aa" />
          </mesh>
          <pointLight position={[0, 1, 0]} distance={3} intensity={0.5} color="#ff6644" />
        </group>
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.15} color="#ff6633" />
      <directionalLight position={[15, 10, 5]} intensity={0.4} color="#ff8844" />
      <hemisphereLight args={["#ff8844", "#442211", 0.3]} />
    </group>
  );
}
