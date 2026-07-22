import { lazy, Suspense } from "react";
import type { ReactNode } from "react";

const EarthWorld = lazy(() => import("./EarthWorld"));
const MarsWorld = lazy(() => import("./MarsWorld"));
const VenusWorld = lazy(() => import("./VenusWorld"));
const SaturnWorld = lazy(() => import("./SaturnWorld"));
const JupiterWorld = lazy(() => import("./JupiterWorld"));
const MercuryWorld = lazy(() => import("./MercuryWorld"));
const NeptuneWorld = lazy(() => import("./NeptuneWorld"));
const UranusWorld = lazy(() => import("./UranusWorld"));

export default function PlanetWorlds({
  focusPlanet,
}: {
  focusPlanet: string | null;
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
    Earth: <EarthWorld />,
    Mars: <MarsWorld />,
    Venus: <VenusWorld />,
    Saturn: <SaturnWorld />,
    Jupiter: <JupiterWorld />,
    Mercury: <MercuryWorld />,
    Neptune: <NeptuneWorld />,
    Uranus: <UranusWorld />,
  };
  return worlds[name] ?? null;
}