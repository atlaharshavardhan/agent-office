import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, Label, ramp } from '../theme';

// The view inside the mirror: seen from behind him (public/bathroom_rear.png, 941 x 1672), the camera pushes through
// the frame of the mirror until his reflection fills the picture. In the mirror, the front of the phone faces us:
// its dot projector fires and the red dots land on his reflected face. t = frames from the cut.
const K = 1080 / 941, out3 = (x: number) => 1 - Math.pow(1 - x, 3);
const CAM = [702, 497], FACE = { x: 594, y: 506, rx: 46, ry: 63 };       // reflected phone's front camera; reflected face
let seed = 23; const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const DOTS: number[][] = [];
while (DOTS.length < 900) { const x = rnd() * 2 - 1, y = rnd() * 2 - 1; if (x * x + y * y < 1 && !(y < -0.55 && Math.abs(x) > 0.75)) DOTS.push([FACE.x + x * FACE.rx * (1 - 0.18 * Math.max(0, y)), FACE.y + y * FACE.ry, rnd()]); }
const FLY = 9, launch = (d: number[]) => 5 + ((d[1] - (FACE.y - FACE.ry)) / (2 * FACE.ry)) * 15 + d[2] * 4;   // forehead first, sweeping down

export const InsideMirror: React.FC<{ t: number }> = ({ t }) => {
  const a = ramp(t, 0, 14, 0, 1, out3), s = 1.7 + 1.5 * a + 0.12 * (t / 50);
  const fx = 600 + 46 * a, fy = 560 - 50 * a;                              // what sits at the centre of the frame
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${540 - fx * K * s}px, ${900 - fy * K * s}px) scale(${s})` }}>
        <Img src={staticFile('bathroom_rear.png')} style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1672 * K, filter: `brightness(${1 - 0.12 * ramp(t, 6, 16)})` }} />
        <svg viewBox="0 0 941 1672" style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1672 * K }}>
          <g opacity={0.25 * ramp(t, 8, 14)}>
            {DOTS.filter((_, i) => i % 9 === 0).map((d, i) => <line key={i} x1={CAM[0]} y1={CAM[1]} x2={d[0]} y2={d[1]} stroke={C.ir} strokeWidth={0.22} />)}
          </g>
          {DOTS.map((d, i) => { const p = (t - launch(d)) / FLY; if (p <= 0) return null;
            if (p >= 1) return <circle key={i} cx={d[0]} cy={d[1]} r={0.72 * (1 + 0.8 * (1 - ramp(t, launch(d) + FLY, launch(d) + FLY + 5)))} fill={C.ir} opacity={0.8 + 0.2 * d[2]} />;
            return <circle key={i} cx={CAM[0] + (d[0] - CAM[0]) * p} cy={CAM[1] + (d[1] - CAM[1]) * p} r={0.8} fill={C.irCore} />; })}
          <circle cx={CAM[0]} cy={CAM[1]} r={2.4 + 0.5 * Math.sin(t / 3)} fill={C.ir} opacity={0.9 * ramp(t, 6, 10)} /><circle cx={CAM[0]} cy={CAM[1]} r={0.9} fill="#fff" opacity={ramp(t, 6, 10)} />
        </svg>
      </div>
      <Label text="3 · IN THE MIRROR: THE DOTS LAND ON HIS REFLECTION" x={505} y={452} o={ramp(t, 4, 8)} size={25} align="center" color={C.ir} />
      <div style={{ position: 'absolute', left: 80, top: 1590, width: 860, opacity: 0.5, font: `600 21px/1.3 Inter, sans-serif`, color: '#b5ada5' }}>Illustration · simplified light path · the real dots are invisible</div>
    </AbsoluteFill>
  );
};
