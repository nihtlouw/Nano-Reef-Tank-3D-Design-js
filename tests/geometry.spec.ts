import { test, expect } from "@playwright/test";
import * as THREE from "three";
import { TANK } from "../src/store";
import { benchCenterX, PANORAMA, fitDisplay } from "../src/scene/tankLayout";
import {
  branchingColony,
  platingColony,
  torchColony,
} from "../src/scene/panoramaCorals";
import {
  bucketGeometry,
  sandSkirtGeometry,
  starPolypGeometry,
} from "../src/scene/geometry";
import {
  fishGeometry,
  pectoralGeometry,
  type FishVariant,
} from "../src/scene/fishGeometry";
import {
  makeRockGeometry,
  ROCKS,
  reefSurfaceAt,
  sandHeight,
} from "../src/scene/Rockscape";

function finiteGeometry(g: THREE.BufferGeometry) {
  for (const name of ["position", "normal"]) {
    const attribute = g.getAttribute(name);
    expect(attribute, `${name} exists`).toBeTruthy();
    expect(
      Array.from(attribute.array).every(Number.isFinite),
      `${name} contains no NaN/Infinity`,
    ).toBe(true);
  }
  g.computeBoundingBox();
  expect(g.boundingBox!.isEmpty()).toBe(false);
}
function hits(
  g: THREE.BufferGeometry,
  origin: THREE.Vector3,
  direction: THREE.Vector3,
) {
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial());
  m.updateMatrixWorld();
  const ray = new THREE.Raycaster(origin, direction);
  const result = ray.intersectObject(m, false);
  m.material.dispose();
  return result;
}

test("all fish variants have finite fins, outward body normals and a closed snout", () => {
  for (const variant of [
    "ocellaris",
    "snowflake",
    "black",
    "goby",
    "tang",
  ] as FishVariant[]) {
    const g = fishGeometry(variant);
    finiteGeometry(g);
    const fin = pectoralGeometry(variant);
    finiteGeometry(fin);
    fin.dispose();
    // A ray approaching from the right sees the outside, not the far inner wall.
    const right = hits(
      g,
      new THREE.Vector3(1, 0.012, 0.18),
      new THREE.Vector3(-1, 0, 0),
    );
    expect(right.length).toBeGreaterThan(0);
    expect(right[0].point.x).toBeGreaterThan(0);
    const nose = hits(
      g,
      new THREE.Vector3(0.005, 0.002, 1),
      new THREE.Vector3(0, 0, -1),
    );
    expect(nose.length).toBeGreaterThan(0);
    expect(nose[0].point.z).toBeCloseTo(0.5, 3);
  }
});

test("bucket is open above but has a real floor, underside and correct wall thickness", () => {
  const g = bucketGeometry();
  finiteGeometry(g);
  const down = hits(g, new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, -1, 0));
  expect(down.length).toBeGreaterThan(0);
  expect(down[0].point.y).toBeCloseTo(0.065, 3);
  const up = hits(g, new THREE.Vector3(0.1, -1, 0), new THREE.Vector3(0, 1, 0));
  expect(up.length).toBeGreaterThan(0);
  expect(up[0].point.y).toBeCloseTo(0, 3);
  const outside = hits(
    g,
    new THREE.Vector3(1, 0.5, 0),
    new THREE.Vector3(-1, 0, 0),
  );
  expect(outside[0].point.x).toBeGreaterThan(0.45);
  g.dispose();
});

test("sand has all four side faces with outward winding and a continuous upper edge", () => {
  const g = sandSkirtGeometry(5.92, 3.52, sandHeight);
  finiteGeometry(g);
  for (const [x, z] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const side = hits(
      g,
      new THREE.Vector3(x * 5, 0.1, z * 5),
      new THREE.Vector3(-x, 0, -z),
    );
    expect(side.length).toBeGreaterThan(0);
    expect(
      side[0].face!.normal.dot(new THREE.Vector3(x, 0, z)),
    ).toBeGreaterThan(0.99);
  }
  const p = g.getAttribute("position");
  for (let i = 1; i < p.count; i += 2)
    expect(p.getY(i)).toBeCloseTo(sandHeight(p.getX(i), p.getZ(i)), 5);
  g.dispose();
});

test("rock silhouette stays the same between dry and mature stages; attachments use the actual reef", () => {
  for (const def of ROCKS) {
    const dry = makeRockGeometry(def, false),
      mature = makeRockGeometry(def, true);
    finiteGeometry(dry);
    finiteGeometry(mature);
    expect(dry.getAttribute("position").array).toEqual(
      mature.getAttribute("position").array,
    );
    expect(dry.getAttribute("color").array).not.toEqual(
      mature.getAttribute("color").array,
    );
    dry.dispose();
    mature.dispose();
  }
  for (const x of [-2.5, -1, 0, 1, 2.5])
    for (const z of [-1, 0, 1]) {
      const h = reefSurfaceAt(x, z);
      expect(Number.isFinite(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(sandHeight(x, z) - 0.03);
      expect(h).toBeLessThan(3.35);
    }
  expect(reefSurfaceAt(-0.55, -0.6)).toBeGreaterThan(2);
});

test("green star polyps have eight independent fingers rather than a solid cone", () => {
  const g = starPolypGeometry(0.07);
  finiteGeometry(g);
  expect(g.getAttribute("position").count).toBe(8 * 4 * 4);
  expect(g.boundingBox!.max.y).toBeGreaterThan(0.07);
  expect(g.boundingBox!.min.y).toBeGreaterThan(0.06);
  g.dispose();
});

test("both tanks sit apart on the same bench and fit the overview at wide and portrait aspects", () => {
  const left = -TANK.w / 2,
    right = PANORAMA.x + PANORAMA.w / 2;
  expect(PANORAMA.x - PANORAMA.w / 2).toBeGreaterThan(TANK.w / 2);
  expect(left).toBeGreaterThan(benchCenterX - 10);
  expect(right).toBeLessThan(benchCenterX + 10);
  for (const aspect of [2.75, 1.68, 0.68]) {
    for (const view of ["front", "angle", "top"] as const) {
      const { p, t } = fitDisplay("both", view, aspect, 38);
      const camera = new THREE.PerspectiveCamera(38, aspect, 0.05, 100);
      camera.position.copy(p);
      camera.lookAt(t);
      camera.updateMatrixWorld();
      for (const x of [left, right])
        for (const y of [-0.08, 4.48])
          for (const z of [-2, 1.85]) {
            const ndc = new THREE.Vector3(x, y, z).project(camera);
            expect(
              Math.max(Math.abs(ndc.x), Math.abs(ndc.y), Math.abs(ndc.z)),
            ).toBeLessThan(1);
          }
    }
  }
  expect(fitDisplay("panorama", "front", 1.68, 38).t.x).toBeCloseTo(PANORAMA.x);
});

test("panorama branches and plating coral have finite, volumetric geometry", () => {
  for (const geometry of [
    branchingColony(27, "#236f29", "#b4ff39"),
    platingColony(),
    torchColony(45, "#553981", "#c1a3ff"),
  ]) {
    finiteGeometry(geometry);
    const extent = geometry.boundingBox!.getSize(new THREE.Vector3());
    expect(Math.min(extent.x, extent.y, extent.z)).toBeGreaterThan(0.3);
    expect(geometry.getAttribute("color").count).toBe(
      geometry.getAttribute("position").count,
    );
    geometry.dispose();
  }
});
