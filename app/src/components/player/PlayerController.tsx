import { useRef, useEffect, useCallback, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Mesh, Object3D } from "three";

/* ─── Types ─── */
export type PlayerMode = "walk" | "drone" | "rover" | "craft";
export type InteractableType = "door" | "terminal" | "mission" | "vehicle";
export interface Interactable {
  id: string; type: InteractableType; position: THREE.Vector3; label: string;
  onActivate: () => void;
}

/* ─── Constants ─── */
const WALK_SPEED = 3.5; const SPRINT_SPEED = 6; const DRONE_SPEED = 8;
const ROVER_SPEED = 12; const CRAFT_SPEED = 18;
const GRAVITY = -15; const JUMP_FORCE = 6;
const PLAYER_HEIGHT = 0.45; const CAM_DIST = 2.0; const CAM_HEIGHT = 0.7;
const CAM_SMOOTH = 0.06;

/* ─── TerrainHeightSampler — reads terrain height at x,z ─── */
export function createTerrainSampler(scene: THREE.Scene) {
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const origin = new THREE.Vector3();

  return (x: number, z: number): number => {
    origin.set(x, 10, z);
    raycaster.set(origin, down);
    const meshes: THREE.Mesh[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry && child.geometry.attributes.position) {
        meshes.push(child);
      }
    });
    const hits = raycaster.intersectObjects(meshes, false);
    for (const hit of hits) {
      if (hit.distance < 20) return 10 - hit.distance;
    }
    return 0;
  };
}

/* ─── Building collision boxes ─── */
export function registerCollider(group: Object3D, halfExtents: THREE.Vector3, offset?: THREE.Vector3) {
  group.userData.collider = { halfExtents: halfExtents.clone(), offset: offset?.clone() || new THREE.Vector3() };
}

/* ─── Character model ─── */
function HumanoidCharacter({ moving, sprinting }: { moving: boolean; sprinting: boolean }) {
  const grp = useRef<Group>(null);
  const walkCycle = useRef(0);
  const arms = useRef<Mesh[]>([]);
  const legs = useRef<Mesh[]>([]);

  useEffect(() => {
    if (!grp.current) return;
    const g = grp.current;

    // Torso
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: "#070b14", metalness: 0.4, roughness: 0.6 })
    );
    torso.position.y = 0.18;
    g.add(torso);

    // Chest plate
    const chest = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.08, 0.02),
      new THREE.MeshStandardMaterial({ color: "#00d4ff", emissive: "#00d4ff", emissiveIntensity: 0.2, metalness: 0.9, roughness: 0.1 })
    );
    chest.position.set(0, 0.22, 0.06);
    g.add(chest);

    // Shoulders
    for (const side of [-1, 1]) {
      const sh = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 6, 6),
        new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.6, roughness: 0.3, emissive: "#00d4ff", emissiveIntensity: 0.05 })
      );
      sh.position.set(side * 0.09, 0.26, 0);
      g.add(sh);
    }

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 8, 8),
      new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.3, roughness: 0.5 })
    );
    head.position.y = 0.33;
    g.add(head);

    // Visor
    const visor = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshBasicMaterial({ color: "#00d4ff", emissive: "#00d4ff", emissiveIntensity: 0.8, transparent: true, opacity: 0.6 })
    );
    visor.position.set(0, 0.33, 0.055);
    visor.scale.set(1, 0.4, 0.3);
    g.add(visor);

    // Arms
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.016, 0.14, 6),
        new THREE.MeshStandardMaterial({ color: "#070b14", metalness: 0.4, roughness: 0.6 })
      );
      arm.position.set(side * 0.1, 0.16, 0);
      arm.userData.arm = true; arm.userData.side = side;
      g.add(arm);
      arms.current.push(arm);

      // Glove
      const glove = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 6, 6),
        new THREE.MeshStandardMaterial({ color: "#00d4ff", metalness: 0.9, roughness: 0.1, emissive: "#00d4ff", emissiveIntensity: 0.1 })
      );
      glove.position.set(side * 0.1, 0.09, 0);
      g.add(glove);
    }

    // Legs
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.018, 0.14, 6),
        new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.4, roughness: 0.6 })
      );
      leg.position.set(side * 0.05, 0.07, 0);
      leg.userData.leg = true; leg.userData.side = side;
      g.add(leg);
      legs.current.push(leg);

      // Boot
      const boot = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.02, 0.05),
        new THREE.MeshStandardMaterial({ color: "#00d4ff", metalness: 0.9, roughness: 0.1, emissive: "#00d4ff", emissiveIntensity: 0.08 })
      );
      boot.position.set(side * 0.05, 0.01, 0.02);
      g.add(boot);
    }

    // Backpack
    const pack = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.08, 0.04),
      new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.6, roughness: 0.3 })
    );
    pack.position.set(0, 0.18, -0.08);
    g.add(pack);

    // Backpack glow
    const packGlow = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.02, 0.005),
      new THREE.MeshBasicMaterial({ color: "#00d4ff", transparent: true, opacity: 0.15 })
    );
    packGlow.position.set(0, 0.18, -0.1);
    g.add(packGlow);
  }, []);

  useFrame((_, delta) => {
    if (!grp.current) return;
    if (moving) {
      const speed = sprinting ? 14 : 10;
      walkCycle.current += delta * speed;
      const swing = Math.sin(walkCycle.current) * 0.4;
      for (const child of grp.current.children) {
        if (child.userData.arm) child.rotation.x = swing * (child.userData.side as number);
        if (child.userData.leg) child.rotation.x = -swing * (child.userData.side as number) * 0.7;
      }
    }
  });

  return <group ref={grp} />;
}

