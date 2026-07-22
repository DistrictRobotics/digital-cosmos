# Digital Cosmos v1.1 — Design Brief

## Design read
A cinematic portal into District Robotics' living digital universe. For space enthusiasts, STEM students, and visitors seeking awe. Emotional register: the moment before launch — anticipation, cosmic scale, silent wonder.

## Concept spine
**Launch Portal** — the site is a stargate you step through. Arrival reveals a breathing cosmos; every scroll takes you deeper into the digital universe. The existing drev.space waits on the other side.

## Delivery tier
**Cinema** — Lenis smooth scroll + GSAP ScrollTrigger, a Tier-1 hero mechanic, scroll-driven chapter reveals.

## Tier-1 technique
**B1 — Cutout parallax rig** (wow-catalog §B1). A deep space hero with 4-5 parallax layers: distant star field, glowing nebula veil, planetary ring silhouette, foreground celestial body. Responds to scroll progress AND cursor position — the cosmos feels volumetric and alive, enacting the "launch portal" spine.

## Locked palette
- Background: `#070b14` (deep space navy — not pure black)
- Surface: `#0f1526` (slightly lighter deck for cards/sections)
- Accent: `#00d4ff` (cosmic cyan energy — District Robotics brand, overriding default ban)
- Violet depth: `#6366f1` (indigo-violet for cosmic mystery accents, used sparingly)
- Text primary: `#f1f5f9`
- Text muted: `#94a3b8`
- Border/stroke: `#1e293b`
- Success/mission-accent: `#22c55e` (mission-ready green)

Defense: Dark cosmos + cyan energy is District Robotics' established identity. The violet secondary adds nebula depth without dominating. First build in chat — no convergence constraints.

## Locked type
- Display: **Satoshi** — clean grotesk for headlines, premium tech register
- Body: **Inter Tight** — refined readable grotesk
- Mono: **JetBrains Mono** — cosmic data readouts, mission stats, HUD elements

## Section plan (6 sections)
1. **Hero** — Full-screen cosmic parallax portal. Layers of deep space (stars, nebula, rings, celestial body). Headline "Digital Cosmos" + sub "A living universe. Powered by District Robotics." CTA "Enter the Digital Cosmos" as glowing trace.
2. **What Is** — Split 50/50: left text column describing the Digital Cosmos, right cosmic scene plate. Eyebrow "Explore the unknown."
3. **Missions** — 3-card asymmetric bento. Mission categories: Explore (discover planets), Learn (STEM missions), Build (create your path). Each card has its own cosmic illustration.
4. **By the Numbers** — Oversized metrics strip: 80+ missions, 7 planets, 1 universe, ∞ possibilities. Each metric a standalone numeral with label below.
5. **How It Works** — 3-step staggered flow: (1) Choose your mission, (2) Launch into space, (3) Earn your rank. Step icons on a cosmic path line.
6. **Launch Portal** — Full-screen CTA with the portal concept. "Step into the Digital Cosmos" → "Visit drev.space" button. Stars swirl toward the gateway.

## Asset plan
- Hero visual: layered cosmic scene with nebula, star field, planet ring, celestial body — 4-5 depth layers for cutout parallax rig
- Section plates: 2 cosmic backgrounds (deep nebula, star corridor) for section transitions
- Content imagery: mission scene plates (planet surface, space station, astronaut silhouette)
- Custom icon set: 6 cosmic glyphs in consistent 2px stroke (planet-ring, rocket, star, satellite, mission badge, compass)
- Logo: District Robotics wordmark from existing site
- OG image: 1200×630 social card in cosmos palette
- Head kit: favicon/apple-touch-icon derived from a simplified cosmic mark

## CTA inventory
1. **Hero "Enter the Digital Cosmos"** — oversized text link with luminous cyan underline that traces in from left on hover
2. **"Explore Missions"** — framed block with cosmic corner-bracket ornaments that close around label on hover
3. **"Launch Academy"** — pill with rotating ring orbit animation on hover, opens outward
4. **"Visit drev.space"** — gateway portal frame with sliding reveal — left panel and right panel slide apart on hover to reveal the destination

## Mobile degradation
- Parallax layers reduced to 3 (foreground celestial + mid nebula + star field as CSS)
- Cursor effects replaced by scroll-driven equivalents
- Split sections stack vertically (text then image)
- Metrics strip becomes 2×2 grid
