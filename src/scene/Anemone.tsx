import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mulberry32 } from "./noise";
import { patchMaterial, registerGlow } from "./shaders";

interface Props {
  position: [number, number, number];
  rotation?: [number, number, number];
  radius?: number;
  count?: number;
  length?: number;
  color?: string;
  tip?: string;
  disc?: string;
  seed?: number;
  droop?: number;
}

const BASE_LEN = 0.5;

export default function Anemone({
  position,
  rotation = [0, 0, 0],
  radius = 0.45,
  count = 220,
  length = 0.6,
  color = "#ffb27a",
  tip = "#ff8a5c",
  disc = "#4fa6c9",
  seed = 1,
  droop = 0.12,
}: Props) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const discRef = useRef<THREE.Mesh>(null);

  const { geo, mat } = useMemo(() => {
    const cyl = new THREE.CylinderGeometry(0.014, 0.024, BASE_LEN, 7, 14, true);
    cyl.translate(0, BASE_LEN / 2, 0);
    const bulb = new THREE.SphereGeometry(0.02, 8, 6);
    bulb.scale(1, 1.3, 1);
    bulb.translate(0, BASE_LEN * 0.9, 0);
    const tipS = new THREE.SphereGeometry(0.013, 7, 5);
    tipS.translate(0, BASE_LEN, 0);
    // colour: gradient base -> tip
    const parts = [cyl, bulb, tipS].map((g) => {
      const p = g.attributes.position;
      const col = new Float32Array(p.count * 3);
      const a = new THREE.Color(color);
      const b = new THREE.Color(tip);
      const c = new THREE.Color();
      for (let i = 0; i < p.count; i++) {
        const h = THREE.MathUtils.clamp(p.getY(i) / BASE_LEN, 0, 1);
        c.copy(a).lerp(b, Math.pow(h, 1.5));
        if (h < 0.15) c.lerp(new THREE.Color(disc), (0.15 - h) * 4);
        col.set([c.r, c.g, c.b], i * 3);
      }
      g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      g.deleteAttribute("uv");
      return g;
    });
    const merged = mergeGeometries(parts)!;
    const m = patchMaterial(
      registerGlow(
        new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.5,
          emissive: new THREE.Color(color).multiplyScalar(0.7),
          emissiveIntensity: 1,
        }),
        0.32
      ),
      { caustics: 0.6, tentacle: { len: BASE_LEN, droop, sway: 0.07, speed: 1.1 } }
    );
    return { geo: merged, mat: m };
  }, [color, tip, disc, droop]);

  useLayoutEffect(() => {
    const r = mulberry32(seed * 101);
    const m = new THREE.Matrix4();
    const qY = new THREE.Quaternion();
    const qZ = new THREE.Quaternion();
    const Y = new THREE.Vector3(0, 1, 0);
    const Z = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i < count; i++) {
      const rr = Math.sqrt(r()) * radius * 0.92;
      const a = r() * Math.PI * 2;
      const k = rr / radius;
      const tilt = THREE.MathUtils.lerp(0.1, 1.35, Math.pow(k, 0.9)) + (r() - 0.5) * 0.3;
      qZ.setFromAxisAngle(Z, -tilt);
      qY.setFromAxisAngle(Y, -a);
      const q = qY.multiply(qZ);
      const len = (length / BASE_LEN) * (0.65 + r() * 0.5) * (1 - k * 0.2);
      const pos = new THREE.Vector3(Math.cos(a) * rr, 0.06 - k * k * 0.05, Math.sin(a) * rr);
      m.compose(pos, q, new THREE.Vector3(1.1, len, 1.1));
      ref.current!.setMatrixAt(i, m);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [count, radius, length, seed]);

  useFrame(({ clock }) => {
    if (discRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 0.5 + seed) * 0.03;
      discRef.current.scale.set(radius * s, 0.12, radius * s);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* column / foot */}
      <mesh position={[0, -0.18, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.45, radius * 0.38, 0.4, 20, 1]} />
        <meshStandardMaterial color="#e8c9a8" roughness={0.6} emissive="#5a3a2a" emissiveIntensity={0.3} />
      </mesh>
      {/* oral disc */}
      <mesh ref={discRef} scale={[radius, 0.12, radius]}>
        <sphereGeometry args={[1, 32, 12]} />
        <meshStandardMaterial color={disc} roughness={0.5} emissive={disc} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.12, 20]} />
        <meshStandardMaterial color="#f7d9b8" emissive="#ffb888" emissiveIntensity={0.4} />
      </mesh>
      <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} castShadow />
    </group>
  );
}
