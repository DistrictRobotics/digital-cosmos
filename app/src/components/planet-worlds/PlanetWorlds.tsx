import { lazy, Suspense, useMemo } from "react";
import type { ReactNode } from "react";
import ProceduralWorld from "./ProceduralWorld";
import { getWorldById } from "../stem-academy/catalog/worlds";
import type { World } from "../stem-academy/catalog/types";

const EarthWorld = lazy(() => import("./EarthWorld"));
const MarsWorld = lazy(() => import("./MarsWorld"));
const VenusWorld = lazy(() => import("./VenusWorld"));
const SaturnWorld = lazy(() => import("./SaturnWorld"));
const JupiterWorld = lazy(() => import("./JupiterWorld"));
const MercuryWorld = lazy(() => import("./MercuryWorld"));
const NeptuneWorld = lazy(() => import("./NeptuneWorld"));
const UranusWorld = lazy(() => import("./UranusWorld"));

/* ─── Custom 3D worlds (8 detailed hubs) ─── */
const CUSTOM_WORLDS: Record<string, ReactNode> = {
  Earth: <EarthWorld />,
  Mars: <MarsWorld />,
  Venus: <VenusWorld />,
  Saturn: <SaturnWorld />,
  Jupiter: <JupiterWorld />,
  Mercury: <MercuryWorld />,
  Neptune: <NeptuneWorld />,
  Uranus: <UranusWorld />,
};

/* ─── STEM Academy world name → planet name mapping ─── */
const WORLD_MAP: Record<string, string> = {
  "mercury-surface": "Mercury", "mercury-observatory": "Mercury", "mercury-dark-side": "Mercury",
  "mercury-caloris": "Mercury", "mercury-solar-sail": "Mercury",
  "venus-cloud-city": "Venus", "venus-sulfur-plant": "Venus", "venus-float-lab": "Venus",
  "venus-surface-probe": "Venus", "venus-atmo-mine": "Venus",
  "earth-hq": "Earth", "earth-orbital": "Earth", "earth-lunar": "Earth",
  "earth-deep-sea": "Earth", "earth-arctic": "Earth", "earth-stem-alpha": "Earth",
  "earth-ai-research": "Earth", "earth-launch-complex": "Earth",
  "mars-colony-central": "Mars", "mars-olympus": "Mars", "mars-valles": "Mars",
  "mars-north-pole": "Mars", "mars-phobos": "Mars", "mars-terraform-lab": "Mars",
  "mars-rover-factory": "Mars", "mars-launch-complex": "Mars",
  "asteroid-ceres": "Ceres", "asteroid-vesta": "Vesta", "asteroid-prospector": "Belt",
  "asteroid-navigation": "Belt", "asteroid-radar": "Belt", "asteroid-psyche": "Psyche",
  "jupiter-red-spot": "Jupiter", "jupiter-io": "Io", "jupiter-europa": "Europa",
  "jupiter-ganymede": "Ganymede", "jupiter-callisto": "Callisto", "jupiter-ring": "Jupiter",
  "jupiter-atmo-array": "Jupiter", "jupiter-magnetosphere": "Jupiter",
  "saturn-ring-hub": "Saturn", "saturn-titan": "Titan", "saturn-enceladus": "Enceladus",
  "saturn-mimas": "Mimas", "saturn-dione": "Dione", "saturn-rhea": "Rhea",
  "uranus-ring-station": "Uranus", "uranus-miranda": "Miranda",
  "uranus-ariel": "Ariel", "uranus-oberon": "Oberon",
  "neptune-triton": "Triton", "neptune-nereid": "Nereid",
  "neptune-storm-watch": "Neptune", "neptune-kuiper": "Neptune",
  "deep-pluto": "Pluto", "deep-charon": "Charon",
  "deep-oort": "Oort Cloud", "deep-interstellar": "Deep Space",
};

export default function PlanetWorlds({
  focusPlanet,
}: {
  focusPlanet: string | null;
}) {
  if (!focusPlanet) return null;

  const worldComponent = getWorldComponent(focusPlanet);
  if (!worldComponent) return null;

  return (
    <Suspense fallback={null}>
      {worldComponent}
    </Suspense>
  );
}

export function getWorldComponent(name: string): ReactNode | null {
  // Check for custom 3D world first
  if (CUSTOM_WORLDS[name]) {
    return <Suspense fallback={null}>{CUSTOM_WORLDS[name]}</Suspense>;
  }

  // Check for STEM Academy world
  const stemWorldId = Object.entries(WORLD_MAP).find(([, planet]) => planet === name)?.[0];
  if (stemWorldId) {
    const world = getWorldById(stemWorldId);
    if (world) return <ProceduralWorld world={world} />;
  }

  // Try direct lookup
  const world = getWorldById(name);
  if (world) return <ProceduralWorld world={world} />;

  return null;
}

/* ─── Check if a focus target is a landable world ─── */
export function isLandableWorld(name: string): boolean {
  if (CUSTOM_WORLDS[name]) return true;
  const stemWorldId = Object.entries(WORLD_MAP).find(([, planet]) => planet === name)?.[0];
  if (stemWorldId && getWorldById(stemWorldId)) return true;
  if (getWorldById(name)) return true;
  return false;
}
