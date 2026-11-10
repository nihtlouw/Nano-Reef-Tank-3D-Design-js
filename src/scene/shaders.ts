import * as THREE from "three";

// Global uniforms shared by every patched material
export const globalUniforms = {
  uTime: { value: 0 },
  uCaustic: { value: 1 },
  uCausticColor: { value: new THREE.Color("#9fc4ff") },
  uFlow: { value: 1 },
  uWater: { value: 3.35 },
};

// Registry of fluorescent materials (their emissive intensity follows the light mode)
export const glowMaterials: {
  mat: THREE.MeshStandardMaterial;
  base: number;
}[] = [];
export function registerGlow<T extends THREE.MeshStandardMaterial>(
  mat: T,
  base = 1,
): T {
  const entry = { mat, base };
  glowMaterials.push(entry);
  mat.addEventListener("dispose", () => {
    const index = glowMaterials.indexOf(entry);
    if (index !== -1) glowMaterials.splice(index, 1);
  });
  return mat;
}

const causticGLSL = /* glsl */ `
float causticFn(vec2 p, float t) {
  p = mod(p * 6.28318, 6.28318) - 250.0;
  vec2 i = p;
  float c = 1.0;
  float inten = 0.005;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return clamp(pow(abs(c), 8.0), 0.0, 2.0);
}
`;

export interface PatchOptions {
  caustics?: number; // strength multiplier (0 = off)
  tentacle?: { len: number; droop: number; sway: number; speed: number };
  swim?: { uPhase: { value: number }; uAmp: { value: number } };
  polyp?: { len: number; sway: number };
}

export function patchMaterial<T extends THREE.Material>(
  mat: T,
  opts: PatchOptions,
): T {
  const key = JSON.stringify({
    c: !!opts.caustics,
    t: !!opts.tentacle,
    s: !!opts.swim,
    p: !!opts.polyp,
  });
  const local = {
    uCausticK: { value: opts.caustics ?? 0 },
    uTLen: { value: opts.tentacle?.len ?? 1 },
    uTDroop: { value: opts.tentacle?.droop ?? 0 },
    uTSway: { value: opts.tentacle?.sway ?? 0 },
    uTSpeed: { value: opts.tentacle?.speed ?? 1 },
    uPLen: { value: opts.polyp?.len ?? 1 },
    uPSway: { value: opts.polyp?.sway ?? 0 },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, globalUniforms, local);
    if (opts.swim) {
      shader.uniforms.uPhase = opts.swim.uPhase;
      shader.uniforms.uAmp = opts.swim.uAmp;
    }
    let vHead = `
      uniform float uTime; uniform float uFlow;
      uniform float uTLen; uniform float uTDroop; uniform float uTSway; uniform float uTSpeed;
      uniform float uPLen; uniform float uPSway;
      uniform float uPhase; uniform float uAmp;
      varying vec3 vCWorld; varying vec3 vCNormal;
    `;
    let bend = "";
    if (opts.tentacle) {
      bend += `
        {
          float h = clamp(position.y / uTLen, 0.0, 1.0);
          #ifdef USE_INSTANCING
            vec3 ip = instanceMatrix[3].xyz;
          #else
            vec3 ip = vec3(0.0);
          #endif
          float ph = ip.x * 37.1 + ip.z * 23.7 + ip.y * 11.3;
          float sp = uTime * uTSpeed * (0.7 + 0.3 * uFlow);
          float s1 = sin(sp + ph + h * 2.2);
          float s2 = cos(sp * 0.83 + ph * 1.37 + h * 1.7);
          float h2 = h * h;
          float sw = uTSway * (0.6 + 0.6 * uFlow);
          transformed.x += h2 * (uTDroop + sw * s1);
          transformed.z += h2 * sw * 0.75 * s2;
          transformed.y -= h2 * abs(uTDroop) * 0.35;
        }
      `;
    }
    if (opts.polyp) {
      bend += `
        {
          float h = clamp(position.y / uPLen, 0.0, 1.0);
          #ifdef USE_INSTANCING
            vec3 ip = instanceMatrix[3].xyz;
          #else
            vec3 ip = vec3(0.0);
          #endif
          float ph = ip.x * 41.0 + ip.z * 29.0 + ip.y * 17.0;
          float sw = uPSway * (0.5 + 0.7 * uFlow);
          transformed.x += h * h * sw * sin(uTime * 1.6 + ph);
          transformed.z += h * h * sw * cos(uTime * 1.3 + ph * 1.3);
        }
      `;
    }
    if (opts.swim) {
      bend += `
        {
          float tail = clamp((0.38 - position.z) / 0.9, 0.0, 1.0);
          transformed.x += uAmp * tail * tail * sin(uPhase - position.z * 6.5);
        }
      `;
    }
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\n" + vHead)
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n" + bend)
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        {
          vec4 wp = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            wp = instanceMatrix * wp;
          #endif
          vCWorld = (modelMatrix * wp).xyz;
          vec3 on = objectNormal;
          #ifdef USE_INSTANCING
            on = mat3(instanceMatrix) * on;
          #endif
          vCNormal = normalize(mat3(modelMatrix) * on);
        }`,
      );
    vHead = "";
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uTime; uniform float uCaustic; uniform vec3 uCausticColor; uniform float uCausticK; uniform float uWater;
        varying vec3 vCWorld; varying vec3 vCNormal;
        ${causticGLSL}`,
      )
      .replace(
        "#include <opaque_fragment>",
        `
        if (uCausticK > 0.0) {
          float up = clamp(vCNormal.y * 0.8 + 0.35, 0.0, 1.0);
          float depth = clamp(1.0 - (uWater - vCWorld.y) / 5.0, 0.35, 1.0);
          vec2 cp = vCWorld.xz * 0.32 + vec2(vCWorld.y * 0.05);
          float c1 = causticFn(cp, uTime * 0.45);
          float c2 = causticFn(cp * 1.31 + 3.7, uTime * 0.37);
          float c = (c1 * 0.65 + c2 * 0.45);
          float below = step(vCWorld.y, uWater);
          outgoingLight += uCausticColor * c * up * depth * uCaustic * uCausticK * below * (0.25 + diffuseColor.rgb * 0.9);
        }
        #include <opaque_fragment>`,
      );
  };
  mat.customProgramCacheKey = () => key;
  return mat;
}
