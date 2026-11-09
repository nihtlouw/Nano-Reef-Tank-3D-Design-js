import * as THREE from "three";
import { mulberry32 } from "./noise";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function toTex(c: HTMLCanvasElement, repeat = 1, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const cache = new Map<string, THREE.Texture>();
function memo(key: string, fn: () => THREE.Texture) {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key)!;
}

export function sandTexture() {
  return memo("sand", () => {
    const [c, g] = canvas(512, 512);
    g.fillStyle = "#d9dde6";
    g.fillRect(0, 0, 512, 512);
    const r = mulberry32(7);
    for (let i = 0; i < 26000; i++) {
      const x = r() * 512;
      const y = r() * 512;
      const s = r() * 2.4 + 0.5;
      const v = r();
      const col =
        v < 0.55
          ? `rgba(255,255,255,${0.4 + r() * 0.6})`
          : v < 0.85
          ? `rgba(150,160,180,${0.3 + r() * 0.5})`
          : v < 0.95
          ? `rgba(90,95,115,${0.4 + r() * 0.4})`
          : `rgba(210,170,190,${0.5})`;
      g.fillStyle = col;
      g.beginPath();
      g.arc(x, y, s, 0, Math.PI * 2);
      g.fill();
    }
    return toTex(c, 5);
  });
}

export function sandSideTexture() {
  return memo("sandside", () => {
    const [c, g] = canvas(1024, 128);
    const grd = g.createLinearGradient(0, 0, 0, 128);
    grd.addColorStop(0, "#cfd5e2");
    grd.addColorStop(1, "#8d93a6");
    g.fillStyle = grd;
    g.fillRect(0, 0, 1024, 128);
    const r = mulberry32(11);
    for (let i = 0; i < 9000; i++) {
      const x = r() * 1024;
      const y = r() * 128;
      const s = r() * 2.6 + 0.6;
      const v = r();
      g.fillStyle =
        v < 0.5 ? `rgba(255,255,255,${0.5 + r() * 0.5})` : v < 0.85 ? `rgba(110,115,135,0.7)` : `rgba(60,60,80,0.8)`;
      g.beginPath();
      g.ellipse(x, y, s, s * (0.6 + r() * 0.6), r() * 3, 0, Math.PI * 2);
      g.fill();
    }
    const t = toTex(c, 1);
    t.repeat.set(1, 1);
    return t;
  });
}

export function woodTexture(base = "#3a2219", dark = "#1d0f0b", key = "wood", vertical = false) {
  return memo(key, () => {
    const [c, g] = canvas(1024, 512);
    g.fillStyle = base;
    g.fillRect(0, 0, 1024, 512);
    const r = mulberry32(key.length * 31 + 5);
    for (let i = 0; i < 260; i++) {
      const y = r() * 512;
      g.strokeStyle = r() > 0.5 ? dark : "rgba(255,220,190,0.06)";
      g.globalAlpha = 0.15 + r() * 0.35;
      g.lineWidth = 0.5 + r() * 2.5;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 32) {
        g.lineTo(x, y + Math.sin(x * 0.01 + i) * 3 + (r() - 0.5) * 2);
      }
      g.stroke();
    }
    g.globalAlpha = 1;
    const t = toTex(c, 1);
    if (vertical) t.rotation = Math.PI / 2;
    return t;
  });
}

export function ledPanelTexture() {
  return memo("led", () => {
    const [c, g] = canvas(1024, 128);
    g.fillStyle = "#05070f";
    g.fillRect(0, 0, 1024, 128);
    for (let x = 0; x < 64; x++) {
      for (let y = 0; y < 8; y++) {
        const cx = 8 + x * 16;
        const cy = 8 + y * 16;
        const v = (x + y) % 5;
        g.fillStyle = v === 0 ? "#e8f0ff" : v === 2 ? "#8a5bff" : "#3d6bff";
        g.beginPath();
        g.arc(cx, cy, 4.5, 0, Math.PI * 2);
        g.fill();
      }
    }
    return toTex(c, 1);
  });
}

export interface ZoaColors {
  mouth: string;
  disc: string;
  ring: string;
  rim: string;
}

