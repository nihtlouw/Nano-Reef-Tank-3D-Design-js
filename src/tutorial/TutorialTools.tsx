import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { makeRockGeometry, ROCKS } from "../scene/Rockscape";
import { bucketGeometry } from "../scene/geometry";
import BuildMotion from "../scene/BuildMotion";

function PrintedLabel({
  text,
  color = "#bcd8d5",
}: {
  text: string;
  color?: string;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#1d3744";
      ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = color;
      ctx.font = "bold 34px Arial";
      ctx.textAlign = "center";
      ctx.fillText(text, 128, 78);
    }
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <meshStandardMaterial map={texture} roughness={0.7} />;
}
function Bucket({
  fresh = false,
  salt = false,
}: {
  fresh?: boolean;
  salt?: boolean;
}) {
  const geo = useMemo(bucketGeometry, []);
  return (
    <group
      position={[3.85, -0.08, 0.95]}
      name={fresh ? "freshwater-bucket" : "mixing-bucket"}
    >
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#84a9b6"
          roughness={0.42}
          clearcoat={0.2}
        />
      </mesh>
      <mesh position={[0, 0.69, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.451, 64]} />
        <meshPhysicalMaterial
          color="#7198b2"
          roughness={0.12}
          metalness={0.08}
        />
      </mesh>
      <mesh position={[0, 0.47, 0]}>
        <cylinderGeometry args={[0.487, 0.465, 0.3, 32, 1, true, -0.7, 1.4]} />
        <PrintedLabel text={fresh ? "RO/DI" : "AIR LAUT"} />
      </mesh>
      {/* Handle arc terminates at both hinge pins, rather than hanging above the rim. */}
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[0.515, 0.016, 8, 48, Math.PI]} />
        <meshStandardMaterial
          color="#bfced5"
          metalness={0.7}
          roughness={0.26}
        />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * 0.505, 0.8, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.045, 0.045, 0.045, 20]} />
          <meshStandardMaterial color="#364b5d" />
        </mesh>
      ))}
      <mesh position={[0, 1.31, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.032, 0.032, 0.25, 16]} />
        <meshStandardMaterial color="#344655" />
      </mesh>
      {salt && (
        <group position={[0.84, 0, 0.12]}>
          <mesh position={[0, 0.26, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.52, 48]} />
            <meshStandardMaterial color="#d2d9df" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.535, 0]}>
            <cylinderGeometry args={[0.265, 0.265, 0.045, 48]} />
            <meshStandardMaterial color="#485b6b" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.26, 0]}>
            <cylinderGeometry
              args={[0.252, 0.252, 0.25, 32, 1, true, -0.9, 1.8]}
            />
            <PrintedLabel text="REEF SALT" />
          </mesh>
        </group>
      )}
    </group>
  );
}
function TestKit() {
  return (
    <group position={[3.65, -0.08, 1.0]} name="water-test-kit">
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.36]} />
        <meshStandardMaterial color="#8fabbc" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.3, 0.182]}>
        <planeGeometry args={[0.7, 0.45]} />
        <PrintedLabel text="TEST KIT" />
      </mesh>
      <mesh position={[0, 0.035, 0.45]} castShadow>
        <boxGeometry args={[0.79, 0.07, 0.29]} />
        <meshStandardMaterial color="#435769" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[-0.25 + i * 0.25, 0.235, 0.45]}>
          <mesh>
            <cylinderGeometry args={[0.069, 0.069, 0.33, 24]} />
            <meshPhysicalMaterial
              color="#c5e2ea"
              transparent
              opacity={0.2}
              roughness={0.12}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, -0.04, 0]}>
            <cylinderGeometry args={[0.058, 0.058, 0.22, 24]} />
            <meshStandardMaterial
              color={["#c7bf6f", "#9ec5e6", "#c6a8dd"][i]}
              roughness={0.24}
            />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.078, 0.078, 0.045, 24]} />
            <meshStandardMaterial color="#d1dce4" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SampleRock() {
  const geo = useMemo(() => {
    const g = makeRockGeometry(ROCKS[7], false);
    g.computeBoundingBox();
    g.translate(0, -g.boundingBox!.min.y, 0);
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} position={[-3.7, -0.08, 1.0]} scale={0.65} castShadow>
      <meshStandardMaterial vertexColors roughness={0.9} />
    </mesh>
  );
}
export default function TutorialTools({
  stage,
  animate,
  pulse,
}: {
  stage: number;
  animate: boolean;
  pulse: number;
}) {
  return (
    <>
      {stage === 0 && (
        <>
          <SampleRock />
          <TestKit />
        </>
      )}
      {[5, 6, 10].includes(stage) && (
        <BuildMotion active={animate && stage === 5} pulse={pulse}>
          <Bucket fresh={stage === 10} salt={stage === 5} />
        </BuildMotion>
      )}
      {stage === 8 && <TestKit />}
    </>
  );
}
