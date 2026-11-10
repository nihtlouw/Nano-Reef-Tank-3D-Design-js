import { useEffect, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

export default function BuildMotion({
  children,
  active = false,
  pulse = 0,
  kind = "drop",
}: {
  children: ReactNode;
  active?: boolean;
  pulse?: number;
  kind?: "drop" | "fill";
}) {
  const group = useRef<Group>(null);
  const time = useRef(0);
  useEffect(() => {
    time.current = 0;
  }, [pulse, active]);
  useFrame((_, dt) => {
    if (!group.current) return;
    time.current = Math.min(1, time.current + Math.min(dt, 0.05) / 1.8);
    const progress = active ? 1 - Math.pow(1 - time.current, 3) : 1;
    if (kind === "drop") group.current.position.y = (1 - progress) * 0.9;
    else group.current.scale.y = Math.max(0.01, progress);
  });
  return <group ref={group}>{children}</group>;
}
