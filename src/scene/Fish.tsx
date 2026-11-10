import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  fishGeometry,
  pectoralGeometry,
  PECTORAL_POS,
  type FishVariant,
} from "./fishGeometry";
import { patchMaterial } from "./shaders";
import { nearestFood } from "./food";
import { reefSurfaceAt } from "./Rockscape";
import { mulberry32 } from "./noise";

export const SWIM_BOUNDS = {
  minX: -2.65,
  maxX: 2.65,
  minY: 0.6,
  maxY: 3.15,
  minZ: -1.45,
  maxZ: 1.5,
};

export type Behaviour =
  | { kind: "host"; home: THREE.Vector3; radius: [number, number, number] }
  | { kind: "bottom" }
  | { kind: "roam" }
  | { kind: "perch"; spots: THREE.Vector3[] };

function clampBounds(v: THREE.Vector3, minY = SWIM_BOUNDS.minY) {
  v.x = THREE.MathUtils.clamp(v.x, SWIM_BOUNDS.minX, SWIM_BOUNDS.maxX);
  v.y = THREE.MathUtils.clamp(v.y, minY, SWIM_BOUNDS.maxY);
  v.z = THREE.MathUtils.clamp(v.z, SWIM_BOUNDS.minZ, SWIM_BOUNDS.maxZ);
  return v;
}

