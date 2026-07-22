import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import WebGPURenderer from "three/src/renderers/webgpu/WebGPURenderer.js";
import * as THREE from "three";

/* ─── Detect WebGPU availability ─── */
export async function detectWebGpu(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("gpu" in navigator)) return false;
  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
}

/* ─── Context to propagate renderer type to children ─── */
type RendererKind = "webgpu" | "webgl" | "detecting";
const RendererCtx = createContext<RendererKind>("detecting");
export const useRendererKind = () => useContext(RendererCtx);

/* ─── Canvas wrapper with WebGPU detection + fallback ─── */
export default function WebGpuCanvas({
  children,
  glProps,
  ...canvasProps
}: any) {
  const [kind, setKind] = useState<RendererKind>("detecting");

  /* Detect once */
  useEffect(() => {
    let dead = false;
    detectWebGpu().then((ok) => {
      if (!dead) setKind(ok ? "webgpu" : "webgl");
    });
    return () => { dead = true; };
  }, []);

  /* While detecting, show a dark placeholder */
  if (kind === "detecting") {
    return (
      <div
        className="fixed inset-0 z-0 flex items-center justify-center"
        style={{ background: "#070b14" }}
      >
        <div className="text-[10px] font-mono tracking-widest text-cyan-400/30 animate-pulse">
          INITIALIZING RENDERER&hellip;
        </div>
      </div>
    );
  }

  const isWebGpu = kind === "webgpu";

  return (
    <RendererCtx.Provider value={kind}>
      <Canvas
        gl={(canvas: HTMLCanvasElement) => {
          if (isWebGpu) {
            const r = new WebGPURenderer({
              canvas,
              antialias: true,
              powerPreference: "high-performance",
              forceWebGL: false,
            });
            // WebGPURenderer.init() returns a promise; R3F expects sync.
            // We initialise synchronously with a chained .then() that re-renders.
            r.init().then(() => {
              r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
              r.setClearColor(new THREE.Color("#070b14"));
              r.toneMapping = THREE.ACESFilmicToneMapping;
              r.toneMappingExposure = 1.2;
            });
            // Return the renderer immediately; R3F will wait for the first frame.
            return r;
          }

          const r = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            powerPreference: "high-performance",
          });
          r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          r.setClearColor(new THREE.Color("#070b14"));
          r.toneMapping = THREE.ACESFilmicToneMapping;
          r.toneMappingExposure = 1.2;
          return r;
        }}
        {...canvasProps}
      >
        {children}
      </Canvas>
    </RendererCtx.Provider>
  );
}
