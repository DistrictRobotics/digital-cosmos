import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points } from "three";
import { ProceduralTerrain, Building } from "../shared";

/* ─── VENUS FLOATING CLOUD CITY ─── */
/* Floating platforms in the upper atmosphere, chain bridges, lightning storms */

function CloudSea() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y += 0.001;
  });
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} position={[0, -0.5, 0]}>
      <circleGeometry args={[35, 48]} />
      <meshBasicMaterial color="#e8c878" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}

function FloatingPlatform({ position, radius = 1.2, color = "#886644" }: { position: [number, number, number]; radius?: number; color?: string }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.3 + position[0]) * 0.05;
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[radius, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Edge glow */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[radius * 0.9, radius, 24]} />
        <meshBasicMaterial color="#ff8844" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Support struts */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.6, 6]} />
        <meshStandardMaterial color="#665533" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}

function ChainBridge({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const mid = new THREE.Vector3(
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 - 0.1,
    (from[2] + to[2]) / 2,
  );
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const len = dir.length();
  dir.normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  return (
    <group>
      {/* Main cable */}
      <mesh position={mid} quaternion={quat}>
        <cylinderGeometry args={[0.015, 0.015, len, 4]} />
        <meshBasicMaterial color="#ffaa55" transparent opacity={0.3} />
      </mesh>
      {/* Sag cable below */}
      <mesh position={[mid.x, mid.y - 0.08, mid.z]} quaternion={quat}>
        <cylinderGeometry args={[0.008, 0.008, len * 0.95, 4]} />
        <meshBasicMaterial color="#ff8844" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function CloudTower({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      (ref.current.material as any).opacity = 0.1 + Math.sin(clock.getElapsedTime() * 0.2) * 0.05;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.08, 0.15, 2, 8]} />
        <meshStandardMaterial color="#887755" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh ref={ref} position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#ffaa44" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function LightningStorm() {
  const bolts = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      const pts: [number, number, number][] = [];
      const x = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 30;
      let cy = 0;
      pts.push([x, -1 + Math.random() * 2, z]);
      for (let j = 0; j < 5; j++) {
        cy -= 0.5 - Math.random() * 1;
        pts.push([
          x + (Math.random() - 0.5) * 0.8,
          cy,
          z + (Math.random() - 0.5) * 0.8,
        ]);
      }
      arr.push({ points: pts, speed: 0.5 + Math.random() });
    }
    return arr;
  }, []);

  const refs = useRef<(Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    bolts.forEach((bolt, i) => {
      const mesh = refs.current[i];
      if (mesh) {
        const flash = Math.max(0, Math.sin(clock.getElapsedTime() * bolt.speed * 2 + i * 3));
        (mesh.material as any).opacity = flash > 0.95 ? 0.6 : 0;
        if (flash > 0.95 && Math.random() < 0.3) {
          // Reposition zigzag slightly
        }
      }
    });
  });

  return (
    <group>
      {bolts.map((bolt, i) => {
        const points = bolt.points.flat();
        return (
          <primitive key={i} object={(() => {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
            const mat = new THREE.LineBasicMaterial({ color: "#ffcc88", transparent: true, opacity: 0 });
            return new THREE.Line(geo, mat);
          })()} />
        );
      })}
    </group>
  );
}

function AcidRainParticles() {
  const ref = useRef<Points>(null);
  const [positions] = useMemo(() => {
    const count = 800;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = Math.random() * 8 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return [pos];
  }, []);

  useFrame(() => {
    if (ref.current) {
      const pos = (ref.current.geometry.attributes as any).position.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] -= 0.02;
        if (pos[i + 1] < -1) pos[i + 1] = 7;
        pos[i] += (Math.random() - 0.5) * 0.003;
        pos[i + 2] += (Math.random() - 0.5) * 0.003;
      }
      (ref.current.geometry.attributes as any).position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#ff8844" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ─── VENUS WORLD EXPORT ─── */
export default function VenusWorld() {
  return (
    <group>
      <CloudSea />

      {/* Central hub platform */}
      <FloatingPlatform position={[0, 0, 0]} radius={1.8} />
      <Building position={[0, 0.15, 0]} w={0.6} h={0.8} d={0.6} color="#887755" />

      {/* Ring platforms */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const theta = (i / 6) * Math.PI * 2;
        const r = 2.8;
        return (
          <FloatingPlatform
            key={i}
            position={[Math.cos(theta) * r, 0.3, Math.sin(theta) * r]}
            radius={0.7 + (i % 2) * 0.2}
            color={i % 2 === 0 ? "#887755" : "#776644"}
          />
        );
      })}

      {/* Outer platforms */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const theta = (i / 8) * Math.PI * 2;
        const r = 5;
        return (
          <FloatingPlatform
            key={`outer-${i}`}
            position={[Math.cos(theta) * r, -0.2 + Math.sin(i * 1.5) * 0.2, Math.sin(theta) * r]}
            radius={0.5 + (i % 3) * 0.15}
          />
        );
      })}

      {/* Chain bridges between ring platforms */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const next = (i + 1) % 6;
        const theta1 = (i / 6) * Math.PI * 2;
        const theta2 = (next / 6) * Math.PI * 2;
        const r = 2.8;
        return (
          <ChainBridge
            key={`bridge-${i}`}
            from={[Math.cos(theta1) * r, 0.3, Math.sin(theta1) * r]}
            to={[Math.cos(theta2) * r, 0.3, Math.sin(theta2) * r]}
          />
        );
      })}

      {/* Bridges from ring to outer */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const theta = (i / 6) * Math.PI * 2;
        const r1 = 0;
        const r2 = 2.8;
        return (
          <ChainBridge
            key={`radial-${i}`}
            from={[0, 0, 0]}
            to={[Math.cos(theta) * r2, 0.3, Math.sin(theta) * r2]}
          />
        );
      })}

      {/* Cloud towers */}
      <CloudTower position={[3, -0.3, 3]} />
      <CloudTower position={[-3, -0.3, 3]} />
      <CloudTower position={[0, -0.3, -4]} />
      <CloudTower position={[4, -0.5, -2]} />
      <CloudTower position={[-4, -0.5, -2]} />

      {/* Acid rain */}
      <AcidRainParticles />

      {/* Lightning */}
      <LightningStorm />

      {/* Cloud wisps */}
      {[[0, 0.5, 0], [2, 0.4, 2], [-2, 0.5, -1], [1, 0.6, -2], [-1, 0.4, 2]].map((p, i) => (
        <mesh key={`wisp-${i}`} position={p as any}>
          <sphereGeometry args={[0.8 + Math.random() * 1.2, 12, 12]} />
          <meshBasicMaterial color="#e8c878" transparent opacity={0.02} depthWrite={false} />
        </mesh>
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.2} color="#ff8844" />
      <directionalLight position={[0, 5, 3]} intensity={0.4} color="#ffaa44" />
      <hemisphereLight args={["#ff8844", "#442200", 0.3]} />
    </group>
  );
}
