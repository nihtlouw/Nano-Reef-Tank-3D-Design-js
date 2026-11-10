import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TANK } from "../store";
import { backdropTexture, rayTexture } from "./textures";
import BuildMotion from "./BuildMotion";
import { LightHardware, Filter, Pump, Heater } from "./Hardware";
import { globalUniforms } from "./shaders";

const { w: W, h: H, d: D, water: WATER } = TANK;
const T = 0.035; // glass thickness

export function Glass() {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#d8f0ff",
        transparent: true,
        opacity: 0.09,
        roughness: 0.03,
        metalness: 0,
        envMapIntensity: 1.6,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [],
  );
  const edgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#5fc7b4",
        transparent: true,
        opacity: 0.55,
        roughness: 0.1,
      }),
    [],
  );
  const black = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#07070a",
        roughness: 0.45,
        metalness: 0.2,
      }),
    [],
  );

  const y = H / 2 - 0.05;
  return (
    <group>
      {/* panes */}
      <mesh position={[0, y, D / 2]} material={mat} renderOrder={10}>
        <boxGeometry args={[W, H, T]} />
      </mesh>
      <mesh position={[0, y, -D / 2]} material={mat} renderOrder={10}>
        <boxGeometry args={[W, H, T]} />
      </mesh>
      <mesh position={[-W / 2, y, 0]} material={mat} renderOrder={10}>
        <boxGeometry args={[T, H, D]} />
      </mesh>
      <mesh position={[W / 2, y, 0]} material={mat} renderOrder={10}>
        <boxGeometry args={[T, H, D]} />
      </mesh>
      {/* green glass edges */}
      {[
        [-W / 2, D / 2],
        [W / 2, D / 2],
        [-W / 2, -D / 2],
        [W / 2, -D / 2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, y, z]} material={edgeMat}>
          <boxGeometry args={[0.045, H, 0.045]} />
        </mesh>
      ))}
      {/* black trim: bottom & top frame like the reference */}
      {[
        { p: [0, 0, D / 2 + 0.02], s: [W + 0.08, 0.16, 0.05] },
        { p: [0, 0, -D / 2 - 0.02], s: [W + 0.08, 0.16, 0.05] },
        { p: [-W / 2 - 0.02, 0, 0], s: [0.05, 0.16, D + 0.08] },
        { p: [W / 2 + 0.02, 0, 0], s: [0.05, 0.16, D + 0.08] },
        { p: [0, H - 0.08, D / 2 + 0.02], s: [W + 0.08, 0.07, 0.05] },
        { p: [0, H - 0.08, -D / 2 - 0.02], s: [W + 0.08, 0.07, 0.05] },
        { p: [-W / 2 - 0.02, H - 0.08, 0], s: [0.05, 0.07, D + 0.08] },
        { p: [W / 2 + 0.02, H - 0.08, 0], s: [0.05, 0.07, D + 0.08] },
      ].map((b, i) => (
        <mesh
          key={i}
          position={b.p as [number, number, number]}
          material={black}
        >
          <boxGeometry args={b.s as [number, number, number]} />
        </mesh>
      ))}
      {/* thin dark silicone on vertical edges */}
      {[
        [-W / 2 - 0.02, D / 2 + 0.02],
        [W / 2 + 0.02, D / 2 + 0.02],
      ].map(([x, z], i) => (
        <mesh key={"v" + i} position={[x, y, z]} material={black}>
          <boxGeometry args={[0.03, H, 0.03]} />
        </mesh>
      ))}
      {/* bottom pane */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[W, 0.04, D]} />
        <meshStandardMaterial color="#0a0f18" />
      </mesh>
    </group>
  );
}

