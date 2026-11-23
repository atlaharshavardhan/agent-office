import { AbsoluteFill, Img, staticFile } from 'remotion';
import data from '../dots.json';
import { C, FACE } from '../theme';

// The host's face, unchanged: the same 752 x 1344 still in three aligned versions
// (colour, infrared, depth map). Only the depth map is ever turned (t != 0).
type Dot = [number, number, number, number]; // x, y (source px), depth 0..1, random 0..1
const DOTS = data.dots as Dot[];
export const WARP_PX = 9;   // structured-light offset at depth 1: the pattern follows the contours

const frameIdx = (t: number) => Math.round(((Math.max(-1, Math.min(1, t)) + 1) / 2) * (data.steps - 1));
const pad = (i: number) => String(i).padStart(2, '0');
export const yawShift = (t: number, depth: number) => data.A * t * depth;   // same as tools/prep_face.py

export const toScreen = (x: number, y: number, zoom: number, origin: [number, number], dy: number): [number, number] =>
  [(origin[0] + (x - origin[0]) * zoom) * FACE.s, (origin[1] + (y - origin[1]) * zoom) * FACE.s - 5 + dy];

export const FaceStage: React.FC<{
  zoom?: number; origin?: [number, number]; dy?: number;
  colorO?: number; irO?: number; depthO?: number; t?: number;   // layer opacities; t turns the depth map only
  dotO?: number;                                                 // the captured dot pattern (all at once)
}> = ({ zoom = 1, origin = [376, 600], dy = 0, colorO = 0, irO = 0, depthO = 0, t = 0, dotO = 0 }) => {
  const box: React.CSSProperties = { position: 'absolute', left: 0, top: -5 + dy, width: 1080, height: FACE.h * FACE.s };
  const layer: React.CSSProperties = { ...box, top: 0 };
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0908', overflow: 'hidden' }}>
      <div style={{ ...box, transformOrigin: `${origin[0] * FACE.s}px ${origin[1] * FACE.s}px`, transform: `scale(${zoom})` }}>
        {colorO > 0 && <Img src={staticFile('face_34.png')} style={{ ...layer, opacity: colorO }} />}
        {irO > 0 && <Img src={staticFile('face_ir.png')} style={{ ...layer, opacity: irO, filter: 'sepia(0.22) brightness(0.72) contrast(1.08)' }} />}
        {depthO > 0 && <Img src={staticFile(`rot/depth_${pad(frameIdx(t))}.jpg`)} style={{ ...layer, opacity: depthO, filter: 'contrast(1.15)' }} />}
        {dotO > 0.01 && <svg viewBox={`0 0 ${FACE.w} ${FACE.h}`} style={layer} shapeRendering="geometricPrecision">
          {DOTS.map((d, k) => <circle key={k} cx={d[0] + WARP_PX * d[2]} cy={d[1]} r={0.95 + 0.35 * d[3]} fill="#fff6ee" opacity={dotO * (0.5 + 0.5 * ((d[3] * 7.3) % 1))} />)}
        </svg>}
      </div>
    </AbsoluteFill>
  );
};
export { C };
