import * as THREE from "three";

export type Point3 = [number, number, number];

/** Closed-wall vessel: outer wall, rim, inner wall, floor and underside. */
export function bucketGeometry() {
  return new THREE.LatheGeometry(
    [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.42, 0),
      new THREE.Vector2(0.44, 0.035),
      new THREE.Vector2(0.505, 0.91),
      new THREE.Vector2(0.505, 0.94),
      new THREE.Vector2(0.472, 0.94),
      new THREE.Vector2(0.472, 0.9),
      new THREE.Vector2(0.407, 0.065),
      new THREE.Vector2(0, 0.065),
    ],
    64,
  );
}

/** Eight separate tapered fingers, not an opaque cone or luminous blob. */
export function starPolypGeometry(length: number) {
  const positions: number[] = [];
  const radialSegments = 3,
    segments = 3;
  const vertices: THREE.Vector3[] = [];
  for (let arm = 0; arm < 8; arm++) {
    const a = (arm * Math.PI) / 4;
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const radius = 0.0038 * (1 - t) + 0.0007;
      for (let k = 0; k <= radialSegments; k++) {
        const b = (k / radialSegments) * Math.PI * 2;
        const distance = 0.006 + t * 0.027;
        vertices.push(
          new THREE.Vector3(
            Math.cos(a) * distance - Math.sin(a) * Math.cos(b) * radius,
            length + Math.sin(t * Math.PI * 0.7) * 0.013 + Math.sin(b) * radius,
            Math.sin(a) * distance + Math.cos(a) * Math.cos(b) * radius,
          ),
        );
      }
    }
  }
  const g = new THREE.BufferGeometry();
  const triangles: number[] = [];
  for (let arm = 0; arm < 8; arm++)
    for (let j = 0; j < segments; j++)
      for (let k = 0; k < radialSegments; k++) {
        const i =
          arm * (segments + 1) * (radialSegments + 1) +
          j * (radialSegments + 1) +
          k;
        const n = i + radialSegments + 1;
        triangles.push(i, n, i + 1, i + 1, n, n + 1);
      }
  for (const v of vertices) positions.push(v.x, v.y, v.z);
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(triangles);
  g.computeVertexNormals();
  return g;
}

/** Complete sand skirt; front, right, rear and left all meet the height field. */
export function sandSkirtGeometry(
  width: number,
  depth: number,
  height: (x: number, z: number) => number,
) {
  const p: number[] = [],
    uv: number[] = [],
    indices: number[] = [];
  const corners = [
    [-width / 2, depth / 2],
    [width / 2, depth / 2],
    [width / 2, -depth / 2],
    [-width / 2, -depth / 2],
  ];
  const segments = 64;
  for (let edge = 0; edge < 4; edge++) {
    const a = corners[edge],
      b = corners[(edge + 1) % 4];
    const offset = p.length / 3;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments,
        x = THREE.MathUtils.lerp(a[0], b[0], t),
        z = THREE.MathUtils.lerp(a[1], b[1], t);
      const y = height(x, z);
      p.push(x, -0.06, z, x, y, z);
      uv.push(t, 0, t, y / 0.5);
    }
    for (let i = 0; i < segments; i++) {
      const n = offset + i * 2;
      indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
