import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import type { SatelliteBus, SatelliteEntry } from "./satellite-catalog";

/* ─── Material theme matching drev.space aesthetics ─── */
const SAT_BODY = new THREE.MeshStandardMaterial({
  color: "#c7c7cc", metalness: 0.6, roughness: 0.3,
});
const SAT_DARK = new THREE.MeshStandardMaterial({
  color: "#1c1c1e", metalness: 0.8, roughness: 0.2,
});
const PANEL_BLUE = new THREE.MeshStandardMaterial({
  color: "#1a3a6a", metalness: 0.3, roughness: 0.5, side: THREE.DoubleSide,
});
const PANEL_GOLD = new THREE.MeshStandardMaterial({
  color: "#c88a00", metalness: 0.7, roughness: 0.2, emissive: "#c88a00", emissiveIntensity: 0.05,
});
const ANTENNA_MAT = new THREE.MeshStandardMaterial({
  color: "#888899", metalness: 0.9, roughness: 0.1,
});
const EMITTER = new THREE.MeshStandardMaterial({
  color: "#00d4ff", emissive: "#00d4ff", emissiveIntensity: 0.5,
});

/* ─── Starlink (flat panel bus, single solar array) ─── */
function buildStarlink(group: Group, v2?: boolean, v3?: boolean) {
  const scale = v3 ? 1.8 : v2 ? 1.4 : 1;
  // Flat body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.08 * scale, 0.6 * scale), SAT_BODY);
  body.position.y = 0;
  group.add(body);

  // Solar panel (single large wing)
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.5 * scale, 0.4 * scale),
    PANEL_BLUE
  );
  panel.position.set(0.25 * scale, 0, 0);
  // Panel support arm
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2 * scale, 4), ANTENNA_MAT);
  arm.position.set(0.15 * scale, 0.25 * scale, 0);
  arm.rotation.z = Math.PI / 2;
  group.add(arm);
  group.add(panel);

  // Antenna (K-band phased array)
  const ant = new THREE.Mesh(new THREE.CircleGeometry(0.08 * scale, 16), new THREE.MeshStandardMaterial({ color: "#00bbdd", emissive: "#00bbdd", emissiveIntensity: 0.2, side: THREE.DoubleSide }));
  ant.position.set(0, 0, -0.35 * scale);
  group.add(ant);

  // Hall thruster
  const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.06 * scale, 8), ANTENNA_MAT);
  thruster.position.set(0, 0, 0.35 * scale);
  group.add(thruster);

  // Emitter dot
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.02 * scale, 8, 8), EMITTER);
  dot.position.set(0, 0, 0.4 * scale);
  group.add(dot);
}

/* ─── GPS III (box bus + 2 solar wings + dish) ─── */
function buildGpsIII(group: Group) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), SAT_BODY);
  body.position.y = 0;
  group.add(body);

  // Solar wings (2)
  [-1, 1].forEach((side) => {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.5, 0.3),
      PANEL_BLUE
    );
    panel.position.set(side * 0.3, 0, 0);
    // Arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.15, 4), ANTENNA_MAT);
    arm.position.set(side * 0.22, 0.25, 0);
    arm.rotation.z = Math.PI / 2;
    group.add(arm);
    group.add(panel);
  });

  // L-band dish
  const dish = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), PANEL_GOLD);
  dish.position.set(0, 0, -0.25);
  group.add(dish);

  // Navigation antenna array
  [0, 1, 2, 3].forEach((i) => {
    const a = (i / 4) * Math.PI * 2;
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.06, 4), ANTENNA_MAT);
    ant.position.set(Math.cos(a) * 0.15, Math.sin(a) * 0.12, 0.25);
    group.add(ant);
  });
}

/* ─── OneWeb (upright body + cross solar array) ─── */
function buildOneWeb(group: Group) {
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.4, 0.25), SAT_BODY);
  body.position.y = 0;
  group.add(body);

  // Cross-shaped solar panel
  const panel1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.15), PANEL_BLUE);
  panel1.position.y = 0.25;
  group.add(panel1);
  const panel2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 0.5), PANEL_BLUE);
  panel2.position.y = 0.25;
  group.add(panel2);

  // User terminal antenna
  const ant = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), PANEL_GOLD);
  ant.position.set(0, 0, -0.18);
  group.add(ant);
}

/* ─── CubeSat (modular bus) ─── */
function buildCubeSat(group: Group, u: number) {
  const size = 0.1 * u;
  const body = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), SAT_DARK);
  body.position.y = 0;
  group.add(body);

  // Solar cells on faces
  const faces = [
    { pos: [size / 2 + 0.005, 0, 0], rot: [0, Math.PI / 2, 0] },
    { pos: [-size / 2 - 0.005, 0, 0], rot: [0, -Math.PI / 2, 0] },
    { pos: [0, 0, size / 2 + 0.005], rot: [0, 0, 0] },
    { pos: [0, 0, -size / 2 - 0.005], rot: [0, 0, 0] },
  ];
  faces.forEach((f) => {
    const cell = new THREE.Mesh(
      new THREE.PlaneGeometry(size * 0.85, size * 0.85),
      PANEL_BLUE
    );
    cell.position.set(f.pos[0] as number, f.pos[1] as number, f.pos[2] as number);
    cell.rotation.set(f.rot[0] as number, f.rot[1] as number, f.rot[2] as number);
    group.add(cell);
  });

  // Antenna (dipole)
  if (u >= 3) {
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.15, 4), ANTENNA_MAT);
    ant.position.set(0, 0, size / 2 + 0.08);
    group.add(ant);
  }
}

