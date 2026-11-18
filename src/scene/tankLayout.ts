import * as THREE from "three";
import { TANK, type CamView, type TankFocus } from "../store";

// Scene units, not construction dimensions. Both tanks sit on the same tabletop at y = -0.08.
const panoramaWidth = 8.4;
export const PANORAMA = {
  x: TANK.w / 2 + 1 + panoramaWidth / 2,
  w: panoramaWidth,
  h: 2.75,
  d: 2.85,
  water: 2.54,
  lampTop: 4.12,
};
export const benchCenterX = (-TANK.w / 2 + PANORAMA.x + PANORAMA.w / 2) / 2;

/** Fit all eight corners, including the nearest pane and lamp arms, to the actual canvas. */
export function fitDisplay(
  focus: Exclude<TankFocus, "main">,
  view: CamView,
  aspect: number,
  fov: number,
) {
  const both = focus === "both";
  if (view === "inside") {
    return {
      p: new THREE.Vector3(PANORAMA.x + 2.6, 1.25, 1.15),
      t: new THREE.Vector3(PANORAMA.x - 0.8, 1.3, -0.3),
    };
  }
  const left = both ? -TANK.w / 2 : PANORAMA.x - PANORAMA.w / 2;
  const right = PANORAMA.x + PANORAMA.w / 2;
  const depth = both ? TANK.d : PANORAMA.d;
  const top = both ? Math.max(4.48, PANORAMA.lampTop) : PANORAMA.lampTop;
  const t = new THREE.Vector3((left + right) / 2, (top - 0.35) / 2, 0);
  const back = (
    view === "angle"
      ? new THREE.Vector3(0.52, 0.3, 1)
      : view === "top"
        ? new THREE.Vector3(0, 1, 0.16)
        : new THREE.Vector3(0, 0.075, 1)
  ).normalize();
  const horizontal = new THREE.Vector3(0, 1, 0).cross(back).normalize();
  const vertical = back.clone().cross(horizontal);
  const tanY = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  let distance = 0;
  for (const x of [left - 0.1, right + 0.1])
    for (const y of [-0.35, top])
      for (const z of [-depth / 2 - 0.65, depth / 2 + 0.08]) {
        const q = new THREE.Vector3(x, y, z).sub(t);
        distance = Math.max(
          distance,
          q.dot(back) +
            Math.max(
              Math.abs(q.dot(horizontal)) / (tanY * aspect * 0.94),
              Math.abs(q.dot(vertical)) / (tanY * 0.87),
            ),
        );
      }
  return { t, p: t.clone().addScaledVector(back, distance) };
}
