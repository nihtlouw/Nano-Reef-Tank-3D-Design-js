import { lazy, Suspense, useEffect, useState } from "react";
import Tutorial from "./tutorial/Tutorial";

const Reference = lazy(() => import("./ReferenceApp"));
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
  if (!hash || hash === "#" || hash.startsWith("#tutorial"))
    return <Tutorial />;
  return (
    <Suspense
      fallback={<div className="tutorial-loading">Membuka referensi…</div>}
    >
      <Reference />
    </Suspense>
  );
}
