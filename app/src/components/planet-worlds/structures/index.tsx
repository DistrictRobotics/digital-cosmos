import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Group } from "three";

/* ═══════════════════════════════════════════
   STRUCTURE LIBRARY — 20+ unique building types
   Each returns a <group> with mesh children
   ═══════════════════════════════════════════ */

/* ─── 1. Habitat Dome ─── */
export function HabitatDome({ position = [0, 0, 0], color = "#c7c7cc", glowColor = "#ffcc44", radius = 0.4, height = 0.3 }: {
  position?: [number, number, number]; color?: string; glowColor?: string; radius?: number; height?: number;
}) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const glow = ref.current.children[1] as Mesh;
    if (glow) glow.material.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 0.5) * 0.04;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, height * 0.5, 0]}>
        <sphereGeometry args={[radius, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} transparent opacity={0.08} roughness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, height * 0.15, 0]}>
        <cylinderGeometry args={[radius * 0.95, radius, 0.04, 16]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, height * 0.35, 0]} scale={[1, 0.3, 1]}>
        <sphereGeometry args={[radius * 0.6, 8, 8]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

/* ─── 2. Solar Array ─── */
export function SolarArray({ position = [0, 0, 0], panels = 6, span = 0.8, color = "#1a3a6a" }: {
  position?: [number, number, number]; panels?: number; span?: number; color?: string;
}) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      if (child.userData.isPanel) {
        const tilt = Math.sin(clock.getElapsedTime() * 0.1 + i * 0.5) * 0.05;
        child.rotation.x = tilt;
      }
    });
  });
  const arr = useMemo(() => Array.from({ length: panels }, (_, i) => ({
    x: (i - (panels - 1) / 2) * (span / panels),
    rot: (Math.random() - 0.5) * 0.1,
  })), [panels, span]);
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[span, 0.02, 0.02]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.2} />
      </mesh>
      {arr.map((p, i) => (
        <mesh key={i} position={[p.x, 0.04, 0]} rotation={[p.rot, 0, 0]} userData={{ isPanel: true }}>
          <boxGeometry args={[span / panels * 0.9, 0.005, 0.15]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.01, 0.04, 4]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* ─── 3. Radar Dish (rotating) ─── */
export function RadarDish({ position = [0, 0, 0], scale = 1, color = "#c88a00" }: {
  position?: [number, number, number]; scale?: number; color?: string;
}) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.5;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.2 * scale, 0]}>
        <cylinderGeometry args={[0.01 * scale, 0.01 * scale, 0.2 * scale, 4]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.3 * scale, 0]} rotation={[0.2, 0, 0]}>
        <circleGeometry args={[0.12 * scale, 16]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} emissive={color} emissiveIntensity={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.3 * scale, -0.06 * scale]}>
        <coneGeometry args={[0.02 * scale, 0.04 * scale, 6]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* ─── 4. Cryo Tank ─── */
export function CryoTank({ position = [0, 0, 0], scale = 1, color = "#4488ff" }: {
  position?: [number, number, number]; scale?: number; color?: string;
}) {
  const vaporRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!vaporRef.current) return;
    vaporRef.current.position.y = 0.15 * scale + Math.sin(clock.getElapsedTime() * 0.7) * 0.02;
    vaporRef.current.material.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 0.5) * 0.04;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.12 * scale, 0]}>
        <cylinderGeometry args={[0.06 * scale, 0.08 * scale, 0.2 * scale, 12]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.22 * scale, 0]}>
        <sphereGeometry args={[0.06 * scale, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} transparent opacity={0.5} />
      </mesh>
      <mesh ref={vaporRef} position={[0, 0.28 * scale, 0]}>
        <sphereGeometry args={[0.04 * scale, 6, 6]} />
        <meshBasicMaterial color="#aaddff" transparent opacity={0.1} />
      </mesh>
      <mesh position={[0, 0.02 * scale, 0]}>
        <cylinderGeometry args={[0.08 * scale, 0.09 * scale, 0.02 * scale, 12]} />
        <meshStandardMaterial color="#888899" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ─── 5. Drill Rig ─── */
export function DrillRig({ position = [0, 0, 0], scale = 1 }: {
  position?: [number, number, number]; scale?: number;
}) {
  const drillRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!drillRef.current) return;
    drillRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.03 * scale;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.15 * scale, 0]}>
        <cylinderGeometry args={[0.02 * scale, 0.04 * scale, 0.3 * scale, 6]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={drillRef} position={[0, 0.02 * scale, 0]}>
        <cylinderGeometry args={[0.015 * scale, 0.025 * scale, 0.08 * scale, 6]} />
        <meshStandardMaterial color="#ff6644" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.08 * scale, 0.2 * scale, 0]}>
        <boxGeometry args={[0.04 * scale, 0.04 * scale, 0.03 * scale]} />
        <meshStandardMaterial color="#c7c7cc" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ─── 6. Antenna Tower ─── */
