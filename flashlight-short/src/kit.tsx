// Storyboard kit for "How You'd Invent a Flashlight" (pass 2).
// Everything is SVG: no images. Limbs are drawn as outlined capsule chains (one ink pass, one fill pass),
// so a hand or arm reads as a single clean shape and can be posed joint by joint.
import React from 'react';

export const INK = '#140f12';
export const W = 1080, H = 1920;
export type P = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
export const step = (p: P, ang: number, len: number): P => [p[0] + Math.sin(rad(ang)) * len, p[1] + Math.cos(rad(ang)) * len];
const pts = (a: P[]) => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const angOf = (a: P, b: P) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI - 90;
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>{children}</svg>;

// ------------------------------------------------------------------ palettes
export type Pal = {
  skin: string; skinSh: string; skinHi: string; nail: string; hair: string;
  top: string; topSh: string; topHi: string; under: string; pants: string; pantsSh: string; shoe: string; sole: string;
  rolled: boolean;
};
// the student: 19, short dark wavy hair, mustard overshirt (sleeves rolled) over a charcoal tee, dark jeans, pencil behind the ear
export const STU: Pal = {
  skin: '#b97a50', skinSh: '#8a5236', skinHi: '#d9a074', nail: '#e2b49a', hair: '#1b171d',
  top: '#c8962c', topSh: '#93691c', topHi: '#e2b54e', under: '#34363d', pants: '#2c3650', pantsSh: '#1f273b', shoe: '#2a2a2e', sole: '#d9d4c8',
  rolled: true,
};
// the friend: red jacket, dark trousers, black backpack, white wireless earbuds
export const FRD: Pal = {
  skin: '#8a583a', skinSh: '#66402a', skinHi: '#a87150', nail: '#b88a70', hair: '#141116',
  top: '#c8352e', topSh: '#8e2220', topHi: '#e2544a', under: '#2a2a2e', pants: '#272a33', pantsSh: '#1a1c23', shoe: '#ecebe6', sole: '#9a9aa2',
  rolled: false,
};

// ------------------------------------------------------------------ capsule body renderer
type Seg = { p: P[]; w: number; c?: string };
const Body: React.FC<{ segs?: Seg[]; blobs?: { d: string; c?: string }[]; fill: string; o?: number }> = ({ segs = [], blobs = [], fill, o = 3 }) => (
  <g>
    <g stroke={INK} fill={INK} strokeLinecap="round" strokeLinejoin="round">
      {blobs.map((b, i) => <path key={i} d={b.d} strokeWidth={2 * o} />)}
      {segs.map((s, i) => <polyline key={i} points={pts(s.p)} fill="none" strokeWidth={s.w + 2 * o} />)}
    </g>
    <g strokeLinecap="round" strokeLinejoin="round">
      {blobs.map((b, i) => <path key={i} d={b.d} fill={b.c ?? fill} />)}
      {segs.map((s, i) => <polyline key={i} points={pts(s.p)} fill="none" stroke={s.c ?? fill} strokeWidth={s.w} />)}
    </g>
  </g>
);

