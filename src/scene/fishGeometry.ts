import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { noise3 } from "./noise";

export type FishVariant = "ocellaris" | "snowflake" | "black" | "goby";

// Body runs along +Z (head at +z). Unit length ~1.
const Z0 = -0.3; // peduncle
const ZL = 0.8; // body length
const H = 0.42;
const Wd = 0.21;

function f(t: number) {
  if (t < 0.03) return 0.3 * Math.sqrt(t / 0.03);
  if (t < 0.6) return 0.3 + 0.7 * Math.sin(((t - 0.03) / 0.57) * (Math.PI / 2));
  const k = (t - 0.6) / 0.4;
  return Math.sqrt(Math.max(0, 1 - k * k * k * 0.98)) * (1 - k * 0.15);
}
const zOf = (t: number) => Z0 + t * ZL;
const yTop = (t: number) => (H / 2) * f(t);
const yBot = (t: number) => -(H / 2) * f(t) * 0.88;

const C = {
  orange: new THREE.Color("#ff5e0e"),
  deep: new THREE.Color("#e8430a"),
  white: new THREE.Color("#fbfbff"),
  black: new THREE.Color("#0a0606"),
  dark: new THREE.Color("#1d0d0b"),
  yellow: new THREE.Color("#ffd51c"),
  blue: new THREE.Color("#3aa0ff"),
};

function band(t: number, c: number, w: number) {
  return Math.abs(t - c) - w / 2;
}

function bodyColor(v: FishVariant, t: number, th: number, out: THREE.Color) {
  const top = Math.max(0, Math.sin(th));
  if (v === "goby") {
    out.copy(C.yellow);
    if (t > 0.86) out.lerp(C.orange, 0.25);
    return out;
  }
  const outline = 0.022;
  let bands: [number, number][];
  if (v === "snowflake") {
    const n = noise3(t * 9, Math.cos(th) * 2, Math.sin(th) * 2) * 0.09;
    bands = [
      [0.75 + n, 0.16 + n],
      [0.46 + 0.05 * top + n, 0.28 + n * 1.5],
      [0.08, 0.1],
    ];
  } else {
    bands = [
      [0.735, 0.075],
      [0.45 + 0.05 * top, 0.075],
      [0.075, 0.045],
    ];
  }
  let base = C.orange;
  if (v === "black") {
    const k = THREE.MathUtils.smoothstep(t, 0.76, 0.86);
    out.copy(C.dark).lerp(C.orange, k);
    base = out.clone();
  } else {
    out.copy(base).lerp(C.deep, Math.max(0, -Math.sin(th)) * 0.3);
  }
  for (const [c, w] of bands) {
    const d = band(t, c, w);
    if (d < 0) {
      out.copy(C.white);
      return out;
    }
    if (d < outline) {
      out.copy(C.black);
      return out;
    }
  }
  return out;
}

function finColor(v: FishVariant, s: number, out: THREE.Color) {
  if (v === "goby") return out.copy(C.yellow).lerp(C.blue, s > 0.88 ? 0.6 : 0);
  if (v === "black")
    return out
      .copy(s > 0.75 ? C.black : C.dark)
      .lerp(C.orange, s < 0.25 ? 0.25 : 0);
  if (s > 0.8) return out.copy(C.black);
  if (s > 0.74 && v === "snowflake") return out.copy(C.white);
  return out.copy(C.orange);
}

