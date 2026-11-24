import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import front from '../front.json';
import { C, FONT, Label, ramp } from '../theme';
import { headDots, turnDot } from './dotHead';
import { Orbit3D } from './Orbit3D';

// Scene 5 (8 s, 240 frames): how the infrared light reaches his face by way of the mirror, and what the
// camera sees. Side view (public/bathroom_side.png, 941 x 1672) + a live "infrared camera" panel.
//  30– 80  1 · rays leave the phone's dot projector and travel to the glass
//  62–112  2 · each ray reflects off the mirror (angle in = angle out) and lands on his face; dots appear
// 126–240  3 · the light returns the same way: the camera sees his face in the mirror. The live panel
//          shows that (mirrored) infrared view being scanned line by line, with a running percentage.
// The padlock stays closed with a question mark: no result is shown.
const K = 1080 / 941, MX = 705;                                    // MX: x of the mirror surface the rays hit
const P = [516, 604];                                              // dot projector, top of the phone (faces the mirror)
const TARGETS = [[300, 518], [320, 562], [341, 632], [322, 668], [311, 716]];   // forehead, brow, nose, lips, chin
// law of reflection for a vertical mirror: the hit point where angle in = angle out
const hit = (f: number[]) => [MX, (P[1] * (MX - f[0]) + f[1] * (MX - P[0])) / ((MX - f[0]) + (MX - P[0]))];
const RAYS = TARGETS.map((f) => ({ f, m: hit(f) }));
const FACE_POLY = [[267, 500], [307, 498], [320, 530], [323, 560], [322, 600], [345, 637], [318, 652], [326, 673],
  [312, 718], [290, 734], [240, 720], [212, 662], [218, 617], [240, 560], [262, 517]];
