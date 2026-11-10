import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { TANK } from "../store";
import { fbm3, mulberry32, noise3 } from "./noise";
import { patchMaterial, registerGlow } from "./shaders";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { sandSkirtGeometry, starPolypGeometry } from "./geometry";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { sandSideTexture, sandTexture } from "./textures";

const { w: W, d: D, sand: SAND } = TANK;

export function sandHeight(x: number, z: number) {
  // gentle slope toward the back + dunes
  const back = (-z / D + 0.5) * 0.18;
  return SAND + back + fbm3(x * 0.6, 0, z * 0.6, 3) * 0.08;
}

/* ---------------- Sand ---------------- */
function Sand() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(W - 0.07, D - 0.07, 140, 84);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      p.setY(i, sandHeight(x, z) + noise3(x * 9, 1, z * 9) * 0.008);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const mat = useMemo(
    () =>
      patchMaterial(
        new THREE.MeshStandardMaterial({
          map: sandTexture(),
          color: "#e8eefc",
          roughness: 0.95,
        }),
        { caustics: 1.25 },
      ),
    [],
  );
  // front cross-section of the sand bed (visible through the glass)
  const sideGeo = useMemo(
    () => sandSkirtGeometry(W - 0.08, D - 0.08, sandHeight),
    [],
  );

  return (
    <group>
      <mesh geometry={geo} material={mat} receiveShadow />
      <mesh geometry={sideGeo}>
        <meshStandardMaterial
          map={sandSideTexture()}
          color="#c9d4f0"
          roughness={1}
          emissive="#3050c0"
          emissiveIntensity={0.25}
        />
      </mesh>
      <Rubble />
    </group>
  );
}

function Rubble() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 140;
  const mat = useMemo(
    () =>
      patchMaterial(
        new THREE.MeshStandardMaterial({
          color: "#c9bfd6",
          roughness: 1,
          flatShading: true,
        }),
        {
          caustics: 1,
        },
      ),
    [],
  );
  useLayoutEffect(() => {
    const r = mulberry32(42);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const x = (r() - 0.5) * (W - 0.4);
      const z = (r() - 0.5) * (D - 0.4);
      const s = 0.02 + r() * r() * 0.07;
      e.set(r() * 3, r() * 3, r() * 3);
      q.setFromEuler(e);
      m.compose(
        new THREE.Vector3(x, sandHeight(x, z) + s * 0.3, z),
        q,
        new THREE.Vector3(s, s * 0.7, s),
      );
      ref.current!.setMatrixAt(i, m);
      c.setHSL(0.8 + r() * 0.15, 0.25, 0.55 + r() * 0.3);
      ref.current!.setColorAt(i, c);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, count]}
      material={mat}
      castShadow
    >
      <dodecahedronGeometry args={[1, 0]} />
    </instancedMesh>
  );
}

/* ---------------- Rocks ---------------- */
interface RockDef {
  p: [number, number, number];
  s: [number, number, number];
  seed: number;
  detail?: number;
  coat?: { color: string; count: number; len: number };
}

export const ROCKS: RockDef[] = [
  { p: [0.15, 0.6, -0.45], s: [1.55, 0.75, 1.0], seed: 1, detail: 5 },
  { p: [1.35, 0.55, -0.25], s: [0.95, 0.62, 0.8], seed: 2 },
  { p: [-1.0, 0.6, -0.55], s: [1.0, 0.72, 0.8], seed: 3 },
  { p: [-0.45, 1.3, -0.6], s: [0.72, 0.75, 0.62], seed: 4 },
  { p: [-0.55, 1.95, -0.62], s: [0.42, 0.62, 0.42], seed: 5 },
  { p: [0.62, 1.22, -0.5], s: [0.78, 0.6, 0.6], seed: 6 },
  { p: [0.45, 1.55, -0.25], s: [0.4, 0.35, 0.38], seed: 15 },
  { p: [-1.65, 0.45, 0.45], s: [0.48, 0.3, 0.4], seed: 7 },
  { p: [1.95, 0.42, 0.55], s: [0.35, 0.24, 0.3], seed: 8 },
  {
    p: [-2.2, 0.85, -1.15],
    s: [0.7, 0.85, 0.5],
    seed: 9,
    coat: { color: "#5dff6a", count: 850, len: 0.07 },
  },
  {
    p: [-1.45, 1.15, -1.25],
    s: [0.6, 1.0, 0.45],
    seed: 10,
    coat: { color: "#8dff4a", count: 780, len: 0.075 },
  },
  { p: [2.3, 0.7, -1.05], s: [0.62, 0.62, 0.5], seed: 11 },
  { p: [2.55, 0.45, 0.2], s: [0.35, 0.3, 0.32], seed: 12 },
  { p: [-2.55, 0.42, 0.6], s: [0.32, 0.22, 0.3], seed: 13 },
];

