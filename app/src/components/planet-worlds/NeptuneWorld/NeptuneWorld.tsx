import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points } from "three";
import { ProceduralTerrain } from "../shared";

/* ─── NEPTUNE UNDER-ICE RESEARCH BASE ─── */
/* Bioluminescent deep-sea facility, ice drilling, creature observation */

function IceSurface() {
  const ref = useRef<Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001;
      ref.current.material.opacity = 0.15 + Math.sin(Date.now() * 0.0003) * 0.05;
    }
  });
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} position={[0, 2, 0]}>
      <circleGeometry args={[18, 32]} />
      <meshBasicMaterial color="#7ec8e3" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}

function UnderIceTerrain() {
  return (
    <group>
      <ProceduralTerrain width={20} depth={20} color="#1a2a4a" heightScale={0.3} bumps={6} />
      {/* Ice ceiling glow */}
      <ambientLight intensity={0.08} color="#4488ff" />
    </group>
  );
}

function ResearchModule({ position }: { position: [number, number, number] }) {
  const glowRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.3 + Math.sin(clock.getElapsedTime() * 0.5 + position[0]) * 0.15;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 8]} />
        <meshStandardMaterial color="#334466" metalness={0.4} roughness={0.6} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#7ec8e3" transparent opacity={0.2} />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.1, 0]}>
        <pointLight distance={3} intensity={0.2} color="#4488ff" />
      </mesh>
    </group>
  );
}

function IceDrill({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = 0.2 + Math.sin(clock.getElapsedTime() * 1.5) * 0.08;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 6]} />
        <meshStandardMaterial color="#8899aa" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh ref={ref} position={[0, 0.1, 0]}>
        <coneGeometry args={[0.06, 0.12, 6]} />
        <meshStandardMaterial color="#ffaa44" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function BioluminescentCreature({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  const pulse = useRef(Math.random() * Math.PI * 2);
  useFrame(({ clock }) => {
    pulse.current += 0.02;
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.3 + position[0]) * 0.15;
      ref.current.material.emissiveIntensity = 0.2 + Math.sin(pulse.current) * 0.15;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial color="#44ffaa" emissive="#44ffaa" emissiveIntensity={0.3} />
    </mesh>
  );
}

function ConnectorTube({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const mid = new THREE.Vector3(
    (from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2,
  );
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const len = dir.length();
  dir.normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.02, 0.02, len, 4]} />
      <meshBasicMaterial color="#4488ff" transparent opacity={0.08} />
    </mesh>
  );
}

function BubbleParticles() {
  const ref = useRef<Points>(null);
  const [positions] = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 4 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return [pos];
  }, []);
  useFrame(() => {
    if (ref.current) {
      const pos = (ref.current.geometry.attributes as any).position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += 0.003;
        if (pos[i + 1] > 3) pos[i + 1] = -1;
        pos[i] += (Math.random() - 0.5) * 0.002;
        pos[i + 2] += (Math.random() - 0.5) * 0.002;
      }
      (ref.current.geometry.attributes as any).position.needsUpdate = true;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#7ec8e3" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function AuroraGlow() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y += 0.005;
      ref.current.material.opacity = 0.03 + Math.sin(clock.getElapsedTime() * 0.2) * 0.02;
    }
  });
  return (
    <mesh ref={ref} position={[0, 1.5, 0]} rotation-x={Math.PI / 2}>
      <ringGeometry args={[4, 7, 32]} />
      <meshBasicMaterial color="#44ffaa" transparent opacity={0.03} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ─── NEPTUNE WORLD EXPORT ─── */
export default function NeptuneWorld() {
  return (
    <group>
      <IceSurface />
      <UnderIceTerrain />
      <AuroraGlow />
      <BubbleParticles />

      {/* Research modules */}
      <ResearchModule position={[0, 0, 0]} />
      <ResearchModule position={[2, 0, 1.5]} />
      <ResearchModule position={[-2, 0, 1.2]} />
      <ResearchModule position={[1, 0, -2]} />
      <ResearchModule position={[-1.5, 0, -1.8]} />

      {/* Connector tubes */}
      <ConnectorTube from={[0, 0, 0]} to={[2, 0, 1.5]} />
      <ConnectorTube from={[0, 0, 0]} to={[-2, 0, 1.2]} />
      <ConnectorTube from={[0, 0, 0]} to={[1, 0, -2]} />
      <ConnectorTube from={[0, 0, 0]} to={[-1.5, 0, -1.8]} />
      <ConnectorTube from={[2, 0, 1.5]} to={[-1.5, 0, -1.8]} />

      {/* Ice drills */}
      <IceDrill position={[3, 0, 0]} />
      <IceDrill position={[-3, 0, 0]} />
      <IceDrill position={[0, 0, 3]} />

      {/* Bioluminescent creatures */}
      {[[1.5, 0.1, 1], [-1, 0.1, 2], [2.5, 0.1, -1], [-2.5, 0.1, 0.5], [0.5, 0.1, -2.5], [-0.5, 0.1, 2.5], [3, 0.1, -1.5], [-3, 0.1, -1.5]].map((p, i) => (
        <BioluminescentCreature key={i} position={p as any} />
      ))}

      {/* Deep ocean lighting */}
      <pointLight distance={8} intensity={0.4} color="#4488ff" position={[0, -0.5, 0]} />
      <pointLight distance={5} intensity={0.2} color="#44ffaa" position={[2, 0.3, 1.5]} />
      <pointLight distance={5} intensity={0.2} color="#44ffaa" position={[-2, 0.3, -1.5]} />
      <ambientLight intensity={0.05} color="#224466" />
    </group>
  );
}
