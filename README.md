# Nano-Reef-Tank-3D-Design-js

**Reef Notes** adalah workspace berbahasa Indonesia untuk merencanakan nano reef 45 × 30 × 30 cm dengan batas anggaran awal di bawah Rp5 juta, target clownfish/koral, dan lokasi indoor tanpa AC. Simulasi React/Three.js asli tetap tersedia sebagai visualisasi, bukan spesifikasi siap rakit.

## Mulai dari tutorial visual

Halaman awal kini langsung membuka **tutorial 11 langkah**, bukan dashboard referensi:

1. Kenali alat dan bahan.
2. Pilih lokasi dan siapkan stand.
3. Uji kebocoran dengan air tawar, lalu kuras.
4. Pasang filter, lampu, dan kabel (belum dinyalakan).
5. Susun batu dan pasir.
6. Campur air laut di ember terpisah.
7. Isi tank dan catat volume aktual.
8. Uji aliran, suhu, serta restart alat.
9. Cycling tanpa ikan.
10. Evaluasi dan tambahkan biota bertahap.
11. Perawatan rutin.

Setiap langkah memiliki gambar 3D tersendiri, kartu kebutuhan, tiga instruksi singkat, peringatan penting, dan tombol **Lanjut** di dekat gambar maupun bagian bawah. Penjelasan panjang disembunyikan dalam detail opsional. Daftar bab menampilkan thumbnail seperti tutorial; di mobile tersedia sebagai panel yang dapat ditutup dengan Escape.

Gambar WebP dirender dari scene Three.js milik proyek, bukan foto tank nyata atau video. Gambar tetap dapat dilihat tanpa WebGL. Tombol **Interaktif** membuka model tahap tersebut, dengan animasi penempatan sederhana pada tahap tertentu. Tidak ada autoplay antar-pelajaran, audio, timer kelulusan cycling, atau penilaian otomatis kondisi air.

- `#tutorial/0` sampai `#tutorial/10`: tautan langsung ke langkah tertentu.
- Posisi terakhir disimpan lokal. Checklist lama tidak dihapus.
- Tombol **Lanjut** hanya menavigasi; status selesai harus ditandai sendiri.
- Gambar tiap tahap dapat diunduh (WebP statis atau PNG dari canvas interaktif).
- Daftar belanja, diagram teknis, jurnal, dan simulasi lama tetap tersedia sebagai **referensi tambahan**.

### Memperbarui gambar tahap

Jalankan server Vite, lalu dari terminal lain:

```bash
npx playwright install chromium
node scripts/capture-tutorial.mjs
# Atau render ulang tahap tertentu:
node scripts/capture-tutorial.mjs 0 4 8
```

Script membuka rute capture khusus development, mengambil 11 scene dari `Stage3D.tsx`, dan menyimpan WebP 1200 × 675 ke `src/tutorial/stills/`. Rute capture tidak aktif di build produksi. Browser alternatif dapat ditentukan melalui `CHROMIUM_EXECUTABLE_PATH`; script juga menerima `CAPTURE_BASE_URL`.

## Fitur referensi lengkap

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

Suite Playwright menguji tutorial dan referensi pada desktop/mobile: navigasi 11 gambar berbeda, resume/progres, unduhan gambar, panel bab, fallback WebGL, pelestarian checklist lama, serta hotspot kebutuhan, perubahan anggaran, persistensi checklist, sembilan tahap perakitan, pergantian diagram, overflow halaman, jurnal/ekspor/hapus, data lokal rusak, penyimpanan terblokir, navigasi browser, serta fallback tanpa WebGL.

Untuk memakai Chromium yang sudah tersedia, atur `CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm test`. Paket Chromium untuk sandbox tidak menjadi dependensi aplikasi. Hasil pengujian berada di direktori yang diabaikan Git.

### Struktur konten

- `src/App.tsx`: memilih tutorial utama atau referensi berdasarkan hash.
- `src/tutorial/Tutorial.tsx`: antarmuka langkah, daftar bab, bahan, unduhan gambar, dan progres.
- `src/tutorial/lessons.ts`: materi singkat per langkah dan spesifikasi kebutuhan.
- `src/tutorial/Stage3D.tsx`: model perakitan bertahap dan animasi sederhana.
- `src/tutorial/stills/`: 11 hasil render yang tetap tampil tanpa WebGL.
- `src/ReferenceApp.tsx`: workspace referensi lengkap dan jurnal lama.
- `src/guide/data.ts`: spesifikasi, alokasi, tahap rakit, dan materi perawatan.
- `src/guide/Diagram.tsx`: diagram SVG dengan ID unik dan hotspot keyboard.
- `src/guide/storage.ts`: penyimpanan lokal dengan validasi tipe data.
- `src/AquariumView.tsx` dan `src/scene/`: simulasi 3D; bukan mesin perhitungan fisik.
