import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, Label, clamp, ramp } from '../theme';
import { FaceStage, toSource } from './FaceStage';
import { DI, PHONE, PhoneFront } from './Phone';
import { Scan3D } from './Scan3D';

// Scene 2 (2.5–10 s, 225 frames). Local frames.
const CUT_TO_FACE = 114;   // 6.3 s
const PUSH = [88, 102];    // quick push into the TrueDepth area, 5.4–5.9 s

export const TrueDepth: React.FC = () => {
  const fr = useCurrentFrame();
  if (fr < CUT_TO_FACE) {
    // match cut: starts as a full-screen glow (like the reflected screen), settles to the phone
    const settle = ramp(fr, 0, 6, 2.5, 1);
    const push = ramp(fr, PUSH[0], PUSH[1], 0, 1);
    const drift = 1 + 0.16 * ramp(fr, 6, PUSH[0], 0, 1, (x) => x);   // keep moving while the line plays
    const s = settle * drift * (1 + 3.6 * push * push);
    const diY = PHONE.cy - PHONE.h / 2 + 13 + DI.top + DI.h / 2;
    const oy = interpolate(push, [0, 1], [900, diY], clamp);
    const ty = interpolate(push, [0, 1], [0, 960 - diY], clamp);
    return (
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 40% at 50% 45%, #2a1d14 0%, #120d0a 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, transformOrigin: `540px ${oy}px`, transform: `translateY(${ty}px) scale(${s})` }}>
          <PhoneFront glow={ramp(fr, PUSH[0] + 4, PUSH[1], 1, 0.35)} emit={ramp(fr, 92, 100)} t={fr} />
        </div>
      </AbsoluteFill>
    );
  }
  const l = fr - CUT_TO_FACE;
  return l < SIDE ? <SideScan l={l} /> : <Scan3D g={l - SIDE} />;
};

// ---- Close-up: phone at the left, fine rays fan onto his face, dots fill in ---------------
const SIDE = 32;                                         // 1.07 s of the side view first
const CloseScan: React.FC<{ l: number }> = ({ l }) => {
  const z = 1 + 0.06 * (l / 79), O: [number, number] = [376, 600], DY = 150;
  const CAMPT: [number, number] = [150, 700];            // Dynamic Island of the small phone (screen px)
  const appear = (d: number[]) => 1 + (Math.hypot(d[0] - 240, d[1] - 560) / 430) * 20 + d[3] * 4;
  const diY = PHONE.cy - PHONE.h / 2 + 13 + DI.top + DI.h / 2;
  const stat = ramp(l, 26, 30);
  return (
    <AbsoluteFill>
      <FaceStage t={0} zoom={z} origin={O} dy={DY} dark={1}
        rays={{ from: toSource(CAMPT[0], CAMPT[1], z, O, DY), o: ramp(l, 0, 3) }}
        dotO={(d) => ramp(l, appear(d), appear(d) + 3)}
        dotR={(d) => (1.1 + 0.7 * d[2]) * (1 + 0.8 * (1 - ramp(l, appear(d), appear(d) + 5)))} />
      <div style={{ position: 'absolute', inset: 0, perspective: 1400, perspectiveOrigin: `${CAMPT[0]}px ${CAMPT[1]}px` }}>
        <div style={{ position: 'absolute', inset: 0, transformOrigin: `540px ${diY}px`, transform: `translate(${CAMPT[0] - 540}px, ${CAMPT[1] - diY}px) rotateY(38deg) scale(0.4)` }}>
          <PhoneFront glow={0.5} />
        </div>
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}>
        <circle cx={CAMPT[0]} cy={CAMPT[1]} r={16} fill={C.ir} opacity={0.9} /><circle cx={CAMPT[0]} cy={CAMPT[1]} r={6} fill="#fff" />
      </svg>
      <div style={{ position: 'absolute', left: 70, width: 870, top: 1425, textAlign: 'center', opacity: stat, color: C.ir, font: `800 112px/1 ${FONT}` }}>
        30,000+ <span style={{ fontSize: 46, letterSpacing: '0.06em' }}>DOTS</span>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 1562, opacity: 0.5 * stat, font: `600 22px/1 ${FONT}`, color: '#b5ada5' }}>Illustration · dot count: Apple · fewer dots drawn than fired · invisible to the eye</div>
    </AbsoluteFill>
  );
};

