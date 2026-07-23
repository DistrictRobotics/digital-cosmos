/**
 * Headless Playwright screenshot capture for Digital Cosmos
 * Controls Three.js scene via injected JS for reliable planet focusing.
 *
 * Usage:
 *   node capture-screenshots.js
 *
 * Prerequisites:
 *   npm install playwright
 *   npx playwright install chromium
 *   Dev server running at http://localhost:3000
 */

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
const VIEWPORT = { width: 1920, height: 1080 };

const PLANETS = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Evaluate code in the page. If it throws, retry a few times
 * (useful while Three.js is still initializing).
 */
async function safeEval(page, fn, retries = 5, delay = 1500) {
  for (let i = 0; i < retries; i++) {
    try {
      return await page.evaluate(fn);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  Retry ${i + 1}/${retries}: ${err.message}`);
      await sleep(delay);
    }
  }
}

async function capture() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log("Launching Playwright (headless)...");
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--use-gl=swiftshader",
    ],
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();
  const logs = [];
  page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on("pageerror", (err) => logs.push(`[PAGE_ERROR] ${err.message}`));

  try {
    console.log("Navigating to", BASE_URL);
    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60000 });
    console.log("Page loaded. Waiting for canvas...");
    await page.waitForSelector("canvas", { timeout: 20000 });
    console.log("Canvas found. Letting Three.js render...");
    await sleep(5000);

    // Skip intro (Escape)
    await page.keyboard.press("Escape");
    await sleep(1000);

    // ────────────────────────────────────────
    // Inject helpers into the page to control
    // the Three.js scene programmatically.
    // ────────────────────────────────────────
    await safeEval(page, () => {
      // Find the R3F root by traversing the fiber tree
      window.__DC = {};

      // Try to find the R3F store from the canvas
      const canvas = document.querySelector("canvas");
      if (!canvas) throw new Error("No canvas");
      const fiber = canvas.__r3f;
      if (!fiber) throw new Error("No R3F fiber on canvas");

      window.__DC.fiber = fiber;
      window.__DC.store = fiber.store;
      window.__DC.scene = fiber.store.getState().scene;
      window.__DC.camera = fiber.store.getState().camera;
      window.__DC.controls = fiber.store.getState().controls;
      console.log("DC helpers injected");
    });

    console.log("Three.js scene found. Ready.");

    // ─── 1. Solar System Overview ───
    console.log("\n=== 1. Solar System Overview ===");
    await sleep(2000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "01-solar-system-overview.png"),
    });
    console.log("  Saved: 01-solar-system-overview.png");

    // ─── 2. Per-planet screenshots ───
    for (let i = 0; i < PLANETS.length; i++) {
      const name = PLANETS[i];
      console.log(`\n=== ${i + 2}. ${name} ===`);

      // Try to focus the camera on this planet by:
      // (a) Injecting a script that finds the planet mesh and triggers focus
      // (b) Falling back to canvas click at the planet's screen position
      let focused = await safeEval(page, (planetName) => {
        const { scene, camera, controls, store } = window.__DC;
        if (!scene) return false;

        // Search for the planet group in the scene by name
        // Planet groups are named like "EarthWorld", "MarsWorld", etc.
        // or the planet mesh itself is named.
        let planet = null;
        scene.traverse((obj) => {
          if (planet) return;
          // Match by name or userData
          if (
            obj.name === planetName ||
            obj.userData?.planetName === planetName ||
            obj.userData?.label === planetName ||
            obj.name === `${planetName}World`
          ) {
            planet = obj;
          }
        });

        if (planet) {
          // Get the world position of the planet
          const pos = new THREE.Vector3();
          planet.getWorldPosition(pos);

          // Move camera to focus on the planet
          const dist = 8;
          camera.position.set(pos.x + dist, pos.y + dist * 0.5, pos.z + dist);
          camera.lookAt(pos);
          if (controls) controls.target.copy(pos);
          console.log(`Focused camera on ${planetName} at`, pos);
          return true;
        }
        return false;
      }, [name]);

      if (!focused) {
        // Fallback: click on the canvas where the planet should be
        console.log(`  Could not find ${name} via scene tree, trying canvas click...`);
        const canvas = await page.$("canvas");
        const box = await canvas.boundingBox();
        if (box) {
          const cx = box.x + box.width / 2;
          const cy = box.y + box.height / 2;
          // Click at an offset from center (planets orbit outward)
          const angle = (i / PLANETS.length) * Math.PI * 2;
          const radius = 0.15 + i * 0.04;
          const px = cx + Math.cos(angle) * box.width * radius;
          const py = cy + Math.sin(angle) * box.height * radius * 0.6;
          await page.mouse.click(px, py);
        }
      }

      await sleep(3000);

      // Screenshot: planet focused in solar system
      const idx = String(i + 2).padStart(2, "0");
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `${idx}-${name.toLowerCase()}-focused.png`),
      });
      console.log(`  Saved: ${idx}-${name.toLowerCase()}-focused.png`);

      // Press E to enter the planet world
      await page.keyboard.press("e");
      await sleep(4000);

      // Screenshot: on planet surface
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `${idx}-${name.toLowerCase()}-surface.png`),
      });
      console.log(`  Saved: ${idx}-${name.toLowerCase()}-surface.png`);

      // Return to solar system
      await page.keyboard.press("Escape");
      await sleep(2000);

      // Reset camera to overview
      await safeEval(page, () => {
        const { camera, controls } = window.__DC;
        if (camera) {
          camera.position.set(0, 5, 20);
          camera.lookAt(0, 0, 0);
          if (controls) controls.target.set(0, 0, 0);
        }
      });
      await sleep(2000);
    }

    // ─── 3. HUD / SATCOM panel ───
    console.log(`\n=== 11. HUD & SATCOM ===`);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "11-hud-satcom.png"),
    });
    console.log("  Saved: 11-hud-satcom.png");

    console.log("\n=== All screenshots captured ===");
    console.log(`Location: ${SCREENSHOTS_DIR}/`);
  } catch (err) {
    console.error("Error:", err.message);
    try {
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, "error-state.png"),
      });
      console.log("  Saved error screenshot: error-state.png");
    } catch (_) {}
  } finally {
    const recent = logs.slice(-40);
    if (recent.length > 0) {
      console.log("\n--- Recent console logs ---");
      recent.forEach((l) => console.log(l));
    }
    await browser.close();
    console.log("Browser closed.");
  }
}

capture().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});