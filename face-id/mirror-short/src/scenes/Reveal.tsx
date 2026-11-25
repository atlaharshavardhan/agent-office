import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { UNLOCK_AT } from '../script';
import { FONT, ramp } from '../theme';
import { Phone3D, usePhoneModel } from './Phone3D';

// The reveal, on the 3D iPhone Pro Max (the same model as the dots clip), facing us in the amber bathroom: Face ID scans in
// the Dynamic Island, a green tick lands, and the lock screen gives way to a dark-mode home screen with its apps.
// A recreation of Harsh's own result (it unlocked for him), not test footage. Then the question goes to the viewer.
const PX = 1920 / (2 * 927 * Math.tan((15 * Math.PI) / 180));          // screen px per scene unit at the phone
const ISL = { x: 540, y: 960 - 150 * PX, w: 46 * PX, h: 13.3 * PX };
const io = (x: number) => x * x * (3 - 2 * x), out3 = (x: number) => 1 - Math.pow(1 - x, 3);

const Stage: React.FC<{ phone: THREE.Object3D }> = ({ phone }) => {
  const gl = useThree((x) => x.gl), scene = useThree((x) => x.scene), advance = useThree((x) => x.advance);
  useEffect(() => { advance(performance.now()); });                       // the canvas draws on demand
  useEffect(() => { const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.7; return () => pm.dispose(); }, [gl, scene]);
  return (<><ambientLight intensity={0.6} /><directionalLight position={[300, 500, 900]} intensity={2} /><pointLight position={[-500, 300, 500]} intensity={3} color="#ffb060" decay={0} /><Phone3D model={phone} /></>);
};
export const Layer: React.FC<{ phone: THREE.Object3D | null; o?: number }> = ({ phone, o = 1 }) => (
  <AbsoluteFill style={{ opacity: o }}>
    <ThreeCanvas width={1080} height={1920} flat gl={{ antialias: true, alpha: true }} camera={{ fov: 30, near: 10, far: 4000, position: [0, 0, 927] }}>
      {phone && <Stage phone={phone} />}
    </ThreeCanvas>
  </AbsoluteFill>
);

