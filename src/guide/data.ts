export const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
export const PLAN = { width: 45, depth: 30, height: 30, budget: 5_000_000 };
export const grossVolume = (PLAN.width * PLAN.depth * PLAN.height) / 1000;

export const equipment = [
  {
    id: "tank",
    name: "Tank & penopang",
    category: "Struktur",
    qty: "1 set",
    priority: "Wajib",
    budget: 800000,
    spec: "Tank 45 × 30 × 30 cm. Konfirmasi ukuran luar/dalam, jenis kaca, ketebalan, sambungan, dan penopang kepada pembuat tank.",
    purpose:
      "Menahan air dan seluruh beban sistem. Meja harus rata, tahan lembap, dan tervalidasi untuk beban terisi; meja dekoratif di 3D bukan acuan struktur.",
  },
  {
    id: "filter",
    name: "Filter HOB & media",
    category: "Filtrasi",
    qty: "1 set",
    priority: "Wajib",
    budget: 400000,
    spec: "Filter gantung yang mudah dibuka; media biologis, media mekanis, intake guard, dan suku cadang tersedia. Cek ruang belakang dan batas tinggi air produsen.",
    purpose:
      "Menangkap kotoran dan menyediakan tempat biofilter. Pilih berdasarkan aliran aktual, kemampuan restart, dan kebutuhan perawatan, bukan label kapasitas saja.",
  },
  {
    id: "flow",
    name: "Sirkulasi tambahan",
    category: "Filtrasi",
    qty: "0–1 unit",
    priority: "Bersyarat",
    budget: 200000,
    spec: "Pompa kecil dengan aliran dapat diatur, pengaman intake, dan dudukan sesuai kaca. Beli jika hasil uji HOB menunjukkan area stagnan.",
    purpose:
      "Membantu distribusi oksigen dan mencegah endapan. Jangan arahkan jet langsung ke koral atau sampai pasir terangkat.",
  },
  {
    id: "light",
    name: "Lampu reef & dudukan",
    category: "Pencahayaan",
    qty: "1 set",
    priority: "Sebelum koral",
    budget: 700000,
    spec: "Cakupan untuk panjang 45 cm, timer, dimmer, dan pemasangan aman dari percikan. Evaluasi PAR berdasarkan jenis koral dan tinggi pemasangan.",
    purpose:
      "Mendukung kebutuhan fotosintesis koral. Warna biru atau daya watt saja tidak membuktikan kecukupan cahaya.",
  },
  {
    id: "tests",
    name: "Alat ukur & test kit",
    category: "Pengukuran",
    qty: "1 paket",
    priority: "Wajib",
    budget: 800000,
    spec: "Refraktometer/alat salinitas + larutan kalibrasi sesuai alat; kit amonia, nitrit, nitrat untuk cycling. Tambahkan pH, alkalinitas, fosfat; Ca/Mg sesuai koral.",
    purpose:
      "Mengukur kondisi nyata sebelum membuat keputusan. Cek rentang ukur, masa berlaku reagen, dan kecocokan untuk air laut. Tidak semua kit mungkin tercakup oleh alokasi ini.",
  },
  {
    id: "scape",
    name: "Batu, pasir, garam & air",
    category: "Aquascape",
    qty: "Sesuai susunan",
    priority: "Wajib",
    budget: 700000,
    spec: "Batu legal dari sumber tepercaya, bahan reef-safe, pasir bila digunakan, garam khusus reef, dan air RO/DI terverifikasi. Jumlah final mengikuti susunan dan air terukur.",
    purpose:
      "Membentuk habitat dan media biologis. Jangan memakai batu alam tak dikenal atau mengambil biota liar sembarangan.",
  },
  {
    id: "temp",
    name: "Termometer & kontrol suhu",
    category: "Stabilitas",
    qty: "1 set",
    priority: "Wajib",
    budget: 300000,
    spec: "Termometer untuk pemantauan; kipas hanya jika pengujian membuktikan cukup. Heater bersyarat pada suhu malam. Chiller belum masuk anggaran.",
    purpose:
      "Indoor tanpa AC perlu pencatatan suhu siang–malam. Kipas meningkatkan evaporasi; jika tidak cukup, ubah lokasi atau revisi biaya sebelum membeli biota.",
  },
  {
    id: "care",
    name: "Peralatan perawatan",
    category: "Perawatan",
    qty: "1 paket",
    priority: "Wajib",
    budget: 200000,
    spec: "Ember food-grade khusus, selang sifon, pembersih kaca, pengaduk/pompa pencampur sesuai kebutuhan, wadah RO/DI tertutup, dan APD.",
    purpose:
      "Memisahkan alat akuarium dari sabun dan bahan kimia rumah tangga. Evaluasi biaya perlindungan listrik dan aerator darurat secara terpisah bila belum tersedia.",
  },
  {
    id: "reserve",
    name: "Cadangan & biota bertahap",
    category: "Cadangan",
    qty: "Dana alokasi",
    priority: "Cadangan",
    budget: 700000,
    spec: "Cadangkan untuk kekurangan kebutuhan dasar, kebutuhan keselamatan, sumber amonia cycling sesuai petunjuk, bakteri bila digunakan, dan pakan. Biota hanya setelah validasi.",
    purpose:
      "Bukan jaminan biaya cukup. Jika dana habis untuk alat wajib, tunda pembelian biota; jangan mengorbankan test kit atau pendinginan.",
  },
];

