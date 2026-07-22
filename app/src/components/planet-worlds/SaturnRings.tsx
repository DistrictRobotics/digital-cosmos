import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points, Group } from "three";

/* ─── RING PARTICLES (fly-through highway) ─── */
function RingParticles() {
  const ref = useRef<Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const count = 8000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 5;
      const height = (Math.random() - 0.5) * 0.3;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius * 0.08 + height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      const hue = 0.08 + Math.random() * 0.05;
      col[i * 3] = 0.78 + Math.random() * 0.1;
      col[i * 3 + 1] = 0.65 + Math.random() * 0.12;
      col[i * 3 + 2] = 0.48 + Math.random() * 0.1;
      siz[i] = 0.02 + Math.random() * 0.06;
    }
    return [pos, col, siz];
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y += 0.002;
      ref.current.rotation.x = 0.15 + Math.sin(clock.getElapsedTime() * 0.1) * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors sizeAttenuation transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ─── ICE CHUNKS (large debris) ─── */
function IceChunks() {
  const groupRef = useRef<Group>(null);

  const chunks = useMemo(() => {
    const c = [];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 4;
      c.push({
        position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 0.2, Math.sin(angle) * radius],
        scale: 0.05 + Math.random() * 0.12,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        speed: 0.3 + Math.random() * 0.5,
      });
    }
    return c;
  }, []);

  const meshes = useRef<Mesh[]>([]);

  useFrame(({ clock }) => {
    meshes.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.01;
      }
    });
    if (groupRef.current) groupRef.current.rotation.y += 0.001;
  });

  return (
    <group ref={groupRef}>
      {chunks.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => { meshes.current[i] = el!; }}
          position={c.position as any}
          scale={c.scale}
          rotation={c.rotation as any}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#d4c8b8" roughness={0.8} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── MOON (Titan) ─── */
function TitanMoon() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x = Math.cos(clock.getElapsedTime() * 0.05) * 12;
      ref.current.position.z = Math.sin(clock.getElapsedTime() * 0.05) * 12;
      ref.current.rotation.y += 0.005;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshStandardMaterial color="#c8a878" roughness={0.9} />
    </mesh>
  );
}

/* ─── RING HIGHWAY LIGHTS ─── */
function RingHighwayLights() {
  const ref = useRef<Points>(null);
  const [positions] = useMemo(() => {
    const count = 60;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const r = 4;
      pos[i * 3] = Math.cos(t) * r;
      pos[i * 3 + 1] = Math.sin(t) * r * 0.08;
      pos[i * 3 + 2] = Math.sin(t) * r;
    }
    return [pos];
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = 0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#00d4ff" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ─── SATURN RINGS MAIN ─── */
export default function SaturnRings() {
  return (
    <group position={[0, 0, 0]}>
      {/* Saturn body */}
      <mesh>
        <sphereGeometry args={[2, 48, 48]} />
        <meshStandardMaterial color="#e8d5a0" emissive="#d4c090" emissiveIntensity={0.02} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Band stripes */}
      <mesh rotation-x={0.1}>
        <torusKnotGeometry args={[2.1, 0.05, 32, 16]} />
        <meshBasicMaterial color="#d4c090" transparent opacity={0.08} />
      </mesh>
      <mesh rotation-x={-0.05}>
        <torusKnotGeometry args={[2.15, 0.03, 32, 16]} />
        <meshBasicMaterial color="#c8b888" transparent opacity={0.05} />
      </mesh>

      <RingParticles />
      <IceChunks />
      <RingHighwayLights />
      <TitanMoon />
    </group>
  );
}
