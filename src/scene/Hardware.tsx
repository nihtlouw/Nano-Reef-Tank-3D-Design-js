import { useMemo } from "react";
import * as THREE from "three";
import { TANK } from "../store";
import type { Point3 } from "./geometry";

const rear = -TANK.d / 2;
export function Pipe({
  points,
  radius = 0.045,
  color = "#252b35",
}: {
  points: Point3[];
  radius?: number;
  color?: string;
}) {
  const geo = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          points.map((p) => new THREE.Vector3(...p)),
          false,
          "centripetal",
        ),
        48,
        radius,
        10,
        false,
      ),
    [points, radius],
  );
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={color} roughness={0.38} />
    </mesh>
  );
}
function Block({
  position,
  size,
  color = "#202630",
}: {
  position: Point3;
  size: Point3;
  color?: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={0.25} roughness={0.45} />
    </mesh>
  );
}
export function LightHardware({ powered = true }: { powered?: boolean }) {
  return (
    <group name="led-fixture">
      {/* Clamp on the rear pane, riser, and horizontal arm physically meet. */}
      <Block position={[0, 3.53, rear - 0.075]} size={[0.38, 0.28, 0.21]} />
      <Block position={[0, 3.45, rear + 0.035]} size={[0.3, 0.09, 0.14]} />
      <Block position={[0, 3.98, rear - 0.13]} size={[0.12, 0.98, 0.12]} />
      <Block
        position={[0, 4.42, (rear - 0.13 - 0.1) / 2]}
        size={[0.12, 0.12, 1.83]}
      />
      <Block position={[0, 4.28, -0.1]} size={[0.16, 0.23, 0.16]} />
      <Block position={[0, 4.13, -0.1]} size={[5.5, 0.16, 0.75]} />
      {Array.from({ length: 15 }, (_, i) => (
        <Block
          key={i}
          position={[-2.57 + i * 0.367, 4.235, -0.1]}
          size={[0.045, 0.08, 0.66]}
          color="#333d49"
        />
      ))}
      <mesh position={[0, 4.045, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.25, 0.58]} />
        <meshStandardMaterial
          color="#afbad2"
          metalness={0.45}
          roughness={0.3}
        />
      </mesh>
      {Array.from({ length: 25 }, (_, i) =>
        [0, 1, 2].map((row) => (
          <mesh
            key={`${i}-${row}`}
            position={[-2.42 + i * 0.202, 4.033, -0.29 + row * 0.19]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.028, 10]} />
            <meshStandardMaterial
              color={row === 1 ? "#d7e3ff" : "#728eff"}
              emissive={row === 1 ? "#b9ceff" : "#314aff"}
              emissiveIntensity={powered ? 2 : 0}
              toneMapped={!powered}
            />
          </mesh>
        )),
      )}
      <Pipe
        radius={0.018}
        points={[
          [0.17, 4.17, -0.1],
          [0.17, 4.4, rear - 0.13],
          [0.2, 3.5, rear - 0.3],
          [0.22, 0.3, rear - 0.3],
          [0.35, -0.4, rear - 0.35],
        ]}
      />
    </group>
  );
}
export function Filter() {
  const x = -2.25;
  return (
    <group name="hob-filter">
      {/* Housing behind the glass, removable lid, and U intake bridge. */}
      <Block position={[x, 3.12, rear - 0.38]} size={[1.05, 1.0, 0.65]} />
      <Block
        position={[x, 3.65, rear - 0.38]}
        size={[1.13, 0.09, 0.71]}
        color="#303944"
      />
      <Pipe
        radius={0.06}
        points={[
          [x - 0.22, 3.13, rear - 0.43],
          [x - 0.22, 3.76, rear - 0.4],
          [x - 0.22, 3.8, rear + 0.17],
          [x - 0.22, 3.45, rear + 0.24],
          [x - 0.22, 1.14, rear + 0.24],
        ]}
      />
      {/* Strainer: a central core with actual space between the intake ribs. */}
      <group position={[x - 0.22, 0.98, rear + 0.24]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.36, 20]} />
          <meshStandardMaterial color="#10151c" />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[0, -0.17 + i * 0.067, 0]}>
            <cylinderGeometry args={[0.115, 0.115, 0.026, 20]} />
            <meshStandardMaterial color="#414955" />
          </mesh>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            rotation={[0, (i * Math.PI) / 2, 0]}
            position={[
              Math.sin((i * Math.PI) / 2) * 0.09,
              0,
              Math.cos((i * Math.PI) / 2) * 0.09,
            ]}
          >
            <boxGeometry args={[0.025, 0.36, 0.025]} />
            <meshStandardMaterial color="#303943" />
          </mesh>
        ))}
      </group>
      {/* Continuous return ramp and side rails, no floating overflow comb. */}
      <Block
        position={[x + 0.16, 3.39, rear + 0.12]}
        size={[0.64, 0.065, 0.65]}
        color="#414c5b"
      />
      <Block
        position={[x - 0.18, 3.47, rear + 0.12]}
        size={[0.045, 0.16, 0.65]}
      />
      <Block
        position={[x + 0.5, 3.47, rear + 0.12]}
        size={[0.045, 0.16, 0.65]}
      />
      <Pipe
        radius={0.019}
        points={[
          [x - 0.48, 2.8, rear - 0.55],
          [x - 0.6, 1.2, rear - 0.55],
          [x - 0.6, -0.3, rear - 0.55],
          [x - 0.38, -0.45, rear - 0.55],
          [x - 0.3, 0.1, rear - 0.55],
        ]}
      />
    </group>
  );
}
export function Pump() {
  return (
    <group name="circulation-pump">
      <group position={[2.45, 2.72, rear + 0.04]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.08, 32]} />
          <meshStandardMaterial color="#252d36" />
        </mesh>
        <Block position={[0, 0, 0.13]} size={[0.1, 0.12, 0.22]} />
        <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.19, 0.16, 0.24, 32]} />
          <meshStandardMaterial color="#2e3540" />
        </mesh>
        <mesh position={[0, 0, 0.44]}>
          <torusGeometry args={[0.177, 0.022, 8, 32]} />
          <meshStandardMaterial color="#59606b" />
        </mesh>
        <mesh position={[0, 0, 0.43]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
          <meshStandardMaterial color="#77818b" />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 4) * 0.095,
              Math.sin((i * Math.PI) / 4) * 0.095,
              0.445,
            ]}
            rotation={[0, 0, (i * Math.PI) / 4]}
          >
            <boxGeometry args={[0.16, 0.018, 0.025]} />
            <meshStandardMaterial color="#59636f" />
          </mesh>
        ))}
      </group>
      {/* Articulated nozzle is one hollow continuous tube joined to the pump. */}
      <Pipe
        radius={0.068}
        points={[
          [2.45, 2.78, rear + 0.3],
          [2.25, 3.0, rear + 0.36],
          [1.8, 2.99, rear + 0.38],
          [1.35, 2.93, rear + 0.5],
        ]}
      />
      <mesh
        position={[1.35, 2.93, rear + 0.5]}
        rotation={[0, Math.PI / 2 + 0.25, 0]}
      >
        <torusGeometry args={[0.068, 0.019, 8, 24]} />
        <meshStandardMaterial color="#434d59" />
      </mesh>
      <Pipe
        radius={0.016}
        points={[
          [2.45, 2.72, rear + 0.04],
          [2.6, 3.45, rear + 0.02],
          [2.65, 3.8, rear - 0.14],
          [2.8, 1.0, rear - 0.25],
          [2.85, -0.3, rear - 0.3],
        ]}
      />
    </group>
  );
}
export function Heater() {
  const coil = useMemo(
    () =>
      Array.from({ length: 160 }, (_, i) => {
        const t = i / 159;
        return [
          2.75 + Math.cos(t * 24 * Math.PI) * 0.032,
          1.02 + t * 1.05,
          rear + 0.36 + Math.sin(t * 24 * Math.PI) * 0.032,
        ] as Point3;
      }),
    [],
  );
  return (
    <group name="heater">
      <mesh position={[2.75, 1.75, rear + 0.36]}>
        <cylinderGeometry args={[0.067, 0.067, 1.65, 24]} />
        <meshPhysicalMaterial
          color="#c5d9df"
          transparent
          opacity={0.22}
          roughness={0.15}
          depthWrite={false}
        />
      </mesh>
      <Pipe points={coil} radius={0.008} color="#6f7880" />
      {[1.05, 2.47].map((y) => (
        <mesh key={y} position={[2.75, y, rear + 0.36]}>
          <cylinderGeometry args={[0.073, 0.073, 0.18, 24]} />
          <meshStandardMaterial color="#252d38" />
        </mesh>
      ))}
      {[1.24, 2.26].map((y) => (
        <group key={y}>
          <Block position={[2.75, y, rear + 0.2]} size={[0.16, 0.09, 0.27]} />
          <mesh
            position={[2.75, y, rear + 0.04]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.1, 0.1, 0.04, 24]} />
            <meshStandardMaterial color="#333d48" />
          </mesh>
        </group>
      ))}
      <Pipe
        radius={0.016}
        points={[
          [2.75, 2.55, rear + 0.36],
          [2.77, 3.65, rear + 0.36],
          [2.8, 3.82, rear - 0.2],
          [2.96, 0.1, rear - 0.36],
          [2.9, -0.35, rear - 0.36],
        ]}
      />
    </group>
  );
}
