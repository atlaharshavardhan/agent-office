import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import front from '../front.json';
import { C, FONT, Label, ramp } from '../theme';
import { headDots, turnDot } from './dotHead';

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
export const MIR = { glass: 54, face: 96, wide: 150 };
const STEPS = [{ at: 30, to: MIR.glass, text: '1 · DOTS LEAVE THE PHONE' }, { at: MIR.glass, to: MIR.wide, text: '2 · THE MIRROR REFLECTS THEM ONTO HIS FACE' }, { at: MIR.wide, to: 999, text: '3 · THE CAMERA SEES HIS FACE IN THE MIRROR' }];

// MIR_FROM: the setup is trimmed, the scene starts this many frames in (just before the dots leave the phone)
export const MIR_FROM = 24;
export const Mirror: React.FC = () => {
  const l = useCurrentFrame() + MIR_FROM;
  const s = 1 + 0.25 * ramp(l, 0, 30, 0, 1, (x) => x * x * (3 - 2 * x)) + 0.02 * (l / 222);   // wide enough to keep his reflection in frame   // push in on the phone, mirror and face
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, ...(l >= MIR.glass && l < MIR.wide
        ? (() => { const px = 520 * K, py = 620 * K, sc = 1.5 * (1 + 0.08 * ((l - MIR.glass) / (MIR.wide - MIR.glass)));      // one framing: his face, the phone and the glass together
          return { transformOrigin: '0 0', transform: `translate(${540 - px * sc}px, ${900 - py * sc}px) scale(${sc})` }; })()
        : { transformOrigin: '640px 700px', transform: `scale(${s})` }) }}>
        <Img src={staticFile('bathroom_side.png')} style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1672 * K, filter: `brightness(${1 - 0.25 * ramp(l, 30, 60)})` }} />
        <svg viewBox="0 0 941 1672" style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1672 * K }}>
          <defs><filter id="mg" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.1" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
          {/* very fine guide rays, like the 3D dots clip */}
          <g opacity={0.2 * ramp(l, 40, 60) * (1 - ramp(l, 122, 130))}>
            {FACE_DOTS.filter((_, i) => i % 14 === 0).map((f, i) => { const m = hit(f); return <path key={i} d={`M ${P[0]} ${P[1]} L ${m[0]} ${m[1]} L ${f[0]} ${f[1]}`} fill="none" stroke={C.ir} strokeWidth={0.5} />; })}
          </g>
          {/* every dot flies from the projector to the glass, reflects, and lands on its own spot on his face */}
          <g filter="url(#mg)">
            {FACE_DOTS.map((f, i) => {
              const m = hit(f), a = len(P, m), b = len(m, f), t0 = launch(f), p = (l - t0) / FLY;
              if (p <= 0) return null;
              if (p >= 1) { const g = mir(f); return <g key={i}><circle cx={f[0]} cy={f[1]} r={1.25 * (1 + 0.8 * (1 - ramp(l, t0 + FLY, t0 + FLY + 5)))} fill={C.ir} opacity={0.75 + 0.25 * f[2]} />{i % 2 === 0 && <circle cx={g[0]} cy={g[1]} r={1.05} fill={C.ir} opacity={0.7} />}</g>; }
              const d = p * (a + b), q = d < a ? [P[0] + (m[0] - P[0]) * d / a, P[1] + (m[1] - P[1]) * d / a] : [m[0] + (f[0] - m[0]) * (d - a) / b, m[1] + (f[1] - m[1]) * (d - a) / b];
              const g = mir(q); return <g key={i}><circle cx={q[0]} cy={q[1]} r={1.7} fill={C.irCore} /><circle cx={g[0]} cy={g[1]} r={1.4} fill={C.irCore} opacity={0.85} /></g>;
            })}
            {/* the stream keeps flowing while the camera looks */}
            {l > 100 && STREAM.map(([k, o], i) => { const f = FACE_DOTS[Math.floor(k * FACE_DOTS.length)], m = hit(f), a = len(P, m), b = len(m, f), u = ((l / 30) + o) % 1, d = u * (a + b);
              const q = d < a ? [P[0] + (m[0] - P[0]) * d / a, P[1] + (m[1] - P[1]) * d / a] : [m[0] + (f[0] - m[0]) * (d - a) / b, m[1] + (f[1] - m[1]) * (d - a) / b];
              const g = mir(q); return <g key={'s' + i}><circle cx={q[0]} cy={q[1]} r={1.2} fill={C.ir} opacity={0.8} /><circle cx={g[0]} cy={g[1]} r={1.05} fill={C.ir} opacity={0.7} /></g>; })}
          </g>
          {/* soft glints where the stream meets the glass */}
          {[0, 1, 2].map((k) => { const u = ((l - 52) / 26 + k / 3) % 1; return l > 52 ? <ellipse key={k} cx={MX} cy={606} rx={3 + 12 * u} ry={10 + 46 * u} fill="none" stroke={C.irCore} strokeWidth={0.9} opacity={0.5 * (1 - u)} /> : null; })}
          {/* the reflection rule, shown on the middle ray: dashed normal + equal angles */}
          {(() => { const { m, f } = RAYS[2], o = ramp(l, 74, 80) * (1 - ramp(l, 122, 128)), r = 34;
            const ang = (q: number[]) => Math.atan2(q[1] - m[1], q[0] - m[0]), a1 = ang(P), a2 = ang(f);
            const arc = (from: number, to: number) => `M ${m[0] + r * Math.cos(from)} ${m[1] + r * Math.sin(from)} A ${r} ${r} 0 0 ${to > from ? 1 : 0} ${m[0] + r * Math.cos(to)} ${m[1] + r * Math.sin(to)}`;
            return <g opacity={o} stroke="#fff" fill="none"><line x1={m[0]} y1={m[1]} x2={m[0] - 70} y2={m[1]} strokeWidth={1.2} strokeDasharray="4 4" /><path d={arc(Math.PI, a1)} strokeWidth={1.6} /><path d={arc(Math.PI, a2)} strokeWidth={1.6} /></g>; })()}
          {/* return trip: what the camera receives (dashed, moving toward the phone) */}
          {l >= MIR.wide && [RAYS[1], RAYS[3]].map(({ f, m }, k) => <path key={k} d={`M ${f[0]} ${f[1] + 5} L ${m[0]} ${m[1] + 5} L ${P[0] + 6} ${P[1] + 8}`} fill="none" stroke="#fff" strokeWidth={1.4} strokeDasharray="7 7" strokeDashoffset={-l * 1.4} opacity={0.8 * ramp(l, MIR.wide, MIR.wide + 6)} />)}
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
