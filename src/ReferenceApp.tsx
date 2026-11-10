import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Diagram, { type DiagramKind } from "./guide/Diagram";
import {
  equipment,
  emergencies,
  grossVolume,
  PLAN,
  rupiah,
  steps,
  tasks,
} from "./guide/data";
import {
  isChecks,
  isJournal,
  isPrices,
  useLocalData,
  type JournalEntry,
} from "./guide/storage";

const Aquarium = lazy(() => import("./AquariumView"));
const pages = [
  { id: "overview", name: "Ringkasan", icon: "overview" },
  { id: "equipment", name: "Kebutuhan & biaya", icon: "bag" },
  { id: "blueprint", name: "Rancangan teknis", icon: "blueprint" },
  { id: "assembly", name: "Panduan merakit", icon: "tools" },
  { id: "cycling", name: "Cycling & biota", icon: "cycle" },
  { id: "care", name: "Perawatan & jurnal", icon: "heart" },
  { id: "explore", name: "Eksplorasi 3D", icon: "cube" },
] as const;
type Page = (typeof pages)[number]["id"];
const isPage = (s: string): s is Page => pages.some((p) => p.id === s);
const pageFromHash = (): Page => {
  const p = window.location.hash.slice(1);
  return isPage(p) ? p : "overview";
};

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
    blueprint: (
      <>
        <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Z" />
        <path d="M9 3v16M15 5v16" />
      </>
    ),
    tools: (
      <>
        <path d="m14 5 5 5M3 21l9-9M14 3l7 7-4 4-7-7 4-4ZM4 3l5 5M3 4l1-1M16 16l5 5" />
      </>
    ),
    cycle: (
      <>
        <path d="M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5M4 16a8 8 0 0 0 14 3l3-3m0 5v-5h-5" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    cube: (
      <>
        <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
        <path d="m3 7 9 5 9-5M12 12v10M7.5 4.5l9 5" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v1" />
      </>
    ),
    print: (
      <>
        <path d="M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7v-7Z" />
        <path d="M16 11h1" />
      </>
    ),
    wave: (
      <>
        <path d="M2 9c4-8 6 8 10 0s6 8 10 0M2 15c4-8 6 8 10 0s6 8 10 0" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    temp: (
      <>
        <path d="M9 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0ZM12 8v10" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.info}
    </svg>
  );
}
function Notice({
  children,
  tone = "amber",
}: {
  children: ReactNode;
  tone?: "amber" | "teal";
}) {
  return (
    <div className={`notice ${tone}`}>
      <Icon name="info" size={18} />
      <div>{children}</div>
    </div>
  );
}
function Title({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {children}
    </div>
  );
}
function Badge({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className={`check-row ${checked ? "checked" : ""}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{children}</span>
    </label>
  );
}

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">
        <Icon name="cube" size={42} />
        <h2>3D tidak tersedia di perangkat ini</h2>
        <p>
          Semua diagram, panduan, dan checklist tetap bisa digunakan. Coba
          aktifkan akselerasi grafis atau gunakan perangkat lain.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}

export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [menu, setMenu] = useState(false);
  const [focusItem, setFocusItem] = useState<string | null>(null);
  const [checks, setChecks, checksWarning] = useLocalData<
    Record<string, boolean>
  >("reef-checks-v1", {}, isChecks);
  const [prices, setPrices, pricesWarning] = useLocalData<
    Record<string, number>
  >("reef-prices-v1", {}, isPrices);
  const [entries, setEntries, entriesWarning] = useLocalData<JournalEntry[]>(
    "reef-journal-v1",
    [],
    isJournal,
  );
  const main = useRef<HTMLElement>(null);
  const toggle = (key: string) =>
    setChecks((current) => ({ ...current, [key]: !current[key] }));
  const total = equipment.reduce(
    (sum, item) => sum + (prices[item.id] ?? item.budget),
    0,
  );
  const completed = steps.filter((s) => checks[`step-${s.id}`]).length;
  const purchased = equipment.filter((e) => checks[`buy-${e.id}`]).length;
  const [stepIndex, setStepIndex] = useState(0);
  const [diagram, setDiagram] = useState<DiagramKind>("front");
  const [cadence, setCadence] = useState<keyof typeof tasks>("Harian");
  const [mode, setMode] = useState<"real" | "free">("real");
  useEffect(() => {
    const handler = () => {
      setPage(pageFromHash());
      setMenu(false);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    document.title = `${pages.find((p) => p.id === page)?.name} · Reef Notes`;
    main.current?.focus();
    window.scrollTo({ top: 0 });
  }, [page]);
  const navigate = (next: Page) => {
    setPage(next);
    window.location.hash = next;
    setMenu(false);
  };
  function selectEquipment(id: string) {
    setFocusItem(id);
    navigate("equipment");
  }
  useEffect(() => {
    if (page === "equipment" && focusItem)
      document
        .getElementById(`item-${focusItem}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [page, focusItem]);

  return (
    <div className="reef-app">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Lewati navigasi
      </a>
      <aside
        className={`sidebar ${menu ? "is-open" : ""}`}
        aria-label="Navigasi utama"
      >
        <a
          href="#overview"
          className="brand"
          onClick={() => navigate("overview")}
        >
          <span className="brand-mark">
            <Icon name="wave" size={25} />
          </span>
          <span>
            reef<span className="brand-light">notes</span>
            <small>FROM VISION TO REEF</small>
          </span>
        </a>
        <a
          href="#tutorial"
          className="nav-link"
          style={{ marginTop: 24, color: "#b5dec4" }}
        >
          <Icon name="arrow" />
          <span>Buka tutorial visual</span>
        </a>
        <div className="sidebar-label">REFERENSI LENGKAP</div>
        <nav>
          {pages.map((p, i) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              aria-current={page === p.id ? "page" : undefined}
              className={`nav-link ${page === p.id ? "active" : ""}`}
              onClick={() => navigate(p.id)}
            >
              <Icon name={p.icon} />
              <span>{p.name}</span>
              {i === 6 ? <span className="nav-tag">3D</span> : null}
            </a>
          ))}
        </nav>
        <div className="sidebar-project">
          <span className="project-dot" />
          <div>
            <strong>Nano reef pertamaku</strong>
            <small>45 × 30 × 30 cm · Rencana pribadi</small>
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="tiny-label">
            PROGRES PERAKITAN <span>{completed}/9</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${(completed / 9) * 100}%` }} />
          </div>
          <p>Pelan, terukur, dan bertahap.</p>
          <span className="local-note">
            <span className="status-dot" />
            Disimpan di browser ini
          </span>
        </div>
      </aside>
      {menu && (
        <button
          className="nav-backdrop"
          aria-label="Tutup navigasi"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Buka navigasi"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              <Icon name="menu" />
            </button>
            <span>Workspace</span>
            <span className="crumb-separator">/</span>
            <strong>{pages.find((p) => p.id === page)?.name}</strong>
          </div>
          <div className="top-actions">
            <a
              href="#tutorial"
              className="print-button"
              aria-label="Kembali ke tutorial visual"
            >
              <Icon name="arrow" size={16} />
              <span>Tutorial visual</span>
            </a>
            <span className="draft-pill">
              <span />
              Rencana · belum tervalidasi
            </span>
            <button
              className="print-button"
              aria-label="Cetak halaman"
              onClick={() => window.print()}
            >
              <Icon name="print" size={16} />
              <span>Cetak halaman</span>
            </button>
          </div>
        </header>
        <main id="main-content" ref={main} tabIndex={-1}>
          {(checksWarning || pricesWarning || entriesWarning) && (
            <Notice>
              Penyimpanan browser tidak tersedia atau penuh. Perubahan hanya
              tersimpan sementara selama halaman terbuka.
            </Notice>
          )}
          {page === "overview" && (
            <>
              <Title
                eyebrow="SEBUAH EKOSISTEM KECIL, DIRENCANAKAN DENGAN BAIK"
                title="Dari desain, menjadi kehidupan."
                text="Panduan pribadimu untuk merakit dan merawat nano reef. Satu keputusan yang tepat, satu langkah setiap waktu."
              >
                <button
                  className="button primary"
                  onClick={() => navigate("assembly")}
                >
                  Mulai merakit <Icon name="arrow" size={17} />
                </button>
              </Title>
              <div className="overview-grid">
                <section className="hero-tank card">
                  <div className="card-top">
                    <span className="eyebrow">RENCANA TANK / 001</span>
                    <Badge tone="teal">Konsep 45 cm</Badge>
                  </div>
                  <Diagram onSelect={selectEquipment} />
                  <div className="hero-bottom">
                    <div>
                      <h2>Small tank. Thoughtful reef.</h2>
                      <p>Clownfish & koral · HOB · Indoor tanpa AC</p>
                    </div>
                    <button
                      className="text-link"
                      onClick={() => navigate("explore")}
                    >
                      Jelajahi 3D <Icon name="arrow" size={17} />
                    </button>
                  </div>
                </section>
                <div className="overview-side">
                  <section className="card project-summary">
                    <div className="section-kicker">
                      <span className="status-dot" /> SPESIFIKASI AWAL
                    </div>
                    <h2>
                      Ruang kecil,
                      <br />
                      rencana yang jelas.
                    </h2>
                    <div className="spec-pair">
                      <span>Dimensi rencana</span>
                      <strong>
                        45 × 30 × 30 <small>cm</small>
                      </strong>
                    </div>
                    <div className="spec-pair">
                      <span>Volume geometris</span>
                      <strong>
                        {grossVolume.toLocaleString("id-ID")}{" "}
                        <small>liter</small>
                      </strong>
                    </div>
                    <div className="spec-pair">
                      <span>Sistem filtrasi</span>
                      <strong>
                        Hang-on-back <small>HOB</small>
                      </strong>
                    </div>
                    <p className="micro">
                      Volume air operasional lebih kecil; ukur liter pengisian
                      aktual. Dimensi konstruksi perlu konfirmasi pembuat.
                    </p>
                  </section>
                  <section className="card budget-summary">
                    <div className="section-kicker">BATAS ANGGARAN AWAL</div>
                    <div className="budget-number">
                      &lt; Rp5<span>juta</span>
                    </div>
                    <div className="budget-summary-line">
                      <span>Alokasi rencana</span>
                      <strong>{rupiah(total)}</strong>
                    </div>
                    <div
                      className={`progress-track ${total >= PLAN.budget ? "over-budget" : ""}`}
                    >
                      <span
                        style={{
                          width: `${Math.min(100, (total / PLAN.budget) * 100)}%`,
                        }}
                      />
                    </div>
                    <button
                      className="text-link"
                      onClick={() => navigate("equipment")}
                    >
                      Lihat rincian kebutuhan <Icon name="arrow" size={16} />
                    </button>
                  </section>
                </div>
              </div>
              <Notice>
                <strong>
                  Sebelum membeli biota: validasi suhu terlebih dahulu.
                </strong>{" "}
                Ruangan tanpa AC perlu pengukuran siang–malam. Jika kipas tidak
                cukup, revisi lokasi atau anggaran pendinginan; jangan
                mengorbankan stabilitas.
              </Notice>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">LANGKAH BERIKUTNYA</span>
                  <h2>Bangun fondasi yang tepat.</h2>
                </div>
                <span className="muted small">
                  Mulai dari kebutuhan, bukan biota.
                </span>
              </div>
              <div className="path-cards">
                {[
                  {
                    n: "01",
                    title: "Kenali kebutuhan",
                    text: "Alat, bahan, prioritas, dan alokasi biaya yang transparan.",
                    icon: "bag",
                    target: "equipment",
                  },
                  {
                    n: "02",
                    title: "Rakit dengan panduan",
                    text: "Sembilan tahap bergambar, lengkap dengan titik pemeriksaan.",
                    icon: "tools",
                    target: "assembly",
                  },
                  {
                    n: "03",
                    title: "Rawat dengan konsisten",
                    text: "Rutinitas sederhana dan jurnal untuk membaca tren tank.",
                    icon: "heart",
                    target: "care",
                  },
                ].map((c) => (
                  <button
                    key={c.n}
                    className="card path-card"
                    onClick={() => navigate(c.target as Page)}
                  >
                    <div className="path-card-top">
                      <span className="icon-tile">
                        <Icon name={c.icon} />
                      </span>
                      <span className="path-number">{c.n}</span>
                    </div>
                    <h3>{c.title}</h3>
                    <p>{c.text}</p>
                    <span className="path-arrow">
                      <Icon name="arrow" size={18} />
                    </span>
                  </button>
                ))}
              </div>
              <section className="card decision-card">
                <div>
                  <span className="eyebrow">BATAS DESAIN</span>
                  <h3>Indah di simulasi ≠ cocok di tank nyata.</h3>
                  <p>
                    Clownfish tidak membutuhkan anemon. Mandarin, butterflyfish,
                    dan anemon bukan bagian paket awal. Bahkan satu clownfish
                    memerlukan validasi spesies dan ruang dewasa.
                  </p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => navigate("cycling")}
                >
                  Pelajari kesiapan biota <Icon name="arrow" size={17} />
                </button>
              </section>
            </>
          )}

          {page === "equipment" && (
            <>
              <Title
                eyebrow="01 / SPESIFIKASI & BELANJA"
                title="Beli yang dibutuhkan. Bukan semuanya."
                text="Alokasi perencanaan, bukan penawaran toko. Isi perkiraan terbaru untuk melihat apakah rencana tetap masuk anggaran."
              />
              <div className="stat-grid">
                <Stat
                  label="TOTAL ALOKASI"
                  value={rupiah(total)}
                  detail="Angka awal Rp4,8 juta; dapat diperbarui"
                />
                <Stat
                  label={
                    total >= PLAN.budget
                      ? "MELEBIHI / MENCAPAI BATAS"
                      : "RUANG TERHADAP RP5 JUTA"
                  }
                  value={rupiah(PLAN.budget - total)}
                  detail="Target tetap di bawah Rp5 juta"
                  danger={total >= PLAN.budget}
                />
                <Stat
                  label="CHECKLIST TERISI"
                  value={`${purchased} / ${equipment.length}`}
                  detail="Termasuk kesiapan dana cadangan"
                />
              </div>
              <Notice>
                Estimasi awal belum diverifikasi ke toko. Stand baru, chiller,
                keselamatan listrik, karantina, ongkir, dan sebagian kit bisa
                membuat anggaran tidak cukup. Jangan membeli biota sebelum
                kebutuhan wajib terpenuhi.
              </Notice>
              <div className="equipment-list">
                {equipment.map((item, index) => (
                  <article
                    id={`item-${item.id}`}
                    key={item.id}
                    className={`card equipment-card ${focusItem === item.id ? "highlighted" : ""}`}
                  >
                    <div className="equipment-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="equipment-body">
                      <div className="equipment-title">
                        <div>
                          <span className="eyebrow">
                            {item.category} · {item.qty}
                          </span>
                          <h2>{item.name}</h2>
                        </div>
                        <Badge tone={item.priority === "Wajib" ? "teal" : ""}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p>{item.spec}</p>
                      <details>
                        <summary>Fungsi & pertimbangan</summary>
                        <p>{item.purpose}</p>
                      </details>
                      <Check
                        checked={!!checks[`buy-${item.id}`]}
                        onChange={() => toggle(`buy-${item.id}`)}
                      >
                        {item.id === "reserve"
                          ? "Dana cadangan disiapkan"
                          : "Sudah tersedia dan diperiksa"}
                      </Check>
                    </div>
                    <label className="price-field">
                      <span>Alokasi (Rp)</span>
                      <input
                        aria-label={`Alokasi ${item.name} dalam rupiah`}
                        type="number"
                        min="0"
                        max="100000000"
                        step="1000"
                        value={prices[item.id] ?? item.budget}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isFinite(n) && n >= 0 && n <= 100000000)
                            setPrices((p) => ({ ...p, [item.id]: n }));
                        }}
                      />
                      <small>Bawaan: {rupiah(item.budget)}</small>
                    </label>
                  </article>
                ))}
              </div>
              <section className="card prose">
                <h2>Biaya berjalan tidak berhenti di hari pertama.</h2>
                <p>
                  Siapkan dana bulanan untuk RO/DI, garam penggantian air,
                  pakan, listrik, reagen, dan penggantian alat. Catat pemakaian
                  nyata sebelum mematok angka bulanan. ATO, skimmer, chiller,
                  dan dosing pump adalah evaluasi kebutuhan, bukan daftar wajib
                  otomatis.
                </p>
                <p>
                  <strong>Harga belum dicek:</strong> daftar ini adalah alokasi
                  rencana per 9 November 2026, bukan harga pasar. Selisih
                  terhadap Rp5 juta bukan jaminan cukup.
                </p>
              </section>
            </>
          )}

          {page === "blueprint" && (
            <>
              <Title
                eyebrow="02 / RANCANGAN TEKNIS"
                title="Kenali setiap sudut tank."
                text="Gambar berlabel untuk memahami ukuran, penempatan, dan aliran. Bukan gambar konstruksi atau sertifikasi struktur."
              />
              <div className="segmented" aria-label="Pilih gambar">
                {(["front", "top", "flow", "electric"] as DiagramKind[]).map(
                  (d, i) => (
                    <button
                      key={d}
                      aria-pressed={diagram === d}
                      className={diagram === d ? "selected" : ""}
                      onClick={() => setDiagram(d)}
                    >
                      {
                        [
                          "Tampak depan",
                          "Tampak atas",
                          "Jalur air",
                          "Kelistrikan",
                        ][i]
                      }
                    </button>
                  ),
                )}
              </div>
              <div className="blueprint-grid">
                <section className="card diagram-card">
                  <div className="card-top">
                    <span className="eyebrow">
                      NR–045 / {diagram.toUpperCase()}
                    </span>
                    <Badge>SKEMA KONSEP</Badge>
                  </div>
                  <Diagram kind={diagram} />
                  <p className="diagram-caption">
                    Satuan cm · Skema tidak berskala · Ukuran luar/dalam belum
                    ditetapkan
                  </p>
                </section>
                <section className="card prose">
                  <span className="eyebrow">CATATAN GAMBAR</span>
                  <h2>
                    {
                      {
                        front: "Ukuran & muka air",
                        top: "Ruang untuk hidup dan merawat",
                        flow: "Air harus bergerak, bukan menghantam",
                        electric: "Air dan listrik: pisahkan dengan benar",
                        overview: "Konsep",
                      }[diagram]
                    }
                  </h2>
                  {diagram === "front" && (
                    <>
                      <p>
                        Panjang 45 cm, tinggi 30 cm, kedalaman 30 cm. Volume
                        geometris {grossVolume.toLocaleString("id-ID")} liter
                        sebelum pengurangan ruang kosong, kaca, batu, dan pasir.
                      </p>
                      <p>
                        Tinggi air mengikuti HOB dan ruang aman di atas air.
                        Catat volume pengisian; jangan memakai 40,5 L untuk
                        dosis otomatis.
                      </p>
                    </>
                  )}
                  {diagram === "top" && (
                    <>
                      <p>
                        Sisakan akses pembersih kaca dan sifon sesuai alat yang
                        dipakai. Posisi batu tidak boleh menghalangi intake atau
                        membuat ruang stagnan.
                      </p>
                      <p>
                        Jarak servis HOB dan lampu ditentukan model produsen.
                        Bentuk batu di gambar hanya ilustrasi.
                      </p>
                    </>
                  )}
                  {diagram === "flow" && (
                    <>
                      <p>
                        Air masuk melalui intake HOB, melewati media
                        mekanis/biologis sesuai desain filter, lalu kembali ke
                        permukaan.
                      </p>
                      <p>
                        Uji area endapan, agitasi, dan respons koral. Tambah
                        pompa adjustable hanya jika perlu. Uji kemampuan restart
                        HOB setelah listrik padam.
                      </p>
                    </>
                  )}
                  {diagram === "electric" && (
                    <>
                      <p>
                        Stopkontak di luar area percikan; kabel melengkung turun
                        sebelum menuju stopkontak sehingga air tidak mengikuti
                        kabel ke colokan.
                      </p>
                      <p>
                        Drip loop bukan pengganti grounding atau pengaman arus
                        bocor. Minta tenaga kompeten memeriksa instalasi. Cabut
                        alat sebelum perawatan.
                      </p>
                    </>
                  )}
                  <Notice tone="teal">
                    Ketebalan kaca, daftar potong, silikon, dan kekuatan stand
                    harus divalidasi pembuat. Meja di 3D bukan rekomendasi
                    struktur.
                  </Notice>
                </section>
              </div>
              <div className="card prose">
                <h2>Spesifikasi yang belum boleh ditebak</h2>
                <div className="three-columns">
                  <div>
                    <h3>Konstruksi</h3>
                    <p>
                      Ukuran luar/dalam, ketebalan kaca, sambungan, dukungan
                      dasar, dan beban total terisi.
                    </p>
                  </div>
                  <div>
                    <h3>Peralatan</h3>
                    <p>
                      Dimensi HOB, batas tinggi air, cakupan/PAR lampu, posisi
                      aman kipas, dan kebutuhan heater.
                    </p>
                  </div>
                  <div>
                    <h3>Kondisi lokasi</h3>
                    <p>
                      Suhu siang–malam, keamanan listrik, sumber RO/DI, dan
                      akses perawatan.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {page === "assembly" && (
            <>
              <Title
                eyebrow="03 / LANGKAH DEMI LANGKAH"
                title="Rakit perlahan. Periksa setiap tahap."
                text="Checklist mencatat pekerjaanmu; bukan pengganti pengujian, petunjuk produsen, atau pemeriksaan tenaga kompeten."
              >
                <Badge tone="teal">{completed} dari 9 selesai</Badge>
              </Title>
              <div className="assembly-layout">
                <nav className="step-nav" aria-label="Tahap perakitan">
                  {steps.map((s, i) => (
                    <button
                      key={s.id}
                      className={`${stepIndex === i ? "current" : ""} ${checks[`step-${s.id}`] ? "done" : ""}`}
                      aria-current={stepIndex === i ? "step" : undefined}
                      onClick={() => setStepIndex(i)}
                    >
                      <span className="step-circle">
                        {checks[`step-${s.id}`] ? (
                          <Icon name="check" size={15} />
                        ) : (
                          String(i + 1).padStart(2, "0")
                        )}
                      </span>
                      <span>{s.short}</span>
                      {stepIndex === i && <Icon name="arrow" size={15} />}
                    </button>
                  ))}
                </nav>
                <section className="card step-detail">
                  <div className="card-top">
                    <span className="eyebrow">
                      TAHAP {String(stepIndex + 1).padStart(2, "0")} / 09
                    </span>
                    <Badge>
                      {checks[`step-${steps[stepIndex].id}`]
                        ? "Ditandai selesai"
                        : "Perlu diperiksa"}
                    </Badge>
                  </div>
                  <h2>{steps[stepIndex].title}</h2>
                  <Diagram kind={steps[stepIndex].diagram} />
                  <div className="step-copy">
                    <div className="tool-strip">
                      <Icon name="tools" size={18} />
                      <span>
                        <strong>Siapkan:</strong> {steps[stepIndex].tools}
                      </span>
                    </div>
                    <h3>Yang perlu dilakukan</h3>
                    <p>{steps[stepIndex].body}</p>
                    <Notice>{steps[stepIndex].warning}</Notice>
                    <div className="gate">
                      <span className="eyebrow">TITIK PEMERIKSAAN</span>
                      <p>{steps[stepIndex].gate}</p>
                      <Check
                        checked={!!checks[`step-${steps[stepIndex].id}`]}
                        onChange={() => toggle(`step-${steps[stepIndex].id}`)}
                      >
                        Saya sudah melakukan dan memeriksa tahap ini
                      </Check>
                    </div>
                    <div className="step-controls">
                      <button
                        className="button secondary"
                        disabled={stepIndex === 0}
                        onClick={() => setStepIndex((i) => i - 1)}
                      >
                        Sebelumnya
                      </button>
                      {stepIndex < 8 ? (
                        <button
                          className="button primary"
                          onClick={() => setStepIndex((i) => i + 1)}
                        >
                          Tahap berikutnya <Icon name="arrow" size={16} />
                        </button>
                      ) : (
                        <button
                          className="button primary"
                          onClick={() => navigate("care")}
                        >
                          Ke panduan perawatan <Icon name="arrow" size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {page === "cycling" && (
            <>
              <Title
                eyebrow="04 / KESIAPAN BIOLOGIS"
                title="Tank terisi belum berarti tank siap."
                text="Bangun biofilter tanpa mengorbankan ikan. Penambahan biota mengikuti bukti pengujian, bukan tanggal di kalender."
              />
              <Notice>
                Ukuran 45 cm ini tidak otomatis cocok untuk sepasang clownfish.
                Konfirmasi spesies, ukuran dewasa, kebutuhan berenang, dan
                rencana jangka panjang sebelum membeli.
              </Notice>
              <div className="cycling-grid">
                {[
                  {
                    n: "01",
                    title: "Mulai tanpa ikan",
                    text: "Gunakan sumber amonia khusus aquarium dan protokol fishless cycling yang jelas. Bakteri starter dapat dipakai sesuai produk; bukan jaminan tank langsung siap.",
                  },
                  {
                    n: "02",
                    title: "Ukur & dokumentasikan",
                    text: "Catat amonia, nitrit, nitrat, tanggal, dan satuan kit. Dosis sumber amonia mengikuti volume aktual dan instruksi protokol; aplikasi tidak memberikan dosis universal.",
                  },
                  {
                    n: "03",
                    title: "Buktikan kemampuan biofilter",
                    text: "Pastikan sistem mengolah sumber amonia sesuai kriteria protokol dan hasil tes stabil. Siapkan kembali kualitas air sebelum introduksi; minta tinjauan aquarist kompeten bila ragu.",
                  },
                ].map((c) => (
                  <section className="card prose" key={c.n}>
                    <span className="large-number">{c.n}</span>
                    <h2>{c.title}</h2>
                    <p>{c.text}</p>
                  </section>
                ))}
              </div>
              <section className="card prose">
                <span className="eyebrow">RENCANA STOCKING KONSERVATIF</span>
                <h2>Mulai dari kompatibilitas, bukan jumlah.</h2>
                <div className="stocking-table">
                  <div>
                    <Badge tone="teal">Evaluasi dahulu</Badge>
                    <h3>Clownfish hasil budidaya</h3>
                    <p>
                      Satu kandidat kecil, bukan persetujuan otomatis.
                      Identifikasi spesies dan ukuran dewasa; pertimbangkan tank
                      lebih besar jika kebutuhan ruang tidak terpenuhi. Jangan
                      menganggap satu pasangan selalu cocok.
                    </p>
                  </div>
                  <div>
                    <Badge>Setelah stabil</Badge>
                    <h3>Koral yang sesuai sistem</h3>
                    <p>
                      Pilih spesies berdasarkan cahaya, aliran, dan kemampuan
                      merawat. Mushroom atau soft coral tertentu bisa
                      dievaluasi, tetapi tetap perlu identifikasi. GSP perlu
                      isolasi; zoanthid/palythoa memerlukan kewaspadaan toksin.
                    </p>
                  </div>
                  <div>
                    <Badge tone="amber">Bukan paket awal</Badge>
                    <h3>Anemon & ikan spesialis</h3>
                    <p>
                      Mandarin, butterflyfish, dan anemon dikeluarkan dari
                      rencana awal. Clownfish tidak memerlukan anemon. Warna
                      biota di layar bukan petunjuk kompatibilitas.
                    </p>
                  </div>
                </div>
              </section>
              <section className="card prose">
                <h2>Sebelum setiap introduksi</h2>
                {[
                  "Spesies, ukuran dewasa, pakan, dan kebutuhan ruang sudah diverifikasi.",
                  "Protokol cycling terpenuhi; suhu dan salinitas stabil serta alat salinitas terkalibrasi.",
                  "Sumber biota legal/tepercaya, kondisi sehat, serta rencana karantina dan aklimatisasi tersedia.",
                  "Dana perawatan, air RO/DI, pendinginan, dan penanganan darurat tersedia.",
                ].map((s, i) => (
                  <Check
                    key={s}
                    checked={!!checks[`ready-${i}`]}
                    onChange={() => toggle(`ready-${i}`)}
                  >
                    {s}
                  </Check>
                ))}
                <p className="micro">
                  Semua centang adalah catatan pribadi, bukan pembuktian
                  otomatis bahwa tank layak dihuni.
                </p>
                <button className="text-link" onClick={() => navigate("care")}>
                  Catat hasil tes di jurnal <Icon name="arrow" size={16} />
                </button>
              </section>
            </>
          )}

          {page === "care" && (
            <>
              <Title
                eyebrow="05 / RUTINITAS & CATATAN"
                title="Reef yang sehat dibangun dari kebiasaan."
                text="Amati, ukur, catat. Utamakan kestabilan dan respons biota daripada mengejar satu angka sempurna."
              />
              <Notice tone="teal">
                <strong>Bedakan dua jenis air:</strong> top-off penguapan
                memakai RO/DI tawar; penggantian air memakai air laut baru yang
                suhu dan salinitasnya sudah disesuaikan.
              </Notice>
              <div className="segmented" aria-label="Frekuensi perawatan">
                {(Object.keys(tasks) as (keyof typeof tasks)[]).map((t) => (
                  <button
                    key={t}
                    aria-pressed={cadence === t}
                    className={cadence === t ? "selected" : ""}
                    onClick={() => setCadence(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="care-tasks">
                {tasks[cadence].map(([title, text], i) => (
                  <section className="card care-task" key={title}>
                    <span className="icon-tile">
                      <Icon name={i === 1 ? "wave" : "check"} />
                    </span>
                    <div>
                      <h2>{title}</h2>
                      <p>{text}</p>
                    </div>
                  </section>
                ))}
              </div>
              <Journal entries={entries} setEntries={setEntries} />
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    KETIKA TIDAK BERJALAN SESUAI RENCANA
                  </span>
                  <h2>Panduan kondisi darurat</h2>
                </div>
              </div>
              <div className="emergencies">
                {emergencies.map((e) => (
                  <details className="card" key={e.title}>
                    <summary>
                      <span className="emergency-dot" />
                      {e.title}
                      <span className="details-plus">+</span>
                    </summary>
                    <p>{e.body}</p>
                  </details>
                ))}
              </div>
              <section className="card prose references">
                <span className="eyebrow">
                  BATAS PANDUAN & RUJUKAN LANJUTAN
                </span>
                <h2>Keputusan nyata perlu verifikasi nyata.</h2>
                <p>
                  Materi ini panduan perencanaan umum, bukan diagnosis, resep,
                  atau sertifikasi keselamatan. Rentang parameter dan protokol
                  akhir harus disesuaikan spesies, metode tes, dan petunjuk
                  produsen. Tinjau bersama aquarist berpengalaman sebelum
                  membeli biota.
                </p>
                <p>
                  Titik awal untuk penelusuran lebih lanjut (bukan klaim bahwa
                  isi halaman telah diaudit oleh organisasi berikut):{" "}
                  <a
                    href="https://www.merckvetmanual.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Merck Veterinary Manual
                  </a>{" "}
                  untuk kesehatan ikan;{" "}
                  <a
                    href="https://www.reef2reef.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Reef2Reef
                  </a>{" "}
                  untuk diskusi reef yang perlu dievaluasi kritis; serta manual
                  produsen alat, garam, dan test kit yang benar-benar dipilih.
                </p>
              </section>
            </>
          )}

          {page === "explore" && (
            <>
              <Title
                eyebrow="06 / VISUALISASI INTERAKTIF"
                title="Lihat rencanamu dari sudut berbeda."
                text="Putar dan perbesar tank. Simulasi ini tidak menghitung beban struktur, PAR, debit air, atau kelayakan biota."
              />
              <div className="explore-toolbar">
                <div className="segmented" aria-label="Mode visualisasi">
                  <button
                    aria-pressed={mode === "real"}
                    className={mode === "real" ? "selected" : ""}
                    onClick={() => setMode("real")}
                  >
                    Konsep 45 cm
                  </button>
                  <button
                    aria-pressed={mode === "free"}
                    className={mode === "free" ? "selected" : ""}
                    onClick={() => setMode("free")}
                  >
                    Simulasi bebas
                  </button>
                </div>
                <Badge tone="amber">Bukan data sensor</Badge>
              </div>
              <div className="scene-container">
                <SceneBoundary key={mode}>
                  <Suspense
                    fallback={
                      <div className="scene-fallback">
                        <Icon name="cube" size={38} />
                        <h2>Menyiapkan dunia kecilmu…</h2>
                        <p>Halaman panduan tidak membutuhkan 3D.</p>
                      </div>
                    }
                  >
                    <Aquarium key={mode} realistic={mode === "real"} />
                  </Suspense>
                </SceneBoundary>
              </div>
              <Notice>
                {mode === "real"
                  ? "Proporsi batas tank disesuaikan ke 45:30:30. Batu dan alat tetap ilustratif; heater yang terlihat bersifat bersyarat. Coral display bukan daftar belanja. Untuk detail ukuran dan jalur air, gunakan rancangan teknis."
                  : "Simulasi bebas mempertahankan tampilan asli, termasuk biota yang tidak direkomendasikan untuk paket awal. Tombol pakan, flow, dan mode lampu hanya efek visual."}
              </Notice>
            </>
          )}
          <footer className="page-footer">
            <span>
              <Icon name="wave" size={16} /> reefnotes{" "}
              <span className="footer-divider">/</span> Direncanakan dengan
              sabar.
            </span>
            <span>Data lokal · belum tersinkron · tanpa sensor</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
  danger,
}: {
  label: string;
  value: string;
  detail: string;
  danger?: boolean;
}) {
  return (
    <section className={`card stat ${danger ? "danger" : ""}`}>
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </section>
  );
}

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function Journal({
  entries,
  setEntries,
}: {
  entries: JournalEntry[];
  setEntries: (
    entries: JournalEntry[] | ((current: JournalEntry[]) => JournalEntry[]),
  ) => void;
}) {
  const empty = (): Omit<JournalEntry, "id"> => ({
    date: localDate(),
    temp: "",
    sal: "",
    ammonia: "",
    nitrite: "",
    nitrate: "",
    alk: "",
    note: "",
  });
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  function download() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 1,
            unit: {
              sal: "ppt",
              temp: "°C",
              ammonia: "mg/L total ammonia (kit)",
              nitrite: "mg/L NO2",
              nitrate: "mg/L NO3",
              alk: "dKH",
            },
            entries,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reef-jurnal-${localDate()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="card journal">
      <div className="journal-header">
        <div>
          <span className="eyebrow">CATATAN MANUAL · BUKAN SENSOR</span>
          <h2>Jurnal parameter air</h2>
          <p>
            Hasil tes milikmu, tersimpan di browser ini. Ekspor berkala agar
            tidak hilang.
          </p>
        </div>
        <button
          className="button secondary"
          onClick={download}
          disabled={!entries.length}
        >
          Ekspor JSON
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (entries.length >= 500) {
            setMessage(
              "Batas 500 catatan tercapai. Ekspor dan hapus catatan lama terlebih dahulu.",
            );
            return;
          }
          if (
            !Object.entries(form).some(
              ([key, value]) => key !== "date" && value.trim(),
            )
          ) {
            setMessage("Isi minimal satu hasil pengukuran atau catatan.");
            return;
          }
          setEntries((current) => [
            { ...form, id: crypto.randomUUID() },
            ...current,
          ]);
          setForm(empty());
          setMessage(
            "Catatan disimpan. Tidak ada penilaian otomatis kelayakan air.",
          );
        }}
      >
        <div className="journal-fields">
          <label>
            Tanggal
            <input
              aria-label="Tanggal pengukuran"
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          {(
            [
              { key: "temp", name: "Suhu (°C)", max: 50 },
              { key: "sal", name: "Salinitas (ppt)", max: 60 },
              { key: "ammonia", name: "Amonia total (mg/L)", max: 100 },
              { key: "nitrite", name: "Nitrit NO₂ (mg/L)", max: 100 },
              { key: "nitrate", name: "Nitrat NO₃ (mg/L)", max: 1000 },
              { key: "alk", name: "Alk (dKH)", max: 30 },
            ] as const
          ).map((f) => (
            <label key={f.key}>
              {f.name}
              <input
                type="number"
                min="0"
                max={f.max}
                step="any"
                placeholder="Belum diukur"
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </label>
          ))}
        </div>
        <label className="journal-note">
          Observasi / hasil tes lain
          <textarea
            maxLength={2000}
            rows={2}
            placeholder="Contoh: pH, fosfat, merek kit, waktu tes, perilaku ikan, tindakan perawatan…"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </label>
        <div className="journal-submit">
          <span className="micro">
            Gunakan satuan di label. Jangan masukkan SG ke kolom ppt atau NH₃
            bebas ke amonia total. Tes berbasis N perlu konversi sesuai kit.
          </span>
          <button className="button primary" type="submit">
            Simpan catatan <Icon name="check" size={17} />
          </button>
        </div>
        <p className="form-message" role="status">
          {message}
        </p>
      </form>
      {!entries.length ? (
        <div className="journal-empty">
          <Icon name="wave" size={30} />
          <h3>Setiap pengukuran punya cerita.</h3>
          <p>
            Belum ada catatan. Mulai dengan hasil pengukuran pertamamu—kolom
            yang belum diukur boleh kosong.
          </p>
        </div>
      ) : (
        <div className="journal-history">
          <div className="table-scroll">
            <table>
              <caption>
                {entries.length} catatan · suhu °C, salinitas ppt,
                amonia/nitrit/nitrat mg/L, alk dKH
              </caption>
              <thead>
                <tr>
                  {[
                    "Tanggal",
                    "°C",
                    "ppt",
                    "Amonia total",
                    "NO₂",
                    "NO₃",
                    "dKH",
                    "Catatan",
                    "Aksi",
                  ].map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    {(
                      [
                        "temp",
                        "sal",
                        "ammonia",
                        "nitrite",
                        "nitrate",
                        "alk",
                      ] as const
                    ).map((k) => (
                      <td key={k}>{row[k] || "—"}</td>
                    ))}
                    <td className="note-cell">{row.note || "—"}</td>
                    <td>
                      {deleting === row.id ? (
                        <div className="delete-confirm">
                          <button
                            type="button"
                            onClick={() => {
                              setEntries((current) =>
                                current.filter((e) => e.id !== row.id),
                              );
                              setDeleting(null);
                              setMessage("Catatan dihapus.");
                            }}
                          >
                            Ya, hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(null)}
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="delete-button"
                          aria-label={`Hapus catatan ${row.date}`}
                          onClick={() => setDeleting(row.id)}
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
