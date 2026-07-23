import { useMemo } from "react";
import WorldBuilder from "./worlds/WorldBuilder";
import { getWorldConfig } from "./worlds/world-configs";
import type { World } from "../stem-academy/catalog/types";

/* ─── STEM Academy world → WorldConfig bridge ─── */
export default function ProceduralWorld({ world }: { world: World }) {
  const config = useMemo(() => {
    // Try to find a matching config by world id
    const cfg = getWorldConfig(world.id);
    if (cfg) return cfg;

    // Fallback: generate a config from world environment data
    return buildFallbackConfig(world);
  }, [world]);

  return <WorldBuilder config={config as any} />;
}

/* ─── Fallback for worlds without a specific config ─── */
function buildFallbackConfig(world: World) {
  const { environment } = world;
  const seed = world.id.length + world.order;

  // Determine terrain type
  let terrainType = environment.terrain;
  if (terrainType === "space") terrainType = "space";
  else if (terrainType === "gaseous") terrainType = "gaseous";
  else if (terrainType === "oceanic") terrainType = "oceanic";
  else if (terrainType === "icy") terrainType = "icy";
  else if (terrainType === "volcanic") terrainType = "volcanic";
  else if (terrainType === "desert") terrainType = "desert";
  else if (terrainType === "urban") terrainType = "urban";
  else terrainType = "rocky";

  // Determine atmosphere
  const atmosphere = environment.atmosphere !== "none" ? {
    color: "rgba(100,150,200,0.08)",
    opacity: environment.atmosphere === "dense" ? 0.15 : environment.atmosphere === "corrosive" ? 0.12 : 0.06,
    radius: 7,
  } : undefined;

  // Build structures
  const structures: any[] = [];
  if (environment.hasStructures) {
    structures.push({ type: "HabitatDome", position: [0, 0, 0], params: { color: "#8899aa", glowColor: "#00d4ff", radius: 0.4 } });
    structures.push({ type: "AntennaTower", position: [2, 0, 0], params: { color: "#00d4ff" } });
    structures.push({ type: "SolarArray", position: [-2, 0, 0], params: { panels: 6, span: 0.8 } });
    structures.push({ type: "LandingPad", position: [0, 0, -2.5] });
  }
  if (environment.hasVehicles) {
    structures.push({ type: "CargoContainer", position: [1.5, 0, 1.5], params: { color: "#00d4ff" } });
  }
  if (environment.hasVegetation) {
    structures.push({ type: "Greenhouse", position: [-1.5, 0, 1.5], params: { color: "#44aa44" } });
  }

  // Particles based on terrain
  const particles: any[] = [];
  if (terrainType === "desert" || terrainType === "rocky") {
    particles.push({ type: "DustStorm", params: { color: "#8a7a68", count: 300, radius: 6 } });
  }
  if (environment.atmosphere === "corrosive" || environment.atmosphere === "dense") {
    particles.push({ type: "AcidRain", params: { color: "#88aa44", count: 300, width: 7 } });
  }
  if (terrainType === "icy" || environment.temperature === "extreme-cold") {
    particles.push({ type: "IceCrystals", params: { color: "#88ddff", count: 200, radius: 4 } });
  }
  if (terrainType === "volcanic") {
    particles.push({ type: "AshFall", params: { color: "#444444", count: 400, width: 6 } });
  }

  // Lighting
  const isHot = environment.temperature === "extreme-hot" || environment.temperature === "hot";
  const isCold = environment.temperature === "extreme-cold" || environment.temperature === "cold";

  return {
    name: world.name,
    seed,
    terrain: { type: terrainType, roughness: isHot ? 1.2 : isCold ? 0.4 : 0.8 },
    atmosphere,
    structures,
    particles,
    lighting: {
      ambient: isHot ? "#664422" : isCold ? "#446688" : "#445566",
      ambientIntensity: isHot ? 0.3 : isCold ? 0.15 : 0.25,
      sunColor: isHot ? "#ffaa44" : isCold ? "#88aaff" : "#ffffff",
      sunIntensity: isHot ? 0.6 : isCold ? 0.2 : 0.4,
      sunPosition: isHot ? [20, 15, 0] : [10, 5, 10],
    },
  };
}