// ------------------------------------------------------------------ the hand
// Local frame: wrist at (0,0), fingers grow toward +y, thumb on the +x side.
// a = direction of the first phalanx (deg, + leans toward the thumb side), b/c = bends at the next joints,
// L = visible length factor (foreshortening: < 1 means the finger curls away from the camera).
export type Fin = { a?: number; b?: number; c?: number; L?: number; n?: boolean; to?: P };
export type HandSpec = { side?: boolean; f: [Fin, Fin, Fin, Fin]; t: Fin & { bx?: number; by?: number; toF0?: boolean }; nails?: boolean; palmL?: number; palmW?: number };
const FBASE = [
  { x: 0.34, y: 0, a: 7, l: [26, 16, 13], w: 17 },
  { x: 0.11, y: 4, a: 1, l: [28, 18, 14], w: 17.5 },
  { x: -0.12, y: 2, a: -5, l: [26, 17, 13], w: 16.5 },
  { x: -0.34, y: -7, a: -11, l: [20, 13, 11], w: 14.5 },
];
const chain = (base: P, a: number, f: Fin & { to?: P }, l: number[]) => {
  if (f.to) {
    const dx = f.to[0] - base[0], dy = f.to[1] - base[1], d = Math.hypot(dx, dy), th = (Math.atan2(dx, dy) * 180) / Math.PI;
    const bend = f.b ?? -10, s = d / (l[0] * Math.cos(rad(bend)) + l[1] + l[2] * Math.cos(rad(bend)));
    const p1 = step(base, th + bend, l[0] * s), p2 = step(p1, th, l[1] * s), p3 = step(p2, th - bend, l[2] * s);
    return { p: [base, p1, p2, p3] as P[], t3: th - bend, last: l[2] * s };
  }
  const L = f.L ?? 1;
  const t1 = a + (f.a ?? 0), t2 = t1 + (f.b ?? 0), t3 = t2 + (f.c ?? 0);
  const p1 = step(base, t1, l[0] * L), p2 = step(p1, t2, l[1] * L), p3 = step(p2, t3, l[2] * L);
  return { p: [base, p1, p2, p3] as P[], t3, last: l[2] * L };
};
// side (thumb-side) view: dorsal = -x, palm = +x; flexion bends toward +x. Seen from above, this is a hand in handshake orientation.
const SBASE = [
  { x: -6, y: 72, a: 0, l: [30, 19, 15], w: 19 },
  { x: -13, y: 70, a: -2, l: [32, 20, 16], w: 19 },
  { x: -19, y: 66, a: -4, l: [30, 19, 15], w: 18 },
  { x: -24, y: 59, a: -6, l: [24, 15, 13], w: 16 },
];
export const handGeom = (h: HandSpec) => {
  const Wd = h.palmW ?? 58, Lp = h.palmL ?? 62;
  const fingers = h.side
    ? SBASE.map((b, i) => ({ k: `f${i}`, w: b.w, ...chain([b.x, b.y], b.a, h.f[i], b.l), n: h.f[i].n ?? true }))
    : FBASE.map((b, i) => ({ k: `f${i}`, w: b.w, ...chain([b.x * Wd, Lp + b.y], b.a, h.f[i], b.l), n: h.f[i].n ?? h.nails ?? true }));
  const tb: P = h.side ? [h.t.bx ?? 14, h.t.by ?? 16] : [h.t.bx ?? 0.4 * Wd, h.t.by ?? 8];
  const tTo = h.t.toF0 ? ([fingers[0].p[3][0] + 6, fingers[0].p[3][1] - 4] as P) : h.t.to;
  const th = { k: 't', w: h.side ? 21 : 19.5, ...chain(tb, h.side ? 24 : 30, { ...h.t, to: tTo }, h.side ? [32, 26, 20] : [30, 25, 19]), n: h.t.n ?? h.nails ?? true };
  return { Wd, Lp, fingers, tb, th };
};
// where to put the wrist so that fingertip `k` lands exactly on `target`, with the hand pointing along screen angle `dir`
export const anchorHand = (h: HandSpec, k: string, target: P, dir: number, s: number, mirror?: boolean) => {
  const g = handGeom(h);
  const tip = (k === 't' ? g.th : g.fingers.find((f) => f.k === k)!).p[3];
  const r = rad(dir - 90), sx = mirror ? -s : s;
  const lx = tip[0] * sx, ly = tip[1] * s;
  const at: P = [target[0] - (lx * Math.cos(r) - ly * Math.sin(r)), target[1] - (lx * Math.sin(r) + ly * Math.cos(r))];
  return { at, toward: [at[0] + Math.cos(rad(dir)) * 100, at[1] + Math.sin(rad(dir)) * 100] as P };
};
// a fingertip's world position for a placed hand
export const tipWorld = (h: HandSpec, k: string, at: P, dir: number, s: number, mirror?: boolean): P => {
  const g = handGeom(h);
  const tip = (k === 't' ? g.th : g.fingers.find((f) => f.k === k)!).p[3];
  const r = rad(dir - 90), sx = mirror ? -s : s, lx = tip[0] * sx, ly = tip[1] * s;
  return [at[0] + lx * Math.cos(r) - ly * Math.sin(r), at[1] + lx * Math.sin(r) + ly * Math.cos(r)];
};
const SideHand: React.FC<{ h: HandSpec; pal: Pal; o: number; only?: string[] }> = ({ h, pal, o, only }) => {
  const { fingers, tb, th } = handGeom(h);
  const show = (k: string) => !only || only.includes(k);
  const palm = 'M -24 0 C -28 26 -28 52 -22 74 L 8 76 C 24 66 32 44 26 22 L 20 0 Z';
  const back = fingers.slice(1).reverse();
  const shadePal = { ...pal, skin: pal.skinSh };
  const nailOn = (f: typeof fingers[0], dorsal: number) => {
    const tip = f.p[3], c = step(step(tip, f.t3 + 180, f.last * 0.42), f.t3 - 90 * dorsal, f.w * 0.3);
    return <ellipse cx={c[0]} cy={c[1]} rx={f.w * 0.16} ry={f.last * 0.34} transform={`rotate(${-f.t3} ${c[0]} ${c[1]})`} fill={pal.nail} stroke={pal.skinSh} strokeWidth={1.2} />;
  };
  const creases = (f: typeof fingers[0]) => [f.p[1], f.p[2]].map((j, i) => { const a = step(j, f.t3 + 90, f.w * 0.15), b = step(j, f.t3 + 90, f.w * 0.48); return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={pal.skinSh} strokeWidth={1.8} strokeLinecap="round" opacity={0.7} />; });
  return (
    <g>
      {back.filter((f) => show(f.k)).map((f) => <g key={f.k}><Body segs={[{ p: f.p, w: f.w }]} fill={pal.skin} o={o} /><Body segs={[{ p: f.p, w: f.w - 6 }]} fill={pal.skinSh} o={0} /></g>)}
      {show('palm') && <g>
        <Body blobs={[{ d: palm }]} fill={pal.skin} o={o} />
        <path d="M -24 0 C -28 26 -28 52 -22 74 L -10 75 C -16 52 -16 26 -12 0 Z" fill={pal.skinHi} opacity={0.35} />
        <path d="M 20 0 L 26 22 C 30 40 26 56 18 66 C 16 48 14 26 10 0 Z" fill={pal.skinSh} opacity={0.4} />
        <path d="M -21 70 q 4 -6 10 -2" stroke={pal.skinSh} strokeWidth={2} fill="none" />
      </g>}
      {show('f0') && <g><Body segs={[{ p: fingers[0].p, w: fingers[0].w }]} fill={pal.skin} o={o} />{creases(fingers[0])}{fingers[0].n && nailOn(fingers[0], -1)}</g>}
      {show('t') && <g>
        <Body segs={[{ p: [[tb[0] - 8, tb[1] - 8], th.p[0], th.p[1]], w: 30 }, { p: th.p, w: th.w }]} fill={pal.skin} o={o} />
        {creases(th)}
        {th.n && (() => { const c = step(th.p[3], th.t3 + 180, th.last * 0.4); return <ellipse cx={c[0]} cy={c[1]} rx={th.w * 0.3} ry={th.last * 0.36} transform={`rotate(${-th.t3} ${c[0]} ${c[1]})`} fill={pal.nail} stroke={pal.skinSh} strokeWidth={1.3} />; })()}
      </g>}
    </g>
  );
};
export const Hand: React.FC<{ h: HandSpec; pal: Pal; o?: number; only?: string[]; glow?: string }> = ({ h, pal, o = 3, only, glow }) => {
  if (h.side) return <SideHand h={h} pal={pal} o={o} only={only} />;
  const { Wd, Lp, fingers, tb, th } = handGeom(h);
  const show = (k: string) => !only || only.includes(k);
  const palm = `M ${-0.34 * Wd} 0 L ${0.34 * Wd} 0 Q ${0.56 * Wd} ${0.42 * Lp} ${0.44 * Wd} ${Lp} L ${-0.42 * Wd} ${Lp - 7} Q ${-0.54 * Wd} ${0.5 * Lp} ${-0.34 * Wd} 0 Z`;
  const segs: Seg[] = [...fingers, th].filter((f) => show(f.k)).map((f) => ({ p: f.p, w: f.w }));
  if (show('t')) segs.push({ p: [[tb[0] - 10, tb[1] - 2], th.p[1]], w: 28 }); // the fleshy thumb base
  return (
    <g>
      <Body segs={segs} blobs={show('palm') ? [{ d: palm }] : []} fill={pal.skin} o={o} />
      {/* form shading on the little-finger side */}
      {show('palm') && <path d={`M ${-0.42 * Wd} ${Lp - 7} Q ${-0.54 * Wd} ${0.5 * Lp} ${-0.34 * Wd} 0 L ${-0.16 * Wd} 0 Q ${-0.3 * Wd} ${0.5 * Lp} ${-0.2 * Wd} ${Lp - 4} Z`} fill={pal.skinSh} opacity={0.35} />}
      {[...fingers, th].filter((f) => show(f.k)).map((f) => {
        const tip = f.p[3], dir = f.t3;
        const nailC = step(tip, dir + 180, f.last * 0.42);
        return (
          <g key={f.k}>
            {/* joint creases */}
            {[f.p[1], f.p[2]].map((j, i) => { const a = step(j, dir + 90, f.w * 0.26), b = step(j, dir - 90, f.w * 0.26); return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={pal.skinSh} strokeWidth={1.8} opacity={0.6} strokeLinecap="round" />; })}
            {f.n && f.last > 6 && <ellipse cx={nailC[0]} cy={nailC[1]} rx={f.w * 0.3} ry={Math.max(3, f.last * 0.36)} transform={`rotate(${-dir} ${nailC[0]} ${nailC[1]})`} fill={pal.nail} stroke={pal.skinSh} strokeWidth={1.3} />}
          </g>
        );
      })}
      {/* knuckle bumps on the back of the hand */}
      {show('palm') && (h.nails ?? true) && FBASE.map((b, i) => <path key={i} d={`M ${b.x * Wd - 6} ${Lp + b.y - 6} q 6 -5 12 0`} stroke={pal.skinSh} strokeWidth={1.8} fill="none" opacity={0.55} />)}
      {glow && <g style={{ mixBlendMode: 'screen' }} opacity={0.55}><Body segs={segs.map((s) => ({ ...s, c: glow }))} blobs={show('palm') ? [{ d: palm, c: glow }] : []} fill={glow} o={0} /></g>}
    </g>
  );
};
// place a hand at the wrist, pointing along `dir` (screen degrees from the forearm), optionally mirrored (left hand)
export const PlaceHand: React.FC<{ at: P; toward: P; s?: number; mirror?: boolean; children: React.ReactNode }> = ({ at, toward, s = 1, mirror, children }) =>
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${angOf(at, toward)}) scale(${mirror ? -s : s} ${s})`}>{children}</g>;

// convert a world point into a placed hand's local frame (so fingers can `reach` exact contact points)
export const toHand = (at: P, toward: P, s: number, mirror: boolean | undefined, w: P): P => {
  const r = -rad(angOf(at, toward)), vx = w[0] - at[0], vy = w[1] - at[1];
  const x = vx * Math.cos(r) - vy * Math.sin(r), y = vx * Math.sin(r) + vy * Math.cos(r);
  return [x / (mirror ? -s : s), y / s];
};
// undo a figure's lean so a world-space target can be reached by a joint inside the leaned group
export const unlean = (p: P, lean: number, pv: P = [100, 560]): P => {
  const r = -rad(lean), vx = p[0] - pv[0], vy = p[1] - pv[1];
  return [pv[0] + vx * Math.cos(r) - vy * Math.sin(r), pv[1] + vx * Math.sin(r) + vy * Math.cos(r)];
};

// a few stock hand shapes
export const HANDS = {
  relaxed: { f: [{ a: 2, b: 8, c: 6 }, { b: 10, c: 8 }, { b: 12, c: 8 }, { b: 14, c: 8 }], t: { a: -10, b: -14 } } as HandSpec,
  flat: { f: [{ a: 4 }, { a: 1 }, { a: -2 }, { a: -5 }], t: { a: 10, b: -8 } } as HandSpec,
  spread: { f: [{ a: 16 }, { a: 4 }, { a: -8 }, { a: -20 }], t: { a: 30, b: 4 } } as HandSpec,
  fist: { f: [{ L: 0.42, n: false }, { L: 0.42, n: false }, { L: 0.42, n: false }, { L: 0.42, n: false }], t: { a: -38, b: -30, L: 0.9 }, nails: false } as HandSpec,
};

// ------------------------------------------------------------------ the head (profile, facing right, 200 x 240 box, neck bottom ~ (71, 240))
const HEAD = 'M 60 178 C 34 160 18 130 20 92 C 22 44 62 10 112 10 C 150 12 170 40 172 72 L 174 96 C 180 106 188 118 192 128 C 194 134 188 138 178 137 C 181 145 182 151 177 155 C 182 160 180 167 173 169 C 172 180 166 188 156 193 C 140 199 120 197 108 189 C 100 184 92 182 86 188 L 88 240 L 54 240 L 60 178 Z';
const HEAD_OPEN = 'M 60 178 C 34 160 18 130 20 92 C 22 44 62 10 112 10 C 150 12 170 40 172 72 L 174 96 C 180 106 188 118 192 128 C 194 134 188 138 178 137 C 182 141 183 146 180 150 L 162 156 L 164 178 L 175 182 C 177 194 171 204 159 209 C 141 215 120 210 107 198 C 99 191 92 187 86 192 L 88 240 L 54 240 L 60 178 Z';
export type HeadP = { mouth?: 'closed' | 'shout' | 'o' | 'smile' | 'grit' | 'flat'; brow?: number; browTilt?: number; eye?: 'fwd' | 'up' | 'down' | 'downfwd'; lid?: number; pencil?: boolean; bud?: boolean; hairStyle?: 'wavy' | 'curly' };
export const Head: React.FC<HeadP & { pal: Pal }> = ({ pal, mouth = 'closed', brow = 0, browTilt = 0, eye = 'fwd', lid = 0, pencil, bud, hairStyle = 'wavy' }) => {
  const open = mouth === 'shout';
  const pup: Record<string, P> = { fwd: [158, 103], up: [157, 99], down: [156, 106], downfwd: [159, 106] };
  const [px, py] = pup[eye];
  return (
    <g>
      <path d={open ? HEAD_OPEN : HEAD} fill={pal.skin} stroke={INK} strokeWidth={3.2} strokeLinejoin="round" />
      <path d="M 60 178 C 34 160 18 130 20 92 C 40 120 60 140 86 150 C 92 170 92 182 86 188 L 88 240 L 54 240 Z" fill={pal.skinSh} opacity={0.5} />
      <path d={open ? 'M 107 198 C 120 210 141 215 159 209 C 150 202 130 196 112 192 Z' : 'M 108 189 C 120 197 140 199 156 193 C 150 186 132 182 112 182 Z'} fill={pal.skinSh} opacity={0.45} />
      {/* cheek warmth */}
      <ellipse cx={150} cy={140} rx={18} ry={12} fill="#d0604a" opacity={0.14} />
      {open && <g>
        <path d="M 180 150 L 162 156 L 164 178 L 175 182 C 179 172 182 160 180 150 Z" fill="#3a1212" stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
        <path d="M 165 172 Q 170 177 175 179" stroke="#c4555a" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M 164 157 L 179 152" stroke="#f3eee6" strokeWidth={3.4} strokeLinecap="round" />
      </g>}
      {hairStyle === 'wavy' ? (<g>
        <path d="M 16 106 C 4 54 44 2 112 2 C 150 4 176 26 180 58 C 176 66 168 70 160 64 C 154 72 144 74 136 66 C 128 74 116 72 110 62 C 104 76 92 86 78 92 C 64 100 60 118 64 132 C 44 132 26 124 16 106 Z" fill={pal.hair} stroke="#0c090d" strokeWidth={3} strokeLinejoin="round" />
        {/* wave locks */}
        <path d="M 40 40 C 56 26 74 34 86 22 M 70 58 C 88 46 104 54 118 40 M 120 22 C 136 14 150 22 162 18 M 30 76 C 42 66 52 72 62 64" stroke="#3b3442" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.75} />
        <path d="M 96 92 L 100 126 L 91 124 Z" fill={pal.hair} />
      </g>) : (<g>
        <path d="M 16 104 C 4 60 34 6 100 2 C 150 0 180 26 182 62 C 176 56 168 52 160 54 C 150 44 128 42 110 48 C 100 70 86 86 72 92 C 60 102 58 120 62 134 C 42 132 26 122 16 104 Z" fill={pal.hair} stroke="#0c090d" strokeWidth={3} />
        {[[40, 30], [70, 14], [104, 8], [138, 14], [30, 64], [22, 96], [164, 34]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill={pal.hair} />)}
      </g>)}
      {/* ear */}
      <ellipse cx={80} cy={112} rx={13} ry={20} fill={pal.skin} stroke={INK} strokeWidth={2.6} />
      <path d="M 78 102 C 86 106 86 118 78 122" stroke={pal.skinSh} strokeWidth={3} fill="none" />
      {bud && <g><ellipse cx={85} cy={112} rx={10} ry={9} fill="#f7f7f4" stroke="#6c727c" strokeWidth={1.8} /><rect x={81} y={116} width={8} height={22} rx={4} fill="#f7f7f4" stroke="#6c727c" strokeWidth={1.6} /><circle cx={87} cy={110} r={2.4} fill="#c9ced6" /></g>}
      {pencil && <g transform="rotate(-24 80 92)">
        <rect x={48} y={86} width={62} height={10} fill="#f0c02c" stroke="#5a4510" strokeWidth={1.6} />
        <rect x={48} y={86} width={62} height={3.5} fill="#fff2b0" opacity={0.5} />
        <rect x={38} y={86} width={11} height={10} fill="#e8899a" stroke="#7a3a44" strokeWidth={1.4} />
        <rect x={48} y={86} width={6} height={10} fill="#b8b8b8" />
        <path d="M 110 86 L 124 91 L 110 96 Z" fill="#e6c79a" stroke="#5a4510" strokeWidth={1.4} />
        <path d="M 120 89.6 L 124 91 L 120 92.4 Z" fill="#2a2a2a" />
      </g>}
      {/* brow, eye, lid */}
      <path d={`M 136 ${91 - brow + browTilt} Q 151 ${83 - brow} 167 ${89 - brow - browTilt}`} stroke={pal.hair} strokeWidth={6.5} fill="none" strokeLinecap="round" />
      <path d="M 143 104 Q 153 96 163 103 Q 153 109 143 104 Z" fill="#fbf6ee" stroke={INK} strokeWidth={2} />
      <circle cx={px} cy={py} r={4} fill="#1a1210" /><circle cx={px + 1.4} cy={py - 1.4} r={1.2} fill="#fff" />
      {lid > 0 && <path d={`M 142 103 Q 153 ${95} 164 102 L 164 ${102 + lid} Q 153 ${96 + lid} 142 ${103 + lid} Z`} fill={pal.skin} />}
      <path d="M 141 101 Q 153 93 165 100" stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <path d="M 176 128 C 180 132 182 134 178 137" stroke={pal.skinSh} strokeWidth={3} fill="none" />
      {mouth === 'closed' && <path d="M 175 156 Q 168 158 162 156" stroke="#5a2a20" strokeWidth={3} fill="none" strokeLinecap="round" />}
      {mouth === 'flat' && <path d="M 176 157 L 161 158" stroke="#5a2a20" strokeWidth={3} fill="none" strokeLinecap="round" />}
      {mouth === 'smile' && <path d="M 177 153 Q 170 161 160 155" stroke="#5a2a20" strokeWidth={3} fill="none" strokeLinecap="round" />}
      {mouth === 'o' && <ellipse cx={172} cy={158} rx={5} ry={7} fill="#3a1414" stroke={INK} strokeWidth={1.8} />}
      {mouth === 'grit' && <g><path d="M 178 152 L 160 154 L 162 162 L 176 161 Z" fill="#f3eee6" stroke={INK} strokeWidth={2} /><path d="M 161 158 L 177 157" stroke="#9a9a9a" strokeWidth={1.2} /></g>}
      <path d="M 160 124 C 152 132 146 138 150 146" stroke={pal.skinSh} strokeWidth={2} fill="none" opacity={0.6} />
    </g>
  );
};

// ------------------------------------------------------------------ the full figure
// Local frame: facing RIGHT, feet on y = 1000 when standing. Upper-body joints are given before `lean`
// (a rotation about the hip pivot). Arms: shoulder -> elbow -> wrist, then a hand pointing along the forearm.
export type ArmP = { sh?: P; el: P; wr: P; hand: HandSpec; mirror?: boolean; hs?: number; handOnly?: string[]; toward?: P; behind?: React.ReactNode };
export type LegP = { kn: P; an: P; toe?: number };
export type Pose = { lean?: number; pivot?: P; headTilt?: number; head: HeadP; near: ArmP; far: ArmP; legN: LegP; legF: LegP; hipN?: P; hipF?: P };

const Shoe: React.FC<{ at: P; toe?: number; pal: Pal; dark?: boolean }> = ({ at, toe = 0, pal, dark }) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${toe})`}>
    <path d="M -26 -14 L 14 -16 C 42 -12 64 6 64 24 L -28 24 Z" fill={dark ? '#1c1c20' : pal.shoe} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M -28 18 H 64" stroke={pal.sole} strokeWidth={6} />
  </g>
);

