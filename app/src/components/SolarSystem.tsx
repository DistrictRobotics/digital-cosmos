import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Html, useFBO, useAspect } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh, Group, Points, Camera } from "three";
import PlanetWorlds from "./planet-worlds/PlanetWorlds";
import WebGpuCanvas from "./WebGpuCanvas";
import RendererEffects from "./RendererEffects";

/* ─── CONFIG ─── */
const PLANET_POSITIONS: Record<string, THREE.Vector3> = {};

/* ─── SATELLITE CONSTELLATIONS (simulated orbital mechanics) ─── */
function generateSatellitePositions(group: string, count: number, time: number): Float32Array {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const seed = i / count;
    let orbitR: number, tilt: number, speed: number;
    switch (group) {
      case "starlink": orbitR = 6.8 + seed * 0.4; tilt = 0.1 + seed * 0.15; speed = 1.5 + seed * 0.3; break;
      case "gps":      orbitR = 8.5 + seed * 0.6; tilt = 0.3 + seed * 0.2; speed = 0.8 + seed * 0.1; break;
      case "iss":      orbitR = 6.6; tilt = 0.4; speed = 2.0; break;
      case "hubble":   orbitR = 6.7; tilt = 0.2; speed = 1.2; break;
      case "cubesat":  orbitR = 6.2 + seed * 0.5; tilt = 0.05 + seed * 0.3; speed = 1.2 + seed * 0.5; break;
      default:         orbitR = 7 + seed; tilt = 0.2; speed = 1; break;
    }
    const phase = seed * Math.PI * 2 + i * 0.3;
    const angle = phase + time * speed * 0.5;
    pos[i * 3] = orbitR * Math.cos(angle);
    pos[i * 3 + 1] = orbitR * Math.sin(tilt) * Math.sin(angle * 0.7 + time * 0.2);
    pos[i * 3 + 2] = orbitR * Math.sin(angle);
  }
  return pos;
}

const CONSTELLATION_COLORS: Record<string, string> = {
  starlink: "#00bbdd", gps: "#44ff88", iss: "#ff8844", hubble: "#aa66ff", cubesat: "#ffcc00",
};

