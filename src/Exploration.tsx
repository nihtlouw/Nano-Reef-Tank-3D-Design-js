import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReef, type CamView, type LightMode } from "./store";
import { TutorialIcon, stillFor } from "./tutorial/Tutorial";
const Aquarium = lazy(() => import("./AquariumView"));

class ExplorerBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="explorer-fallback">
        <img
          src={stillFor(9)}
          alt="Render desain akuarium asli dengan batu, koral, anemon, dan ikan"
        />
        <div>
          <h2>3D tidak tersedia di perangkat ini</h2>
          <p>
            Gambar desain asli tetap tersedia. Tutorial visual bisa diikuti
            tanpa WebGL.
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
    flow,
    setFlow,
    feed,
    mandarin,
    butterfly,
    goby,
    toggle,
  } = useReef();
  const [ready, setReady] = useState(false);
  const [fed, setFed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    document.title = "Eksplorasi 3D · Nano Reef";
    useReef.getState().setView("front");
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
          <span className="tutorial-eyebrow">
            DESAIN ASLI · MODEL INTERAKTIF
          </span>
          <h1>Masuk ke dunia reef ini.</h1>
          <p>
            Batu, koral, anemon, ikan, dan cahaya yang sama dengan tutorial
            visual.
          </p>
        </div>
        <a href="#tutorial" className="exploration-start">
          Rakit tahap demi tahap <TutorialIcon name="arrow" size={17} />
        </a>
      </div>
      <section
        className="exploration-frame"
        aria-label="Eksplorasi akuarium asli"
        data-model="original-reef"
      >
        <div className="exploration-frame-label">
          <span />
          LIVE 3D{" "}
          <span className="exploration-design-tag">DESAIN REFERENSI</span>
        </div>
        <ExplorerBoundary>
          <Suspense
            fallback={
              <div className="exploration-loading">Menyiapkan desain asli…</div>
            }
          >
            <Aquarium onReady={() => setReady(true)} />
          </Suspense>
        </ExplorerBoundary>
        {!ready && (
          <span className="exploration-loading-indicator" aria-live="polite">
            Model akan tampil saat 3D siap.
          </span>
        )}
        <div className="exploration-frame-footer">
          Seret untuk memutar · scroll untuk zoom{" "}
          <span>Visualisasi, bukan pembacaan sensor</span>
        </div>
      </section>
      <div className="exploration-controls">
        <section>
          <h2>Sudut pandang</h2>
          <div className="exploration-button-row">
            {views.map((v) => (
              <button
                key={v.id}
                aria-pressed={view === v.id}
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
          <p>
            Clownfish & anemon pada desain asli. Biota tambahan bisa ditampilkan
            di sini.
          </p>
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
