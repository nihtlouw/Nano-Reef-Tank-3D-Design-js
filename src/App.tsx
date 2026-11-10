import { lazy, Suspense, useEffect, useState } from "react";
import Tutorial, { TutorialIcon } from "./tutorial/Tutorial";
const Exploration = lazy(() => import("./Exploration"));
const Capture = lazy(() =>
  import("./tutorial/Stage3D").then((module) => ({
    default: module.TutorialCapture,
  })),
);

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const change = () => setHash(window.location.hash);
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  const capture = new URLSearchParams(window.location.search).get("capture");
  if (import.meta.env.DEV && capture !== null) {
    const index = Number(capture);
    return (
      <Suspense fallback={null}>
        <Capture
          index={
            Number.isInteger(index) && index >= 0 && index <= 10 ? index : 0
          }
        />
      </Suspense>
    );
  }
  const explore = hash === "#explore";
  return (
    <div className="nano-app">
      <header className="site-header">
        <a
          href="#tutorial/0"
          className="site-brand"
          aria-label="Nano Reef, awal tutorial"
        >
          <span>
            <TutorialIcon name="wave" size={23} />
          </span>
          <strong>Nano Reef</strong>
          <small>DESIGN & BUILD</small>
        </a>
        <nav aria-label="Navigasi utama">
          <a
            href="#tutorial"
            onClick={(event) => {
              if (!explore) event.preventDefault();
            }}
            aria-current={!explore ? "page" : undefined}
          >
            <TutorialIcon name="list" size={16} />
            <span>Tutorial Visual</span>
          </a>
          <a href="#explore" aria-current={explore ? "page" : undefined}>
            <TutorialIcon name="cube" size={17} />
            <span>Eksplorasi 3D</span>
          </a>
        </nav>
      </header>
      {explore ? (
        <Suspense
          fallback={
            <div className="tutorial-loading">Menyiapkan eksplorasi 3D…</div>
          }
        >
          <Exploration />
        </Suspense>
      ) : (
        <Tutorial />
      )}
    </div>
  );
}
