import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";
import {
  ProceduralTerrain,
  Building,
  GroundVehicle,
  FlyingVehicle,
  CityBlock,
  AtmosphericRing,
} from "../shared";

/* ─── EARTH LANDABLE WORLD ─── */
/* Futuristic city network: downtown core, port district, suburbs, highway loop */

function HighwayLoop({ radius = 22 }: { radius?: number }) {
  const segments = 64;
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push([Math.cos(theta) * radius, 0.05, Math.sin(theta) * radius]);
    }
    return pts;
  }, [radius]);

  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));

  return (
    <mesh>
      <tubeGeometry args={[curve, segments, 0.15, 4, false]} />
      <meshBasicMaterial color="#334466" transparent opacity={0.6} />
    </mesh>
  );
}

function HighwayVehicles({ radius = 22 }: { radius?: number }) {
  const vehicles = useMemo(() => {
    const arr = [];
    const segments = 64;
    for (let v = 0; v < 12; v++) {
      const pts: [number, number, number][] = [];
      const offset = (v / 12) * Math.PI * 2;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2 + offset;
        pts.push([Math.cos(theta) * radius, 0.05, Math.sin(theta) * radius]);
      }
      arr.push({ path: pts, speed: 0.3 + Math.random() * 0.4, color: ["#00d4ff", "#ff6644", "#44ff88", "#ffcc00"][v % 4], offset: Math.random() });
    }
    return arr;
  }, [radius]);

  return (
    <group>
      {vehicles.map((v, i) => (
        <GroundVehicle key={i} path={v.path} speed={v.speed} color={v.color} offset={v.offset} />
      ))}
    </group>
  );
}

