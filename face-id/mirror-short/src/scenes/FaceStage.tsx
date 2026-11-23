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

// screen px -> face-image px, for a stage with this zoom / origin / vertical shift
export const toSource = (x: number, y: number, zoom: number, origin: [number, number], dy: number): [number, number] =>
  [(x / FACE.s - origin[0]) / zoom + origin[0], ((y + 5 - dy) / FACE.s - origin[1]) / zoom + origin[1]];
export const toScreen = (x: number, y: number, zoom: number, origin: [number, number], dy: number): [number, number] =>
  [(origin[0] + (x - origin[0]) * zoom) * FACE.s, (origin[1] + (y - origin[1]) * zoom) * FACE.s - 5 + dy];

export const FaceStage: React.FC<{
  t: number; zoom?: number; origin?: [number, number]; dy?: number;
  faceO?: number; depthO?: number; dark?: number;          // dark: 0..1 dims the face so dots read
  dotO?: (d: Dot) => number; dotR?: (d: Dot) => number; dotColor?: (d: Dot) => string; warp?: number;
  rays?: { from: [number, number]; o: number };            // fine light rays from a point (source px) to the dots
  children?: React.ReactNode;
}> = ({ t, zoom = 1, origin = [376, 600], dy = 0, faceO = 1, depthO = 0, dark = 0, dotO, dotR, dotColor, warp = 0, rays, children }) => {
  const i = pad(frameIdx(t));
  const box: React.CSSProperties = { position: 'absolute', left: 0, top: -5 + dy, width: 1080, height: FACE.h * FACE.s };
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0807', overflow: 'hidden' }}>
      <div style={{ ...box, transformOrigin: `${origin[0] * FACE.s}px ${origin[1] * FACE.s}px`, transform: `scale(${zoom})` }}>
        {faceO > 0 && <Img src={staticFile(`rot/face_${i}.jpg`)} style={{ ...box, top: 0, opacity: faceO, filter: `saturate(${1 - 0.45 * dark}) brightness(${1 - 0.58 * dark})` }} />}
        {depthO > 0 && <Img src={staticFile(`rot/depth_${i}.jpg`)} style={{ ...box, top: 0, opacity: depthO, filter: 'contrast(1.18)' }} />}
        <svg viewBox={`0 0 ${FACE.w} ${FACE.h}`} style={{ ...box, top: 0, overflow: 'visible' }}>
          <defs>
            <filter id="dotGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.1" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {rays && rays.o > 0 && dotO && <g style={{ mixBlendMode: 'screen' }}>
            {DOTS.map((d, k) => (k % 7 === 0 && dotO(d) > 0.5
              ? <line key={k} x1={rays.from[0]} y1={rays.from[1]} x2={dotX(d, t, warp)} y2={d[1]} stroke={C.ir} strokeWidth={0.6} opacity={rays.o * (0.16 + 0.3 * d[3])} />
              : null))}
          </g>}
          <g filter="url(#dotGlow)">
            {dotO && DOTS.map((d, k) => {
              const o = dotO(d);
              if (o <= 0.01) return null;
              const r = dotR ? dotR(d) : 1.1 + 0.7 * d[2];
              return <circle key={k} cx={dotX(d, t, warp)} cy={d[1]} r={r} fill={dotColor ? dotColor(d) : C.ir} opacity={o * (0.65 + 0.35 * d[2])} />;
            })}
          </g>
          {children}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
