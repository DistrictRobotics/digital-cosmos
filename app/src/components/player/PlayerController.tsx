import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Mesh } from "three";

/* ─── Player modes ─── */
export type PlayerMode = "walk" | "drone" | "rover" | "craft";
export type ControlState = {
  forward: boolean; backward: boolean; left: boolean; right: boolean;
  jump: boolean; interact: boolean; mode: PlayerMode;
};

/* ─── Constants ─── */
const WALK_SPEED = 4;
const DRONE_SPEED = 6;
const ROVER_SPEED = 8;
const CRAFT_SPEED = 12;
const GRAVITY = -12;
const JUMP_FORCE = 5;
const PLAYER_HEIGHT = 0.45;
const CAMERA_DISTANCE = 1.5;
const CAMERA_HEIGHT = 0.6;
const CAMERA_SMOOTH = 0.08;

/* ─── Character model ─── */
function PlayerCharacter({ mode }: { mode: PlayerMode }) {
  const grp = useRef<Group>(null);
  const walkCycle = useRef(0);

  useEffect(() => {
    if (!grp.current) return;
    const g = grp.current;

    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.25, 0.1),
      new THREE.MeshStandardMaterial({ color: "#070b14", metalness: 0.3, roughness: 0.7 })
    );
    body.position.y = 0.15;
    g.add(body);

    // Chest plate (cyan accent)
    const chest = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.1, 0.02),
      new THREE.MeshStandardMaterial({ color: "#00d4ff", emissive: "#00d4ff", emissiveIntensity: 0.15, metalness: 0.8, roughness: 0.2 })
    );
    chest.position.set(0, 0.2, 0.06);
    g.add(chest);

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 8, 8),
      new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.3, roughness: 0.5 })
    );
    head.position.y = 0.33;
    g.add(head);

    // Visor
    const visor = new THREE.Mesh(
      new THREE.CircleGeometry(0.04, 8),
      new THREE.MeshBasicMaterial({ color: "#00d4ff", emissive: "#00d4ff", emissiveIntensity: 0.5, side: THREE.DoubleSide })
    );
    visor.position.set(0, 0.33, 0.055);
    g.add(visor);

    // Arms
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.018, 0.12, 4),
        new THREE.MeshStandardMaterial({ color: "#070b14", metalness: 0.3, roughness: 0.7 })
      );
      arm.position.set(side * 0.12, 0.18, 0);
      arm.userData.isArm = true;
      arm.userData.side = side;
      g.add(arm);
    }

    // Legs
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.02, 0.12, 4),
        new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.3, roughness: 0.7 })
      );
      leg.position.set(side * 0.06, 0.06, 0);
      leg.userData.isLeg = true;
      leg.userData.side = side;
      g.add(leg);
    }

    // Boots
    for (const side of [-1, 1]) {
      const boot = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.02, 0.05),
        new THREE.MeshStandardMaterial({ color: "#00d4ff", metalness: 0.8, roughness: 0.2, emissive: "#00d4ff", emissiveIntensity: 0.05 })
      );
      boot.position.set(side * 0.06, 0.01, 0.02);
      g.add(boot);
    }
  }, []);

  useFrame((_, delta) => {
    if (!grp.current) return;
    // Walking animation
    walkCycle.current += delta * 8;
    const swing = Math.sin(walkCycle.current) * 0.3;

    grp.current.children.forEach((child) => {
      if (child.userData.isArm) {
        child.rotation.x = swing * (child.userData.side as number);
      }
      if (child.userData.isLeg) {
        child.rotation.x = -swing * (child.userData.side as number);
      }
    });
  });

  return <group ref={grp} />;
}

/* ─── Vehicle models ─── */
function DroneModel({ active }: { active: boolean }) {
  const grp = useRef<Group>(null);
  const rotorAngle = useRef(0);

  useFrame((_, delta) => {
    if (!grp.current) return;
    rotorAngle.current += delta * 20;
    // Spin rotors
    grp.current.children.forEach((child) => {
      if (child.userData.isRotor) {
        child.rotation.y = rotorAngle.current;
      }
    });
    // Hover bob
    if (active) {
      grp.current.position.y = Math.sin(rotorAngle.current * 0.5) * 0.02;
    }
  });

  useEffect(() => {
    if (!grp.current) return;
    const g = grp.current;

    // Central body
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshStandardMaterial({ color: "#070b14", metalness: 0.6, roughness: 0.3 })
    );
    g.add(body);

    // Arms (4)
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.2, 4),
        new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.8, roughness: 0.2 })
      );
      arm.position.set(Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = -a;
      g.add(arm);

      // Rotor
      const rotor = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.005, 0.02),
        new THREE.MeshStandardMaterial({ color: "#00d4ff", emissive: "#00d4ff", emissiveIntensity: 0.1, metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.7 })
      );
      rotor.position.set(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2);
      rotor.userData.isRotor = true;
      g.add(rotor);
    }

    // Center glow
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshBasicMaterial({ color: "#00d4ff", transparent: true, opacity: 0.3 })
    );
    g.add(glow);
  }, []);

  return <group ref={grp} />;
}