// ---- He holds the phone; its TrueDepth camera lights his face (side view) -----------------
// Coordinates are pixels of public/bathroom_side.png (941 x 1672); the shot shows VIEW of it.
const VIEW = { x: 180, y: 240, w: 460, h: 818 }, K = 1080 / VIEW.w;
const CAM = [507, 603];                                   // top of the phone, facing him
const FACE_POLY = [[267, 500], [307, 498], [320, 530], [323, 560], [322, 600], [345, 637], [318, 652], [326, 673],
  [312, 718], [290, 734], [240, 720], [212, 662], [218, 617], [240, 560], [262, 517]];
const inPoly = (x: number, y: number) => {
  let c = false;
  for (let i = 0, j = FACE_POLY.length - 1; i < FACE_POLY.length; j = i++) {
    const [xi, yi] = FACE_POLY[i], [xj, yj] = FACE_POLY[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
let seed = 11; const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const SIDE_DOTS: number[][] = [];
for (let y = 496; y < 738; y += 4.6) for (let x = 208; x < 348; x += 4.6) {
  const px = x + (rnd() - 0.5) * 3.6, py = y + (rnd() - 0.5) * 3.6, r = rnd();
  if (inPoly(px, py)) SIDE_DOTS.push([px, py, r]);
}
const SPECKS = Array.from({ length: 70 }, () => [rnd(), rnd(), rnd()]);
const disp = (x: number, y: number) => [(x - VIEW.x) * K, (y - VIEW.y) * K];

const SideScan: React.FC<{ l: number }> = ({ l }) => {
  const zoom = 1 + 0.04 * (l / 110);
  const beam = ramp(l, 3, 7);
  const appear = (d: number[]) => 8 + ((345 - d[0]) / 135) * 30 + d[2] * 6;   // front of the face first
  const [cx, cy] = disp(CAM[0], CAM[1]);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '620px 900px', transform: `scale(${zoom})` }}>
        <Img src={staticFile('bathroom_side.png')} style={{ position: 'absolute', left: -VIEW.x * K, top: -VIEW.y * K, width: 941 * K, height: 1672 * K, filter: `brightness(${1 - 0.3 * beam})` }} />
        <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920 }}>
          <defs>
            <linearGradient id="fan" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor={C.ir} stopOpacity="0.6" /><stop offset="1" stopColor={C.ir} stopOpacity="0.12" />
            </linearGradient>
            <filter id="sg" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="0.9" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {/* light fan from the TrueDepth camera to his face */}
          <polygon points={`${CAM[0]},${CAM[1] - 2} ${CAM[0]},${CAM[1] + 2} 300,738 318,498`} fill="url(#fan)" opacity={beam * (0.55 + 0.1 * Math.sin(l * 1.3))} style={{ mixBlendMode: 'screen' }} />
          {/* specks of light travelling along the fan */}
          {SPECKS.map(([a, b, c], i) => {
            const u = (a + l / 14) % 1, ty = 498 + b * 240, tx = 318 - 18 * Math.sin(b * 3.1);
            return <circle key={i} cx={CAM[0] + (tx - CAM[0]) * u} cy={CAM[1] + (ty - CAM[1]) * u} r={0.5 + 0.5 * c} fill="#ffd0d8" opacity={beam * 0.8 * (1 - u * 0.4)} />;
          })}
          <g filter="url(#sg)">
            {SIDE_DOTS.map((d, i) => {
              const o = ramp(l, appear(d), appear(d) + 3);
              if (o <= 0.01) return null;
              const r = 0.8 * (1 + 0.8 * (1 - ramp(l, appear(d), appear(d) + 6)));
              return <g key={i} opacity={o}><circle cx={d[0]} cy={d[1]} r={r} fill={C.ir} /><circle cx={d[0]} cy={d[1]} r={r * 0.45} fill={C.irCore} /></g>;
            })}
          </g>
          <circle cx={CAM[0]} cy={CAM[1]} r={5} fill={C.ir} opacity={beam * 0.9} /><circle cx={CAM[0]} cy={CAM[1]} r={2} fill="#fff" opacity={beam} />
        </svg>
      </div>
      {/* explanations */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={`M ${cx} ${cy - 26} V 716`} stroke={C.label} strokeWidth={3} opacity={ramp(l, 6, 10)} />
      </svg>
      <Label text="TRUEDEPTH CAMERA" x={cx} y={660} o={ramp(l, 6, 10)} size={28} align="center" color={C.ir} />
    </AbsoluteFill>
  );
};
