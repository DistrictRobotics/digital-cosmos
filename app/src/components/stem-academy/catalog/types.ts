export type WorldDifficulty = "cadet" | "pilot" | "commander" | "explorer" | "scientist";
export type WorldStatus = "locked" | "unlocked" | "completed" | "active";
export type WorldRegion = "inner" | "asteroid" | "jovian" | "saturnian" | "outer" | "deep";

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: "exploration" | "construction" | "research" | "combat" | "puzzle" | "simulation";
  xpReward: number;
  duration: string;
  prerequisites: string[];
  videoUrl?: string;
  stripePriceId?: string;
}

export interface Rank {
  name: string;
  level: number;
  xpRequired: number;
  badge: string;
}

export interface World {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  planet: string;
  region: WorldRegion;
  difficulty: WorldDifficulty;
  order: number;
  color: string;
  secondaryColor: string;
  missions: Mission[];
  environment: {
    terrain: "rocky" | "icy" | "gaseous" | "urban" | "oceanic" | "volcanic" | "desert" | "space";
    atmosphere: "none" | "thin" | "dense" | "toxic" | "corrosive";
    gravity: "low" | "standard" | "high" | "micro";
    temperature: "extreme-cold" | "cold" | "temperate" | "hot" | "extreme-hot";
    hasStructures: boolean;
    hasVehicles: boolean;
    hasVegetation: boolean;
  };
  connectedWorlds: string[];
  parentWorld?: string;
}