export const steps = [
  {
    id: "location",
    title: "Validasi lokasi & suhu",
    short: "Lokasi",
    diagram: "electric",
    tools: "Termometer ruangan, meteran, catatan suhu",
    body: "Pilih area tanpa matahari langsung, dekat sumber listrik terlindung, dan mudah untuk mengganti air. Catat suhu siang–malam selama beberapa hari termasuk hari panas. Periksa akses servis HOB dan ruang untuk ember.",
    warning:
      "Tanpa AC, kipas belum tentu cukup. Jangan membeli biota sebelum kemampuan kontrol suhu terbukti.",
    gate: "Lokasi, suhu, sumber RO/DI, akses servis, dan anggaran pendinginan sudah dievaluasi.",
  },
  {
    id: "structure",
    title: "Periksa tank & stand",
    short: "Struktur",
    diagram: "front",
    tools: "Waterpass, spesifikasi tank dan stand",
    body: "Minta pembuat tank memvalidasi ketebalan kaca, silikon aquarium-safe, sambungan, dan penopang yang sesuai. Pastikan stand rata, tidak goyang, dan cukup kuat untuk air, kaca, batu, serta peralatan. Gunakan alas hanya sesuai ketentuan pembuat tank.",
    warning:
      "40,5 L adalah volume geometris; bukan total berat terisi. Diagram bukan daftar potong kaca.",
    gate: "Tank dan penopang dinyatakan sesuai oleh pembuat; tidak ada retak, goyang, atau overhang.",
  },
  {
    id: "leak",
    title: "Uji kebocoran & alat",
    short: "Uji bocor",
    diagram: "front",
    tools: "Air tawar, wadah cadangan, tisu kering",
    body: "Lakukan uji kebocoran dengan air tawar di tempat aman, mengikuti durasi dan instruksi pembuat. Periksa sambungan, dasar, stand, dan penurunan muka air. Kosongkan dengan aman setelah pengujian selesai.",
    warning:
      "Jangan menguji tank bocor di dekat stopkontak. Jangan memindahkan tank yang masih berisi air.",
    gate: "Tidak ada rembes, deformasi, atau masalah penopang selama periode uji yang disepakati.",
  },
  {
    id: "equipment",
    title: "Pasang filter & kelistrikan",
    short: "Peralatan",
    diagram: "electric",
    tools: "HOB, lampu, termometer, pelindung listrik",
    body: "Pasang HOB sesuai instruksi, sisakan akses untuk mengangkat media. Atur kabel dengan drip loop di bawah stopkontak yang terlindung dan di luar area percikan. Minta tenaga kompeten memeriksa grounding dan pengaman arus bocor/RCD yang sesuai.",
    warning:
      "Cabut listrik sebelum tangan masuk air atau alat dilepas. Jangan menyalakan pompa/heater dalam kondisi kering.",
    gate: "Pemasangan aman, kabel tertata, alat terendam sesuai batas produsen, dan akses servis tersedia.",
  },
  {
    id: "scape",
    title: "Susun batu & pasir",
    short: "Aquascape",
    diagram: "top",
    tools: "Batu reef-safe, perekat khusus reef, pasir opsional",
    body: "Buat susunan rendah dan stabil dengan ruang berenang dan akses pembersih kaca. Tumpukan tidak boleh bergantung pada pasir yang mudah bergeser. Ikuti panduan pembuat untuk melindungi dasar; pastikan perekat sudah curing sesuai produk.",
    warning:
      "Jangan memakai batu tak dikenal atau susunan yang dapat roboh. Jangan menekan batu ke kaca samping.",
    gate: "Batu tidak goyang, akses sifon tersedia, intake bebas, dan jalur air tidak tertutup.",
  },
  {
    id: "water",
    title: "Siapkan & isi air laut",
    short: "Air laut",
    diagram: "flow",
    tools: "RO/DI, garam reef, ember, pengaduk, alat salinitas terkalibrasi",
    body: "Campur garam dalam wadah terpisah memakai RO/DI dan ikuti petunjuk takaran, pencampuran, serta suhu produk. Ukur salinitas dengan alat terkalibrasi. Isi perlahan; catat liter aktual yang ditambahkan dan tandai muka air operasional saat sistem berjalan.",
    warning:
      "Volume air aktual lebih kecil dari 40,5 L dan mencakup air di filter. Jangan memasukkan garam kering langsung ke tank berbiota.",
    gate: "Garam terlarut, salinitas terukur, volume aktual dicatat, dan air tidak melampaui batas kerja alat.",
  },
  {
    id: "operation",
    title: "Uji sirkulasi & restart",
    short: "Uji sistem",
    diagram: "flow",
    tools: "Termometer, catatan muka air, wadah penampung",
    body: "Jalankan HOB dan peralatan yang diperlukan. Amati endapan, agitasi permukaan, suhu, bunyi, dan kebocoran. Lakukan simulasi listrik mati/menyala kembali secara aman untuk memeriksa restart HOB dan perubahan muka air.",
    warning:
      "Jangan tinggalkan sistem sebelum terbukti dapat restart tanpa meluap atau berjalan kering. Ikuti instruksi produsen.",
    gate: "Aliran merata, suhu dapat dikendalikan, tidak ada luapan, dan prosedur restart sudah dipahami.",
  },
  {
    id: "cycle",
    title: "Cycling tanpa ikan",
    short: "Cycling",
    diagram: "flow",
    tools: "Kit amonia, nitrit, nitrat; sumber amonia untuk aquarium",
    body: "Gunakan protokol fishless cycling dari produk/sumber tepercaya dengan takaran berdasarkan volume aktual. Catat amonia, nitrit, dan nitrat beserta satuan kit. Verifikasi kemampuan biofilter mengolah sumber amonia sesuai protokol sebelum menambah biota.",
    warning:
      "Bukan sekadar menunggu jumlah hari. Jangan gunakan ikan sebagai sumber amonia dan jangan memakai pembersih rumah tangga.",
    gate: "Hasil uji dan pemrosesan amonia memenuhi protokol; air dipersiapkan kembali sebelum introduksi. Checklist aplikasi bukan sertifikat kelulusan.",
  },
  {
    id: "livestock",
    title: "Tambahkan biota bertahap",
    short: "Biota",
    diagram: "top",
    tools: "Rencana spesies, pakan sesuai, rencana karantina/aklimatisasi",
    body: "Validasi spesies dan ukuran dewasa dengan aquarist kompeten. Mulai konservatif, satu introduksi dalam satu waktu, gunakan prosedur karantina dan aklimatisasi yang sesuai spesies. Koral ditambah setelah stabilitas serta pencahayaan tervalidasi.",
    warning:
      "Bahkan satu clownfish tidak otomatis cocok. Jangan masukkan sepasang, mandarin, butterflyfish, atau anemon hanya karena ada di simulasi.",
    gate: "Spesies, kondisi kesehatan, pakan, kebutuhan ruang, dan kesiapan air telah ditinjau sebelum pembelian.",
  },
] as const;

