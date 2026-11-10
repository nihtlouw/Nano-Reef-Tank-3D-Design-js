import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useReef, type CamView } from "../store";
import Room from "./Room";
import Tank from "./Tank";
import Rockscape from "./Rockscape";
import Corals from "./Corals";
import Anemone from "./Anemone";
import Lights from "./Lights";
import Particles from "./Particles";
import { GltfFish, ProceduralFish, type Behaviour } from "./Fish";
import butterflyUrl from "../assets/ButterflyFish.glb?url";
import mandarinUrl from "../assets/MandarinFish.glb?url";
import { stageParts } from "../tutorial/stages";
import TutorialTools from "../tutorial/TutorialTools";
import BuildMotion from "./BuildMotion";

const VIEWS: Record<
  CamView,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  front: { pos: [0, 1.95, 9.4], target: [0, 1.65, 0] },
  angle: { pos: [-6.4, 3.4, 6.9], target: [0.1, 1.5, 0] },
  top: { pos: [0.01, 9.8, 1.8], target: [0, 1.0, 0] },
  inside: { pos: [2.2, 1.55, 1.25], target: [0.3, 2.0, -0.3] },
};

function CameraRig({ stage }: { stage?: number }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  const nonce = useReef((s) => s.viewNonce);
  const anim = useRef<{
    t: number;
    fromP: THREE.Vector3;
    fromT: THREE.Vector3;
    toP: THREE.Vector3;
    toT: THREE.Vector3;
  } | null>(null);

  const fit = (v: CamView) => {
    const def = VIEWS[v];
    const aspect = size.width / size.height;
    const presentation: [number, number, number] | null =
      stage === undefined
        ? null
        : stage === 0
          ? [0, 2.5, 10.3]
          : [5, 6, 8, 10].includes(stage)
            ? [5.8, 3.7, 9.5]
            : [0, 2.25, 8.6];
    const p = new THREE.Vector3(
      ...(v === "front" && presentation ? presentation : def.pos),
    );
    const t = new THREE.Vector3(...def.target);
    if (v !== "inside" && aspect < 1.45) {
      const k = Math.min(2.4, 1.45 / aspect);
      p.sub(t).multiplyScalar(k).add(t);
    }
    return { p, t };
  };

  useEffect(() => {
    const { p, t } = fit("front");
    camera.position.copy(p);
    controls.current?.target.copy(t);
    controls.current?.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stage !== undefined || nonce === 0) return;
    const { p, t } = fit(useReef.getState().view);
    anim.current = {
      t: 0,
      fromP: camera.position.clone(),
      fromT: controls.current
        ? controls.current.target.clone()
        : new THREE.Vector3(),
      toP: p,
      toT: t,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  useFrame((_, dt) => {
    const a = anim.current;
    if (!a || !controls.current) return;
    a.t = Math.min(1, a.t + dt / 1.6);
    const e =
      a.t < 0.5 ? 4 * a.t * a.t * a.t : 1 - Math.pow(-2 * a.t + 2, 3) / 2;
    camera.position.lerpVectors(a.fromP, a.toP, e);
    controls.current.target.lerpVectors(a.fromT, a.toT, e);
    controls.current.update();
    if (a.t >= 1) anim.current = null;
  });

  return (
    <OrbitControls
      ref={controls as never}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={1.5}
      maxDistance={20}
      maxPolarAngle={Math.PI * 0.58}
      target={[0, 1.65, 0]}
    />
  );
}

function Livestock() {
  const mandarin = useReef((s) => s.mandarin);
  const butterfly = useReef((s) => s.butterfly);
  const goby = useReef((s) => s.goby);

  const host: Behaviour = useMemo(
    () => ({
      kind: "host",
      home: new THREE.Vector3(0.75, 2.05, 0.25),
      radius: [0.65, 0.55, 0.55],
    }),
    [],
  );
  const bottom: Behaviour = useMemo(() => ({ kind: "bottom" }), []);
  const roam: Behaviour = useMemo(() => ({ kind: "roam" }), []);
  const perch: Behaviour = useMemo(
    () => ({
      kind: "perch",
      spots: [
        new THREE.Vector3(-1.62, 0.82, 0.62),
        new THREE.Vector3(1.95, 0.7, 0.78),
        new THREE.Vector3(-0.05, 1.42, 0.38),
        new THREE.Vector3(1.3, 1.08, 0.42),
      ],
    }),
    [],
  );

  return (
    <group>
      {/* Clownfish pair hosting the bubble tip anemone */}
      <ProceduralFish
        variant="snowflake"
        size={0.62}
        behaviour={host}
        speed={0.42}
        seed={3}
        start={[1.0, 2.2, 0.4]}
      />
      <ProceduralFish
        variant="black"
        size={0.7}
        behaviour={host}
        speed={0.38}
        seed={7}
        start={[1.4, 1.9, 0.3]}
      />
      {goby && (
        <ProceduralFish
          variant="goby"
          size={0.34}
          stretch={[0.8, 0.72, 1.25]}
          behaviour={perch}
          speed={0.5}
          seed={11}
          start={[-1.62, 0.82, 0.62]}
        />
      )}
      <Suspense fallback={null}>
        {mandarin && (
          <GltfFish
            url={mandarinUrl}
            length={0.42}
            behaviour={bottom}
            speed={0.18}
            seed={5}
            start={[-0.8, 0.7, 1.0]}
          />
        )}
        {butterfly && (
          <GltfFish
            url={butterflyUrl}
            length={0.62}
            behaviour={roam}
            speed={0.45}
            seed={9}
            start={[-1.5, 2.2, 0.8]}
          />
        )}
      </Suspense>
    </group>
  );
}

function FrameReady({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
    if (frames.current === 6) onReady?.();
  });
  return null;
}

export default function Scene({
  tutorialStage,
  animate = false,
  pulse = 0,
  onReady,
}: {
  tutorialStage?: number;
  animate?: boolean;
  pulse?: number;
  onReady?: () => void;
}) {
  const parts = stageParts(tutorialStage);
  return (
    <>
      <color attach="background" args={["#140b20"]} />
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#7a6aff"
          position={[0, 6, -6]}
          scale={[14, 5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#ff8ac8"
          position={[-8, 3, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[8, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.5}
          color="#4060ff"
          position={[0, 8, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[6, 2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.8}
          color="#c8b8ff"
          position={[6, 3, 6]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[6, 6, 1]}
        />
      </Environment>
      <Lights
        wet={parts.water}
        preset={tutorialStage === undefined ? undefined : "actinic"}
      />
      <Room />
      <group name="original-reef-model">
        {parts.rocks && (
          <BuildMotion active={animate && tutorialStage === 4} pulse={pulse}>
            <Rockscape life={parts.life} />
          </BuildMotion>
        )}
        {parts.life && (
          <>
            <Corals />
            <Anemone
              position={[-0.55, 2.55, -0.6]}
              rotation={[0.18, 0, -0.12]}
              radius={0.5}
              length={0.64}
              count={270}
              seed={1}
              droop={0.14}
              color="#ff9a52"
              tip="#ff7a3a"
              disc="#5aa8c8"
            />
            <Anemone
              position={[0.55, 1.86, -0.12]}
              rotation={[0.6, 0, -0.18]}
              radius={0.48}
              length={0.72}
              count={290}
              seed={2}
              color="#ffa25a"
              tip="#ff7040"
              disc="#5ab4d6"
              droop={0.1}
            />
            <Livestock />
          </>
        )}
        {parts.running && parts.water && <Particles />}
        <Tank
          water={parts.water}
          equipment={parts.equipment}
          fixture={parts.fixture}
          rays={parts.running}
          exploded={parts.exploded}
          waterHeight={tutorialStage === 2 ? 2.8 : undefined}
          animateStage={animate ? tutorialStage : undefined}
          pulse={pulse}
        />
        {tutorialStage !== undefined && (
          <TutorialTools
            stage={tutorialStage}
            animate={animate}
            pulse={pulse}
          />
        )}
      </group>
      <CameraRig stage={tutorialStage} />
      <EffectComposer multisampling={4}>
        <Bloom
          mipmapBlur
          intensity={0.75}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.25}
          radius={0.7}
        />
        <Vignette eskil={false} offset={0.25} darkness={0.65} />
      </EffectComposer>
      <FrameReady onReady={onReady} />
    </>
  );
}
