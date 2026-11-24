import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import front from '../front.json';
import { C, FONT, Label, ramp } from '../theme';

// Scene 5 (8 s, 240 frames): how the infrared light reaches his face by way of the mirror, and what the
// camera sees. Side view (public/bathroom_side.png, 941 x 1672) + a live "infrared camera" panel.
//  30– 80  1 · rays leave the phone's dot projector and travel to the glass
//  62–112  2 · each ray reflects off the mirror (angle in = angle out) and lands on his face; dots appear
// 126–240  3 · the light returns the same way: the camera sees his face in the mirror. The live panel
//          shows that (mirrored) infrared view being scanned line by line, with a running percentage.
// The padlock stays closed with a question mark: no result is shown.
const K = 1080 / 941, MX = 735;                                    // MX: x of the mirror surface the rays hit
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
const PAN = { x: 560, y: 1120, w: 380, h: 506 }, CROP = { x: 106, y: 200, w: 540, h: 720 }, PK = PAN.w / CROP.w;
const PDOTS = (front.dots as number[][]).filter((_, i) => i % 3 === 0).map((d) => [PAN.w - (d[0] - CROP.x) * PK, (d[1] - CROP.y) * PK, d[3]]).filter((d) => d[1] > 0 && d[1] < PAN.h);
const len = (a: number[], b: number[]) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const STEPS = [{ at: 30, to: 62, text: '1 · DOTS LEAVE THE PHONE' }, { at: 62, to: 126, text: '2 · THE MIRROR REFLECTS THEM ONTO HIS FACE' }, { at: 126, to: 999, text: '3 · THE CAMERA SEES HIS FACE IN THE MIRROR' }];