export function zoaTexture(cols: ZoaColors) {
  return memo("zoa" + JSON.stringify(cols), () => {
    const [c, g] = canvas(128, 128);
    g.clearRect(0, 0, 128, 128);
    // tentacle fringe
    g.save();
    g.translate(64, 64);
    for (let i = 0; i < 28; i++) {
      g.rotate((Math.PI * 2) / 28);
      g.fillStyle = cols.rim;
      g.beginPath();
      g.ellipse(0, 54, 3.2, 10, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
    const grd = g.createRadialGradient(64, 64, 2, 64, 64, 50);
    grd.addColorStop(0, cols.mouth);
    grd.addColorStop(0.18, cols.mouth);
    grd.addColorStop(0.3, cols.disc);
    grd.addColorStop(0.62, cols.disc);
    grd.addColorStop(0.7, cols.ring);
    grd.addColorStop(0.86, cols.ring);
    grd.addColorStop(0.9, cols.rim);
    grd.addColorStop(1, cols.rim);
    g.fillStyle = grd;
    g.beginPath();
    g.arc(64, 64, 50, 0, Math.PI * 2);
    g.fill();
    // radial streaks
    g.strokeStyle = "rgba(0,0,0,0.18)";
    g.lineWidth = 1.2;
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      g.beginPath();
      g.moveTo(64 + Math.cos(a) * 12, 64 + Math.sin(a) * 12);
      g.lineTo(64 + Math.cos(a) * 32, 64 + Math.sin(a) * 32);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

export function mushroomTexture(base: string, bump: string, center: string, key: string) {
  return memo("mush" + key, () => {
    const [c, g] = canvas(512, 512);
    const grd = g.createRadialGradient(256, 256, 10, 256, 256, 256);
    grd.addColorStop(0, center);
    grd.addColorStop(0.25, base);
    grd.addColorStop(0.9, base);
    grd.addColorStop(1, center);
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 512);
    const r = mulberry32(key.length * 13 + 3);
    // radial ridges
    g.strokeStyle = "rgba(60,10,0,0.35)";
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      g.lineWidth = 1 + r() * 2;
      g.beginPath();
      g.moveTo(256 + Math.cos(a) * 30, 256 + Math.sin(a) * 30);
      g.lineTo(256 + Math.cos(a) * 250, 256 + Math.sin(a) * 250);
      g.stroke();
    }
    // bubbly papillae
    for (let i = 0; i < 2600; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 250;
      const x = 256 + Math.cos(a) * d;
      const y = 256 + Math.sin(a) * d;
      const s = 2 + r() * 5;
      g.fillStyle = bump;
      g.globalAlpha = 0.5 + r() * 0.5;
      g.beginPath();
      g.arc(x, y, s, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(255,255,220,0.5)";
      g.beginPath();
      g.arc(x - s * 0.3, y - s * 0.3, s * 0.35, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    // mouth
    g.fillStyle = center;
    g.beginPath();
    g.ellipse(256, 256, 18, 10, 0.4, 0, Math.PI * 2);
    g.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

export function zoaPaintingTexture() {
  return memo("painting", () => {
    const [c, g] = canvas(1024, 768);
    g.fillStyle = "#6b1d1a";
    g.fillRect(0, 0, 1024, 768);
    const r = mulberry32(99);
    for (let i = 0; i < 300; i++) {
      g.fillStyle = `rgba(${150 + r() * 80},${40 + r() * 40},${30},0.25)`;
      g.beginPath();
      g.arc(r() * 1024, r() * 768, 20 + r() * 60, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 70; i++) {
      const x = r() * 1024;
      const y = r() * 768;
      const s = 28 + r() * 46;
      g.lineWidth = s * 0.22;
      g.strokeStyle = r() > 0.3 ? "#c6e83a" : "#f2a33a";
      g.beginPath();
      g.arc(x, y, s, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = r() > 0.5 ? "#e8572c" : "#d83b2b";
      g.beginPath();
      g.arc(x, y, s * 0.55, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#7a1c12";
      g.beginPath();
      g.arc(x, y, s * 0.18, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}

export function softDotTexture() {
  return memo("dot", () => {
    const [c, g] = canvas(64, 64);
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.35, "rgba(255,255,255,0.6)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  });
}

export function rayTexture() {
  return memo("ray", () => {
    const [c, g] = canvas(64, 256);
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, "rgba(255,255,255,0.9)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 256);
    const h = g.getImageData(0, 0, 64, 256);
    for (let y = 0; y < 256; y++)
      for (let x = 0; x < 64; x++) {
        const k = Math.sin((x / 63) * Math.PI);
        h.data[(y * 64 + x) * 4 + 3] *= k * k;
      }
    g.putImageData(h, 0, 0);
    return new THREE.CanvasTexture(c);
  });
}

export function backdropTexture() {
  return memo("backdrop", () => {
    const [c, g] = canvas(256, 256);
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, "#0a1a5c");
    grd.addColorStop(0.5, "#06103a");
    grd.addColorStop(1, "#030720");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}
