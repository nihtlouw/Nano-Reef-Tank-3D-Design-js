import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { makeRockGeometry, ROCKS } from "../scene/Rockscape";
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
  return (
    <group position={[3.6, 0, 1.1]}>
      <mesh position={[0, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.43, 0.92, 64, 1, true]} />
        <meshPhysicalMaterial
          color="#729ba7"
          roughness={0.4}
          clearcoat={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.93, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.027, 12, 64]} />
        <meshStandardMaterial color="#c8dce0" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.73, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.46, 64]} />
        <meshPhysicalMaterial
          color="#7ca8ce"
          metalness={0.1}
          roughness={0.14}
        />
      </mesh>
      <mesh position={[0, 1.09, 0]}>
        <torusGeometry args={[0.46, 0.013, 8, 48, Math.PI]} />
        <meshStandardMaterial color="#b6cad8" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.44, 0.5]}>
        <planeGeometry args={[0.6, 0.3]} />
        <PrintedLabel text={fresh ? "RO/DI" : "AIR LAUT"} />
      </mesh>
      {salt && (
        <group position={[0.78, 0.26, 0.15]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.5, 48]} />
            <meshStandardMaterial color="#d4d7e1" />
          </mesh>
          <mesh position={[0, 0, 0.255]}>
            <planeGeometry args={[0.4, 0.3]} />
            <PrintedLabel text="REEF SALT" />
          </mesh>
        </group>
      )}
    </group>
  );
}
function TestKit() {
  return (
    <group position={[3.45, 0.31, 1.0]}>
      <mesh castShadow>
        <boxGeometry args={[0.75, 0.6, 0.35]} />
        <meshStandardMaterial color="#aab6c3" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.18]}>
        <planeGeometry args={[0.65, 0.45]} />
        <PrintedLabel text="TEST KIT" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[-0.26 + i * 0.23, -0.13, 0.48]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.07, 0.32, 24]} />
            <meshPhysicalMaterial
              color={["#c7bf6f", "#9ec5e6", "#c6a8dd"][i]}
              roughness={0.1}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.05, 24]} />
            <meshStandardMaterial color="#dae4ef" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
function SampleRock() {
  const geo = useMemo(() => makeRockGeometry(ROCKS[7]), []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} position={[-3.7, 0.3, 1.0]} scale={0.65} castShadow>
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
