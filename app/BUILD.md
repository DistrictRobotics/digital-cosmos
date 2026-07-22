# Build Instructions

## Prerequisites
- Node.js 22+
- Bun (or npm)

## Build
```bash
cd app
bun install
NODE_OPTIONS="--max-old-space-size=4096" bun run vite build
```

The build produces:
- `dist/client/` — static assets (HTML, JS, CSS)
- `dist/server/` — SSR assets

## Running
```bash
bun run dev     # Development server
bun run preview # Preview production build
```

## Routes
- `/` — Digital Cosmos 3D portal (solar system + planet worlds)
- `/stem-academy` — STEM Academy standalone platform (58 worlds, 80+ missions)

## STEM Academy Architecture
```
src/components/stem-academy/
├── catalog/
│   ├── types.ts        # World, Mission, Rank types
│   └── worlds.ts       # 58-world catalog with 80+ missions
├── ui/
│   └── StemAcademy.tsx # Main Academy UI (3 screens)
└── index.tsx           # Re-export
```
