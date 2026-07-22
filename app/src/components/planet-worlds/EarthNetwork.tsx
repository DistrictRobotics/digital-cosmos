import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh, Points, Group } from "three";

/* ─── CONTINENT GLOW ─── */
function ContinentGlow() {
  const ref = useRef<Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.001;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.82, 48, 48]} />
      <meshBasicMaterial color="#1a6bff" transparent opacity={0.04} depthWrite={false} />
    </mesh>
  );
}

/* ─── CITY LIGHT NETWORK ─── */
function CityLightNetwork() {
  const ref = useRef<Group>(null);

  const cities = useMemo(() => {
    const c = [];
    const cityData = [
      { lat: 40.7, lon: -74.0, name: "New York", intensity: 1.0 },
      { lat: 51.5, lon: -0.13, name: "London", intensity: 0.9 },
      { lat: 48.86, lon: 2.35, name: "Paris", intensity: 0.8 },
      { lat: 35.68, lon: 139.69, name: "Tokyo", intensity: 1.0 },
      { lat: 31.23, lon: 121.47, name: "Shanghai", intensity: 0.9 },
      { lat: 22.54, lon: 114.06, name: "Hong Kong", intensity: 0.85 },
      { lat: 25.03, lon: 121.56, name: "Taipei", intensity: 0.7 },
      { lat: 55.76, lon: 37.62, name: "Moscow", intensity: 0.7 },
      { lat: 41.9, lon: 12.5, name: "Rome", intensity: 0.6 },
      { lat: 52.52, lon: 13.41, name: "Berlin", intensity: 0.7 },
      { lat: 40.42, lon: -3.7, name: "Madrid", intensity: 0.6 },
      { lat: 37.77, lon: -122.42, name: "San Francisco", intensity: 0.75 },
      { lat: 34.05, lon: -118.24, name: "Los Angeles", intensity: 0.85 },
      { lat: 41.88, lon: -87.63, name: "Chicago", intensity: 0.7 },
      { lat: 43.65, lon: -79.38, name: "Toronto", intensity: 0.6 },
      { lat: -33.87, lon: 151.21, name: "Sydney", intensity: 0.65 },
      { lat: -23.55, lon: -46.63, name: "Sao Paulo", intensity: 0.75 },
      { lat: 19.43, lon: -99.13, name: "Mexico City", intensity: 0.7 },
      { lat: 28.61, lon: 77.23, name: "Delhi", intensity: 0.8 },
      { lat: 39.9, lon: 116.4, name: "Beijing", intensity: 0.8 },
      { lat: 1.35, lon: 103.82, name: "Singapore", intensity: 0.7 },
      { lat: 25.2, lon: 55.27, name: "Dubai", intensity: 0.7 },
    ];

    cityData.forEach((city) => {
      const phi = (90 - city.lat) * (Math.PI / 180);
      const theta = city.lon * (Math.PI / 180);
      const r = 1.85;
      c.push({
        position: [r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)],
        intensity: city.intensity,
        name: city.name,
      });
    });
    return c;
  }, []);

  const pulses = useRef<Mesh[]>([]);

  useFrame(({ clock }) => {
    pulses.current.forEach((mesh, i) => {
      if (mesh) {
        const phase = cities[i]?.intensity || 0.5;
        const t = (Math.sin(clock.getElapsedTime() * 0.5 + i * 0.7) + 1) / 2;
        mesh.scale.setScalar(1 + t * 1.5);
        (mesh.material as any).opacity = 0.2 + t * 0.4 * phase;
      }
    });
  });

  return (
    <group ref={ref}>
      {cities.map((city, i) => (
        <group key={city.name}>
          {/* City light point */}
          <mesh position={city.position as any}>
            <sphereGeometry args={[0.03 * city.intensity, 6, 6]} />
            <meshBasicMaterial color="#ffdd88" />
          </mesh>
          {/* Pulse ring */}
          <mesh
            ref={(el) => { pulses.current[i] = el!; }}
            position={city.position as any}
            rotation-x={-Math.PI / 2}
          >
            <ringGeometry args={[0.02, 0.04 * city.intensity, 12]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.2} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          {/* Connection lines between nearby cities */}
        </group>
      ))}
    </group>
  );
}

