import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points } from "three";
import { ProceduralTerrain, Building } from "./shared";
import type { World } from "../stem-academy/catalog/types";

/* ─── NASA-style color palettes for each planet ─── */
const TERRAIN_PALETTES: Record<string, { ground: string; high: string; low: string; atmosphere: string; accent: string }> = {
  Mercury: { ground: "#8a7a68", high: "#b0a090", low: "#6a5a48", atmosphere: "rgba(200,180,160,0.02)", accent: "#ff8844" },
  Venus:   { ground: "#c48844", high: "#e8a868", low: "#a06828", atmosphere: "rgba(232,200,120,0.15)", accent: "#ffaa33" },
  Earth:   { ground: "#3a7a3a", high: "#5a9a5a", low: "#2a5a2a", atmosphere: "rgba(68,136,204,0.12)", accent: "#00d4ff" },
  Mars:    { ground: "#b04428", high: "#d46848", low: "#8a3418", atmosphere: "rgba(196,68,46,0.08)", accent: "#ff8844" },
  Ceres:   { ground: "#7a6a58", high: "#9a8a78", low: "#5a4a38", atmosphere: "rgba(0,0,0,0)", accent: "#88aacc" },
  Vesta:   { ground: "#8a7a58", high: "#aa9a78", low: "#6a5a38", atmosphere: "rgba(0,0,0,0)", accent: "#cc8844" },
  Belt:    { ground: "#5a5a6a", high: "#7a7a8a", low: "#3a3a4a", atmosphere: "rgba(0,0,0,0)", accent: "#ffcc00" },
  Psyche:  { ground: "#6a7a8a", high: "#8a9aaa", low: "#4a5a6a", atmosphere: "rgba(0,0,0,0)", accent: "#ddaa00" },
  Jupiter: { ground: "#c49a6a", high: "#d4b080", low: "#b48858", atmosphere: "rgba(212,160,106,0.2)", accent: "#ff6644" },
  Io:      { ground: "#cc6622", high: "#ee8844", low: "#aa4410", atmosphere: "rgba(204,102,34,0.06)", accent: "#ff8844" },
  Europa:  { ground: "#88aacc", high: "#aaccee", low: "#6688aa", atmosphere: "rgba(136,170,204,0.08)", accent: "#44aaff" },
  Ganymede:{ ground: "#8a9a88", high: "#aabaaa", low: "#6a7a68", atmosphere: "rgba(0,0,0,0)", accent: "#88ddaa" },
  Callisto:{ ground: "#6a5a48", high: "#8a7a68", low: "#4a3a28", atmosphere: "rgba(0,0,0,0)", accent: "#88aa88" },
  Saturn:  { ground: "#c8b888", high: "#e8d8a8", low: "#a89868", atmosphere: "rgba(232,213,160,0.12)", accent: "#d4c090" },
  Titan:   { ground: "#b87828", high: "#d89848", low: "#986810", atmosphere: "rgba(200,136,50,0.15)", accent: "#ffaa44" },
  Enceladus:{ground: "#cceeef", high: "#eeffff", low: "#aacccd", atmosphere: "rgba(200,230,240,0.06)", accent: "#88ccff" },
  Mimas:   { ground: "#7a8a9a", high: "#9aaaba", low: "#5a6a7a", atmosphere: "rgba(0,0,0,0)", accent: "#aabbcc" },
  Dione:   { ground: "#aabbcc", high: "#ccddee", low: "#8899aa", atmosphere: "rgba(0,0,0,0)", accent: "#8899bb" },
  Rhea:    { ground: "#9aaabc", high: "#bbccdd", low: "#78899a", atmosphere: "rgba(0,0,0,0)", accent: "#99aabb" },
  Uranus:  { ground: "#6ab8d3", high: "#8ad8f3", low: "#4a98b3", atmosphere: "rgba(126,200,227,0.12)", accent: "#88ccee" },
  Miranda: { ground: "#7a8a9a", high: "#9aaaba", low: "#5a6a7a", atmosphere: "rgba(0,0,0,0)", accent: "#aabbcc" },
  Ariel:   { ground: "#9aabbc", high: "#bbccdd", low: "#78899a", atmosphere: "rgba(0,0,0,0)", accent: "#aaccdd" },
  Oberon:  { ground: "#5a6a7a", high: "#7a8a9a", low: "#3a4a5a", atmosphere: "rgba(0,0,0,0)", accent: "#8899bb" },
  Neptune: { ground: "#334488", high: "#5577aa", low: "#223366", atmosphere: "rgba(51,85,170,0.15)", accent: "#4466cc" },
  Triton:  { ground: "#4466aa", high: "#6688cc", low: "#224488", atmosphere: "rgba(68,102,170,0.08)", accent: "#88aaff" },
  Nereid:  { ground: "#5577aa", high: "#7799cc", low: "#335588", atmosphere: "rgba(0,0,0,0)", accent: "#6699cc" },
  Pluto:   { ground: "#6a5a48", high: "#8a7a68", low: "#4a3a28", atmosphere: "rgba(136,122,104,0.04)", accent: "#88aacc" },
  Charon:  { ground: "#5a6a78", high: "#7a8a98", low: "#3a4a58", atmosphere: "rgba(0,0,0,0)", accent: "#99aabb" },
  "Oort Cloud": { ground: "#2a3a4a", high: "#4a5a6a", low: "#1a2a3a", atmosphere: "rgba(0,0,0,0)", accent: "#557788" },
  "Deep Space": { ground: "#1a2a3a", high: "#3a4a5a", low: "#0a1a2a", atmosphere: "rgba(0,0,0,0)", accent: "#00d4ff" },
};

