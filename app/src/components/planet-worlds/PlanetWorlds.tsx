import { lazy, Suspense, useState, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import ProceduralWorld from "./ProceduralWorld";
import PlayerController from "../player/PlayerController";
import PlayerHUD from "../player/PlayerHUD";
import type { PlayerMode, Interactable } from "../player/PlayerController";
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

const CUSTOM_WORLDS: Record<string, ReactNode> = {
  Earth: <EarthWorld />, Mars: <MarsWorld />, Venus: <VenusWorld />,
  Saturn: <SaturnWorld />, Jupiter: <JupiterWorld />,
  Mercury: <MercuryWorld />, Neptune: <NeptuneWorld />, Uranus: <UranusWorld />,
};

const WORLD_MAP: Record<string, string> = {
  "mercury-surface": "Mercury", "mercury-observatory": "Mercury",
  "mercury-dark-side": "Mercury", "mercury-caloris": "Mercury", "mercury-solar-sail": "Mercury",
  "venus-cloud-city": "Venus", "venus-sulfur-plant": "Venus", "venus-float-lab": "Venus",
  "venus-surface-probe": "Venus", "venus-atmo-mine": "Venus",
  "earth-hq": "Earth", "earth-orbital": "Earth", "earth-lunar": "Earth",
  "earth-deep-sea": "Earth", "earth-arctic": "Earth",
  "earth-stem-alpha": "Earth", "earth-ai-research": "Earth", "earth-launch-complex": "Earth",
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
  "uranus-ring-station": "Uranus", "uranus-miranda": "Miranda", "uranus-ariel": "Ariel",
  "uranus-oberon": "Oberon",
  "neptune-triton": "Triton", "neptune-nereid": "Nereid",
  "neptune-storm-watch": "Neptune", "neptune-kuiper": "Neptune",
  "deep-pluto": "Pluto", "deep-charon": "Charon", "deep-oort": "Oort Cloud",
  "deep-interstellar": "Deep Space",
};

/* ─── SceneBridge — exposes scene ref to parent ─── */
function SceneBridge({ onScene }: { onScene: (s: THREE.Scene) => void }) {
  const { scene } = useThree();
  const done = useRef(false);
  if (!done.current && scene) { done.current = true; onScene(scene); }
  return null;
}

export default function PlanetWorlds({ focusPlanet }: { focusPlanet: string | null }) {
  const [playerMode, setPlayerMode] = useState<PlayerMode>("walk");
  const [playerActive, setPlayerActive] = useState(false);
  const [sceneRef, setSceneRef] = useState<THREE.Scene | null>(null);
  const [nearbyInteraction, setNearbyInteraction] = useState<string | null>(null);
  const [health, setHealth] = useState(100);

  if (!focusPlanet) return null;
  const worldComponent = getWorldComponent(focusPlanet);

  const handleInteract = useCallback(() => {
    if (!playerActive) { setPlayerActive(true); return; }
    // Interaction with nearby objects
    setNearbyInteraction(null);
  }, [playerActive]);

  return (
    <Suspense fallback={null}>
      {/* Scene reference */}
      <SceneBridge onScene={setSceneRef} />

      {/* Lighting with shadows */}
      <ambientLight intensity={0.3} color="#4466aa" />
      <directionalLight
        position={[15, 20, 10]}
        intensity={0.6}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      {worldComponent}

      {playerActive && (
        <PlayerController
          mode={playerMode}
          onModeChange={setPlayerMode}
          onInteract={handleInteract}
          scene={sceneRef}
        />
      )}

      {playerActive && (
        <PlayerHUD
          mode={playerMode}
          nearbyInteraction={nearbyInteraction}
          health={health}
        />
      )}

      {!playerActive && (
        <div
          onClick={() => setPlayerActive(true)}
          style={{
            position: "fixed", bottom: "40px", left: "50%", transform: "translateX(-50%)",
            zIndex: 100, padding: "8px 16px",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
            borderRadius: "8px", border: "1px solid rgba(0,212,255,0.2)",
            color: "rgba(255,255,255,0.6)", fontSize: "11px", fontFamily: "monospace",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
          }}
        >
          <span style={{ color: "#00d4ff", fontSize: "9px" }}>PRESS</span>
          <span style={{ padding: "2px 5px", background: "rgba(0,212,255,0.1)", borderRadius: "3px", color: "#00d4ff", fontSize: "10px", fontWeight: "bold" }}>E</span>
          <span style={{ color: "#00d4ff", fontSize: "9px" }}>TO EXPLORE</span>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "8px", marginLeft: "4px" }}>
            WASD · TAB switch · Sprint L-Shift
          </span>
        </div>
      )}
    </Suspense>
  );
}

export function getWorldComponent(name: string): ReactNode | null {
  if (CUSTOM_WORLDS[name]) return <Suspense fallback={null}>{CUSTOM_WORLDS[name]}</Suspense>;
  const stemWorldId = Object.entries(WORLD_MAP).find(([, planet]) => planet === name)?.[0];
  if (stemWorldId) {
    const world = getWorldById(stemWorldId);
    if (world) return <ProceduralWorld world={world} />;
  }
  const world = getWorldById(name);
  if (world) return <ProceduralWorld world={world} />;
  return null;
}

export function isLandableWorld(name: string): boolean {
  if (CUSTOM_WORLDS[name]) return true;
  const stemWorldId = Object.entries(WORLD_MAP).find(([, planet]) => planet === name)?.[0];
  if (stemWorldId && getWorldById(stemWorldId)) return true;
  if (getWorldById(name)) return true;
  return false;
}