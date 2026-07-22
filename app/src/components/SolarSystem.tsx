import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Html, useFBO, useAspect } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Mesh, Group, Points, Camera } from "three";
import PlanetWorlds from "./planet-worlds/PlanetWorlds";

/* ─── CONFIG ─── */
const PLANET_POSITIONS: Record<string, THREE.Vector3> = {};

/* ─── POST-PROCESSING ─── */
function Effects() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.7} intensity={0.8} />
      <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} />
      <Vignette eskil={false} offset={0.3} darkness={0.6} />
    </EffectComposer>
  );
}

/* ─── STAR FIELD (volumetric) ─── */
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
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.002;
    }
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

/* ─── SUN (with animated corona shader) ─── */
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
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.05);
    }
  });

  return (
    <group>
      {/* Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshStandardMaterial color="#ffa033" emissive="#ff6600" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* Inner corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[9.5, 32, 32]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[14, 24, 24]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.04} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Solar flare particles */}
      <pointLight intensity={300} distance={400} decay={1.5} color="#ffaa44" />
    </group>
  );
}

/* ─── PLANET ─── */
interface PlanetProps {
  name: string;
  radius: number;
  orbitRadius: number;
  speed: number;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  ring?: boolean;
  tilt?: number;
  onClick?: (name: string) => void;
  focusPlanet?: string | null;
}

function Planet({ name, radius, orbitRadius, speed, color, emissive, emissiveIntensity = 0, ring, tilt = 0, onClick, focusPlanet }: PlanetProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const isFocused = focusPlanet === name;

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * speed;
      groupRef.current.position.x = Math.cos(t) * orbitRadius;
      groupRef.current.position.z = Math.sin(t) * orbitRadius;
      PLANET_POSITIONS[name] = groupRef.current.position.clone();
      if (tilt) groupRef.current.rotation.z = tilt;
      const targetScale = isFocused ? 3 : hovered ? 1.5 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
    }
    if (meshRef.current) meshRef.current.rotation.y += 0.01;
    if (ringRef.current) ringRef.current.rotation.z += 0.005;
  });

  return (
    <group ref={groupRef}>
      {!isFocused && (
        <mesh rotation-x={-Math.PI / 2}>
          <ringGeometry args={[orbitRadius - 0.1, orbitRadius + 0.1, 128]} />
          <meshBasicMaterial color={color} transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      <mesh
        ref={meshRef}
        onClick={() => onClick?.(name)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive || color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      {ring && (
        <mesh ref={ringRef} rotation-x={Math.PI / 3}>
          <ringGeometry args={[radius * 1.5, radius * 2.8, 64]} />
          <meshBasicMaterial color="#c8a87c" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      {(hovered || isFocused) && (
        <Html position={[0, radius + 1.5, 0]} center>
          <div className="px-2 py-1 text-xs font-mono text-white bg-black/60 backdrop-blur rounded border border-white/20 whitespace-nowrap">{name}</div>
        </Html>
      )}
    </group>
  );
}

/* ─── EARTH (with city lights + atmosphere) ─── */
function CosmicEarth({ onClick, focusPlanet }: { onClick: (n: string) => void; focusPlanet?: string | null }) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const cloudRef = useRef<Mesh>(null);
  const lightsRef = useRef<Points>(null);
  const isFocused = focusPlanet === "Earth";

  const [lightPositions, lightColors] = useMemo(() => {
    const pos = [];
    const col = [];
    for (let i = 0; i < 300; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.85;
      pos.push(r * Math.sin(phi) * Math.cos(theta));
      pos.push(r * Math.sin(phi) * Math.sin(theta));
      pos.push(r * Math.cos(phi));
      const bright = 0.3 + Math.random() * 0.7;
      col.push(bright, bright * 0.6, bright * 0.2);
    }
    return [new Float32Array(pos), new Float32Array(col)];
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 0.3;
      groupRef.current.position.x = Math.cos(t) * 25;
      groupRef.current.position.z = Math.sin(t) * 25;
      PLANET_POSITIONS["Earth"] = groupRef.current.position.clone();
      const targetScale = isFocused ? 4 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
    }
    if (meshRef.current) meshRef.current.rotation.y += 0.008;
    if (cloudRef.current) cloudRef.current.rotation.y += 0.012;
    if (lightsRef.current) lightsRef.current.rotation.y += 0.008;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} onClick={() => onClick("Earth")}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial color="#1a6bff" emissive="#1a6bff" emissiveIntensity={0.08} metalness={0.1} roughness={0.8} />
      </mesh>
      {/* City lights */}
      <points ref={lightsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lightPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lightColors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} vertexColors sizeAttenuation transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      {/* Cloud layer */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.85, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} depthWrite={false} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#4488ff" transparent opacity={0.03} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

/* ─── CINEMATIC CAMERA ─── */
function CinematicCamera({ focusPlanet, introDone }: { focusPlanet: string | null; introDone: boolean }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const animating = useRef(false);
  const targetPos = useRef(new THREE.Vector3(0, 30, 60));
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (!introDone) {
      // Start position: far away
      camera.position.set(0, 50, 180);
      camera.lookAt(0, 0, 0);
      targetPos.current.set(0, 30, 60);
    }
  }, [introDone, camera]);

  useEffect(() => {
    if (!focusPlanet || !introDone) return;
    animating.current = true;
    const planetPos = PLANET_POSITIONS[focusPlanet];
    if (!planetPos) return;

    const start = camera.position.clone();
    const end = new THREE.Vector3(
      planetPos.x + 8 + (focusPlanet === "Earth" ? 4 : 0),
      planetPos.y + 4,
      planetPos.z + 8
    );
    const center = planetPos.clone();
    const duration = 2;
    const startTime = performance.now();

    function animateCam() {
      const elapsed = (performance.now() - startTime) / 1000;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(start, end, ease);
      camera.lookAt(center);
      if (t < 1) requestAnimationFrame(animateCam);
      else animating.current = false;
    }
    animateCam();
  }, [focusPlanet, introDone, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={300}
      autoRotate={!focusPlanet && introDone}
      autoRotateSpeed={0.3}
    />
  );
}

/* ─── INTRO PARTICLE TUNNEL ─── */
function IntroParticleTunnel({ onComplete }: { onComplete: () => void }) {
  const ref = useRef<Points>(null);
  const [done, setDone] = useState(false);
  const progress = useRef(0);

  const [positions, colors] = useMemo(() => {
    const count = 2000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 8;
      const depth = Math.random() * 200 - 100;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius * 0.3;
      pos[i * 3 + 2] = depth;
      const c = 0.3 + Math.random() * 0.7;
      col[i * 3] = 0;
      col[i * 3 + 1] = c * 0.8;
      col[i * 3 + 2] = c;
    }
    return [new Float32Array(pos), new Float32Array(col)];
  }, []);

  useFrame((_, delta) => {
    if (done) return;
    progress.current += delta * 0.3;
    if (progress.current >= 1) {
      setDone(true);
      onComplete();
      return;
    }
    if (ref.current) {
      const p = progress.current;
      const ease = 1 - Math.pow(1 - p, 3);
      const positions = (ref.current.geometry.attributes as any).position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const speed = 0.5 + (positions[i + 2] + 100) / 200 * 2;
        positions[i + 2] -= delta * 60 * speed;
        if (positions[i + 2] < -100) positions[i + 2] = 100;
      }
      (ref.current.geometry.attributes as any).position.needsUpdate = true;
      ref.current.material.opacity = 1 - ease * 0.8;
      ref.current.scale.setScalar(1 + ease * 2);
    }
  });

  if (done) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.3} vertexColors sizeAttenuation transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ─── HOLOGRAPHIC GRID (Earth) ─── */
function HolographicGrid({ visible }: { visible: boolean }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.05;
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.5;
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[25, 3, 0]}>
      {/* Lat/long grid */}
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[2.5, 3.5, 48]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[3.5, 4.5, 48]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Connection lines */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} rotation-y={(i / 6) * Math.PI * 2}>
          <cylinderGeometry args={[0.02, 0.02, 5, 1]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.1} />
        </mesh>
      ))}
      <Html position={[0, 5.5, 0]} center>
        <div className="text-center">
          <div className="text-[10px] font-mono tracking-[0.3em] text-cyan-400/50">DREV GLOBAL STEM NETWORK</div>
          <div className="flex gap-2 mt-1 justify-center">
            {["LHR", "JFK", "NRT", "DXB"].map((c) => (
              <span key={c} className="text-[8px] font-mono text-cyan-400/30 px-1">{c}</span>
            ))}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ─── MAIN SCENE ─── */
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

