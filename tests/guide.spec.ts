import { test, expect } from "@playwright/test";

test("overview, equipment hotspot, editable budget and persistent checklist", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Dari desain, menjadi kehidupan." }),
  ).toBeVisible();
  await expect(page.getByText("40,5", { exact: false }).first()).toBeVisible();
  await page
    .getByRole("button", { name: "Lihat kebutuhan Lampu reef" })
    .click();
  await expect(page).toHaveURL(/#equipment/);
  const lamp = page.locator("#item-light");
  await expect(lamp).toHaveClass(/highlighted/);
  await lamp.getByRole("checkbox").check();
  await page
    .getByRole("spinbutton", {
      name: "Alokasi Lampu reef & dudukan dalam rupiah",
    })
    .fill("1000000");
  await expect(page.getByText("MELEBIHI / MENCAPAI BATAS")).toBeVisible();
  await page.reload();
  await expect(lamp.getByRole("checkbox")).toBeChecked();
  await expect(
    page.getByRole("spinbutton", {
      name: "Alokasi Lampu reef & dudukan dalam rupiah",
    }),
  ).toHaveValue("1000000");
  await expect(
    page.getByText("Rp 5.100.000", { exact: false }).first(),
  ).toBeVisible();
});

test("all assembly steps have diagrams and progress persists", async ({
  page,
}) => {
  await page.goto("/#assembly");
  await expect(
    page.getByRole("heading", { name: "Validasi lokasi & suhu" }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", {
      name: "Saya sudah melakukan dan memeriksa tahap ini",
    })
    .check();
  await expect(page.getByText("1 dari 9 selesai")).toBeVisible();
  for (let i = 0; i < 8; i++) {
    await expect(page.locator(".step-detail svg.tank-diagram")).toBeVisible();
    await page.getByRole("button", { name: "Tahap berikutnya" }).click();
  }
  await expect(
    page.getByRole("heading", { name: "Tambahkan biota bertahap" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("checkbox", {
      name: "Saya sudah melakukan dan memeriksa tahap ini",
    }),
  ).toBeChecked();
  await expect(page.getByText("1 dari 9 selesai")).toBeVisible();
});

test("technical diagrams switch and no page overflows mobile", async ({
  page,
}) => {
  for (const section of [
    "overview",
    "equipment",
    "blueprint",
    "assembly",
    "cycling",
    "care",
  ]) {
    await page.goto(`/#${section}`);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.goto("/#blueprint");
  for (const name of [
    "Tampak depan",
    "Tampak atas",
    "Jalur air",
    "Kelistrikan",
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(
      page.getByRole("button", { name, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("svg.tank-diagram")).toBeVisible();
  }
});

test("journal validates, persists, exports and confirms deletion", async ({
  page,
}) => {
  await page.goto("/#care");
  await page.getByRole("button", { name: "Simpan catatan" }).click();
  await expect(page.getByRole("status")).toContainText("Isi minimal satu");
  await page.getByLabel("Suhu (°C)", { exact: true }).fill("25.8");
  await page.getByLabel("Salinitas (ppt)", { exact: true }).fill("35");
  await page
    .getByLabel("Observasi / hasil tes lain")
    .fill("Tes manual; HOB berjalan normal.");
  await page.getByRole("button", { name: "Simpan catatan" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.reload();
  await expect(page.locator("tbody")).toContainText("25.8");
  await expect(page.locator("tbody")).toContainText(
    "Tes manual; HOB berjalan normal.",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Ekspor JSON" }).click();
  expect((await download).suggestedFilename()).toMatch(/reef-jurnal-.*\.json/);
  await page.getByRole("button", { name: /^Hapus catatan/ }).click();
  await page.getByRole("button", { name: "Batal", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: /^Hapus catatan/ }).click();
  await page.getByRole("button", { name: "Ya, hapus" }).click();
  await expect(
    page.getByRole("heading", { name: "Setiap pengukuran punya cerita." }),
  ).toBeVisible();
});

test("invalid saved data and blocked storage do not break guides", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("reef-journal-v1", "{invalid");
    localStorage.setItem(
      "reef-checks-v1",
      JSON.stringify({ invalid: "<script>" }),
    );
    localStorage.setItem("reef-prices-v1", JSON.stringify({ tank: -50 }));
    Storage.prototype.setItem = () => {
      throw new Error("Blocked");
    };
  });
  await page.goto("/#care");
  await expect(
    page.getByRole("heading", {
      name: "Reef yang sehat dibangun dari kebiasaan.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/Penyimpanan browser tidak tersedia/),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Setiap pengukuran punya cerita." }),
  ).toBeVisible();
});

test("navigation works with browser history and without WebGL", async ({
  page,
  isMobile,
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
  await page.goto("/");
  if (isMobile)
    await page.getByRole("button", { name: "Buka navigasi" }).click();
  await page.getByRole("link", { name: "Rancangan teknis" }).click();
  await expect(
    page.getByRole("heading", { name: "Kenali setiap sudut tank." }),
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Dari desain, menjadi kehidupan." }),
  ).toBeVisible();
  await page.goto("/#explore");
  await expect(
    page.getByRole("heading", { name: "3D tidak tersedia di perangkat ini" }),
  ).toBeVisible({ timeout: 20000 });
  await page.goto("/#care");
  await expect(
    page.getByRole("heading", {
      name: "Reef yang sehat dibangun dari kebiasaan.",
    }),
  ).toBeVisible();
});

test("print action is named on mobile and printed guides hide navigation", async ({
  page,
}) => {
  await page.goto("/#care");
  await expect(
    page.getByRole("button", { name: "Cetak halaman", exact: true }),
  ).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".sidebar")).toBeHidden();
  await expect(page.locator(".topbar")).toBeHidden();
  await expect(
    page.getByRole("heading", {
      name: "Reef yang sehat dibangun dari kebiasaan.",
    }),
  ).toBeVisible();
});
