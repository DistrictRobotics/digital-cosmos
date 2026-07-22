import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points } from "three";
import { AtmosphericRing } from "../shared";

/* ─── URANUS ORBITAL SCIENCE PLATFORM ─── */
/* Tilted ring station, zero-g research modules, telescope array, orbital lab network */

function IcePlanetBody() {
  const ref = useRef<Mesh>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.002; });
  return (
    <mesh ref={ref} rotation-z={1.7}>
      <sphereGeometry args={[3, 32, 32]} />
      <meshStandardMaterial color="#7ec8e3" emissive="#7ec8e3" emissiveIntensity={0.02} roughness={0.6} />
    </mesh>
  );
}

function FaintRings() {
  const ref = useRef<Mesh>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.001; });
  return (
    <group ref={ref} rotation-x={Math.PI / 2.5}>
      <mesh>
        <ringGeometry args={[5, 5.5, 48]} />
        <meshBasicMaterial color="#7ec8e3" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <ringGeometry args={[5.8, 6.2, 48]} />
        <meshBasicMaterial color="#7ec8e3" transparent opacity={0.03} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function RingStation({ position, radius = 0.8 }: { position: [number, number, number]; radius?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.02;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh rotation-x={-Math.PI / 2}>
        <torusGeometry args={[radius, 0.04, 8, 24]} />
        <meshBasicMaterial color="#88ccee" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Hub */}
      <mesh>
        <sphereGeometry args={[radius * 0.15, 8, 8]} />
        <meshStandardMaterial color="#557788" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Solar panels on ring */}
      {[0, 1, 2, 3].map((i) => {
        const theta = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(theta) * radius, 0, Math.sin(theta) * radius]}
            rotation={[0, -theta, 0]}>
            <planeGeometry args={[0.1, 0.2]} />
            <meshStandardMaterial color="#4488cc" emissive="#4488cc" emissiveIntensity={0.03} side={THREE.DoubleSide} metalness={0.8} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

function TelescopeArray({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y += 0.001;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.3, 6]} />
        <meshStandardMaterial color="#8899aa" />
      </mesh>
      {[0, 1, 2].map((i) => {
        const theta = (i / 3) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(theta) * 0.4, 0.15, Math.sin(theta) * 0.4]}
            rotation={[0, -theta, -0.3]}>
            <mesh>
              <cylinderGeometry args={[0.01, 0.02, 0.4, 6]} />
              <meshStandardMaterial color="#aabbcc" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.02]} />
              <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function ZeroGLab({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
      ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.2) * 0.08;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshPhysicalMaterial color="#88ccee" transparent opacity={0.2} roughness={0.1} />
      </mesh>
      {/* Inner platform */}
      <mesh>
        <boxGeometry args={[0.15, 0.01, 0.15]} />
        <meshStandardMaterial color="#667788" />
      </mesh>
    </group>
  );
}

function Tether({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const mid = new THREE.Vector3(
    (from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2,
  );
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const len = dir.length();
  dir.normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.005, 0.005, len, 4]} />
      <meshBasicMaterial color="#88ccee" transparent opacity={0.08} />
    </mesh>
  );
}

function FloatingCrystals() {
  const ref = useRef<Points>(null);
  const [positions] = useMemo(() => {
    const count = 500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 3.5 + Math.random() * 4;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    return [pos];
  }, []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y += 0.002;
    const pos = (ref.current.geometry.attributes as any).position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] += Math.sin(clock.getElapsedTime() * 0.1 + i * 0.01) * 0.001;
    }
    (ref.current.geometry.attributes as any).position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#88ccee" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* Ring station positions */
const ringStations: [number, number, number][] = [];
for (let i = 0; i < 6; i++) {
  const theta = (i / 6) * Math.PI * 2;
  ringStations.push([Math.cos(theta) * 6, Math.sin(i * 2) * 0.3, Math.sin(theta) * 6]);
}

/* Zero-G lab positions */
const labPositions: [number, number, number][] = [];
for (let i = 0; i < 4; i++) {
  const theta = (i / 4) * Math.PI * 2 + 0.3;
  labPositions.push([Math.cos(theta) * 3.2, 0.3 + Math.sin(i * 2) * 0.2, Math.sin(theta) * 3.2]);
}

/* ─── URANUS WORLD EXPORT ─── */
export default function UranusWorld() {
  return (
    <group>
      <IcePlanetBody />
      <FaintRings />
      <FloatingCrystals />

      {/* Ring stations */}
      {ringStations.map((pos, i) => (
        <RingStation key={i} position={pos} radius={0.6 + (i % 2) * 0.2} />
      ))}

      {/* Tethers between ring stations */}
      {ringStations.map((from, i) => {
        const to = ringStations[(i + 1) % ringStations.length];
        return <Tether key={`tether-${i}`} from={from} to={to} />;
      })}
      {ringStations.map((from, i) => {
        const to = ringStations[(i + 3) % ringStations.length];
        return <Tether key={`cross-${i}`} from={from} to={to} />;
      })}

      {/* Zero-G labs */}
      {labPositions.map((pos, i) => (
        <ZeroGLab key={i} position={pos} />
      ))}

      {/* Tethers: labs to stations */}
      {labPositions.map((lab, i) => (
        <Tether key={`lab-tether-${i}`} from={lab} to={ringStations[i]} />
      ))}

      {/* Telescope arrays */}
      <TelescopeArray position={[8, 0.5, 0]} />
      <TelescopeArray position={[-4, -0.5, 7]} />
      <TelescopeArray position={[-7, 0.3, -4]} />

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[3.3, 24, 24]} />
        <meshBasicMaterial color="#7ec8e3" transparent opacity={0.02} depthWrite={false} />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.1} color="#4488aa" />
      <directionalLight position={[5, 3, 10]} intensity={0.2} color="#88ccee" />
      <hemisphereLight args={["#7ec8e3", "#223344", 0.15]} />
    </group>
  );
}
