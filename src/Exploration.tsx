import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReef, type CamView, type LightMode, type TankFocus } from "./store";
import { TutorialIcon, stillFor } from "./tutorial/Tutorial";
import panoramaPhoto from "./assets/reef-panorama.webp";
import pairStill from "./assets/reef-pair.webp";

const Aquarium = lazy(() => import("./AquariumView"));

const posters = {
  both: {
    src: pairStill,
    alt: "Render dua akuarium berdampingan: Nano Reef di kiri dan Reef Panorama di kanan",
  },
  main: {
    src: stillFor(9),
    alt: "Render tank utama dengan batu, koral, anemon, dan ikan",
  },
  panorama: {
    src: panoramaPhoto,
    alt: "Foto acuan tank kedua dengan dua lampu biru dan koral berlapis merah",
  },
} satisfies Record<TankFocus, { src: string; alt: string }>;

class ExplorerBoundary extends Component<
  { children: ReactNode; focus: TankFocus },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="explorer-fallback">
        <img {...posters[this.props.focus]} />
        <div>
          <h2>3D tidak tersedia di perangkat ini</h2>
          <p>
            Pilih tank untuk melihat gambarnya. Tutorial visual tetap bisa
            diikuti tanpa WebGL.
          </p>
          <a href="#tutorial">Buka tutorial visual →</a>
        </div>
      </div>
    ) : (
      this.props.children
    );
  }
}
const views: { id: CamView; name: string }[] = [
  { id: "front", name: "Depan" },
  { id: "angle", name: "Sudut" },
  { id: "top", name: "Atas" },
  { id: "inside", name: "Dalam tank" },
];
const lights: { id: LightMode; name: string }[] = [
  { id: "actinic", name: "Actinic" },
  { id: "reef", name: "Reef white" },
  { id: "moon", name: "Moonlight" },
];
export default function Exploration() {
  const {
    light,
    setLight,
    view,
    setView,
    focus,
    focusTank,
    flow,
    setFlow,
    feed,
    mandarin,
    butterfly,
    goby,
    toggle,
  } = useReef();
  const reference = useRef<HTMLDialogElement>(null);
  const [ready, setReady] = useState(false);
  const [fed, setFed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    document.title = "Eksplorasi 3D · Nano Reef";
    useReef.getState().focusTank("both");
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  function feedFish() {
    feed();
    setFed(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFed(false), 1800);
  }
  return (
    <main className="exploration-main">
      <div className="exploration-heading">
        <div>
          <span className="tutorial-eyebrow">KOLEKSI REEF · EKSPLORASI 3D</span>
          <h1>Masuk ke dunia reef ini.</h1>
          <p>
            Nano Reef dari tutorial di kiri, Reef Panorama dari foto acuan di
            kanan. Pilih tank untuk melihat lebih dekat.
          </p>
        </div>
        <a href="#tutorial" className="exploration-start">
          Rakit tahap demi tahap <TutorialIcon name="arrow" size={17} />
        </a>
      </div>
      <section className="tank-display" aria-label="Dua akuarium berdampingan">
        <div className="tank-display-bar">
          <div className="tank-focus" role="group" aria-label="Fokus kamera">
            {(
              [
                ["both", "Kedua tank"],
                ["main", "Tank utama"],
                ["panorama", "Tank kedua"],
              ] as const
            ).map(([id, label], i) => (
              <button
                key={id}
                aria-pressed={focus === id}
                onClick={() => focusTank(id)}
              >
                {i === 0 ? (
                  <TutorialIcon name="cube" size={15} />
                ) : (
                  <small aria-hidden="true">0{i}</small>
                )}
                {label}
              </button>
            ))}
          </div>
          <button
            className="tank-reference"
            onClick={() => reference.current?.showModal()}
            aria-haspopup="dialog"
            aria-label="Foto acuan tank kedua"
            title="Foto acuan tank kedua"
          >
            <img src={panoramaPhoto} alt="" width="40" height="25" />
            <span>Foto acuan</span>
            <TutorialIcon name="chevron" size={13} />
          </button>
        </div>
        <div
          className="exploration-frame"
          data-model="reef-pair"
          data-focus={focus}
        >
          <div className="exploration-frame-label" aria-hidden="true">
            <span />
            {ready ? "LIVE 3D" : "PRATINJAU"}
            <span className="exploration-design-tag">
              {focus === "main"
                ? "01 / NANO REEF"
                : focus === "panorama"
                  ? "02 / REEF PANORAMA"
                  : "01 + 02 / DUA TANK"}
            </span>
          </div>
          <ExplorerBoundary focus={focus}>
            <Suspense fallback={null}>
              <Aquarium onReady={() => setReady(true)} />
            </Suspense>
            {!ready && (
              <img className="exploration-poster" {...posters[focus]} />
            )}
          </ExplorerBoundary>
          {!ready && (
            <span className="exploration-loading-indicator" role="status">
              Menyiapkan tampilan 3D…
            </span>
          )}
          <div className="exploration-frame-footer">
            Seret untuk memutar · cubit atau scroll untuk zoom{" "}
            <span>Visualisasi, bukan pembacaan sensor</span>
          </div>
        </div>
      </section>
      <dialog
        ref={reference}
        className="reference-dialog"
        aria-labelledby="reference-title"
        onClick={(e) => {
          if (e.target === reference.current) reference.current?.close();
        }}
      >
        <div>
          <div className="reference-heading">
            <div>
              <span className="tutorial-eyebrow">02 / FOTO ACUAN</span>
              <h2 id="reference-title">Reef Panorama</h2>
            </div>
            <form method="dialog">
              <button aria-label="Tutup foto acuan">
                <TutorialIcon name="close" />
              </button>
            </form>
          </div>
          <img
            src={panoramaPhoto}
            alt={posters.panorama.alt}
            width="1280"
            height="720"
          />
          <p>
            Foto acuan untuk bentuk tank kedua, lampu kembar, rak frag, dan
            susunan koralnya.
          </p>
        </div>
      </dialog>
      <div className="exploration-controls">
        <section>
          <h2>Sudut pandang</h2>
          <div className="exploration-button-row">
            {views.map((v) => (
              <button
                key={v.id}
                aria-pressed={view === v.id}
                title={
                  v.id === "inside" && focus === "both"
                    ? "Masuk ke tank utama"
                    : undefined
                }
                onClick={() => setView(v.id)}
              >
                {v.name}
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2>Pencahayaan</h2>
          <div className="exploration-button-row">
            {lights.map((l) => (
              <button
                key={l.id}
                aria-pressed={light === l.id}
                onClick={() => setLight(l.id)}
              >
                <span className={`light-dot light-${l.id}`} />
                {l.name}
              </button>
            ))}
          </div>
        </section>
        <section>
          <label className="flow-label" htmlFor="explore-flow">
            <span>Gerakan aliran</span>
            <span>{Math.round(flow * 100)}%</span>
          </label>
          <input
            id="explore-flow"
            aria-label="Gerakan aliran visual"
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={flow}
            onChange={(e) => setFlow(Number(e.target.value))}
          />
          <p>Persentase efek visual, bukan debit pompa.</p>
        </section>
      </div>
      <div className="exploration-livestock">
        <div>
          <span className="tutorial-eyebrow">BIOTA SIMULASI</span>
          <p>Biota tambahan dan pakan simulasi berlaku untuk tank utama.</p>
        </div>
        <div className="exploration-fish-buttons">
          {(
            [
              { id: "goby", name: "Goby", on: goby },
              { id: "mandarin", name: "Mandarin", on: mandarin },
              { id: "butterfly", name: "Butterflyfish", on: butterfly },
            ] as const
          ).map((f) => (
            <button key={f.id} aria-pressed={f.on} onClick={() => toggle(f.id)}>
              {f.name}
              <span className={f.on ? "toggle-on" : ""} />
            </button>
          ))}
          <button className="exploration-feed" onClick={feedFish}>
            {fed ? "Pakan simulasi dijatuhkan" : "Beri pakan simulasi"}
          </button>
        </div>
      </div>
      <p className="exploration-caution">
        <TutorialIcon name="info" size={16} />
        Desain adalah referensi visual, bukan rekomendasi seluruh biota untuk
        tank 45 cm. Ukuran konstruksi, alat, dan kecocokan spesies perlu
        divalidasi terpisah.
      </p>
      <footer className="exploration-footer">
        <span>
          Model ikan: Quaternius via{" "}
          <a
            href="https://github.com/Nihdao/three-aquarium-challenge"
            target="_blank"
            rel="noreferrer"
          >
            Nihdao
          </a>
          .
        </span>
        <a href="#tutorial">
          Lanjut ke tutorial visual <TutorialIcon name="arrow" size={14} />
        </a>
      </footer>
    </main>
  );
}
