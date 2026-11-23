import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, FACE, Label, clamp, ramp } from '../theme';
import { FaceStage } from './FaceStage';
import { DI, PHONE, PhoneFront } from './Phone';

// Scene 2 (2.5–10 s, 225 frames). Local frames.
const CUT_TO_FACE = 114;   // 6.3 s
const PUSH = [88, 102];    // quick push into the TrueDepth area, 5.4–5.9 s

export const TrueDepth: React.FC = () => {
  const fr = useCurrentFrame();
  if (fr < CUT_TO_FACE) {
    // match cut: starts as a full-screen glow (like the reflected screen), settles to the phone
    const settle = ramp(fr, 0, 6, 2.05, 1);
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
  const l = fr - CUT_TO_FACE;               // 0..110
  const z = 1 + 0.05 * (l / 110);
  // phone in the foreground, bottom of frame; its Dynamic Island fires the dots up at the face
  const PH = { dx: 70, dy: 1166 };
  const di: [number, number] = [540 + PH.dx, PHONE.cy - PHONE.h / 2 + 13 + DI.top + DI.h / 2 + PH.dy];
  const src: [number, number] = [((di[0] / FACE.s) - 376) / z + 376, (((di[1] + 5) / FACE.s) - 600) / z + 600];
  const launch = (d: number[]) => 3 + ((880 - d[1]) / 630) * 30 + d[3] * 8;    // chin first, sweeping up
  const sweep = ramp(l, 3, 44);
  const beamO = ramp(l, 0, 3) * (1 - ramp(l, 50, 58));
  const topY = interpolate(sweep, [0, 1], [1250, 430]);
  return (
    <AbsoluteFill>
      <FaceStage t={0} zoom={z} faceDim={ramp(l, 0, 4)} from={src}
        fly={(d) => ramp(l, launch(d), launch(d) + 9, 0, 1)}
        dotO={() => 1}
        dotR={(d) => (1.6 + 1.1 * d[2]) * (1 + 0.9 * (1 - ramp(l, launch(d) + 9, launch(d) + 14)))} />
      {/* the beam: a soft red column from the Dynamic Island up the face */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}>
        <defs>
          <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={C.ir} stopOpacity="0.55" /><stop offset="1" stopColor={C.ir} stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <polygon points={`${di[0] - 14},${di[1]} ${di[0] + 14},${di[1]} 800,${topY} 300,${topY}`} fill="url(#beam)" opacity={beamO * (0.85 + 0.15 * Math.sin(l * 0.9))} />
        <circle cx={di[0]} cy={di[1]} r={26} fill={C.ir} opacity={beamO * 0.8} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${PH.dx}px, ${PH.dy}px)` }}>
        <PhoneFront glow={0.22} />
      </div>
      <Label text="INFRARED DOTS" x={90} y={330} o={ramp(l, 40, 43) * (1 - ramp(l, 104, 108))} color={C.ir} />
    </AbsoluteFill>
  );
};