/* ─── Drone model ─── */
function DroneModel() {
  const grp = useRef<Group>(null);
  const rotorAngle = useRef(0);
  useFrame((_, delta) => {
    rotorAngle.current += delta * 25;
    if (!grp.current) return;
    grp.current.children.forEach((c) => { if (c.userData.rotor) c.rotation.y = rotorAngle.current; });
    grp.current.position.y = Math.sin(rotorAngle.current * 0.3) * 0.02;
  });
  useEffect(() => {
    if (!grp.current) return;
    const g = grp.current;
    // Center body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshStandardMaterial({ color: "#070b14", metalness: 0.7, roughness: 0.2 }));
    g.add(body);
    // 4 arms + rotors
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 4), new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.8, roughness: 0.2 }));
      arm.position.set(Math.cos(a) * 0.09, 0, Math.sin(a) * 0.09);
      arm.rotation.z = Math.PI / 2; arm.rotation.y = -a;
      g.add(arm);
      const rotor = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.004, 0.015), new THREE.MeshStandardMaterial({ color: "#00d4ff", emissive: "#00d4ff", emissiveIntensity: 0.15, transparent: true, opacity: 0.6 }));
      rotor.position.set(Math.cos(a) * 0.18, 0, Math.sin(a) * 0.18);
      rotor.userData.rotor = true;
      g.add(rotor);
    }
    // Camera
    const cam = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), new THREE.MeshBasicMaterial({ color: "#00d4ff", transparent: true, opacity: 0.3 }));
    cam.position.set(0, -0.03, 0.04);
    g.add(cam);
    // Glow
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: "#00d4ff", transparent: true, opacity: 0.2 }));
    g.add(glow);
  }, []);
  return <group ref={grp} />;
}