/* ─── ISS (multi-module structure) ─── */
function buildISS(group: Group) {
  const scale = 0.15;

  // Main truss
  const truss = new THREE.Mesh(new THREE.BoxGeometry(2.0 * scale, 0.02 * scale, 0.02 * scale), SAT_BODY);
  group.add(truss);

  // Solar arrays (4 large wings)
  [-1, 1].forEach((side) => {
    for (let seg = 0; seg < 2; seg++) {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.02 * scale, 0.5 * scale, 0.3 * scale),
        PANEL_BLUE
      );
      panel.position.set(side * 0.12 * scale + seg * 0.5 * scale * side, 0, 0);
      group.add(panel);
    }
  });

  // Modules
  const modules = [
    { pos: [0, 0, 0.1 * scale], size: [0.2 * scale, 0.15 * scale, 0.15 * scale], color: "#c7c7cc" },
    { pos: [0, 0, -0.1 * scale], size: [0.15 * scale, 0.12 * scale, 0.2 * scale], color: "#d4c090" },
    { pos: [0.3 * scale, 0, 0.05 * scale], size: [0.1 * scale, 0.1 * scale, 0.1 * scale], color: "#aabbcc" },
    { pos: [-0.3 * scale, 0, 0.05 * scale], size: [0.1 * scale, 0.1 * scale, 0.1 * scale], color: "#aabbcc" },
  ];
  modules.forEach((m) => {
    const mod = new THREE.Mesh(
      new THREE.BoxGeometry(m.size[0], m.size[1], m.size[2]),
      new THREE.MeshStandardMaterial({ color: m.color, metalness: 0.4, roughness: 0.5 })
    );
    mod.position.set(m.pos[0], m.pos[1], m.pos[2]);
    group.add(mod);
  });

  // Radiators
  [-1, 1].forEach((side) => {
    const rad = new THREE.Mesh(
      new THREE.BoxGeometry(0.1 * scale, 0.15 * scale, 0.005 * scale),
      new THREE.MeshStandardMaterial({ color: "#888899", metalness: 0.3, roughness: 0.7 })
    );
    rad.position.set(side * 0.1 * scale, 0.1 * scale, 0.1 * scale);
    group.add(rad);
  });

  // Emitter
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.03 * scale, 8, 8), EMITTER);
  dot.position.set(0, 0, 0.2 * scale);
  group.add(dot);
}

/* ─── Hubble Space Telescope ─── */
function buildHubble(group: Group) {
  const scale = 0.15;

  // Main tube
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.14 * scale, 0.5 * scale, 16), SAT_BODY);
  tube.position.y = 0;
  tube.rotation.x = Math.PI / 2;
  group.add(tube);

  // Solar panels (2 wings)
  [-1, 1].forEach((side) => {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.02 * scale, 0.5 * scale, 0.25 * scale),
      PANEL_BLUE
    );
    panel.position.set(side * 0.12 * scale, 0, 0);
    group.add(panel);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.008 * scale, 0.008 * scale, 0.1 * scale, 4), ANTENNA_MAT);
    arm.position.set(side * 0.07 * scale, 0.25 * scale, 0);
    arm.rotation.z = Math.PI / 2;
    group.add(arm);
  });

  // Aperture door
  const door = new THREE.Mesh(new THREE.CircleGeometry(0.1 * scale, 16), PANEL_GOLD);
  door.position.set(0, 0, -0.3 * scale);
  group.add(door);

  // High-gain antenna
  const dish = new THREE.Mesh(new THREE.CircleGeometry(0.06 * scale, 12), PANEL_GOLD);
  dish.position.set(0, 0.15 * scale, 0.25 * scale);
  dish.rotation.x = -0.3;
  group.add(dish);
}

/* ─── GEO Communications Satellite ─── */
function buildCommsGeo(group: Group) {
  const scale = 0.2;

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.5 * scale, 0.3 * scale), SAT_BODY);
  body.position.y = 0;
  group.add(body);

  // Large solar wings (2)
  [-1, 1].forEach((side) => {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.02 * scale, 0.8 * scale, 0.35 * scale),
      PANEL_BLUE
    );
    panel.position.set(side * 0.25 * scale, 0, 0);
    group.add(panel);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.008 * scale, 0.008 * scale, 0.2 * scale, 4), ANTENNA_MAT);
    arm.position.set(side * 0.15 * scale, 0.4 * scale, 0);
    arm.rotation.z = Math.PI / 2;
    group.add(arm);
  });

  // Reflector dish
  const dish = new THREE.Mesh(new THREE.CircleGeometry(0.15 * scale, 20), PANEL_GOLD);
  dish.position.set(0, 0.2 * scale, -0.25 * scale);
  dish.rotation.x = 0.2;
  group.add(dish);

  // Feed horn
  const horn = new THREE.Mesh(new THREE.ConeGeometry(0.03 * scale, 0.06 * scale, 8), ANTENNA_MAT);
  horn.position.set(0, 0.2 * scale, -0.1 * scale);
  group.add(horn);

  // Apogee motor
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * scale, 0.08 * scale, 0.1 * scale, 8), ANTENNA_MAT);
  motor.position.set(0, -0.35 * scale, 0);
  group.add(motor);
}