const ArmDraw: React.FC<{ a: ArmP; pal: Pal; dark?: boolean; sh: P }> = ({ a, pal, dark, sh }) => {
  const sleeve = dark ? pal.topSh : pal.top;
  const skin = dark ? pal.skinSh : pal.skin;
  const handPal = dark ? { ...pal, skin: pal.skinSh, skinSh: '#5e3522', nail: pal.skinSh } : pal;
  const cuffEnd = lerp(a.el, a.wr, 0.2);
  return (
    <g>
      {pal.rolled ? <>
        <Body segs={[{ p: [a.el, a.wr], w: 30 }]} fill={skin} />
        <Body segs={[{ p: [sh, a.el], w: 44 }]} fill={sleeve} />
        <Body segs={[{ p: [lerp(a.el, sh, 0.04), lerp(a.el, a.wr, 0.13)], w: 48 }]} fill={dark ? pal.topSh : pal.topHi} />
        <line x1={lerp(a.el, cuffEnd, 0.5)[0]} y1={lerp(a.el, cuffEnd, 0.5)[1]} x2={lerp(a.el, cuffEnd, 0.52)[0]} y2={lerp(a.el, cuffEnd, 0.52)[1]} stroke={INK} strokeWidth={46} strokeLinecap="butt" opacity={0.18} />
      </> : <>
        <Body segs={[{ p: [sh, a.el, a.wr], w: 42 }]} fill={sleeve} />
        <Body segs={[{ p: [lerp(a.el, a.wr, 0.86), a.wr], w: 40 }]} fill={dark ? '#6e1a18' : pal.topSh} />
      </>}
      {a.behind}
      <PlaceHand at={a.wr} toward={a.toward ?? [a.wr[0] + (a.wr[0] - a.el[0]), a.wr[1] + (a.wr[1] - a.el[1])]} s={a.hs ?? 0.64} mirror={a.mirror}>
        <Hand h={a.hand} pal={handPal} only={a.handOnly} />
      </PlaceHand>
    </g>
  );
};

