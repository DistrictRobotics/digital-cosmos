import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";

/* Procedural ground plane with random elevation bumps */
export function ProceduralTerrain({
  width = 60,
  depth = 60,
  segments = 80,
  color = "#445566",
  emissive,
  heightScale = 0.8,
  bumps = 12,
}: {
  width?: number;
  depth?: number;
  segments?: number;
  color?: string;
  emissive?: string;
  heightScale?: number;
  bumps?: number;
}) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, depth, segments, segments);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position.array as Float32Array;
    /* Generate random bump centers */
    const centers: [number, number, number][] = [];
    for (let i = 0; i < bumps; i++) {
      const cx = (Math.random() - 0.5) * width * 0.8;
      const cz = (Math.random() - 0.5) * depth * 0.8;
      const r = 4 + Math.random() * 10;
      const h = 0.3 + Math.random() * heightScale;
      centers.push([cx, cz, r, h] as any);
    }
    for (let i = 0; i < pos.length; i += 3) {
      let h = 0;
      for (const [cx, cz, r, bh] of centers) {
        const d = Math.sqrt((pos[i] - cx) ** 2 + (pos[i + 2] - cz) ** 2);
        if (d < r) h += bh * (1 - d / r);
      }
      pos[i + 1] = h;
    }
    g.computeVertexNormals();
    return g;
  }, [width, depth, segments, heightScale, bumps]);

  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial
        color={color}
        emissive={emissive || color}
        emissiveIntensity={emissive ? 0.03 : 0}
        roughness={0.85}
        metalness={0.1}
      />
    </mesh>
  );
}

/* Simple building - box with lit windows */
export function Building({
  position,
  w = 1,
  h = 2,
  d = 1,
  color = "#334455",
  roofColor = "#445566",
  windowCount = 3,
}: {
  position: [number, number, number];
  w?: number;
  h?: number;
  d?: number;
  color?: string;
  roofColor?: string;
  windowCount?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  return (
    <group ref={groupRef} position={position}>
      {/* Main body */}
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, h + 0.05, 0]}>
        <boxGeometry args={[w * 0.95, 0.1, d * 0.95]} />
        <meshStandardMaterial color={roofColor} roughness={0.8} />
      </mesh>
      {/* Windows */}
      <WindowGrid position={[0, h * 0.55, d / 2 + 0.01]} cols={Math.min(windowCount, 4)} rows={2} spacing={0.3} w={w * 0.7} />
    </group>
  );
}

/* Lit window grid on a building face */
function WindowGrid({ position, cols, rows, spacing, w }: any) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((child: any, i) => {
      if (child.material) {
        child.material.opacity = 0.3 + Math.sin(clock.getElapsedTime() * 0.5 + i * 1.3) * 0.2 + 0.3;
      }
    });
  });
  const win = useMemo(() => {
    const arr = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -spacing * (cols - 1) / 2 + c * spacing;
        const y = -spacing * (rows - 1) / 2 + r * spacing;
        arr.push([x, y]);
      }
    }
    return arr;
  }, [cols, rows, spacing]);

  return (
    <group ref={ref} position={position}>
      {win.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <planeGeometry args={[0.06, 0.08]} />
          <meshBasicMaterial color="#ffee88" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/* Moving vehicle on a path */
export function GroundVehicle({ path, speed = 0.5, color = "#667788", offset = 0 }: { path: [number, number, number][]; speed?: number; color?: string; offset?: number }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(offset);

  useFrame((_, delta) => {
    if (!ref.current) return;
    t.current += delta * speed * 0.1;
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
    ref.current.lookAt(n[0], p[1], n[2]);
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.3, 0.1, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.08, -0.15]}>
        <boxGeometry args={[0.15, 0.05, 0.05]} />
        <meshStandardMaterial color="#44aaff" emissive="#44aaff" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

/* Flying vehicle (air taxi / drone) */
export function FlyingVehicle({ position, radius = 8, speed = 0.3, height = 3, color = "#00d4ff" }: { position: [number, number, number]; radius?: number; speed?: number; height?: number; color?: string }) {
  const ref = useRef<THREE.Group>(null);
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!ref.current) return;
    angle.current += delta * speed;
    ref.current.position.x = position[0] + Math.cos(angle.current) * radius;
    ref.current.position.z = position[2] + Math.sin(angle.current) * radius;
    ref.current.position.y = position[1] + height + Math.sin(angle.current * 2) * 0.2;
    ref.current.lookAt(position[0], position[1] + height, position[2]);
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.25, 0.02, 0.3]} />
        <meshStandardMaterial color="#334466" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* City block - cluster of buildings */
export function CityBlock({ position, size, density = 4, colorBase = "#2a3a4a" }: { position: [number, number, number]; size: number; density?: number; colorBase?: string }) {
  const blocks = useMemo(() => {
    const arr = [];
    const spacing = size / density;
    for (let i = 0; i < density; i++) {
      for (let j = 0; j < density; j++) {
        const x = -size / 2 + spacing * i + spacing / 2 + (Math.random() - 0.5) * spacing * 0.3;
        const z = -size / 2 + spacing * j + spacing / 2 + (Math.random() - 0.5) * spacing * 0.3;
        const h = 1 + Math.random() * 3;
        const w = 0.5 + Math.random() * 0.8;
        const d = 0.5 + Math.random() * 0.8;
        arr.push({ position: [x, 0, z], w, h, d, color: colorBase });
      }
    }
    return arr;
  }, [size, density, colorBase]);

  return (
    <group position={position}>
      {blocks.map((b, i) => (
        <Building key={i} position={[b.position[0], b.position[1], b.position[2]]} w={b.w} h={b.h} d={b.d} color={b.color} />
      ))}
    </group>
  );
}

/* Atmospheric haze / fog ring */
export function AtmosphericRing({ radius, color = "#00d4ff", opacity = 0.02 }: { radius: number; color?: string; opacity?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.005;
  });
  return (
    <mesh ref={ref} rotation-x={Math.PI / 2}>
      <ringGeometry args={[radius * 0.6, radius * 0.8, 48]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}
