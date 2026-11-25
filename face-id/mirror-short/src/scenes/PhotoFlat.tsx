import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Phone3D, usePhoneModel } from './Phone3D';
import { C, FONT, ramp } from '../theme';

// "A photo won't work": a printed photo of his face is held up to the phone. The dots land on it as a perfectly neat grid,
// because paper is flat, so there is nothing to bend them. t = frames from the cut.
const out3 = (x: number) => 1 - Math.pow(1 - x, 3);
const PW = 560, PH = 700, IW = 480, IH = 520;                // print and the picture inside it
const DOTS: number[][] = [];
for (let y = 18; y < IH - 8; y += 21) for (let x = 16; x < IW - 8; x += 21) DOTS.push([x, y]);

const PhoneAbove: React.FC<{ phone: THREE.Object3D }> = ({ phone }) => {
  const gl = useThree((x) => x.gl), scene = useThree((x) => x.scene), advance = useThree((x) => x.advance);
  useEffect(() => { advance(performance.now()); });                       // the canvas draws on demand
  useEffect(() => { const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.6; return () => pm.dispose(); }, [gl, scene]);
  return (
    <>
      <ambientLight intensity={0.6} /><directionalLight position={[300, 500, 900]} intensity={2} />
      <group position={[0, -18, 0]} rotation={[0.3, 0, Math.PI]}><Phone3D model={phone} /></group>
    </>
  );
};

export const PhotoFlat: React.FC<{ t: number }> = ({ t }) => {
  const phone = usePhoneModel(true);
  const a = ramp(t, 0, 10, 0, 1, out3), fire = ramp(t, 10, 16), no = ramp(t, 44, 50, 0, 1, out3);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(80% 50% at 50% 48%, #2a1f52 0%, #141026 55%, #0a0812 100%)', overflow: 'hidden' }}>
      {/* the phone (the same 3D iPhone Pro Max as the dots clip), held above the photo and pointed down at it */}
      <div style={{ position: 'absolute', left: 0, top: 300, width: 1080, height: 560, opacity: a, transform: `translateY(${-40 * (1 - a)}px)` }}>
        <ThreeCanvas width={1080} height={560} flat gl={{ antialias: true, alpha: true }} camera={{ fov: 30, near: 10, far: 4000, position: [0, 0, 929] }}>
          {phone && <PhoneAbove phone={phone} />}
        </ThreeCanvas>
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d="M 553 770 L 250 900 H 830 Z" fill={C.ir} opacity={0.16 * fire} /><circle cx={553} cy={768} r={9} fill={C.ir} opacity={fire} /><circle cx={553} cy={768} r={3.5} fill="#fff" opacity={fire} />
      </svg>
      {/* the print */}
      <div style={{ position: 'absolute', left: 540 - PW / 2, top: 800, width: PW, height: PH, borderRadius: 10, background: 'linear-gradient(135deg, #f4f1ea, #cfcac0)', boxShadow: '0 30px 80px rgba(0,0,0,.6)', transform: `translateY(${60 * (1 - a)}px) rotate(${-4 + 1.2 * Math.sin(t / 16)}deg)`, opacity: a }}>
        <div style={{ position: 'absolute', left: (PW - IW) / 2, top: 40, width: IW, height: IH, overflow: 'hidden', background: '#2a2018' }}>
          <Img src={staticFile('face_front.png')} style={{ position: 'absolute', left: -150, top: -235, width: 780, height: 1394 }} />
          <svg width={IW} height={IH} style={{ position: 'absolute', inset: 0 }}>
            {DOTS.map(([x, y], i) => { const o = ramp(t, 12 + (y / IH) * 12, 16 + (y / IH) * 12); return o > 0 ? <circle key={i} cx={x} cy={y} r={4.4} fill={C.ir} opacity={0.85 * o} /> : null; })}
          </svg>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', font: `800 34px/1 ${FONT}`, letterSpacing: '0.16em', color: '#5d574d' }}>PHOTO</div>
      </div>
      {/* read-out: no depth */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1545, textAlign: 'center', opacity: ramp(t, 24, 30) }}>
        <div style={{ font: `800 44px/1 ${FONT}`, letterSpacing: '0.16em', color: '#e9e2ff' }}>DEPTH: FLAT</div>
        <div style={{ margin: '22px auto 0', width: 720 * ramp(t, 26, 40, 0, 1, out3), height: 6, borderRadius: 3, background: '#7fb6ff' }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1650, textAlign: 'center', opacity: no, transform: `scale(${1.2 - 0.2 * no})`, font: `800 54px/1 ${FONT}`, color: '#ff2d46' }}>✕ NOT A REAL FACE</div>
    </AbsoluteFill>
  );
};
