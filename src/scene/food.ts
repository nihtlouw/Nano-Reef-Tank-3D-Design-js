import * as THREE from "three";

export interface FoodBit {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  alive: boolean;
  age: number;
}

export const FOOD_MAX = 90;
export const food: FoodBit[] = Array.from({ length: FOOD_MAX }, () => ({
  pos: new THREE.Vector3(0, -10, 0),
  vel: new THREE.Vector3(),
  alive: false,
  age: 0,
}));

export function dropFood(x: number, z: number, water: number) {
  let n = 0;
  for (const f of food) {
    if (!f.alive && n < 45) {
      f.alive = true;
      f.age = 0;
      f.pos.set(x + (Math.random() - 0.5) * 0.7, water - 0.02, z + (Math.random() - 0.5) * 0.5);
      f.vel.set((Math.random() - 0.5) * 0.05, -0.05 - Math.random() * 0.12, (Math.random() - 0.5) * 0.05);
      n++;
    }
  }
}

export function nearestFood(p: THREE.Vector3, maxDist = 3) {
  let best: FoodBit | null = null;
  let bd = maxDist * maxDist;
  for (const f of food) {
    if (!f.alive) continue;
    const d = f.pos.distanceToSquared(p);
    if (d < bd) {
      bd = d;
      best = f;
    }
  }
  return best;
}