function CentralTower({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + 5 + Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
    }
  });
  return (
    <group position={position}>
      {/* Main spire */}
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.8, 6, 12]} />
        <meshStandardMaterial color="#4488cc" metalness={0.8} roughness={0.2} emissive="#4488cc" emissiveIntensity={0.05} />
      </mesh>
      {/* Crown */}
      <mesh ref={ref} position={[0, 6.3, 0]}>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
      </mesh>
      {/* Holographic ring */}
      <mesh position={[0, 5, 0]} rotation-x={Math.PI / 2}>
        <ringGeometry args={[0.6, 0.8, 24]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function PortDistrict({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Landing pads */}
      {[[-3, 0, -3], [3, 0, -3], [-3, 0, 3], [3, 0, 3], [0, 0, 4.5]].map((p, i) => (
        <group key={i} position={p as any}>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
            <circleGeometry args={[0.8, 16]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
            <ringGeometry args={[0.7, 0.75, 24]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {/* Control tower */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 1.2, 8]} />
        <meshStandardMaterial color="#223344" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[0.5, 0.1, 0.5]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function ParkDistrict({ position }: { position: [number, number, number] }) {
  const trees = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 8;
      arr.push({ x, z, s: 0.2 + Math.random() * 0.3 });
    }
    return arr;
  }, []);
  return (
    <group position={position}>
      <mesh position={[0, -0.02, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[4, 16]} />
        <meshBasicMaterial color="#1a4a2a" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh position={[0, t.s * 0.4, 0]}>
            <coneGeometry args={[t.s * 0.3, t.s * 0.8, 6]} />
            <meshStandardMaterial color="#2a6a3a" roughness={0.9} />
          </mesh>
          <mesh position={[0, t.s * 0.15, 0]}>
            <cylinderGeometry args={[0.02, 0.03, t.s * 0.3]} />
            <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── FLYING TAXIS ─── */
function AirTaxis() {
  const taxis = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      arr.push({
        position: [(Math.random() - 0.5) * 30, 3 + Math.random() * 4, (Math.random() - 0.5) * 30],
        radius: 3 + Math.random() * 6,
        speed: 0.2 + Math.random() * 0.4,
        height: 2 + Math.random() * 3,
        color: ["#00d4ff", "#44ff88", "#ffcc00", "#ff6644"][i % 4],
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {taxis.map((t, i) => (
        <FlyingVehicle key={i} position={t.position} radius={t.radius} speed={t.speed} height={t.height} color={t.color} />
      ))}
    </group>
  );
}

/* ─── GLOBAL STEM LABELS (3D sprites) ─── */
function STEMLabels() {
  const labels = useMemo(() => [
    { pos: [-15, 1.5, -10], text: "DREV HQ" },
    { pos: [12, 1.5, 8], text: "STEM LAB α" },
    { pos: [-8, 1.5, 14], text: "R&D CENTER" },
    { pos: [14, 1.5, -12], text: "AI RESEARCH" },
  ], []);
  return (
    <group>
      {labels.map((l, i) => (
        <sprite key={i} position={l.pos} scale={[2, 0.5, 1]}>
          <spriteMaterial>
            <canvasTexture attach="map" args={[(() => {
              const c = document.createElement("canvas");
              c.width = 512;
              c.height = 128;
              const ctx = c.getContext("2d")!;
              ctx.fillStyle = "rgba(0,212,255,0.6)";
              ctx.font = "bold 32px monospace";
              ctx.textAlign = "center";
              ctx.fillText(l.text, 256, 70);
              return c;
            })()]} />
          </spriteMaterial>
        </sprite>
      ))}
    </group>
  );
}

/* ─── LANDING PADS (player spawn points) ─── */
function LandingPads() {
  const pads = useMemo(() => [
    { pos: [0, 0.05, 0], color: "#00d4ff" },
    { pos: [15, 0.05, -10], color: "#ffcc00" },
    { pos: [-12, 0.05, 12], color: "#44ff88" },
  ], []);
  return (
    <group>
      {pads.map((p, i) => (
        <group key={i} position={p.pos}>
          <mesh rotation-x={-Math.PI / 2}>
            <ringGeometry args={[1.2, 1.5, 32]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2}>
            <ringGeometry args={[1.3, 1.4, 32]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.3]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── EARTH WORLD EXPORT ─── */
export default function EarthWorld() {
  return (
    <group>
      {/* Ground */}
      <ProceduralTerrain width={60} depth={60} color="#1a2a3a" heightScale={0.3} bumps={8} />
      <AtmosphericRing radius={14} color="#4488ff" opacity={0.03} />

      {/* Downtown core */}
      <CityBlock position={[0, 0, 0]} size={8} density={5} colorBase="#2a3a5a" />

      {/* Central tower */}
      <CentralTower position={[0, 0, 0]} />

      {/* Surrounding blocks */}
      <CityBlock position={[-10, 0, -8]} size={6} density={3} colorBase="#2a3a4a" />
      <CityBlock position={[10, 0, 8]} size={6} density={3} colorBase="#2a3a4a" />
      <CityBlock position={[8, 0, -10]} size={5} density={3} colorBase="#2a3a4a" />
      <CityBlock position={[-8, 0, 10]} size={5} density={3} colorBase="#2a3a4a" />

      {/* Port district */}
      <PortDistrict position={[12, 0, -10]} />

      {/* Park */}
      <ParkDistrict position={[-10, 0, 10]} />

      {/* Highway */}
      <HighwayLoop radius={22} />
      <HighwayVehicles radius={22} />

      {/* Scattered buildings */}
      {[[-15, 0, -5], [15, 0, 5], [5, 0, -15], [-5, 0, 15], [18, 0, -2], [-18, 0, 2], [2, 0, -18], [-2, 0, 18]].map((p, i) => (
        <Building key={i} position={p as any} w={0.8 + Math.random() * 0.5} h={1.5 + Math.random() * 2} d={0.8 + Math.random() * 0.5} color="#2a3a5a" windowCount={2} />
      ))}

      {/* Air traffic */}
      <AirTaxis />

      {/* STEM labels */}
      <STEMLabels />

      {/* Landing pads */}
      <LandingPads />

      {/* Directional light */}
      <directionalLight position={[10, 15, 10]} intensity={0.4} color="#4488ff" />
      <ambientLight intensity={0.2} color="#224466" />
    </group>
  );
}