function withColor(
  g: THREE.BufferGeometry,
  fn: (p: THREE.Vector3, i: number) => THREE.Color,
) {
  const p = g.attributes.position;
  const col = new Float32Array(p.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const c = fn(v, i);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  if (g.attributes.uv) g.deleteAttribute("uv");
  return g;
}

function bodyGeometry(v: FishVariant) {
  const NT = 48;
  const NR = 24;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const c = new THREE.Color();
  for (let i = 0; i <= NT; i++) {
    const t = i / NT;
    const r = f(t);
    for (let j = 0; j <= NR; j++) {
      const th = (j / NR) * Math.PI * 2;
      const s = Math.sin(th);
      const x = (Wd / 2) * r * Math.cos(th) * (0.85 + 0.15 * Math.abs(s));
      const y = (H / 2) * r * s * (s < 0 ? 0.88 : 1);
      pos.push(x, y, zOf(t));
      bodyColor(v, t, th, c);
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < NT; i++) {
    for (let j = 0; j < NR; j++) {
      const a = i * (NR + 1) + j;
      const b = a + NR + 1;
      idx.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  // Close the snout with the same colour as the head; no open tube end.
  const cap = pos.length / 3;
  pos.push(0, 0, zOf(1));
  bodyColor(v, 1, 0, c);
  col.push(c.r, c.g, c.b);
  for (let j = 0; j < NR; j++)
    idx.push(cap, NT * (NR + 1) + j, NT * (NR + 1) + j + 1);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function finGrid(
  base: THREE.Vector3[],
  outer: THREE.Vector3[],
  rows: number,
  v: FishVariant,
) {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const c = new THREE.Color();
  const n = base.length;
  for (let i = 0; i < n; i++) {
    for (let k = 0; k <= rows; k++) {
      const s = k / rows;
      const p = base[i].clone().lerp(outer[i], s);
      pos.push(p.x, p.y, p.z);
      finColor(v, s, c);
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < n - 1; i++) {
    for (let k = 0; k < rows; k++) {
      const a = i * (rows + 1) + k;
      const b = a + rows + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function dorsal(v: FishVariant) {
  const base: THREE.Vector3[] = [];
  const outer: THREE.Vector3[] = [];
  const N = 30;
  for (let i = 0; i <= N; i++) {
    const t = 0.27 + (i / N) * 0.5;
    let h: number;
    if (t < 0.53)
      h =
        0.15 *
        Math.pow(Math.max(0, Math.sin((Math.PI * (t - 0.27)) / 0.26)), 0.6);
    else
      h =
        0.085 *
        Math.pow(Math.max(0, Math.sin((Math.PI * (t - 0.53)) / 0.24)), 0.5) *
        (0.82 + 0.18 * Math.abs(Math.sin(t * 90)));
    if (v === "goby") h *= 1.3;
    const b = new THREE.Vector3(0, yTop(t) - 0.012, zOf(t));
    base.push(b);
    outer.push(b.clone().add(new THREE.Vector3(0, h, -h * 0.4)));
  }
  return finGrid(base, outer, 6, v);
}

function anal(v: FishVariant) {
  const base: THREE.Vector3[] = [];
  const outer: THREE.Vector3[] = [];
  const N = 16;
  for (let i = 0; i <= N; i++) {
    const t = 0.24 + (i / N) * 0.22;
    const h =
      0.12 *
      Math.pow(Math.max(0, Math.sin((Math.PI * (t - 0.24)) / 0.22)), 0.6);
    const b = new THREE.Vector3(0, yBot(t) + 0.012, zOf(t));
    base.push(b);
    outer.push(b.clone().add(new THREE.Vector3(0, -h, -h * 0.45)));
  }
  return finGrid(base, outer, 5, v);
}

function caudal(v: FishVariant) {
  const base: THREE.Vector3[] = [];
  const outer: THREE.Vector3[] = [];
  const N = 20;
  const z0 = zOf(0.02);
  const ph = yTop(0.02);
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const a = THREE.MathUtils.lerp(-1.05, 1.05, u);
    base.push(
      new THREE.Vector3(
        0,
        THREE.MathUtils.lerp(-ph * 0.9, ph * 0.9, u),
        z0 + 0.02,
      ),
    );
    const rr = v === "goby" ? 0.22 : 0.19;
    outer.push(
      new THREE.Vector3(
        0,
        Math.sin(a) * rr,
        z0 - Math.cos(a) * rr * 0.95 - 0.02,
      ),
    );
  }
  return finGrid(base, outer, 7, v);
}

function pelvic(v: FishVariant, side: number) {
  const base: THREE.Vector3[] = [];
  const outer: THREE.Vector3[] = [];
  const N = 6;
  for (let i = 0; i <= N; i++) {
    const t = 0.58 + (i / N) * 0.07;
    const h = 0.08 * Math.sin(Math.PI * (i / N) * 0.9 + 0.2);
    const b = new THREE.Vector3(side * 0.02, yBot(t) + 0.015, zOf(t));
    base.push(b);
    outer.push(b.clone().add(new THREE.Vector3(side * h * 0.35, -h, -h * 0.7)));
  }
  return finGrid(base, outer, 4, v);
}

export function pectoralGeometry(v: FishVariant) {
  // fan centred at origin, extends toward -z
  const base: THREE.Vector3[] = [];
  const outer: THREE.Vector3[] = [];
  const N = 10;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const a = THREE.MathUtils.lerp(-0.9, 0.9, u);
    base.push(new THREE.Vector3(0, THREE.MathUtils.lerp(-0.025, 0.025, u), 0));
    outer.push(new THREE.Vector3(0, Math.sin(a) * 0.08, -Math.cos(a) * 0.11));
  }
  return finGrid(base, outer, 4, v);
}

function eye(side: number) {
  const t = 0.87;
  const r = f(t);
  const g = new THREE.SphereGeometry(0.034, 14, 10);
  g.translate(side * (Wd / 2) * r * 0.78, H * 0.08, zOf(t));
  return withColor(g, (p) => {
    // dark pupil facing outward, golden ring
    const outward = (p.x - side * (Wd / 2) * r * 0.78) * side;
    return outward > 0.022
      ? C.black
      : outward > 0.0
        ? new THREE.Color("#d88a2a")
        : C.black;
  });
}

const cache = new Map<FishVariant, THREE.BufferGeometry>();
export function fishGeometry(v: FishVariant) {
  if (cache.has(v)) return cache.get(v)!;
  const parts = [
    bodyGeometry(v),
    dorsal(v),
    anal(v),
    caudal(v),
    pelvic(v, 1),
    pelvic(v, -1),
    eye(1),
    eye(-1),
  ];
  const g = mergeGeometries(parts)!;
  parts.forEach((part) => part.dispose());
  g.computeBoundingSphere();
  cache.set(v, g);
  return g;
}

export const PECTORAL_POS = (side: number) =>
  new THREE.Vector3(side * (Wd / 2) * f(0.7) * 0.92, -H * 0.06, zOf(0.7));
