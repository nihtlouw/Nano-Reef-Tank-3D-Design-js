import * as THREE from "three";
import { mulberry32, noise3 } from "./noise";

function coloredMesh(vertices: number[], colors: number[], triangles: number[]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.setIndex(triangles);
  g.computeVertexNormals();
  return g;
}

/** Append all the tapered tubes of a colony to one indexed draw, including their end caps. */
class Stems {
  private vertices: number[] = [];
  private colors: number[] = [];
  private triangles: number[] = [];

  add(
    curve: THREE.Curve<THREE.Vector3>,
    rings: number,
    sides: number,
    profile: (t: number, a: number) => number,
    pigment: (t: number, p: THREE.Vector3) => THREE.Color,
  ) {
    const offset = this.vertices.length / 3;
    const up = new THREE.Vector3(0, 1, 0),
      radial = new THREE.Vector3(),
      q = new THREE.Quaternion();
    for (let i = 0; i <= rings; i++) {
      const t = i / rings,
        center = curve.getPoint(t);
      q.setFromUnitVectors(up, curve.getTangent(t));
      for (let j = 0; j < sides; j++) {
        const a = (j * Math.PI * 2) / sides;
        radial
          .set(Math.cos(a), 0, Math.sin(a))
          .applyQuaternion(q)
          .multiplyScalar(profile(t, a))
          .add(center);
        this.vertices.push(radial.x, radial.y, radial.z);
        const c = pigment(t, radial);
        this.colors.push(c.r, c.g, c.b);
        if (i < rings) {
          const k = offset + i * sides + j,
            next = offset + i * sides + ((j + 1) % sides);
          this.triangles.push(k, k + sides, next, next, k + sides, next + sides);
        }
      }
    }
    const cap = offset + rings * sides;
    for (let j = 1; j < sides - 1; j++) this.triangles.push(cap, cap + j + 1, cap + j);
  }

  build() {
    return coloredMesh(this.vertices, this.colors, this.triangles);
  }
}

export type BranchForm = "branch" | "frag" | "finger";
export function branchingColony(
  seed: number,
  base: string,
  tip: string,
  form: BranchForm = "branch",
) {
  const random = mulberry32(seed),
    stems = new Stems();
  const root = new THREE.Color(base),
    end = new THREE.Color(tip),
    c = new THREE.Color();
  const frag = form === "frag",
    finger = form === "finger";

  function shoot(
    start: THREE.Vector3,
    direction: THREE.Vector3,
    len: number,
    radius: number,
    order: number,
  ) {
    const bend = new THREE.Vector3(random() - 0.5, 0.28, random() - 0.5).multiplyScalar(len * 0.5);
    const curve = new THREE.QuadraticBezierCurve3(
      start,
      start.clone().addScaledVector(direction, len / 2),
      start.clone().addScaledVector(direction, len).add(bend),
    );
    const phase = random() * Math.PI * 2;
    const rings = order === 2 ? 4 : 8;
    stems.add(
      curve,
      rings,
      order === 2 ? 6 : 9,
      (t, a) =>
        radius *
        (1 - 0.48 * t) *
        (t === 1 ? 0.29 : 1) *
        (1 + 0.12 * Math.sin(a * 3 + phase + t * rings * 1.6)),
      (t, p) =>
        c
          .copy(root)
          .lerp(end, Math.min(1, 0.08 + t * 0.59 + order * 0.13 + (t === 1 ? 0.22 : 0)))
          .multiplyScalar(0.83 + noise3(p.x * 48, p.y * 48, p.z * 48 + seed) * 0.42),
    );
    if (order === 2 || (frag && order === 1)) return;
    const forks = order === 0 ? (finger ? 4 : 6) : 3;
    for (let i = 0; i < forks; i++) {
      const t = 0.18 + ((i + random() * 0.55) / forks) * 0.73;
      const a = phase + i * 2.4;
      const dir = new THREE.Vector3(Math.cos(a), 0.7 + random() * 0.5, Math.sin(a))
        .addScaledVector(direction, 0.85)
        .normalize();
      shoot(
        curve.getPoint(t),
        dir,
        len * (0.23 + random() * 0.27) * (1.2 - t * 0.5),
        radius * 0.55,
        order + 1,
      );
    }
  }
  const leaders = frag ? 4 : finger ? 5 : 9 + Math.floor(random() * 5);
  for (let i = 0; i < leaders; i++) {
    const a = i * 2.4 + random() * 0.32;
    const spread = Math.sqrt(i / leaders);
    const dir = new THREE.Vector3(spread * Math.cos(a), 1.22, spread * Math.sin(a)).normalize();
    const start = new THREE.Vector3(
      Math.cos(a) * spread * 0.11,
      -0.05,
      Math.sin(a) * spread * 0.11,
    );
    shoot(
      start,
      dir,
      1.05 - spread * 0.42 + random() * 0.18,
      (finger ? 0.095 : 0.051) + random() * 0.032,
      0,
    );
  }
  return stems.build();
}

