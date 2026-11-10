import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Scene from "./scene/Scene";
import { useReef, type CamView, type LightMode } from "./store";

const LIGHTS: { id: LightMode; label: string; dot: string }[] = [
  { id: "actinic", label: "Actinic", dot: "bg-blue-500" },
  { id: "reef", label: "Reef White", dot: "bg-sky-100" },
  { id: "moon", label: "Moonlight", dot: "bg-indigo-700" },
];
const VIEWS: { id: CamView; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "angle", label: "Angle" },
  { id: "top", label: "Top" },
  { id: "inside", label: "Dive in" },
];

function Params() {
  const [p, setP] = useState({ temp: 25.6, sal: 1.025, ph: 8.18, alk: 8.4 });
  useEffect(() => {
    const id = setInterval(() => {
      setP((o) => ({
        temp: +(
          25.6 +
          Math.sin(Date.now() / 9000) * 0.2 +
          (Math.random() - 0.5) * 0.04
        ).toFixed(1),
        sal: o.sal,
        ph: +(8.18 + Math.sin(Date.now() / 14000) * 0.04).toFixed(2),
        alk: o.alk,
      }));
    }, 1500);
    return () => clearInterval(id);
  }, []);
  const items = [
    ["Temp", `${p.temp}°C`],
    ["Salinity", `${p.sal} SG`],
    ["pH", `${p.ph}`],
    ["Alk", `${p.alk} dKH`],
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(([k, v]) => (
        <div
          key={k}
          className="rounded-lg bg-white/5 px-2 py-1.5 text-center ring-1 ring-white/10"
        >
          <div className="text-[9px] uppercase tracking-widest text-indigo-200/60">
            {k}
          </div>
          <div className="font-mono text-xs text-white">{v}</div>
        </div>
      ))}
    </div>
  );
}

function Panel() {
  const {
    light,
    setLight,
    view,
    setView,
    feed,
    mandarin,
    butterfly,
    goby,
    toggle,
    flow,
    setFlow,
  } = useReef();
  const [open, setOpen] = useState(true);
  const [fed, setFed] = useState(false);

  return (
    <div className="pointer-events-auto absolute right-3 top-3 w-[min(300px,calc(100vw-1.5rem))] rounded-2xl bg-[#0d0a1f]/70 p-4 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
          Tank Controls
        </span>
        <span className="text-indigo-300">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          <section>
            <h3 className="mb-2 text-[10px] uppercase tracking-widest text-indigo-200/60">
              Lighting
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {LIGHTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLight(l.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs transition ${
                    light === l.id
                      ? "bg-indigo-500/80 shadow-lg shadow-indigo-500/30"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${l.dot}`} />
                  {l.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[10px] uppercase tracking-widest text-indigo-200/60">
              Camera
            </h3>
            <div className="grid grid-cols-4 gap-1.5">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`rounded-lg px-1 py-2 text-xs transition ${
                    view === v.id
                      ? "bg-cyan-500/70"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-widest text-indigo-200/60">
                Flow
              </h3>
              <span className="font-mono text-[10px] text-indigo-200">
                {Math.round(flow * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={flow}
              onChange={(e) => setFlow(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </section>

          <section>
            <h3 className="mb-2 text-[10px] uppercase tracking-widest text-indigo-200/60">
              Livestock
            </h3>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5">
                <span>🐠 Clownfish pair</span>
                <span className="text-[10px] text-orange-300">hosting</span>
              </li>
              {(
                [
                  ["goby", "💛 Yellow clown goby", goby],
                  ["mandarin", "🐉 Mandarin dragonet", mandarin],
                  ["butterfly", "🦋 Butterflyfish", butterfly],
                ] as const
              ).map(([k, label, on]) => (
                <li key={k}>
                  <button
                    onClick={() => toggle(k)}
                    className="flex w-full items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5 hover:bg-white/10"
                  >
                    <span>{label}</span>
                    <span
                      className={`relative h-4 w-7 rounded-full transition ${on ? "bg-emerald-400" : "bg-white/20"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${on ? "left-3.5" : "left-0.5"}`}
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <button
            onClick={() => {
              feed();
              setFed(true);
              setTimeout(() => setFed(false), 1800);
            }}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 py-2.5 text-sm font-semibold text-[#1a0a00] shadow-lg shadow-orange-500/30 transition hover:brightness-110 active:scale-[0.98]"
          >
            {fed ? "🍤 Food dropped!" : "🍤 Feed the fish"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AquariumView({
  realistic = true,
}: {
  realistic?: boolean;
}) {
  const [ready, setReady] = useState(false);
  return (
    <div className="relative h-full min-h-[540px] w-full overflow-hidden bg-[#140b20] font-sans">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ fov: 38, near: 0.05, far: 100, position: [0, 1.95, 9.4] }}
        gl={{
          antialias: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          powerPreference: "high-performance",
        }}
        onCreated={() => setReady(true)}
      >
        <Suspense fallback={null}>
          <Scene realistic={realistic} />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto absolute left-3 top-3 w-[min(330px,calc(100vw-1.5rem))] rounded-2xl bg-[#0d0a1f]/60 p-4 text-white ring-1 ring-white/10 backdrop-blur-md max-sm:hidden">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-200/80">
              SIMULASI · BUKAN DATA SENSOR
            </span>
          </div>
          <h1 className="mt-1.5 text-xl font-bold tracking-tight">
            Nano Reef{" "}
            <span className="bg-gradient-to-r from-orange-300 to-pink-400 bg-clip-text text-transparent">
              Tank
            </span>
          </h1>
          <p className="mb-3 mt-1 text-xs leading-relaxed text-indigo-100/70">
            {realistic
              ? "Konsep proporsi 45 × 30 × 30 cm. Satu clownfish ilustratif; bukan persetujuan stocking atau gambar kerja konstruksi."
              : "Simulasi bebas. Biota, aliran, dan pencahayaan bukan rekomendasi pemeliharaan."}
          </p>
          <p className="mb-2 text-[10px] text-amber-200">
            Angka contoh, bukan hasil tes atau sensor akuarium.
          </p>
          <Params />
        </div>

        {!realistic && <Panel />}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-center text-[10px] text-indigo-100/70 backdrop-blur">
          Drag to orbit · Scroll to zoom · Fish models by Quaternius via{" "}
          <a
            className="pointer-events-auto underline decoration-dotted hover:text-white"
            href="https://github.com/Nihdao/three-aquarium-challenge"
            target="_blank"
            rel="noreferrer"
          >
            Nihdao/three-aquarium-challenge
          </a>
        </div>
      </div>

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#140b20] text-sm tracking-widest text-indigo-200">
          FILLING TANK…
        </div>
      )}
    </div>
  );
}