/* ─── Rover model ─── */
function RoverModel() {
  const grp = useRef<Group>(null);
  const wheelAngle = useRef(0);
  useFrame((_, delta) => {
    wheelAngle.current += delta * 12;
    if (!grp.current) return;
    grp.current.children.forEach((c) => { if (c.userData.wheel) c.rotation.x = wheelAngle.current; });
  });
  useEffect(() => {
    if (!grp.current) return;
    const g = grp.current;
    // Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.28), new THREE.MeshStandardMaterial({ color: "#070b14", metalness: 0.7, roughness: 0.2 }));
    chassis.position.y = 0.06; g.add(chassis);
    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.1), new THREE.MeshStandardMaterial({ color: "#00d4ff", transparent: true, opacity: 0.2, metalness: 0.9, roughness: 0.1 }));
    cabin.position.set(0, 0.1, -0.03); g.add(cabin);
    // Roll cage
    const cage = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.005, 0.15), new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.8, roughness: 0.2 }));
    cage.position.set(0, 0.12, 0.02); g.add(cage);
    // 6 wheels
    for (const side of [-1, 1]) {
      for (const pos of [-1, 0, 1]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.015, 8), new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.3, roughness: 0.8 }));
        wheel.position.set(side * 0.11, 0.025, pos * 0.09);
        wheel.rotation.z = Math.PI / 2; wheel.userData.wheel = true;
        g.add(wheel);
      }
    }
    // Headlights
    for (const side of [-1, 1]) {
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), new THREE.MeshBasicMaterial({ color: "#00d4ff", emissive: "#00d4ff", emissiveIntensity: 0.5 }));
      hl.position.set(side * 0.05, 0.04, -0.15); g.add(hl);
    }
    // Tail lights
    for (const side of [-1, 1]) {
      const tl = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), new THREE.MeshBasicMaterial({ color: "#ff4444", emissive: "#ff4444", emissiveIntensity: 0.3 }));
      tl.position.set(side * 0.05, 0.04, 0.15); g.add(tl);
    }
  }, []);
  return <group ref={grp} />;
}

/* ─── Craft model ─── */
function CraftModel() {
  const grp = useRef<Group>(null);
  useEffect(() => {
    if (!grp.current) return;
    const g = grp.current;
    // Fuselage
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.25, 8), new THREE.MeshStandardMaterial({ color: "#070b14", metalness: 0.8, roughness: 0.2 }));
    fuse.rotation.x = Math.PI / 2; g.add(fuse);
    // Cockpit
    const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshStandardMaterial({ color: "#00d4ff", transparent: true, opacity: 0.2, metalness: 0.9, roughness: 0.1 }));
    cockpit.position.set(0, 0, 0.1); cockpit.scale.set(1, 1, 0.5); g.add(cockpit);
    // Wings
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.006, 0.05), new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.7, roughness: 0.2 }));
      wing.position.set(side * 0.08, 0, 0); g.add(wing);
      // Engine
      const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.04, 6), new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.8, roughness: 0.2 }));
      eng.position.set(side * 0.08, 0, -0.12); eng.rotation.x = Math.PI / 2; g.add(eng);
      // Flame
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.04, 6), new THREE.MeshBasicMaterial({ color: "#00d4ff", transparent: true, opacity: 0.5 }));
      flame.position.set(side * 0.08, 0, -0.15); g.add(flame);
    }
    // Tail fin
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.04, 0.02), new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.6, roughness: 0.3 }));
    tail.position.set(0, 0.03, -0.12); g.add(tail);
  }, []);
  return <group ref={grp} />;
}

