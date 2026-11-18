import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import stoneGrain from "../assets/panorama-stone.webp";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { TANK, useReef } from "../store";
import { PANORAMA } from "./tankLayout";
import { Glass, Water } from "./Tank";
import { Block, Pipe, PumpHead } from "./Hardware";
import { makeRockGeometry, Sand, sandHeight } from "./Rockscape";
import { ZoaColony } from "./Corals";
import { ProceduralFish, type Behaviour } from "./Fish";
import { PRESETS } from "./Lights";
import { ledPanelTexture, panoramaBackdropTexture } from "./textures";
import { patchMaterial } from "./shaders";
import { branchingColony, platingColony, torchColony, type BranchForm } from "./panoramaCorals";
import type { Point3 } from "./geometry";

const { w, h, d, water } = PANORAMA;
const sx = w / TANK.w,
  sz = d / TANK.d,
  sandScale = 0.47;
const bed = (x: number, z: number) => sandHeight(x / sx, z / sz) * sandScale;

// Three uneven bommies. The gap below the saddle and the open foreground are intentional.
// prettier-ignore
const rocks: [Point3, Point3][] = [
  [[-2.22, 0.31, -0.26], [0.81, 0.52, 0.65]],
  [[-1.61, 0.40, -0.54], [0.69, 0.73, 0.63]],
  [[-1.75, 0.88, -0.51], [0.55, 0.48, 0.52]],
  [[-0.93, 0.93, -0.68], [0.72, 0.34, 0.50]],
  [[-0.09, 0.45, -0.52], [0.79, 0.76, 0.64]],
  [[0.21, 1.08, -0.68], [0.78, 0.51, 0.49]],
  [[0.94, 0.43, -0.53], [0.72, 0.72, 0.67]],
  [[0.83, 1.15, -0.60], [0.51, 0.43, 0.48]],
  [[1.62, 0.35, -0.16], [0.77, 0.54, 0.62]],
  [[2.53, 0.37, -0.36], [0.85, 0.55, 0.71]],
  [[2.77, 0.75, -0.45], [0.44, 0.35, 0.42]],
  [[-0.03, 0.31, 0.42], [0.63, 0.47, 0.56]],
  [[-2.62, 0.22, 0.50], [0.53, 0.28, 0.42]],
  [[1.43, 0.24, 0.57], [0.53, 0.36, 0.39]],
];
const rackZ = -d / 2 + 0.32;
const frags = [
  { x: -1.91, y: 1.82, z: rackZ, width: 1.6 },
  { x: 2.06, y: 1.82, z: rackZ, width: 1.55 },
  // The low rack is fixed to the *front* of the left overflow, not buried in its housing.
  { x: -3.4, y: 0.75, z: rackZ + 0.42, width: 1.17 },
];
const palettes = {
  lime: ["#146238", "#94ff2c"],
  jade: ["#096749", "#39ff7c"],
  violet: ["#50316e", "#c190f6"],
  amber: ["#99512b", "#ffd24f"],
} as const;
// x, z, spread, height, pigment; y is sampled from the actual rocks below each colony.
// prettier-ignore
const crown: [number, number, number, number, keyof typeof palettes, BranchForm?][] = [
  [-2.08, -0.40, 0.89, 0.52, "jade"],
  [-1.46, -0.59, 0.64, 0.62, "lime"],
  [-0.77, -0.64, 0.72, 0.62, "amber"],
  [0.05, -0.64, 0.66, 0.53, "violet"],
  [0.84, -0.61, 0.66, 0.89, "lime", "finger"],
  [1.28, -0.48, 0.51, 0.69, "amber"],
  [1.78, -0.27, 0.62, 0.58, "jade"],
  [2.76, -0.43, 0.91, 0.57, "jade"],
  [-2.65, 0.46, 0.30, 0.28, "amber"],
  [3.22, 0.37, 0.35, 0.32, "lime"],
];
const plugColors = { mouth: "#ffb432", disc: "#e45d30", ring: "#ff9f42", rim: "#a8df52" };
const swimmer: Behaviour = {
  kind: "circuit",
  center: [0.15, 1.26, 1.05],
  radius: [3.17, 0.24, 0.1],
};

function combine(parts: THREE.BufferGeometry[]) {
  const mesh = mergeGeometries(parts)!;
  parts.forEach((g) => g.dispose());
  return mesh;
}

