import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Group, Points } from "three";

/* ─── MARS SURFACE TERRAIN ─── */
function MarsTerrain() {
  const meshRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y += 0.001;
  });
  return (
    <mesh ref={meshRef} position={[0, -4, 0]} rotation-x={-Math.PI / 2}>
      <sphereGeometry args={[6, 64, 64]} />
      <meshStandardMaterial color="#c1442e" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

/* ─── COLONY DOMES ─── */
function ColonyDome({ position, scale = 1, color = "#88ccff" }: { position: [number, number, number]; scale?: number; color?: string }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.5 + (position[0] + position[2]) * 0.1) * 0.05;
    }
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      {/* Dome */}
      <mesh>
        <sphereGeometry args={[0.6, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.25} roughness={0.1} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      {/* Base ring */}
      <mesh position={[0, -0.1, 0]}>
        <torusGeometry args={[0.65, 0.04, 8, 32]} />
        <meshStandardMaterial color="#8899aa" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Inner light */}
      <pointLight distance={2} intensity={0.3} color="#ffcc88" />
    </group>
  );
}

/* ─── SOLAR PANELS ─── */
function SolarPanel({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation as any}>
      <mesh>
        <planeGeometry args={[0.8, 0.05]} />
        <meshStandardMaterial color="#3355aa" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <planeGeometry args={[0.4, 0.6]} />
        <meshStandardMaterial color="#2244aa" emissive="#4488ff" emissiveIntensity={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* Stand */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.75]} />
        <meshStandardMaterial color="#8899aa" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── ROVER ─── */
function Rover({ position }: { position: [number, number, number] }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x = position[0] + Math.sin(clock.getElapsedTime() * 0.2) * 2;
      ref.current.position.z = position[2] + Math.cos(clock.getElapsedTime() * 0.3) * 1.5;
    }
  });
  return (
    <group ref={ref} position={position} scale={0.3}>
      {/* Body */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.5]} />
        <meshStandardMaterial color="#dddddd" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Wheels */}
      {[[-0.35, 0, -0.3], [-0.35, 0, 0.3], [0.35, 0, -0.3], [0.35, 0, 0.3]].map((p, i) => (
        <mesh key={i} position={p as any}>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 8]} />
          <meshStandardMaterial color="#333333" metalness={0.3} roughness={0.7} />
        </mesh>
      ))}
      {/* Mast */}
      <mesh position={[0, 0.4, 0.1]}>
        <cylinderGeometry args={[0.01, 0.01, 0.4]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Camera */}
      <mesh position={[0, 0.55, 0.15]}>
        <boxGeometry args={[0.06, 0.04, 0.04]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  );
}

/* ─── DRONE ─── */
function Drone({ position }: { position: [number, number, number] }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + 0.3 + Math.sin(clock.getElapsedTime() * 1.5 + position[0]) * 0.2;
      ref.current.rotation.y += 0.02;
    }
  });
  return (
    <group ref={ref} position={position} scale={0.15}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={0.2} />
      </mesh>
      {/* Rotors */}
      {[[-0.25, 0, 0], [0.25, 0, 0], [0, 0, -0.25], [0, 0, 0.25]].map((p, i) => (
        <mesh key={i} position={p as any}>
          <boxGeometry args={[0.12, 0.01, 0.02]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      ))}
    </group>
  );
}

/* ─── COMMUNICATION TOWER ─── */
function ComTower({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material = new THREE.MeshBasicMaterial({
        color: "#00d4ff",
        transparent: true,
        opacity: 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.2,
      });
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 1]} />
        <meshStandardMaterial color="#8899aa" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Light */}
      <mesh ref={ref} position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.04]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

/* ─── MARS COLONY MAIN ─── */
export default function MarsColony() {
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef} position={[0, -2, 0]}>
      <MarsTerrain />

      {/* Colony cluster — 5 domes */}
      <ColonyDome position={[-2, -3, -1.5]} scale={1.2} />
      <ColonyDome position={[0, -3, 0]} scale={1.5} color="#aaddff" />
      <ColonyDome position={[2.5, -3, -1]} scale={1} />
      <ColonyDome position={[-1, -3, 2]} scale={0.8} />
      <ColonyDome position={[3, -3, 2]} scale={0.7} />

      {/* Solar arrays */}
      <SolarPanel position={[-3.5, -3.2, 0]} rotation={[0, 0, 0.3]} />
      <SolarPanel position={[-3.8, -3.2, 1.5]} rotation={[0, 0.2, 0.3]} />
      <SolarPanel position={[4, -3.2, 0]} rotation={[0, 0.5, 0.2]} />
      <SolarPanel position={[4.3, -3.2, -1.8]} rotation={[0, -0.3, 0.2]} />

      {/* Rovers */}
      <Rover position={[-2, -3.5, -3]} />
      <Rover position={[3, -3.5, 2.5]} />

      {/* Drones */}
      <Drone position={[0, -1, 0]} />
      <Drone position={[1.5, -0.5, 1]} />
      <Drone position={[-2, -0.8, -1]} />

      {/* Com towers */}
      <ComTower position={[-3, -3.5, -2]} />
      <ComTower position={[3.5, -3.5, 1.5]} />
      <ComTower position={[2, -3.5, -3]} />

      {/* Dust particles */}
      <DustParticles />

      {/* Ambient red light */}
      <ambientLight intensity={0.15} color="#ff6633" />
      <pointLight distance={20} intensity={0.3} position={[0, 5, 0]} color="#ff8844" />
    </group>
  );
}

function DustParticles() {
  const ref = useRef<Points>(null);
  const [positions] = useMemo(() => {
    const count = 150;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = -3 + Math.random() * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return [pos];
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const pos = (ref.current.geometry.attributes as any).position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += Math.sin(clock.getElapsedTime() + i) * 0.001;
      }
      (ref.current.geometry.attributes as any).position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ff8844" transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}
