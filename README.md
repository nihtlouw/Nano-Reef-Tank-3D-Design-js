# Nano-Reef-Tank-3D-Design-js

**Reef Notes** adalah workspace berbahasa Indonesia untuk merencanakan nano reef 45 × 30 × 30 cm dengan batas anggaran awal di bawah Rp5 juta, target clownfish/koral, dan lokasi indoor tanpa AC. Simulasi React/Three.js asli tetap tersedia sebagai visualisasi, bukan spesifikasi siap rakit.

## Fitur panduan

- Ringkasan spesifikasi, volume geometris 40,5 L, dan keputusan yang perlu divalidasi.
- Kebutuhan alat/bahan, fungsi, prioritas, checklist, dan alokasi biaya yang dapat diubah. Alokasi awal Rp4,8 juta **bukan harga pasar terverifikasi**.
- Diagram SVG depan/atas, jalur air HOB, dan drip loop kelistrikan. Hotspot diagram ringkasan membuka rincian alat.
- Sembilan tahap perakitan bergambar dengan peringatan, titik pemeriksaan, dan progres tersimpan.
- Panduan fishless cycling, batas stocking, perawatan harian/mingguan/berkala, serta penanganan darurat.
- Jurnal manual dengan satuan eksplisit, validasi formulir, ekspor JSON, dan konfirmasi penghapusan.
- Mode 3D konsep berproporsi 45:30:30 (biota disederhanakan) dan simulasi bebas asli. Panduan tetap bekerja tanpa WebGL.
- Navigasi hash yang mendukung tautan langsung/back/forward, tampilan mobile, akses keyboard, reduced motion, dan cetak halaman aktif.

Checklist, alokasi, dan jurnal disimpan melalui `localStorage` di browser/perangkat saat ini; tidak ada akun, cloud sync, sensor, maupun jaminan backup. Ekspor jurnal sebelum menghapus data browser atau berganti perangkat. Browser yang memblokir penyimpanan akan menampilkan peringatan.

## Batas penggunaan

Konten adalah panduan perencanaan umum, belum diaudit ahli akuakultur. Dimensi luar/dalam, konstruksi kaca, stand, dan kelistrikan perlu validasi tenaga kompeten. Ukur suhu ruangan, volume air aktual, dan kebutuhan spesies sebelum membeli biota. Checklist tidak membuktikan kelayakan air. Angka parameter di simulasi adalah contoh buatan, bukan hasil sensor atau target universal.

Model meja, heater, koral, dan alat di 3D tetap ilustratif. Belum ada daftar potong kaca, daftar merek/SKU, harga toko aktual, perhitungan PAR/debit, ataupun persetujuan bahwa tank ini cocok untuk jenis clownfish tertentu. Pendinginan yang ternyata membutuhkan chiller atau kebutuhan struktur baru dapat membuat anggaran tidak cukup.

## Pengembangan lokal

```bash
npm ci
npm run dev
```

## Build dan pemeriksaan

```bash
npx tsc --noEmit
npm run build
npm run preview
```

Build produksi ditulis ke `dist/`. Plugin `vite-plugin-singlefile` menyertakan JavaScript, CSS, dan model ikan ke dalam `dist/index.html`, sehingga model tidak perlu diambil dari server eksternal saat aplikasi berjalan.

## Deploy ke Vercel

Gunakan pengaturan proyek berikut:

- **Framework Preset:** Vite
- **Root Directory:** root repositori (`./`)
- **Install Command:** `npm ci`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Pastikan branch yang dideploy sudah berisi kedua model di `src/assets/`. Jika Production Branch di Vercel adalah `main`, merge perbaikan ke `main` terlebih dahulu, lalu deploy commit terbaru (bukan redeploy commit lama yang belum memiliki model).

## Kredit model ikan

`src/assets/ButterflyFish.glb` dan `src/assets/MandarinFish.glb` adalah model ikan karya [Quaternius](https://quaternius.com), sebagaimana dikreditkan oleh repositori sumber [Nihdao/three-aquarium-challenge](https://github.com/Nihdao/three-aquarium-challenge).

File disalin tanpa perubahan dari direktori `public/assets/` pada commit sumber [`aafa3bf67421a267f743ea68e364d5ca8234bc28`](https://github.com/Nihdao/three-aquarium-challenge/tree/aafa3bf67421a267f743ea68e364d5ca8234bc28/public/assets). Model disimpan langsung dalam Git agar clone bersih dan build Vercel tidak bergantung pada unduhan tambahan.

## Pengujian antarmuka

```bash
npm run typecheck
npx playwright install chromium
npm test
```

Suite Playwright menguji desktop dan mobile: hotspot kebutuhan, perubahan anggaran, persistensi checklist, sembilan tahap perakitan, pergantian diagram, overflow halaman, jurnal/ekspor/hapus, data lokal rusak, penyimpanan terblokir, navigasi browser, serta fallback tanpa WebGL.

Untuk memakai Chromium yang sudah tersedia, atur `CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm test`. Paket Chromium untuk sandbox tidak menjadi dependensi aplikasi. Hasil pengujian berada di direktori yang diabaikan Git.

### Struktur konten

- `src/App.tsx`: navigasi workspace, halaman panduan, dan jurnal.
- `src/guide/data.ts`: spesifikasi, alokasi, tahap rakit, dan materi perawatan.
- `src/guide/Diagram.tsx`: diagram SVG dengan ID unik dan hotspot keyboard.
- `src/guide/storage.ts`: penyimpanan lokal dengan validasi tipe data.
- `src/AquariumView.tsx` dan `src/scene/`: simulasi 3D; bukan mesin perhitungan fisik.