function ReefGarden() {
  const glow = PRESETS[useReef((s) => s.light)].glow;
  const grain = useTexture(stoneGrain);
  const { rock, coral, torches } = useMemo(() => {
    const rock = combine(
      rocks.map(([p, s], i) => makeRockGeometry({ p, s, seed: i + 87 }).translate(...p)),
    );
    const surface = new THREE.Mesh(rock, new THREE.MeshBasicMaterial());
    const ray = new THREE.Raycaster();
    const rootY = (x: number, z: number) => {
      ray.set(new THREE.Vector3(x, h, z), new THREE.Vector3(0, -1, 0));
      return Math.max(bed(x, z), ray.intersectObject(surface, false)[0]?.point.y ?? 0) - 0.018;
    };
    const p = rock.getAttribute("position");
    const uv = new Float32Array(2 * p.count);
    for (let i = 0; i < p.count; i++) {
      uv[2 * i] = (p.getX(i) + 0.31 * p.getY(i)) * 1.3;
      uv[2 * i + 1] = (p.getZ(i) + 0.62 * p.getY(i)) * 1.3;
    }
    rock.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    const parts = crown.map(([x, z, spread, height, pigment, form], i) => {
      const [a, b] = palettes[pigment];
      const g = branchingColony(27 + i, a, b, form ?? (spread < 0.4 ? "frag" : "branch"));
      g.computeBoundingBox();
      const y = rootY(x, z);
      return g
        .scale(spread, Math.min(height, (water - 0.075 - y) / g.boundingBox!.max.y), spread)
        .translate(x, y, z);
    });
    parts.push(platingColony().rotateY(-0.3).translate(-1.93, rootY(-1.93, 0.02), 0.02));
    frags.forEach(({ x, y, z, width }, row) => {
      const pigments = [palettes.lime, palettes.violet, palettes.jade, palettes.amber];
      for (let i = 0; i < 4; i++) {
        const [a, b] = pigments[(i + row) % pigments.length];
        const size = 0.11 + ((i + row) % 3) * 0.038;
        const px = x + ((i + 0.5) / 4 - 0.5) * width;
        parts.push(
          branchingColony(52 + row * 4 + i, a, b, "frag")
            .scale(size, size * 1.24, size)
            .translate(px, y + 0.04, z),
        );
      }
    });
    const torches = (
      [
        [-0.03, 0.43, "#553981", "#c1a3ff", 1.1],
        [1.47, 0.49, "#673757", "#a5ffaf", 0.96],
        [2.62, -0.01, "#25583f", "#b8ff67", 0.78],
      ] as const
    ).map(([x, z, color, tip, scale], i) => ({
      position: [x, rootY(x, z), z] as Point3,
      scale,
      geometry: torchColony(45 + i, color, tip),
    }));
    surface.material.dispose();
    return { rock, coral: combine(parts), torches };
  }, []);
  const { rockMaterial, tissue, polyps } = useMemo(() => {
    grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
    grain.needsUpdate = true;
    const rockMaterial = patchMaterial(
      new THREE.MeshStandardMaterial({
        map: grain,
        bumpMap: grain,
        bumpScale: 0.046,
        vertexColors: true,
        color: "#7e89b5",
        roughness: 0.94,
      }),
      { caustics: 0.45 },
    );
    const tissue = patchMaterial(
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        roughness: 0.74,
        emissive: "#ffffff",
      }),
      { pigmentGlow: true },
    );
    const polyps = patchMaterial(
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.56,
        emissive: "#ffffff",
      }),
      { pigmentGlow: true, tentacle: { len: 0.68, droop: 0.02, sway: 0.075, speed: 1.15 } },
    );
    return { rockMaterial, tissue, polyps };
  }, [grain]);
  useEffect(
    () => () => {
      rock.dispose();
      coral.dispose();
      torches.forEach((t) => t.geometry.dispose());
      rockMaterial.dispose();
      tissue.dispose();
      polyps.dispose();
    },
    [rock, coral, torches, rockMaterial, tissue, polyps],
  );
  return (
    <group name="panorama-reef-garden">
      <group scale={[sx, sandScale, sz]}>
        <Sand tint="#c3ddff" />
      </group>
      <mesh geometry={rock} material={rockMaterial} castShadow receiveShadow />
      <mesh
        geometry={coral}
        material={tissue}
        material-emissiveIntensity={glow * 0.74}
        castShadow
        receiveShadow
      />
      {torches.map(({ geometry, position, scale }) => (
        <mesh
          key={position[0]}
          position={position}
          scale={scale}
          geometry={geometry}
          material={polyps}
          material-emissiveIntensity={glow * 0.8}
          castShadow
          receiveShadow
        />
      ))}
      {[-3.47, -1.19, 2.12].map((x, i) => (
        <ZoaColony
          key={x}
          position={[x, bed(x, 0.88), 0.88]}
          radius={0.18 + 0.04 * i}
          count={21}
          size={0.043}
          seed={19 + i}
          cols={plugColors}
        />
      ))}
      <ProceduralFish
        variant="tang"
        behaviour={swimmer}
        size={0.49}
        stretch={[0.86, 1.23, 1]}
        speed={0.48}
        seed={1}
        start={[2.8, 1.38, 1.1]}
      />
    </group>
  );
}

