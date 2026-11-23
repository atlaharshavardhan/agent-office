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
  children?: React.ReactNode;       // extra SVG in source coordinates (callouts)
}> = ({ t, zoom = 1, origin = [376, 600], faceO = 1, depthO = 0, dotO, dotR, warp = 0, children }) => {
  const i = pad(frameIdx(t));
  const box: React.CSSProperties = { position: 'absolute', left: 0, top: -5, width: 1080, height: FACE.h * FACE.s };
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <div style={{ ...box, transformOrigin: `${origin[0] * FACE.s}px ${origin[1] * FACE.s}px`, transform: `scale(${zoom})` }}>
        {faceO > 0 && <Img src={staticFile(`rot/face_${i}.jpg`)} style={{ ...box, top: 0, opacity: faceO }} />}
        {depthO > 0 && <Img src={staticFile(`rot/depth_${i}.jpg`)} style={{ ...box, top: 0, opacity: depthO, filter: 'contrast(1.18)' }} />}
        <svg viewBox={`0 0 ${FACE.w} ${FACE.h}`} style={{ ...box, top: 0 }}>
          {dotO && DOTS.map((d, k) => {
            const o = dotO(d);
            if (o <= 0.01) return null;
            return <circle key={k} cx={dotX(d, t, warp)} cy={d[1]} r={(dotR ? dotR(d) : 1.5 + 1.1 * d[2])} fill={C.violet} opacity={o * (0.55 + 0.45 * d[2])} />;
          })}
          {children}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
