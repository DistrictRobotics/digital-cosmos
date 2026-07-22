import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points } from "three";

/* ─── GAS GIANT BANDS ─── */
function GasBands() {
  const ref = useRef<Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.002;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[3, 64, 64]} />
      <meshStandardMaterial color="#d4a06a" emissive="#886633" emissiveIntensity={0.03} roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

/* ─── GREAT RED SPOT ─── */
function GreatRedSpot() {
  const ref = useRef<Mesh>(null);
  const pulse = useRef(0);
  useFrame(({ clock }) => {
    if (ref.current) {
      pulse.current += 0.01;
      const s = 1 + Math.sin(pulse.current) * 0.05;
      ref.current.scale.set(s, 1, s);
    }
  });
  return (
    <mesh ref={ref} position={[2.5, -0.3, 2.2]} rotation-y={0.3}>
      <circleGeometry args={[0.6, 32]} />
      <meshBasicMaterial color="#c04030" transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ─── STORM SYSTEMS ─── */
function Storms() {
  const ref = useRef<Group>(null);
  const storms = useMemo(() => {
    const s = [];
    for (let i = 0; i < 12; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.7;
      s.push({
        position: [3.1 * Math.cos(theta) * Math.cos(phi), 3.1 * Math.sin(phi), 3.1 * Math.sin(theta) * Math.cos(phi)],
        scale: 0.1 + Math.random() * 0.3,
        color: Math.random() > 0.5 ? "#ffffff" : "#cc6644",
        speed: 0.5 + Math.random(),
      });
    }
    return s;
  }, []);

  const meshes = useRef<(Group | null)[]>([]);

  useFrame(({ clock }) => {
    storms.forEach((storm, i) => {
      const g = meshes.current[i];
      if (g) {
        g.lookAt(0, 0, 0);
        g.children.forEach((child) => {
          if ((child as any).material) {
            (child as any).material.opacity = 0.3 + Math.sin(clock.getElapsedTime() * storm.speed + i) * 0.15;
          }
        });
      }
    });
  });

  return (
    <group ref={ref}>
      {storms.map((s, i) => (
        <group key={i} ref={(el) => { meshes.current[i] = el; }} position={s.position}>
          <mesh>
            <planeGeometry args={[s.scale, s.scale]} />
            <meshBasicMaterial color={s.color} transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── MOONS ─── */
function GalileanMoons() {
  const moons = useMemo(() => [
    { name: "Io", color: "#ffcc44", orbit: 5.5, size: 0.15, speed: 0.08 },
    { name: "Europa", color: "#88aacc", orbit: 7, size: 0.13, speed: 0.06 },
    { name: "Ganymede", color: "#99bb88", orbit: 9, size: 0.2, speed: 0.04 },
    { name: "Callisto", color: "#776655", orbit: 11, size: 0.17, speed: 0.03 },
  ], []);

  const refs = useRef<Mesh[]>([]);

  useFrame(({ clock }) => {
    moons.forEach((moon, i) => {
      const mesh = refs.current[i];
      if (mesh) {
        mesh.position.x = Math.cos(clock.getElapsedTime() * moon.speed) * moon.orbit;
        mesh.position.z = Math.sin(clock.getElapsedTime() * moon.speed) * moon.orbit;
      }
    });
  });

  return (
    <group>
      {moons.map((moon, i) => (
        <mesh key={moon.name} ref={(el) => { refs.current[i] = el!; }} position={[moon.orbit, 0, 0]}>
          <sphereGeometry args={[moon.size, 12, 12]} />
          <meshStandardMaterial color={moon.color} roughness={0.8} />
        </mesh>
      ))}
      {/* Orbit rings */}
      {moons.map((moon, i) => (
        <mesh key={`orbit-${i}`} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[moon.orbit - 0.02, moon.orbit + 0.02, 64]} />
          <meshBasicMaterial color={moon.color} transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── ENERGY PARTICLES ─── */
function EnergyParticles() {
  const ref = useRef<Points>(null);
  const [positions] = useMemo(() => {
    const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.5 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(theta) * r * 0.7;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = Math.sin(theta) * r * 0.7;
    }
    return [pos];
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const pos = (ref.current.geometry.attributes as any).position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i * 3] += Math.sin(clock.getElapsedTime() + i) * 0.002;
        pos[i * 3 + 1] += Math.sin(clock.getElapsedTime() * 0.5 + i * 0.1) * 0.001;
      }
      (ref.current.geometry.attributes as any).position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ff8844" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ─── JUPITER MAIN ─── */
export default function JupiterStorm() {
  return (
    <group position={[0, 0, 0]}>
      <GasBands />
      <GreatRedSpot />
      <Storms />
      <GalileanMoons />
      <EnergyParticles />

      <pointLight distance={20} intensity={0.2} color="#ff8844" />
    </group>
  );
}


