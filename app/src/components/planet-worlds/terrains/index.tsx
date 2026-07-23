import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";

/* ═══════════════════════════════════════════
   TERRAIN LIBRARY — 8 types with noise, craters, canyons
   ═══════════════════════════════════════════ */

/* ─── Simple noise function ─── */
function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) / 2147483647;
}

function smoothNoise(x: number, y: number, scale: number): number {
  const sx = x / scale, sy = y / scale;
  const ix = Math.floor(sx), iy = Math.floor(sy);
  const fx = sx - ix, fy = sy - iy;
  const sx2 = fx * fx * (3 - 2 * fx);
  const sy2 = fy * fy * (3 - 2 * fy);
  const n00 = hash(ix, iy);
  const n10 = hash(ix + 1, iy);
  const n01 = hash(ix, iy + 1);
  const n11 = hash(ix + 1, iy + 1);
  const nx0 = n00 + (n10 - n00) * sx2;
  const nx1 = n01 + (n11 - n01) * sx2;
  return nx0 + (nx1 - nx0) * sy2;
}

function fbm(x: number, y: number, octaves = 3): number {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * smoothNoise(x * freq, y * freq, 2);
    amp *= 0.5;
    freq *= 2;
  }
  return val;
}

/* ─── Generate terrain heightmap ─── */
function generateTerrain(
  width: number, depth: number, segments: number,
  type: string, roughness: number, seed: number
): { positions: Float32Array; colors: Float32Array; normals: Float32Array } {
  const w = segments + 1;
  const totalVerts = w * w;
  const positions = new Float32Array(totalVerts * 3);
  const colors = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const halfW = width / 2, halfD = depth / 2;

  const colorCache = new Map<string, string>();

  for (let iz = 0; iz <= segments; iz++) {
    for (let ix = 0; ix <= segments; ix++) {
      const idx = (iz * w + ix) * 3;
      const x = (ix / segments - 0.5) * width;
      const z = (iz / segments - 0.5) * depth;

      let h = 0;
      const nz = (iz + seed) * 0.1, nx = (ix + seed) * 0.1;

      switch (type) {
        case "rocky":
          h = fbm(nx, nz, 4) * roughness * 1.2;
          // Add craters
          for (let c = 0; c < 3; c++) {
            const cx = (Math.sin(seed + c * 7.3) * 0.5 + 0.5) * width - halfW;
            const cz = (Math.cos(seed + c * 11.7) * 0.5 + 0.5) * depth - halfD;
            const cr = 2 + Math.sin(seed + c * 3.1) * 1.5;
            const dist = Math.sqrt((x - cx) ** 2 + (z - cz) ** 2);
            if (dist < cr) h -= (1 - dist / cr) * roughness * 0.8;
          }
          break;
        case "desert":
          h = fbm(nx, nz, 2) * roughness * 0.4;
          // Dunes
          h += Math.sin(x * 0.3 + seed) * Math.cos(z * 0.2 + seed * 0.7) * roughness * 0.3;
          break;
        case "icy":
          h = fbm(nx, nz, 2) * roughness * 0.15;
          // Cracks
          h += Math.sin(x * 2 + seed) * Math.cos(z * 1.8 + seed * 0.5) * roughness * 0.05;
          break;
        case "volcanic":
          h = fbm(nx, nz, 4) * roughness * 1.5;
          // Central cone
          const distFromCenter = Math.sqrt(x * x + z * z);
          h += Math.max(0, 1 - distFromCenter / 5) * roughness * 2;
          // Lava channels
          h += Math.sin(x * 0.5 + z * 0.3 + seed) * roughness * 0.2;
          break;
        case "oceanic":
          h = fbm(nx, nz, 2) * roughness * 0.1 - 0.05;
          break;
        case "urban":
          h = fbm(nx, nz, 1) * roughness * 0.05;
          break;
        case "gaseous":
          h = 0;
          break;
        case "space":
          h = fbm(nx, nz, 3) * roughness * 0.3;
          break;
        default:
          h = fbm(nx, nz, 3) * roughness * 0.5;
      }

      positions[idx] = x;
      positions[idx + 1] = h;
      positions[idx + 2] = z;

      // Color by height
      const key = `${type}-${h.toFixed(2)}`;
      let col = colorCache.get(key);
      if (!col) {
        col = getTerrainColor(type, h, roughness);
        colorCache.set(key, col);
      }
      const c = new THREE.Color(col);
      colors[idx] = c.r;
      colors[idx + 1] = c.g;
      colors[idx + 2] = c.b;
    }
  }

  // Compute normals
  for (let iz = 0; iz < segments; iz++) {
    for (let ix = 0; ix < segments; ix++) {
      const idx = (iz * w + ix) * 3;
      const right = (iz * w + ix + 1) * 3;
      const down = ((iz + 1) * w + ix) * 3;

      const v1 = new THREE.Vector3(positions[idx], positions[idx + 1], positions[idx + 2]);
      const v2 = new THREE.Vector3(positions[right], positions[right + 1], positions[right + 2]);
      const v3 = new THREE.Vector3(positions[down], positions[down + 1], positions[down + 2]);

      const e1 = new THREE.Vector3().copy(v2).sub(v1);
      const e2 = new THREE.Vector3().copy(v3).sub(v1);
      const n = new THREE.Vector3().crossVectors(e1, e2).normalize();

      normals[idx] = n.x; normals[idx + 1] = n.y; normals[idx + 2] = n.z;
    }
  }

  return { positions, colors, normals };
}

