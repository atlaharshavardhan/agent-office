import { AbsoluteFill, Img, staticFile } from 'remotion';
import data from '../dots.json';
import { C, FACE } from '../theme';

type Dot = [number, number, number, number]; // x, y (source px), depth 0..1, random 0..1
const DOTS = data.dots as Dot[];
export const WARP_PX = 16; // structured-light shift at depth 1 (source px)

const frameIdx = (t: number) => Math.round(((Math.max(-1, Math.min(1, t)) + 1) / 2) * (data.steps - 1));
const pad = (i: number) => String(i).padStart(2, '0');

// Position of a dot for yaw t and pattern warp w — same formula as tools/prep_face.py,
// so dots ride on the nose, brow and cheeks as the head turns.
export const dotX = (d: Dot, t: number, w: number) => d[0] + data.A * t * d[2] + WARP_PX * w * d[2];

export const FaceStage: React.FC<{
  t: number; zoom?: number; origin?: [number, number];
  faceO?: number; depthO?: number;
  dotO?: (d: Dot) => number; dotR?: (d: Dot) => number; warp?: number;
  fly?: (d: Dot) => number;          // 0..1 flight progress from `from` (source px) to the face
  from?: [number, number];
  faceDim?: number;                  // 0..1 darkens the face so the dots read
  children?: React.ReactNode;       // extra SVG in source coordinates (callouts)
}> = ({ t, zoom = 1, origin = [376, 600], faceO = 1, depthO = 0, dotO, dotR, warp = 0, fly, from = [376, 1100], faceDim = 0, children }) => {
  const i = pad(frameIdx(t));
  const box: React.CSSProperties = { position: 'absolute', left: 0, top: -5, width: 1080, height: FACE.h * FACE.s };
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <div style={{ ...box, transformOrigin: `${origin[0] * FACE.s}px ${origin[1] * FACE.s}px`, transform: `scale(${zoom})` }}>
        {faceO > 0 && <Img src={staticFile(`rot/face_${i}.jpg`)} style={{ ...box, top: 0, opacity: faceO, filter: `brightness(${1 - 0.35 * faceDim})` }} />}
        {depthO > 0 && <Img src={staticFile(`rot/depth_${i}.jpg`)} style={{ ...box, top: 0, opacity: depthO, filter: 'contrast(1.18)' }} />}
        <svg viewBox={`0 0 ${FACE.w} ${FACE.h}`} style={{ ...box, top: 0 }}>
          <defs>
            <filter id="dotGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <g filter="url(#dotGlow)">
            {dotO && DOTS.map((d, k) => {
              const o = dotO(d);
              if (o <= 0.01) return null;
              const r = dotR ? dotR(d) : 1.6 + 1.1 * d[2];
              const tx = dotX(d, t, warp), ty = d[1];
              const p = fly ? fly(d) : 1;
              if (p <= 0) return null;
              if (p < 1) {               // in flight: a short streak heading for its spot on the face
                const x = from[0] + (tx - from[0]) * p, y = from[1] + (ty - from[1]) * p;
                const bx = x - (tx - from[0]) * 0.035, by = y - (ty - from[1]) * 0.035;
                return <line key={k} x1={bx} y1={by} x2={x} y2={y} stroke={C.ir} strokeWidth={r * 0.9} strokeLinecap="round" opacity={o * 0.9} />;
              }
              const a = o * (0.7 + 0.3 * d[2]);
              return <g key={k} opacity={a}><circle cx={tx} cy={ty} r={r} fill={C.ir} /><circle cx={tx} cy={ty} r={r * 0.45} fill={C.irCore} /></g>;
            })}
          </g>
          {children}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
