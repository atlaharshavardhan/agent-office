import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Real GLTF iPhone Pro Max model (public/models/iphone.glb, from the HyperFrames registry block
// "vfx-iphone-device": titanium body, buttons, camera plateau, lenses, Apple logo). The model is in
// metres with its origin at the bottom centre; we scale it so the phone is 338 scene units tall.
const S = 338 / 0.15;
export const P3 = { w: 162, h: 338, d: 28.4 };          // d/2 = front glass plane
export const ISLAND_Y = 150;                             // Dynamic Island height above the phone's centre

// A lock screen (time, date, closed padlock, flashlight and camera buttons). The padlock stays closed.
const lockTexture = () => {
  const W = 707, H = 1488, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#050505'; g.fillRect(0, 0, W, H);
  const m = 17;
  g.save(); g.beginPath(); g.roundRect(m, m, W - 2 * m, H - 2 * m, 92); g.clip();
  const bg = g.createLinearGradient(0, 0, W * 0.6, H); bg.addColorStop(0, '#1a1430'); bg.addColorStop(0.45, '#4a2f5e'); bg.addColorStop(0.8, '#b0603a'); bg.addColorStop(1, '#2a1612');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W * 0.5, H * 0.72, 20, W * 0.5, H * 0.72, W * 0.9);
  glow.addColorStop(0, 'rgba(255,190,120,.55)'); glow.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
  g.fillStyle = '#030303'; g.beginPath(); g.roundRect(W / 2 - 100, 48, 200, 58, 29); g.fill();   // Dynamic Island
  g.fillStyle = '#141a2a'; g.beginPath(); g.arc(W / 2 + 66, 77, 13, 0, 7); g.fill();
  // closed padlock
  g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineWidth = 7; g.lineCap = 'round';
  g.beginPath(); g.roundRect(W / 2 - 22, 176, 44, 36, 8); g.fill();
  g.beginPath(); g.arc(W / 2, 176, 14, Math.PI, 0); g.stroke();
  g.textAlign = 'center';
  g.font = '600 40px Inter, system-ui, sans-serif'; g.fillStyle = 'rgba(255,255,255,.92)'; g.fillText('Tue, Sep 9', W / 2, 410);
  g.font = '800 190px Inter, system-ui, sans-serif'; g.fillStyle = '#fff'; g.fillText('9:41', W / 2, 590);
  for (const x of [112, W - 112]) { g.fillStyle = 'rgba(40,36,48,.72)'; g.beginPath(); g.arc(x, H - 150, 50, 0, 7); g.fill(); }
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect(100, H - 172, 24, 46, 6); g.fill(); g.beginPath(); g.roundRect(94, H - 180, 36, 14, 4); g.fill();   // flashlight
  g.beginPath(); g.roundRect(W - 138, H - 166, 52, 36, 8); g.fill(); g.fillStyle = 'rgba(40,36,48,.9)'; g.beginPath(); g.arc(W - 112, H - 148, 10, 0, 7); g.fill();   // camera
  g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.roundRect(W / 2 - 115, H - 44, 230, 9, 4.5); g.fill();
  g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};

