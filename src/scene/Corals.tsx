import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { fbm3, mulberry32 } from "./noise";
import { patchMaterial, registerGlow } from "./shaders";
import { mushroomTexture, zoaTexture, type ZoaColors } from "./textures";
import { sandHeight, makeRockGeometry } from "./Rockscape";
import Anemone from "./Anemone";

/* ---------------- Zoanthid colony ---------------- */
interface ZoaProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  radius?: number;
  count?: number;
  cols: ZoaColors;
  seed?: number;
  size?: number;
  len?: number;
  stalk?: string;
  mound?: boolean;
}

export function ZoaColony({
  position,
  rotation = [0, 0, 0],
  radius = 0.28,
  count = 26,
  cols,
  seed = 1,
  size = 0.05,
  len = 0.06,
  stalk = "#5b4a2a",
  mound = true,
}: ZoaProps) {
  const stalkRef = useRef<THREE.InstancedMesh>(null);
  const discRef = useRef<THREE.InstancedMesh>(null);
  const moundGeo = useMemo(
    () => makeRockGeometry({ p: [0, 0, 0], s: [radius, radius * 0.45, radius * 0.85], seed: seed + 50, detail: 3 }),
    [radius, seed]
  );
  const { sg, dg, sm, dm } = useMemo(() => {
    const sg = new THREE.CylinderGeometry(size * 0.55, size * 0.7, len, 8, 3);
    sg.translate(0, len / 2, 0);
    const dg = new THREE.CircleGeometry(size, 20);
    dg.rotateX(-Math.PI / 2);
    dg.translate(0, len + 0.002, 0);
    const tex = zoaTexture(cols);
    const sm = patchMaterial(new THREE.MeshStandardMaterial({ color: stalk, roughness: 0.7 }), {
      polyp: { len, sway: 0.012 },
      caustics: 0.5,
    });
    const dm = patchMaterial(
      registerGlow(
        new THREE.MeshStandardMaterial({
          map: tex,
          emissiveMap: tex,
          emissive: "#ffffff",
          emissiveIntensity: 1,
          alphaTest: 0.3,
          transparent: false,
          roughness: 0.5,
          side: THREE.DoubleSide,
        }),
        0.85
      ),
      { polyp: { len, sway: 0.012 } }
    );
    return { sg, dg, sm, dm };
  }, [cols, size, len, stalk]);

  useLayoutEffect(() => {
    const r = mulberry32(seed * 77);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2;
      const e = Math.sqrt(r()) * 1.15;
      const nx = Math.sin(e) * Math.cos(a);
      const nz = Math.sin(e) * Math.sin(a);
      const ny = Math.cos(e);
      const p = new THREE.Vector3(nx * radius * 0.85, mound ? ny * radius * 0.42 : 0, nz * radius * 0.75);
      const n = new THREE.Vector3(nx * 0.8, ny + 0.3, nz * 0.8).normalize();
      q.setFromUnitVectors(up, n);
      const s = 0.75 + r() * 0.45;
      m.compose(p, q, new THREE.Vector3(s, 0.7 + r() * 0.7, s));
      stalkRef.current!.setMatrixAt(i, m);
      discRef.current!.setMatrixAt(i, m);
    }
    stalkRef.current!.instanceMatrix.needsUpdate = true;
    discRef.current!.instanceMatrix.needsUpdate = true;
  }, [count, radius, seed, mound]);

  return (
    <group position={position} rotation={rotation}>
      {mound && (
        <mesh geometry={moundGeo} castShadow receiveShadow>
          <meshStandardMaterial vertexColors roughness={0.95} />
        </mesh>
      )}
      <instancedMesh ref={stalkRef} args={[sg, sm, count]} frustumCulled={false} castShadow />
      <instancedMesh ref={discRef} args={[dg, dm, count]} frustumCulled={false} />
    </group>
  );
}

/* ---------------- Mushroom coral (Rhodactis) ---------------- */
interface MushProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  radius?: number;
  base?: string;
  bump?: string;
  center?: string;
  seed?: number;
}

