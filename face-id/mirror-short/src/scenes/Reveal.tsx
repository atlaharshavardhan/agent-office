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

export const Reveal: React.FC = () => {
  const fr = useCurrentFrame(), U = UNLOCK_AT;
  const lock = usePhoneModel(true), homeM = usePhoneModel('home');
  const s = 0.9 + 0.06 * ramp(fr, 0, 14, 0, 1, out3) + 0.04 * (fr / 150) + 0.05 * ramp(fr, U, U + 8, 0, 1, out3);
  const mz = ramp(fr, 0, 15, 0, 1, (x) => x * x * x), mo = 1 - ramp(fr, 10, 16);      // the mirror shot: rush into the reflected phone, then give way to it
  const e = ramp(fr, 15, 23, 0, 1, io) * (1 - ramp(fr, U + 6, U + 16, 0, 1, io)), bh = ISL.h + (ISL.w * 0.94 - ISL.h) * e, top = ISL.y - ISL.h / 2;
  const open = ramp(fr, U, U + 6, 0, 1, out3), home = ramp(fr, U + 8, U + 20, 0, 1, io), ask = ramp(fr, U + 34, U + 42, 0, 1, out3);
  return (
    <AbsoluteFill style={{ backgroundColor: '#120d0a', overflow: 'hidden' }}>
      <Img src={staticFile('bathroom_rear.png')} style={{ position: 'absolute', left: -220, top: -120, width: 1520, height: 2700, filter: 'blur(22px) brightness(0.42)' }} />
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '540px 960px', transform: `scale(${s})` }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - mo }}><Layer phone={lock} /></div>
        {home > 0 && <Layer phone={homeM} o={home} />}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          {/* Face ID in the island: scanning, then a green tick */}
          <rect x={ISL.x - ISL.w / 2} y={top} width={ISL.w} height={bh} rx={ISL.h / 2 + (ISL.w * 0.24 - ISL.h / 2) * e} fill="#030303" opacity={e > 0 ? 1 : 0} />
          <g transform={`translate(${ISL.x} ${top + bh / 2}) scale(${(ISL.w / 215) * e})`} fill="none" strokeLinecap="round" opacity={e}>
            <g stroke={open > 0.5 ? '#3ddc84' : '#fff'} strokeWidth={7}>
              <path d="M -46 -22 V -34 a 12 12 0 0 1 12 -12 H -22 M 22 -46 H 34 a 12 12 0 0 1 12 12 V -22 M 46 22 V 34 a 12 12 0 0 1 -12 12 H 22 M -22 46 H -34 a 12 12 0 0 1 -12 -12 V 22" />
              {open > 0.5 ? <path d="M -22 2 L -6 18 L 24 -16" strokeWidth={10} strokeLinejoin="round" /> : <path d="M -18 -16 V -6 M 18 -16 V -6 M 2 -16 V 6 H -5 M -16 20 Q 0 32 16 20" />}
            </g>
            {open < 0.5 && <path d="M 0 -76 A 76 76 0 0 1 76 0" stroke="#fff" strokeWidth={6} transform={`rotate(${(fr * 14) % 360})`} />}
          </g>
        </svg>
      </div>
      {mo > 0 && <AbsoluteFill style={{ opacity: mo, transformOrigin: '771px 618px', transform: `translate(${(540 - 771) * mz}px, ${(960 - 618) * mz}px) scale(${1 + 6.2 * mz})` }}><Img src={staticFile('hook_first.png')} style={{ width: 1080, height: 1920 }} /></AbsoluteFill>}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: 0.2 * ramp(fr, U, U + 2) * (1 - ramp(fr, U + 2, U + 10)) }} />
      {/* the result, then the question for the viewer */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1690, textAlign: 'center', opacity: ramp(fr, U + 10, U + 16) * (1 - ask), transform: `scale(${1.2 - 0.2 * ramp(fr, U + 10, U + 18, 0, 1, out3)})` }}>
        <span style={{ display: 'inline-block', padding: '16px 30px', borderRadius: 16, background: 'rgba(8,10,8,.85)', border: '3px solid #3ddc84', font: `800 54px/1 ${FONT}`, letterSpacing: '0.06em', color: '#3ddc84' }}>UNLOCKED</span>
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 1660, textAlign: 'center', opacity: ask, transform: `translateY(${20 * (1 - ask)}px)` }}>
        <span style={{ display: 'inline-block', padding: '20px 30px', borderRadius: 18, background: 'rgba(8,6,12,.88)', border: '3px solid #fff', font: `800 46px/1.2 ${FONT}`, color: '#fff' }}>Did yours unlock?<br /><span style={{ color: '#ffd60a' }}>Comment YES or NO</span></span>
      </div>
    </AbsoluteFill>
  );
};

// The lock-screen phone alone on a transparent frame, placed where the phone sits in his hand in the hook's last frame.
// tools/hand_phone3d.py lays it over that frame (under his fingers) to make public/hook_last3d.png.
export const PhoneStill: React.FC = () => { const lock = usePhoneModel(true);
  return <AbsoluteFill><div style={{ position: 'absolute', inset: 0, transformOrigin: '540px 960px', transform: 'translate(-2px, -40px) scale(1.118)' }}><Layer phone={lock} /></div></AbsoluteFill>; };
