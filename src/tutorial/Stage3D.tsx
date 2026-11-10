import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Scene from "../scene/Scene";

// No second aquarium model: tutorial frames and exploration render the same Scene.
export default function Stage3D({
  index,
  animate = false,
  pulse = 0,
  onReady,
}: {
  index: number;
  animate?: boolean;
  pulse?: number;
  onReady?: () => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 35, near: 0.05, far: 100, position: [0, 2.25, 8.6] }}
      gl={{
        antialias: false,
        preserveDrawingBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        powerPreference: "default",
      }}
    >
      <Suspense fallback={null}>
        <Scene
          key={index}
          tutorialStage={index}
          animate={animate}
          pulse={pulse}
          onReady={onReady}
        />
      </Suspense>
    </Canvas>
  );
}
export function TutorialCapture({ index }: { index: number }) {
  return (
    <div style={{ width: "100vw", height: "100vh" }} data-model="original-reef">
      <Stage3D
        index={index}
        onReady={() => {
          document.documentElement.dataset.sceneReady = "true";
        }}
      />
    </div>
  );
}