export function Mushroom({
  position,
  rotation = [0, 0, 0],
  radius = 0.35,
  base = "#ff7a3a",
  bump = "#ffb070",
  center = "#b8381a",
  seed = 1,
}: MushProps) {
  const ref = useRef<THREE.Group>(null);
  const { geo, mat } = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 64, 20, 0, Math.PI * 2, 0, Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const a = Math.atan2(z, x);
      const rim = 1 - y;
      const wav = Math.sin(a * 7 + seed) * 0.06 * rim * rim + fbm3(x * 2 + seed, 0, z * 2, 2) * 0.08 * rim;
      p.setXYZ(i, x * (1 + wav * 0.3), y * 0.28 + wav, z * (1 + wav * 0.3));
      uv.setXY(i, 0.5 + x * 0.5, 0.5 + z * 0.5);
    }
    g.computeVertexNormals();
    const tex = mushroomTexture(base, bump, center, base + bump + center);
    const m = patchMaterial(
      registerGlow(
        new THREE.MeshStandardMaterial({
          map: tex,
          emissiveMap: tex,
          emissive: "#ffffff",
          emissiveIntensity: 1,
          roughness: 0.55,
          side: THREE.DoubleSide,
        }),
        0.42
      ),
      { caustics: 0.6 }
    );
    return { geo: g, mat: m };
  }, [base, bump, center, seed]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 0.4 + seed * 2) * 0.035;
    ref.current.scale.set(radius * s, radius * (2 - s), radius * s);
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[radius * 0.2, radius * 0.25, 0.08, 10]} />
        <meshStandardMaterial color={center} roughness={0.7} />
      </mesh>
      <group ref={ref} scale={radius}>
        <mesh geometry={geo} material={mat} castShadow receiveShadow />
      </group>
    </group>
  );
}

/* ---------------- Lobophyllia / brain ---------------- */
export function Lobo({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const { geo, mat } = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    const rim = new THREE.Color("#ffd43a");
    const wall = new THREE.Color("#6a4a1a");
    const mid = new THREE.Color("#2a9fd8");
    const ctr = new THREE.Color("#0e3a8a");
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      // fleshy rim: dip in the middle
      const r = Math.sqrt(x * x + z * z);
      const dip = Math.exp(-r * r * 6) * 0.45;
      p.setY(i, y * 0.75 - dip * y);
      if (r > 0.82) c.copy(wall).lerp(rim, (1 - r) * 4);
      else if (r > 0.55) c.copy(rim).lerp(mid, (0.82 - r) * 2.5);
      else c.copy(mid).lerp(ctr, (0.55 - r) * 1.8);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    const m = patchMaterial(
      registerGlow(
        new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, emissive: "#ffffff", emissiveIntensity: 0.35 }),
        0.18
      ),
      { caustics: 0.5 }
    );
    // emissive should follow vertex colours -> use a low-level trick: emissive white * small intensity
    return { geo: g, mat: m };
  }, []);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} material={mat} position={[-0.13, 0, 0]} scale={[0.15, 0.13, 0.14]} castShadow />
      <mesh geometry={geo} material={mat} position={[0.13, 0, 0.01]} scale={[0.15, 0.14, 0.14]} rotation={[0, 1, 0]} castShadow />
    </group>
  );
}

/* ---------------- Torch coral ---------------- */
function Torch({ position }: { position: [number, number, number] }) {
  const heads = useMemo(() => {
    const r = mulberry32(5);
    return Array.from({ length: 4 }).map((_, i) => ({
      p: [(r() - 0.5) * 0.32, 0.12 + r() * 0.12, (r() - 0.5) * 0.25] as [number, number, number],
      rot: [(r() - 0.5) * 0.6, 0, (r() - 0.5) * 0.6] as [number, number, number],
      seed: i + 20,
    }));
  }, []);
  return (
    <group position={position}>
      {heads.map((h, i) => (
        <Anemone
          key={i}
          position={h.p}
          rotation={h.rot}
          radius={0.1}
          count={46}
          length={0.2}
          color="#3fe07a"
          tip="#e9ff6a"
          disc="#1f6a3a"
          seed={h.seed}
          droop={0.05}
        />
      ))}
    </group>
  );
}