export const Person: React.FC<{ pal: Pal; pose: Pose; who: 'stu' | 'friend'; extraFront?: React.ReactNode; extraHand?: React.ReactNode }> = ({ pal, pose, who, extraFront }) => {
  const pv = pose.pivot ?? [100, 560];
  const hipN = pose.hipN ?? [96, 556], hipF = pose.hipF ?? [112, 556];
  const shN = pose.near.sh ?? [96, 236], shF = pose.far.sh ?? [116, 232];
  const tilt = pose.headTilt ?? 0;
  const isStu = who === 'stu';
  return (
    <g>
      {/* far leg */}
      <Body segs={[{ p: [hipF, pose.legF.kn, pose.legF.an], w: 50 }]} fill={pal.pantsSh} />
      <Shoe at={pose.legF.an} toe={pose.legF.toe} pal={pal} dark={who === 'stu'} />
      {who !== 'stu' && <g opacity={0.3}><Shoe at={pose.legF.an} toe={pose.legF.toe} pal={{ ...pal, shoe: '#000', sole: '#000' }} /></g>}
      <g transform={`rotate(${pose.lean ?? 0} ${pv[0]} ${pv[1]})`}>
        {/* backpack (friend) sits behind the far arm */}
        {!isStu && <g>
          <path d="M 44 214 C 0 220 -12 300 -6 380 C -2 430 10 456 40 460 L 62 456 L 60 214 Z" fill="#1d1e24" stroke={INK} strokeWidth={3} />
          <path d="M 4 330 L 46 334 L 46 396 L 8 392 Z" fill="#2b2d35" stroke={INK} strokeWidth={2.4} />
          <path d="M 10 250 C 20 236 36 230 50 232" stroke="#3c3f49" strokeWidth={4} fill="none" />
        </g>}
        <ArmDraw a={pose.far} pal={pal} dark sh={shF} />
      </g>
      {/* near leg */}
      <Body segs={[{ p: [hipN, pose.legN.kn, pose.legN.an], w: 52 }]} fill={pal.pants} />
      <path d={`M ${hipN[0] + 8} ${hipN[1] + 30} L ${pose.legN.kn[0] + 12} ${pose.legN.kn[1]}`} stroke={pal.pantsSh} strokeWidth={10} opacity={0.5} strokeLinecap="round" />
      <Shoe at={pose.legN.an} toe={pose.legN.toe} pal={pal} />
      <g transform={`rotate(${pose.lean ?? 0} ${pv[0]} ${pv[1]})`}>
        {/* torso */}
        <path d="M 46 190 C 70 172 136 170 158 188 L 168 330 C 172 420 166 520 162 572 L 44 572 C 36 480 32 380 38 300 Z" fill={pal.top} stroke={INK} strokeWidth={3.2} strokeLinejoin="round" />
        <path d="M 46 190 C 40 260 36 380 38 480 L 44 572 L 78 572 C 70 460 70 300 82 196 Z" fill={pal.topSh} opacity={0.5} />
        {isStu ? <>
          {/* open overshirt: charcoal tee shows down the front edge */}
          <path d="M 134 186 L 158 188 L 168 330 C 172 420 166 520 162 572 L 144 572 C 148 480 150 380 146 300 Z" fill={pal.under} stroke={INK} strokeWidth={2.4} />
          <path d="M 134 186 C 142 250 150 380 144 572" stroke={pal.topSh} strokeWidth={5} fill="none" />
          <path d="M 98 186 L 136 184 L 128 232 Z" fill={pal.topHi} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M 104 300 L 136 300 L 136 342 L 104 342 Z" fill={pal.top} stroke={pal.topSh} strokeWidth={3} />
          <path d="M 104 300 L 136 300 L 136 310 L 104 310 Z" fill={pal.topSh} opacity={0.6} />
          {Array.from({ length: 4 }, (_, i) => <circle key={i} cx={140 + i * 1.5} cy={250 + i * 80} r={3.4} fill="#e9e2cf" stroke={INK} strokeWidth={1} />)}
        </> : <>
          {/* zipped jacket */}
          <path d="M 152 194 C 158 260 164 380 158 560" stroke="#5a1210" strokeWidth={3} fill="none" />
          <path d="M 44 540 L 162 540 L 162 572 L 44 572 Z" fill={pal.topSh} stroke={INK} strokeWidth={2.4} />
          <path d="M 90 184 C 110 176 140 178 156 192 L 160 212 C 136 204 108 204 86 212 Z" fill={pal.topSh} stroke={INK} strokeWidth={2.4} />
          <path d="M 60 212 C 64 300 70 380 78 440" stroke="#111216" strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M 116 330 L 150 330" stroke="#5a1210" strokeWidth={3} />
        </>}
        {/* head */}
        <g transform={`rotate(${tilt} 96 196)`}>
          <g transform="translate(38 -6) scale(0.8)"><Head pal={pal} {...pose.head} hairStyle={isStu ? 'wavy' : 'curly'} bud={!isStu} /></g>
        </g>
        {extraFront}
        <ArmDraw a={pose.near} pal={pal} sh={shN} />
      </g>
    </g>
  );
};