export const tasks = {
  Harian: [
    [
      "Amati sebelum memberi pakan",
      "Periksa napas, nafsu makan, perilaku, kebocoran, aliran HOB, dan agitasi permukaan. Pakan sedikit sesuai spesies; hindari sisa menumpuk.",
    ],
    [
      "Cek suhu & penguapan",
      "Catat suhu, terutama jam terpanas. Ganti penguapan dengan RO/DI tawar sedikit demi sedikit ke tanda muka air; verifikasi salinitas. Jangan gunakan air garam untuk top-off.",
    ],
    [
      "Periksa alat",
      "Pastikan intake tidak tersumbat, kipas aman, dan kabel kering. Timer serta mode lampu simulasi bukan rekomendasi jadwal nyata.",
    ],
  ],
  Mingguan: [
    [
      "Tes & baca tren",
      "Periksa salinitas dan parameter relevan: nitrat, fosfat, pH, alkalinitas; amonia segera bila ada masalah atau sistem baru. Ca/Mg sesuai kebutuhan koral. Ikuti instruksi dan satuan kit.",
    ],
    [
      "Ganti air secara terukur",
      "Tentukan volume dan frekuensi dari beban biota, hasil tes, dan respons tank; jangan menganggap jadwal universal. Campur air laut baru terpisah dan cocokkan suhu serta salinitas. Cabut alat yang akan terekspos udara, sifon, isi perlahan, lalu periksa restart.",
    ],
    [
      "Bersihkan kaca & media mekanis",
      "Gunakan alat khusus tanpa sabun. Bersihkan/ganti media mekanis sesuai kondisi; jangan mengganti seluruh media biologis sekaligus. Tangani media biologis dengan air laut bekas yang bersih, bukan air keran berklorin.",
    ],
  ],
  Berkala: [
    [
      "Servis & kalibrasi",
      "Servis impeller HOB, pompa, dan selang sesuai produsen. Kalibrasi alat salinitas, periksa tanggal reagen, pengaman listrik, serta fungsi aerator darurat.",
    ],
    [
      "Tinjau biaya & pertumbuhan",
      "Catat penggunaan RO/DI, garam, listrik, dan reagen. Tinjau kebutuhan ruang saat ikan/koral tumbuh. Jangan dosing suplemen tanpa pengukuran dan kebutuhan konsumsi yang terbukti.",
    ],
    [
      "Keamanan saat menangani koral",
      "Gunakan pelindung mata dan sarung tangan. Beberapa zoanthid/palythoa dapat mengandung palytoxin: jangan merebus, menggosok kering, atau mengaerosolkan batu/koral. Jika terpapar, cari bantuan medis dan jelaskan kemungkinan paparan.",
    ],
  ],
};