const RADIOACTIVE: ZoaColors = { mouth: "#ff5a12", disc: "#ff7a1a", ring: "#d4ff2a", rim: "#9cff22" };
const SUNNY: ZoaColors = { mouth: "#3a1a08", disc: "#ff9a1a", ring: "#ffe23a", rim: "#d6ff3a" };
const PURPLE: ZoaColors = { mouth: "#ffe84a", disc: "#c33cff", ring: "#ff9ae6", rim: "#7aff7a" };
const DUNCAN: ZoaColors = { mouth: "#0d5a2a", disc: "#5aff6a", ring: "#2affa0", rim: "#d8ff5a" };
const ACAN: ZoaColors = { mouth: "#1a2a8a", disc: "#2a8aff", ring: "#3affd0", rim: "#ffe23a" };

export default function Corals() {
  const sh = (x: number, z: number) => sandHeight(x, z);
  return (
    <group>
      {/* Zoanthid colonies */}
      <ZoaColony position={[-1.95, sh(-1.95, 0.95) + 0.02, 0.95]} cols={RADIOACTIVE} count={30} radius={0.3} seed={1} />
      <ZoaColony position={[1.45, sh(1.45, 1.05) + 0.02, 1.05]} cols={SUNNY} count={20} radius={0.24} seed={2} />
      <ZoaColony position={[2.05, sh(2.05, 0.9) + 0.02, 0.92]} cols={SUNNY} count={26} radius={0.28} seed={3} />
      <ZoaColony position={[-1.05, 1.18, -0.02]} rotation={[0.35, 0, 0.1]} cols={PURPLE} count={18} radius={0.22} seed={4} />
      <ZoaColony position={[1.55, 1.02, -0.08]} rotation={[0.4, 0, -0.2]} cols={RADIOACTIVE} count={14} radius={0.18} seed={6} />

      {/* Duncan on stalks */}
      <ZoaColony
        position={[-1.38, 0.95, 0.2]}
        rotation={[0.3, 0, 0]}
        cols={DUNCAN}
        count={3}
        radius={0.1}
        size={0.085}
        len={0.22}
        stalk="#3a2a1a"
        seed={7}
      />
      {/* Acan / chalice-ish blob */}
      <ZoaColony
        position={[0.95, sh(0.95, 1.15) + 0.02, 1.15]}
        cols={ACAN}
        count={5}
        radius={0.12}
        size={0.07}
        len={0.05}
        seed={8}
      />

      {/* Mushrooms */}
      <Mushroom position={[-0.35, sh(-0.35, 0.95) + 0.02, 0.95]} radius={0.42} seed={1} />
      <Mushroom position={[1.62, 0.72, 0.28]} rotation={[0.5, 0, -0.35]} radius={0.24} base="#ffa070" bump="#ffd2a0" center="#d8682a" seed={2} />
      <Mushroom position={[2.05, 0.95, -0.55]} rotation={[0.4, 0, -0.6]} radius={0.27} base="#ff9a6a" bump="#ffd8b0" center="#c8582a" seed={3} />
      <Mushroom position={[2.6, 0.95, -0.7]} rotation={[0.2, 0, -0.9]} radius={0.3} base="#ffa77a" bump="#ffe0c0" center="#d0602a" seed={4} />
      <Mushroom position={[2.6, sh(2.6, 0.35) + 0.25, 0.35]} rotation={[0.2, 0, -0.5]} radius={0.22} base="#ffa77a" bump="#ffe0c0" center="#d0602a" seed={5} />
      <Mushroom position={[1.7, sh(1.7, 0.4) + 0.06, 0.55]} rotation={[0.5, 0, 0]} radius={0.2} base="#ff8a5a" bump="#ffc890" center="#c0401a" seed={6} />

      {/* Brain */}
      <Lobo position={[0.45, sh(0.45, 1.0) + 0.02, 1.0]} />

      {/* Torch cluster on the right back rock */}
      <Torch position={[2.25, 1.22, -1.0]} />
    </group>
  );
}