// standing defaults
export const LEGS_STAND: { legN: LegP; legF: LegP } = { legN: { kn: [104, 770], an: [100, 966] }, legF: { kn: [118, 770], an: [128, 960] } };

// ------------------------------------------------------------------ props
export const Tag: React.FC<{ x: number; y: number; t: string; s?: number; rot?: number }> = ({ x, y, t, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-40} y={-22} width={80} height={44} rx={8} fill="#f6f2e8" stroke={INK} strokeWidth={3} />
    <text x={0} y={11} textAnchor="middle" style={{ font: '800 30px Inter, sans-serif' }} fill="#1a1a1a">{t}</text>
  </g>
);

// miniature screw bulb, upright, base at (0,0); globe above. `state`: off | lit | burnt
export const MiniBulb: React.FC<{ state: 'off' | 'lit' | 'burnt'; s?: number; id: string }> = ({ state, s = 1, id }) => (
  <g transform={`scale(${s})`}>
    <defs>
      <radialGradient id={`${id}-glass`} cx="0.38" cy="0.35" r="0.7"><stop offset="0" stopColor={state === 'lit' ? '#fffbe6' : '#f2f6fb'} stopOpacity={state === 'lit' ? 1 : 0.55} /><stop offset="1" stopColor={state === 'lit' ? '#ffcf6a' : state === 'burnt' ? '#6b6a66' : '#9fb0c6'} stopOpacity={state === 'lit' ? 0.95 : 0.45} /></radialGradient>
    </defs>
    {/* screw base */}
    <path d="M -15 0 L 15 0 L 15 -30 L -15 -30 Z" fill="#b9bcc2" stroke={INK} strokeWidth={2.4} />
    {[-6, -14, -22].map((y) => <path key={y} d={`M -15 ${y} L 15 ${y - 4}`} stroke="#7d828b" strokeWidth={2.2} />)}
    <path d="M -6 0 L 6 0 L 4 6 L -4 6 Z" fill="#6d6f74" stroke={INK} strokeWidth={1.6} />
    {/* glass globe */}
    <path d="M -13 -30 C -30 -40 -30 -82 0 -84 C 30 -82 30 -40 13 -30 Z" fill={`url(#${id}-glass)`} stroke={INK} strokeWidth={2.4} />
    {state === 'burnt' && <ellipse cx={4} cy={-66} rx={13} ry={9} fill="#4b4640" opacity={0.45} />}
    {/* lead-in wires and filament */}
    <path d="M -5 -30 L -7 -54 M 5 -30 L 7 -54" stroke="#6e6e6e" strokeWidth={1.6} />
    {state === 'burnt'
      ? <path d="M -7 -54 L -4 -58 L -1 -55 M 7 -54 L 4 -59" stroke="#2b2b2b" strokeWidth={1.8} fill="none" />
      : <path d="M -7 -54 L -4 -58 L -1 -54 L 2 -58 L 5 -54 L 7 -54" stroke={state === 'lit' ? '#fff8d0' : '#3a3a3a'} strokeWidth={state === 'lit' ? 3 : 1.8} fill="none" />}
    <path d="M -16 -66 C -16 -76 -8 -80 -2 -80" stroke="#fff" strokeWidth={3} fill="none" opacity={0.7} strokeLinecap="round" />
  </g>
);

