// Run Vite first. Optional: CHROMIUM_EXECUTABLE_PATH and SCENE_AUDIT_BASE_URL.
// Actual WebGL screenshots (not mocked canvases) for multi-angle model review.
import { chromium, devices } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const folder = process.env.SCENE_AUDIT_DIR || ".cache/scene-audit";
const base = process.env.SCENE_AUDIT_BASE_URL || "http://127.0.0.1:5173";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch(
  process.env.CHROMIUM_EXECUTABLE_PATH
    ? {
        executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
        args: [
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--use-angle=swiftshader",
          "--enable-unsafe-swiftshader",
        ],
      }
    : {},
);
const errors = [];
try {
  const stages = process.env.SCENE_AUDIT_STAGES?.split(",")
    .filter(Boolean)
    .map(Number) || [0, 3, 4, 5, 8, 9, 10];
  const page = await browser.newPage({
    viewport: { width: 1000, height: 800 },
    deviceScaleFactor: 1,
  });
  page.setDefaultTimeout(120000);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(`${base}/#explore`);
  await page.locator('canvas[data-scene-ready="true"]').waitFor();
  // DOM click keeps the canvas in view; scrolling to controls can throttle SwiftShader.
  async function shot(_selector, path) {
    const encoded = await page
      .locator("canvas")
      .evaluate((canvas) => canvas.toDataURL("image/png").split(",")[1]);
    const bytes = Buffer.from(encoded, "base64");
    assert(bytes.length > 5000);
    await writeFile(path, bytes);
  }
  const views = [
    ["front", "Depan"],
    ["angle", "Sudut"],
    ["top", "Atas"],
    ["inside", "Dalam tank"],
  ].filter(
    ([view]) =>
      !process.env.SCENE_AUDIT_VIEWS ||
      process.env.SCENE_AUDIT_VIEWS.split(",").includes(view),
  );
  for (const [view, name] of views) {
    await page
      .getByRole("button", { name, exact: true })
      .evaluate((button) => button.click());
    await page.locator(`canvas[data-camera-view="${view}"]`).waitFor();
    await shot(".exploration-frame", `${folder}/reef-${view}.png`);
    console.log(`Rendered original reef: ${view}`);
  }
  if (process.env.SCENE_AUDIT_LIGHTS !== "0") {
    await page
      .getByRole("button", { name: "Reef white", exact: true })
      .evaluate((button) => button.click());
    await page
      .getByRole("button", { name: "Sudut", exact: true })
      .evaluate((button) => button.click());
    await page.locator('canvas[data-camera-view="angle"]').waitFor();
    await shot(".exploration-frame", `${folder}/reef-white.png`);
  }
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Tutorial Visual", exact: true })
    .evaluate((button) => button.click());
  await page.waitForFunction(() => !document.querySelector("canvas"));
  for (const i of stages) {
    await page.goto(`${base}/#tutorial/${i}`);
    await page
      .getByRole("button", { name: "Interaktif", exact: true })
      .evaluate((button) => button.click());
    await page.locator('canvas[data-scene-ready="true"]').waitFor();
    await shot(".tutorial-stage", `${folder}/stage-${i}.png`);
    await page
      .getByRole("button", { name: "Gambar 3D", exact: true })
      .evaluate((button) => button.click());
    await page.waitForFunction(() => !document.querySelector("canvas"));
    console.log(`Rendered tutorial stage: ${i}`);
  }
  await page.close();
  if (process.env.SCENE_AUDIT_MOBILE !== "0") {
    const mobile = await browser.newPage({ ...devices["iPhone 13"] });
    mobile.setDefaultTimeout(120000);
    mobile.on("pageerror", (error) => errors.push(error.message));
    await mobile.goto(`${base}/#explore`);
    await mobile.locator('canvas[data-scene-ready="true"]').waitFor();
    assert(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Mobile horizontal overflow",
    );
    const mobileFrame = await mobile
      .locator("canvas")
      .evaluate((c) => c.toDataURL("image/png").split(",")[1]);
    assert(Buffer.from(mobileFrame, "base64").length > 5000);
    await writeFile(`${folder}/mobile.png`, Buffer.from(mobileFrame, "base64"));
  }
  assert.deepEqual(errors, [], "No page errors or renderer/shader errors");
  console.log(
    `PASS: selected WebGL audit (${views.length} views, ${stages.length} live stages), canvas cleanup. Screenshots: ${folder}`,
  );
} finally {
  await browser.close();
}