/** Shared steering brain used by procedural and GLB fish */
function useSwimBrain(
  behaviour: Behaviour,
  speed: number,
  seed: number,
  start: THREE.Vector3,
) {
  const rnd = useMemo(() => mulberry32(seed * 991), [seed]);
  const state = useRef({
    pos: start.clone(),
    vel: new THREE.Vector3(0, 0, 0.1),
    target: start.clone(),
    next: 0,
    pause: 0,
    effort: 0,
  });

  const pickTarget = (t: number) => {
    const s = state.current;
    const r = rnd;
    if (behaviour.kind === "host") {
      const roam = r() < 0.12;
      if (roam) {
        s.target.set(
          THREE.MathUtils.lerp(SWIM_BOUNDS.minX, SWIM_BOUNDS.maxX, r()),
          THREE.MathUtils.lerp(1.4, 3.0, r()),
          THREE.MathUtils.lerp(0.2, 1.4, r()),
        );
        s.next = t + 3 + r() * 2;
      } else {
        const [rx, ry, rz] = behaviour.radius;
        s.target.set(
          behaviour.home.x + (r() - 0.5) * 2 * rx,
          behaviour.home.y + (r() - 0.3) * ry,
          behaviour.home.z + (r() * 0.9 + 0.1) * rz,
        );
        s.next = t + 1.2 + r() * 2.2;
      }
    } else if (behaviour.kind === "bottom") {
      s.target.set(
        THREE.MathUtils.lerp(-2.4, 2.4, r()),
        0.62 + r() * 0.25,
        THREE.MathUtils.lerp(0.35, 1.35, r()),
      );
      s.next = t + 2.5 + r() * 3;
      s.pause = r() < 0.5 ? 1 + r() * 2 : 0;
    } else if (behaviour.kind === "perch") {
      const spot = behaviour.spots[Math.floor(r() * behaviour.spots.length)];
      s.target.copy(spot);
      s.next = t + 4 + r() * 5;
    } else {
      s.target.set(
        THREE.MathUtils.lerp(SWIM_BOUNDS.minX, SWIM_BOUNDS.maxX, r()),
        THREE.MathUtils.lerp(1.0, 3.0, r()),
        THREE.MathUtils.lerp(-0.3, 1.4, r()),
      );
      s.next = t + 3 + r() * 4;
    }
    clampBounds(
      s.target,
      behaviour.kind === "bottom" ? 0.55 : SWIM_BOUNDS.minY,
    );
  };

  const step = (obj: THREE.Object3D, t: number, dt: number) => {
    const s = state.current;
    dt = Math.min(dt, 0.05);
    // food chasing
    const fb =
      behaviour.kind === "perch"
        ? null
        : nearestFood(s.pos, behaviour.kind === "bottom" ? 1.4 : 3.5);
    let sp = speed;
    if (fb) {
      s.target.copy(fb.pos);
      sp = speed * 2.2;
      if (fb.pos.distanceTo(s.pos) < 0.09) fb.alive = false;
      s.next = t + 0.5;
    } else if (t > s.next) {
      pickTarget(t);
    }
    const to = s.target.clone().sub(s.pos);
    const dist = to.length();
    let desired: THREE.Vector3;
    if (behaviour.kind === "perch" && dist < 0.05)
      desired = new THREE.Vector3();
    else
      desired = to
        .normalize()
        .multiplyScalar(sp * THREE.MathUtils.clamp(dist / 0.35, 0.25, 1));
    if (s.pause > 0 && dist < 0.15) {
      desired.multiplyScalar(0.05);
      s.pause -= dt;
    }
    s.vel.lerp(desired, 1 - Math.exp(-dt * (fb ? 3 : 1.6)));
    s.pos.addScaledVector(s.vel, dt);
    clampBounds(
      s.pos,
      behaviour.kind === "bottom" || behaviour.kind === "perch"
        ? 0.5
        : SWIM_BOUNDS.minY,
    );
    // Keep the whole fish above the substrate/rock silhouette, not just its centre.
    // For low swimmers, steer through the open foreground rather than through the reef.
    const floor = reefSurfaceAt(s.pos.x, s.pos.z) + 0.24;
    if (s.pos.y < floor && floor < SWIM_BOUNDS.maxY) {
      s.pos.y = Math.min(SWIM_BOUNDS.maxY, floor);
      s.vel.y = Math.max(0, s.vel.y);
    }
    obj.position.copy(s.pos);
    // bob
    obj.position.y += Math.sin(t * 1.7 + seed) * 0.012;

    const v = s.vel.length();
    s.effort = THREE.MathUtils.lerp(s.effort, v / speed, 1 - Math.exp(-dt * 3));
    if (v > 0.02) {
      const look = s.vel.clone().normalize();
      look.y = THREE.MathUtils.clamp(look.y, -0.5, 0.5);
      const m = new THREE.Matrix4().lookAt(
        new THREE.Vector3(),
        look.multiplyScalar(-1),
        new THREE.Vector3(0, 1, 0),
      );
      const q = new THREE.Quaternion().setFromRotationMatrix(m);
      obj.quaternion.slerp(q, 1 - Math.exp(-dt * 3.2));
    }
    return s.effort;
  };

  return step;
}

/* ---------------- Procedural clownfish / goby ---------------- */
interface ProcFishProps {
  variant: FishVariant;
  size: number;
  behaviour: Behaviour;
  speed?: number;
  seed?: number;
  start: [number, number, number];
  stretch?: [number, number, number];
}

