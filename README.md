# Nano Reef — Tutorial Visual & Eksplorasi 3D

Aplikasi berbahasa Indonesia dengan **dua tujuan saja**:

- **Tutorial Visual** (`#tutorial/0`–`#tutorial/10`): sebelas tahap, gambar 3D, bahan, tiga tindakan, dan tombol lanjut.
- **Eksplorasi 3D** (`#explore`): desain akuarium asli dengan kaca, susunan batu detail, koral, anemon, ikan, lampu, dan peralatan. Kamera, cahaya, gerakan aliran, biota tambahan, serta pakan simulasi dapat diubah.

Dashboard, identitas Reefnotes, daftar belanja terpisah, diagram teknis, halaman perakitan lama, cycling, dan jurnal telah dihapus dari antarmuka. Tautan hash lama membuka tutorial, bukan halaman lama. Data lokal lama tidak dihapus; antarmuka jurnal/anggaran tidak lagi tersedia.

## Satu model untuk tutorial dan eksplorasi

`src/scene/Scene.tsx` menjadi sumber bersama: **tidak ada model akuarium sederhana pengganti**. Tutorial menampilkan bagian model asli sesuai urutan pemasangan. Batu/pasir memakai geometri dan tekstur asli; polip, koral, anemon, serta ikan baru terlihat pada tahap biota. Tahap mixing menambahkan ember terpisah, cycling menambahkan test kit, dan perawatan menambahkan ember RO/DI.

1. Kenali alat dan bahan.
2. Pilih lokasi dan siapkan stand.
3. Uji kebocoran dengan air tawar, lalu kuras.
4. Pasang filter, lampu, dan kabel; belum dinyalakan.
5. Susun batu dan pasir.
6. Campur air laut di ember terpisah.
7. Isi tank dan catat volume aktual.
8. Uji aliran, suhu, serta restart alat.
9. Cycling tanpa ikan.
10. Evaluasi dan tambahkan biota bertahap.
11. Perawatan rutin; top-off dengan air tawar RO/DI.

Gambar WebP adalah **render 3D**, bukan foto tank nyata atau video, dan tetap tersedia tanpa WebGL. Mode Interaktif menggunakan scene yang sama, dengan animasi penempatan/pengisian opsional. Tidak ada autoplay, sensor, angka suhu/pH buatan, atau kelulusan cycling otomatis. **Lanjut hanya menavigasi**; checklist adalah catatan manual.

Posisi terakhir, kesiapan bahan, dan checklist disimpan di `localStorage` browser saat ini. Checklist lama tetap dikenali. Tidak ada akun, cloud sync, atau jaminan backup. Penyimpanan terblokir/penuh menampilkan peringatan. Gambar dapat diunduh sebagai WebP atau PNG dari canvas interaktif.

## Batas penggunaan

Rencana awal tetap 45 × 30 × 30 cm, di bawah Rp5 juta, indoor tanpa AC. **Model asli tidak diskalakan ulang menjadi gambar kerja 45 cm**; geometri visual bukan spesifikasi konstruksi. Semua ikan, koral, dan anemon pada desain lengkap adalah referensi visual, **bukan paket stocking yang dinyatakan aman untuk tank 45 cm**. Anemon tidak wajib dan bukan biota awal.

Konten belum diaudit ahli akuakultur. Validasi ukuran kaca, stand, kelistrikan, suhu ruangan, volume aktual, alat, serta kebutuhan spesies secara terpisah. Tidak ada harga toko terkini, perhitungan PAR/debit, daftar potong kaca, atau persetujuan stocking. Pendinginan/struktur tambahan dapat membuat anggaran tidak cukup. Efek aliran dan pakan di eksplorasi hanya simulasi visual.

## Pengembangan dan pengujian

```bash
npm ci
npm run dev -- --host 0.0.0.0
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Playwright mencakup desktop/mobile: dua tujuan navigasi, penghapusan halaman lama, semua sebelas gambar, resume/checklist lama, unduhan, panel bab dan fokus keyboard, navigasi browser, kondisi penyimpanan rusak/terblokir, fallback WebGL, kontrol eksplorasi, dan aturan kemunculan komponen per tahap. `CHROMIUM_EXECUTABLE_PATH=/path/to/chromium` dapat digunakan untuk browser alternatif. Chromium sandbox tidak menjadi dependensi aplikasi.

### Memperbarui gambar tahap

Dengan server development berjalan:

```bash
node scripts/capture-tutorial.mjs
# Render tahap tertentu:
node scripts/capture-tutorial.mjs 0 4 9
```

Script membuka `?capture=N` khusus development, menunggu scene asli siap, dan menyimpan sebelas WebP 1200 × 675 di `src/tutorial/stills/`. Mendukung `CAPTURE_BASE_URL` dan `CHROMIUM_EXECUTABLE_PATH`. Rute capture tidak aktif di build produksi.

### Struktur

- `src/App.tsx`: header bersama dan dua tujuan navigasi.
- `src/tutorial/Tutorial.tsx`: pelajaran, bab, bahan, unduhan, dan progres.
- `src/tutorial/lessons.ts`: materi dan kebutuhan.
- `src/tutorial/stages.ts`: aturan kemunculan bagian model.
- `src/tutorial/Stage3D.tsx`: canvas tutorial/capture untuk scene asli.
- `src/tutorial/TutorialTools.tsx`: ember/test kit pelengkap tutorial.
- `src/Exploration.tsx`: kontrol dan fallback eksplorasi.
- `src/AquariumView.tsx`, `src/scene/`: model akuarium asli yang digunakan bersama.
- `src/guide/storage.ts`: helper penyimpanan lokal yang dipertahankan untuk tutorial.

## Build dan deploy Vercel

- Framework: **Vite**
- Root: `./`
- Install: `npm ci`
- Build: `npm run build`
- Output: `dist`

Plugin `vite-plugin-singlefile` menyertakan JavaScript, CSS, gambar, dan model ikan ke `dist/index.html`, tanpa unduhan model eksternal saat aplikasi berjalan. Deploy commit terbaru yang sudah memuat kedua model di `src/assets/`. Jika production branch adalah `main`, perubahan perlu digabungkan ke `main` sebelum deploy.

## Kredit model ikan

`src/assets/ButterflyFish.glb` dan `src/assets/MandarinFish.glb` karya [Quaternius](https://quaternius.com), sebagaimana dikreditkan oleh [Nihdao/three-aquarium-challenge](https://github.com/Nihdao/three-aquarium-challenge).

File disalin tanpa perubahan dari `public/assets/` pada commit sumber [`aafa3bf67421a267f743ea68e364d5ca8234bc28`](https://github.com/Nihdao/three-aquarium-challenge/tree/aafa3bf67421a267f743ea68e364d5ca8234bc28/public/assets). Model disimpan dalam Git agar clone bersih dan build tidak bergantung pada unduhan tambahan.

## Audit bentuk dan kualitas render

Rincian temuan per objek, perbaikan sambungan/geometri/material, batas model,
serta prosedur review beberapa sudut tersedia di [audit model 3D](docs/model-audit.md).
`tests/geometry.spec.ts` menambahkan pemeriksaan winding ikan, koordinat finite,
ember berdasar, empat sisi pasir, penempatan pada reef aktual, dan bentuk polip.
Frame audit lokal dari `scripts/audit-scene.mjs` disimpan di `.cache/scene-audit/`,
bukan sebagai aset aplikasi atau golden screenshot.