// Home screen in dark mode: a near-black wallpaper, dark app tiles with coloured glyphs and labels, a dock.
// The glyphs are plain shapes (bubble, camera, envelope ...), not copies of any real app icon.
const homeTexture = () => {
  const W = 707, H = 1488, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#050505'; g.fillRect(0, 0, W, H);
  const m = 17;
  g.save(); g.beginPath(); g.roundRect(m, m, W - 2 * m, H - 2 * m, 92); g.clip();
  const bg = g.createLinearGradient(0, 0, W * 0.5, H); bg.addColorStop(0, '#0b0b12'); bg.addColorStop(0.55, '#15121f'); bg.addColorStop(1, '#07070a');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W * 0.5, H * 0.42, 20, W * 0.5, H * 0.42, W * 0.9);
  glow.addColorStop(0, 'rgba(90,70,160,.28)'); glow.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
  g.fillStyle = '#030303'; g.beginPath(); g.roundRect(W / 2 - 100, 48, 200, 58, 29); g.fill();   // Dynamic Island
  g.fillStyle = '#fff'; g.font = '700 30px Inter, system-ui, sans-serif'; g.textAlign = 'left'; g.fillText('9:41', 70, 90);
  for (let i = 0; i < 4; i++) g.fillRect(W - 150 + i * 9, 86 - (i + 1) * 5, 6, (i + 1) * 5);           // signal
  g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.beginPath(); g.roundRect(W - 100, 66, 44, 22, 6); g.stroke(); g.fillRect(W - 96, 70, 30, 14);
  const S = 118, GX = (W - 2 * 46 - 4 * S) / 3, tile = (x: number, y: number) => {
    const t = g.createLinearGradient(0, y, 0, y + S); t.addColorStop(0, '#2c2c30'); t.addColorStop(1, '#161618');
    g.fillStyle = t; g.beginPath(); g.roundRect(x, y, S, S, 28); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 1.5; g.beginPath(); g.roundRect(x + 0.75, y + 0.75, S - 1.5, S - 1.5, 28); g.stroke();
  };
  const G: [string, string, (x: number, y: number) => void][] = [
    ['Messages', '#34d058', (x, y) => { g.beginPath(); g.roundRect(x - 34, y - 28, 68, 48, 22); g.fill(); g.beginPath(); g.moveTo(x - 20, y + 14); g.lineTo(x - 30, y + 34); g.lineTo(x - 4, y + 18); g.fill(); }],
    ['Camera', '#d0d0d6', (x, y) => { g.beginPath(); g.roundRect(x - 36, y - 22, 72, 50, 10); g.fill(); g.fillRect(x - 14, y - 32, 28, 12); g.fillStyle = '#1c1c1e'; g.beginPath(); g.arc(x, y + 3, 15, 0, 7); g.fill(); }],
    ['Mail', '#3b9cff', (x, y) => { g.beginPath(); g.roundRect(x - 36, y - 24, 72, 48, 8); g.fill(); g.strokeStyle = '#1c1c1e'; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 32, y - 20); g.lineTo(x, y + 4); g.lineTo(x + 32, y - 20); g.stroke(); }],
    ['Clock', '#f2f2f7', (x, y) => { g.beginPath(); g.arc(x, y, 34, 0, 7); g.fill(); g.strokeStyle = '#1c1c1e'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 22); g.moveTo(x, y); g.lineTo(x + 15, y + 8); g.stroke(); }],
    ['Music', '#ff5a6e', (x, y) => { g.beginPath(); g.ellipse(x - 14, y + 20, 13, 10, -0.3, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + 20, y + 12, 13, 10, -0.3, 0, 7); g.fill(); g.fillRect(x - 4, y - 28, 6, 48); g.fillRect(x + 30, y - 34, 6, 46); g.beginPath(); g.moveTo(x - 4, y - 28); g.lineTo(x + 36, y - 36); g.lineTo(x + 36, y - 22); g.lineTo(x - 4, y - 14); g.fill(); }],
    ['Maps', '#4cd964', (x, y) => { g.beginPath(); g.arc(x, y - 8, 22, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - 17, y + 4); g.lineTo(x, y + 36); g.lineTo(x + 17, y + 4); g.fill(); g.fillStyle = '#1c1c1e'; g.beginPath(); g.arc(x, y - 8, 9, 0, 7); g.fill(); }],
    ['Notes', '#ffd60a', (x, y) => { g.beginPath(); g.roundRect(x - 30, y - 34, 60, 68, 8); g.fill(); g.fillStyle = '#1c1c1e'; for (const o of [-14, 2, 18]) g.fillRect(x - 20, y + o, 40, 5); }],
    ['Weather', '#64d2ff', (x, y) => { g.beginPath(); g.arc(x - 12, y - 10, 18, 0, 7); g.fill(); g.fillStyle = '#f2f2f7'; g.beginPath(); g.arc(x - 6, y + 14, 16, 0, 7); g.arc(x + 14, y + 8, 20, 0, 7); g.arc(x + 28, y + 18, 12, 0, 7); g.fill(); }],
    ['Photos', '#ff9f0a', (x, y) => { const cs = ['#ff9f0a', '#ffd60a', '#34d058', '#64d2ff', '#5e5ce6', '#ff5a6e']; cs.forEach((c2, i) => { const a = (i / 6) * Math.PI * 2; g.fillStyle = c2; g.beginPath(); g.ellipse(x + Math.cos(a) * 18, y + Math.sin(a) * 18, 17, 11, a, 0, 7); g.fill(); }); }],
    ['Wallet', '#f2f2f7', (x, y) => { ['#ff5a6e', '#ffd60a', '#34d058'].forEach((c2, i) => { g.fillStyle = c2; g.beginPath(); g.roundRect(x - 34, y - 30 + i * 12, 68, 30, 7); g.fill(); }); g.fillStyle = '#d0d0d6'; g.beginPath(); g.roundRect(x - 34, y + 4, 68, 30, 7); g.fill(); }],
    ['Health', '#ff375f', (x, y) => { g.beginPath(); g.moveTo(x, y + 30); g.bezierCurveTo(x - 52, y - 4, x - 26, y - 44, x, y - 16); g.bezierCurveTo(x + 26, y - 44, x + 52, y - 4, x, y + 30); g.fill(); }],
    ['Settings', '#a8a8b0', (x, y) => { for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.beginPath(); g.arc(x + Math.cos(a) * 30, y + Math.sin(a) * 30, 8, 0, 7); g.fill(); } g.beginPath(); g.arc(x, y, 28, 0, 7); g.fill(); g.fillStyle = '#1c1c1e'; g.beginPath(); g.arc(x, y, 11, 0, 7); g.fill(); }],
    ['Calendar', '#ff453a', (x, y) => { g.font = '800 62px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#f2f2f7'; g.fillText('9', x, y + 30); g.font = '800 20px Inter, system-ui, sans-serif'; g.fillStyle = '#ff453a'; g.fillText('TUE', x, y - 26); }],
    ['Videos', '#bf5af2', (x, y) => { g.beginPath(); g.moveTo(x - 20, y - 30); g.lineTo(x + 30, y); g.lineTo(x - 20, y + 30); g.fill(); }],
    ['Files', '#3b9cff', (x, y) => { g.beginPath(); g.roundRect(x - 36, y - 18, 72, 48, 8); g.fill(); g.beginPath(); g.roundRect(x - 36, y - 30, 34, 20, 6); g.fill(); }],
    ['Calculator', '#ff9f0a', (x, y) => { for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { g.fillStyle = b === 2 ? '#ff9f0a' : '#d0d0d6'; g.beginPath(); g.arc(x - 24 + b * 24, y - 24 + a * 24, 9, 0, 7); g.fill(); } }],
    ['Reminders', '#f2f2f7', (x, y) => { ['#ff453a', '#ff9f0a', '#3b9cff'].forEach((c2, i) => { g.fillStyle = c2; g.beginPath(); g.arc(x - 26, y - 22 + i * 22, 7, 0, 7); g.fill(); g.fillStyle = '#d0d0d6'; g.fillRect(x - 10, y - 25 + i * 22, 42, 6); }); }],
    ['Stocks', '#34d058', (x, y) => { g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x - 34, y + 20); g.lineTo(x - 14, y - 2); g.lineTo(x + 2, y + 10); g.lineTo(x + 32, y - 24); g.stroke(); }],
    ['Books', '#ff9f0a', (x, y) => { g.beginPath(); g.moveTo(x - 2, y - 22); g.quadraticCurveTo(x - 20, y - 34, x - 38, y - 24); g.lineTo(x - 38, y + 24); g.quadraticCurveTo(x - 20, y + 14, x - 2, y + 28); g.fill(); g.beginPath(); g.moveTo(x + 2, y - 22); g.quadraticCurveTo(x + 20, y - 34, x + 38, y - 24); g.lineTo(x + 38, y + 24); g.quadraticCurveTo(x + 20, y + 14, x + 2, y + 28); g.fill(); }],
    ['Fitness', '#ff375f', (x, y) => { g.lineWidth = 9; g.lineCap = 'round'; [['#ff375f', 34], ['#a4ff3c', 22], ['#3be8ff', 10]].forEach(([c2, r]) => { g.strokeStyle = c2 as string; g.beginPath(); g.arc(x, y, r as number, -1.57, 3.4); g.stroke(); }); }],
  ];
  const draw = (k: number, x: number, y: number, label: boolean) => { const [name, col, fn] = G[k % G.length]; tile(x, y); g.fillStyle = col; g.strokeStyle = col; fn(x + S / 2, y + S / 2);
    if (label) { g.fillStyle = 'rgba(255,255,255,.92)'; g.font = '600 21px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText(name, x + S / 2, y + S + 30); } };
  const GRID = [3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];                       // everything that is not in the dock
  GRID.forEach((k, i) => draw(k, 46 + (i % 4) * (S + GX), 170 + Math.floor(i / 4) * (S + 62), true));
  g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.roundRect(W / 2 - 78, H - 250, 156, 44, 22); g.fill();
  g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '600 21px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText('Search', W / 2, H - 221);
  g.fillStyle = 'rgba(255,255,255,.10)'; g.beginPath(); g.roundRect(30, H - 188, W - 60, 158, 52); g.fill();
  [0, 2, 4, 1].forEach((k, q) => draw(k, 46 + q * (S + GX), H - 168, false));
  g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};

const screenTexture = () => {
  const W = 707, H = 1488, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#050505'; g.fillRect(0, 0, W, H);                        // black glass + bezel
  const m = 17;
  g.save(); g.beginPath(); g.roundRect(m, m, W - 2 * m, H - 2 * m, 92); g.clip();
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#2b2350'); bg.addColorStop(0.5, '#6a549c'); bg.addColorStop(1, '#2a2148');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, W * 0.85);
  glow.addColorStop(0, 'rgba(255,214,170,.75)'); glow.addColorStop(0.45, 'rgba(206,150,190,.35)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = glow; g.fillRect(0, 0, W, H);
  g.fillStyle = '#030303'; g.beginPath(); g.roundRect(W / 2 - 100, 48, 200, 58, 29); g.fill();   // Dynamic Island
  g.fillStyle = '#141a2a'; g.beginPath(); g.arc(W / 2 + 66, 77, 13, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.roundRect(W / 2 - 115, H - 44, 230, 9, 4.5); g.fill();
  g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};

// Load outside the canvas (like the textures) so the first drawn frame already has the phone.
export const usePhoneModel = (lock: boolean | 'home' = false) => {
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const [h] = useState(() => delayRender('iphone.glb'));
  useEffect(() => {
    new GLTFLoader().load(staticFile('models/iphone.glb'), (gltf) => {
      const tex = lock === 'home' ? homeTexture() : lock ? lockTexture() : screenTexture();
      gltf.scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh && mesh.name.indexOf('front-glass') === 0) {
          // the display is one flat plane: give it planar UVs and our lit screen
          const geo = mesh.geometry; geo.computeBoundingBox();
          const b = geo.boundingBox!, pos = geo.attributes.position, uv = new Float32Array(pos.count * 2);
          for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) - b.min.x) / (b.max.x - b.min.x); uv[i * 2 + 1] = (pos.getY(i) - b.min.y) / (b.max.y - b.min.y); }
          geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
          mesh.material = new THREE.MeshBasicMaterial({ map: tex });
          gltf.scene.userData.screen = mesh.material;      // so a scene can dim / wake the display
        }
      });
      setModel(gltf.scene); continueRender(h);
    });
  }, [h]);
  return model;
};

export const Phone3D: React.FC<{ model: THREE.Object3D }> = ({ model }) => <primitive object={model} scale={S} position={[0, -0.075 * S, 0]} />;