// a small socket on a wooden block with two screw terminals (left, right). Bulb sits at (0, -34).
export const Socket: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <g>
    <path d="M -70 0 L 70 0 L 82 26 L -82 26 Z" fill="#b3824e" stroke={INK} strokeWidth={3} />
    <path d="M -82 26 L 82 26 L 82 40 L -82 40 Z" fill="#7c5532" stroke={INK} strokeWidth={3} />
    <ellipse cx={0} cy={4} rx={26} ry={9} fill="#3a3b40" stroke={INK} strokeWidth={2.4} />
    <path d="M -24 4 L -24 -34 L 24 -34 L 24 4" fill="#4a4c52" stroke={INK} strokeWidth={2.4} />
    <ellipse cx={0} cy={-34} rx={24} ry={7} fill="#5d6068" stroke={INK} strokeWidth={2} />
    {[-52, 52].map((x) => <g key={x}><ellipse cx={x} cy={12} rx={11} ry={6} fill="#d8b25a" stroke={INK} strokeWidth={2} /><path d={`M ${x - 6} 12 L ${x + 6} 12`} stroke={INK} strokeWidth={1.6} /></g>)}
    {children && <g transform="translate(0 -34)">{children}</g>}
  </g>
);

// AA cells in a black holder, seen from above at a slight angle
export const Pack: React.FC<{ cells: number }> = ({ cells }) => (
  <g>
    <rect x={-8} y={-8} width={cells * 46 + 16} height={150} rx={10} fill="#17181c" stroke={INK} strokeWidth={3} />
    {Array.from({ length: cells }, (_, i) => (
      <g key={i} transform={`translate(${i * 46 + 4} 4)`}>
        <rect width={38} height={126} rx={9} fill={i % 2 ? '#d2a23a' : '#2f5fa6'} stroke={INK} strokeWidth={2.4} />
        <rect width={38} height={30} rx={9} fill={i % 2 ? '#2f5fa6' : '#d2a23a'} stroke={INK} strokeWidth={2.4} />
        <rect x={13} y={-6} width={12} height={8} rx={2} fill="#c9ccd2" stroke={INK} strokeWidth={1.4} />
        <rect x={6} y={40} width={6} height={70} fill="#fff" opacity={0.25} />
      </g>
    ))}
  </g>
);

