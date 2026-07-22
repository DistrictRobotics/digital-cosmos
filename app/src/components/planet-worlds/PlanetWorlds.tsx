import { lazy, Suspense } from "react";
import type { ReactNode } from "react";

const MarsColony = lazy(() => import("./MarsColony"));
const SaturnRings = lazy(() => import("./SaturnRings"));
const JupiterStorm = lazy(() => import("./JupiterStorm"));
const VenusHellscape = lazy(() => import("./VenusHellscape"));
const EarthNetwork = lazy(() => import("./EarthNetwork"));
const IceWorld = lazy(() => import("./IceWorld"));

export default function PlanetWorlds({
  focusPlanet,
  orbitRadius,
}: {
  focusPlanet: string | null;
  orbitRadius: number;
}) {
  if (!focusPlanet) return null;

  const world = getWorldComponent(focusPlanet);
  if (!world) return null;

  return (
    <Suspense fallback={null}>
      {world}
    </Suspense>
  );
}

function getWorldComponent(name: string): ReactNode | null {
  const worlds: Record<string, ReactNode> = {
    Mars: <MarsColony />,
    Saturn: <SaturnRings />,
    Jupiter: <JupiterStorm />,
    Venus: <VenusHellscape />,
    Earth: <EarthNetwork />,
    Uranus: <IceWorld color="#7ec8e3" ring />,
    Neptune: <IceWorld color="#4169e1" />,
    Mercury: <IceWorld color="#b0a090" />,
  };
  return worlds[name] ?? null;
}
