import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points } from "three";

/* ─── JUPITER GAS GIANT RESEARCH STATION ─── */
/* Floating observation deck, storm trackers, atmospheric probes, moon base */

function GasSurface() {
  const ref = useRef<Mesh>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.003; });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[5, 48, 48]} />
      <meshStandardMaterial color="#d4a06a" emissive="#886633" emissiveIntensity={0.03} roughness={0.7} />
    </mesh>
  );
}

function StormBand({ radius, tilt }: { radius: number; tilt: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y += 0.001;
  });
  return (
    <mesh ref={ref} rotation-x={tilt}>
      <torusGeometry args={[radius, 0.06, 8, 64]} />
      <meshBasicMaterial color="#d4a06a" transparent opacity={0.08} />
    </mesh>
  );
}

function GreatRedSpot() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 0.2) * 0.05;
      ref.current.scale.set(s, 1, s);
    }
  });
  return (
    <mesh ref={ref} position={[4.2, -0.5, 3.5]}>
      <circleGeometry args={[1.2, 32]} />
      <meshBasicMaterial color="#c04030" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ObservationDeck({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y += 0.002;
  });
  return (
    <group ref={ref} position={position}>
      {/* Main platform */}
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.5, 2, 24]} />
        <meshBasicMaterial color="#445566" side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>
      {/* Dome */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#88ccff" transparent opacity={0.15} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Support cables */}
      {[[0, 0, 1.8], [1.8, 0, 0], [0, 0, -1.8], [-1.8, 0, 0]].map((p, i) => (
        <mesh key={i} position={[(p[0]) / 2, -0.2, (p[2]) / 2]} rotation={[0, i * Math.PI / 2, Math.PI / 3]}>
          <cylinderGeometry args={[0.01, 0.01, 1.5, 4]} />
          <meshBasicMaterial color="#8899aa" transparent opacity={0.3} />
        </mesh>
      ))}
      {/* Antenna */}
      <mesh position={[0, 0.1, 1.2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.8, 4]} />
        <meshStandardMaterial color="#aabbcc" />
      </mesh>
    </group>
  );
}

function StormTracker({ position }: { position: [number, number, number] }) {
  const armRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (armRef.current) {
      armRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.2;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.2, 6]} />
        <meshStandardMaterial color="#8899aa" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh ref={armRef} position={[0.2, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.02, 0.02]} />
        <meshStandardMaterial color="#aabbcc" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.35, 0.2, 0]}>
        <sphereGeometry args={[0.02]} />
        <meshBasicMaterial color="#ff6644" />
      </mesh>
    </group>
  );
}

function AtmosphericProbe({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * 0.05 + position[0];
      ref.current.position.x = position[0] + Math.sin(t) * 1.5;
      ref.current.position.z = position[2] + Math.cos(t * 0.7) * 1.2;
      ref.current.position.y = position[1] + Math.sin(t * 0.5) * 0.3;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.03, 6, 6]} />
      <meshBasicMaterial color="#ff8844" />
    </mesh>
  );
}

function StormParticles() {
  const ref = useRef<Points>(null);
  const [positions] = useMemo(() => {
    const count = 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const r = 5.5 + Math.random() * 2;
      pos[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = r * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
    }
    return [pos];
  }, []);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.002;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ff8844" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function MoonSurface({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[2, 16]} />
        <meshBasicMaterial color="#887766" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#998877" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ─── JUPITER WORLD EXPORT ─── */
export default function JupiterWorld() {
  return (
    <group>
      <GasSurface />
      <GreatRedSpot />

      {/* Storm bands */}
      <StormBand radius={5.2} tilt={0.1} />
      <StormBand radius={5.5} tilt={-0.05} />
      <StormBand radius={4.8} tilt={0.15} />
      <StormBand radius={5.8} tilt={-0.08} />

      {/* Observation decks */}
      <ObservationDeck position={[0, 1.2, 6.5]} />
      <ObservationDeck position={[5.5, 0.8, 3]} />
      <ObservationDeck position={[-5.5, 0.8, -3]} />
      <ObservationDeck position={[0, -0.8, -6.5]} />

      {/* Storm trackers */}
      <StormTracker position={[3.5, 0.3, 4.5]} />
      <StormTracker position={[-4, 0.5, 3.5]} />
      <StormTracker position={[0, 0.6, -4.5]} />

      {/* Atmospheric probes */}
      {[[3, 0, 4], [-3, 0.5, -3], [4, -0.5, -2], [-2, 0.3, 5], [0, -0.3, -5], [5, 0, 0]].map((p, i) => (
        <AtmosphericProbe key={i} position={p as any} />
      ))}

      {/* Storm particles */}
      <StormParticles />

      {/* Moon base (Io) */}
      <MoonSurface position={[9, -1, 4]} />

      {/* Lightning */}
      <pointLight distance={8} intensity={0.3} color="#ff8844" position={[4, 2, 3]} />
      <pointLight distance={8} intensity={0.2} color="#ffaa44" position={[-3, 1.5, -5]} />

      <ambientLight intensity={0.12} color="#ff8844" />
      <directionalLight position={[5, 3, 10]} intensity={0.3} color="#d4a06a" />
    </group>
  );
}