export function AntennaTower({ position = [0, 0, 0], height = 0.4, color = "#ff4466" }: {
  position?: [number, number, number]; height?: number; color?: string;
}) {
  const lightRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    lightRef.current.material.opacity = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
  });
  return (
    <group position={position}>
      <mesh position={[0, height * 0.5, 0]}>
        <cylinderGeometry args={[0.008, 0.015, height, 4]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={lightRef} position={[0, height, 0]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

/* ─── 7. Landing Pad ─── */
export function LandingPad({ position = [0, 0, 0], scale = 1, color = "#00d4ff" }: {
  position?: [number, number, number]; scale?: number; color?: string;
}) {
  const beaconRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!beaconRef.current) return;
    beaconRef.current.material.opacity = 0.15 + Math.sin(clock.getElapsedTime() * 3) * 0.1;
    beaconRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 3) * 0.1);
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15 * scale, 0.2 * scale, 24]} />
        <meshStandardMaterial color="#334466" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.01 * scale, 0.04 * scale, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      <mesh ref={beaconRef} position={[0, 0.05 * scale, 0]}>
        <sphereGeometry args={[0.02 * scale, 6, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

/* ─── 8. Greenhouse ─── */
export function Greenhouse({ position = [0, 0, 0], color = "#44aa44" }: {
  position?: [number, number, number]; color?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.15]} />
        <meshStandardMaterial color="#888899" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.18, 0.12, 0.13]} />
        <meshStandardMaterial color={color} transparent opacity={0.06} roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.14, 0.04, 0.09]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

/* ─── 9. Research Module ─── */
export function ResearchModule({ position = [0, 0, 0], color = "#44aaff" }: {
  position?: [number, number, number]; color?: string;
}) {
  const glowRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    glowRef.current.material.opacity = 0.1 + Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.2, 0.16, 0.2]} />
        <meshStandardMaterial color="#c7c7cc" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.08, 0.105]}>
        <boxGeometry args={[0.14, 0.08, 0.01]} />
        <meshStandardMaterial color={color} transparent opacity={0.2} />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

/* ─── 10. Fuel Depot ─── */
export function FuelDepot({ position = [0, 0, 0], scale = 1 }: {
  position?: [number, number, number]; scale?: number;
}) {
  return (
    <group position={position}>
      <mesh position={[-0.06 * scale, 0.08 * scale, 0]}>
        <cylinderGeometry args={[0.05 * scale, 0.06 * scale, 0.12 * scale, 8]} />
        <meshStandardMaterial color="#ff6644" metalness={0.8} roughness={0.2} emissive="#ff6644" emissiveIntensity={0.05} />
      </mesh>
      <mesh position={[0.06 * scale, 0.06 * scale, 0]}>
        <cylinderGeometry args={[0.04 * scale, 0.05 * scale, 0.1 * scale, 8]} />
        <meshStandardMaterial color="#ffaa33" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.02 * scale, 0]}>
        <boxGeometry args={[0.16 * scale, 0.02 * scale, 0.1 * scale]} />
        <meshStandardMaterial color="#888899" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ─── 11. Cargo Container ─── */
export function CargoContainer({ position = [0, 0, 0], color = "#ff8844" }: {
  position?: [number, number, number]; color?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.15, 0.08, 0.12]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.07, 0.04, 0]}>
        <boxGeometry args={[0.01, 0.06, 0.1]} />
        <meshStandardMaterial color="#1c1c1e" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* ─── 12. Observation Tower ─── */
