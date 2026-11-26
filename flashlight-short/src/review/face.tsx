// The student's head, rebuilt as a true three-quarter view facing our LEFT (the reference's angle).
// Face centre line (nose) sits off-centre at x = -24; the far (left) eye is narrower and the far cheek recedes;
// the near (right) ear is visible. Units: eye line y = 0, brow line y = -24, chin y = 154, hair top about y = -170.
// Every expressive part is its own <g id>: eye-whites, pupils, eyelids, brows, mouth. No accessories, no pencil.
import React from 'react';
import { C } from './student';

export type Face = {
  // pupils: offset in eye units (-1..1 left/right, -1..1 up/down)
  look: [number, number];
  // upper lid: 0 = relaxed, + lowers it over the eye (0..1), - lifts it (surprise)
  lidFar: number; lidNear: number;
  // brows: inner/outer end offsets (y, + is down) and how far the inner ends pull toward the nose (x)
  browFar: { inY: number; outY: number; inX: number }; browNear: { inY: number; outY: number; inX: number };
  // mouth: corners (y, + is down) and opening (px)
  mouth: { left: number; right: number; open: number; press: number };
};
export const NEUTRAL: Face = {
  look: [0.45, 0.05], lidFar: 0.1, lidNear: 0.1,
  browFar: { inY: 0, outY: 0, inX: 0 }, browNear: { inY: 0, outY: 0, inX: 0 },
  mouth: { left: -1, right: -8, open: 0, press: 0 },
};

const LS = C.lineSkin;
const EYE = { far: { x: -58, w: 19 }, near: { x: 16, w: 26 } };

const Eye: React.FC<{ cx: number; hw: number; lid: number; look: [number, number]; id: string }> = ({ cx, hw, lid, look, id }) => {
  const hh = 11;
  // almond: the outer corner sits a touch higher than the inner
  const top = (k: number) => `M ${cx - hw} 2 Q ${cx - hw * 0.1} ${-hh * 1.55 + k} ${cx + hw} -1`;
  const white = `M ${cx - hw} 2 Q ${cx - hw * 0.1} ${-hh * 1.55} ${cx + hw} -1 Q ${cx + hw * 0.1} ${hh * 1.05} ${cx - hw} 2 Z`;
  const lidDrop = Math.max(0, lid) * hh * 1.6, lidLift = Math.min(0, lid) * hh * 0.5;
  const px = cx + look[0] * hw * 0.42, py = 0.5 + look[1] * hh * 0.45;
  return (
    <g id={id}>
      <clipPath id={`${id}-clip`}><path d={white} /></clipPath>
      <g id={`${id}-white`}><path d={white} fill={C.white} /></g>
      <g id={`${id}-pupil`} clipPath={`url(#${id}-clip)`}>
        <circle cx={px} cy={py} r={hw * 0.56} fill={C.iris} />
        <circle cx={px} cy={py} r={hw * 0.34} fill={C.eye} />
        <circle cx={px + hw * 0.16} cy={py - hw * 0.18} r={hw * 0.11} fill="#fff" />
        {/* the lid's shadow on the eyeball */}
        <path d={`M ${cx - hw} 2 Q ${cx - hw * 0.1} ${-hh * 1.55 + lidDrop} ${cx + hw} -1 L ${cx + hw} ${-hh * 2} L ${cx - hw} ${-hh * 2} Z`} fill={C.skin} />
        <path d={`M ${cx - hw} 2 Q ${cx - hw * 0.1} ${-hh * 1.55 + lidDrop + 3} ${cx + hw} 0`} fill="none" stroke="#000" strokeOpacity={0.18} strokeWidth={4} />
      </g>
      <g id={`${id}-lid`}>
        {/* upper lid line (lash line) with a soft outer flick, and the lid crease */}
        <path d={top(lidDrop + lidLift)} fill="none" stroke={C.lash} strokeWidth={4} strokeLinecap="round" />
        <path d={`M ${cx + hw - 1} -1 q 4 -1 6 -4`} fill="none" stroke={C.lash} strokeWidth={2.6} strokeLinecap="round" />
        <path d={`M ${cx - hw * 0.75} ${-hh * 1.25 - 4 + lidLift} Q ${cx} ${-hh * 1.9 - 3 + lidLift} ${cx + hw * 0.85} ${-hh * 1.1 - 4 + lidLift}`} fill="none" stroke={LS} strokeWidth={1.6} strokeLinecap="round" opacity={0.75} />
        {/* lower lid */}
        <path d={`M ${cx - hw * 0.6} ${hh * 0.85} Q ${cx + hw * 0.1} ${hh * 1.2} ${cx + hw * 0.75} ${hh * 0.55}`} fill="none" stroke={LS} strokeWidth={1.4} strokeLinecap="round" opacity={0.7} />
      </g>
    </g>
  );
};