const CORALLINE = [
  new THREE.Color("#8a2f5e"),
  new THREE.Color("#d0568a"),
  new THREE.Color("#5e1a2e"),
  new THREE.Color("#e48ab0"),
  new THREE.Color("#a8968a"),
  new THREE.Color("#4f5f37"),
];

export function makeRockGeometry(def: RockDef, mature = true) {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(
    1,
    Math.max(9, def.detail ?? 9),
  );
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = mergeVertices(g);
  const p = g.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(p.count * 3);
  const v = new THREE.Vector3();
  const o = def.seed * 17.3;
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    let d =
      1 +
      0.32 * fbm3(v.x * 1.2 + o, v.y * 1.2, v.z * 1.2, 3) +
      0.14 * fbm3(v.x * 4 + o, v.y * 4, v.z * 4, 3) +
      0.05 * noise3(v.x * 12 + o, v.y * 12, v.z * 12) +
      0.025 * noise3(v.x * 28 + o, v.y * 28, v.z * 28);
    const hole = noise3(v.x * 3.5 + o, v.y * 3.5 + 5, v.z * 3.5);
    if (hole > 0.25) d -= (hole - 0.25) * 0.6;
    v.multiplyScalar(d);
    if (v.y < -0.45) v.y = -0.45 + (v.y + 0.45) * 0.25;
    p.setXYZ(i, v.x * def.s[0], v.y * def.s[1], v.z * def.s[2]);

    // coralline colouring
    const n1 = fbm3(v.x * 2.5 + o, v.y * 2.5, v.z * 2.5, 3) * 0.5 + 0.5;
    const n2 = noise3(v.x * 6 - o, v.y * 6, v.z * 6) * 0.5 + 0.5;
    c.copy(CORALLINE[0]).lerp(
      CORALLINE[1],
      THREE.MathUtils.smoothstep(n1, 0.45, 0.75),
    );
    c.lerp(CORALLINE[2], THREE.MathUtils.smoothstep(n2, 0.55, 0.8) * 0.8);
    if (n2 < 0.28) c.lerp(CORALLINE[3], 0.7);
    if (hole > 0.2) c.lerp(new THREE.Color("#2a0e1c"), 0.6);
    const algae = noise3(v.x * 2 + 9 + o, v.y * 2, v.z * 2);
    if (algae > 0.35 && v.y > 0) c.lerp(CORALLINE[5], 0.5);
    if (algae < -0.45) c.lerp(CORALLINE[4], 0.5);
    if (!mature)
      c.set("#b2a58d").lerp(
        new THREE.Color("#756e62"),
        THREE.MathUtils.clamp(n2 * 0.6 + Math.max(0, hole) * 0.8, 0, 1),
      );
    colors.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

let rockMat: THREE.MeshStandardMaterial | null = null;
function getRockMat() {
  if (!rockMat)
    rockMat = patchMaterial(
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92 }),
      {
        caustics: 0.8,
      },
    );
  return rockMat;
}