export function ObservationTower({ position = [0, 0, 0], height = 0.5, color = "#00d4ff" }: {
  position?: [number, number, number]; height?: number; color?: string;
}) {
  const lightRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    lightRef.current.material.opacity = 0.2 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
  });
  return (
    <group position={position}>
      <mesh position={[0, height * 0.5, 0]}>
        <cylinderGeometry args={[0.015, 0.025, height, 6]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, height - 0.02, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.08} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh ref={lightRef} position={[0, height, 0]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

/* ─── 13. Refinery ─── */
export function Refinery({ position = [0, 0, 0], scale = 1 }: {
  position?: [number, number, number]; scale?: number;
}) {
  const smokeRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!smokeRef.current) return;
    smokeRef.current.position.y = 0.15 * scale + Math.sin(clock.getElapsedTime() * 0.3) * 0.02;
    smokeRef.current.material.opacity = 0.06 + Math.sin(clock.getElapsedTime() * 0.2) * 0.03;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.06 * scale, 0]}>
        <boxGeometry args={[0.2 * scale, 0.12 * scale, 0.15 * scale]} />
        <meshStandardMaterial color="#888899" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.05 * scale, 0.14 * scale, 0]}>
        <cylinderGeometry args={[0.01 * scale, 0.015 * scale, 0.06 * scale, 6]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={smokeRef} position={[0.05 * scale, 0.18 * scale, 0]}>
        <sphereGeometry args={[0.02 * scale, 6, 6]} />
        <meshBasicMaterial color="#ffaa44" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

/* ─── 14. Telescope Array ─── */
export function TelescopeArray({ position = [0, 0, 0], scale = 1, color = "#aa66ff" }: {
  position?: [number, number, number]; scale?: number; color?: string;
}) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      if (child.userData.isTelescope) {
        child.rotation.y = clock.getElapsedTime() * 0.1 + i * 0.5;
        child.rotation.x = Math.sin(clock.getElapsedTime() * 0.05 + i) * 0.2;
      }
    });
  });
  return (
    <group ref={ref} position={position}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[(i - 1) * 0.12 * scale, 0, 0]} userData={{ isTelescope: true }}>
          <mesh position={[0, 0.06 * scale, 0]}>
            <cylinderGeometry args={[0.005 * scale, 0.005 * scale, 0.1 * scale, 4]} />
            <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.12 * scale, 0]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.025 * scale, 0.035 * scale, 0.08 * scale, 8]} />
            <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── 15. Launch Pad (with rocket) ─── */
export function LaunchPad({ position = [0, 0, 0], scale = 1 }: {
  position?: [number, number, number]; scale?: number;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.15 * scale, 0.18 * scale, 0.02 * scale, 16]} />
        <meshStandardMaterial color="#334466" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.2 * scale, 0]}>
        <cylinderGeometry args={[0.02 * scale, 0.025 * scale, 0.3 * scale, 8]} />
        <meshStandardMaterial color="#c7c7cc" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.35 * scale, 0]}>
        <coneGeometry args={[0.025 * scale, 0.06 * scale, 8]} />
        <meshStandardMaterial color="#ff6644" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* ─── 16. Geothermal Vent ─── */
export function GeothermalVent({ position = [0, 0, 0], scale = 1, color = "#ff6600" }: {
  position?: [number, number, number]; scale?: number; color?: string;
}) {
  const steamRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!steamRef.current) return;
    steamRef.current.position.y = 0.06 * scale + Math.sin(clock.getElapsedTime() * 0.8) * 0.03;
    steamRef.current.material.opacity = 0.1 + Math.sin(clock.getElapsedTime() * 0.6) * 0.05;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.02 * scale, 0]}>
        <cylinderGeometry args={[0.04 * scale, 0.06 * scale, 0.04 * scale, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} />
      </mesh>
      <mesh ref={steamRef} position={[0, 0.08 * scale, 0]}>
        <sphereGeometry args={[0.03 * scale, 6, 6]} />
        <meshBasicMaterial color="#ffaa44" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

/* ─── 17. Hab Ring (rotating) ─── */
export function HabRing({ position = [0, 0, 0], radius = 0.3, scale = 1 }: {
  position?: [number, number, number]; radius?: number; scale?: number;
}) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * 0.3;
  });
  const segments = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * Math.PI * 2,
  })), []);
  return (
    <group ref={ref} position={position}>
      <mesh>
        <torusGeometry args={[radius * scale, 0.015 * scale, 8, 24]} />
        <meshStandardMaterial color="#c7c7cc" metalness={0.6} roughness={0.3} />
      </mesh>
      {segments.map((s, i) => (
        <mesh key={i} position={[Math.cos(s.angle) * radius * scale, Math.sin(s.angle) * radius * scale, 0]}>
          <boxGeometry args={[0.04 * scale, 0.04 * scale, 0.04 * scale]} />
          <meshStandardMaterial color="#00d4ff" transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── 18. Communication Array ─── */
export function CommunicationArray({ position = [0, 0, 0], scale = 1 }: {
  position?: [number, number, number]; scale?: number;
}) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.2;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.15 * scale, 0]}>
        <cylinderGeometry args={[0.01 * scale, 0.015 * scale, 0.3 * scale, 4]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.2} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.12 * scale, 0.15 * scale, Math.sin(a) * 0.12 * scale]}>
            <boxGeometry args={[0.08 * scale, 0.005 * scale, 0.02 * scale]} />
            <meshStandardMaterial color="#00d4ff" transparent opacity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ─── 19. Power Core ─── */
