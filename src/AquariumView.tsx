import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Scene from "./scene/Scene";

export default function AquariumView({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 38, near: 0.05, far: 100, position: [0, 1.95, 9.4] }}
      gl={{
        antialias: false,
        preserveDrawingBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        powerPreference: "high-performance",
      }}
    >
      <Suspense fallback={null}>
        <Scene onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