function RoverModel() {
  const grp = useRef<Group>(null);
  const wheelAngle = useRef(0);

  useFrame((_, delta) => {
    if (!grp.current) return;
    wheelAngle.current += delta * 10;
    grp.current.children.forEach((child) => {
      if (child.userData.isWheel) {
        child.rotation.x = wheelAngle.current;
      }
    });
  });

  useEffect(() => {
    if (!grp.current) return;
    const g = grp.current;

    // Chassis
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.06, 0.3),
      new THREE.MeshStandardMaterial({ color: "#070b14", metalness: 0.6, roughness: 0.3 })
    );
    chassis.position.y = 0.06;
    g.add(chassis);

    // Cabin
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.06, 0.12),
      new THREE.MeshStandardMaterial({ color: "#00d4ff", transparent: true, opacity: 0.3, metalness: 0.8, roughness: 0.1 })
    );
    cabin.position.set(0, 0.1, -0.04);
    g.add(cabin);

    // 6 wheels
    for (let side of [-1, 1]) {
      for (let pos of [-1, 0, 1]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.015, 8),
          new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.3, roughness: 0.8 })
        );
        wheel.position.set(side * 0.12, 0.025, pos * 0.1);
        wheel.rotation.z = Math.PI / 2;
        wheel.userData.isWheel = true;
        g.add(wheel);
      }
    }

    // Headlights
    for (const side of [-1, 1]) {
      const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.008, 6, 6),
        new THREE.MeshBasicMaterial({ color: "#00d4ff", emissive: "#00d4ff", emissiveIntensity: 0.3 })
      );
      light.position.set(side * 0.05, 0.04, -0.16);
      g.add(light);
    }
  }, []);

  return <group ref={grp} />;
}

function CraftModel() {
  const grp = useRef<Group>(null);

  useEffect(() => {
    if (!grp.current) return;
    const g = grp.current;

    // Fuselage
    const fuse = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.08, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: "#070b14", metalness: 0.7, roughness: 0.2 })
    );
    fuse.rotation.x = Math.PI / 2;
    g.add(fuse);

    // Cockpit
    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshStandardMaterial({ color: "#00d4ff", transparent: true, opacity: 0.2, metalness: 0.9, roughness: 0.1 })
    );
    cockpit.position.set(0, 0, 0.12);
    cockpit.scale.set(1, 1, 0.6);
    g.add(cockpit);

    // Wings
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.008, 0.06),
        new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.6, roughness: 0.3 })
      );
      wing.position.set(side * 0.09, 0, 0);
      g.add(wing);
    }

    // Engines
    for (const side of [-1, 1]) {
      const eng = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.02, 0.05, 8),
        new THREE.MeshStandardMaterial({ color: "#1c1c1e", metalness: 0.8, roughness: 0.2 })
      );
      eng.position.set(side * 0.06, 0, -0.15);
      eng.rotation.x = Math.PI / 2;
      g.add(eng);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.01, 0.05, 6),
        new THREE.MeshBasicMaterial({ color: "#00d4ff", emissive: "#00d4ff", emissiveIntensity: 0.5, transparent: true, opacity: 0.6 })
      );
      flame.position.set(side * 0.06, 0, -0.18);
      g.add(flame);
    }
  }, []);

  return <group ref={grp} />;
}