export function PowerCore({ position = [0, 0, 0], scale = 1, color = "#00d4ff" }: {
  position?: [number, number, number]; scale?: number; color?: string;
}) {
  const coreRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!coreRef.current) return;
    coreRef.current.material.opacity = 0.15 + Math.sin(clock.getElapsedTime() * 1.5) * 0.1;
    coreRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.05);
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.06 * scale, 0]}>
        <cylinderGeometry args={[0.08 * scale, 0.09 * scale, 0.1 * scale, 8]} />
        <meshStandardMaterial color="#1c1c1e" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={coreRef} position={[0, 0.06 * scale, 0]}>
        <sphereGeometry args={[0.04 * scale, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 0.02 * scale, 0]}>
        <cylinderGeometry args={[0.09 * scale, 0.1 * scale, 0.02 * scale, 8]} />
        <meshStandardMaterial color="#888899" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ─── 20. Suspension Bridge ─── */
export function SuspensionBridge({ position = [0, 0, 0], span = 0.8, color = "#888899" }: {
  position?: [number, number, number]; span?: number; color?: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[span, 0.01, 0.04]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * span * 0.5, 0.06, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.1, 4]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[span * 0.8, 0.005, 0.005]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

/* ─── 21. Water Treatment ─── */
export function WaterTreatment({ position = [0, 0, 0], scale = 1 }: {
  position?: [number, number, number]; scale?: number;
}) {
  const waterRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!waterRef.current) return;
    waterRef.current.material.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 0.5) * 0.04;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.06 * scale, 0]}>
        <cylinderGeometry args={[0.08 * scale, 0.09 * scale, 0.1 * scale, 8]} />
        <meshStandardMaterial color="#888899" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh ref={waterRef} position={[0, 0.08 * scale, 0]}>
        <cylinderGeometry args={[0.06 * scale, 0.06 * scale, 0.02 * scale, 8]} />
        <meshBasicMaterial color="#44aaff" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

/* ─── 22. Battery Farm ─── */
export function BatteryFarm({ position = [0, 0, 0], scale = 1 }: {
  position?: [number, number, number]; scale?: number;
}) {
  return (
    <group position={position}>
      {[-1, 0, 1].map((x) => (
        <mesh key={x} position={[x * 0.06 * scale, 0.03 * scale, 0]}>
          <boxGeometry args={[0.04 * scale, 0.06 * scale, 0.04 * scale]} />
          <meshStandardMaterial color="#00d4ff" metalness={0.8} roughness={0.2} emissive="#00d4ff" emissiveIntensity={0.05} />
        </mesh>
      ))}
      <mesh position={[0, 0.01 * scale, 0]}>
        <boxGeometry args={[0.22 * scale, 0.02 * scale, 0.06 * scale]} />
        <meshStandardMaterial color="#1c1c1e" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ─── 23. Airlock ─── */
export function Airlock({ position = [0, 0, 0], color = "#ff6644" }: {
  position?: [number, number, number]; color?: string;
}) {
  const lightRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    lightRef.current.material.opacity = 0.2 + Math.sin(clock.getElapsedTime() * 1.5) * 0.15;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.12, 8]} />
        <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.06, 0.065]}>
        <ringGeometry args={[0.04, 0.055, 12]} />
        <meshStandardMaterial color="#1c1c1e" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={lightRef} position={[0.06, 0.06, 0]}>
        <sphereGeometry args={[0.008, 6, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

/* ─── 24. Mining Conveyor ─── */
export function MiningConveyor({ position = [0, 0, 0], length = 0.4, scale = 1 }: {
  position?: [number, number, number]; length?: number; scale?: number;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02 * scale, 0]}>
        <boxGeometry args={[length * scale, 0.01 * scale, 0.06 * scale]} />
        <meshStandardMaterial color="#888899" metalness={0.6} roughness={0.3} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * length * 0.5 * scale, 0.04 * scale, 0]}>
          <cylinderGeometry args={[0.01 * scale, 0.01 * scale, 0.06 * scale, 6]} />
          <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── 25. Ice Cutter ─── */
export function IceCutter({ position = [0, 0, 0], scale = 1 }: {
  position?: [number, number, number]; scale?: number;
}) {
  const bladeRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!bladeRef.current) return;
    bladeRef.current.rotation.x += delta * 2;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.04 * scale, 0]}>
        <boxGeometry args={[0.12 * scale, 0.04 * scale, 0.08 * scale]} />
        <meshStandardMaterial color="#888899" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh ref={bladeRef} position={[0, 0.02 * scale, 0.06 * scale]}>
        <cylinderGeometry args={[0.01 * scale, 0.01 * scale, 0.04 * scale, 4]} />
        <meshStandardMaterial color="#00d4ff" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}