// a relaxed, tapered brow: full at the inner end, tapering outward
const Brow: React.FC<{ x0: number; x1: number; y0: number; y1: number; arch: number; th: number; id: string }> = ({ x0, x1, y0, y1, arch, th, id }) => {
  const xm = x0 + (x1 - x0) * 0.55, ym = Math.min(y0, y1) - arch;
  return <g id={id}><path d={`M ${x0} ${y0} Q ${xm} ${ym} ${x1} ${y1} Q ${xm} ${ym + th * 0.55} ${x0} ${y0 + th} Z`} fill={C.brow} stroke={C.brow} strokeWidth={1.2} strokeLinejoin="round" /></g>;
};

export const Head3Q: React.FC<{ f?: Face; neck?: boolean }> = ({ f = NEUTRAL, neck = true }) => {
  const m = f.mouth;
  const mx = -28, my = 92;
  return (
    <g>
      {/* ---- back hair (behind the ear and down the nape) */}
      <path d="M 76 -90 C 140 -110 186 -64 168 -20 C 178 10 160 50 130 74 C 120 56 114 32 110 14 Z" fill={C.hairSh} />
      {/* ---- neck */}
      {neck && <g id="neck">
        <path d="M -30 110 C -28 140 -24 168 -16 200 L 82 200 C 70 168 64 136 66 96 Z" fill="url(#fg-skin)" stroke={LS} strokeWidth={2} />
        <path d="M -30 120 C -2 148 36 146 66 108 L 68 138 C 40 164 4 166 -26 146 Z" fill={C.skinSh} opacity={0.55} />
        <path d="M 6 160 q 6 10 0 20" fill="none" stroke={C.skinSh} strokeWidth={2} opacity={0.6} />
      </g>}
      {/* ---- the near ear */}
      <g id="ear">
        <path d="M 100 -14 C 122 -26 138 4 132 32 C 128 54 114 64 102 58 C 106 40 106 14 100 -14 Z" fill="url(#fg-skin)" stroke={LS} strokeWidth={2} />
        <path d="M 110 -2 C 122 4 124 24 118 40 C 114 46 110 44 110 38" fill="none" stroke={C.skinSh} strokeWidth={2.4} strokeLinecap="round" />
      </g>
      {/* ---- face: far contour (temple, cheekbone, cheek, chin) and the near jaw back to the ear */}
      <g id="face">
        <path id="face-shape" d="M -84 -74 C -94 -44 -96 -14 -92 8 C -90 36 -84 62 -70 88 C -56 114 -32 134 -8 138 C 18 140 46 128 66 108 C 86 88 98 64 102 40 L 104 -20 C 102 -56 88 -86 66 -98 L -60 -98 Z"
          fill="url(#fg-skin)" stroke={LS} strokeWidth={2.2} strokeLinejoin="round" />
        {/* soft modelling: the receding far side, under the cheekbone on the near side, the jaw */}
        <path d="M -84 -74 C -94 -44 -96 -14 -92 8 C -90 36 -84 62 -70 88 C -56 114 -32 134 -8 138 C -32 118 -48 92 -56 64 C -62 36 -66 0 -66 -40 Z" fill={C.skinSh} opacity={0.3} />
        <path d="M 34 46 C 52 60 62 84 58 108 C 72 96 86 78 94 54 C 80 50 56 46 34 46 Z" fill={C.skinSh} opacity={0.32} />
        <path d="M 4 30 C 20 26 36 30 46 40" fill="none" stroke={C.skinHi} strokeWidth={10} strokeLinecap="round" opacity={0.35} />
        <ellipse cx={-64} cy={40} rx={14} ry={7} fill={C.blush} opacity={0.18} />
        <ellipse cx={26} cy={50} rx={18} ry={9} fill={C.blush} opacity={0.18} />
        <path d="M -22 126 C -10 132 4 132 16 126" fill="none" stroke={C.skinSh} strokeWidth={2} opacity={0.5} />
      </g>
      {/* ---- nose: straight bridge, tip off-centre to the left, the near nostril wing */}
      <g id="nose">
        <path d="M -24 -4 C -26 18 -30 36 -34 50" fill="none" stroke={C.skinSh} strokeWidth={2.6} strokeLinecap="round" opacity={0.85} />
        <path d="M -52 52 C -50 62 -36 66 -24 61" fill="none" stroke={LS} strokeWidth={2.2} strokeLinecap="round" />
        <path d="M -24 54 C -15 54 -13 63 -20 66" fill="none" stroke={LS} strokeWidth={2} strokeLinecap="round" />
        <path d="M -44 62 q 4 3 8 2" fill="none" stroke={LS} strokeWidth={1.8} strokeLinecap="round" opacity={0.8} />
        <ellipse cx={-40} cy={48} rx={5} ry={3.4} fill={C.skinHi} opacity={0.5} />
      </g>
      {/* ---- eyes (whites, pupils, lids separately editable) */}
      <Eye cx={EYE.far.x} hw={EYE.far.w} lid={f.lidFar} look={f.look} id="eye-far" />
      <Eye cx={EYE.near.x} hw={EYE.near.w} lid={f.lidNear} look={f.look} id="eye-near" />
      {/* ---- brows */}
      <g id="brows">
        <Brow id="brow-far" x0={-38 - f.browFar.inX} x1={-80} y0={-22 + f.browFar.inY} y1={-18 + f.browFar.outY} arch={6} th={11} />
        <Brow id="brow-near" x0={-12 - f.browNear.inX} x1={44} y0={-24 + f.browNear.inY} y1={-20 + f.browNear.outY} arch={8} th={14} />
      </g>
      {/* ---- mouth: a closed, relaxed half-smile by default */}
      <g id="mouth">
        {m.open > 0 && <path d={`M ${mx - 18} ${my + m.left} Q ${mx} ${my + 2 + m.open * 0.4} ${mx + 22} ${my + m.right} Q ${mx + 2} ${my + m.open * 1.6} ${mx - 18} ${my + m.left} Z`} fill="#4a1a1a" />}
        {m.open > 0 && <path d={`M ${mx - 12} ${my + 1 + m.left * 0.5} Q ${mx + 2} ${my + 3} ${mx + 16} ${my + m.right * 0.6}`} fill="none" stroke="#f3eee6" strokeWidth={3} strokeLinecap="round" />}
        <path d={`M ${mx - 30} ${my + m.left} Q ${mx - 4} ${my + 7 - m.press} ${mx + 30} ${my + m.right}`} fill="none" stroke={C.lip} strokeWidth={3} strokeLinecap="round" />
        {/* the right corner tuck of the half-smile, the lower lip */}
        {m.right < -1 && <path d={`M ${mx + 30} ${my + m.right} q 5 1 6 6`} fill="none" stroke={C.skinSh} strokeWidth={1.8} strokeLinecap="round" />}
        <path d={`M ${mx - 16} ${my + 15 + m.open} Q ${mx} ${my + 20 + m.open} ${mx + 16} ${my + 14 + m.open}`} fill="none" stroke={C.skinSh} strokeWidth={2.2} strokeLinecap="round" opacity={0.75} />
        <path d={`M ${mx - 2} ${my - 20} q 2 8 0 14`} fill="none" stroke={C.skinSh} strokeWidth={1.6} opacity={0.5} />
      </g>
      {/* ---- hair: lower silhouette, broad loose locks swept toward the back (our right), a curl across the forehead */}
      <g id="hair">
        <clipPath id="hair-clip"><path id="hair-shape" d={HAIR} /></clipPath>
        <path d={HAIR} fill={C.hair} />
        <g clipPath="url(#hair-clip)">
          {/* valleys between the locks */}
          {['M -116 -120 C -76 -170 0 -186 70 -166', 'M -90 -84 C -44 -130 40 -144 120 -120', 'M 10 -90 C 60 -110 120 -106 160 -76', 'M 116 -40 C 140 -24 154 0 150 26', 'M -40 -150 C 0 -176 50 -180 96 -160']
            .map((d, i) => <path key={i} d={d} fill="none" stroke={C.hairSh} strokeWidth={9} strokeLinecap="round" />)}
          {/* soft sheen on the lock crests */}
          {['M -100 -138 C -60 -176 10 -190 76 -176', 'M -76 -100 C -30 -142 40 -152 116 -134', 'M 24 -100 C 70 -120 128 -116 160 -90', 'M 128 -54 C 152 -38 166 -12 162 16', 'M -108 -90 C -112 -108 -104 -124 -90 -130', 'M 120 30 C 132 44 136 58 130 70']
            .map((d, i) => <path key={i} d={d} fill="none" stroke={C.hairHi} strokeWidth={3.4} strokeLinecap="round" opacity={0.85} />)}
          {/* warm rim light along the top-left edge, as in the reference */}
          <path d="M -122 -70 C -138 -100 -132 -136 -108 -150 C -96 -176 -60 -192 -26 -190" fill="none" stroke={C.rim} strokeWidth={10} strokeLinecap="round" opacity={0.7} />
        </g>
        <path d={HAIR} fill="none" stroke={C.hairLine} strokeWidth={2} strokeLinejoin="round" />
        <g id="curl-ends" stroke={C.hairLine} strokeWidth={1.8} strokeLinejoin="round">
          <path d="M -89 -101 C -113 -104 -122 -124 -111 -137 C -106 -124 -95 -118 -83 -120 Z" fill="url(#fg-rim)" />
          <path d="M -81 -137 C -94 -157 -85 -176 -64 -177 C -74 -166 -75 -154 -67 -145 Z" fill="url(#fg-rim)" />
          <path d="M -42 -168 C -39 -187 -19 -193 -5 -184 C -17 -182 -27 -176 -28 -166 Z" fill={C.hair} />
          <path d="M 109 -137 C 129 -152 151 -146 156 -127 C 145 -135 131 -134 120 -126 Z" fill={C.hair} />
          <path d="M 134 -40 C 156 -35 164 -17 154 -1 C 149 -14 142 -18 129 -18 Z" fill={C.hair} />
          <path d="M 120 10 C 137 18 142 36 129 49 C 128 36 121 29 112 25 Z" fill={C.hair} />
          <path d="M -95 -79 C -109 -74 -113 -59 -103 -49 C -102 -59 -95 -65 -86 -67 Z" fill="url(#fg-rim)" />
        </g>
        {/* the loose curl that falls across the forehead */}
        <g id="forehead-curl">
          <path d="M -2 -68 C -30 -60 -52 -42 -50 -22 C -48 -10 -34 -10 -32 -22 C -32 -36 -18 -52 8 -58 Z" fill={C.hair} stroke={C.hairLine} strokeWidth={1.8} strokeLinejoin="round" />
          <path d="M -8 -62 C -30 -52 -44 -38 -44 -26" fill="none" stroke={C.hairHi} strokeWidth={2.6} strokeLinecap="round" opacity={0.85} />
        </g>
      </g>
    </g>
  );
};
// hair silhouette: low over the forehead, full but not tall, swept back over the ear to the nape
const HAIR = 'M -86 -46 C -108 -60 -126 -78 -122 -100 C -138 -110 -134 -140 -112 -146 C -112 -172 -76 -192 -44 -184 C -20 -204 26 -204 54 -186 C 86 -194 124 -176 136 -148 C 164 -144 178 -112 168 -88 C 186 -68 182 -36 164 -22 C 176 0 168 30 150 40 C 154 58 144 76 126 80 C 128 60 122 40 116 28 C 110 10 104 -6 100 -14 C 100 -40 92 -56 80 -62 C 60 -60 40 -50 24 -54 C 8 -62 -10 -56 -24 -50 C -40 -54 -58 -50 -70 -46 C -76 -44 -82 -44 -86 -46 Z';

