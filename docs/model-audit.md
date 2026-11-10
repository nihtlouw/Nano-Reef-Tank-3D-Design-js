# Audit bentuk dan render model Nano Reef

Audit ini memperbaiki model yang sama-sama dipakai Tutorial Visual dan Eksplorasi 3D; bukan mengganti scene asli dengan akuarium lain. Tata letak reef, dua anemon utama, koloni hijau, bingkai hitam, dan suasana actinic tetap dipertahankan.

## Temuan per objek dan perbaikan

| Objek                     | Masalah pada implementasi sebelumnya                                                                                    | Perbaikan                                                                                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kaca dan bingkai tank     | Alas/rangka bawah masuk sedikit ke meja; backdrop menghilang saat dilihat dari belakang.                                | Alas diselaraskan dengan permukaan meja, backdrop dirender dua sisi, kamera tutorial menyertakan keseluruhan lampu dan bingkai.                                                                               |
| Panel LED                 | Tiang menjulang jauh di atas tank; lengan tidak menyambung ke panel. Bidang glow besar menyamarkan bentuk lampu.        | Dudukan jepit, riser pendek, lengan horizontal dan sambungan panel bertemu secara geometris. Sirip pendingin dan titik LED menggantikan glow plane. LED tidak menyala pada tahap pemasangan kering.           |
| Kabel                     | Ada kabel dekoratif menggantung tanpa asal; peralatan tidak memiliki jalur kabel yang jelas.                            | Kabel dekoratif dihapus. Kabel lampu, pompa, heater dan filter mengikuti badan alat menuju belakang tank; beberapa jalur memiliki loop ke bawah. Ini ilustrasi, bukan rancangan kelistrikan tersertifikasi.   |
| Filter HOB                | Kotak, pipa intake dan deretan comb terpisah; aliran balik tidak memiliki ramp yang tersambung.                         | Housing/lid, pipa U melintasi bibir tank, strainer bersirip dengan celah, serta ramp return dan dinding samping ditambahkan. Housing tetap di belakang kaca.                                                  |
| Powerhead/nozzle          | Powerhead seperti tutup silinder; loc-line hanya deretan bola terpisah dan torus yang tidak tersambung.                 | Dudukan, leher, motor, hub dan kisi depan dimodelkan. Nozzle berupa tabung kontinu dengan ujung terbuka, tersambung ke badan pompa. Ini bentuk ilustratif, bukan model produk tertentu.                       |
| Heater                    | Batang transparan polos tanpa tutup, pengikat atau sambungan kabel.                                                     | Tabung, elemen spiral internal, tutup, dua bracket/suction mount dan kabel ditambahkan.                                                                                                                       |
| Air                       | Permukaan terlalu metalik/berkilau; highlight dari atas menghilangkan detail. Gelombang dapat melampaui pinggir tank.   | Metalness dihilangkan, refleksi/specular dikurangi, roughness dinaikkan. Amplitudo gelombang memudar mendekati kaca. Intensitas pencahayaan diseimbangkan.                                                    |
| Pasir                     | Hanya sisi depan tertutup; sisi kiri/kanan terbuka dari sudut miring.                                                   | Skirt empat sisi mengikuti height field yang sama dengan permukaan pasir. Winding/normals menghadap keluar.                                                                                                   |
| Batu                      | Mesh kasar menghasilkan tonjolan rendah resolusi; material batu kering sudah tampak berlapis biota.                     | Subdivisi meningkat tanpa mengganti komposisi atau silhouette dasar reef. Warna mineral untuk tahap kering, warna coralline untuk tahap biota.                                                                |
| Polip hijau               | Sampling hanya pada vertex menyebabkan instansi menumpuk; ujung cone membuatnya seperti gumpalan bercahaya.             | Sampling berdasarkan luas segitiga dan normal permukaan, dengan seed deterministik. Setiap polip punya delapan jari terpisah; emissive diturunkan agar bentuk tetap terbaca.                                  |
| Zoanthid/Duncan           | Posisi polip dihitung dari ellipsoid berbeda dari batu mound, sehingga sebagian mengambang/terbenam.                    | Raycast ke mound sesungguhnya menentukan titik dan normal akar polip. Koloni di reef memakai permukaan batu sebagai acuan tinggi.                                                                             |
| Mushroom                  | Hemisphere terbuka di bawah; beberapa posisi menggunakan tinggi pasir walaupun berada di atas batu.                     | Permukaan bawah tipis menutup badan mushroom. Posisi ditautkan ke height field reef, bukan offset ketinggian sembarang.                                                                                       |
| Torch                     | Memakai proporsi kaki anemon besar sehingga tampak seperti kepala di atas kaki panjang.                                 | Tinggi kaki mengikuti radius kepala. Cabang skeletal tersambung dari dasar koloni ke masing-masing kepala.                                                                                                    |
| Anemon                    | Silinder, bola bulb dan tip terpisah menimbulkan sambungan/cap seperti ujung sedotan. Akar tidak mengikuti cakram oral. | Satu profil lathe tertutup per tentakel dengan bulb membulat; bentuk melengkung, akar mengikuti cakram, tilt dikurangi dan kaki mengikuti skala. Warna cakram lebih menyatu dengan jaringan anemon.           |
| Clownfish/goby prosedural | Winding badan terbalik, moncong terbuka, operasi pangkat pada nilai sin negatif berpotensi menghasilkan NaN di sirip.   | Winding/normals diperbaiki, moncong ditutup, input pangkat dijaga nonnegatif. Semua varian diuji untuk koordinat/normal finite.                                                                               |
| Gerak ikan                | Batas tank saja tidak mencegah ikan masuk ke pasir atau batu.                                                           | Tinggi bebas minimal mengikuti height field yang diraycast dari geometri reef. Ini penghindaran sederhana, bukan collision engine volume penuh; tidak menjamin tak ada perpotongan antarsesama ikan/tentakel. |
| Ikan GLB                  | Skeleton clone masih berbagi material; mengubahnya memodifikasi asset cache.                                            | Material diklon sebelum perubahan, fase animasi memakai seed, material/skeleton clone dibersihkan saat unmount. Model asli dan kreditnya tetap dipertahankan.                                                 |
| Ember                     | Dinding tanpa dasar, label melayang, gagang tidak bertemu badan.                                                        | Profil lathe membentuk dinding luar/dalam, rim, lantai dan underside. Gagang berakhir pada pin engsel, grip tersambung, label mengikuti lengkung dinding, dasar menyentuh meja.                               |
| Wadah garam               | Silinder tanpa detail penutup, label datar jauh dari permukaan.                                                         | Tutup dimodelkan dan label melengkung mengikuti wadah.                                                                                                                                                        |
| Test kit                  | Vial berdiri tanpa tray, cairan merupakan silinder transparan tunggal.                                                  | Tray menopang vial; cairan, dinding vial dan tutup dimodelkan terpisah.                                                                                                                                       |
| Sampel batu tutorial      | Offset Y menyebabkan batu melayang dari meja.                                                                           | Bounding box mesh menentukan tinggi penempatan dasar secara tepat.                                                                                                                                            |
| Ruangan/meja              | Kabel dekoratif tanpa sambungan mengganggu pembacaan peralatan.                                                         | Kabel dihapus; ruangan dan meja asli dipertahankan. Tidak ada klaim validasi beban struktur meja.                                                                                                             |

