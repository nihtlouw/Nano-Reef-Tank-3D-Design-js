// Run the Vite dev server first. Assets are rendered from our own Three.js scenes.
// npx playwright install chromium
// node scripts/capture-tutorial.mjs
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

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
const baseURL = process.env.CAPTURE_BASE_URL || "http://127.0.0.1:5173";
await mkdir("src/tutorial/stills", { recursive: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 675 },
    deviceScaleFactor: 1,
  });
  page.setDefaultTimeout(90000);
  page.setDefaultNavigationTimeout(90000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const indices =
    process.argv.length > 2
      ? process.argv.slice(2).map(Number)
      : Array.from({ length: 11 }, (_, i) => i);
  for (const index of indices) {
    if (!Number.isInteger(index) || index < 0 || index > 10)
      throw new Error("Invalid lesson index");
    await page.goto(`${baseURL}/?capture=${index}`);
    await page.waitForFunction(
      () => document.documentElement.dataset.sceneReady === "true",
    );
    const encoded = await page
      .locator("canvas")
      .evaluate((canvas) => canvas.toDataURL("image/webp", 0.9).split(",")[1]);
    const name = `src/tutorial/stills/step-${String(index).padStart(2, "0")}.webp`;
    await writeFile(name, Buffer.from(encoded, "base64"));
    console.log(`Rendered ${name}`);
  }
  if (errors.length) throw new Error(errors.join("\n"));
} finally {
  await browser.close();
}