function SatelliteConstellations({ feedVisible }: { feedVisible: Record<string, boolean> }) {
  const pointsRef = useRef<Points>(null);
  const [geom, setGeom] = useState<THREE.BufferGeometry | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const entries = Object.entries(feedVisible).filter(([, v]) => v);
    if (entries.length === 0) { setGeom(null); return; }

    const total = entries.reduce((s, [g]) => s + (g === "starlink" ? 42 : g === "gps" ? 31 : g === "cubesat" ? 18 : g === "iss" ? 1 : g === "hubble" ? 1 : 0), 0);
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    let idx = 0;
    for (const [group, visible] of entries) {
      if (!visible) continue;
      const count = group === "starlink" ? 42 : group === "gps" ? 31 : group === "cubesat" ? 18 : 1;
      const positions = generateSatellitePositions(group, count, t);
      const hex = CONSTELLATION_COLORS[group] || "#ffffff";
      const c = new THREE.Color(hex);
      for (let i = 0; i < count; i++) {
        pos[idx * 3] = positions[i * 3];
        pos[idx * 3 + 1] = positions[i * 3 + 1];
        pos[idx * 3 + 2] = positions[i * 3 + 2];
        col[idx * 3] = c.r;
        col[idx * 3 + 1] = c.g;
        col[idx * 3 + 2] = c.b;
        idx++;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    setGeom(g);
  });

  if (!geom) return null;
  return (
    <points geometry={geom}>
      <pointsMaterial size={0.15} vertexColors sizeAttenuation transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ─── STAR FIELD ─── */
function StarField({ count = 5000 }) {
  const ref = useRef<Points>(null);
  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const radius = 200 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
      const c = 0.4 + Math.random() * 0.6;
      col[i * 3] = c;
      col[i * 3 + 1] = c;
      col[i * 3 + 2] = c + Math.random() * 0.15;
      siz[i] = 0.5 + Math.random() * 2.5;
    }
    return [pos, col, siz];
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.002;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial size={1.5} vertexColors sizeAttenuation transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ─── NEBULA CLOUDS ─── */
function NebulaClouds() {
  const group = useRef<Group>(null);
  const meshes = useMemo(() => {
    const m = [];
    for (let i = 0; i < 8; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 120 + Math.random() * 200;
      m.push({
        position: [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta) * 0.3, r * Math.cos(phi)],
        scale: 30 + Math.random() * 60,
        color: i % 3 === 0 ? "#00d4ff" : i % 3 === 1 ? "#6366f1" : "#ff66aa",
        opacity: 0.02 + Math.random() * 0.03,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      });
    }
    return m;
  }, []);

  return (
    <group ref={group}>
      {meshes.map((m, i) => (
        <mesh key={i} position={m.position as any} scale={m.scale} rotation={m.rotation as any}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={m.color} transparent opacity={m.opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── SUN ─── */
function CosmicSun() {
  const meshRef = useRef<Mesh>(null);
  const coronaRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) meshRef.current.rotation.y = t * 0.03;
    if (coronaRef.current) {
      coronaRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
      coronaRef.current.rotation.y = t * 0.05;
      const s = 1 + Math.sin(t * 0.5) * 0.02;
      coronaRef.current.scale.setScalar(s);
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 0.3) * 0.03;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color="#ffcc33" />
      </mesh>
      {/* Corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[5, 24, 24]} />
        <meshBasicMaterial color="#ff8844" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[6.5, 24, 24]} />
        <meshBasicMaterial color="#ff6622" transparent opacity={0.06} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Light */}
      <pointLight intensity={2.5} distance={400} decay={0.8} color="#ffcc33" />
    </group>
  );
}

/* ─── PLANET ─── */
function Planet({
  name, radius, orbitRadius, speed, color, emissive, emissiveIntensity, ring, tilt, onClick, focusPlanet, onHover,
}: {
  name: string; radius: number; orbitRadius: number; speed: number; color: string;
  emissive?: string; emissiveIntensity?: number; ring?: boolean; tilt?: number;
  onClick: (n: string) => void; focusPlanet: string | null; onHover: (n: string | null, x?: number, y?: number) => void;
}) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  const labelRef = useRef<THREE.Sprite>(null);

  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const angle = t * speed * 0.3;
    groupRef.current.position.x = orbitRadius * Math.cos(angle);
    groupRef.current.position.z = orbitRadius * Math.sin(angle);
    if (meshRef.current && !focusPlanet) meshRef.current.rotation.y = t * 0.5;
    if (ringRef.current) ringRef.current.rotation.z = 0.3;

    PLANET_POSITIONS[name] = groupRef.current.position.clone();

    // Labels face camera
    if (labelRef.current) {
      labelRef.current.lookAt(camera.position);
    }
  });

  const isFocused = focusPlanet === name;
  const scale = isFocused ? 1 : 1;
  const pos = useMemo(() => new THREE.Vector3(orbitRadius, 0, 0), [orbitRadius]);

  return (
    <group ref={groupRef} position={pos}>
      {/* Clickable sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(name); }}
        onPointerOver={(e) => { e.stopPropagation(); onHover(name, e.pointer.x, e.pointer.y); }}
        onPointerOut={() => onHover(null)}
        scale={scale}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive || color}
          emissiveIntensity={isFocused ? 0.15 : (emissiveIntensity || 0.05)}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Ring (Saturn) */}
      {ring && (
        <mesh ref={ringRef} rotation-x={Math.PI / 2 + (tilt || 0.4)}>
          <ringGeometry args={[radius * 1.4, radius * 2.2, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}

      {/* Label sprite */}
      <sprite ref={labelRef} scale={[4, 2, 1]} position={[0, -radius - 1.2, 0]}>
        <spriteMaterial transparent opacity={isFocused ? 0.9 : 0.4}>
        </spriteMaterial>
      </sprite>
    </group>
  );
}

/* ─── COSMIC EARTH ─── */
function CosmicEarth({ onClick, focusPlanet, onHover }: { onClick: (n: string) => void; focusPlanet: string | null; onHover: (n: string | null) => void }) {
  const meshRef = useRef<Mesh>(null);
  const cloudRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = t * 0.5 * 0.3;
    if (meshRef.current) {
      meshRef.current.position.x = 22 * Math.cos(angle);
      meshRef.current.position.z = 22 * Math.sin(angle);
      meshRef.current.rotation.y = t * 0.15;
    }
    if (cloudRef.current) {
      cloudRef.current.position.copy(meshRef.current?.position || new THREE.Vector3(22, 0, 0));
      cloudRef.current.rotation.y = t * 0.2;
    }
    if (glowRef.current) {
      glowRef.current.position.copy(meshRef.current?.position || new THREE.Vector3(22, 0, 0));
      const s = 1 + Math.sin(t * 0.5) * 0.02;
      glowRef.current.scale.setScalar(s);
    }
    if (meshRef.current) PLANET_POSITIONS["Earth"] = meshRef.current.position.clone();
  });

  return (
    <group>
      {/* Planet */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick("Earth"); }}
        onPointerOver={(e) => onHover("Earth")}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[1.8, 48, 48]} />
        <meshStandardMaterial color="#1a6bff" emissive="#1a6bff" emissiveIntensity={focusPlanet === "Earth" ? 0.15 : 0.04} metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Cloud layer */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.85, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.2, 24, 24]} />
        <meshBasicMaterial color="#4488ff" transparent opacity={0.06} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

/* ─── ORBIT LINE ─── */
function OrbitRing({ radius, color }: { radius: number; color?: string }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(radius * Math.cos(a), 0, radius * Math.sin(a)));
    }
    return pts;
  }, [radius]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color || "rgba(0,212,255,0.08)"} transparent opacity={0.3} depthWrite={false} />
    </line>
  );
}

