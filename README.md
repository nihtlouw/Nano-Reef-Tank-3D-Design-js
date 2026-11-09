# Nano-Reef-Tank-3D-Design-js

Simulasi akuarium nano reef menggunakan React, Three.js, dan Vite.

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