/** A continuous Montipora scroll: thin fluted shelves with a brighter growing margin. */
export function platingColony() {
  const vertices: number[] = [],
    colors: number[] = [],
    triangles: number[] = [];
  const core = new THREE.Color("#80223d"),
    red = new THREE.Color("#ee3f26"),
    rim = new THREE.Color("#ffae67");
  const c = new THREE.Color();
  const segments = 240,
    rings = 16;
  for (let i = 0; i <= segments; i++) {
    const u = i / segments,
      a = u * Math.PI * 5.4 + 1;
    for (let j = 0; j <= rings; j++) {
      const t = j / rings;
      const r =
        0.02 + t * (0.79 - u * 0.37) * (1 + 0.11 * Math.sin(5 * a) + 0.046 * Math.cos(9 * a));
      const x = Math.cos(a) * r,
        z = Math.sin(a) * r * 0.79;
      const flutes =
        0.11 * Math.sin(a * 4 + t * 1.7) + 0.035 * Math.cos(a * 11) + 0.013 * Math.sin(a * 27);
      const y = u * 0.48 + t ** 1.6 * (0.24 + flutes) + x * 0.12 - z * 0.15;
      vertices.push(x, y, z);
      const grain = noise3(x * 43, y * 43, z * 43);
      c.copy(core)
        .lerp(red, 0.12 + t * 0.72)
        .lerp(rim, Math.max(0, (t - 0.93) / 0.07) * 0.88)
        .multiplyScalar(0.9 + grain * 0.24);
      colors.push(c.r, c.g, c.b);
      const k = i * (rings + 1) + j,
        n = k + rings + 1;
      if (i < segments && j < rings) triangles.push(k, n, k + 1, k + 1, n, n + 1);
    }
  }
  return coloredMesh(vertices, colors, triangles);
}

/** Slender torch polyps sweep with the current, unlike the main tank's radial bubble tips. */
export function torchColony(seed: number, stalk: string, tip: string) {
  const random = mulberry32(seed);
  const stems = new Stems();
  const base = new THREE.Color(stalk),
    end = new THREE.Color(tip),
    c = new THREE.Color();
  for (let i = 0; i < 200; i++) {
    const a = random() * Math.PI * 2,
      r = Math.sqrt(random());
    const x = Math.cos(a) * r,
      z = Math.sin(a) * r,
      reach = 0.26 + random() * 0.3;
    const height = (0.36 + random() * 0.44) * (1 - r * 0.26);
    const root = new THREE.Vector3(x * 0.19, -0.08, z * 0.17);
    const curve = new THREE.CubicBezierCurve3(
      root,
      root.clone().add(new THREE.Vector3(x * 0.18 - 0.08, height * 0.65, z * 0.18)),
      root.clone().add(new THREE.Vector3(x * reach + 0.17, height * 1.1, z * reach)),
      root
        .clone()
        .add(new THREE.Vector3(x * reach + 0.29, height * 0.87 + random() * 0.1, z * reach + 0.04)),
    );
    const thickness = 0.009 + random() * 0.008,
      tint = 0.8 + random() * 0.4;
    stems.add(
      curve,
      10,
      6,
      (t) => thickness * (t === 1 ? 0.22 : t >= 0.9 ? 0.92 : 1 - 0.45 * t),
      (t) =>
        c
          .copy(base)
          .lerp(end, 0.035 * t + 0.94 * t ** 9)
          .multiplyScalar(tint),
    );
  }
  return stems.build();
}