/* polyp coat (green star polyps) sampled from rock surface */
function PolypCoat({
  geo,
  color,
  count,
  len,
  seed,
}: {
  geo: THREE.BufferGeometry;
  color: string;
  count: number;
  len: number;
  seed: number;
}) {
  const stalkRef = useRef<THREE.InstancedMesh>(null);
  const tipRef = useRef<THREE.InstancedMesh>(null);
  const { stalkGeo, tipGeo, stalkMat, tipMat } = useMemo(() => {
    const sg = new THREE.CylinderGeometry(0.007, 0.011, len, 5, 4);
    sg.translate(0, len / 2, 0);
    const tg = starPolypGeometry(len);
    const sm = patchMaterial(
      new THREE.MeshStandardMaterial({
        color: "#5a2a6a",
        roughness: 0.8,
        emissive: "#3a1050",
        emissiveIntensity: 0.4,
      }),
      { polyp: { len, sway: 0.02 } },
    );
    const tm = patchMaterial(
      registerGlow(
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 1,
          roughness: 0.6,
        }),
        0.38,
      ),
      { polyp: { len, sway: 0.02 } },
    );
    return { stalkGeo: sg, tipGeo: tg, stalkMat: sm, tipMat: tm };
  }, [color, len]);

  useLayoutEffect(() => {
    const r = mulberry32(seed);
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geo))
      .setRandomGenerator(r)
      .build();
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const pos = new THREE.Vector3();
    const nor = new THREE.Vector3();
    let placed = 0;
    let tries = 0;
    while (placed < count && tries < count * 20) {
      tries++;
      sampler.sample(pos, nor);
      if (nor.y < -0.15 || nor.z < -0.5) continue;
      pos.addScaledVector(nor, 0.002);
      nor.normalize();
      q.setFromUnitVectors(up, nor);
      const s = 0.7 + r() * 0.6;
      m.compose(pos, q, new THREE.Vector3(s, s, s));
      stalkRef.current!.setMatrixAt(placed, m);
      tipRef.current!.setMatrixAt(placed, m);
      placed++;
    }
    stalkRef.current!.count = placed;
    tipRef.current!.count = placed;
    stalkRef.current!.instanceMatrix.needsUpdate = true;
    tipRef.current!.instanceMatrix.needsUpdate = true;
  }, [geo, count, seed]);

  return (
    <group>
      <instancedMesh
        ref={stalkRef}
        args={[stalkGeo, stalkMat, count]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={tipRef}
        args={[tipGeo, tipMat, count]}
        frustumCulled={false}
      />
    </group>
  );
}

function Rock({ def, life }: { def: RockDef; life: boolean }) {
  const geo = useMemo(() => makeRockGeometry(def, life), [def, life]);
  return (
    <group position={def.p}>
      <mesh geometry={geo} material={getRockMat()} castShadow receiveShadow />
      {life && def.coat && (
        <PolypCoat
          geo={geo}
          color={def.coat.color}
          count={def.coat.count}
          len={def.coat.len}
          seed={def.seed * 7}
        />
      )}
    </group>
  );
}

export default function Rockscape({ life = true }: { life?: boolean }) {
  return (
    <group>
      <Sand />
      {ROCKS.map((r, i) => (
        <Rock key={i} def={r} life={life} />
      ))}
    </group>
  );
}

// Shared collision/attachment height field, sampled once and bilinearly interpolated.
// It uses the actual displaced rock triangles, not their ellipsoid bounds.
let surfaceGrid: Float32Array | null = null;
const GRID_X = 100,
  GRID_Z = 64;
export function reefSurfaceAt(x: number, z: number) {
  if (!surfaceGrid) {
    surfaceGrid = new Float32Array((GRID_X + 1) * (GRID_Z + 1));
    const meshes = ROCKS.map((def) => {
      const m = new THREE.Mesh(makeRockGeometry(def));
      m.position.set(...def.p);
      m.updateMatrixWorld();
      return m;
    });
    const ray = new THREE.Raycaster();
    for (let j = 0; j <= GRID_Z; j++)
      for (let i = 0; i <= GRID_X; i++) {
        const px = -W / 2 + (i / GRID_X) * W,
          pz = -D / 2 + (j / GRID_Z) * D;
        ray.set(new THREE.Vector3(px, 5, pz), new THREE.Vector3(0, -1, 0));
        const hit = ray.intersectObjects(meshes, false)[0];
        surfaceGrid[j * (GRID_X + 1) + i] = Math.max(
          sandHeight(px, pz),
          hit?.point.y ?? 0,
        );
      }
    meshes.forEach((m) => {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
  }
  const gx = THREE.MathUtils.clamp(
      ((x + W / 2) / W) * GRID_X,
      0,
      GRID_X - 0.001,
    ),
    gz = THREE.MathUtils.clamp(((z + D / 2) / D) * GRID_Z, 0, GRID_Z - 0.001);
  const i = Math.floor(gx),
    j = Math.floor(gz),
    t = gx - i,
    u = gz - j,
    k = j * (GRID_X + 1) + i;
  return THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(surfaceGrid[k], surfaceGrid[k + 1], t),
    THREE.MathUtils.lerp(
      surfaceGrid[k + GRID_X + 1],
      surfaceGrid[k + GRID_X + 2],
      t,
    ),
    u,
  );
}