/* ─── CONNECTION BEAMS ─── */
function ConnectionBeams() {
  const ref = useRef<Group>(null);

  const connections = useMemo(() => {
    const con = [];
    const hubs = [
      { lat: 40.7, lon: -74.0 },
      { lat: 51.5, lon: -0.13 },
      { lat: 35.68, lon: 139.69 },
      { lat: 31.23, lon: 121.47 },
      { lat: -33.87, lon: 151.21 },
      { lat: 1.35, lon: 103.82 },
    ];
    for (let i = 0; i < hubs.length; i++) {
      for (let j = i + 1; j < hubs.length; j++) {
        const p1 = latLonToPos(hubs[i].lat, hubs[i].lon, 1.86);
        const p2 = latLonToPos(hubs[j].lat, hubs[j].lon, 1.86);
        con.push({ from: p1, to: p2 });
      }
    }
    return con;
  }, []);

  const lines = useRef<Mesh[]>([]);

  useFrame(({ clock }) => {
    lines.current.forEach((mesh, i) => {
      if (mesh) {
        (mesh.material as any).opacity = 0.04 + Math.sin(clock.getElapsedTime() * 0.3 + i * 0.5) * 0.03;
      }
    });
  });

  return (
    <group ref={ref}>
      {connections.map((conn, i) => {
        const mid = new THREE.Vector3().addVectors(conn.from, conn.to).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(conn.to, conn.from);
        const length = dir.length();
        dir.normalize();
        const angle = Math.acos(dir.dot(new THREE.Vector3(0, 1, 0)));
        const axis = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
        return (
          <mesh
            key={i}
            ref={(el) => { lines.current[i] = el!; }}
            position={mid}
            quaternion={new THREE.Quaternion().setFromAxisAngle(axis || new THREE.Vector3(1, 0, 0), angle)}
          >
            <cylinderGeometry args={[0.005, 0.005, length, 4]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.05} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

function latLonToPos(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = lon * (Math.PI / 180);
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/* ─── STEM NETWORK LABELS ─── */
function STEMLabels() {
  const labels = useMemo(() => [
    { lat: 40.7, lon: -74.0, text: "DREV NY" },
    { lat: 51.5, lon: -0.13, text: "DREV UK" },
    { lat: 35.68, lon: 139.69, text: "DREV TOKYO" },
    { lat: 1.35, lon: 103.82, text: "DREV SG" },
  ], []);

  return (
    <group>
      {labels.map((l) => {
        const pos = latLonToPos(l.lat, l.lon, 2.3);
        return (
          <sprite key={l.text} position={pos} scale={[0.6, 0.15, 1]}>
            <spriteMaterial>
              <canvasTexture
                attach="map"
                args={[(() => {
                  const c = document.createElement("canvas");
                  c.width = 256;
                  c.height = 64;
                  const ctx = c.getContext("2d")!;
                  ctx.fillStyle = "rgba(0,212,255,0.8)";
                  ctx.font = "bold 24px monospace";
                  ctx.textAlign = "center";
                  ctx.fillText(l.text, 128, 38);
                  return c;
                })()]}
              />
            </spriteMaterial>
          </sprite>
        );
      })}
    </group>
  );
}

/* ─── SATELLITES ─── */
function Satellites() {
  const count = 8;
  const refs = useRef<Mesh[]>([]);
  const orbits = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      radius: 2.8 + Math.random() * 0.5,
      speed: 0.2 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      tilt: (Math.random() - 0.5) * 0.3,
    }));
  }, []);

  useFrame(({ clock }) => {
    orbits.forEach((o, i) => {
      const mesh = refs.current[i];
      if (mesh) {
        const t = clock.getElapsedTime() * o.speed + o.phase;
        mesh.position.x = Math.cos(t) * o.radius;
        mesh.position.z = Math.sin(t) * o.radius * (1 + o.tilt);
        mesh.position.y = Math.sin(t * 0.5) * 0.15;
      }
    });
  });

  return (
    <group>
      {orbits.map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el!; }} position={[_.radius, 0, 0]}>
          <boxGeometry args={[0.05, 0.02, 0.02]} />
          <meshBasicMaterial color="#00d4ff" />
        </mesh>
      ))}
    </group>
  );
}

/* ─── EARTH NETWORK MAIN ─── */
export default function EarthNetwork() {
  return (
    <group position={[0, 0, 0]}>
      {/* Earth core */}
      <mesh>
        <sphereGeometry args={[1.8, 48, 48]} />
        <meshStandardMaterial color="#1a6bff" emissive="#1a6bff" emissiveIntensity={0.05} roughness={0.8} />
      </mesh>

      <ContinentGlow />
      <CityLightNetwork />
      <ConnectionBeams />
      <STEMLabels />
      <Satellites />

      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#4488ff" transparent opacity={0.02} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <pointLight distance={15} intensity={0.3} color="#4488ff" />
    </group>
  );
}