// a small push switch on a little base; `down` shows the button pressed
export const PushSwitch: React.FC<{ down?: boolean }> = ({ down }) => (
  <g>
    <path d="M -46 0 L 46 0 L 54 22 L -54 22 Z" fill="#26272c" stroke={INK} strokeWidth={3} />
    <rect x={-54} y={22} width={108} height={12} fill="#141519" stroke={INK} strokeWidth={2.4} />
    <ellipse cx={0} cy={down ? 6 : 0} rx={20} ry={8} fill="#b8322a" stroke={INK} strokeWidth={2.4} />
    {!down && <path d="M -20 0 L -20 -12 L 20 -12 L 20 0" fill="#d4453b" stroke={INK} strokeWidth={2.4} />}
    {!down && <ellipse cx={0} cy={-12} rx={20} ry={8} fill="#e05a4e" stroke={INK} strokeWidth={2.4} />}
    {[-38, 38].map((x) => <ellipse key={x} cx={x} cy={10} rx={7} ry={4} fill="#d8b25a" stroke={INK} strokeWidth={1.6} />)}
  </g>
);

// wire: an insulated lead drawn as an outlined tube along a cubic path
export const Wire: React.FC<{ d: string; c: string; w?: number }> = ({ d, c, w = 9 }) => (
  <g fill="none" strokeLinecap="round"><path d={d} stroke={INK} strokeWidth={w + 5} /><path d={d} stroke={c} strokeWidth={w} /><path d={d} stroke="#fff" strokeWidth={2} opacity={0.25} transform="translate(-1.5 -2)" /></g>
);

// candle in a brass holder; flame at (0, -170)
export const Candle: React.FC<{ s?: number; id: string; glow?: number }> = ({ s = 1, id, glow = 1 }) => (
  <g transform={`scale(${s})`}>
    <defs>
      <radialGradient id={`${id}-cg`}><stop offset="0" stopColor="#ffd890" stopOpacity={0.8 * glow} /><stop offset="0.4" stopColor="#ffb050" stopOpacity={0.25 * glow} /><stop offset="1" stopColor="#ffb050" stopOpacity={0} /></radialGradient>
    </defs>
    <ellipse cx={0} cy={0} rx={56} ry={14} fill="#a77a2e" stroke={INK} strokeWidth={3} />
    <path d="M -56 0 C -50 -14 50 -14 56 0" fill="#c9993e" stroke={INK} strokeWidth={3} />
    <path d="M -10 -10 C -8 -30 8 -30 10 -10" fill="#c9993e" stroke={INK} strokeWidth={2.4} />
    <rect x={-17} y={-140} width={34} height={118} rx={4} fill="#f1e8d6" stroke={INK} strokeWidth={3} />
    <path d="M -17 -140 C -10 -134 6 -134 17 -140 L 17 -120 C 14 -114 10 -122 8 -112 L 8 -132 Z" fill="#fbf6ea" stroke={INK} strokeWidth={1.6} />
    <path d="M 0 -140 L 0 -150" stroke="#222" strokeWidth={3} />
    <circle cx={0} cy={-162} r={170} fill={`url(#${id}-cg)`} style={{ mixBlendMode: 'screen' }} />
    <path d="M 0 -186 C 12 -170 12 -154 0 -148 C -12 -154 -12 -170 0 -186 Z" fill="#ffc24a" />
    <path d="M 0 -176 C 6 -166 6 -156 0 -152 C -6 -156 -6 -166 0 -176 Z" fill="#fff6d8" />
  </g>
);

