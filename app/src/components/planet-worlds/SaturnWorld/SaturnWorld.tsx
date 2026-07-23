import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points } from "three";

/* ─── SATURN RING MINING COLONY ─── */
/* Ice harvesters, transit tubes, habitat ring, refinery platform */

function IceSurface() {
  const ref = useRef<Mesh>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.002; });
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 3}>
      <ringGeometry args={[3, 7, 64]} />
      <meshStandardMaterial color="#c8b8a8" roughness={0.9} metalness={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function HabitatRing({ radius = 4.5 }: { radius?: number }) {
  const segments = 8;
  const modules = useMemo(() => {
    const arr = [];
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      arr.push({ pos: [x, 0.15, z], angle: theta });
    }
    return arr;
  }, [radius]);

  return (
    <group>
      {/* Connector ring */}
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[radius, 0.04, 8, 48]} />
        <meshBasicMaterial color="#667788" metalness={0.5} roughness={0.5} transparent opacity={0.6} />
      </mesh>
      {modules.map((m, i) => (
        <group key={i} position={m.pos as any} rotation={[0, -m.angle, 0]}>
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 8]} />
            <meshStandardMaterial color="#445566" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Window glow */}
          <pointLight distance={1.5} intensity={0.15} color="#88ccff" />
        </group>
      ))}
    </group>
  );
}

function IceHarvester({ position, index }: { position: [number, number, number]; index: number }) {
  const armRef = useRef<Mesh>(null);
  const lightRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (armRef.current) armRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5 + index) * 0.2;
    if (lightRef.current) {
      (lightRef.current.material as any).opacity = 0.3 + Math.sin(clock.getElapsedTime() * 1.5 + index * 2) * 0.2;
    }
  });
  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#556677" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Harvester arm */}
      <mesh ref={armRef} position={[0.3, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.04, 0.04]} />
        <meshStandardMaterial color="#ffaa44" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Collection drill */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.03, 0.06, 0.15, 6]} />
        <meshStandardMaterial color="#8899aa" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Status light */}
      <mesh ref={lightRef} position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function TransitTube({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const mid = new THREE.Vector3(
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2,
  );
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const len = dir.length();
  dir.normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);

  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.02, 0.02, len, 4]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} />
    </mesh>
  );
}

function TransitPod({ path, speed = 0.2, offset = 0 }: { path: [number, number, number][]; speed?: number; offset?: number }) {
  const ref = useRef<Mesh>(null);
  const t = useRef(offset);
  useFrame((_, delta) => {
    if (!ref.current) return;
    t.current += delta * speed;
    const idx = Math.floor(t.current) % path.length;
    const next = (idx + 1) % path.length;
    const frac = t.current - Math.floor(t.current);
    const p = path[idx];
    const n = path[next];
    ref.current.position.set(
      p[0] + (n[0] - p[0]) * frac,
      p[1] + (n[1] - p[1]) * frac,
      p[2] + (n[2] - p[2]) * frac,
    );
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshBasicMaterial color="#00d4ff" />
    </mesh>
  );
}

function RefineryPlatform({ position }: { position: [number, number, number] }) {
  const glowRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (glowRef.current) {
      (glowRef.current.material as any).opacity = 0.15 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.8, 16]} />
        <meshBasicMaterial color="#445566" side={THREE.DoubleSide} />
      </mesh>
      {/* Storage tanks */}
      {[[-0.3, 0.2, -0.3], [0.3, 0.2, -0.3], [-0.3, 0.2, 0.3], [0.3, 0.2, 0.3]].map((p, i) => (
        <mesh key={i} position={p as any}>
          <cylinderGeometry args={[0.08, 0.1, 0.3, 8]} />
          <meshStandardMaterial color="#556677" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Processing glow */}
      <mesh ref={glowRef} position={[0, 0.15, 0]}>
        <boxGeometry args={[0.2, 0.05, 0.2]} />
        <meshBasicMaterial color="#ff8844" transparent opacity={0.2} />
      </mesh>
      <pointLight distance={4} intensity={0.3} color="#ff8844" />
    </group>
  );
}

function RingDust() {
  const ref = useRef<Points>(null);
  const [positions] = useMemo(() => {
    const count = 2000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 5;
      const h = (Math.random() - 0.5) * 2;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return [pos];
  }, []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y += 0.001;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#c8b8a8" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* --- RING TRANSIT NETWORK --- */
const transitStops: [number, number, number][] = [];
for (let i = 0; i < 8; i++) {
  const theta = (i / 8) * Math.PI * 2;
  transitStops.push([Math.cos(theta) * 4.5, 0.15, Math.sin(theta) * 4.5]);
}

const tubePairs: [[number, number, number], [number, number, number]][] = [];
for (let i = 0; i < transitStops.length; i++) {
  const next = (i + 1) % transitStops.length;
  tubePairs.push([transitStops[i], transitStops[next]]);
  const skip = (i + 3) % transitStops.length;
  tubePairs.push([transitStops[i], transitStops[skip]]);
}

/* ─── SATURN WORLD EXPORT ─── */
export default function SaturnWorld() {
  return (
    <group>
      <IceSurface />
      <HabitatRing radius={4.5} />
      <RingDust />

      {/* Ice harvesters on the surface */}
      {[[0, 0.05, 2.5], [1.8, 0.05, -1.8], [-1.8, 0.05, -1.8], [2.5, 0.05, 0], [-2.5, 0.05, 0]].map((p, i) => (
        <IceHarvester key={i} position={p as any} index={i} />
      ))}

      {/* Mining drill on outer edge */}
      {[[3.5, 0.05, 2], [-3.5, 0.05, 2], [2, 0.05, -3.5], [-2, 0.05, -3.5]].map((p, i) => (
        <IceHarvester key={`drill-${i}`} position={p as any} index={i + 5} />
      ))}

      {/* Transit tubes between habitat modules */}
      {tubePairs.map(([from, to], i) => (
        <TransitTube key={i} from={from} to={to} />
      ))}

      {/* Transit pods */}
      {[0, 0.33, 0.67].map((offset, i) => (
        <TransitPod key={`pod-${i}`} path={transitStops} speed={0.15 + i * 0.03} offset={offset} />
      ))}

      {/* Refinery platforms */}
      <RefineryPlatform position={[0, 0.1, -5]} />
      <RefineryPlatform position={[4, 0.1, 3]} />
      <RefineryPlatform position={[-4, 0.1, 3]} />

      {/* Lighting */}
      <ambientLight intensity={0.1} color="#886644" />
      <directionalLight position={[5, 3, 10]} intensity={0.3} color="#d4c090" />
      <hemisphereLight args={["#d4c090", "#443322", 0.2]} />
    </group>
  );
}
