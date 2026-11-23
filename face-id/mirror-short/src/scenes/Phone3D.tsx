import { useMemo } from 'react';
import * as THREE from 'three';

// iPhone 17 Pro Max modelled to its real proportions (163.4 x 78.0 x 8.75 mm; 1 unit = 0.4833 mm,
// so it is 162 x 338 x 18 units): titanium frame with rounded corners, black glass front with thin
// even bezels, rounded display with the Dynamic Island, side buttons, and the full-width camera
// plateau with three lenses on the back.
export const P3 = { w: 162, h: 338, d: 18, r: 27 };
export const ISLAND_Y = 146;

const rr = (w: number, h: number, r: number) => {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

const screenTexture = () => {
  const W = 600, H = 1304, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  const R = 84, path = () => { g.beginPath(); g.roundRect(0, 0, W, H, R); };
  path(); g.clip();
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#2b2350'); bg.addColorStop(0.5, '#6a549c'); bg.addColorStop(1, '#2a2148');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W * 0.5, H * 0.5, 20, W * 0.5, H * 0.5, W * 0.85);
  glow.addColorStop(0, 'rgba(255,214,170,.75)'); glow.addColorStop(0.45, 'rgba(206,150,190,.35)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = glow; g.fillRect(0, 0, W, H);
  // Dynamic Island
  g.fillStyle = '#030303'; g.beginPath(); g.roundRect(W / 2 - 92, 40, 184, 54, 27); g.fill();
  g.fillStyle = '#141a2a'; g.beginPath(); g.arc(W / 2 + 60, 67, 12, 0, 7); g.fill();
  // home indicator
  g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.roundRect(W / 2 - 105, H - 30, 210, 8, 4); g.fill();
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t;
};

export const Phone3D: React.FC<{ glow?: number }> = ({ glow = 1 }) => {
  const m = useMemo(() => {
    const body = new THREE.ExtrudeGeometry(rr(P3.w, P3.h, P3.r), { depth: P3.d - 5, bevelEnabled: true, bevelThickness: 2.5, bevelSize: 2.5, bevelSegments: 5, curveSegments: 20 });
    body.translate(0, 0, -(P3.d - 5) / 2);
    return {
      body,
      glass: new THREE.ShapeGeometry(rr(P3.w - 2, P3.h - 2, P3.r - 1), 20),
      back: new THREE.ShapeGeometry(rr(P3.w - 3, P3.h - 3, P3.r - 1), 20),
      plateau: new THREE.ExtrudeGeometry(rr(P3.w - 14, 78, 22), { depth: 4, bevelEnabled: true, bevelThickness: 1, bevelSize: 1, bevelSegments: 3 }),
      tex: screenTexture(),
    };
  }, []);
  const ti = { color: '#8f8a84', metalness: 0.85, roughness: 0.32 };
  const z = P3.d / 2;
  return (
    <group>
      <mesh geometry={m.body}><meshStandardMaterial {...ti} /></mesh>
      {/* front: black glass, then the lit display */}
      <mesh geometry={m.glass} position={[0, 0, z + 0.3]}><meshBasicMaterial color="#060606" /></mesh>
      <mesh position={[0, 0, z + 0.6]}><planeGeometry args={[P3.w - 9, P3.h - 9]} /><meshBasicMaterial map={m.tex} transparent color={new THREE.Color(glow, glow, glow)} /></mesh>
      {/* back: frosted glass, camera plateau, three lenses, flash */}
      <mesh geometry={m.back} position={[0, 0, -z - 0.3]} rotation={[0, Math.PI, 0]}><meshStandardMaterial color="#77726d" metalness={0.5} roughness={0.55} /></mesh>
      <mesh geometry={m.plateau} position={[0, 118, -z - 0.3]} rotation={[0, Math.PI, 0]}><meshStandardMaterial {...ti} color="#6f6a65" /></mesh>
      {[[38, 132], [38, 104], [14, 118]].map(([x, y], i) => (
        <group key={i} position={[x, y, -z - 5.6]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh><cylinderGeometry args={[12, 12, 3, 28]} /><meshStandardMaterial color="#3b3836" metalness={0.9} roughness={0.25} /></mesh>
          <mesh position={[0, -1.7, 0]}><cylinderGeometry args={[8, 8, 0.6, 24]} /><meshBasicMaterial color="#0a0c14" /></mesh>
        </group>
      ))}
      <mesh position={[-40, 132, -z - 5]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[5, 5, 1, 16]} /><meshBasicMaterial color="#e8e2c8" /></mesh>
      {/* side buttons: action + volume on the left (seen from the front), power + camera control on the right */}
      {[[-1, 96, 16], [-1, 64, 26], [-1, 30, 26], [1, 56, 44], [1, -44, 30]].map(([sx, y, h], i) => (
        <mesh key={i} position={[sx * (P3.w / 2 + 2.4), y, 0]}><boxGeometry args={[2.2, h, 5]} /><meshStandardMaterial {...ti} color="#7b7671" /></mesh>
      ))}
    </group>
  );
};