// shallow bowl seen from above at a 3/4 angle; `foil` lines it with crinkled aluminium
export const BowlTop: React.FC<{ rx: number; ry: number; foil?: boolean; id: string }> = ({ rx, ry, foil, id }) => (
  <g>
    <defs>
      <radialGradient id={`${id}-in`} cx="0.45" cy="0.6" r="0.7"><stop offset="0" stopColor={foil ? '#f4f7fb' : '#d8d2c6'} /><stop offset="0.55" stopColor={foil ? '#aab4c2' : '#b4ab9c'} /><stop offset="1" stopColor={foil ? '#5d6878' : '#7b7266'} /></radialGradient>
    </defs>
    <path d={`M ${-rx} 0 C ${-rx} ${ry * 2.2} ${rx} ${ry * 2.2} ${rx} 0`} fill="#d9d2c4" stroke={INK} strokeWidth={3} />
    <path d={`M ${-rx} 0 C ${-rx} ${ry * 2.2} ${rx} ${ry * 2.2} ${rx} 0`} fill="#000" opacity={0.18} />
    <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="#ebe5d8" stroke={INK} strokeWidth={3} />
    <ellipse cx={0} cy={ry * 0.06} rx={rx * 0.93} ry={ry * 0.86} fill={`url(#${id}-in)`} stroke={INK} strokeWidth={2} />
    {foil && <g stroke="#ffffff" strokeLinecap="round" fill="none">
      <path d={`M ${-rx * 0.6} ${-ry * 0.2} C ${-rx * 0.3} ${ry * 0.1} ${-rx * 0.1} ${-ry * 0.3} ${rx * 0.2} ${-ry * 0.05}`} strokeWidth={4} opacity={0.8} />
      <path d={`M ${-rx * 0.2} ${ry * 0.45} C ${0} ${ry * 0.3} ${rx * 0.3} ${ry * 0.5} ${rx * 0.55} ${ry * 0.25}`} strokeWidth={3} opacity={0.6} />
      <path d={`M ${-rx * 0.75} ${ry * 0.25} L ${-rx * 0.55} ${ry * 0.35} M ${rx * 0.6} ${-ry * 0.35} L ${rx * 0.75} ${-ry * 0.1}`} stroke="#5f6a7a" strokeWidth={2} opacity={0.7} />
      {/* foil folded over the rim */}
      <path d={`M ${-rx * 0.98} ${-ry * 0.1} C ${-rx * 0.7} ${-ry * 1.02} ${rx * 0.7} ${-ry * 1.02} ${rx * 0.98} ${-ry * 0.1}`} stroke="#c9d1dc" strokeWidth={10} opacity={0.9} />
    </g>}
  </g>
);

// toy car (side-ish 3/4 view), body at origin; `open` lifts the shell off to show the battery bay
export const ToyCar: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M -90 0 L -80 -30 L -40 -34 L -20 -60 L 40 -60 L 62 -34 L 92 -28 L 96 0 Z" fill="#d23a30" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M -14 -54 L 36 -54 L 52 -34 L -30 -34 Z" fill="#9fc2e0" stroke={INK} strokeWidth={2.4} />
    <path d="M 10 -54 L 10 -34" stroke={INK} strokeWidth={2.4} />
    {[-52, 58].map((x) => <g key={x}><circle cx={x} cy={2} r={20} fill="#1b1b1f" stroke={INK} strokeWidth={3} /><circle cx={x} cy={2} r={8} fill="#c7c9ce" /></g>)}
  </g>
);

// folded aluminium foil sheet
export const FoilSheet: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <g>
    <path d={`M 0 0 L ${w} ${-h * 0.1} L ${w * 1.04} ${h * 0.9} L ${w * 0.04} ${h} Z`} fill="#c6ced9" stroke={INK} strokeWidth={2.6} />
    <path d={`M ${w * 0.5} ${-h * 0.05} L ${w * 0.54} ${h * 0.95}`} stroke="#8994a4" strokeWidth={2.4} />
    <path d={`M ${w * 0.08} ${h * 0.2} L ${w * 0.4} ${h * 0.1} M ${w * 0.6} ${h * 0.6} L ${w * 0.95} ${h * 0.5}`} stroke="#fff" strokeWidth={3} opacity={0.8} />
    <path d={`M ${w * 0.15} ${h * 0.7} L ${w * 0.3} ${h * 0.55} L ${w * 0.42} ${h * 0.75}`} stroke="#7c8696" strokeWidth={1.6} fill="none" />
  </g>
);

// the room's casement window (two casements under a transom), used inside and outside
export const WindowFrame: React.FC<{ w: number; h: number; frame: string; frameSh: string; glass: React.ReactNode }> = ({ w, h, frame, frameSh, glass }) => {
  const t = 20, tr = h * 0.24;
  return (
    <g>
      {glass}
      <path d={`M 0 0 H ${w} V ${h} H 0 Z M ${t} ${t} V ${tr} H ${w - t} V ${t} Z M ${t} ${tr + t * 0.6} V ${h - t} H ${w / 2 - t * 0.35} V ${tr + t * 0.6} Z M ${w / 2 + t * 0.35} ${tr + t * 0.6} V ${h - t} H ${w - t} V ${tr + t * 0.6} Z`} fill={frame} fillRule="evenodd" stroke={INK} strokeWidth={3} />
      <rect x={-14} y={h - 4} width={w + 28} height={16} fill={frameSh} stroke={INK} strokeWidth={3} />
    </g>
  );
};

// chalkboard sketches (no words): 1 = flat metal reflecting a ray, 2 = rays bouncing forward off a curved mirror
export const ChalkSketches: React.FC<{ hi?: number }> = ({ hi = 0 }) => (
  <g stroke="#eef0e8" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9}>
    {/* sketch 1 */}
    <g transform="translate(30 40)">
      <path d="M 0 150 H 170" strokeWidth={6} />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${10 + i * 21} 156 l -12 14`} strokeWidth={3} />)}
      <path d="M 10 30 L 85 148 L 160 30" />
      <path d="M 55 100 l -2 -16 m 2 16 l -14 -6" />
      <path d="M 130 78 l 14 -4 m -14 4 l 4 -14" />
      <path d="M 85 148 V 50" strokeDasharray="6 9" strokeWidth={3} />
    </g>
    {/* sketch 2 */}
    <g transform="translate(250 20)" opacity={0.85 + hi * 0.15} strokeWidth={4 + hi * 1.5}>
      <path d="M 40 10 C 0 60 0 140 40 190" strokeWidth={6 + hi * 2} />
      <circle cx={62} cy={100} r={7} fill="#eef0e8" />
      {[[22, 40], [10, 75], [8, 125], [22, 160]].map(([x, y], i) => <g key={i}><path d={`M 62 100 L ${x} ${y} L 170 ${y}`} /><path d={`M 158 ${y - 8} L 170 ${y} L 158 ${y + 8}`} /></g>)}
    </g>
  </g>
);
