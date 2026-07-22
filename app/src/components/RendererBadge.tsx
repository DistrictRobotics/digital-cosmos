import { useRendererKind } from "./WebGpuCanvas";

export default function RendererBadge() {
  const kind = useRendererKind();

  if (kind === "detecting") return null;

  const isWebGpu = kind === "webgpu";

  return (
    <div
      className="fixed bottom-6 left-6 z-50 pointer-events-none"
    >
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[9px] font-mono tracking-wider backdrop-blur-md border"
        style={{
          background: isWebGpu
            ? "rgba(0,212,255,0.08)"
            : "rgba(99,102,241,0.08)",
          borderColor: isWebGpu
            ? "rgba(0,212,255,0.15)"
            : "rgba(99,102,241,0.15)",
        }}
      >
        {/* Indicator dot */}
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: isWebGpu ? "#00d4ff" : "#6366f1",
            boxShadow: isWebGpu
              ? "0 0 6px rgba(0,212,255,0.5)"
              : "0 0 6px rgba(99,102,241,0.5)",
          }}
        />
        <span
          style={{ color: isWebGpu ? "rgba(0,212,255,0.6)" : "rgba(99,102,241,0.6)" }}
        >
          {isWebGpu ? "WEBGPU" : "WEBGL"}
        </span>
      </div>
    </div>
  );
}