export const emergencies = [
  {
    title: "Listrik padam",
    body: "Utamakan keselamatan dan oksigenasi dengan aerator baterai yang sudah disiapkan. Kurangi pakan, pantau suhu, dan ikuti durasi aman alat cadangan. Saat listrik kembali, periksa HOB terisi dan restart; jangan menganggap semua filter otomatis pulih.",
  },
  {
    title: "Suhu meningkat",
    body: "Konfirmasi dengan termometer, periksa kipas, ventilasi, dan sumber panas. Tingkatkan aerasi bila aman dan koreksi bertahap. Jangan menambahkan es langsung atau mengubah suhu mendadak. Jika ruangan tidak memungkinkan, revisi sistem pendingin sebelum menambah biota.",
  },
  {
    title: "Pompa berhenti / ikan megap-megap",
    body: "Periksa listrik dari area kering, tingkatkan aerasi secara aman, dan ukur suhu, salinitas, serta amonia. Hentikan pemberian pakan sementara saat menyelidiki. Hubungi aquarist kompeten atau dokter hewan; jangan menambahkan obat tanpa diagnosis.",
  },
  {
    title: "Kebocoran",
    body: "Jangan menyentuh air atau alat bila ada risiko listrik. Putuskan suplai dari titik kering yang aman; minta bantuan bila ragu. Siapkan wadah reef-safe dengan air tank, aerasi dan suhu terjaga untuk penampungan sementara. Jangan memperbaiki sambungan saat tank penuh.",
  },
];
