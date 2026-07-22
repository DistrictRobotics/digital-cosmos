import { useEffect, useRef, useState } from "react";

export default function SolarSystemScene({
  focusPlanet,
  onPlanetClick,
}: {
  focusPlanet: string | null;
  onPlanetClick: (n: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 z-0" style={{ background: "#070b14" }} />;
  }

  return <ThreeContainer focusPlanet={focusPlanet} onPlanetClick={onPlanetClick} />;
}

function ThreeContainer({ focusPlanet, onPlanetClick }: { focusPlanet: string | null; onPlanetClick: (n: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [Loaded, setLoaded] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    import("./SolarSystem").then((mod) => {
      setLoaded(() => mod.default);
    });
  }, []);

  if (!Loaded) {
    return (
      <div className="fixed inset-0 z-0 flex items-center justify-center" style={{ background: "#070b14" }}>
        <div className="text-cosmos-text-muted text-xs font-mono tracking-widest animate-pulse">LOADING COSMOS...</div>
      </div>
    );
  }

  return <Loaded focusPlanet={focusPlanet} onPlanetClick={onPlanetClick} />;
}
