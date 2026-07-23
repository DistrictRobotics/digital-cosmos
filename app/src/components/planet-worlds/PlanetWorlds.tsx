import { lazy, Suspense, useState, useRef, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import ProceduralWorld from "./ProceduralWorld";
import PlayerController from "../player/PlayerController";
import PlayerHUD from "../player/PlayerHUD";
import type { PlayerMode, Interactable } from "../player/PlayerController";
import { getWorldById } from "../stem-academy/catalog/worlds";
import type { World } from "../stem-academy/catalog/types";
import { startAmbient, stopAmbient, playFootstep, startEngine, stopEngine, envToSoundType } from "../audio/audio-engine";
import SatelliteSky, { SkySatelliteIndicator } from "../satcom/SatelliteSky";
import type { SatelliteEntry } from "../satcom/satellite-catalog";

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

/* ─── SceneBridge — exposes scene ref to parent ─── */
function SceneBridge({ onScene }: { onScene: (s: THREE.Scene) => void }) {
  const { scene } = useThree();
  const done = useRef(false);
  if (!done.current && scene) { done.current = true; onScene(scene); }
  return null;
}

export default function PlanetWorlds({
  focusPlanet, satelliteCatalog, trackedSatellite,
}: {
  focusPlanet: string | null; satelliteCatalog?: SatelliteEntry[]; trackedSatellite?: SatelliteEntry | null;
}) {
  const [playerMode, setPlayerMode] = useState<PlayerMode>("walk");
  const [playerActive, setPlayerActive] = useState(false);
  const [sceneRef, setSceneRef] = useState<THREE.Scene | null>(null);
  const [nearbyInteraction, setNearbyInteraction] = useState<string | null>(null);
  const [health, setHealth] = useState(100);
  const prevMode = useRef<PlayerMode>("walk");

  // Start ambient sound when entering a world
  useEffect(() => {
    if (focusPlanet) {
      startAmbient(envToSoundType(focusPlanet));
    }
    return () => { stopAmbient(); stopEngine(); };
  }, [focusPlanet]);

  // Handle vehicle sounds on mode change
  useEffect(() => {
    if (playerMode === "drone" || playerMode === "rover" || playerMode === "craft") {
      startEngine(playerMode, 0.3);
    } else {
      stopEngine();
    }
    prevMode.current = playerMode;
  }, [playerMode]);

  if (!focusPlanet) return null;
  const worldComponent = getWorldComponent(focusPlanet);

  const handleInteract = useCallback(() => {
    if (!playerActive) { setPlayerActive(true); return; }
    setNearbyInteraction(null);
  }, [playerActive]);

  return (
    <Suspense fallback={null}>
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

      {/* Satellite sky overlay when on planet surface */}
      <SatelliteSky
        catalog={satelliteCatalog || []}
        active={playerActive}
        planetPosition={[0, 0, 0]}
      />
      <SkySatelliteIndicator
        trackedSatellite={trackedSatellite || null}
        satelliteCatalog={satelliteCatalog || []}
        active={playerActive}
      />

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
  const world = getWorldById(name);
  if (world) return <ProceduralWorld world={world} />;
  return null;
}

export function isLandableWorld(name: string): boolean {
  if (CUSTOM_WORLDS[name]) return true;
  if (getWorldById(name)) return true;
  return false;
}