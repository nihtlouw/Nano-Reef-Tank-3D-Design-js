import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TANK, useReef, type LightMode } from "../store";
import { globalUniforms, glowMaterials } from "./shaders";

interface Preset {
  blue: number;
  blueCol: string;
  white: number;
  whiteCol: string;
  hemi: number;
  hemiSky: string;
  room: number;
  roomCol: string;
  glow: number;
  caustic: number;
  causticCol: string;
  exposure: number;
}

export const PRESETS: Record<LightMode, Preset> = {
  actinic: {
    blue: 48,
    blueCol: "#2f4cff",
    white: 12,
    whiteCol: "#a8bcff",
    hemi: 0.55,
    hemiSky: "#8a6cff",
    room: 22,
    roomCol: "#ff7ac0",
    glow: 1,
    caustic: 0.9,
    causticCol: "#8fb0ff",
    exposure: 0.95,
  },
  reef: {
    blue: 30,
    blueCol: "#4a66ff",
    white: 32,
    whiteCol: "#eef3ff",
    hemi: 0.8,
    hemiSky: "#d8ccff",
    room: 26,
    roomCol: "#ffb08a",
    glow: 0.4,
    caustic: 1.0,
    causticCol: "#ffffff",
    exposure: 1.0,
  },
  moon: {
    blue: 22,
    blueCol: "#1c2cff",
    white: 0,
    whiteCol: "#7a8cff",
    hemi: 0.18,
    hemiSky: "#3a2a9a",
    room: 5,
    roomCol: "#7a4aff",
    glow: 1.9,
    caustic: 0.3,
    causticCol: "#4a6aff",
    exposure: 1.15,
  },
};

const WORK_LIGHT: Preset = {
  blue: 8,
  blueCol: "#b4cadf",
  white: 22,
  whiteCol: "#eef2f6",
  hemi: 0.8,
  hemiSky: "#bccbd9",
  room: 18,
  roomCol: "#d8e0e8",
  glow: 0.3,
  caustic: 0.35,
  causticCol: "#c6d8e3",
  exposure: 0.9,
};

export default function Lights({
  wet = true,
  preset,
  work = false,
}: {
  wet?: boolean;
  preset?: LightMode;
  work?: boolean;
}) {
  const blue = useRef<THREE.SpotLight>(null);
  const white = useRef<THREE.SpotLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const room = useRef<THREE.PointLight>(null);
  const room2 = useRef<THREE.PointLight>(null);
  const flow = useReef((s) => s.flow);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0.3, 0);
    return o;
  }, []);
  const cur = useRef({ glow: 1 });
  const tmp = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    globalUniforms.uFlow.value = flow;
  }, [flow]);

  useEffect(() => {
    if (blue.current) blue.current.target = target;
    if (white.current) white.current.target = target;
  }, [target]);

  useFrame(({ clock, gl }, dt) => {
    globalUniforms.uTime.value = clock.elapsedTime;
    const p = work ? WORK_LIGHT : PRESETS[preset ?? useReef.getState().light];
    const k = 1 - Math.exp(-dt * 2.5);
    if (blue.current) {
      blue.current.intensity = THREE.MathUtils.lerp(
        blue.current.intensity,
        p.blue,
        k,
      );
      blue.current.color.lerp(tmp.set(p.blueCol), k);
    }
    if (white.current) {
      white.current.intensity = THREE.MathUtils.lerp(
        white.current.intensity,
        p.white,
        k,
      );
      white.current.color.lerp(tmp.set(p.whiteCol), k);
    }
    if (hemi.current) {
      hemi.current.intensity = THREE.MathUtils.lerp(
        hemi.current.intensity,
        p.hemi,
        k,
      );
      hemi.current.color.lerp(tmp.set(p.hemiSky), k);
    }
    if (room.current) {
      room.current.intensity = THREE.MathUtils.lerp(
        room.current.intensity,
        p.room,
        k,
      );
      room.current.color.lerp(tmp.set(p.roomCol), k);
    }
    if (room2.current) {
      room2.current.color.lerp(tmp.set(work ? "#c7d6df" : "#9a7aff"), k);
      room2.current.intensity = THREE.MathUtils.lerp(
        room2.current.intensity,
        p.room * 0.8,
        k,
      );
    }
    globalUniforms.uCaustic.value = THREE.MathUtils.lerp(
      globalUniforms.uCaustic.value,
      wet ? p.caustic : 0,
      k,
    );
    globalUniforms.uCausticColor.value.lerp(tmp.set(p.causticCol), k);
    cur.current.glow = THREE.MathUtils.lerp(cur.current.glow, p.glow, k);
    for (const g of glowMaterials)
      g.mat.emissiveIntensity = g.base * cur.current.glow;
    gl.toneMappingExposure = THREE.MathUtils.lerp(
      gl.toneMappingExposure,
      p.exposure,
      k,
    );
  });

  return (
    <group>
      <primitive object={target} />
      <hemisphereLight ref={hemi} args={["#8a6cff", "#2a1020", 0.55]} />
      {/* Room fill */}
      <pointLight
        ref={room}
        position={[-6, 6, 4]}
        intensity={22}
        distance={30}
        decay={1.4}
        color="#ff7ac0"
      />
      <pointLight
        ref={room2}
        position={[7, 7, -2]}
        intensity={18}
        distance={25}
        decay={1.4}
        color="#9a7aff"
      />
      {/* LED fixture */}
      <spotLight
        ref={blue}
        position={[0, TANK.h + 0.5, 0.2]}
        angle={1.05}
        penumbra={0.7}
        intensity={95}
        distance={14}
        decay={1.3}
        color="#2f4cff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      <spotLight
        ref={white}
        position={[0.4, TANK.h + 0.5, -0.1]}
        angle={1.0}
        penumbra={0.8}
        intensity={18}
        distance={14}
        decay={1.3}
        color="#a8bcff"
      />
      {/* light spill onto the wall behind */}
      <pointLight
        position={[0, TANK.h + 0.6, -2.8]}
        intensity={10}
        distance={8}
        decay={1.5}
        color="#3a5cff"
      />
    </group>
  );
}