const inPoly = (x: number, y: number) => { let c = false;
  for (let i = 0, j = FACE_POLY.length - 1; i < FACE_POLY.length; j = i++) { const [xi, yi] = FACE_POLY[i], [xj, yj] = FACE_POLY[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
let seed = 31; const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const FACE_DOTS: number[][] = [];
for (let y = 498; y < 736; y += 5) for (let x = 210; x < 348; x += 5) { const px = x + (rnd() - 0.5) * 4, py = y + (rnd() - 0.5) * 4; if (inPoly(px, py)) FACE_DOTS.push([px, py, rnd()]); }
// live panel: the straight-on infrared still, flipped left-right (it is a mirror image)
const PAN = { x: 80, y: 1050, w: 380, h: 506 }, CROP = { x: 106, y: 200, w: 540, h: 720 }, PK = PAN.w / CROP.w;
const PDOTS = (front.dots as number[][]).filter((_, i) => i % 3 === 0).map((d) => [PAN.w - (d[0] - CROP.x) * PK, (d[1] - CROP.y) * PK, d[3]]).filter((d) => d[1] > 0 && d[1] < PAN.h);
// match ring (lower left): his straight-on face as dots, mirrored because it is a reflection
const RING = { x: 270, y: 1320, r: 190 }, TICKS = 84;
const RING_DOTS = headDots(0.44);
const len = (a: number[], b: number[]) => Math.hypot(b[0] - a[0], b[1] - a[1]);
// Mirror image of a point, fitted to this picture: his phone (516, 604) appears in the mirror at (763, 626) and his
// nose (341, 632) at (817, 650). Points on the glass (x = MX) map to themselves, so real and reflected dots meet there.
const RC = [763, 626];                                                // front camera of the phone in the mirror
const mir = (q: number[]) => { const x = 922.3 - 0.309 * q[0], w = Math.min(1, Math.max(0, (x - MX) / (RC[0] - MX))); return [x, q[1] + (112.8 - 0.15 * q[1]) * w]; };
const FLY = 24, launch = (f: number[]) => 34 + ((f[1] - 498) / 238) * 46 + f[2] * 10;      // forehead first, sweeping down
const STREAM = Array.from({ length: 150 }, () => [rnd(), rnd()]);
// three shots: wide · one closer framing that holds his face, the phone and the glass together, so the bounce off the
// mirror and the dots landing on his face are seen in the same frame · wide again (what the camera sees)
export const MIR = { glass: 54, face: 96, wide: 999, inside: 104 };   // inside: the cut into the mirror view
const PUSH = 79;                                                       // the word bounce
const RAY0 = 36, RAY1 = 94;                                           // the rays leave the phone / reach the glass (about 2 s: slow motion)
const STEPS = [{ at: 30, to: MIR.glass, text: '1 · RAYS LEAVE THE PHONE' }, { at: MIR.glass, to: MIR.wide, text: '2 · SLOW MOTION: THEY TRAVEL TO THE MIRROR' }, { at: MIR.wide, to: 999, text: '3 · THE CAMERA SEES HIS FACE IN THE MIRROR' }];

// MIR_FROM: the setup is trimmed, the scene starts this many frames in (just before the dots leave the phone)
export const MIR_FROM = 24;
export const Mirror: React.FC = () => {
  const l = useCurrentFrame() + MIR_FROM;
  if (l >= MIR.inside) return (
    <AbsoluteFill>
      <Orbit3D g={0} pov={l - MIR.inside} />
      <Label text="3 · FROM THE MIRROR: THEY BOUNCE BACK ONTO HIS FACE" x={505} y={452} o={ramp(l, MIR.inside + 4, MIR.inside + 8)} size={24} align="center" color={C.ir} />
    </AbsoluteFill>
  );
  const s = 1 + 0.25 * ramp(l, 0, 30, 0, 1, (x) => x * x * (3 - 2 * x)) + 0.02 * (l / 222);   // wide enough to keep his reflection in frame   // push in on the phone, mirror and face
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      {/* one take: wide, then a short push toward the glass and his reflection on the word bounce (frames PUSH..PUSH+10), then
          it settles on a framing that keeps his face, the phone, the glass and his reflection together */}
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', ...(() => {
        const e = ramp(l, PUSH, PUSH + 10, 0, 1, (x) => 1 - Math.pow(1 - x, 3)), sc = s + (1.38 - s) * e;
        const tx = 640 * (1 - s) * (1 - e) + (540 - 548 * K * 1.38) * e, ty = 700 * (1 - s) * (1 - e) + (900 - 625 * K * 1.38) * e;
        return { transform: `translate(${tx}px, ${ty}px) scale(${sc})` }; })() }}>
        <Img src={staticFile('bathroom_side.png')} style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1672 * K, filter: `brightness(${1 - 0.25 * ramp(l, 30, 60)})` }} />
        <svg viewBox="0 0 941 1672" style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1672 * K }}>
          <defs><filter id="mg" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.1" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
          {/* slow motion: the rays leave the dot projector and travel to the glass. They reach it just before the cut to
              the mirror view, which shows them coming back onto his face. The mirror shows the same rays, mirrored. */}
          <g filter="url(#mg)">
            {FACE_DOTS.filter((_, i) => i % 9 === 0).map((f, i) => {
              const m = hit(f), pr = ramp(l, RAY0 + f[2] * 6, RAY1 + f[2] * 6, 0, 1, (x) => x); if (pr <= 0) return null;
              const tip = [P[0] + (m[0] - P[0]) * pr, P[1] + (m[1] - P[1]) * pr], g = mir(tip);
              return (
                <g key={i}>
                  <line x1={P[0]} y1={P[1]} x2={tip[0]} y2={tip[1]} stroke={C.ir} strokeWidth={0.5} opacity={0.5} />
                  <line x1={RC[0]} y1={RC[1]} x2={g[0]} y2={g[1]} stroke={C.ir} strokeWidth={0.45} opacity={0.45} />
                  {pr < 1 && <><circle cx={tip[0]} cy={tip[1]} r={1.5} fill={C.irCore} /><circle cx={g[0]} cy={g[1]} r={1.2} fill={C.irCore} opacity={0.8} /></>}
                </g>);
            })}
          </g>
          {/* a small ripple on the glass as the rays arrive */}
          {[0, 1, 2].map((k) => { const u = ((l - RAY1) / 14 + k / 3) % 1; return l > RAY1 ? <ellipse key={k} cx={MX} cy={606} rx={2 + 7 * u} ry={8 + 26 * u} fill="none" stroke={C.irCore} strokeWidth={0.9} opacity={0.6 * (1 - u)} /> : null; })}
          {/* the same projector, seen in the mirror */}
          <circle cx={RC[0]} cy={RC[1]} r={4.5 + Math.sin(l / 3)} fill={C.ir} opacity={0.9 * ramp(l, 30, 34)} /><circle cx={RC[0]} cy={RC[1]} r={1.8} fill="#fff" opacity={ramp(l, 30, 34)} />
          <circle cx={P[0]} cy={P[1]} r={5} fill={C.ir} opacity={ramp(l, 30, 34)} /><circle cx={P[0]} cy={P[1]} r={2} fill="#fff" opacity={ramp(l, 30, 34)} />
        </svg>
      </div>
      {STEPS.map((st) => <Label key={st.text} text={st.text} x={505} y={452} o={ramp(l, st.at, st.at + 4) * (1 - ramp(l, st.to - 4, st.to))} size={27} align="center" color={st.at === MIR.wide ? C.label : C.ir} />)}
      {/* closed padlock + question mark: the result is saved for the real test */}
      <div style={{ position: 'absolute', left: 430, top: 1330, opacity: ramp(l, 176, 182), transform: `scale(${1 + 0.05 * Math.sin(l / 5)})`, transformOrigin: 'left center', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 18, background: 'rgba(10,8,7,.85)', border: `3px solid ${C.amber}` }}>
        <svg width={44} height={56} viewBox="-36 -46 72 92"><path d="M -18 -6 v -14 a 18 18 0 0 1 36 0 v 14" stroke="#fff" strokeWidth={9} strokeLinecap="round" fill="none" /><rect x={-30} y={-6} width={60} height={46} rx={11} fill="#fff" /></svg>
        <span style={{ font: `800 62px/1 ${FONT}`, color: C.amber }}>?</span>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 1590, width: 860, opacity: 0.5 * ramp(l, 30, 34), font: `600 21px/1.3 ${FONT}`, color: '#b5ada5' }}>Illustration · simplified light path · the real dots are invisible</div>
    </AbsoluteFill>
  );
};