// Outro: from the mirror we rush into the phone in the reflection and stay close on its Dynamic Island while Face ID works,
// as on a real iPhone: SCANNING (the face glyph) -> PROCESSING (a spinning ring) -> UNLOCKED (a green tick in a ring).
// The camera punches in a little more just before it unlocks, then zooms out fast as the home screen and its apps zoom in.
export const Reveal: React.FC = () => {
  const fr = useCurrentFrame(), U = UNLOCK_AT, P = Math.round(U - 14);          // P: scanning gives way to processing
  const lock = usePhoneModel(true), homeM = usePhoneModel('home'), o3 = out3;
  const mz = ramp(fr, 0, 15, 0, 1, (x) => x * x * x), mo = 1 - ramp(fr, 10, 16);      // the mirror shot: rush into the reflected phone, then give way to it
  // close-up on the island: in with the rush, a slow push while scanning, a quick punch-in on processing, then a fast pull-out on unlock
  const k = ramp(fr, 8, 16, 0, 1, o3) * (1 - ramp(fr, U + 3, U + 11, 0, 1, o3));
  const Z = 1 + k * (2.3 + 0.25 * ramp(fr, 16, P) + 0.35 * ramp(fr, P, P + 4, 0, 1, o3));
  const cam = { transformOrigin: `${ISL.x}px ${ISL.y}px`, transform: `translate(${(540 - ISL.x) * k}px, ${(600 - ISL.y) * k}px) scale(${Z})` };
  const e = ramp(fr, 14, 20, 0, 1, o3) * (1 - ramp(fr, U + 10, U + 16, 0, 1, io)), bh = ISL.h + (ISL.w * 0.94 - ISL.h) * e, top = ISL.y + ISL.h / 2 + 10;      // the Face ID box sits just below the Dynamic Island, not touching it
  const scanO = 1 - ramp(fr, P - 2, P + 2), procO = ramp(fr, P - 2, P + 2) * (1 - ramp(fr, U - 2, U + 1)), okO = ramp(fr, U - 1, U + 2), tick = ramp(fr, U, U + 7, 0, 1, o3);
  const home = ramp(fr, U + 4, U + 13, 0, 1, io), apps = 1.18 - 0.18 * ramp(fr, U + 4, U + 16, 0, 1, o3), ask = ramp(fr, U + 34, U + 42, 0, 1, out3);
  const look = Math.sin(fr / 3.2) * 4;                                           // the face glyph's eyes and nose glance side to side while scanning
  return (
    <AbsoluteFill style={{ backgroundColor: '#120d0a', overflow: 'hidden' }}>
      <Img src={staticFile('bathroom_rear.png')} style={{ position: 'absolute', left: -220, top: -120, width: 1520, height: 2700, filter: 'blur(22px) brightness(0.42)' }} />
      <div style={{ position: 'absolute', inset: 0, ...cam }}>
        <div style={{ position: 'absolute', inset: 0, opacity: (1 - mo) * (1 - home) }}><Layer phone={lock} /></div>
        {home > 0 && <div style={{ position: 'absolute', inset: 0, transformOrigin: '540px 960px', transform: `scale(${apps})` }}><Layer phone={homeM} o={home} /></div>}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <rect x={ISL.x - ISL.w / 2} y={top} width={ISL.w} height={bh} rx={ISL.h / 2 + (ISL.w * 0.24 - ISL.h / 2) * e} fill="#030303" opacity={e} />
          <g transform={`translate(${ISL.x} ${top + bh / 2}) scale(${(ISL.w / 215) * e})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* 1 · scanning: the Face ID glyph */}
            <g opacity={scanO} stroke="#fff" strokeWidth={7} transform={`scale(${1 + 0.04 * Math.sin(fr / 2)})`}>
              <path d="M -46 -22 V -34 a 12 12 0 0 1 12 -12 H -22 M 22 -46 H 34 a 12 12 0 0 1 12 12 V -22 M 46 22 V 34 a 12 12 0 0 1 -12 12 H 22 M -22 46 H -34 a 12 12 0 0 1 -12 -12 V 22" />
              <g transform={`translate(${look} 0)`}><path d="M -18 -16 V -6 M 18 -16 V -6 M 2 -16 V 6 H -5 M -16 20 Q 0 32 16 20" /></g>
            </g>
            {/* 2 · processing: a ring with a bar that spins */}
            <g opacity={procO} stroke="#fff" strokeWidth={7} transform={`scale(${0.85 + 0.15 * ramp(fr, P - 2, P + 4, 0, 1, o3)})`}>
              <circle r={44} strokeOpacity={0.35} />
              <path d="M 0 -44 A 44 44 0 0 1 44 0" />
              <line x1={-24} y1={30} x2={24} y2={-30} transform={`rotate(${(fr - P) * 22})`} />
            </g>
            {/* 3 · unlocked: a green ring and a tick that draws itself */}
            <g opacity={okO} stroke="#3ddc84" transform={`scale(${1.25 - 0.25 * ramp(fr, U - 1, U + 6, 0, 1, o3)})`}>
              <circle r={44} strokeWidth={7} strokeDasharray={277} strokeDashoffset={277 * (1 - ramp(fr, U - 1, U + 5, 0, 1, o3))} transform="rotate(-90)" />
              <path d="M -20 2 L -6 16 L 22 -14" strokeWidth={9} strokeDasharray={60} strokeDashoffset={60 * (1 - tick)} />
            </g>
          </g>
        </svg>
      </div>
      {mo > 0 && <AbsoluteFill style={{ opacity: mo, transformOrigin: '771px 618px', transform: `translate(${(540 - 771) * mz}px, ${(960 - 618) * mz}px) scale(${1 + 6.2 * mz})` }}><Img src={staticFile('hook_first.png')} style={{ width: 1080, height: 1920 }} /></AbsoluteFill>}
      {/* state name under the close-up, like the reference: SCANNING / PROCESSING / UNLOCKED */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1430, textAlign: 'center', opacity: ramp(fr, 16, 20) * (1 - ramp(fr, U + 4, U + 8)), font: `800 46px/1 ${FONT}`, letterSpacing: '0.16em', color: fr >= U ? '#3ddc84' : '#fff' }}>
        {fr >= U ? 'UNLOCKED' : fr >= P ? 'PROCESSING' : 'SCANNING'}
      </div>
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: 0.25 * ramp(fr, U + 2, U + 4) * (1 - ramp(fr, U + 4, U + 11)) }} />
      {/* the result, then the question for the viewer */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1690, textAlign: 'center', opacity: ramp(fr, U + 12, U + 18) * (1 - ask), transform: `scale(${1.2 - 0.2 * ramp(fr, U + 12, U + 20, 0, 1, out3)})` }}>
        <span style={{ display: 'inline-block', padding: '16px 30px', borderRadius: 16, background: 'rgba(8,10,8,.85)', border: '3px solid #3ddc84', font: `800 54px/1 ${FONT}`, letterSpacing: '0.06em', color: '#3ddc84' }}>UNLOCKED</span>
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 1660, textAlign: 'center', opacity: ask, transform: `translateY(${20 * (1 - ask)}px)` }}>
        <span style={{ display: 'inline-block', padding: '20px 30px', borderRadius: 18, background: '#0a0810', border: '3px solid #fff', font: `800 46px/1.2 ${FONT}`, color: '#fff' }}>Did yours unlock?<br /><span style={{ color: '#ffd60a' }}>Comment YES or NO</span></span>
      </div>
    </AbsoluteFill>
  );
};

// The lock-screen phone alone on a transparent frame, placed where the phone sits in his hand in the hook's last frame.
// tools/hand_phone3d.py lays it over that frame (under his fingers) to make public/hook_last3d.png.
export const PhoneStill: React.FC = () => { const lock = usePhoneModel(true);
  return <AbsoluteFill><div style={{ position: 'absolute', inset: 0, transformOrigin: '540px 960px', transform: 'translate(-2px, -40px) scale(1.118)' }}><Layer phone={lock} /></div></AbsoluteFill>; };
