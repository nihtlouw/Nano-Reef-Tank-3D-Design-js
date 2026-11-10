import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isChecks, useLocalData } from "../guide/storage";
import {
  indexFromHash,
  isLessonIndex,
  lessons,
  supplies,
  type SupplyId,
} from "./lessons";
import "./tutorial.css";

const Stage3D = lazy(() => import("./Stage3D"));
const annotations: Partial<
  Record<number, { id: SupplyId; x: number; y: number }[]>
> = {
  0: [
    { id: "tank", x: 30, y: 34 },
    { id: "filter", x: 79, y: 43 },
    { id: "light", x: 31, y: 76 },
    { id: "rock", x: 47, y: 58 },
    { id: "water", x: 77, y: 73 },
    { id: "tests", x: 57, y: 80 },
  ],
  3: [
    { id: "light", x: 60, y: 22 },
    { id: "filter", x: 37, y: 33 },
  ],
  4: [
    { id: "rock", x: 48, y: 40 },
    { id: "sand", x: 70, y: 70 },
  ],
  5: [{ id: "bucket", x: 77, y: 60 }],
  8: [{ id: "tests", x: 77, y: 64 }],
  10: [{ id: "water", x: 77, y: 62 }],
};

const stillFiles = import.meta.glob<string>("./stills/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
export function stillFor(index: number) {
  return stillFiles[`./stills/step-${String(index).padStart(2, "0")}.webp`];
}
export function TutorialIcon({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  const shapes: Record<string, ReactNode> = {
    wave: <path d="M2 9c4-8 6 8 10 0s6 8 10 0M2 15c4-8 6 8 10 0s6 8 10 0" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    back: <path d="M19 12H5m6-6-6 6 6 6" />,
    play: <path d="m9 5 11 7-11 7V5Z" />,
    cube: (
      <>
        <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
        <path d="m3 7 9 5 9-5M12 12v10" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8" cy="8" r="1" />
        <path d="m3 17 6-6 4 4 3-3 5 5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    down: <path d="m6 9 6 6 6-6" />,
    replay: (
      <>
        <path d="M3 10a9 9 0 1 1 2 9M3 4v6h6" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    list: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v1" />
      </>
    ),
    bag: (
      <>
        <path d="M4 7h16l1 14H3L4 7ZM8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    book: (
      <>
        <path d="M12 5Q5 2 3 5v15q4-3 9 0 5-3 9 0V5q-4-3-9 0ZM12 5v15" />
      </>
    ),
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
      {shapes[name] || shapes.info}
    </svg>
  );
}
function SupplyPicture({ id }: { id: SupplyId }) {
  const icon = supplies[id].icon;
  return (
    <svg
      viewBox="0 0 64 54"
      fill="none"
      aria-hidden="true"
      className={`supply-picture supply-${icon}`}
    >
      {icon === "tank" && (
        <>
          <path
            d="m9 15 34 0 12-7H21Z"
            fill="#97c7ce"
            fillOpacity=".1"
            stroke="#769fa9"
          />
          <path
            d="M9 15H43V44H9ZM43 15 55 8V37L43 44Z"
            fill="#6ca6b8"
            fillOpacity=".12"
            stroke="#97b8c1"
          />
          <path d="M9 39H43L55 32V37L43 44H9Z" fill="#8d907e" />
        </>
      )}
      {icon === "filter" && (
        <>
          <rect
            x="17"
            y="9"
            width="31"
            height="26"
            rx="3"
            fill="#3e5764"
            stroke="#91a5ad"
          />
          <path
            d="M14 9H51M23 31V48M44 23H52V33"
            stroke="#a4b6bd"
            strokeWidth="4"
          />
          <path d="M21 43H26" stroke="#80bcb9" strokeWidth="3" />
        </>
      )}
      {icon === "lamp" && (
        <>
          <path d="M48 42V9H17" stroke="#6d8a98" strokeWidth="4" />
          <path d="m9 14 35 0 7-5H16Z" fill="#617c8c" stroke="#9ab6c0" />
          <path d="M10 18H43" stroke="#a9dcdf" strokeWidth="3" />
          <path
            d="M17 23 11 42M36 23 42 42"
            stroke="#7abbb9"
            strokeOpacity=".3"
          />
        </>
      )}
      {icon === "rock" && (
        <>
          <path
            d="m8 43 6-17 13-6 8 10 13-5 9 18Z"
            fill="#8a9188"
            stroke="#b0b7a4"
          />
          <path
            d="m21 29 4-15 12-5 10 17-12 8Z"
            fill="#a6a790"
            stroke="#c1bda0"
          />
        </>
      )}
      {icon === "sand" && (
        <>
          <path
            d="M13 42V13H49V42Z"
            fill="#b7b094"
            fillOpacity=".2"
            stroke="#c1b89b"
          />
          <path d="M14 33Q27 22 48 30V41H14Z" fill="#c2b697" />
          <path d="M23 12H39" stroke="#ddd0b4" />
        </>
      )}
      {["drop", "bucket", "salt"].includes(icon) && (
        <>
          <path
            d="m16 16 4 31h25l4-31Z"
            fill={icon === "salt" ? "#c3b995" : "#81a5a9"}
            fillOpacity=".35"
            stroke="#9cb7ba"
          />
          <ellipse cx="32.5" cy="16" rx="16.5" ry="4" stroke="#b8d0ce" />
          <path d="M22 14V10a11 11 0 0 1 22 0v4" stroke="#8caaa9" />
          <text
            x="32"
            y="35"
            textAnchor="middle"
            fill="#d3e2d9"
            fontSize="9"
            fontFamily="Arial"
          >
            {icon === "salt" ? "SALT" : icon === "drop" ? "RO/DI" : "MIX"}
          </text>
        </>
      )}
      {icon === "meter" && (
        <>
          <rect
            x="10"
            y="10"
            width="29"
            height="33"
            rx="2"
            fill="#9db6ad"
            fillOpacity=".4"
            stroke="#abc2b6"
          />
          <path d="M16 20H33M16 25H30" stroke="#bfd6c7" />
          <rect
            x="43"
            y="20"
            width="9"
            height="25"
            rx="3"
            fill="#80aca9"
            fillOpacity=".5"
            stroke="#b1c5bd"
          />
          <path d="M43 20H52" stroke="#c6cebf" strokeWidth="4" />
        </>
      )}
      {icon === "temp" && (
        <>
          <path
            d="M27 33V11a5 5 0 0 1 10 0v22a10 10 0 1 1-10 0Z"
            fill="#8ca6ac"
            fillOpacity=".15"
            stroke="#a8c3c7"
            strokeWidth="2"
          />
          <path d="M32 18V39" stroke="#deaf8d" strokeWidth="3" />
          <circle cx="32" cy="40" r="4" fill="#deaf8d" />
        </>
      )}
      {icon === "power" && (
        <>
          <rect
            x="14"
            y="7"
            width="22"
            height="33"
            rx="4"
            fill="#a39b82"
            fillOpacity=".3"
            stroke="#c3bda4"
          />
          <circle cx="25" cy="20" r="6" stroke="#c3bda4" />
          <path
            d="M23 19V21M27 19V21M25 40v7q20 10 20-9V25"
            stroke="#c3bda4"
            strokeWidth="2"
          />
        </>
      )}
      {icon === "hose" && (
        <>
          <path
            d="M13 42V23q0-16 19-16t19 16q0 14-14 14-12 0-12-12v-9"
            stroke="#8fb7c1"
            strokeWidth="5"
          />
          <path d="M25 15v12" stroke="#c1d3cf" strokeWidth="7" />
        </>
      )}
      {icon === "food" && (
        <>
          <rect
            x="20"
            y="12"
            width="26"
            height="34"
            rx="5"
            fill="#b39873"
            fillOpacity=".4"
            stroke="#c6b08c"
          />
          <path d="M19 12H47" stroke="#d3c09d" strokeWidth="5" />
          <path d="M26 28q8-9 14 0-6 9-14 0l-5-5v10Z" fill="#d2b18a" />
        </>
      )}
    </svg>
  );
}
function Still({
  index,
  className = "",
  alt = "",
}: {
  index: number;
  className?: string;
  alt?: string;
}) {
  const src = stillFor(index);
  return src ? (
    <img className={className} src={src} alt={alt} draggable={false} />
  ) : (
    <div className={`still-placeholder ${className}`}>
      <TutorialIcon name="cube" size={40} />
      <span>{lessons[index].short}</span>
    </div>
  );
}
class ViewerBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  return reduced;
}
export default function Tutorial() {
  const [saved, setSaved, positionWarning] = useLocalData(
    "reef-tutorial-position-v1",
    0,
    isLessonIndex,
  );
  const [index, setIndex] = useState(
    () => indexFromHash(window.location.hash) ?? saved,
  );
  const [checks, setChecks, checksWarning] = useLocalData<
    Record<string, boolean>
  >("reef-checks-v1", {}, isChecks);
  const [isWide, setIsWide] = useState(
    () => window.matchMedia("(min-width: 1050px)").matches,
  );
  const [chapterOpen, setChapterOpen] = useState(
    () => window.matchMedia("(min-width: 1050px)").matches,
  );
  const [live, setLive] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [info, setInfo] = useState<SupplyId | null>(null);
  const [toast, setToast] = useState("");
  const player = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();
  const lesson = lessons[index];
  const count = lessons.filter((l) => checks[l.checkKey]).length;
  const toggle = (key: string) =>
    setChecks((current) => ({ ...current, [key]: !current[key] }));
  useEffect(() => {
    const handler = () => {
      const next = indexFromHash(window.location.hash);
      if (next !== null) {
        setIndex(next);
        setSaved(next);
      }
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [setSaved]);
  useEffect(() => {
    // Canonicalize the first history entry so Back returns to its actual lesson,
    // rather than resolving the root URL against the latest saved position.
    if (indexFromHash(window.location.hash) === null) {
      window.history.replaceState(null, "", `#tutorial/${index}`);
    }
  }, []);
  useEffect(() => {
    setSaved(index);
  }, [index, setSaved]);
  useEffect(() => {
    document.title = `${index + 1}. ${lesson.short} · Reef Notes`;
    setLive(false);
    setInfo(null);
  }, [index, lesson.short]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1050px)");
    const resize = () => {
      setIsWide(media.matches);
      setChapterOpen(media.matches);
    };
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);
  useEffect(() => {
    if (!chapterOpen || isWide) return;
    const panel = document.getElementById("tutorial-chapters");
    const elements = panel?.querySelectorAll<HTMLButtonElement>("button");
    elements?.[0]?.focus();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trap = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setChapterOpen(false);
        document.getElementById("chapter-toggle")?.focus();
      }
      if (e.key !== "Tab") return;
      const focusable = panel?.querySelectorAll<HTMLElement>("button, a[href]");
      if (!focusable?.length) return;
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", trap);
    return () => {
      window.removeEventListener("keydown", trap);
      document.body.style.overflow = oldOverflow;
    };
  }, [chapterOpen, isWide]);
  function select(next: number) {
    if (!isLessonIndex(next)) return;
    setIndex(next);
    setSaved(next);
    window.location.hash = `tutorial/${next}`;
    if (!window.matchMedia("(min-width: 1050px)").matches)
      setChapterOpen(false);
    heading.current?.focus();
    player.current?.scrollIntoView({
      block: "start",
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }
  async function saveImage() {
    const name = `nano-reef-${String(index + 1).padStart(2, "0")}-${lesson.id}`;
    try {
      const canvas = live ? player.current?.querySelector("canvas") : null;
      let url = stillFor(index),
        temporary = false;
      if (canvas) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        if (!blob) throw new Error("No image");
        url = URL.createObjectURL(blob);
        temporary = true;
      }
      if (!url) throw new Error("No image");
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}.${temporary ? "png" : "webp"}`;
      link.click();
      if (temporary) setTimeout(() => URL.revokeObjectURL(url), 1500);
      setToast("Unduhan gambar tahap ini disiapkan.");
    } catch {
      setToast("Gambar belum siap. Kembali ke mode gambar lalu coba lagi.");
    }
  }
  return (
    <div className="tutorial-app">
      <a
        href="#tutorial-content"
        className="tutorial-skip"
        onClick={(e) => {
          e.preventDefault();
          heading.current?.focus();
        }}
      >
        Ke langkah saat ini
      </a>
      <header className="tutorial-header">
        <a href="#tutorial/0" className="tutorial-brand">
          <span className="tutorial-brand-icon">
            <TutorialIcon name="wave" size={23} />
          </span>
          <span>
            reef<span>notes</span>
          </span>
          <span className="tutorial-header-label">BELAJAR DENGAN MELIHAT</span>
        </a>
        <nav aria-label="Referensi tambahan">
          <a href="#equipment">
            <TutorialIcon name="bag" size={16} />
            <span>Daftar belanja</span>
          </a>
          <a href="#care" aria-label="Jurnal & perawatan">
            <TutorialIcon name="book" size={16} />
            <span>Jurnal & perawatan</span>
          </a>
        </nav>
        <span className="tutorial-saved">
          <span />
          Progres tersimpan lokal
        </span>
      </header>
      <main className="tutorial-main" id="tutorial-content">
        <div className="tutorial-intro">
          <div>
            <div className="tutorial-eyebrow">
              PANDUAN VISUAL · NANO REEF 45 CM
            </div>
            <h1>
              Bikin reef pertamamu.
              <br className="tutorial-mobile-break" /> Ikuti satu per satu.
            </h1>
            <p>
              Lihat gambarnya, siapkan bahannya, lalu praktikkan. Nggak perlu
              baca semuanya sekaligus.
            </p>
          </div>
          <div className="tutorial-course-progress">
            <div>
              <strong>
                {count}
                <span>/{lessons.length}</span>
              </strong>
              <span>langkah ditandai selesai</span>
            </div>
            <div
              className="tutorial-progress-track"
              role="progressbar"
              aria-label="Langkah ditandai selesai"
              aria-valuenow={count}
              aria-valuemin={0}
              aria-valuemax={lessons.length}
            >
              <span style={{ width: `${(count / lessons.length) * 100}%` }} />
            </div>
          </div>
        </div>
        {(positionWarning || checksWarning) && (
          <p className="tutorial-storage-warning" role="status">
            Penyimpanan browser terblokir/penuh. Progres hanya tersimpan
            sementara selama halaman terbuka.
          </p>
        )}
        <div className="tutorial-layout">
          <div className="tutorial-primary">
            <div className="tutorial-player" ref={player}>
              <div className="tutorial-player-top">
                <span className="tutorial-stage-number">
                  {String(index + 1).padStart(2, "0")}{" "}
                  <span>/ {lessons.length}</span>
                </span>
                <span className="tutorial-player-title">{lesson.focus}</span>
                <button
                  aria-label="Simpan gambar tahap ini"
                  title="Simpan gambar tahap ini"
                  onClick={saveImage}
                >
                  <TutorialIcon name="download" size={17} />
                </button>
              </div>
              <div className="tutorial-stage" data-stage={lesson.id}>
                {live ? (
                  <ViewerBoundary
                    key={index}
                    fallback={
                      <>
                        <Still
                          index={index}
                          className="tutorial-still"
                          alt={`Gambar 3D: ${lesson.title}`}
                        />
                        <div className="tutorial-webgl-fallback" role="status">
                          WebGL tidak tersedia. Gambar 3D tetap bisa diikuti.
                        </div>
                      </>
                    }
                  >
                    <Suspense
                      fallback={
                        <Still
                          index={index}
                          className="tutorial-still"
                          alt={`Memuat 3D: ${lesson.title}`}
                        />
                      }
                    >
                      <Stage3D
                        index={index}
                        animate={!reducedMotion}
                        pulse={pulse}
                      />
                    </Suspense>
                  </ViewerBoundary>
                ) : (
                  <Still
                    index={index}
                    className="tutorial-still"
                    alt={`Tahap ${index + 1}: ${lesson.title}. ${lesson.focus}.`}
                  />
                )}
                {!live && (
                  <div
                    className="tutorial-annotations"
                    aria-label="Bagian pada gambar"
                  >
                    {annotations[index]?.map((a) => (
                      <button
                        key={a.id}
                        style={{ left: `${a.x}%`, top: `${a.y}%` }}
                        aria-label={`Kenali ${supplies[a.id].name} pada gambar`}
                        onClick={() => setInfo(a.id)}
                      >
                        <span />
                        {supplies[a.id].name}
                      </button>
                    ))}
                  </div>
                )}
                <span className="tutorial-concept-tag">VISUALISASI KONSEP</span>
                {!live && (
                  <button
                    className="tutorial-launch"
                    onClick={() => {
                      setLive(true);
                      setPulse((p) => p + 1);
                    }}
                  >
                    <span>
                      <TutorialIcon name="cube" size={19} />
                    </span>
                    <div>
                      <strong>Jelajahi tahap ini</strong>
                      <small>Buka model 3D interaktif</small>
                    </div>
                    <TutorialIcon name="chevron" size={15} />
                  </button>
                )}
              </div>
              <div className="tutorial-player-controls">
                <div className="tutorial-view-modes" aria-label="Mode gambar">
                  <button
                    aria-pressed={!live}
                    className={!live ? "selected" : ""}
                    onClick={() => setLive(false)}
                  >
                    <TutorialIcon name="image" size={15} />
                    Gambar 3D
                  </button>
                  <button
                    aria-pressed={live}
                    className={live ? "selected" : ""}
                    onClick={() => {
                      setLive(true);
                      setPulse((p) => p + 1);
                    }}
                  >
                    <TutorialIcon name="cube" size={15} />
                    Interaktif
                  </button>
                </div>
                <span className="tutorial-player-hint">
                  {live
                    ? "Seret untuk memutar · scroll untuk zoom"
                    : "Gambar sesuai tahap · bukan video"}
                </span>
                {live &&
                  [1, 2, 3, 4, 5, 6].includes(index) &&
                  !reducedMotion && (
                    <button
                      className="tutorial-replay"
                      aria-label="Ulangi animasi tahap ini"
                      title="Ulangi animasi tahap ini"
                      onClick={() => setPulse((p) => p + 1)}
                    >
                      <TutorialIcon name="replay" size={17} />
                    </button>
                  )}
                {index < lessons.length - 1 && (
                  <button
                    className="tutorial-quick-next"
                    aria-label={`Lanjut ke ${lessons[index + 1].short}`}
                    onClick={() => select(index + 1)}
                  >
                    Lanjut <TutorialIcon name="arrow" size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="tutorial-lesson-header">
              <div className="tutorial-lesson-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <span className="tutorial-eyebrow">{lesson.label}</span>
                <h2 ref={heading} tabIndex={-1}>
                  {lesson.title}
                </h2>
                <p>{lesson.summary}</p>
              </div>
              <button
                id="chapter-toggle"
                aria-label="Semua langkah"
                className="tutorial-chapters-toggle"
                aria-expanded={chapterOpen}
                aria-controls="tutorial-chapters"
                onClick={() => setChapterOpen(!chapterOpen)}
              >
                <TutorialIcon name="list" size={18} />
                <span>Semua langkah</span>
              </button>
            </div>
            <section
              className="tutorial-materials"
              aria-label="Alat dan bahan tahap ini"
            >
              <div className="tutorial-section-title">
                <h3>
                  {index === 0
                    ? "Kenalan dulu dengan kebutuhan utamanya"
                    : "Siapkan untuk tahap ini"}
                </h3>
                <span>{lesson.supplies.length} kebutuhan</span>
              </div>
              <div className="tutorial-supplies">
                {lesson.supplies.map((id) => (
                  <div
                    key={id}
                    className={`tutorial-supply ${checks[`tutorial-have-${id}`] ? "is-ready" : ""}`}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={!!checks[`tutorial-have-${id}`]}
                        onChange={() => toggle(`tutorial-have-${id}`)}
                        aria-label={`Sudah siap: ${supplies[id].name}`}
                      />
                      <SupplyPicture id={id} />
                      <span>
                        <strong>{supplies[id].name}</strong>
                        <small>{supplies[id].qty}</small>
                      </span>
                    </label>
                    <button
                      aria-label={`Penjelasan ${supplies[id].name}`}
                      aria-expanded={info === id}
                      onClick={() => setInfo(info === id ? null : id)}
                    >
                      <TutorialIcon name="info" size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {info && (
                <div className="tutorial-supply-tip">
                  <TutorialIcon name="info" size={17} />
                  <p>
                    <strong>{supplies[info].name}.</strong> {supplies[info].tip}{" "}
                    <a href="#equipment">Lihat spesifikasi lengkap →</a>
                  </p>
                  <button
                    aria-label="Tutup penjelasan alat"
                    onClick={() => setInfo(null)}
                  >
                    <TutorialIcon name="close" size={15} />
                  </button>
                </div>
              )}
            </section>
            <section
              className="tutorial-actions"
              aria-label="Instruksi tahap ini"
            >
              <h3>Lakukan ini</h3>
              <ol>
                {lesson.actions.map((text, i) => (
                  <li key={text}>
                    <span>{i + 1}</span>
                    <p>{text}</p>
                  </li>
                ))}
              </ol>
              <div className="tutorial-safety">
                <TutorialIcon name="info" size={16} />
                <p>{lesson.safety}</p>
              </div>
              <details key={lesson.id} className="tutorial-extra">
                <summary>
                  Butuh penjelasan lebih detail?
                  <TutorialIcon name="down" size={14} />
                </summary>
                <p>{lesson.detail}</p>
                <a
                  href={
                    index >= 9
                      ? "#care"
                      : index === 8
                        ? "#cycling"
                        : "#blueprint"
                  }
                >
                  Buka referensi lengkap <TutorialIcon name="arrow" size={13} />
                </a>
              </details>
            </section>
            <div className="tutorial-next-panel">
              <label className="tutorial-done">
                <input
                  type="checkbox"
                  checked={!!checks[lesson.checkKey]}
                  onChange={() => toggle(lesson.checkKey)}
                />
                <span>
                  <strong>Tandai tahap ini selesai</strong>
                  <small>{lesson.done}</small>
                </span>
              </label>
              <div className="tutorial-next-buttons">
                <button
                  className="tutorial-previous"
                  disabled={index === 0}
                  onClick={() => select(index - 1)}
                >
                  <TutorialIcon name="back" size={17} />
                  <span>Sebelumnya</span>
                </button>
                {index < lessons.length - 1 ? (
                  <button
                    className="tutorial-next"
                    onClick={() => select(index + 1)}
                  >
                    <span>
                      <small>SELANJUTNYA</small>
                      <strong>{lessons[index + 1].short}</strong>
                    </span>
                    <TutorialIcon name="arrow" size={20} />
                  </button>
                ) : (
                  <a className="tutorial-next" href="#care">
                    <span>
                      <small>LANJUT MERAWAT</small>
                      <strong>Buka jurnal tank</strong>
                    </span>
                    <TutorialIcon name="arrow" size={20} />
                  </a>
                )}
              </div>
            </div>
            <p className="tutorial-progress-note">
              Tombol lanjut hanya membuka pelajaran. Centang adalah catatan
              pribadi, bukan bukti tank siap dihuni.
            </p>
          </div>
          {chapterOpen && (
            <button
              className="tutorial-chapter-backdrop"
              onClick={() => setChapterOpen(false)}
              aria-label="Tutup daftar langkah"
            />
          )}
          <aside
            id="tutorial-chapters"
            role={!isWide ? "dialog" : undefined}
            aria-modal={!isWide && chapterOpen ? true : undefined}
            aria-hidden={!isWide && !chapterOpen}
            inert={!isWide && !chapterOpen}
            className={`tutorial-chapter-panel ${chapterOpen ? "open" : ""}`}
            aria-label="Daftar langkah tutorial"
          >
            <div className="tutorial-chapter-heading">
              <div>
                <h2>Perjalanan reef kamu</h2>
                <p>Dari meja kosong sampai perawatan.</p>
              </div>
              <button
                aria-label="Tutup semua langkah"
                className="tutorial-close-chapters"
                onClick={() => {
                  setChapterOpen(false);
                  document.getElementById("chapter-toggle")?.focus();
                }}
              >
                <TutorialIcon name="close" size={18} />
              </button>
            </div>
            <nav aria-label="Pilih tahap">
              {lessons.map((l, i) => (
                <div key={l.id}>
                  {(i === 0 || lessons[i - 1].chapter !== l.chapter) && (
                    <div className="tutorial-chapter-label">{l.chapter}</div>
                  )}
                  <button
                    aria-current={index === i ? "step" : undefined}
                    className={`tutorial-chapter ${index === i ? "active" : ""}`}
                    onClick={() => select(i)}
                  >
                    <div className="tutorial-thumbnail">
                      <Still index={i} alt="" />
                      {index === i && (
                        <span>
                          <TutorialIcon name="play" size={12} />
                        </span>
                      )}
                    </div>
                    <span className="tutorial-chapter-text">
                      <small>LANGKAH {String(i + 1).padStart(2, "0")}</small>
                      <strong>{l.short}</strong>
                    </span>
                    <span
                      className={`tutorial-chapter-state ${checks[l.checkKey] ? "complete" : ""}`}
                    >
                      {checks[l.checkKey] ? (
                        <TutorialIcon name="check" size={13} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                  </button>
                </div>
              ))}
            </nav>
            <div className="tutorial-course-card">
              <span className="tutorial-course-card-icon">
                <TutorialIcon name="wave" size={22} />
              </span>
              <div>
                <strong>Satu tank. Pelan-pelan.</strong>
                <p>45 × 30 × 30 cm · Indoor tanpa AC</p>
              </div>
            </div>
            <a href="#equipment" className="tutorial-reference-link">
              Rincian alat & alokasi biaya{" "}
              <TutorialIcon name="arrow" size={15} />
            </a>
          </aside>
        </div>
        <footer className="tutorial-footer">
          <span>
            <TutorialIcon name="wave" size={15} />
            Dirakit dengan sabar, dirawat dengan konsisten.
          </span>
          <span>Konsep visual, bukan gambar kerja konstruksi.</span>
        </footer>
        <div className="tutorial-toast" role="status" aria-live="polite">
          {toast}
        </div>
      </main>
    </div>
  );
}
