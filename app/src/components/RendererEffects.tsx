import { useRendererKind } from "./WebGpuCanvas";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";

/* ─── WebGL post-processing (full effects) ─── */
function WebGLEffects() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.7} intensity={0.8} />
      <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} />
      <Vignette eskil={false} offset={0.3} darkness={0.6} />
    </EffectComposer>
  );
}

/* ─── WebGPU post-processing (native tone-mapping only) ─── */
/* WebGPU's ACESFilmic tone mapping + high-dynamic-range rendering
   already provides superior colour grading. Bloom/DoF are omitted
   because the WebGPU EffectComposer path uses a different pipeline.   */
function WebGpuEffects() {
  return null;
}

/* ─── Auto-select based on runtime renderer ─── */
export default function RendererEffects() {
  const kind = useRendererKind();

  if (kind === "webgpu") return <WebGpuEffects />;
  return <WebGLEffects />;
}
