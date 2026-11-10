import { useMemo } from "react";
import { woodTexture, zoaPaintingTexture } from "./textures";

export default function Room() {
  const tableTex = useMemo(() => {
    const t = woodTexture("#3b1f1a", "#160806", "table").clone();
    t.repeat.set(2, 1);
    t.needsUpdate = true;
    return t;
  }, []);
  const panelTex = useMemo(() => {
    const t = woodTexture("#a97a5c", "#5a3a28", "panel").clone();
    t.repeat.set(1, 3);
    t.rotation = Math.PI / 2;
    t.needsUpdate = true;
    return t;
  }, []);
  const painting = useMemo(() => zoaPaintingTexture(), []);

  return (
    <group>
      {/* back wall */}
      <mesh position={[0, 5, -5.5]} receiveShadow>
        <planeGeometry args={[44, 22]} />
        <meshStandardMaterial color="#b6a6de" roughness={0.95} />
      </mesh>
      {/* wood slat wall on the left */}
      <mesh position={[-8, 5, -1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12, 22]} />
        <meshStandardMaterial map={panelTex} color="#c59ac0" roughness={0.8} />
      </mesh>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[-7.95, 5, -5 + i * 0.9]}>
          <boxGeometry args={[0.06, 22, 0.04]} />
          <meshStandardMaterial color="#4a2a2a" roughness={0.9} />
        </mesh>
      ))}
      {/* zoanthid painting */}
      <group position={[8.2, 6.4, -5.45]}>
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[5.4, 4.1, 0.08]} />
          <meshStandardMaterial color="#e9e3f5" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[5.1, 3.8]} />
          <meshStandardMaterial
            map={painting}
            roughness={0.85}
            emissive="#ffffff"
            emissiveMap={painting}
            emissiveIntensity={0.12}
          />
        </mesh>
      </group>

      {/* table */}
      <mesh position={[0, -0.26, 0]} receiveShadow castShadow>
        <boxGeometry args={[20, 0.36, 7]} />
        <meshStandardMaterial
          map={tableTex}
          color="#8a5a52"
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0, -3.5, -0.2]}>
        <boxGeometry args={[19.6, 6.2, 6.4]} />
        <meshStandardMaterial color="#1a0d0d" roughness={0.9} />
      </mesh>
      {/* floor */}
      <mesh position={[0, -6.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial color="#1c1220" roughness={1} />
      </mesh>
    </group>
  );
}