function getTerrainColor(type: string, h: number, roughness: number): string {
  const maxH = roughness * 1.5;

  switch (type) {
    case "rocky":
      if (h > maxH * 0.5) return "#8a7a68";
      if (h > 0) return "#6a5a48";
      if (h > -maxH * 0.3) return "#5a4a38";
      return "#3a2a18";
    case "desert":
      if (h > maxH * 0.3) return "#c48844";
      return "#a06828";
    case "icy":
      if (h > 0) return "#cceeef";
      return "#88aacc";
    case "volcanic":
      if (h > maxH * 0.8) return "#4a2a1a";
      if (h > maxH * 0.3) return "#2a1a0a";
      return "#1a0a00";
    case "oceanic":
      return "#224466";
    case "urban":
      return "#445566";
    case "space":
      return "#2a3a4a";
    default:
      return "#445566";
  }
}

/* ─── Terrain component ─── */
export function WorldTerrain({
  width = 30, depth = 30, segments = 60,
  type = "rocky", roughness = 0.8, seed = 0,
  emissiveIntensity = 0.02,
}: {
  width?: number; depth?: number; segments?: number;
  type?: string; roughness?: number; seed?: number;
  emissiveIntensity?: number;
}) {
  const geo = useMemo(() => {
    const { positions, colors, normals } = generateTerrain(width, depth, segments, type, roughness, seed);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(normals, 3));

    // Build indices
    const indices: number[] = [];
    const w = segments + 1;
    for (let iz = 0; iz < segments; iz++) {
      for (let ix = 0; ix < segments; ix++) {
        const a = iz * w + ix;
        const b = iz * w + ix + 1;
        const c = (iz + 1) * w + ix;
        const d = (iz + 1) * w + ix + 1;
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [width, depth, segments, type, roughness, seed]);

  const baseColor = getTerrainColor(type, 0, roughness);

  return (
    <mesh geometry={geo} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        vertexColors
        roughness={0.85}
        metalness={0.1}
        flatShading
      />
    </mesh>
  );
}

/* ─── Lava surface (for volcanic worlds) ─── */
export function LavaSurface({ position = [0, 0, 0], radius = 2 }: {
  position?: [number, number, number]; radius?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.material.opacity = 0.15 + Math.sin(clock.getElapsedTime() * 0.3) * 0.08;
  });
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 24]} />
      <meshBasicMaterial color="#ff4400" transparent opacity={0.15} />
    </mesh>
  );
}

/* ─── Water surface (for oceanic worlds) ─── */
export function WaterSurface({ position = [0, 0, 0], size = 15 }: {
  position?: [number, number, number]; size?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.02;
    (ref.current.material as THREE.MeshStandardMaterial).opacity = 0.12 + Math.sin(clock.getElapsedTime() * 0.1) * 0.03;
  });
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size, 8, 8]} />
      <meshStandardMaterial color="#224488" transparent opacity={0.12} metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

/* ─── Ice surface (for icy worlds) ─── */
export function IceSurface({ position = [0, 0, 0], size = 15 }: {
  position?: [number, number, number]; size?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    (ref.current.material as THREE.MeshStandardMaterial).opacity = 0.15 + Math.sin(clock.getElapsedTime() * 0.15) * 0.05;
  });
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#88bbdd" transparent opacity={0.15} metalness={0.8} roughness={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ─── Cloud layer (for dense atmospheres) ─── */
export function CloudLayer({ position = [0, 1, 0], radius = 6, color = "#e8c878", opacity = 0.08 }: {
  position?: [number, number, number]; radius?: number; color?: string; opacity?: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.01;
  });
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.3, radius, 48]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}