/* ─── Atmosphere ring ─── */
function AtmosphereRing({ color, opacity, radius }: { color: string; opacity: number; radius: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.02;
  });
  return (
    <mesh ref={ref} rotation-x={Math.PI / 2} position={[0, -0.5, 0]}>
      <ringGeometry args={[radius * 0.5, radius * 1.2, 64]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ─── Sunlight direction indicator ─── */
function SunGlow({ color, intensity = 0.3 }: { color: string; intensity?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={ref} position={[20, 15, 0]}>
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={intensity} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ─── Structure generators per environment type ─── */
function generateStructures(world: World, palette: typeof TERRAIN_PALETTES[string]) {
  const elements: React.ReactElement[] = [];
  const { environment } = world;
  const seed = world.id.length;

  if (environment.hasStructures) {
    // Habitat domes / buildings
    const numBuildings = 3 + (seed % 5);
    for (let i = 0; i < numBuildings; i++) {
      const angle = (i / numBuildings) * Math.PI * 2 + seed * 0.1;
      const dist = 2 + Math.random() * 4;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      elements.push(
        <Building key={`b-${i}`} position={[x, 0, z]} color={palette.accent} />
      );
    }
  }

  if (environment.hasVehicles) {
    // Simple antenna/vehicle markers
    const numVehicles = 2 + (seed % 3);
    for (let i = 0; i < numVehicles; i++) {
      const angle = (i / numVehicles) * Math.PI * 2 + 0.5;
      const dist = 4 + Math.random() * 3;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      elements.push(
        <mesh key={`v-${i}`} position={[x, 0.1, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.2, 4]} />
          <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.2} />
        </mesh>
      );
    }
  }

  if (environment.hasVegetation) {
    // Simple vegetation - small spheres
    const numPlants = 5 + (seed % 8);
    for (let i = 0; i < numPlants; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 1 + Math.random() * 5;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      elements.push(
        <mesh key={`p-${i}`} position={[x, 0.05, z]}>
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshStandardMaterial color="#44aa44" />
        </mesh>
      );
    }
  }

  return elements;
}

/* ─── ProceduralWorld — generates any world from catalog data ─── */
export default function ProceduralWorld({ world }: { world: World }) {
  const palette = TERRAIN_PALETTES[world.planet] || TERRAIN_PALETTES.Earth;
  const { environment } = world;

  const structures = useMemo(() => generateStructures(world, palette), [world, palette]);

  // Terrain config based on environment
  const terrainConfig = useMemo(() => {
    let heightScale = 0.8;
    let bumps = 12;
    let color = palette.ground;

    switch (environment.terrain) {
      case "rocky": heightScale = 1.2; bumps = 18; break;
      case "desert": heightScale = 0.6; bumps = 8; break;
      case "icy": heightScale = 0.3; bumps = 6; color = palette.low; break;
      case "oceanic": heightScale = 0.2; bumps = 4; break;
      case "urban": heightScale = 0.3; bumps = 5; break;
      case "volcanic": heightScale = 1.5; bumps = 20; color = palette.low; break;
      case "gaseous": heightScale = 0.1; bumps = 3; break;
      case "space": heightScale = 0; bumps = 0; break;
    }

    // Temperature affects color
    if (environment.temperature === "extreme-hot") color = "#aa4422";
    if (environment.temperature === "hot") color = "#886633";
    if (environment.temperature === "extreme-cold") color = "#8899bb";

    return { heightScale, bumps, color };
  }, [environment, palette]);

  return (
    <group>
      {/* Terrain */}
      {environment.terrain !== "space" && environment.terrain !== "gaseous" && (
        <ProceduralTerrain
          width={30}
          depth={30}
          segments={40}
          color={terrainConfig.color}
          heightScale={terrainConfig.heightScale}
          bumps={terrainConfig.bumps}
        />
      )}

      {/* Gaseous/space terrain — just a flat platform */}
      {(environment.terrain === "space" || environment.terrain === "gaseous") && (
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.1, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshBasicMaterial color={palette.ground} transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Atmosphere glow */}
      {environment.atmosphere !== "none" && (
        <AtmosphereRing
          color={palette.atmosphere}
          opacity={environment.atmosphere === "dense" ? 0.2 : environment.atmosphere === "corrosive" ? 0.15 : 0.08}
          radius={8}
        />
      )}

      {/* Structures */}
      {structures}

      {/* Sun glow */}
      <SunGlow color={palette.accent} intensity={environment.temperature === "extreme-hot" ? 0.6 : 0.3} />

      {/* Ambient light */}
      <ambientLight intensity={0.3} color={palette.accent} />
      <directionalLight position={[10, 15, 5]} intensity={0.5} color="#ffffff" />
    </group>
  );
}