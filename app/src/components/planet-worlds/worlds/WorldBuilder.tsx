import { useMemo } from "react";
import * as THREE from "three";
import { WorldTerrain, LavaSurface, WaterSurface, IceSurface, CloudLayer } from "../terrains";
import { DustStorm, AcidRain, Snowfall, AshFall, IceCrystals, Bioluminescence, LightningBolt, Aurora, Bubbles } from "../particles";
import * as S from "../structures";

/* ═══════════════════════════════════════════
   WORLD BUILDER — renders a world from a config
   ═══════════════════════════════════════════ */

export interface WorldConfig {
  name: string;
  seed: number;
  terrain: { type: string; roughness: number; width?: number; depth?: number };
  atmosphere?: { color: string; opacity: number; radius: number };
  water?: { surface: boolean; lava?: boolean; ice?: boolean };
  structures: {
    type: string;
    position: [number, number, number];
    params?: Record<string, any>;
  }[];
  particles: {
    type: string;
    params?: Record<string, any>;
  }[];
  lighting?: {
    ambient?: string;
    ambientIntensity?: number;
    sunColor?: string;
    sunIntensity?: number;
    sunPosition?: [number, number, number];
  };
}

/* ─── Structure renderer ─── */
const StructureComponents: Record<string, React.ComponentType<any>> = {
  "HabitatDome": S.HabitatDome, "SolarArray": S.SolarArray, "RadarDish": S.RadarDish,
  "CryoTank": S.CryoTank, "DrillRig": S.DrillRig, "AntennaTower": S.AntennaTower,
  "LandingPad": S.LandingPad, "Greenhouse": S.Greenhouse, "ResearchModule": S.ResearchModule,
  "FuelDepot": S.FuelDepot, "CargoContainer": S.CargoContainer, "ObservationTower": S.ObservationTower,
  "Refinery": S.Refinery, "TelescopeArray": S.TelescopeArray, "LaunchPad": S.LaunchPad,
  "GeothermalVent": S.GeothermalVent, "HabRing": S.HabRing, "CommunicationArray": S.CommunicationArray,
  "PowerCore": S.PowerCore, "SuspensionBridge": S.SuspensionBridge, "WaterTreatment": S.WaterTreatment,
  "BatteryFarm": S.BatteryFarm, "Airlock": S.Airlock, "MiningConveyor": S.MiningConveyor,
  "IceCutter": S.IceCutter,
};

/* ─── Particle renderer ─── */
const ParticleComponents: Record<string, React.ComponentType<any>> = {
  "DustStorm": DustStorm, "AcidRain": AcidRain, "Snowfall": Snowfall,
  "AshFall": AshFall, "IceCrystals": IceCrystals, "Bioluminescence": Bioluminescence,
  "LightningBolt": LightningBolt, "Aurora": Aurora, "Bubbles": Bubbles,
};

/* ─── WorldBuilder ─── */
export default function WorldBuilder({ config }: { config: WorldConfig }) {
  const { terrain, atmosphere, water, structures, particles, lighting } = config;

  const structuresList = useMemo(() => structures, [structures]);
  const particlesList = useMemo(() => particles, [particles]);

  return (
    <group>
      {/* Terrain */}
      <WorldTerrain
        type={terrain.type}
        roughness={terrain.roughness}
        seed={config.seed}
        width={terrain.width || 30}
        depth={terrain.depth || 30}
      />

      {/* Water / Lava / Ice surfaces */}
      {water?.surface && <WaterSurface />}
      {water?.lava && <LavaSurface />}
      {water?.ice && <IceSurface />}

      {/* Atmosphere cloud layer */}
      {atmosphere && (
        <CloudLayer
          color={atmosphere.color}
          opacity={atmosphere.opacity}
          radius={atmosphere.radius}
        />
      )}

      {/* Structures */}
      {structuresList.map((s, i) => {
        const Comp = StructureComponents[s.type];
        if (!Comp) return null;
        return <Comp key={`s-${i}`} position={s.position} {...(s.params || {})} />;
      })}

      {/* Particles */}
      {particlesList.map((p, i) => {
        const Comp = ParticleComponents[p.type];
        if (!Comp) return null;
        return <Comp key={`p-${i}`} {...(p.params || {})} />;
      })}

      {/* Lighting */}
      <ambientLight
        intensity={lighting?.ambientIntensity ?? 0.3}
        color={lighting?.ambient || "#4466aa"}
      />
      <directionalLight
        position={lighting?.sunPosition || [15, 20, 10]}
        intensity={lighting?.sunIntensity ?? 0.5}
        color={lighting?.sunColor || "#ffffff"}
      />
    </group>
  );
}