export default function SolarSystemScene({
  focusPlanet,
  onPlanetClick,
}: {
  focusPlanet: string | null;
  onPlanetClick: (n: string) => void;
}) {
  const [introDone, setIntroDone] = useState(false);
  const [showHolographic, setShowHolographic] = useState(false);

  useEffect(() => {
    if (focusPlanet === "Earth") setShowHolographic(true);
    else setShowHolographic(false);
  }, [focusPlanet]);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 50, 180], fov: 55, near: 0.1, far: 1500 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
        <ambientLight intensity={0.08} />
        <fog attach="fog" args={["#070b14", 200, 1000]} />

        <StarField count={5000} />
        <NebulaClouds />
        <CosmicSun />
        <IntroParticleTunnel onComplete={() => setIntroDone(true)} />

        <Planet name="Mercury" radius={0.6} orbitRadius={10} speed={0.6} color="#b0a090" focusPlanet={focusPlanet} onClick={onPlanetClick} />
        <Planet name="Venus" radius={0.9} orbitRadius={16} speed={0.45} color="#e8c878" focusPlanet={focusPlanet} onClick={onPlanetClick} />
        <CosmicEarth onClick={onPlanetClick} focusPlanet={focusPlanet} />
        <Planet name="Mars" radius={0.8} orbitRadius={35} speed={0.35} color="#d4513a" focusPlanet={focusPlanet} onClick={onPlanetClick} />
        <Planet name="Jupiter" radius={2.5} orbitRadius={50} speed={0.2} color="#d4a06a" emissive="#d4a06a" emissiveIntensity={0.02} focusPlanet={focusPlanet} onClick={onPlanetClick} />
        <Planet name="Saturn" radius={2.0} orbitRadius={68} speed={0.15} color="#e8d5a0" ring tilt={0.4} focusPlanet={focusPlanet} onClick={onPlanetClick} />
        <Planet name="Uranus" radius={1.5} orbitRadius={85} speed={0.1} color="#7ec8e3" tilt={1.7} focusPlanet={focusPlanet} onClick={onPlanetClick} />
        <Planet name="Neptune" radius={1.4} orbitRadius={100} speed={0.08} color="#4169e1" focusPlanet={focusPlanet} onClick={onPlanetClick} />

        <HolographicGrid visible={showHolographic} />
        <WorldRenderer focusPlanet={focusPlanet} />
        <CinematicCamera focusPlanet={focusPlanet} introDone={introDone} />
        <Effects />
      </Canvas>
    </div>
  );
}