## Pemeriksaan otomatis

`tests/geometry.spec.ts` memeriksa:

- Semua varian ikan dan sirip memiliki koordinat/normal finite; ray dari luar melihat sisi luar badan dan moncong tertutup.
- Ember terbuka di atas, tetapi memiliki lantai, underside dan dinding luar yang benar.
- Empat sisi pasir memiliki winding keluar dan tepi atas mengikuti height field.
- Geometri batu kering dan matang identik secara posisi; material warnanya berbeda.
- Height field penempatan berasal dari rockscape aktual.
- Polip hijau tersusun dari delapan jari, bukan cone padat.

Suite antarmuka yang sudah ada tetap memeriksa navigasi, semua gambar, resume/progres manual, unduhan, keyboard/mobile, fallback tanpa WebGL dan penyimpanan lokal.

## Audit visual yang dapat diulang

Dengan Vite berjalan:

```bash
node scripts/audit-scene.mjs
```

Script mengunduh frame canvas WebGL asli dari depan, sudut, atas dan dalam, lalu scene tutorial dan mobile. Frame disimpan lokal di `.cache/scene-audit/` (diabaikan Git); **tidak ada golden screenshot yang dianggap membuktikan akurasi objek**. Pemeriksaan visual manual tetap diperlukan.

Untuk membagi audit di renderer software yang lambat:

```bash
SCENE_AUDIT_VIEWS=top SCENE_AUDIT_LIGHTS=0 SCENE_AUDIT_STAGES=9 node scripts/audit-scene.mjs
```

`SCENE_AUDIT_STAGES` menerima indeks dipisah koma; string kosong melewati tahap tutorial. `SCENE_AUDIT_MOBILE=0` melewati mobile; `SCENE_AUDIT_BASE_URL` dan `SCENE_AUDIT_DIR` mengubah server/tujuan. Browser alternatif: `CHROMIUM_EXECUTABLE_PATH`.

Semua gambar pelajaran diperbarui melalui `scripts/capture-tutorial.mjs`, sehingga model live dan still memakai geometri bersama.

## Batas yang tetap berlaku

Ini model edukasi real-time dengan geometri prosedural dan dua asset ikan GLB, **bukan scan fotorealistik, model biologis presisi, CAD manufaktur, atau simulator fluida**. Tidak ada klaim kesesuaian alat dengan produk/SKU tertentu. Proporsi scene asli bukan gambar konstruksi tank 45 cm, dan seluruh biota yang terlihat bukan paket stocking yang disetujui untuk ukuran tersebut. Pembenahan visual tidak menggantikan validasi konstruksi, listrik, suhu, debit/PAR, dan kebutuhan spesies.