/* ─── PlayerController ─── */
export default function PlayerController({
  mode, onModeChange, onInteract, scene,
}: {
  mode: PlayerMode; onModeChange: (m: PlayerMode) => void; onInteract: () => void;
  scene: THREE.Scene | null;
}) {
  const { camera, gl } = useThree();
  const keys = useRef(new Set<string>());
  const locked = useRef(false);
  const yaw = useRef(0);
  const pitch = useRef(0.3);
  const vel = useRef(new THREE.Vector3());
  const grounded = useRef(false);
  const pos = useRef(new THREE.Vector3(0, 1, 0));
  const modeRef = useRef(mode);
  const terrainSampler = useRef<((x: number, z: number) => number) | null>(null);
  const colliders = useRef<{ pos: THREE.Vector3; half: THREE.Vector3 }[]>([]);
  const [nearby, setNearby] = useState<Interactable | null>(null);

  // Init terrain sampler
  useEffect(() => {
    if (scene) terrainSampler.current = createTerrainSampler(scene);
  }, [scene]);

  // Collect colliders from scene
  useEffect(() => {
    if (!scene) return;
    const cols: { pos: THREE.Vector3; half: THREE.Vector3 }[] = [];
    scene.traverse((child) => {
      if (child.userData.collider) {
        const c = child.userData.collider;
        child.getWorldPosition(c.offset);
        cols.push({ pos: c.offset.clone(), half: c.halfExtents });
      }
    });
    colliders.current = cols;
  }, [scene]);

  // Pointer lock
  useEffect(() => {
    const canvas = gl.domElement;
    const onClick = () => { if (!locked.current) canvas.requestPointerLock(); };
    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, [gl]);

  useEffect(() => {
    const onLock = () => { locked.current = true; };
    const onUnlock = () => { locked.current = false; };
    document.addEventListener("pointerlockchange", onLock);
    return () => document.removeEventListener("pointerlockchange", onLock);
  }, []);

  // Input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      keys.current.add(e.code);
      if (e.code === "KeyE") onInteract();
      if (e.code === "Tab") {
        e.preventDefault();
        const modes: PlayerMode[] = ["walk", "drone", "rover", "craft"];
        const idx = modes.indexOf(modeRef.current);
        onModeChange(modes[(idx + 1) % modes.length]);
      }
      if (e.code === "KeyF" && modeRef.current !== "walk") onModeChange("walk");
    };
    const onUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    const onMouse = (e: MouseEvent) => {
      if (!locked.current) return;
      yaw.current -= e.movementX * 0.002;
      pitch.current = Math.max(-0.6, Math.min(0.6, pitch.current - e.movementY * 0.002));
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    window.addEventListener("mousemove", onMouse);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [onInteract, onModeChange]);

  modeRef.current = mode;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = pos.current;
    const v = vel.current;
    const k = keys.current;

    // Directions
    const fwd = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right = new THREE.Vector3(fwd.z, 0, -fwd.x);

    // Speed
    let speed = WALK_SPEED;
    const sprint = k.has("ShiftLeft");
    if (mode === "walk") speed = sprint ? SPRINT_SPEED : WALK_SPEED;
    else if (mode === "drone") speed = DRONE_SPEED;
    else if (mode === "rover") speed = ROVER_SPEED;
    else if (mode === "craft") speed = CRAFT_SPEED;

    // Movement dir
    const md = new THREE.Vector3();
    if (k.has("KeyW") || k.has("ArrowUp")) md.add(fwd);
    if (k.has("KeyS") || k.has("ArrowDown")) md.sub(fwd);
    if (k.has("KeyA") || k.has("ArrowLeft")) md.sub(right);
    if (k.has("KeyD") || k.has("ArrowRight")) md.add(right);
    if (md.length() > 0) md.normalize();

    const moving = md.length() > 0;

    // ─── Mode-specific physics ───
    if (mode === "drone" || mode === "craft") {
      // Flying
      const accel = 8;
      v.x += (md.x * speed - v.x) * accel * dt;
      v.z += (md.z * speed - v.z) * accel * dt;
      if (k.has("ShiftLeft")) v.y += speed * dt;
      if (k.has("ControlLeft")) v.y -= speed * dt;
      v.y *= 0.95;
      // Banking (craft)
      if (mode === "craft" && moving) {
        const bank = -md.x * 0.3;
        // Visual bank would be applied to the model
      }
    } else if (mode === "rover") {
      // Rover: steering physics
      const accel = 6;
      const targetVx = md.x * speed;
      const targetVz = md.z * speed;
      v.x += (targetVx - v.x) * accel * dt;
      v.z += (targetVz - v.z) * accel * dt;
      // Friction
      if (!moving) { v.x *= 0.97; v.z *= 0.97; }
      v.y += GRAVITY * dt;
    } else {
      // Walking
      const accel = moving ? 12 : 8;
      const targetX = md.x * speed;
      const targetZ = md.z * speed;
      v.x += (targetX - v.x) * accel * dt;
      v.z += (targetZ - v.z) * accel * dt;
      if (!moving) { v.x *= 0.92; v.z *= 0.92; }
      v.y += GRAVITY * dt;
      // Jump
      if (k.has("Space") && grounded.current) { v.y = JUMP_FORCE; grounded.current = false; }
    }

    // Apply velocity
    p.x += v.x * dt;
    p.y += v.y * dt;
    p.z += v.z * dt;

    // ─── Terrain following (walk/rover) ───
    if (mode === "walk" || mode === "rover") {
      if (terrainSampler.current) {
        const terrainY = terrainSampler.current(p.x, p.z);
        const floorY = terrainY + PLAYER_HEIGHT;
        if (p.y < floorY) {
          p.y = floorY;
          v.y = 0;
          grounded.current = true;
        }
      } else {
        // Fallback: flat ground
        if (p.y < 0.1) { p.y = 0.1; v.y = 0; grounded.current = true; }
      }
    }

    // ─── Building collision (walk/rover) ───
    if (mode === "walk" || mode === "rover") {
      const playerRadius = mode === "rover" ? 0.12 : 0.08;
      for (const col of colliders.current) {
        const dx = p.x - col.pos.x;
        const dz = p.z - col.pos.z;
        const overlapX = col.half.x + playerRadius - Math.abs(dx);
        const overlapZ = col.half.z + playerRadius - Math.abs(dz);
        if (overlapX > 0 && overlapZ > 0) {
          // Push out along the smallest overlap
          if (overlapX < overlapZ) {
            p.x += Math.sign(dx) * overlapX;
            v.x = 0;
          } else {
            p.z += Math.sign(dz) * overlapZ;
            v.z = 0;
          }
        }
      }
    }

    // ─── Third-person camera ───
    const camTarget = new THREE.Vector3(
      p.x + Math.sin(yaw.current) * Math.cos(pitch.current) * CAM_DIST,
      p.y + CAM_HEIGHT + Math.sin(pitch.current) * CAM_DIST,
      p.z + Math.cos(yaw.current) * Math.cos(pitch.current) * CAM_DIST
    );
    camera.position.lerp(camTarget, CAM_SMOOTH);
    camera.lookAt(p.x, p.y + CAM_HEIGHT * 0.4, p.z);

    // ─── Interaction raycast ───
    if (mode === "walk") {
      const rayOrigin = new THREE.Vector3(p.x, p.y + 0.3, p.z);
      const rayDir = new THREE.Vector3(-Math.sin(yaw.current), -0.1, -Math.cos(yaw.current)).normalize();
      const raycaster = new THREE.Raycaster(rayOrigin, rayDir, 0, 1.5);
      if (scene) {
        const meshes: THREE.Mesh[] = [];
        scene.traverse((c) => { if (c instanceof THREE.Mesh && c.userData.interactable) meshes.push(c); });
        const hits = raycaster.intersectObjects(meshes, false);
        if (hits.length > 0) {
          const obj = hits[0].object;
          setNearby(obj.userData.interactable as Interactable);
        } else {
          setNearby(null);
        }
      }
    }
  });

  return (
    <group>
      <group position={[pos.current.x, pos.current.y, pos.current.z]}>
        {mode === "walk" && <HumanoidCharacter moving={true} sprinting={keys.current.has("ShiftLeft")} />}
        {mode === "drone" && <DroneModel />}
        {mode === "rover" && <RoverModel />}
      </group>
    </group>
  );
}