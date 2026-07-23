import type { World, Rank } from "./types";

export const RANKS: Rank[] = [
  { name: "Mission Cadet", level: 0, xpRequired: 0, badge: "🔰" },
  { name: "Space Cadet", level: 1, xpRequired: 100, badge: "⭐" },
  { name: "Junior Pilot", level: 2, xpRequired: 300, badge: "🚀" },
  { name: "Senior Pilot", level: 3, xpRequired: 600, badge: "🛸" },
  { name: "Mission Commander", level: 4, xpRequired: 1000, badge: "👨‍🚀" },
  { name: "Squadron Leader", level: 5, xpRequired: 2000, badge: "⚡" },
  { name: "Fleet Commander", level: 6, xpRequired: 4000, badge: "🌌" },
  { name: "Space Admiral", level: 7, xpRequired: 8000, badge: "👑" },
  { name: "Cosmos Master", level: 8, xpRequired: 15000, badge: "💫" },
  { name: "DREV Legend", level: 9, xpRequired: 30000, badge: "🏆" },
];

export function getRank(xp: number): Rank {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.xpRequired) rank = r;
    else break;
  }
  return rank;
}

export const WORLDS: World[] = [
/* ═══════════════════════════════════════════
   MERCURY — 5 worlds
   ═══════════════════════════════════════════ */
  {
    id: "mercury-surface",
    name: "Mercury Surface Base",
    subtitle: "Frontier of Solar Research",
    description: "The closest outpost to the Sun. Massive solar arrays power cutting-edge heliophysics research. Heat-shielded domes protect crews from extreme radiation.",
    planet: "Mercury", region: "inner", difficulty: "cadet", order: 1,
    color: "#b0a090", secondaryColor: "#ff8844",
    missions: [
      { id: "mer-01", title: "Solar Array Calibration", description: "Align the primary solar collector array for maximum energy capture.", type: "construction", xpReward: 25, duration: "5 min", prerequisites: [] },
      { id: "mer-02", title: "Heat Shield Diagnostics", description: "Run thermal stress tests on the outpost's outer shielding.", type: "research", xpReward: 30, duration: "10 min", prerequisites: ["mer-01"] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "extreme-hot", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["mercury-observatory", "mercury-dark-side"],
  },
  {
    id: "mercury-observatory",
    name: "Solar Observatory",
    subtitle: "Window to the Sun",
    description: "State-of-the-art solar telescope array. Study solar flares, coronal mass ejections, and the Sun's magnetic field up close.", planet: "Mercury", region: "inner", difficulty: "pilot", order: 2,
    color: "#c0a878", secondaryColor: "#ffaa44",
    missions: [
      { id: "mer-03", title: "Solar Flare Tracking", description: "Predict and track a coronal mass ejection using real-time solar data.", type: "research", xpReward: 40, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "hot", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["mercury-surface"],
  },
  {
    id: "mercury-dark-side", name: "Dark Side Cryo Lab", subtitle: "Cold Storage in Eternal Shadow",
    description: "A permanent dark-side facility leveraging Mercury's shadow for ultra-cold quantum experiments and biological sample storage.",
    planet: "Mercury", region: "inner", difficulty: "scientist", order: 3,
    color: "#8899aa", secondaryColor: "#4488ff",
    missions: [
      { id: "mer-04", title: "Quantum Sample Analysis", description: "Process cryo-preserved samples in the dark-side quantum lab.", type: "research", xpReward: 50, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["mercury-surface"],
  },
  {
    id: "mercury-caloris", name: "Caloris Basin Research", subtitle: "Largest Impact Crater",
    description: "Explore the Caloris Basin — one of the largest impact craters in the solar system. Analyze ancient geological formations.",
    planet: "Mercury", region: "inner", difficulty: "explorer", order: 4,
    color: "#a09080", secondaryColor: "#ff6644",
    missions: [
      { id: "mer-05", title: "Basin Geology Survey", description: "Map the geological layers exposed by the Caloris impact.", type: "exploration", xpReward: 45, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "extreme-hot", hasStructures: false, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["mercury-dark-side"],
  },
  {
    id: "mercury-solar-sail", name: "Solar Sail Launch Array", subtitle: "Riding the Sun's Rays",
    description: "Launch facility for solar sail spacecraft. Harness solar radiation pressure to propel deep space missions.",
    planet: "Mercury", region: "inner", difficulty: "commander", order: 5,
    color: "#ccbbaa", secondaryColor: "#ffcc00",
    missions: [
      { id: "mer-06", title: "Solar Sail Deployment", description: "Orchestrate the launch of a solar sail mission to the outer system.", type: "simulation", xpReward: 60, duration: "20 min", prerequisites: ["mer-01", "mer-03"] },
      { id: "mer-07", title: "Mercury Transit Observation", description: "Observe and record a Mercury transit across the Sun's disk from the surface.", type: "research", xpReward: 35, duration: "10 min", prerequisites: ["mer-03"] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "hot", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["mercury-caloris"],
  },

/* ═══════════════════════════════════════════
   VENUS — 5 worlds
   ═══════════════════════════════════════════ */
  {
    id: "venus-cloud-city", name: "Cloud City Hub", subtitle: "Floating in the Sulfur Sky",
    description: "Aerostat platforms floating 50km above Venus's surface. Breathable atmosphere at this altitude, with spectacular orange cloudscapes.",
    planet: "Venus", region: "inner", difficulty: "cadet", order: 6,
    color: "#e8c878", secondaryColor: "#ff8844",
    missions: [
      { id: "ven-01", title: "Platform Stabilization", description: "Adjust ballast systems to maintain optimal altitude in the Venusian atmosphere.", type: "construction", xpReward: 25, duration: "5 min", prerequisites: [] },
      { id: "ven-02", title: "Cloud Analysis Suite", description: "Deploy atmospheric sensors to study Venus's cloud composition.", type: "research", xpReward: 30, duration: "10 min", prerequisites: ["ven-01"] },
    ], environment: { terrain: "space", atmosphere: "dense", gravity: "standard", temperature: "hot", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["venus-sulfur-plant", "venus-float-lab"],
  },
  {
    id: "venus-sulfur-plant", name: "Sulfur Processing Plant", subtitle: "Industrial Alchemy",
    description: "Automated facility extracting sulfur compounds from the atmosphere. Raw materials for off-world manufacturing.",
    planet: "Venus", region: "inner", difficulty: "pilot", order: 7,
    color: "#ccaa44", secondaryColor: "#ffaa33",
    missions: [
      { id: "ven-03", title: "Extraction Optimization", description: "Fine-tune the sulfur extraction process for maximum yield.", type: "puzzle", xpReward: 35, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "space", atmosphere: "toxic", gravity: "standard", temperature: "hot", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["venus-cloud-city"],
  },
  {
    id: "venus-float-lab", name: "Floating Research Lab", subtitle: "Science Among the Clouds",
    description: "A mobile research platform drifting with Venus's jet streams. Collects data across thousands of kilometers.",
    planet: "Venus", region: "inner", difficulty: "scientist", order: 8,
    color: "#99ccdd", secondaryColor: "#4488ff",
    missions: [
      { id: "ven-04", title: "Jet Stream Navigation", description: "Plot a course through Venus's upper atmosphere jet streams.", type: "simulation", xpReward: 45, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "space", atmosphere: "dense", gravity: "standard", temperature: "hot", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["venus-cloud-city"],
  },
  {
    id: "venus-surface-probe", name: "Surface Probe Station", subtitle: "Hell's Surface",
    description: "Ruggedized probe station studying Venus's surface. Withstands 470°C and 90 atmospheres of pressure.",
    planet: "Venus", region: "inner", difficulty: "explorer", order: 9,
    color: "#aa6633", secondaryColor: "#ff4422",
    missions: [
      { id: "ven-05", title: "Surface Sample Retrieval", description: "Remote-operate a surface probe to collect geological samples.", type: "exploration", xpReward: 50, duration: "15 min", prerequisites: ["ven-02"] },
    ], environment: { terrain: "rocky", atmosphere: "corrosive", gravity: "standard", temperature: "extreme-hot", hasStructures: false, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["venus-cloud-city"],
  },
  {
    id: "venus-atmo-mine", name: "Atmospheric Mining Rig", subtitle: "Harvesting the Sky",
    description: "Giant scoop-miner extracting carbon dioxide and converting it to oxygen and rocket fuel.",
    planet: "Venus", region: "inner", difficulty: "commander", order: 10,
    color: "#ddaa55", secondaryColor: "#ffcc33",
    missions: [
      { id: "ven-06", title: "Mining Operation Command", description: "Direct the atmospheric mining fleet for maximum fuel production.", type: "simulation", xpReward: 60, duration: "20 min", prerequisites: ["ven-03"] },
      { id: "ven-07", title: "Cloud City Expansion", description: "Design and deploy a new aerostat platform module for the Cloud City.", type: "construction", xpReward: 40, duration: "10 min", prerequisites: ["ven-01", "ven-04"] },
    ], environment: { terrain: "space", atmosphere: "dense", gravity: "standard", temperature: "hot", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["venus-surface-probe"],
  },

/* ═══════════════════════════════════════════
   EARTH — 8 worlds (hub + moon + orbital)
   ═══════════════════════════════════════════ */
  {
    id: "earth-hq", name: "DREV Global HQ", subtitle: "Command Center Earth",
    description: "The primary DREV operations center. From here, all STEM Academy missions are coordinated across the solar system.",
    planet: "Earth", region: "inner", difficulty: "cadet", order: 11,
    color: "#4488cc", secondaryColor: "#00d4ff",
    missions: [
      { id: "ear-01", title: "Command Center Orientation", description: "Learn the DREV command interface and mission briefing protocols.", type: "simulation", xpReward: 20, duration: "5 min", prerequisites: [] },
      { id: "ear-02", title: "Communications Relay", description: "Establish a stable comm link with off-world DREV outposts.", type: "construction", xpReward: 25, duration: "10 min", prerequisites: ["ear-01"] },
    ], environment: { terrain: "urban", atmosphere: "dense", gravity: "standard", temperature: "temperate", hasStructures: true, hasVehicles: true, hasVegetation: true },
    connectedWorlds: ["earth-orbital", "earth-lunar"],
  },
  {
    id: "earth-orbital", name: "Orbital Space Station", subtitle: "Gateway to the Stars",
    description: "The DREV Orbital Station serves as a resupply and transfer hub for all deep space missions.",
    planet: "Earth", region: "inner", difficulty: "pilot", order: 12,
    color: "#aabbcc", secondaryColor: "#00d4ff",
    missions: [
      { id: "ear-03", title: "Docking Maneuver", description: "Pilot a supply vessel to dock with the orbital station.", type: "simulation", xpReward: 35, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "space", atmosphere: "none", gravity: "micro", temperature: "cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["earth-hq", "earth-lunar"],
  },
  {
    id: "earth-lunar", name: "Lunar Base Alpha", subtitle: "Earth's Natural Satellite",
    description: "Permanent lunar settlement on the Sea of Tranquility. Mining helium-3 and operating deep space telescopes.",
    planet: "Earth", region: "inner", difficulty: "pilot", order: 13,
    color: "#ccbbaa", secondaryColor: "#8888ff",
    missions: [
      { id: "ear-04", title: "Helium-3 Mining", description: "Supervise the lunar helium-3 extraction process for fusion fuel.", type: "construction", xpReward: 35, duration: "10 min", prerequisites: [] },
      { id: "ear-05", title: "Lunar Rover Expedition", description: "Navigate the far side in search of ancient impact evidence.", type: "exploration", xpReward: 40, duration: "15 min", prerequisites: ["ear-04"] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["earth-orbital"],
  },
  {
    id: "earth-deep-sea", name: "Deep Sea Research", subtitle: "The Abyss",
    description: "Underwater research facility in the Mariana Trench. Study extremophiles and test pressure-resistant technology.",
    planet: "Earth", region: "inner", difficulty: "scientist", order: 14,
    color: "#224466", secondaryColor: "#44aaff",
    missions: [
      { id: "ear-06", title: "Abyssal Sample Collection", description: "Remote-operate a submersible to collect samples from the trench floor.", type: "exploration", xpReward: 45, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "oceanic", atmosphere: "dense", gravity: "standard", temperature: "cold", hasStructures: true, hasVehicles: true, hasVegetation: true },
    connectedWorlds: ["earth-hq"],
  },
  {
    id: "earth-arctic", name: "Arctic Research Station", subtitle: "Frozen Frontier",
    description: "Polar research station studying climate patterns, ice core samples, and testing cold-weather space technology.",
    planet: "Earth", region: "inner", difficulty: "scientist", order: 15,
    color: "#ddeeff", secondaryColor: "#88ccff",
    missions: [
      { id: "ear-07", title: "Ice Core Analysis", description: "Extract and analyze ice core samples for historical climate data.", type: "research", xpReward: 40, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "icy", atmosphere: "dense", gravity: "standard", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["earth-hq"],
  },
  {
    id: "earth-stem-alpha", name: "STEM Lab Alpha", subtitle: "Where Innovation Begins",
    description: "The flagship STEM laboratory where students prototype robots, drones, and space systems before deployment.",
    planet: "Earth", region: "inner", difficulty: "cadet", order: 16,
    color: "#44aa88", secondaryColor: "#66ffbb",
    missions: [
      { id: "ear-08", title: "Drone Assembly", description: "Build and test a quadcopter drone for planetary exploration.", type: "construction", xpReward: 30, duration: "10 min", prerequisites: [] },
      { id: "ear-09", title: "Robot Programming", description: "Program a rover to navigate an obstacle course autonomously.", type: "puzzle", xpReward: 35, duration: "15 min", prerequisites: ["ear-08"] },
    ], environment: { terrain: "urban", atmosphere: "dense", gravity: "standard", temperature: "temperate", hasStructures: true, hasVehicles: true, hasVegetation: true },
    connectedWorlds: ["earth-hq"],
  },
  {
    id: "earth-ai-research", name: "AI Research Center", subtitle: "Intelligence Amplified",
    description: "Cutting-edge artificial intelligence research facility. Develop neural networks for autonomous space exploration.",
    planet: "Earth", region: "inner", difficulty: "commander", order: 17,
    color: "#6644aa", secondaryColor: "#9966ff",
    missions: [
      { id: "ear-10", title: "Neural Network Training", description: "Train an AI model to identify geological features on Mars.", type: "research", xpReward: 50, duration: "15 min", prerequisites: ["ear-09"] },
    ], environment: { terrain: "urban", atmosphere: "dense", gravity: "standard", temperature: "temperate", hasStructures: true, hasVehicles: false, hasVegetation: true },
    connectedWorlds: ["earth-hq", "earth-stem-alpha"],
  },
  {
    id: "earth-launch-complex", name: "Launch Complex 1", subtitle: "To the Stars",
    description: "Primary launch facility for all STEM Academy missions. Watch rockets lift off for destinations across the solar system.",
    planet: "Earth", region: "inner", difficulty: "commander", order: 18,
    color: "#778899", secondaryColor: "#ff6644",
    missions: [
      { id: "ear-11", title: "Launch Sequence Protocol", description: "Execute a full launch sequence for a deep space cargo mission.", type: "simulation", xpReward: 55, duration: "20 min", prerequisites: ["ear-03"] },
    ], environment: { terrain: "desert", atmosphere: "dense", gravity: "standard", temperature: "hot", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["earth-orbital"],
  },

/* ═══════════════════════════════════════════
   MARS — 8 worlds
   ═══════════════════════════════════════════ */
  {
    id: "mars-colony-central", name: "Mars Colony Central", subtitle: "First City on Mars",
    description: "The primary Martian settlement. Habitat domes, research labs, and the command center for all Mars operations.",
    planet: "Mars", region: "inner", difficulty: "pilot", order: 19,
    color: "#c1442e", secondaryColor: "#ff8844",
    missions: [
      { id: "mar-01", title: "Habitat Life Support", description: "Monitor and maintain the colony's oxygen and water recycling systems.", type: "construction", xpReward: 30, duration: "10 min", prerequisites: [] },
      { id: "mar-02", title: "Rover Patrol", description: "Dispatch rover patrols to survey the perimeter of the colony.", type: "exploration", xpReward: 30, duration: "10 min", prerequisites: ["mar-01"] },
    ], environment: { terrain: "desert", atmosphere: "thin", gravity: "low", temperature: "cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["mars-olympus", "mars-valles", "mars-phobos"],
  },
  {
    id: "mars-olympus", name: "Olympus Mons Base", subtitle: "Tallest Mountain",
    description: "Research station at the summit of Olympus Mons — the largest volcano in the solar system. Study Martian geology and test high-altitude operations.",
    planet: "Mars", region: "inner", difficulty: "explorer", order: 20,
    color: "#a06848", secondaryColor: "#ff6644",
    missions: [
      { id: "mar-03", title: "Altitude Expedition", description: "Lead a traverse from the base to the caldera rim of Olympus Mons.", type: "exploration", xpReward: 45, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "thin", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["mars-colony-central"],
  },
  {
    id: "mars-valles", name: "Valles Marineris Research", subtitle: "Grand Canyon of Mars",
    description: "Study the massive Valles Marineris canyon system. Investigate geological layers exposed over 4,000 km of canyons.",
    planet: "Mars", region: "inner", difficulty: "scientist", order: 21,
    color: "#b07848", secondaryColor: "#ffaa44",
    missions: [
      { id: "mar-04", title: "Canyon Geology Survey", description: "Analyze rock formations in the Valles Marineris canyon walls.", type: "research", xpReward: 45, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "thin", gravity: "low", temperature: "cold", hasStructures: false, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["mars-colony-central"],
  },
  {
    id: "mars-north-pole", name: "North Pole Ice Mine", subtitle: "Water Ice Extraction",
    description: "Subsurface ice mining operation at the Martian north pole. Critical water supply for the entire colony network.",
    planet: "Mars", region: "inner", difficulty: "pilot", order: 22,
    color: "#ccddff", secondaryColor: "#88ccff",
    missions: [
      { id: "mar-05", title: "Ice Drilling Operation", description: "Operate the thermal drill to access deep subsurface water ice.", type: "construction", xpReward: 35, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "icy", atmosphere: "thin", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["mars-colony-central"],
  },
  {
    id: "mars-phobos", name: "Phobos Station", subtitle: "Martian Moon Outpost",
    description: "Strategic outpost on Phobos. Serves as a staging point for asteroid belt missions and deep space launches.",
    planet: "Mars", region: "inner", difficulty: "pilot", order: 23,
    color: "#887766", secondaryColor: "#aaaaaa",
    missions: [
      { id: "mar-06", title: "Low-Gravity Operations", description: "Conduct cargo transfer operations in Phobos's microgravity.", type: "simulation", xpReward: 40, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "micro", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["mars-colony-central"],
  },
  {
    id: "mars-terraform-lab", name: "Terraforming Lab", subtitle: "Making Mars Green",
    description: "Experimental greenhouse facility testing genetically engineered plants that could survive on the Martian surface.",
    planet: "Mars", region: "inner", difficulty: "scientist", order: 24,
    color: "#66aa44", secondaryColor: "#88ff44",
    missions: [
      { id: "mar-07", title: "Greenhouse Atmosphere Control", description: "Optimize atmospheric conditions for experimental Martian crops.", type: "research", xpReward: 45, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "desert", atmosphere: "thin", gravity: "low", temperature: "cold", hasStructures: true, hasVehicles: false, hasVegetation: true },
    connectedWorlds: ["mars-colony-central"],
  },
  {
    id: "mars-rover-factory", name: "Rover Factory", subtitle: "Building Explorers",
    description: "Automated assembly line producing the next generation of Mars exploration rovers.",
    planet: "Mars", region: "inner", difficulty: "commander", order: 25,
    color: "#557788", secondaryColor: "#00aa88",
    missions: [
      { id: "mar-08", title: "Assembly Line Optimization", description: "Optimize the rover production line for maximum efficiency.", type: "puzzle", xpReward: 50, duration: "15 min", prerequisites: ["mar-01"] },
    ], environment: { terrain: "desert", atmosphere: "thin", gravity: "low", temperature: "cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["mars-colony-central"],
  },
  {
    id: "mars-launch-complex", name: "Mars Launch Complex", subtitle: "Gateway to the Belt",
    description: "Mars's primary launch facility. Lower gravity makes it the ideal departure point for asteroid belt and outer system missions.",
    planet: "Mars", region: "inner", difficulty: "commander", order: 26,
    color: "#887766", secondaryColor: "#ff6633",
    missions: [
      { id: "mar-09", title: "Interplanetary Launch Window", description: "Calculate and execute a transfer orbit to the asteroid belt.", type: "simulation", xpReward: 55, duration: "20 min", prerequisites: ["mar-06"] },
      { id: "mar-10", title: "Mars City Power Grid", description: "Restore and optimize the primary fusion power grid for Olympus City.", type: "construction", xpReward: 40, duration: "10 min", prerequisites: ["mar-02", "mar-05"] },
    ], environment: { terrain: "desert", atmosphere: "thin", gravity: "low", temperature: "cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["mars-phobos"],
  },

/* ═══════════════════════════════════════════
   ASTEROID BELT — 6 worlds
   ═══════════════════════════════════════════ */
  {
    id: "asteroid-ceres", name: "Ceres Mining Station", subtitle: "Dwarf Planet Operations",
    description: "The largest facility in the asteroid belt. Ceres provides water, minerals, and a strategic hub for deep space missions.",
    planet: "Ceres", region: "asteroid", difficulty: "pilot", order: 27,
    color: "#887766", secondaryColor: "#88aacc",
    missions: [
      { id: "ast-01", title: "Mining Operations Command", description: "Direct robotic mining operations on the Ceres surface.", type: "construction", xpReward: 35, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["asteroid-vesta"],
  },
  {
    id: "asteroid-vesta", name: "Vesta Outpost", subtitle: "Second Largest Asteroid",
    description: "Research outpost on Vesta studying the asteroid's unique geological composition and impact crater history.",
    planet: "Vesta", region: "asteroid", difficulty: "scientist", order: 28,
    color: "#997755", secondaryColor: "#cc8844",
    missions: [
      { id: "ast-02", title: "Crater Analysis", description: "Survey the Rheasilvia impact crater and analyze exposed mantle material.", type: "research", xpReward: 40, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "cold", hasStructures: false, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["asteroid-ceres"],
  },
  {
    id: "asteroid-prospector", name: "Asteroid Prospector", subtitle: "Resource Hunter",
    description: "Mobile prospecting vessel hunting for rare metals in the asteroid belt. Deploy autonomous drones to survey candidate asteroids.",
    planet: "Belt", region: "asteroid", difficulty: "explorer", order: 29,
    color: "#888899", secondaryColor: "#ffcc00",
    missions: [
      { id: "ast-03", title: "Resource Survey", description: "Pilot a survey drone through dense asteroid fields to identify valuable targets.", type: "exploration", xpReward: 45, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "space", atmosphere: "none", gravity: "micro", temperature: "extreme-cold", hasStructures: false, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["asteroid-vesta"],
  },
  {
    id: "asteroid-navigation", name: "Belt Navigation Hub", subtitle: "Charting the Rocks",
    description: "Navigation center plotting safe courses through the densely packed asteroid belt. Prevent collisions and find optimal routes.",
    planet: "Belt", region: "asteroid", difficulty: "pilot", order: 30,
    color: "#667788", secondaryColor: "#44aaff",
    missions: [
      { id: "ast-04", title: "Hazard Map Generation", description: "Process telescope data to generate an up-to-date hazard map of the belt.", type: "research", xpReward: 35, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "space", atmosphere: "none", gravity: "micro", temperature: "cold", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["asteroid-ceres"],
  },
  {
    id: "asteroid-radar", name: "Deep Space Radar", subtitle: "Eyes on the Belt",
    description: "Long-range radar installation tracking asteroid trajectories and detecting new objects entering the inner system.",
    planet: "Belt", region: "asteroid", difficulty: "scientist", order: 31,
    color: "#445566", secondaryColor: "#00ddff",
    missions: [
      { id: "ast-05", title: "NEO Detection", description: "Identify and track near-Earth objects using deep space radar data.", type: "research", xpReward: 40, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "space", atmosphere: "none", gravity: "low", temperature: "cold", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["asteroid-navigation"],
  },
  {
    id: "asteroid-psyche", name: "Psyche Mining Colony", subtitle: "Metal World",
    description: "Mining colony on 16 Psyche — a metallic asteroid worth billions. Extract rare platinum group metals.",
    planet: "Psyche", region: "asteroid", difficulty: "commander", order: 32,
    color: "#8899aa", secondaryColor: "#ddaa00",
    missions: [
      { id: "ast-06", title: "Platinum Extraction", description: "Manage the precious metals extraction and refining operation on Psyche.", type: "construction", xpReward: 55, duration: "20 min", prerequisites: ["ast-01", "ast-03"] },
      { id: "ast-07", title: "Asteroid Redirect Mission", description: "Plot a course to redirect a near-Earth asteroid into a stable mining orbit.", type: "simulation", xpReward: 60, duration: "20 min", prerequisites: ["ast-05", "ast-06"] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["asteroid-prospector"],
  },

/* ═══════════════════════════════════════════
   JUPITER — 8 worlds
   ═══════════════════════════════════════════ */
  {
    id: "jupiter-red-spot", name: "Great Red Spot Observatory", subtitle: "Eye of the Storm",
    description: "Floating observatory studying Jupiter's iconic storm. Deploy probes into the Great Red Spot to measure wind speeds and composition.",
    planet: "Jupiter", region: "jovian", difficulty: "explorer", order: 33,
    color: "#d4a06a", secondaryColor: "#ff6644",
    missions: [
      { id: "jup-01", title: "Storm Probe Deployment", description: "Deploy atmospheric probes into the Great Red Spot.", type: "exploration", xpReward: 45, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "gaseous", atmosphere: "dense", gravity: "high", temperature: "cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["jupiter-io", "jupiter-europa"],
  },
  {
    id: "jupiter-io", name: "Io Volcanic Lab", subtitle: "Fire and Sulfur",
    description: "Research station on the most volcanically active body in the solar system. Study Io's constant eruptions and tidal heating.",
    planet: "Io", region: "jovian", difficulty: "scientist", order: 34,
    color: "#cc6633", secondaryColor: "#ff8844",
    missions: [
      { id: "jup-02", title: "Volcanic Monitoring", description: "Install seismometers around an active Io volcano to predict eruptions.", type: "research", xpReward: 50, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "volcanic", atmosphere: "thin", gravity: "low", temperature: "hot", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["jupiter-red-spot"],
  },
  {
    id: "jupiter-europa", name: "Europa Ice Base", subtitle: "Ocean World",
    description: "Subsurface base drilling through Europa's icy crust to reach a liquid water ocean. Search for microbial life.",
    planet: "Europa", region: "jovian", difficulty: "commander", order: 35,
    color: "#88aacc", secondaryColor: "#44aaff",
    missions: [
      { id: "jup-03", title: "Ice Penetration", description: "Command the thermal drill through Europa's 15km ice crust.", type: "construction", xpReward: 60, duration: "20 min", prerequisites: ["jup-02"] },
      { id: "jup-04", title: "Ocean Explorer", description: "Deploy a submersible probe to explore Europa's subsurface ocean.", type: "exploration", xpReward: 65, duration: "20 min", prerequisites: ["jup-03"] },
    ], environment: { terrain: "icy", atmosphere: "thin", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["jupiter-io"],
  },
  {
    id: "jupiter-ganymede", name: "Ganymede Research Station", subtitle: "Largest Moon",
    description: "Full research complex on Ganymede — the largest moon in the solar system. Study its magnetic field and internal ocean.",
    planet: "Ganymede", region: "jovian", difficulty: "scientist", order: 36,
    color: "#99bbaa", secondaryColor: "#88ddaa",
    missions: [
      { id: "jup-05", title: "Magnetosphere Study", description: "Deploy sensors to map Ganymede's unique magnetic field.", type: "research", xpReward: 45, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["jupiter-europa", "jupiter-callisto"],
  },
  {
    id: "jupiter-callisto", name: "Callisto Outpost", subtitle: "Ancient Surface",
    description: "Remote outpost on Callisto — the most cratered object in the solar system. Accessible base for outer system logistics.",
    planet: "Callisto", region: "jovian", difficulty: "pilot", order: 37,
    color: "#776655", secondaryColor: "#88aa88",
    missions: [
      { id: "jup-06", title: "Supply Depot Management", description: "Manage the Callisto supply depot serving deep space missions.", type: "construction", xpReward: 35, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["jupiter-ganymede"],
  },
  {
    id: "jupiter-ring", name: "Jupiter Ring Station", subtitle: "Halo of Dust",
    description: "Orbital platform within Jupiter's faint ring system. Study ring dynamics and deploy micro-satellites.",
    planet: "Jupiter", region: "jovian", difficulty: "explorer", order: 38,
    color: "#886644", secondaryColor: "#ffcc44",
    missions: [
      { id: "jup-07", title: "Ring Particle Analysis", description: "Collect and analyze dust particles from Jupiter's ring system.", type: "research", xpReward: 40, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "space", atmosphere: "none", gravity: "micro", temperature: "cold", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["jupiter-red-spot"],
  },
  {
    id: "jupiter-atmo-array", name: "Atmospheric Probe Array", subtitle: "Into the Giant",
    description: "Network of floating probe stations descending through Jupiter's atmosphere. Collect data at every pressure level.",
    planet: "Jupiter", region: "jovian", difficulty: "scientist", order: 39,
    color: "#cc8844", secondaryColor: "#ffaa33",
    missions: [
      { id: "jup-08", title: "Multi-Level Sampling", description: "Coordinate simultaneous atmospheric sampling across all probe stations.", type: "research", xpReward: 50, duration: "15 min", prerequisites: ["jup-01"] },
    ], environment: { terrain: "gaseous", atmosphere: "dense", gravity: "high", temperature: "cold", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["jupiter-ring"],
  },
  {
    id: "jupiter-magnetosphere", name: "Magnetic Field Research", subtitle: "Giant's Shield",
    description: "Research platform studying Jupiter's immense magnetosphere — the largest structure in the solar system.",
    planet: "Jupiter", region: "jovian", difficulty: "commander", order: 40,
    color: "#4455aa", secondaryColor: "#6666ff",
    missions: [
      { id: "jup-09", title: "Field Mapping Expedition", description: "Navigate through radiation belts to map the full extent of the magnetosphere.", type: "exploration", xpReward: 60, duration: "20 min", prerequisites: ["jup-05"] },
      { id: "jup-10", title: "Europa Subsurface Survey", description: "Deploy ground-penetrating radar to map Europa's subsurface ocean through the ice crust.", type: "research", xpReward: 50, duration: "15 min", prerequisites: ["jup-06", "jup-08"] },
    ], environment: { terrain: "space", atmosphere: "none", gravity: "micro", temperature: "cold", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["jupiter-ganymede"],
  },

/* ═══════════════════════════════════════════
   SATURN — 6 worlds
   ═══════════════════════════════════════════ */
  {
    id: "saturn-ring-hub", name: "Ring Mining Hub", subtitle: "Harvesting the Rings",
    description: "Primary mining facility in Saturn's rings. Extract water ice and organic compounds from ring particles.",
    planet: "Saturn", region: "saturnian", difficulty: "pilot", order: 41,
    color: "#e8d5a0", secondaryColor: "#d4c090",
    missions: [
      { id: "sat-01", title: "Ice Harvester Operations", description: "Direct the ring ice harvesting fleet for maximum collection.", type: "construction", xpReward: 35, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "icy", atmosphere: "none", gravity: "micro", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["saturn-titan", "saturn-enceladus"],
  },
  {
    id: "saturn-titan", name: "Titan Methane Lab", subtitle: "Lakes of Hydrocarbon",
    description: "Research station on Titan — Saturn's largest moon. Explore liquid methane lakes and study prebiotic chemistry.",
    planet: "Titan", region: "saturnian", difficulty: "explorer", order: 42,
    color: "#cc8833", secondaryColor: "#ffaa44",
    missions: [
      { id: "sat-02", title: "Methane Lake Survey", description: "Navigate a submersible through Titan's methane lakes to map their composition.", type: "exploration", xpReward: 50, duration: "15 min", prerequisites: [] },
      { id: "sat-03", title: "Atmospheric Sampling", description: "Collect samples from Titan's thick nitrogen-methane atmosphere.", type: "research", xpReward: 45, duration: "15 min", prerequisites: ["sat-02"] },
    ], environment: { terrain: "rocky", atmosphere: "dense", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["saturn-ring-hub"],
  },
  {
    id: "saturn-enceladus", name: "Enceladus Geyser Base", subtitle: "Frozen Geysers",
    description: "Base studying Enceladus's cryovolcanoes — geysers that shoot water ice into space from a subsurface ocean.",
    planet: "Enceladus", region: "saturnian", difficulty: "scientist", order: 43,
    color: "#ddeeff", secondaryColor: "#88ccff",
    missions: [
      { id: "sat-04", title: "Geyser Sample Fly-Through", description: "Pilot a probe through an Enceladus geyser plume to collect samples.", type: "exploration", xpReward: 55, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "icy", atmosphere: "none", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["saturn-ring-hub"],
  },
  {
    id: "saturn-mimas", name: "Mimas Research Post", subtitle: "Death Star Moon",
    description: "Research station on Mimas. Investigate the massive Herschel impact crater that makes it resemble a Death Star.",
    planet: "Mimas", region: "saturnian", difficulty: "scientist", order: 44,
    color: "#8899aa", secondaryColor: "#aabbcc",
    missions: [
      { id: "sat-05", title: "Impact Crater Analysis", description: "Study the Herschel Crater's internal structure using ground-penetrating radar.", type: "research", xpReward: 40, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "extreme-cold", hasStructures: false, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["saturn-titan"],
  },
  {
    id: "saturn-dione", name: "Dione Observation Deck", subtitle: "Icy World",
    description: "Observation platform on Dione studying Saturn from a unique perspective. Ideal location for ring observation.",
    planet: "Dione", region: "saturnian", difficulty: "cadet", order: 45,
    color: "#ccddee", secondaryColor: "#8899bb",
    missions: [
      { id: "sat-06", title: "Ring Eclipse Observation", description: "Record a Saturn ring transit across the planet as seen from Dione.", type: "research", xpReward: 25, duration: "5 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["saturn-enceladus"],
  },
  {
    id: "saturn-rhea", name: "Rhea Cryo Facility", subtitle: "Ice Storage",
    description: "Cryogenic storage facility on Rhea. Preserves biological samples and supplies at near-zero temperatures.",
    planet: "Rhea", region: "saturnian", difficulty: "pilot", order: 46,
    color: "#bbccdd", secondaryColor: "#99aabb",
    missions: [
      { id: "sat-07", title: "Cryo Sample Transport", description: "Coordinate the transport of cryogenic samples between Saturnian moons.", type: "simulation", xpReward: 35, duration: "10 min", prerequisites: [] },
      { id: "sat-08", title: "Ring Particle Analysis", description: "Collect and analyze ice particles from Saturn's B-ring for organic compounds.", type: "research", xpReward: 45, duration: "15 min", prerequisites: ["sat-01", "sat-02"] },
      { id: "sat-09", title: "Titan Airship Navigation", description: "Pilot a helium airship through Titan's thick atmosphere to map the equatorial desert.", type: "exploration", xpReward: 55, duration: "15 min", prerequisites: ["sat-03"] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["saturn-mimas"],
  },

/* ═══════════════════════════════════════════
   URANUS — 4 worlds
   ═══════════════════════════════════════════ */
  {
    id: "uranus-ring-station", name: "Ring Station Alpha", subtitle: "Sideways Orbit",
    description: "Research station orbiting Uranus's unique vertical ring system. Study the planet's extreme axial tilt of 98 degrees.",
    planet: "Uranus", region: "outer", difficulty: "pilot", order: 47,
    color: "#7ec8e3", secondaryColor: "#88ccee",
    missions: [
      { id: "ura-01", title: "Tilted Orbit Navigation", description: "Navigate the complex orbital mechanics around Uranus's sideways rotation.", type: "simulation", xpReward: 40, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "space", atmosphere: "none", gravity: "micro", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["uranus-miranda", "uranus-ariel"],
  },
  {
    id: "uranus-miranda", name: "Miranda Research Lab", subtitle: "Frankenstein Moon",
    description: "Research facility on Miranda — Uranus's most mysterious moon with its bizarre patchwork terrain suggesting multiple impacts.",
    planet: "Miranda", region: "outer", difficulty: "scientist", order: 48,
    color: "#99aabb", secondaryColor: "#aabbcc",
    missions: [
      { id: "ura-02", title: "Corona Formation Study", description: "Investigate the unique 'corona' formations on Miranda's surface.", type: "research", xpReward: 45, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["uranus-ring-station"],
  },
  {
    id: "uranus-ariel", name: "Ariel Ice Base", subtitle: "Brightest Moon",
    description: "Base on Ariel, the brightest of Uranus's moons. Study its extensive canyon systems and potential cryovolcanism.",
    planet: "Ariel", region: "outer", difficulty: "explorer", order: 49,
    color: "#ccddee", secondaryColor: "#aaccdd",
    missions: [
      { id: "ura-03", title: "Canyon Expedition", description: "Explore Ariel's massive canyon systems using a climbing rover.", type: "exploration", xpReward: 50, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "extreme-cold", hasStructures: false, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["uranus-miranda"],
  },
  {
    id: "uranus-oberon", name: "Oberon Observatory", subtitle: "Dark Moon Station",
    description: "Remote observatory on Uranus's outermost large moon. Ideal location for deep space astronomy.",
    planet: "Oberon", region: "outer", difficulty: "commander", order: 50,
    color: "#667788", secondaryColor: "#8899bb",
    missions: [
      { id: "ura-04", title: "Deep Space Telescope Calibration", description: "Calibrate the deep space telescope array for Kuiper Belt surveys.", type: "construction", xpReward: 55, duration: "20 min", prerequisites: ["ura-01"] },
      { id: "ura-05", title: "Ring Plane Crossing", description: "Navigate the Uranus ring plane crossing to study ring particle composition.", type: "exploration", xpReward: 50, duration: "15 min", prerequisites: ["ura-01"] },
      { id: "ura-06", title: "Axial Magnetic Field Study", description: "Map Uranus's lopsided magnetic field from orbit around the tilted planet.", type: "research", xpReward: 45, duration: "15 min", prerequisites: ["ura-02"] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["uranus-ariel"],
  },

/* ═══════════════════════════════════════════
   NEPTUNE — 4 worlds
   ═══════════════════════════════════════════ */
  {
    id: "neptune-triton", name: "Triton Geyser Station", subtitle: "Icy Volcanoes",
    description: "Research station on Triton — Neptune's largest moon. Study its nitrogen geysers and retrograde orbit.",
    planet: "Triton", region: "outer", difficulty: "explorer", order: 51,
    color: "#4466aa", secondaryColor: "#88aaff",
    missions: [
      { id: "nep-01", title: "Geyser Plume Collection", description: "Position collectors in Triton's nitrogen geyser plumes.", type: "exploration", xpReward: 50, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "icy", atmosphere: "thin", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["neptune-storm-watch"],
  },
  {
    id: "neptune-nereid", name: "Nereid Outpost", subtitle: "Erratic Orbit",
    description: "Remote outpost on Nereid, observing Neptune's dynamic atmosphere and tracking its massive storm systems.",
    planet: "Nereid", region: "outer", difficulty: "scientist", order: 52,
    color: "#5577aa", secondaryColor: "#6699cc",
    missions: [
      { id: "nep-02", title: "Storm Tracking System", description: "Deploy and calibrate the Neptune storm tracking array.", type: "research", xpReward: 45, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["neptune-triton"],
  },
  {
    id: "neptune-storm-watch", name: "Storm Watch Platform", subtitle: "Fastest Winds",
    description: "Orbital platform monitoring Neptune's supersonic winds — the fastest in the solar system at 2,000 km/h.",
    planet: "Neptune", region: "outer", difficulty: "pilot", order: 53,
    color: "#3355aa", secondaryColor: "#4466cc",
    missions: [
      { id: "nep-03", title: "Wind Speed Measurement", description: "Deploy atmospheric drifters to measure Neptune's supersonic jet streams.", type: "research", xpReward: 35, duration: "10 min", prerequisites: [] },
    ], environment: { terrain: "gaseous", atmosphere: "dense", gravity: "high", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["neptune-triton", "neptune-kuiper"],
  },
  {
    id: "neptune-kuiper", name: "Kuiper Belt Launch", subtitle: "Edge of the System",
    description: "Launch facility at Neptune's orbit serving as the final outpost before Kuiper Belt and interstellar missions.",
    planet: "Neptune", region: "outer", difficulty: "commander", order: 54,
    color: "#334488", secondaryColor: "#5577cc",
    missions: [
      { id: "nep-04", title: "Interstellar Trajectory", description: "Calculate and execute an interstellar trajectory using Neptune's gravity assist.", type: "simulation", xpReward: 60, duration: "20 min", prerequisites: ["nep-02"] },
      { id: "nep-05", title: "Great Dark Spot Observation", description: "Track and analyze Neptune's Great Dark Spot storm system as it evolves.", type: "research", xpReward: 40, duration: "10 min", prerequisites: ["nep-03"] },
      { id: "nep-06", title: "Triton Orbit Insertion", description: "Navigate the complex orbital insertion around Triton's retrograde orbit.", type: "simulation", xpReward: 55, duration: "15 min", prerequisites: ["nep-01", "nep-04"] },
    ], environment: { terrain: "space", atmosphere: "none", gravity: "micro", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["neptune-storm-watch"],
  },

/* ═══════════════════════════════════════════
   DEEP SPACE — 4 worlds
   ═══════════════════════════════════════════ */
  {
    id: "deep-pluto", name: "Pluto Research Base", subtitle: "Dwarf Planet Frontier",
    description: "Humanity's furthest permanent outpost. Study Pluto's heart-shaped glacier, mountains, and tenuous atmosphere.",
    planet: "Pluto", region: "deep", difficulty: "explorer", order: 55,
    color: "#887766", secondaryColor: "#88aacc",
    missions: [
      { id: "deep-01", title: "Sputnik Planitia Survey", description: "Explore Pluto's nitrogen ice glacier and measure its flow dynamics.", type: "exploration", xpReward: 55, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "thin", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["deep-charon"],
  },
  {
    id: "deep-charon", name: "Charon Observatory", subtitle: "Binary World",
    description: "Observatory on Charon studying the Pluto-Charon binary system. Unique vantage point for deep space observation.",
    planet: "Charon", region: "deep", difficulty: "scientist", order: 56,
    color: "#667788", secondaryColor: "#99aabb",
    missions: [
      { id: "deep-02", title: "Binary Orbit Mechanics", description: "Study the unique tidal locking of the Pluto-Charon binary system.", type: "research", xpReward: 45, duration: "15 min", prerequisites: [] },
    ], environment: { terrain: "rocky", atmosphere: "none", gravity: "low", temperature: "extreme-cold", hasStructures: true, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["deep-pluto"],
  },
  {
    id: "deep-oort", name: "Oort Cloud Station", subtitle: "Edge of the Sun's Reach",
    description: "The most distant outpost. Study comets originating from the Oort Cloud and prepare for true interstellar travel.",
    planet: "Oort Cloud", region: "deep", difficulty: "commander", order: 57,
    color: "#334455", secondaryColor: "#557788",
    missions: [
      { id: "deep-03", title: "Comet Capture Mission", description: "Intercept and study a long-period comet from the Oort Cloud.", type: "exploration", xpReward: 70, duration: "25 min", prerequisites: ["deep-01", "deep-02"] },
    ], environment: { terrain: "space", atmosphere: "none", gravity: "micro", temperature: "extreme-cold", hasStructures: true, hasVehicles: true, hasVegetation: false },
    connectedWorlds: ["deep-pluto"],
  },
  {
    id: "deep-interstellar", name: "Interstellar Probe", subtitle: "Beyond the Sun",
    description: "The first human mission to true interstellar space. Carries humanity's message to the stars.",
    planet: "Deep Space", region: "deep", difficulty: "commander", order: 58,
    color: "#223344", secondaryColor: "#00d4ff",
    missions: [
      { id: "deep-04", title: "Interstellar Data Relay", description: "Establish the first data link from beyond the heliopause.", type: "simulation", xpReward: 80, duration: "30 min", prerequisites: ["deep-03"] },
      { id: "deep-05", title: "Stellar Navigation", description: "Navigate using background stars as the probe exits the solar system.", type: "puzzle", xpReward: 85, duration: "30 min", prerequisites: ["deep-04"] },
      { id: "deep-06", title: "Heliopause Crossing Protocol", description: "Coordinate the instruments and data collection as the probe crosses the heliopause into interstellar space.", type: "research", xpReward: 75, duration: "25 min", prerequisites: ["deep-04"] },
      { id: "deep-07", title: "Kuiper Belt Object Flyby", description: "Calculate and execute a flyby of a Kuiper Belt Object to study primordial solar system material.", type: "exploration", xpReward: 70, duration: "20 min", prerequisites: ["deep-01", "deep-03"] },
    ], environment: { terrain: "space", atmosphere: "none", gravity: "micro", temperature: "extreme-cold", hasStructures: false, hasVehicles: false, hasVegetation: false },
    connectedWorlds: ["deep-oort"],
  },
];

export function getWorldById(id: string): World | undefined {
  return WORLDS.find((w) => w.id === id);
}

export function getWorldsByPlanet(planet: string): World[] {
  return WORLDS.filter((w) => w.planet === planet);
}

export function getWorldsByRegion(region: string): World[] {
  return WORLDS.filter((w) => w.region === region);
}

export function getConnectedWorlds(worldId: string): World[] {
  const world = getWorldById(worldId);
  if (!world) return [];
  return world.connectedWorlds.map((id) => getWorldById(id)).filter(Boolean) as World[];
}