/* ─── CINEMATIC CAMERA ─── */
function CinematicCamera({ focusPlanet, introDone }: { focusPlanet: string | null; introDone: boolean }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 50, 180));
  const startPos = useRef(new THREE.Vector3(0, 50, 180));
  const lerpProgress = useRef(0);
  const isAnimating = useRef(false);
  const prevFocus = useRef<string | null>(null);

  useEffect(() => {
    if (focusPlanet && focusPlanet !== prevFocus.current) {
      const pos = PLANET_POSITIONS[focusPlanet];
      if (pos) {
        startPos.current.copy(camera.position);
        const dist = focusPlanet === "Sun" ? 25 : focusPlanet === "Jupiter" ? 20 : focusPlanet === "Saturn" ? 18 : 10;
        targetPos.current.set(pos.x + dist, pos.y + dist * 0.5, pos.z + dist);
        lerpProgress.current = 0;
        isAnimating.current = true;
      }
    } else if (!focusPlanet && prevFocus.current) {
      startPos.current.copy(camera.position);
      targetPos.current.set(0, 50, 180);
      lerpProgress.current = 0;
      isAnimating.current = true;
    }
    prevFocus.current = focusPlanet;
  }, [focusPlanet, camera]);

  useFrame((_, delta) => {
    if (isAnimating.current) {
      lerpProgress.current = Math.min(lerpProgress.current + delta * 1.5, 1);
      const t = lerpProgress.current;
      const smooth = t * t * (3 - 2 * t);
      camera.position.lerpVectors(startPos.current, targetPos.current, smooth);
      if (focusPlanet && PLANET_POSITIONS[focusPlanet]) {
        camera.lookAt(PLANET_POSITIONS[focusPlanet]);
      } else {
        camera.lookAt(0, 0, 0);
      }
      if (t >= 1) isAnimating.current = false;
    } else if (focusPlanet && PLANET_POSITIONS[focusPlanet]) {
      camera.lookAt(PLANET_POSITIONS[focusPlanet]);
    } else {
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

/* ─── HOLOGRAPHIC GRID ─── */
function HolographicGrid({ visible }: { visible: boolean }) {
  const ref = useRef<Group>(null);
  if (!visible) return null;
  return (
    <group ref={ref} position={[25, 3, 0]}>
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[2.5, 3.5, 48]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[3.5, 4.5, 48]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} rotation-y={(i / 6) * Math.PI * 2}>
          <cylinderGeometry args={[0.02, 0.02, 5, 1]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.1} />
        </mesh>
      ))}
      <Html position={[0, 5.5, 0]} center>
        <div className="text-center">
          <div className="text-[10px] font-mono tracking-[0.3em]" style={{ color: "rgba(0,212,255,0.5)" }}>DREV GLOBAL STEM NETWORK</div>
          <div className="flex gap-2 mt-1 justify-center">
            {["LHR", "JFK", "NRT", "DXB"].map((c) => (
              <span key={c} className="text-[8px] font-mono" style={{ color: "rgba(0,212,255,0.3)" }}>{c}</span>
            ))}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ─── WORLD RENDERER ─── */
function WorldRenderer({ focusPlanet }: { focusPlanet: string | null }) {
  const { camera } = useThree();
  const worldRef = useRef<Group>(null);

  useFrame(() => {
    if (!focusPlanet || !worldRef.current) {
      if (worldRef.current) worldRef.current.visible = false;
      return;
    }
    const pos = PLANET_POSITIONS[focusPlanet];
    if (pos) {
      worldRef.current.visible = true;
      worldRef.current.position.copy(pos);
    }
  });

  return (
    <group ref={worldRef} visible={false}>
      <PlanetWorlds focusPlanet={focusPlanet} />
    </group>
  );
}

/* ─── ORBIT RINGS ─── */
function OrbitRings() {
  const orbits = [
    { r: 10, color: "rgba(176,160,144,0.15)" },
    { r: 16, color: "rgba(232,200,120,0.15)" },
    { r: 22, color: "rgba(68,136,204,0.15)" },
    { r: 35, color: "rgba(196,68,46,0.15)" },
    { r: 50, color: "rgba(212,160,106,0.12)" },
    { r: 68, color: "rgba(232,213,160,0.12)" },
    { r: 85, color: "rgba(126,200,227,0.10)" },
    { r: 100, color: "rgba(51,85,170,0.10)" },
  ];

  return (
    <group>
      {orbits.map((o) => (
        <OrbitRing key={o.r} radius={o.r} color={o.color} />
      ))}
    </group>
  );
}

/* ─── MAIN SCENE ─── */
export default function SolarSystemScene({
  focusPlanet,
  onPlanetClick,
  onHover,
  feedVisible,
  introDone: parentIntroDone,
}: {
  focusPlanet: string | null;
  onPlanetClick: (n: string) => void;
  onHover: (n: string | null, x?: number, y?: number) => void;
  feedVisible: Record<string, boolean>;
  introDone: boolean;
}) {
  const [showHolographic, setShowHolographic] = useState(false);

  useEffect(() => {
    setShowHolographic(focusPlanet === "Earth");
  }, [focusPlanet]);

  return (
    <div className="fixed inset-0 z-0">
      <WebGpuCanvas camera={{ position: [0, 50, 180], fov: 55, near: 0.1, far: 1500 }}>
        <ambientLight intensity={0.08} />
        <fog attach="fog" args={["#000000", 200, 1000]} />

        <StarField count={5000} />
        <NebulaClouds />
        <CosmicSun />

        <OrbitRings />

        {/* Satellite constellations (like drev.space feed chips) */}
        <SatelliteConstellations feedVisible={feedVisible} />

        <Planet name="Mercury" radius={0.6} orbitRadius={10} speed={0.6} color="#b0a090" focusPlanet={focusPlanet} onClick={onPlanetClick} onHover={onHover} />
        <Planet name="Venus" radius={0.9} orbitRadius={16} speed={0.45} color="#e8c878" focusPlanet={focusPlanet} onClick={onPlanetClick} onHover={onHover} />
        <CosmicEarth onClick={onPlanetClick} focusPlanet={focusPlanet} onHover={onHover} />
        <Planet name="Mars" radius={0.8} orbitRadius={35} speed={0.35} color="#d4513a" focusPlanet={focusPlanet} onClick={onPlanetClick} onHover={onHover} />
        <Planet name="Jupiter" radius={2.5} orbitRadius={50} speed={0.2} color="#d4a06a" emissive="#d4a06a" emissiveIntensity={0.02} focusPlanet={focusPlanet} onClick={onPlanetClick} onHover={onHover} />
        <Planet name="Saturn" radius={2.0} orbitRadius={68} speed={0.15} color="#e8d5a0" ring tilt={0.4} focusPlanet={focusPlanet} onClick={onPlanetClick} onHover={onHover} />
        <Planet name="Uranus" radius={1.5} orbitRadius={85} speed={0.1} color="#7ec8e3" tilt={1.7} focusPlanet={focusPlanet} onClick={onPlanetClick} onHover={onHover} />
        <Planet name="Neptune" radius={1.4} orbitRadius={100} speed={0.08} color="#3355aa" focusPlanet={focusPlanet} onClick={onPlanetClick} onHover={onHover} />

        <HolographicGrid visible={showHolographic} />
        <WorldRenderer focusPlanet={focusPlanet} />
        <CinematicCamera focusPlanet={focusPlanet} introDone={parentIntroDone} />
        <RendererEffects />
      </WebGpuCanvas>
    </div>
  );
}