export function ProceduralFish({
  variant,
  size,
  behaviour,
  speed = 0.45,
  seed = 1,
  start,
  stretch = [1, 1, 1],
}: ProcFishProps) {
  const group = useRef<THREE.Group>(null);
  const finL = useRef<THREE.Mesh>(null);
  const finR = useRef<THREE.Mesh>(null);
  const startV = useMemo(() => new THREE.Vector3(...start), [start]);
  const step = useSwimBrain(behaviour, speed, seed, startV);
  const swim = useMemo(
    () => ({ uPhase: { value: 0 }, uAmp: { value: 0.05 } }),
    [],
  );
  const geo = useMemo(() => fishGeometry(variant), [variant]);
  const pecGeo = useMemo(() => pectoralGeometry(variant), [variant]);
  const mat = useMemo(
    () =>
      patchMaterial(
        new THREE.MeshPhysicalMaterial({
          vertexColors: true,
          roughness: 0.35,
          clearcoat: 0.6,
          clearcoatRoughness: 0.3,
          side: THREE.DoubleSide,
          emissive: "#ff7a3a",
          emissiveIntensity: 0.06,
        }),
        { swim, caustics: 0.35 },
      ),
    [swim],
  );
  const pecMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        roughness: 0.5,
      }),
    [],
  );

  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    const effort = step(group.current, t, dt);
    // clownfish have a characteristic "waggle": high-frequency tail beats
    const freq = 7 + effort * 9;
    swim.uPhase.value += Math.min(dt, 0.05) * freq;
    swim.uAmp.value = 0.035 + Math.min(effort, 1.6) * 0.05;
    const flap = Math.sin(t * 14 + seed) * 0.6;
    if (finL.current) finL.current.rotation.y = 0.5 + flap;
    if (finR.current) finR.current.rotation.y = -0.5 - flap;
  });

  return (
    <group ref={group} position={start}>
      <group scale={[size * stretch[0], size * stretch[1], size * stretch[2]]}>
        <mesh geometry={geo} material={mat} castShadow />
        <mesh
          ref={finL}
          geometry={pecGeo}
          material={pecMat}
          position={PECTORAL_POS(1)}
        />
        <mesh
          ref={finR}
          geometry={pecGeo}
          material={pecMat}
          position={PECTORAL_POS(-1)}
        />
      </group>
    </group>
  );
}

/* ---------------- GLB fish (Quaternius models via Nihdao/three-aquarium-challenge) ---------------- */
interface GltfFishProps {
  url: string;
  length: number;
  behaviour: Behaviour;
  speed?: number;
  seed?: number;
  start: [number, number, number];
  tint?: string;
}

export function GltfFish({
  url,
  length,
  behaviour,
  speed = 0.4,
  seed = 1,
  start,
}: GltfFishProps) {
  const gltf = useGLTF(url);
  const group = useRef<THREE.Group>(null);
  const model = useMemo(() => {
    const m = cloneSkinned(gltf.scene) as THREE.Group;
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.frustumCulled = false;
        // SkeletonUtils.clone shares materials: clone them before changing render flags.
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((m) => m.clone())
          : mesh.material.clone();
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        mats.forEach((mt) => {
          mt.side = THREE.DoubleSide;
          const sm = mt as THREE.MeshStandardMaterial;
          if (sm.emissive) {
            sm.emissive = sm.color.clone();
            sm.emissiveIntensity = 0.12;
          }
        });
      }
    });
    return m;
  }, [gltf.scene]);
  useEffect(
    () => () => {
      model.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh)
          (Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material]
          ).forEach((material) => material.dispose());
        const skinned = object as THREE.SkinnedMesh;
        if (skinned.isSkinnedMesh) skinned.skeleton.dispose();
      });
    },
    [model],
  );
  const scale = useMemo(() => {
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model, true);
    const size = box.getSize(new THREE.Vector3());
    const mx = Math.max(size.x, size.y, size.z);
    return length / (isFinite(mx) && mx > 0.01 ? mx : 4);
  }, [model, length]);
  const { actions, mixer } = useAnimations(gltf.animations, model);
  const action = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    const a =
      actions["Fish_Armature|Swimming_Normal"] || Object.values(actions)[0];
    if (a) {
      a.reset().play();
      a.time = mulberry32(seed * 97)() * a.getClip().duration;
      action.current = a;
    }
    return () => {
      a?.stop();
    };
  }, [actions]);

  const startV = useMemo(() => new THREE.Vector3(...start), [start]);
  const step = useSwimBrain(behaviour, speed, seed, startV);
  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const effort = step(group.current, clock.elapsedTime, dt);
    if (action.current) action.current.timeScale = 0.4 + effort * 1.1;
    void mixer;
  });

  return (
    <group ref={group} position={start}>
      <primitive object={model} scale={scale} />
    </group>
  );
}
