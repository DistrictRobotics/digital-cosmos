/* ─── Audio Engine — Web Audio API procedural sound system ─── */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let activeNodes: AudioNode[] = [];

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function getMaster(): GainNode {
  if (!masterGain) {
    masterGain = getCtx().createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(getCtx().destination);
  }
  return masterGain;
}

/* ─── Ambient drone per world type ─── */
type WorldType = "rocky" | "desert" | "icy" | "volcanic" | "oceanic" | "urban" | "gaseous" | "space";

const AMBIENT_PARAMS: Record<WorldType, { freq: number; detune: number; type: OscillatorType; gain: number }> = {
  rocky:     { freq: 55,  detune: 8,   type: "sawtooth", gain: 0.04 },
  desert:    { freq: 40,  detune: 12,  type: "sine",     gain: 0.03 },
  icy:       { freq: 80,  detune: 5,   type: "sine",     gain: 0.02 },
  volcanic:  { freq: 30,  detune: 20,  type: "sawtooth", gain: 0.05 },
  oceanic:   { freq: 60,  detune: 3,   type: "sine",     gain: 0.03 },
  urban:     { freq: 100, detune: 15,  type: "square",   gain: 0.02 },
  gaseous:   { freq: 45,  detune: 10,  type: "sine",     gain: 0.025 },
  space:     { freq: 20,  detune: 2,   type: "sine",     gain: 0.01 },
};

let ambientNode: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

export function startAmbient(type: WorldType = "space") {
  stopAmbient();
  const c = getCtx();
  const master = getMaster();
  const params = AMBIENT_PARAMS[type] || AMBIENT_PARAMS.space;
  ambientGain = c.createGain();
  ambientGain.gain.value = params.gain;
  ambientGain.connect(master);
  ambientNode = c.createOscillator();
  ambientNode.type = params.type;
  ambientNode.frequency.value = params.freq;
  ambientNode.detune.value = params.detune;
  ambientNode.connect(ambientGain);
  ambientNode.start();
  // Second harmonic for richness
  const harm = c.createOscillator();
  harm.type = params.type;
  harm.frequency.value = params.freq * 2.01;
  harm.detune.value = params.detune * 1.5;
  harm.connect(ambientGain);
  harm.start();
  activeNodes.push(harm);
}

export function stopAmbient() {
  if (ambientNode) { try { ambientNode.stop(); } catch {} ambientNode = null; }
  if (ambientGain) { ambientGain.disconnect(); ambientGain = null; }
}

/* ─── Footstep ─── */
let lastStep = 0;
export function playFootstep(sprint: boolean = false) {
  const now = Date.now();
  if (now - lastStep < (sprint ? 120 : 200)) return;
  lastStep = now;
  const c = getCtx();
  const master = getMaster();
  const noise = c.createBufferSource();
  const buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.01));
  noise.buffer = buf;
  const g = c.createGain();
  g.gain.value = sprint ? 0.08 : 0.04;
  const f = c.createBiquadFilter();
  f.type = "lowpass"; f.frequency.value = 200;
  noise.connect(f); f.connect(g); g.connect(master);
  noise.start();
  noise.stop(c.currentTime + 0.1);
}

/* ─── Vehicle engine ─── */
let engineNode: OscillatorNode | null = null;
let engineGain: GainNode | null = null;

export function startEngine(type: "drone" | "rover" | "craft", speed: number = 0.5) {
  stopEngine();
  const c = getCtx();
  const master = getMaster();
  const baseFreq = type === "drone" ? 120 : type === "rover" ? 60 : 40;
  engineGain = c.createGain();
  engineGain.gain.value = 0.02 + speed * 0.04;
  engineGain.connect(master);
  engineNode = c.createOscillator();
  engineNode.type = "sawtooth";
  engineNode.frequency.value = baseFreq + speed * 60;
  engineNode.connect(engineGain);
  engineNode.start();
  // Harmonics
  for (const mult of [2, 3]) {
    const h = c.createOscillator();
    h.type = "sine";
    h.frequency.value = baseFreq * mult + speed * 30;
    h.connect(engineGain);
    h.start();
    activeNodes.push(h);
  }
}

export function updateEngine(speed: number) {
  if (engineNode) engineNode.frequency.value = (engineNode.frequency.value > 40 ? 60 : 40) + speed * 60;
  if (engineGain) engineGain.gain.value = 0.02 + speed * 0.04;
}

export function stopEngine() {
  if (engineNode) { try { engineNode.stop(); } catch {} engineNode = null; }
  if (engineGain) { engineGain.disconnect(); engineGain = null; }
}

/* ─── Structure pulse beacon ─── */
export function playBeaconPulse() {
  const c = getCtx();
  const master = getMaster();
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 880;
  const g = c.createGain();
  g.gain.value = 0.01;
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
  osc.connect(g); g.connect(master);
  osc.start(); osc.stop(c.currentTime + 0.15);
}

/* ─── Cleanup ─── */
export function cleanupAudio() {
  stopAmbient(); stopEngine();
  activeNodes.forEach((n) => { try { n.disconnect(); } catch {} });
  activeNodes = [];
  if (ctx) { ctx.close(); ctx = null; masterGain = null; }
}

/* ─── Map world env to sound type ─── */
export function envToSoundType(env: string): WorldType {
  const e = env.toLowerCase();
  if (e.includes("desert") || e.includes("sand")) return "desert";
  if (e.includes("ice") || e.includes("snow") || e.includes("cold") || e.includes("cryo") || e.includes("tundra")) return "icy";
  if (e.includes("volcano") || e.includes("lava") || e.includes("magma") || e.includes("sulfur")) return "volcanic";
  if (e.includes("ocean") || e.includes("water") || e.includes("sea") || e.includes("aqua")) return "oceanic";
  if (e.includes("gaseous") || e.includes("gas") || e.includes("atmo") || e.includes("cloud")) return "gaseous";
  if (e.includes("city") || e.includes("urban") || e.includes("base") || e.includes("colony") || e.includes("hq") || e.includes("station")) return "urban";
  if (e.includes("rock") || e.includes("crater") || e.includes("mountain") || e.includes("canyon")) return "rocky";
  if (e.includes("space") || e.includes("deep") || e.includes("oort") || e.includes("kuiper") || e.includes("interstellar")) return "space";
  return "rocky";
}