/* ─── PlayerController: third-person character with WASD + mouse ─── */
export default function PlayerController({
  mode,
  onModeChange,
  onInteract,
}: {
  mode: PlayerMode;
  onModeChange: (m: PlayerMode) => void;
  onInteract: () => void;
}) {
  const { camera, gl } = useThree();
  const keys = useRef<Set<string>>(new Set());
  const isLocked = useRef(false);
  const yaw = useRef(0);
  const pitch = useRef(0.3);
  const velocity = useRef(new THREE.Vector3());
  const isGrounded = useRef(false);
  const playerPos = useRef(new THREE.Vector3(0, 1, 0));
  const modeRef = useRef(mode);

  // Lock pointer on click
  useEffect(() => {
    const canvas = gl.domElement;
    const onClick = () => {
      if (!isLocked.current && canvas === document.pointerLockElement) return;
      canvas.requestPointerLock();
    };
    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, [gl]);

  // Pointer lock events
  useEffect(() => {
    const onLock = () => { isLocked.current = true; };
    const onUnlock = () => { isLocked.current = false; };
    document.addEventListener("pointerlockchange", onLock);
    document.addEventListener("pointerlockchange", onUnlock);
    return () => {
      document.removeEventListener("pointerlockchange", onLock);
      document.removeEventListener("pointerlockchange", onUnlock);
    };
  }, []);

  // Keyboard events
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current.add(e.code);
      if (e.code === "KeyE") onInteract();
      if (e.code === "Tab") {
        e.preventDefault();
        const modes: PlayerMode[] = ["walk", "drone", "rover", "craft"];
        const idx = modes.indexOf(modeRef.current);
        onModeChange(modes[(idx + 1) % modes.length]);
      }
      if (e.code === "KeyF" && modeRef.current !== "walk") {
        onModeChange("walk");
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked.current) return;
      yaw.current -= e.movementX * 0.002;
      pitch.current = Math.max(-0.8, Math.min(0.8, pitch.current - e.movementY * 0.002));
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [onInteract, onModeChange]);

  // Update mode ref
  modeRef.current = mode;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const pos = playerPos.current;
    const k = keys.current;

    // Camera direction vectors
    const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);

    // Movement
    let speed = WALK_SPEED;
    if (mode === "drone") speed = DRONE_SPEED;
    else if (mode === "rover") speed = ROVER_SPEED;
    else if (mode === "craft") speed = CRAFT_SPEED;

    const moveDir = new THREE.Vector3();
    if (k.has("KeyW") || k.has("ArrowUp")) moveDir.add(forward);
    if (k.has("KeyS") || k.has("ArrowDown")) moveDir.sub(forward);
    if (k.has("KeyA") || k.has("ArrowLeft")) moveDir.sub(right);
    if (k.has("KeyD") || k.has("ArrowRight")) moveDir.add(right);
    if (moveDir.length() > 0) moveDir.normalize();

    const vel = velocity.current;

    if (mode === "drone" || mode === "craft") {
      // Flying mode: full 3D movement
      const up = new THREE.Vector3(0, 1, 0);
      if (k.has("ShiftLeft") || k.has("ShiftRight")) vel.y += speed * dt;
      if (k.has("ControlLeft") || k.has("ControlRight")) vel.y -= speed * dt;
      vel.x += (moveDir.x * speed - vel.x) * 0.1;
      vel.z += (moveDir.z * speed - vel.z) * 0.1;
      vel.y += (-vel.y) * 0.05;
    } else if (mode === "rover") {
      // Ground vehicle
      vel.x += (moveDir.x * speed - vel.x) * 0.05;
      vel.z += (moveDir.z * speed - vel.z) * 0.05;
    } else {
      // Walking
      const accel = 10;
      const friction = 8;
      if (moveDir.length() > 0) {
        vel.x += (moveDir.x * speed - vel.x) * accel * dt;
        vel.z += (moveDir.z * speed - vel.z) * accel * dt;
      } else {
        vel.x *= (1 - friction * dt);
        vel.z *= (1 - friction * dt);
      }
    }

    // Gravity (walk only)
    if (mode === "walk" || mode === "rover") {
      vel.y += GRAVITY * dt;
    }

    // Jump
    if ((k.has("Space")) && isGrounded.current && mode === "walk") {
      vel.y = JUMP_FORCE;
      isGrounded.current = false;
    }

    // Apply velocity
    pos.x += vel.x * dt;
    pos.y += vel.y * dt;
    pos.z += vel.z * dt;

    // Ground collision
    if (pos.y < 0.1) {
      pos.y = 0.1;
      vel.y = 0;
      isGrounded.current = true;
    }

    // Third-person camera
    const camTarget = new THREE.Vector3(
      pos.x + Math.sin(yaw.current) * Math.cos(pitch.current) * CAMERA_DISTANCE,
      pos.y + CAMERA_HEIGHT + Math.sin(pitch.current) * CAMERA_DISTANCE,
      pos.z + Math.cos(yaw.current) * Math.cos(pitch.current) * CAMERA_DISTANCE
    );

    camera.position.lerp(camTarget, CAMERA_SMOOTH);
    camera.lookAt(pos.x, pos.y + CAMERA_HEIGHT * 0.5, pos.z);
  });

  return (
    <group position={playerPos.current.toArray()}>
      {mode === "walk" && <PlayerCharacter mode={mode} />}
      {mode === "drone" && <DroneModel active={true} />}
      {mode === "rover" && <RoverModel />}
      {mode === "craft" && <CraftModel />}
    </group>
  );
}