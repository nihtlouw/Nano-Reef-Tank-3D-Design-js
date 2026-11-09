import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TANK, useReef } from "../store";
import { softDotTexture } from "./textures";
import { food, FOOD_MAX, dropFood } from "./food";
import { sandHeight } from "./Rockscape";

const W = TANK.w - 0.2;
const D = TANK.d - 0.2;

function MarineSnow() {
  const count = 450;
  const ref = useRef<THREE.Points>(null);
  const { geo, seeds } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * W;
      pos[i * 3 + 1] = 0.4 + Math.random() * (TANK.water - 0.5);
      pos[i * 3 + 2] = (Math.random() - 0.5) * D;
      seeds[i] = Math.random() * 100;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geo: g, seeds };
  }, []);
  useFrame(({ clock }, dt) => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    const t = clock.elapsedTime;
    const flow = useReef.getState().flow;
    dt = Math.min(dt, 0.05);
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      let x = p.getX(i) + (Math.sin(t * 0.3 + s) * 0.03 + 0.04 * flow) * dt;
      let y = p.getY(i) + Math.sin(t * 0.5 + s * 2) * 0.02 * dt - 0.008 * dt;
      let z = p.getZ(i) + Math.cos(t * 0.4 + s) * 0.03 * dt;
      if (x > W / 2) x = -W / 2;
      if (y < 0.4) y = TANK.water - 0.1;
      if (z > D / 2) z = -D / 2;
      if (z < -D / 2) z = D / 2;
      p.setXYZ(i, x, y, z);
    }
    p.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        map={softDotTexture()}
        size={0.03}
        color="#cfe0ff"
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function Food() {
  const nonce = useReef((s) => s.feedNonce);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(FOOD_MAX * 3).fill(-50), 3));
    return g;
  }, []);
  useEffect(() => {
    if (nonce > 0) dropFood(0.4 + (Math.random() - 0.5) * 1.2, 0.4, TANK.water);
  }, [nonce]);
  useFrame(({ clock }, dt) => {
    dt = Math.min(dt, 0.05);
    const p = geo.attributes.position as THREE.BufferAttribute;
    const t = clock.elapsedTime;
    food.forEach((f, i) => {
      if (f.alive) {
        f.age += dt;
        f.pos.addScaledVector(f.vel, dt);
        f.pos.x += Math.sin(t * 2 + i) * 0.02 * dt;
        const floor = sandHeight(f.pos.x, f.pos.z) + 0.02;
        if (f.pos.y < floor) {
          f.pos.y = floor;
          f.vel.set(0, 0, 0);
        }
        if (f.age > 40) f.alive = false;
        p.setXYZ(i, f.pos.x, f.pos.y, f.pos.z);
      } else p.setXYZ(i, 0, -50, 0);
    });
    p.needsUpdate = true;
  });
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial map={softDotTexture()} size={0.07} color="#ffcf8a" transparent depthWrite={false} sizeAttenuation />
    </points>
  );
}

export default function Particles() {
  return (
    <group>
      <MarineSnow />
      <Food />
    </group>
  );
}