export const FaceDefs: React.FC = () => (
  <defs>
    <linearGradient id="fg-rim" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0" stopColor="#e09452" /><stop offset="0.55" stopColor="#7a4a30" /><stop offset="1" stopColor="#191b2a" /></linearGradient>
    <linearGradient id="fg-skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d4925f" /><stop offset="0.6" stopColor="#c27c4d" /><stop offset="1" stopColor="#a9653c" /></linearGradient>
  </defs>
);

// a hood bunched around the neck, three-quarter (shoulders below the portrait)
export const Hood3Q: React.FC = () => (
  <g id="hoodie" transform="translate(0 -34)">
    <path d="M -230 420 C -220 300 -160 250 -70 226 L 120 220 C 210 236 268 290 280 420 Z" fill="url(#sg-hood)" stroke="#94600a" strokeWidth={2.4} strokeLinejoin="round" />
    <path d="M -230 420 C -220 300 -160 250 -70 226 L -40 240 C -110 270 -160 330 -170 420 Z" fill={C.hoodSh} opacity={0.55} />
    {/* the hood rolled around the neck, V opening at the front */}
    <path d="M -110 236 C -112 196 -70 176 -40 200 L -6 262 L 38 196 C 80 174 136 196 138 240 C 110 280 60 296 10 296 C -40 296 -86 278 -110 236 Z" fill="url(#sg-hood)" stroke="#94600a" strokeWidth={2.4} strokeLinejoin="round" />
    <path d="M -40 202 L -6 264 L 38 198 C 24 218 10 226 -2 226 C -16 226 -30 218 -40 202 Z" fill={C.hoodDeep} stroke="#94600a" strokeWidth={2} strokeLinejoin="round" />
    <path d="M -100 240 C -70 270 -30 282 10 282 C 54 282 96 270 128 244" fill="none" stroke={C.hoodSh} strokeWidth={4} />
    <path d="M -22 276 C -26 310 -26 350 -30 396" stroke="#94600a" strokeWidth={6} fill="none" strokeLinecap="round" /><path d="M -22 276 C -26 310 -26 350 -30 396" stroke={C.string} strokeWidth={3.4} fill="none" strokeLinecap="round" />
    <path d="M 18 276 C 22 310 24 350 26 398" stroke="#94600a" strokeWidth={6} fill="none" strokeLinecap="round" /><path d="M 18 276 C 22 310 24 350 26 398" stroke={C.string} strokeWidth={3.4} fill="none" strokeLinecap="round" />
  </g>
);
