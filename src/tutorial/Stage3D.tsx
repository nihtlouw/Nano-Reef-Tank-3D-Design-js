import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Block({
  position = [0, 0, 0],
  scale,
  color = "#263845",
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number];
  scale: [number, number, number];
  color?: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  );
}
function Reveal({
  children,
  active,
  pulse,
  kind = "drop",
}: {
  children: ReactNode;
  active: boolean;
  pulse: number;
  kind?: "drop" | "fill";
}) {
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);
  useEffect(() => {
    time.current = 0;
  }, [pulse]);
  useFrame((_, dt) => {
    if (!group.current) return;
    time.current = Math.min(1, time.current + Math.min(dt, 0.05) / 1.8);
    const progress = active ? 1 - Math.pow(1 - time.current, 3) : 1;
    if (kind === "drop") group.current.position.y = (1 - progress) * 1.25;
    else group.current.scale.y = Math.max(0.01, progress);
  });
  return <group ref={group}>{children}</group>;
}
function LabelTexture({
  text,
  color = "#d9e8e1",
  background = "#2f5b60",
}: {
  text: string;
  color?: string;
  background?: string;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = color;
      ctx.font = "bold 35px Arial";
      ctx.textAlign = "center";
      ctx.fillText(text, 128, 78);
    }
    const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = THREE.SRGBColorSpace;
    return result;
  }, [text, color, background]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <meshStandardMaterial map={texture} roughness={0.8} />;
}
function TankShell() {
  return (
    <group position={[0, 0.08, 0]}>
      <Block position={[0, 0, 0]} scale={[4.6, 0.12, 3.1]} color="#1a2c35" />
      {[-2.25, 2.25].map((x) => (
        <mesh key={x} position={[x, 1.5, 0]} renderOrder={5}>
          <boxGeometry args={[0.045, 3, 3]} />
          <meshPhysicalMaterial
            color="#abd6de"
            transparent
            opacity={0.13}
            roughness={0.15}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
      {[-1.5, 1.5].map((z) => (
        <mesh key={z} position={[0, 1.5, z]} renderOrder={5}>
          <boxGeometry args={[4.5, 3, 0.045]} />
          <meshPhysicalMaterial
            color="#a0d3dd"
            transparent
            opacity={0.1}
            roughness={0.12}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
      {[-2.25, 2.25].flatMap((x) =>
        [-1.5, 1.5].map((z) => (
          <Block
            key={`${x}-${z}`}
            position={[x, 1.5, z]}
            scale={[0.025, 3, 0.025]}
            color="#7a9ca5"
          />
        )),
      )}
      {[-1.5, 1.5].map((z) => (
        <Block
          key={z}
          position={[0, 3, z]}
          scale={[4.53, 0.035, 0.035]}
          color="#91aeb7"
        />
      ))}
      {[-2.25, 2.25].map((x) => (
        <Block
          key={x}
          position={[x, 3, 0]}
          scale={[0.035, 0.035, 3]}
          color="#91aeb7"
        />
      ))}
      <mesh
        position={[-1.58, 1.7, 1.529]}
        rotation={[0, 0, -0.2]}
        renderOrder={6}
      >
        <planeGeometry args={[0.018, 2.1]} />
        <meshBasicMaterial
          color="#d7f4ff"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
function Water({ height = 2.58 }: { height?: number }) {
  return (
    <group position={[0, 0.17, 0]}>
      <mesh position={[0, height / 2, 0]} renderOrder={2}>
        <boxGeometry args={[4.43, height, 2.93]} />
        <meshPhysicalMaterial
          color="#2596ae"
          roughness={0.2}
          transparent
          opacity={0.19}
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>
      <mesh
        position={[0, height, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={3}
      >
        <planeGeometry args={[4.43, 2.93]} />
        <meshPhysicalMaterial
          color="#5aafc4"
          metalness={0.18}
          roughness={0.25}
          transparent
          opacity={0.38}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[-1, 0, 1].map((x, i) => (
        <mesh
          key={x}
          position={[x, height + 0.005, -0.3 + i * 0.3]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry
            args={[0.31 + i * 0.08, 0.318 + i * 0.08, 64, 1, 0, Math.PI * 1.3]}
          />
          <meshBasicMaterial
            color="#a2e5e9"
            transparent
            opacity={0.2}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
function HOB({ placed = true }: { placed?: boolean }) {
  return (
    <group position={placed ? [-1.25, 2.44, -1.68] : [0, 0, 0]}>
      <Block scale={[0.9, 1.1, 0.64]} color={placed ? "#25343c" : "#6a8290"} />
      <Block
        position={[0, 0.59, 0]}
        scale={[1.02, 0.12, 0.75]}
        color="#4a5b63"
      />
      <Block
        position={[0.24, 0.25, 0.46]}
        scale={[0.32, 0.18, 0.56]}
        color="#5d777f"
      />
      <Block
        position={[0.24, 0.1, 0.7]}
        scale={[0.32, 0.04, 0.13]}
        color="#8cafb3"
      />
      <mesh position={[-0.25, -0.76, 0.54]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 1.75, 16]} />
        <meshStandardMaterial color="#536c75" />
      </mesh>
      <mesh position={[-0.25, -1.62, 0.54]}>
        <cylinderGeometry args={[0.09, 0.09, 0.27, 12]} />
        <meshStandardMaterial color="#253843" />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <Block
          key={i}
          position={[-0.25, -1.53 - i * 0.035, 0.6]}
          scale={[0.16, 0.012, 0.018]}
          color="#7b9398"
        />
      ))}
    </group>
  );
}
function Lamp({ installed = true }: { installed?: boolean }) {
  return (
    <group position={installed ? [0, 3.48, -0.3] : [-0.25, 0.26, 1.8]}>
      <Block
        scale={[3.4, 0.13, 0.55]}
        color={installed ? "#26343f" : "#627b87"}
      />
      <Block
        position={[0, -0.078, 0]}
        scale={[3.2, 0.02, 0.42]}
        color="#b3dbeb"
      />
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x) => (
        <mesh key={x} position={[x, -0.095, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.075, 16]} />
          <meshBasicMaterial color="#83d9ef" />
        </mesh>
      ))}
      {installed && (
        <>
          <Block
            position={[0, -0.63, -1.53]}
            scale={[0.1, 1.25, 0.12]}
            color="#455961"
          />
          <Block
            position={[0, -0.02, -0.78]}
            scale={[0.1, 0.09, 1.55]}
            color="#455961"
          />
        </>
      )}
    </group>
  );
}
function Thermometer() {
  return (
    <group position={[1.97, 2, -1.22]}>
      <Block scale={[0.1, 1.1, 0.1]} color="#b1cbd0" />
      <Block
        position={[0, -0.08, 0.06]}
        scale={[0.025, 0.55, 0.025]}
        color="#d99a71"
      />
      <Block
        position={[0, 0.55, 0]}
        scale={[0.2, 0.18, 0.14]}
        color="#2d4851"
      />
    </group>
  );
}
function Cable() {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.5, 2.8, -2),
        new THREE.Vector3(-2.6, 2.4, -2.2),
        new THREE.Vector3(-2.85, 0.35, -2.2),
        new THREE.Vector3(-3.2, 0.3, -2.2),
        new THREE.Vector3(-3.35, 1.5, -2.2),
      ]),
    [],
  );
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 32, 0.023, 8, false]} />
        <meshStandardMaterial color="#d1b594" />
      </mesh>
      <Block
        position={[-3.35, 1.75, -2.2]}
        scale={[0.3, 0.55, 0.18]}
        color="#e0cbb0"
      />
    </group>
  );
}
function Rock({
  position,
  scale = 1,
  seed = 0,
}: {
  position: [number, number, number];
  scale?: number;
  seed?: number;
}) {
  const geometry = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.7, 2);
    const points = g.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i),
        y = points.getY(i),
        z = points.getZ(i);
      const n =
        1 +
        Math.sin(x * 12 + seed) *
          Math.sin(y * 10 + seed) *
          Math.sin(z * 13) *
          0.15;
      points.setXYZ(i, x * n, y * n * 0.85, z * n);
    }
    g.computeVertexNormals();
    return g;
  }, [seed]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      position={position}
      scale={scale}
      geometry={geometry}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={seed % 2 ? "#86918a" : "#a5a18a"}
        roughness={0.95}
      />
    </mesh>
  );
}
function Scape() {
  return (
    <group>
      <Block position={[0, 0.23, 0]} scale={[4.4, 0.12, 2.9]} color="#c6bea1" />
      <Rock position={[-0.8, 0.67, 0.2]} scale={1.05} seed={1} />
      <Rock position={[-0.6, 1.35, 0.1]} scale={0.85} seed={3} />
      <Rock position={[-0.16, 0.75, 0.15]} scale={0.8} seed={4} />
      <Rock position={[1.1, 0.64, -0.2]} scale={0.8} seed={2} />
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          position={[
            -1.7 + ((i * 0.63) % 3.4),
            0.32,
            -0.85 + ((i * 0.57) % 1.8),
          ]}
          rotation={[i, 0, i]}
          castShadow
        >
          <dodecahedronGeometry args={[0.035 + (i % 3) * 0.012, 0]} />
          <meshStandardMaterial color="#9e9b87" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}
function Bucket({
  position = [3.4, 0.15, 0.5],
  salt = false,
  fresh = false,
}: {
  position?: [number, number, number];
  salt?: boolean;
  fresh?: boolean;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.43, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.4, 0.86, 48, 1, true]} />
        <meshStandardMaterial
          color={fresh ? "#b1b7ac" : "#72989e"}
          side={THREE.DoubleSide}
          roughness={0.48}
          metalness={0.08}
        />
      </mesh>
      <mesh position={[0, 0.87, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.035, 12, 48]} />
        <meshStandardMaterial color="#b3cdd0" />
      </mesh>
      <mesh position={[0, 0.68, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.44, 48]} />
        <meshStandardMaterial color="#6aacbd" roughness={0.2} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.03, 0]}>
        <torusGeometry args={[0.43, 0.016, 8, 40, Math.PI]} />
        <meshStandardMaterial color="#c0d6d8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.45, 0.48]}>
        <planeGeometry args={[0.57, 0.27]} />
        <LabelTexture text={fresh ? "RO/DI" : "MIX"} />
      </mesh>
      {salt && (
        <group position={[0.9, 0.23, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.45, 32]} />
            <meshStandardMaterial color="#d4d4bf" />
          </mesh>
          <mesh position={[0, 0, 0.263]}>
            <planeGeometry args={[0.4, 0.28]} />
            <LabelTexture text="SALT" background="#a9906b" />
          </mesh>
        </group>
      )}
    </group>
  );
}
function TestKit({
  position = [2.95, 0.4, 0.75],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position}>
      <Block scale={[0.73, 0.55, 0.3]} color="#d2d9cd" />
      <mesh position={[0, 0, 0.155]}>
        <planeGeometry args={[0.64, 0.4]} />
        <LabelTexture text="TEST" background="#bccdbf" color="#2c534e" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[-0.35 + i * 0.24, -0.08, 0.5]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.32, 16]} />
            <meshStandardMaterial
              color={["#b8b867", "#a5cad0", "#9cbaa3"][i]}
              roughness={0.2}
              transparent
              opacity={0.85}
            />
          </mesh>
          <Block
            position={[0, 0.2, 0]}
            scale={[0.14, 0.07, 0.14]}
            color="#d2dfd7"
          />
        </group>
      ))}
    </group>
  );
}
function Flow() {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1, 2.74, -0.9),
        new THREE.Vector3(0, 2.74, -0.6),
        new THREE.Vector3(1.3, 2.65, 0),
        new THREE.Vector3(1.5, 1.6, 0.6),
      ]),
    [],
  );
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 48, 0.015, 8, false]} />
        <meshBasicMaterial color="#8ad7cf" transparent opacity={0.8} />
      </mesh>
      <mesh position={[1.5, 1.53, 0.6]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.065, 0.18, 16]} />
        <meshBasicMaterial color="#9cddd1" />
      </mesh>
    </group>
  );
}
function Fish() {
  return (
    <group position={[0.72, 2.0, 0.55]} rotation={[0, -0.25, 0]}>
      <mesh scale={[0.3, 0.155, 0.085]} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color="#e99c64" roughness={0.4} />
      </mesh>
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} position={[x, 0, 0]} scale={[0.025, 0.149, 0.087]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color="#f0e7d1" roughness={0.5} />
        </mesh>
      ))}
      <mesh
        position={[-0.35, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        scale={[1, 1, 0.4]}
      >
        <coneGeometry args={[0.15, 0.19, 3]} />
        <meshStandardMaterial color="#e7a773" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.22, 0.045, 0.067]}>
        <sphereGeometry args={[0.021, 16, 12]} />
        <meshStandardMaterial color="#142c35" />
      </mesh>
    </group>
  );
}
function Corals() {
  return (
    <>
      {[
        [-0.73, 1.85, 0.13],
        [1.16, 1.13, -0.16],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          {Array.from({ length: 7 }, (_, j) => (
            <mesh
              key={j}
              position={[
                (j % 3) * 0.12 - 0.1,
                Math.sin(j) * 0.035,
                Math.floor(j / 3) * 0.13 - 0.1,
              ]}
              castShadow
            >
              <sphereGeometry args={[0.11, 16, 8]} />
              <meshStandardMaterial
                color={i ? "#c3ac94" : "#8cb6b3"}
                roughness={0.65}
              />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}
function Stage({
  index,
  animate,
  pulse,
  onReady,
}: {
  index: number;
  animate: boolean;
  pulse: number;
  onReady?: () => void;
}) {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current === 4) onReady?.();
    frames.current++;
  });
  const kit = index === 0;
  const water = index === 2 || index >= 6;
  const equipment = index >= 3;
  return (
    <>
      <color attach="background" args={["#12212b"]} />
      <fog attach="fog" args={["#12212b", 18, 38]} />
      <ambientLight intensity={0.85} color="#c5dbe3" />
      <hemisphereLight args={["#bddce5", "#534a39", 1.6]} />
      <directionalLight
        position={[-3, 8, 6]}
        intensity={3.1}
        color="#fff0d5"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-normalBias={0.035}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight position={[5, 4, -5]} intensity={2.3} color="#8dc9e1" />
      <mesh
        position={[0, -0.48, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#172b35" roughness={0.9} />
      </mesh>
      <Block
        position={[0, -0.17, 0]}
        scale={[kit ? 9 : 8.5, 0.3, 5.1]}
        color="#34413f"
      />
      <Block
        position={[0, -0.35, 0]}
        scale={[kit ? 9.06 : 8.56, 0.055, 5.16]}
        color="#6a7165"
      />
      <group
        position={kit ? [-1.5, 0.0, -0.1] : [0, 0, 0]}
        scale={kit ? 0.69 : 1}
      >
        <Reveal active={animate && index === 1} pulse={pulse}>
          <TankShell />
        </Reveal>
        {equipment && (
          <>
            <Reveal active={animate && index === 3} pulse={pulse}>
              <HOB />
              <Lamp />
            </Reveal>
            <Thermometer />
            {index === 3 && <Cable />}
          </>
        )}
        {index >= 4 && (
          <Reveal active={animate && index === 4} pulse={pulse}>
            <Scape />
          </Reveal>
        )}
        {water && (
          <Reveal
            active={animate && (index === 2 || index === 6)}
            pulse={pulse}
            kind="fill"
          >
            <Water height={index === 2 ? 2.0 : 2.58} />
          </Reveal>
        )}
        {index === 7 && <Flow />}
        {index >= 9 && (
          <>
            <Corals />
            <Fish />
          </>
        )}
      </group>
      {kit && (
        <>
          <group
            position={[3.4, 0.42, -1.25]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.65}
          >
            <HOB placed={false} />
          </group>
          <group position={[-0.3, 0, 0.2]}>
            <Lamp installed={false} />
          </group>
          <Rock position={[0.5, 0.48, 1.45]} scale={0.58} seed={2} />
          <Bucket position={[2.8, 0, 0.5]} fresh />
          <TestKit position={[1.6, 0.35, 1.6]} />
        </>
      )}
      {(index === 5 || index === 6) && (
        <Reveal active={animate && index === 5} pulse={pulse}>
          <Bucket salt={index === 5} />
        </Reveal>
      )}
      {index === 8 && <TestKit />}
      {index === 10 && <Bucket fresh position={[3.25, 0, 0.6]} />}
      <OrbitControls
        makeDefault
        target={[0, index === 0 ? 0.8 : 1.35, 0]}
        enablePan={false}
        minDistance={7}
        maxDistance={15}
        minPolarAngle={0.5}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  );
}
export default function Stage3D({
  index,
  animate = false,
  pulse = 0,
  onReady,
}: {
  index: number;
  animate?: boolean;
  pulse?: number;
  onReady?: () => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{
        fov: 36,
        near: 0.1,
        far: 80,
        position: index === 0 ? [8.6, 6.5, 10.7] : [6.8, 5.8, 8.6],
      }}
      gl={{
        antialias: true,
        preserveDrawingBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        powerPreference: "default",
      }}
    >
      <Stage
        key={index}
        index={index}
        animate={animate}
        pulse={pulse}
        onReady={onReady}
      />
    </Canvas>
  );
}
export function TutorialCapture({ index }: { index: number }) {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Stage3D
        index={index}
        onReady={() => (document.documentElement.dataset.sceneReady = "true")}
      />
    </div>
  );
}
