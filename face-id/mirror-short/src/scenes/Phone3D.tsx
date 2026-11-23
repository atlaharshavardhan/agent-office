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
export const usePhoneModel = () => {
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const [h] = useState(() => delayRender('iphone.glb'));
  useEffect(() => {
    new GLTFLoader().load(staticFile('models/iphone.glb'), (gltf) => {
      const tex = screenTexture();
      gltf.scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh && mesh.name.indexOf('front-glass') === 0) {
          // the display is one flat plane: give it planar UVs and our lit screen
          const geo = mesh.geometry; geo.computeBoundingBox();
          const b = geo.boundingBox!, pos = geo.attributes.position, uv = new Float32Array(pos.count * 2);
          for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) - b.min.x) / (b.max.x - b.min.x); uv[i * 2 + 1] = (pos.getY(i) - b.min.y) / (b.max.y - b.min.y); }
          geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
          mesh.material = new THREE.MeshBasicMaterial({ map: tex });
        }
      });
      setModel(gltf.scene); continueRender(h);
    });
  }, [h]);
  return model;
};

export const Phone3D: React.FC<{ model: THREE.Object3D }> = ({ model }) => <primitive object={model} scale={S} position={[0, -0.075 * S, 0]} />;