export const Mirror: React.FC = () => {
  const l = useCurrentFrame();
  const s = 1 + 0.32 * ramp(l, 0, 30, 0, 1, (x) => x * x * (3 - 2 * x)) + 0.04 * (l / 240);   // push in on the phone, mirror and face
  const scan = ramp(l, 140, 212), pct = Math.round(scan * 100), panel = ramp(l, 128, 136);
  const sweepY = scan < 1 ? scan * PAN.h : ((l - 212) % 60) / 60 * PAN.h;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '600px 690px', transform: `scale(${s})` }}>
        <Img src={staticFile('bathroom_side.png')} style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1672 * K, filter: `brightness(${1 - 0.25 * ramp(l, 30, 60)})` }} />
        <svg viewBox="0 0 941 1672" style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1672 * K }}>
          {RAYS.map(({ f, m }, k) => {
            const a = len(P, m), b = len(m, f), t0 = 32 + k * 3, out = ramp(l, t0, t0 + 30) * a, back = ramp(l, t0 + 30, t0 + 60) * b;
            const u = ((l - t0) / 34) % 1, on = l > t0 + 60;      // pulses keep travelling once the path is drawn
            const pulse = (v: number) => (v * (a + b) < a ? [P[0] + (m[0] - P[0]) * (v * (a + b)) / a, P[1] + (m[1] - P[1]) * (v * (a + b)) / a] : [m[0] + (f[0] - m[0]) * (v * (a + b) - a) / b, m[1] + (f[1] - m[1]) * (v * (a + b) - a) / b]);
            return (
              <g key={k}>
                <line x1={P[0]} y1={P[1]} x2={m[0]} y2={m[1]} stroke={C.ir} strokeWidth={1.3} strokeDasharray={`${out} ${a}`} opacity={0.85} />
                <line x1={m[0]} y1={m[1]} x2={f[0]} y2={f[1]} stroke={C.ir} strokeWidth={1.3} strokeDasharray={`${back} ${b}`} opacity={0.85} />
                {l > t0 + 28 && <circle cx={m[0]} cy={m[1]} r={2 + 7 * (((l - t0 - 28) / 24) % 1)} fill="none" stroke={C.irCore} strokeWidth={1} opacity={0.8 * (1 - (((l - t0 - 28) / 24) % 1))} />}
                {on && [0, 0.5].map((o) => { const [x, y] = pulse((u + o) % 1); return <circle key={o} cx={x} cy={y} r={2.2} fill={C.irCore} />; })}
              </g>
            );
          })}
          {/* the reflection rule, shown on the middle ray: dashed normal + equal angles */}
          {(() => { const { m, f } = RAYS[2], o = ramp(l, 70, 76) * (1 - ramp(l, 122, 128)), r = 34;
            const ang = (q: number[]) => Math.atan2(q[1] - m[1], q[0] - m[0]), a1 = ang(P), a2 = ang(f);
            const arc = (from: number, to: number) => `M ${m[0] + r * Math.cos(from)} ${m[1] + r * Math.sin(from)} A ${r} ${r} 0 0 ${to > from ? 1 : 0} ${m[0] + r * Math.cos(to)} ${m[1] + r * Math.sin(to)}`;
            return <g opacity={o} stroke="#fff" fill="none"><line x1={m[0]} y1={m[1]} x2={m[0] - 70} y2={m[1]} strokeWidth={1.2} strokeDasharray="4 4" /><path d={arc(Math.PI, a1)} strokeWidth={1.6} /><path d={arc(Math.PI, a2)} strokeWidth={1.6} /></g>; })()}
          {/* the dots landing on his real face */}
          {FACE_DOTS.map((d, i) => { const t = 92 + ((d[1] - 498) / 238) * 14 + d[2] * 14, o = ramp(l, t, t + 3); return o > 0 ? <circle key={i} cx={d[0]} cy={d[1]} r={1.15} fill={C.ir} opacity={o * (0.7 + 0.3 * d[2])} /> : null; })}
          {/* return trip: what the camera receives (dashed, moving toward the phone) */}
          {l >= 126 && [RAYS[1], RAYS[3]].map(({ f, m }, k) => <path key={k} d={`M ${f[0]} ${f[1] + 5} L ${m[0]} ${m[1] + 5} L ${P[0] + 6} ${P[1] + 8}`} fill="none" stroke="#fff" strokeWidth={1.4} strokeDasharray="7 7" strokeDashoffset={-l * 1.4} opacity={0.8 * ramp(l, 126, 132)} />)}
          <circle cx={P[0]} cy={P[1]} r={5} fill={C.ir} opacity={ramp(l, 30, 34)} /><circle cx={P[0]} cy={P[1]} r={2} fill="#fff" opacity={ramp(l, 30, 34)} />
        </svg>
      </div>
      {STEPS.map((st) => <Label key={st.text} text={st.text} x={505} y={452} o={ramp(l, st.at, st.at + 4) * (1 - ramp(l, st.to - 4, st.to))} size={27} align="center" color={st.at === 126 ? C.label : C.ir} />)}
      {/* live infrared camera panel */}
      <div style={{ position: 'absolute', left: PAN.x, top: PAN.y + (1 - panel) * 40, width: PAN.w, height: PAN.h, opacity: panel, borderRadius: 18, overflow: 'hidden', border: '3px solid #fff', background: '#000', boxShadow: '0 16px 50px rgba(0,0,0,.7)' }}>
        <Img src={staticFile('face_front_ir.png')} style={{ position: 'absolute', left: -(752 - CROP.x - CROP.w) * PK, top: -CROP.y * PK, width: 752 * PK, height: 1344 * PK, transform: 'scaleX(-1)', filter: 'brightness(0.62)' }} />
        <svg width={PAN.w} height={PAN.h} style={{ position: 'absolute', inset: 0 }}>
          {PDOTS.map((d, i) => (d[1] <= (scan < 1 ? sweepY : PAN.h) ? <circle key={i} cx={d[0]} cy={d[1]} r={1.7} fill={C.ir} opacity={0.75 + 0.25 * d[2]} /> : null))}
          <rect x={0} y={sweepY - 22} width={PAN.w} height={22} fill="url(#sw)" /><line x1={0} x2={PAN.w} y1={sweepY} y2={sweepY} stroke="#fff" strokeWidth={3} />
          <defs><linearGradient id="sw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity="0.35" /></linearGradient></defs>
        </svg>
        <div style={{ position: 'absolute', left: 14, top: 12, display: 'flex', alignItems: 'center', gap: 8, font: `800 20px/1 ${FONT}`, letterSpacing: '0.1em', color: '#fff' }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: C.ir, opacity: Math.floor(l / 10) % 2 ? 1 : 0.25 }} />LIVE · INFRARED CAMERA
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 14px', background: 'rgba(0,0,0,.7)', display: 'flex', justifyContent: 'space-between', font: `800 22px/1 ${FONT}`, letterSpacing: '0.08em', color: '#fff' }}>
          <span>{scan < 1 ? 'SCANNING REFLECTION' : 'REFLECTION SCANNED'}</span><span>{pct}%</span>
        </div>
      </div>
      {/* closed padlock + question mark: the result is saved for the real test */}
      <div style={{ position: 'absolute', left: PAN.x - 150, top: PAN.y + 190, opacity: ramp(l, 214, 220), transform: `scale(${1 + 0.05 * Math.sin(l / 5)})`, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 18, background: 'rgba(10,8,7,.85)', border: `3px solid ${C.amber}` }}>
        <svg width={44} height={56} viewBox="-36 -46 72 92"><path d="M -18 -6 v -14 a 18 18 0 0 1 36 0 v 14" stroke="#fff" strokeWidth={9} strokeLinecap="round" fill="none" /><rect x={-30} y={-6} width={60} height={46} rx={11} fill="#fff" /></svg>
        <span style={{ font: `800 62px/1 ${FONT}`, color: C.amber }}>?</span>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 1660, opacity: 0.5 * ramp(l, 30, 34), font: `600 21px/1 ${FONT}`, color: '#b5ada5' }}>Illustration · simplified light path · the real dots are invisible</div>
    </AbsoluteFill>
  );
};
