import { test, expect } from "@playwright/test";

const titles = [
  "Kenali alat & bahanmu",
  "Pilih tempat & siapkan stand",
  "Uji tank dengan air tawar",
  "Pasang filter, lampu & kabel",
  "Susun batu, lalu tambahkan pasir",
  "Campur air laut di ember",
  "Isi tank perlahan",
  "Nyalakan & uji sistem",
  "Cycling dulu, tanpa ikan",
  "Masukkan biota secara bertahap",
  "Rawat sedikit, tetapi rutin",
];

test("home is a visual tutorial, not a reference dashboard", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: titles[0] })).toBeVisible();
  await expect(
    page.locator(".tutorial-stage img.tutorial-still"),
  ).toBeVisible();
  expect(
    await page
      .locator(".tutorial-stage img.tutorial-still")
      .evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth === 1200,
      ),
  ).toBeTruthy();
  await expect(page.locator(".tutorial-stage canvas")).toHaveCount(0);
  await expect(page.locator(".tutorial-actions li")).toHaveCount(3);
  await expect(page.locator(".tutorial-extra")).not.toHaveAttribute("open");
  await expect(
    page.getByRole("button", { name: "Lanjut ke Tempat & stand" }),
  ).toBeVisible();
  await expect(page.locator(".sidebar")).toHaveCount(0);
});

test("next changes the rendered scene but never marks real-world work complete", async ({
  page,
}) => {
  await page.goto("/");
  const seen = new Set<string>();
  for (let index = 0; index < titles.length; index++) {
    await expect(
      page.getByRole("heading", { name: titles[index], exact: true }),
    ).toBeVisible();
    await expect(page.locator(".tutorial-actions li")).toHaveCount(3);
    seen.add(
      (await page
        .locator(".tutorial-stage img.tutorial-still")
        .getAttribute("src")) || "",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    if (index < 10) await page.locator(".tutorial-quick-next").click();
  }
  expect(seen.size).toBe(11);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  await expect(
    page.getByRole("link", { name: /Eksplorasi hasil akhir/ }),
  ).toBeVisible();
});

test("step position, material readiness and old progress are preserved", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("reef-checks-v1"))
      localStorage.setItem(
        "reef-checks-v1",
        JSON.stringify({ "step-scape": true }),
      );
  });
  await page.goto("/");
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "1",
  );
  await page.getByRole("checkbox", { name: "Sudah siap: Filter HOB" }).check();
  await page.locator(".tutorial-done input").check();
  await page.locator(".tutorial-quick-next").click();
  await page.reload();
  await expect(page.getByRole("heading", { name: titles[1] })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "2",
  );
  await page.getByRole("button", { name: "Sebelumnya", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Sudah siap: Filter HOB" }),
  ).toBeChecked();
  await expect(page.locator(".tutorial-done input")).toBeChecked();
  await page.goto("/#tutorial/4");
  await expect(page.locator(".tutorial-done input")).toBeChecked();
});

test("chapters, image downloads, supply help and browser back work", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Penjelasan Tank & stand", exact: true })
    .click();
  await expect(page.locator(".tutorial-supply-tip")).toContainText(
    "validasi pembuat tank",
  );
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Simpan gambar tahap ini" }).click();
  expect((await pending).suggestedFilename()).toBe("nano-reef-01-kit.webp");
  if (isMobile)
    await page
      .getByRole("button", { name: "Semua langkah", exact: true })
      .click();
  await page.locator(".tutorial-chapter").nth(8).click();
  await expect(page.getByRole("heading", { name: titles[8] })).toBeVisible();
  await expect(
    page.getByText("Sumber amonia", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator(".tutorial-safety")).toContainText(
    "Jangan cycling memakai ikan",
  );
  await page.goBack();
  await expect(page.getByRole("heading", { name: titles[0] })).toBeVisible();
});

test("mobile chapter sheet closes with Escape and traps keyboard focus", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Mobile chapter sheet");
  await page.goto("/");
  await expect(page.locator("#tutorial-chapters")).toHaveAttribute("inert", "");
  await page
    .getByRole("button", { name: "Semua langkah", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Tutup semua langkah" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator(".tutorial-reference-link")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Tutup semua langkah" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#tutorial-chapters")).toHaveAttribute("inert", "");
  await expect(
    page.getByRole("button", { name: "Semua langkah", exact: true }),
  ).toBeFocused();
});

test("all photos work without WebGL; interactive mode falls back to the current photo", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/#tutorial/3");
  await expect(page.getByRole("heading", { name: titles[3] })).toBeVisible();
  await expect(
    page.locator(".tutorial-stage img.tutorial-still"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Interaktif", exact: true }).click();
  await expect(
    page.getByText("WebGL tidak tersedia. Gambar 3D tetap bisa diikuti."),
  ).toBeVisible();
  await expect(
    page.locator(".tutorial-stage img.tutorial-still"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Gambar 3D", exact: true }).click();
  await page.locator(".tutorial-quick-next").click();
  await expect(page.getByRole("heading", { name: titles[4] })).toBeVisible();
});

test("only tutorial and exploration remain; lesson position survives switching", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/#tutorial/5");
  await page
    .getByRole("navigation", { name: "Navigasi utama" })
    .getByRole("link", { name: "Eksplorasi 3D", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Masuk ke dunia reef ini." }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Navigasi utama" })
    .getByRole("link", { name: "Tutorial Visual", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: titles[5] })).toBeVisible();
});

test("corrupt/blocked storage and invalid tutorial URLs stay usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("reef-tutorial-position-v1", "999");
    localStorage.setItem("reef-checks-v1", "broken");
    Storage.prototype.setItem = () => {
      throw new Error("Blocked");
    };
  });
  await page.goto("/#tutorial/999");
  await expect(page.getByRole("heading", { name: titles[0] })).toBeVisible();
  await expect(
    page.getByText("Penyimpanan browser terblokir/penuh.", { exact: false }),
  ).toBeVisible();
  await page.locator(".tutorial-quick-next").click();
  await expect(page.getByRole("heading", { name: titles[1] })).toBeVisible();
});