/* ─── Reconnaissance / Spy Satellite ─── */
function buildSpy(group: Group) {
  const scale = 0.18;

  // Body (telescope-like)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * scale, 0.15 * scale, 0.4 * scale, 12), SAT_DARK);
  body.position.y = 0;
  body.rotation.x = Math.PI / 2;
  group.add(body);

  // Aperture
  const ap = new THREE.Mesh(new THREE.CircleGeometry(0.12 * scale, 16), PANEL_GOLD);
  ap.position.set(0, 0, -0.25 * scale);
  group.add(ap);

  // Solar panel (single large wing)
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.02 * scale, 0.6 * scale, 0.3 * scale), PANEL_BLUE);
  panel.position.set(0.15 * scale, 0, 0);
  group.add(panel);

  // Antenna (folded)
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.005 * scale, 0.005 * scale, 0.12 * scale, 4), ANTENNA_MAT);
  ant.position.set(0, 0.1 * scale, 0.25 * scale);
  group.add(ant);
}

/* ─── Science Satellite (like Sentinel, Landsat) ─── */
function buildScience(group: Group) {
  const scale = 0.16;

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.25 * scale, 0.3 * scale, 0.3 * scale), SAT_BODY);
  body.position.y = 0;
  group.add(body);

  // Solar array single wing
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.02 * scale, 0.5 * scale, 0.25 * scale), PANEL_BLUE);
  panel.position.set(0.2 * scale, 0, 0);
  group.add(panel);

  // Instrument panel
  const inst = new THREE.Mesh(new THREE.BoxGeometry(0.08 * scale, 0.04 * scale, 0.08 * scale), new THREE.MeshStandardMaterial({ color: "#ff6644", emissive: "#ff6644", emissiveIntensity: 0.1 }));
  inst.position.set(0, 0.2 * scale, -0.18 * scale);
  group.add(inst);

  // Sensor boom
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.003 * scale, 0.003 * scale, 0.2 * scale, 4), ANTENNA_MAT);
  boom.position.set(0, 0.1 * scale, 0.25 * scale);
  boom.rotation.x = 0.3;
  group.add(boom);
  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.02 * scale, 8, 8), EMITTER);
  sensor.position.set(0, 0.1 * scale, 0.35 * scale);
  group.add(sensor);
}

/* ─── Debris (random fragments) ─── */
function buildDebris(group: Group) {
  const scale = 0.02 + Math.random() * 0.06;
  const geom = Math.random() > 0.5
    ? new THREE.BoxGeometry(scale, scale * (0.5 + Math.random()), scale * (0.5 + Math.random()))
    : new THREE.SphereGeometry(scale * 0.5, 4, 4);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0, 0, 0.3 + Math.random() * 0.4),
    metalness: 0.3, roughness: 0.8,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(0, 0, 0);
  group.add(mesh);
}

/* ─── Factory ─── */
export function buildSatelliteModel(bus: SatelliteBus, group: Group) {
  switch (bus) {
    case "starlink": return buildStarlink(group);
    case "starlink-v2": return buildStarlink(group, true);
    case "starlink-v3": return buildStarlink(group, false, true);
    case "gps-iii": case "gps-iiif": return buildGpsIII(group);
    case "oneweb": return buildOneWeb(group);
    case "cubesat-1u": return buildCubeSat(group, 1);
    case "cubesat-3u": return buildCubeSat(group, 3);
    case "cubesat-6u": return buildCubeSat(group, 6);
    case "cubesat-12u": return buildCubeSat(group, 12);
    case "iss": return buildISS(group);
    case "hubble": return buildHubble(group);
    case "comms-geo": return buildCommsGeo(group);
    case "comms-leo": return buildCommsGeo(group);
    case "science": case "telescope": return buildScience(group);
    case "spy": case "recon": return buildSpy(group);
    case "debris": case "rocket-body": return buildDebris(group);
    default: return buildCubeSat(group, 3);
  }
}

/* ─── Renderable Satellite3D component ─── */
export default function Satellite3D({
  entry,
  isSelected = false,
  scale = 1,
}: {
  entry: SatelliteEntry;
  isSelected?: boolean;
  scale?: number;
}) {
  const groupRef = useRef<Group>(null);
  const built = useRef(false);

  useEffect(() => {
    if (!groupRef.current || built.current) return;
    buildSatelliteModel(entry.bus, groupRef.current);
    built.current = true;
  }, [entry.bus]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Slow rotation for visual interest
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    // Slight wobble for debris
    if (entry.bus === "debris" || entry.bus === "rocket-body") {
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.7) * 0.2;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={0.08}
            wireframe
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}