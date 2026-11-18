import { test, expect } from "@playwright/test";
import { stageParts } from "../src/tutorial/stages";

function disableWebGL() {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    type: string,
    ...args: unknown[]
  ) {
    if (type.includes("webgl")) return null;
    return original.apply(this, [type, ...args] as Parameters<typeof original>);
  } as typeof original;
}
test("navigation contains exactly the two requested destinations", async ({
  page,
}) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Navigasi utama" });
  await expect(navigation.getByRole("link")).toHaveCount(2);
  await expect(
    navigation.getByRole("link", { name: "Tutorial Visual", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    navigation.getByRole("link", { name: "Eksplorasi 3D", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/reefnotes|reef notes/i)).toHaveCount(0);
  await expect(page.locator(".sidebar,.workspace")).toHaveCount(0);
  for (const hash of [
    "overview",
    "equipment",
    "blueprint",
    "assembly",
    "cycling",
    "care",
  ]) {
    await page.goto(`/#${hash}`);
    await expect(
      page.getByRole("heading", { name: "Kenali alat & bahanmu", exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Navigasi utama" })
        .getByRole("link"),
    ).toHaveCount(2);
  }
});

test("the original reef is the source for every tutorial and the full exploration", () => {
  const full = stageParts();
  expect(full.life).toBe(true);
  expect(full.rocks).toBe(true);
  expect(full.water).toBe(true);
  for (let stage = 0; stage < 9; stage++)
    expect(stageParts(stage).life).toBe(false);
  expect(stageParts(0).exploded).toBe(true);
  expect(stageParts(1).equipment).toBe(false);
  expect(stageParts(2).water).toBe(true);
  expect(stageParts(3).water).toBe(false);
  expect(stageParts(4).rocks).toBe(true);
  expect(stageParts(5).water).toBe(false);
  expect(stageParts(6).water).toBe(true);
  expect(stageParts(8).life).toBe(false);
  expect(stageParts(9).life).toBe(true);
  expect(stageParts(10).life).toBe(true);
});

test("exploration controls work without sensors and gracefully fall back without WebGL", async ({
  page,
}) => {
  await page.addInitScript(disableWebGL);
  await page.goto("/#explore");
  await expect(
    page.getByRole("heading", { name: "Masuk ke dunia reef ini." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "3D tidak tersedia di perangkat ini" }),
  ).toBeVisible({ timeout: 20000 });
  await expect(page.locator(".explorer-fallback>img")).toBeVisible();
  await page.getByRole("button", { name: "Sudut", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sudut", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Moonlight", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Moonlight", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const fish = page.getByRole("button", { name: "Butterflyfish", exact: true });
  await fish.click();
  await expect(fish).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("slider", { name: "Gerakan aliran visual" }).fill("1.5");
  await expect(page.getByText("150%", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Beri pakan simulasi", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Pakan simulasi dijatuhkan",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText("25.6°C")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test("the design target is available from early tutorial steps and real-world warnings remain", async ({
  page,
}) => {
  await page.addInitScript(disableWebGL);
  await page.goto("/#tutorial/0");
  await expect(page.locator(".tutorial-stage")).toHaveAttribute(
    "data-model",
    "original-reef",
  );
  await expect(
    page.getByRole("link", { name: "Lihat desain akhir di Eksplorasi 3D" }),
  ).toBeVisible();
  await page.goto("/#tutorial/9");
  await expect(page.locator(".tutorial-safety")).toContainText(
    "bukan paket penghuni untuk tank 45 cm",
  );
  await expect(page.locator(".tutorial-target")).toHaveCount(0);
});

test("the side-by-side display and supplied reference remain accessible without 3D", async ({
  page,
}) => {
  await page.addInitScript(disableWebGL);
  await page.goto("/#explore");
  const fallback = page.locator(".explorer-fallback > img");
  await expect(fallback).toHaveAttribute("alt", /dua akuarium berdampingan/i, {
    timeout: 20000,
  });
  const pair = page.getByRole("button", { name: "Kedua tank", exact: true });
  const second = page.getByRole("button", { name: "Tank kedua", exact: true });
  await expect(pair).toHaveAttribute("aria-pressed", "true");
  await second.click();
  await expect(second).toHaveAttribute("aria-pressed", "true");
  await expect(fallback).toHaveAttribute("alt", /Foto acuan tank kedua/);
  await expect
    .poll(() =>
      fallback.evaluate(
        (el: HTMLImageElement) => el.complete && el.naturalWidth === 1280,
      ),
    )
    .toBe(true);
  const reference = page.getByRole("button", { name: "Foto acuan tank kedua" });
  await reference.click();
  const dialog = page.getByRole("dialog", { name: "Reef Panorama" });
  await expect(dialog.getByRole("img")).toHaveAttribute(
    "src",
    (await fallback.getAttribute("src"))!,
  );
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(reference).toBeFocused();
  await page.getByRole("button", { name: "Tank utama", exact: true }).click();
  await expect(fallback).toHaveAttribute("alt", /Render tank utama/);
  await pair.click();
  await expect(fallback).toHaveAttribute("alt", /dua akuarium berdampingan/i);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
