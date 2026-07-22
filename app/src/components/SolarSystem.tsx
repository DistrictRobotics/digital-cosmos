import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh, Group } from "three";

/* ─── Star Field ─── */
function StarField({ count = 4000 }) {
  const ref = useRef<THREE.Points>(null);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const radius = 200 + Math.random() * 800;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    const c = 0.5 + Math.random() * 0.5;
    colors[i * 3] = c;
    colors[i * 3 + 1] = c;
    colors[i * 3 + 2] = c + Math.random() * 0.2;
    sizes[i] = 0.5 + Math.random() * 1.5;
  }

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial size={1.2} vertexColors sizeAttenuation transparent opacity={0.9} depthWrite={false} />
    </points>
  );
}

/* ─── Sun ─── */
function Sun() {
  const meshRef = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial color="#ffa033" />
      </mesh>
      {/* Glow layers */}
      <mesh>
        <sphereGeometry args={[9, 32, 32]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.15} />
      </mesh>
      <mesh>
        <sphereGeometry args={[11, 32, 32]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.06} />
      </mesh>
      {/* Point light */}
      <pointLight intensity={200} distance={300} decay={1} color="#ffcc55" />
    </group>
  );
}

/* ─── Planet ─── */
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

      // Tilt
      if (tilt) groupRef.current.rotation.z = tilt;

      // Scale up when focused
      const targetScale = isFocused ? 3 : hovered ? 1.5 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Orbit path (show for non-focused) */}
      {!isFocused && (
        <mesh rotation-x={-Math.PI / 2}>
          <ringGeometry args={[orbitRadius - 0.1, orbitRadius + 0.1, 128]} />
          <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Planet */}
      <mesh
        ref={meshRef}
        onClick={() => onClick?.(name)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive || color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Rings (Saturn) */}
      {ring && (
        <mesh ref={ringRef} rotation-x={Math.PI / 3}>
          <ringGeometry args={[radius * 1.5, radius * 2.8, 64]} />
          <meshBasicMaterial color="#c8a87c" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Label (only show when hovered or focused) */}
      {(hovered || isFocused) && (
        <Html position={[0, radius + 1.5, 0]} center>
          <div className="px-2 py-1 text-xs font-mono text-white bg-black/60 backdrop-blur rounded border border-white/20 whitespace-nowrap">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── Earth (special: rotating + atmo glow) ─── */
function Earth({ onClick, focusPlanet }: { onClick: (n: string) => void; focusPlanet?: string | null }) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const cloudRef = useRef<Mesh>(null);
  const isFocused = focusPlanet === "Earth";

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 0.3;
      groupRef.current.position.x = Math.cos(t) * 25;
      groupRef.current.position.z = Math.sin(t) * 25;
      const targetScale = isFocused ? 4 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
    }
    if (meshRef.current) meshRef.current.rotation.y += 0.008;
    if (cloudRef.current) cloudRef.current.rotation.y += 0.012;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} onClick={() => onClick("Earth")}>
        <sphereGeometry args={[1.8, 48, 48]} />
        <meshStandardMaterial color="#1a6bff" emissive="#1a6bff" emissiveIntensity={0.05} metalness={0.1} roughness={0.8} />
      </mesh>
      {/* Cloud layer */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.85, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshBasicMaterial color="#4488ff" transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

/* ─── Camera Controller ─── */
function CameraController({ focusPlanet }: { focusPlanet: string | null }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const prevFocus = useRef<string | null>(null);

  useFrame(() => {
    if (focusPlanet && focusPlanet !== prevFocus.current) {
      prevFocus.current = focusPlanet;
      // Find the planet group by name and fly to it
      const targetPos = new THREE.Vector3();
      if (focusPlanet === "Earth") targetPos.set(25, 0, 0);
      else if (focusPlanet === "Sun") targetPos.set(0, 0, 0);
      else if (focusPlanet === "Mercury") targetPos.set(10, 0, 0);
      else if (focusPlanet === "Venus") targetPos.set(16, 0, 0);
      else if (focusPlanet === "Mars") targetPos.set(35, 0, 0);
      else if (focusPlanet === "Jupiter") targetPos.set(50, 0, 0);
      else if (focusPlanet === "Saturn") targetPos.set(68, 0, 0);
      else if (focusPlanet === "Uranus") targetPos.set(85, 0, 0);
      else if (focusPlanet === "Neptune") targetPos.set(100, 0, 0);

      // Animate camera to look at target
      const startPos = camera.position.clone();
      const duration = 2;
      const startTime = performance.now();

      function animateCamera() {
        const elapsed = (performance.now() - startTime) / 1000;
        const t = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic

        camera.position.lerpVectors(startPos, new THREE.Vector3(targetPos.x + 8, targetPos.y + 4, targetPos.z + 8), ease);
        camera.lookAt(targetPos);

        if (t < 1) requestAnimationFrame(animateCamera);
      }
      animateCamera();
    }
  });

  return <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} minDistance={5} maxDistance={300} autoRotate={!focusPlanet} autoRotateSpeed={0.3} />;
}

/* ─── Planet Info Panel ─── */
const PLANET_DATA: Record<string, { desc: string; color: string }> = {
  Sun: { desc: "The center of our system — a massive ball of plasma powering all life.", color: "#ffa033" },
  Mercury: { desc: "The smallest planet and closest to the Sun. A cratered, barren world.", color: "#b0a090" },
  Venus: { desc: "Earth's twin — similar size but shrouded in toxic, acidic clouds.", color: "#e8c878" },
  Earth: { desc: "Our home — the only known planet with liquid water and life.", color: "#1a6bff" },
  Mars: { desc: "The Red Planet — home to the tallest mountain and largest canyon.", color: "#d4513a" },
  Jupiter: { desc: "The largest planet — a gas giant with a storm larger than Earth.", color: "#d4a06a" },
  Saturn: { desc: "Famous for its stunning ring system made of ice and rock.", color: "#e8d5a0" },
  Uranus: { desc: "An ice giant that rotates on its side.", color: "#7ec8e3" },
  Neptune: { desc: "The windiest planet — the most distant and coldest world.", color: "#4169e1" },
};

/* ─── Main Scene ─── */
export default function SolarSystemScene({ focusPlanet, onPlanetClick }: { focusPlanet: string | null; onPlanetClick: (n: string) => void }) {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 30, 60], fov: 60, near: 0.1, far: 1500 }}>
        <ambientLight intensity={0.15} />
        <StarField count={5000} />
        <Sun />
        <Planet name="Mercury" radius={0.6} orbitRadius={10} speed={0.6} color="#b0a090" focusPlanet={focusPlanet} onClick={onPlanetClick} />
        <Planet name="Venus" radius={0.9} orbitRadius={16} speed={0.45} color="#e8c878" focusPlanet={focusPlanet} onClick={onPlanetClick} />
        <Earth onClick={onPlanetClick} focusPlanet={focusPlanet} />
        <Planet name="Mars" radius={0.8} orbitRadius={35} speed={0.35} color="#d4513a" focusPlanet={focusPlanet} onClick={onPlanetClick} />
        <Planet name="Jupiter" radius={2.5} orbitRadius={50} speed={0.2} color="#d4a06a" emissive="#d4a06a" emissiveIntensity={0.02} focusPlanet={focusPlanet} onClick={onPlanetClick} />
        <Planet name="Saturn" radius={2.0} orbitRadius={68} speed={0.15} color="#e8d5a0" ring tilt={0.4} focusPlanet={focusPlanet} onClick={onPlanetClick} />
        <Planet name="Uranus" radius={1.5} orbitRadius={85} speed={0.1} color="#7ec8e3" tilt={1.7} focusPlanet={focusPlanet} onClick={onPlanetClick} />
        <Planet name="Neptune" radius={1.4} orbitRadius={100} speed={0.08} color="#4169e1" focusPlanet={focusPlanet} onClick={onPlanetClick} />
        <CameraController focusPlanet={focusPlanet} />
      </Canvas>
    </div>
  );
}