function Backdrop() {
  const tex = useMemo(() => backdropTexture(), []);
  return (
    <mesh position={[0, H / 2 - 0.05, -D / 2 + 0.03]}>
      <planeGeometry args={[W - 0.05, H]} />
      <meshStandardMaterial
        map={tex}
        emissive="#0a1450"
        emissiveIntensity={0.35}
        roughness={0.7}
        metalness={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function WaterVolume({ height = WATER }: { height?: number }) {
  return (
    <mesh position={[0, height / 2, 0]} renderOrder={5}>
      <boxGeometry args={[W - 0.08, height, D - 0.08]} />
      <meshPhysicalMaterial
        color="#3a6cff"
        transparent
        opacity={0.07}
        roughness={0.1}
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

function WaterSurface({ height = WATER }: { height?: number }) {
  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: "#a8d4ff",
      transparent: true,
      opacity: 0.18,
      roughness: 0.36,
      metalness: 0,
      specularIntensity: 0.03,
      envMapIntensity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
      emissive: "#2244aa",
      emissiveIntensity: 0,
    });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = globalUniforms.uTime;
      shader.uniforms.uFlow = globalUniforms.uFlow;
      const wave = `
        float wv(vec2 p, float t){
          return sin(p.x*3.1 + t*1.7)*0.012 + sin(p.y*4.3 - t*1.3)*0.01 + sin((p.x+p.y)*7.0 + t*2.6)*0.006 + sin((p.x-p.y*1.4)*11.0 - t*3.3)*0.003;
        }
      `;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform float uTime; uniform float uFlow;\n" +
            wave,
        )
        .replace(
          "#include <beginnormal_vertex>",
          `float tt = uTime * (0.6 + 0.6*uFlow);
           float e = 0.02;
           float h0 = wv(position.xy, tt);
           float hx = wv(position.xy + vec2(e,0.0), tt);
           float hy = wv(position.xy + vec2(0.0,e), tt);
           vec3 objectNormal = normalize(vec3(-(hx-h0)/e * 2.5, -(hy-h0)/e * 2.5, 1.0));
           #ifdef USE_TANGENT
             vec3 objectTangent = vec3( tangent.xyz );
           #endif`,
        )
        .replace(
          "#include <begin_vertex>",
          "vec3 transformed = vec3(position); float edge = smoothstep(0.0, 0.18, min(2.96-abs(position.x), 1.76-abs(position.y))); transformed.z += h0 * edge * (0.6 + 0.6*uFlow);",
        );
    };
    return m;
  }, []);
  return (
    <mesh
      position={[0, height, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      material={mat}
      renderOrder={6}
    >
      <planeGeometry args={[W - 0.08, D - 0.08, 120, 72]} />
    </mesh>
  );
}

export function LightFixture({ powered = true }: { powered?: boolean }) {
  return <LightHardware powered={powered} />;
}
export function Equipment() {
  return (
    <group>
      <Filter />
      <Pump />
      <Heater />
    </group>
  );
}

function LightRays() {
  const tex = useMemo(() => rayTexture(), []);
  const group = useRef<THREE.Group>(null);
  const rays = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => ({
        x: -2.4 + i * 0.6 + (Math.random() - 0.5) * 0.3,
        z: -1.0 + Math.random() * 2,
        w: 0.4 + Math.random() * 0.6,
        rot: (Math.random() - 0.5) * 0.18,
        ph: Math.random() * 10,
      })),
    [],
  );
  useFrame(({ clock, camera }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.children.forEach((m, i) => {
      const r = rays[i];
      const mesh = m as THREE.Mesh;
      mesh.rotation.y = Math.atan2(
        camera.position.x - mesh.position.x,
        camera.position.z - mesh.position.z,
      );
      (mesh.material as THREE.MeshBasicMaterial).opacity =
        0.035 + 0.03 * Math.sin(t * 0.6 + r.ph);
    });
  });
  return (
    <group ref={group}>
      {rays.map((r, i) => (
        <mesh
          key={i}
          position={[r.x, WATER - 1.3, r.z]}
          rotation={[0, 0, r.rot]}
          renderOrder={7}
        >
          <planeGeometry args={[r.w, 2.6]} />
          <meshBasicMaterial
            map={tex}
            color="#7fa0ff"
            transparent
            opacity={0.05}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export interface TankParts {
  water?: boolean;
  equipment?: boolean;
  fixture?: boolean;
  rays?: boolean;
  waterHeight?: number;
  exploded?: boolean;
  animateStage?: number;
  pulse?: number;
}

export default function Tank({
  water = true,
  equipment = true,
  fixture = true,
  rays = true,
  waterHeight = WATER,
  exploded: _exploded = false,
  animateStage,
  pulse = 0,
}: TankParts) {
  return (
    <group>
      <Backdrop />
      {equipment && (
        <BuildMotion active={animateStage === 3} pulse={pulse}>
          <group position={[0, 0, 0]}>
            <Equipment />
          </group>
        </BuildMotion>
      )}
      {water && (
        <BuildMotion
          active={animateStage === 2 || animateStage === 6}
          pulse={pulse}
          kind="fill"
        >
          <WaterSurface height={waterHeight} />
          <WaterVolume height={waterHeight} />
        </BuildMotion>
      )}
      {water && rays && <LightRays />}
      <BuildMotion active={animateStage === 1} pulse={pulse}>
        <Glass />
      </BuildMotion>
      {fixture && (
        <BuildMotion active={animateStage === 3} pulse={pulse}>
          <group position={[0, 0, 0]}>
            <LightFixture powered={rays} />
          </group>
        </BuildMotion>
      )}
    </group>
  );
}
