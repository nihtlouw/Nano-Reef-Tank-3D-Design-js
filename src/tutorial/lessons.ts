export type SupplyId =
  | "tank"
  | "filter"
  | "light"
  | "tests"
  | "rock"
  | "sand"
  | "water"
  | "salt"
  | "bucket"
  | "temp"
  | "power"
  | "siphon"
  | "food"
  | "ammonia";
export const supplies: Record<
  SupplyId,
  { name: string; qty: string; tip: string; reference: string; icon: string }
> = {
  tank: {
    name: "Tank & stand",
    qty: "Rencana: 45 × 30 × 30 cm",
    tip: "Kaca, sambungan, dan kekuatan stand perlu validasi pembuat tank.",
    reference: "tank",
    icon: "tank",
  },
  filter: {
    name: "Filter HOB",
    qty: "1 set + media",
    tip: "Filter gantung dengan media mekanis dan biologis. Cek ruang servis dan kemampuan restart.",
    reference: "filter",
    icon: "filter",
  },
  light: {
    name: "Lampu reef",
    qty: "1 set + timer",
    tip: "Pilih cakupan dan intensitas sesuai koral, bukan berdasarkan warna biru saja.",
    reference: "light",
    icon: "lamp",
  },
  tests: {
    name: "Alat ukur & kit",
    qty: "Salinitas + tes air",
    tip: "Alat salinitas dan kalibrasinya; tes amonia, nitrit, nitrat. Tes tambahan mengikuti kebutuhan koral.",
    reference: "tests",
    icon: "meter",
  },
  rock: {
    name: "Batu reef-safe",
    qty: "Sesuai susunan",
    tip: "Batu legal dari sumber tepercaya. Susunan tidak boleh goyang atau menekan kaca.",
    reference: "scape",
    icon: "rock",
  },
  sand: {
    name: "Pasir reef",
    qty: "Opsional",
    tip: "Gunakan bahan reef-safe. Susunan batu tidak boleh bergantung pada pasir yang mudah bergeser.",
    reference: "scape",
    icon: "sand",
  },
  water: {
    name: "Air RO/DI",
    qty: "Ukur liter aktual",
    tip: "Sumber air terverifikasi. Simpan sebagian air tawar untuk mengganti penguapan.",
    reference: "scape",
    icon: "drop",
  },
  salt: {
    name: "Garam reef",
    qty: "Ikuti petunjuk produk",
    tip: "Garam khusus akuarium laut; takaran mengikuti volume aktual dan hasil ukur salinitas.",
    reference: "scape",
    icon: "salt",
  },
  bucket: {
    name: "Ember & pengaduk",
    qty: "Wadah khusus",
    tip: "Wadah food-grade bebas sabun. Campur garam di sini, terpisah dari tank.",
    reference: "care",
    icon: "bucket",
  },
  temp: {
    name: "Termometer",
    qty: "1 unit",
    tip: "Indoor tanpa AC: ukur suhu siang–malam. Kipas/heater bersyarat; chiller belum termasuk anggaran.",
    reference: "temp",
    icon: "temp",
  },
  power: {
    name: "Listrik terlindung",
    qty: "Perlu pemeriksaan",
    tip: "Grounding dan pengaman arus bocor diperiksa tenaga kompeten. Drip loop tidak menggantikannya.",
    reference: "care",
    icon: "power",
  },
  siphon: {
    name: "Selang sifon",
    qty: "1 set",
    tip: "Gunakan hanya untuk akuarium; jangan disatukan dengan alat rumah tangga yang terkena detergen.",
    reference: "care",
    icon: "hose",
  },
  ammonia: {
    name: "Sumber amonia",
    qty: "Khusus aquarium",
    tip: "Gunakan sumber amonia sesuai protokol fishless cycling dan volume air aktual. Bukan pembersih rumah tangga.",
    reference: "reserve",
    icon: "meter",
  },
  food: {
    name: "Pakan sesuai ikan",
    qty: "Porsi kecil",
    tip: "Identifikasi spesies dan kebutuhan makannya sebelum membeli ikan. Jangan tinggalkan sisa pakan.",
    reference: "reserve",
    icon: "food",
  },
};
export interface Lesson {
  id: string;
  title: string;
  short: string;
  chapter: string;
  label: string;
  summary: string;
  supplies: SupplyId[];
  actions: [string, string, string];
  safety: string;
  done: string;
  detail: string;
  focus: string;
  checkKey: string;
}
export const lessons: Lesson[] = [
  {
    id: "kit",
    title: "Kenali alat & bahanmu",
    short: "Alat & bahan",
    chapter: "Persiapan",
    label: "MULAI DARI SINI",
    summary: "Ini yang perlu kamu siapkan sebelum mulai merakit.",
    supplies: ["tank", "filter", "light", "rock", "water", "tests"],
    actions: [
      "Cocokkan alat di meja dengan daftar di bawah.",
      "Periksa ukuran tank dan kondisi setiap alat.",
      "Pisahkan alat yang belum ada ke daftar belanja.",
    ],
    safety:
      "Belum perlu membeli ikan atau anemon. Dahulukan alat, pengukuran, dan kestabilan.",
    done: "Saya sudah memeriksa kebutuhan awal.",
    checkKey: "lesson-kit",
    focus: "Semua alat di satu meja",
    detail:
      "Alokasi awal Rp4,8 juta bukan harga toko terverifikasi. Daftar ini juga memerlukan garam, ember, termometer, perlindungan listrik, dan alat perawatan pada tahap berikutnya. Jika kebutuhan dasar melebihi anggaran, tunda biota. Dimensi kaca dan stand dikonfirmasi pembuat, bukan disalin dari ilustrasi.",
  },
  {
    id: "location",
    title: "Pilih tempat & siapkan stand",
    short: "Tempat & stand",
    chapter: "Persiapan",
    label: "FONDASI YANG AMAN",
    summary: "Pilih permukaan rata, kuat, dan mudah dijangkau.",
    supplies: ["tank", "temp", "power"],
    actions: [
      "Jauhkan tank dari matahari langsung dan area ramai.",
      "Periksa stand: rata, tidak goyang, dan mampu menahan beban terisi.",
      "Catat suhu siang–malam; sisakan ruang servis di belakang.",
    ],
    safety:
      "Tanpa AC, kipas belum tentu cukup. Pastikan kontrol suhu memungkinkan sebelum membeli biota.",
    done: "Lokasi, stand, dan kebutuhan kontrol suhu sudah diperiksa.",
    checkKey: "step-location",
    focus: "Stand rata · akses belakang bebas",
    detail:
      "Minta pembuat memvalidasi kaca, silikon aquarium-safe, dukungan dasar, dan beban total termasuk air, kaca, batu, dan alat. Gunakan alas hanya jika sesuai petunjuk pembuat. Meja ilustrasi tidak memiliki sertifikasi beban. Ukur suhu beberapa hari termasuk hari panas; jika perlu chiller, revisi anggaran/lokasi.",
  },
  {
    id: "leak",
    title: "Uji tank dengan air tawar",
    short: "Uji kebocoran",
    chapter: "Persiapan",
    label: "UJI SEBELUM MERAKIT",
    summary: "Pastikan tidak ada rembes sebelum alat dan batu dipasang.",
    supplies: ["tank", "bucket", "siphon"],
    actions: [
      "Isi air tawar di tempat uji yang aman.",
      "Periksa dasar, sambungan, dan stand selama uji.",
      "Setelah lolos, kuras air uji sebelum melanjutkan.",
    ],
    safety:
      "Ikuti durasi uji pembuat tank. Jangan memindahkan tank yang masih berisi air.",
    done: "Tidak ada rembes; air uji sudah dikuras.",
    checkKey: "step-leak",
    focus: "Air tawar saja · belum ada batu",
    detail:
      "Periksa retak, deformasi, dan kebasahan dengan tisu di sisi luar. Area uji harus mampu menangani kebocoran. Jauhkan listrik dari percikan dan jangan melakukan perbaikan sambungan saat tank penuh. Bila ada masalah, hentikan dan hubungi pembuat tank.",
  },
  {
    id: "equipment",
    title: "Pasang filter, lampu & kabel",
    short: "Pasang peralatan",
    chapter: "Perakitan",
    label: "KENALI POSISINYA",
    summary: "Pasang alat pada tank kosong. Belum dinyalakan.",
    supplies: ["filter", "light", "temp", "power"],
    actions: [
      "Gantung HOB di belakang dan pasang medianya.",
      "Pasang lampu dan termometer sesuai petunjuk alat.",
      "Buat drip loop; jauhkan stopkontak dari percikan.",
    ],
    safety:
      "Jangan menyalakan pompa atau heater saat kering. Instalasi listrik perlu pemeriksaan tenaga kompeten.",
    done: "Posisi alat dan kabel sudah diperiksa; listrik belum dinyalakan.",
    checkKey: "step-equipment",
    focus: "HOB di belakang · kabel melengkung turun",
    detail:
      "Sisakan ruang membuka HOB dan mengangkat media. Ikuti urutan media dan ketinggian air yang ditentukan produsen. Stopkontak terlindung, grounding, dan RCD yang sesuai perlu pemeriksaan tenaga kompeten. Heater bukan alat wajib otomatis untuk ruangan ini.",
  },
  {
    id: "scape",
    title: "Susun batu, lalu tambahkan pasir",
    short: "Batu & pasir",
    chapter: "Perakitan",
    label: "BENTUK RUMAHNYA",
    summary:
      "Buat susunan rendah dan kokoh, dengan ruang untuk membersihkan kaca.",
    supplies: ["rock", "sand", "tank"],
    actions: [
      "Susun batu agar stabil dan tidak menekan kaca samping.",
      "Sisakan jalur berenang, aliran, dan akses sifon.",
      "Tambahkan pasir bila dipakai; jangan menumpuknya di intake.",
    ],
    safety:
      "Batu tidak boleh bergantung pada pasir yang mudah bergeser. Gunakan bahan reef-safe.",
    done: "Batu tidak goyang dan akses pembersihan tersedia.",
    checkKey: "step-scape",
    focus: "Batu stabil · ada jarak dari kaca",
    detail:
      "Perlindungan kaca dasar mengikuti petunjuk pembuat. Gunakan batu legal dari sumber tepercaya, perekat khusus reef bila diperlukan, dan patuhi waktu curing perekat. Bentuk/jumlah batu pada gambar adalah contoh tata letak, bukan takaran wajib.",
  },
  {
    id: "mix",
    title: "Campur air laut di ember",
    short: "Siapkan air laut",
    chapter: "Perakitan",
    label: "CAMPUR DI LUAR TANK",
    summary:
      "Air RO/DI + garam reef, dicampur dan diukur dalam wadah terpisah.",
    supplies: ["water", "salt", "bucket", "tests"],
    actions: [
      "Isi ember khusus dengan air RO/DI yang terukur.",
      "Campur garam mengikuti instruksi produk sampai larut.",
      "Ukur salinitas dengan alat yang sudah dikalibrasi.",
    ],
    safety:
      "Bukan air keran dan garam dapur. Jangan menambahkan garam kering ke tank berbiota.",
    done: "Air laut sudah tercampur dan salinitasnya terukur.",
    checkKey: "lesson-mix",
    focus: "Air dicampur di ember · bukan di tank",
    detail:
      "Ikuti takaran, suhu, urutan, dan lama pencampuran dari produsen garam. Salinitas akhir disesuaikan kebutuhan spesies; aplikasi tidak menghitung dosis universal. Gunakan larutan kalibrasi yang cocok untuk alat. Pisahkan cadangan RO/DI tawar untuk top-off.",
  },
  {
    id: "water",
    title: "Isi tank perlahan",
    short: "Isi air laut",
    chapter: "Perakitan",
    label: "CATAT VOLUME NYATANYA",
    summary:
      "Tuang air laut yang sudah siap tanpa merusak susunan batu dan pasir.",
    supplies: ["bucket", "siphon", "tests", "temp"],
    actions: [
      "Alirkan air perlahan agar pasir tidak berhamburan.",
      "Isi sampai batas kerja HOB, bukan sampai bibir kaca.",
      "Catat liter aktual dan tandai muka air saat sistem berjalan.",
    ],
    safety:
      "40,5 L adalah volume geometris. Jangan memakainya sebagai volume dosis otomatis.",
    done: "Air terisi, volume aktual dicatat, dan batas alat dipatuhi.",
    checkKey: "step-water",
    focus: "Muka air di bawah bibir kaca",
    detail:
      "Batu, pasir, ketebalan kaca, dan ruang kosong mengurangi volume air; air di filter juga termasuk sistem. Cek salinitas dan suhu kembali. Jangan memperkirakan dosis obat, amonia, atau suplemen dari ukuran luar tank.",
  },
  {
    id: "operation",
    title: "Nyalakan & uji sistem",
    short: "Uji aliran & suhu",
    chapter: "Menjalankan",
    label: "PASTIKAN SEMUA BEKERJA",
    summary: "Cek aliran, suhu, dan kemampuan filter menyala kembali.",
    supplies: ["filter", "temp", "power"],
    actions: [
      "Isi/prime HOB sesuai petunjuk, lalu nyalakan alat yang diperlukan.",
      "Amati agitasi permukaan, endapan, kebocoran, dan suhu.",
      "Uji listrik mati/menyala dengan aman; periksa restart filter.",
    ],
    safety:
      "Jangan tinggalkan alat sebelum terbukti tidak meluap atau berjalan kering saat restart.",
    done: "Sistem berjalan aman dan suhu dapat dikendalikan.",
    checkKey: "step-operation",
    focus: "Return HOB → permukaan → intake",
    detail:
      "Pompa tambahan hanya bila dibutuhkan; gunakan aliran yang bisa diatur. Kipas meningkatkan penguapan dan belum tentu cukup di ruangan lembap/panas. Evaluasi heater berdasarkan suhu malam. Rencanakan aerasi cadangan untuk listrik padam.",
  },
  {
    id: "cycle",
    title: "Cycling dulu, tanpa ikan",
    short: "Cycling tanpa ikan",
    chapter: "Menjalankan",
    label: "TIDAK BISA DILEWATI DI DUNIA NYATA",
    summary: "Bangun biofilter dan buktikan kemampuannya lewat hasil tes.",
    supplies: ["tests", "ammonia", "temp"],
    actions: [
      "Pilih protokol fishless cycling dan sumber amonia khusus aquarium.",
      "Catat amonia, nitrit, dan nitrat beserta satuannya.",
      "Verifikasi biofilter sesuai protokol sebelum menyiapkan introduksi.",
    ],
    safety:
      "Bukan menunggu beberapa hari lalu otomatis siap. Jangan cycling memakai ikan atau amonia pembersih.",
    done: "Saya sudah memverifikasi hasil uji sesuai protokol, bukan hanya menunggu.",
    checkKey: "step-cycle",
    focus: "Belum ada ikan · tes dan catat",
    detail:
      "Sumber amonia khusus aquarium dan bakteri bila digunakan mengikuti petunjuk produk serta volume aktual. Kit berbasis N berbeda dari NH3/NH4, NO2, atau NO3; ikuti konversi kit. Siapkan kembali kualitas air sebelum introduksi. Menekan Lanjut hanya membuka pelajaran berikutnya, bukan meluluskan cycling.",
  },
  {
    id: "livestock",
    title: "Masukkan biota secara bertahap",
    short: "Biota pertama",
    chapter: "Menjalankan",
    label: "HANYA SETELAH SISTEM SIAP",
    summary: "Validasi spesies dan kesiapan air sebelum membeli biota pertama.",
    supplies: ["tests", "food", "temp"],
    actions: [
      "Konfirmasi spesies, ukuran dewasa, pakan, dan ruang yang dibutuhkan.",
      "Siapkan karantina/aklimatisasi sesuai spesies dan kondisi air.",
      "Satu introduksi per tahap; amati respons sebelum menambah lagi.",
    ],
    safety:
      "Biota pada desain asli adalah target visual, bukan paket penghuni untuk tank 45 cm. Anemon tidak wajib.",
    done: "Kesesuaian spesies, kesehatan, dan kesiapan air sudah ditinjau.",
    checkKey: "step-livestock",
    focus: "Desain asli · bukan rekomendasi stocking",
    detail:
      "Tank 45 cm ini tidak otomatis cocok untuk satu atau sepasang clownfish. Tinjau kebutuhan dengan aquarist kompeten, dan naikkan ukuran tank jika diperlukan. Mandarin, butterflyfish, dan anemon bukan paket awal. Pilih koral setelah cahaya, aliran, dan stabilitas tervalidasi; bentuk koral di gambar bukan rekomendasi spesies.",
  },
  {
    id: "care",
    title: "Rawat sedikit, tetapi rutin",
    short: "Perawatan rutin",
    chapter: "Merawat",
    label: "KEBIASAAN KECIL, SETIAP HARI",
    summary: "Periksa alat, ganti penguapan, dan simpan hasil pengukuran.",
    supplies: ["water", "siphon", "tests", "food"],
    actions: [
      "Harian: cek suhu, alat, perilaku ikan, dan porsi pakan.",
      "Top-off penguapan dengan RO/DI tawar ke tanda muka air.",
      "Tes, bersihkan, dan ganti air laut sesuai hasil evaluasi tank.",
    ],
    safety:
      "Top-off = air tawar RO/DI. Ganti air = air laut baru dengan suhu/salinitas sesuai.",
    done: "Saya memahami rutinitas dan sudah menyiapkan catatan perawatan.",
    checkKey: "lesson-care",
    focus: "RO/DI tawar untuk penguapan",
    detail:
      "Cabut alat yang akan terekspos udara saat mengganti air; periksa restart setelahnya. Jangan mengganti seluruh media biologis sekaligus atau dosing tanpa hasil tes. Gunakan alat bebas detergen dan APD untuk koral. Jangan merebus/mengaerosolkan zoanthid/palythoa. Lihat referensi perawatan untuk keadaan darurat.",
  },
];
export const isLessonIndex = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v < lessons.length;
export function indexFromHash(hash: string): number | null {
  const match = /^#tutorial\/(\d+)$/.exec(hash);
  if (!match) return null;
  const index = Number(match[1]);
  return isLessonIndex(index) ? index : null;
}