function Hood({ side }: { side: number }) {
  const x = side * 1.68,
    outer = side * (w / 2 - 0.13),
    rear = -d / 2;
  const mode = useReef((s) => s.light);
  const preset = PRESETS[mode];
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(x, 0.23, -0.2);
    return o;
  }, [x]);
  return (
    <group name="panorama-led-hood">
      <Block position={[outer, h - 0.1, rear - 0.04]} size={[0.21, 0.26, 0.18]} />
      <Pipe
        radius={0.05}
        color="#171d28"
        points={[
          [outer, h - 0.12, rear - 0.1],
          [outer, h + 0.65, rear - 0.1],
          [outer - side * 0.23, 3.91, rear + 0.16],
          [x + side * 0.56, 4.06, -0.15],
          [x, 3.99, -0.02],
          [x, 3.83, -0.02],
        ]}
      />
      <mesh position={[x, 3.75, -0.02]} scale={[2.27, 1, 0.94]} castShadow>
        <cylinderGeometry args={[0.57, Math.SQRT1_2, 0.28, 4, 1, false, Math.PI / 4]} />
        <meshStandardMaterial color="#141922" roughness={0.46} metalness={0.36} flatShading />
      </mesh>
      {[-0.56, -0.28, 0, 0.28, 0.56].map((offset) => (
        <Block key={offset} position={[x + offset, 3.905, -0.02]} size={[0.039, 0.055, 0.66]} />
      ))}
      <mesh position={[x, 3.608, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.03, 0.75]} />
        <meshBasicMaterial map={ledPanelTexture()} color="#c6dbff" />
      </mesh>
      <mesh position={[x + 0.85, 3.68, 0.437]}>
        <sphereGeometry args={[0.022, 12, 8]} />
        <meshBasicMaterial color="#77bcff" toneMapped={false} />
      </mesh>
      <primitive object={target} />
      <spotLight
        position={[x, 3.59, -0.02]}
        target={target}
        color={mode === "reef" && side === 1 ? preset.whiteCol : preset.blueCol}
        castShadow={side === 1}
        shadow-autoUpdate={false}
        shadow-needsUpdate
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.016}
        intensity={preset.blue * 0.97 + preset.white * 0.3}
        distance={6.8}
        angle={1.03}
        penumbra={0.68}
        decay={1.6}
      />
    </group>
  );
}

export default function PanoramaReef() {
  return (
    <group name="panorama-reef-model" position={[PANORAMA.x, 0, 0]}>
      <group scale={[sx, h / TANK.h, sz]}>
        <Glass opacity={0.045} />
        <Water height={(water * TANK.h) / h} />
      </group>
      <mesh position={[0, h / 2 - 0.04, -d / 2 + 0.028]}>
        <planeGeometry args={[w - 0.055, h]} />
        <meshStandardMaterial
          map={panoramaBackdropTexture()}
          emissiveMap={panoramaBackdropTexture()}
          emissive="#b7c7ff"
          emissiveIntensity={0.64}
          roughness={0.82}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Block
        position={[-w / 2 + 0.59, h / 2 - 0.07, -d / 2 + 0.22]}
        size={[1.13, h - 0.1, 0.41]}
        color="#161923"
      />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Hood side={side} />
          <group
            position={[side * (w / 2 - 0.032), 1.71, -0.26]}
            rotation={[0, (-side * Math.PI) / 2, 0]}
          >
            <PumpHead />
          </group>
        </group>
      ))}
      {frags.map(({ x, y, z, width }) => (
        <group key={x} name="panorama-frag-rack" position={[x, y, z]}>
          <Block position={[0, 0, 0]} size={[width, 0.045, 0.54]} color="#182032" />
          <Block position={[0, -0.077, -0.21]} size={[0.29, 0.19, 0.23]} />
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[((i + 0.5) / 4 - 0.5) * width, 0.033, 0]}>
              <cylinderGeometry args={[0.063, 0.058, 0.025, 12]} />
              <meshStandardMaterial color="#888293" />
            </mesh>
          ))}
        </group>
      ))}
      <ReefGarden />
      <pointLight
        position={[0, h + 0.16, -3.65]}
        distance={6.8}
        intensity={20}
        color="#1041ff"
        decay={1.6}
      />
    </group>
  );
}
