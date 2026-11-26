// Shared cast and props for "How You'd Invent a Flashlight". Everything is drawn in SVG: no images.
// Characters are modelled facing RIGHT in a local box about 230 x 1000 (feet at y = 1000); flip with scale(-1, 1).

export type Light = 'warm' | 'cool';

// the student: 19, short dark hair, mustard overshirt with rolled sleeves over a cream tee, dark jeans,
// a yellow pencil behind his ear. Same palette in every shot; only the light changes.
export const STU = {
  skin: '#b8774e', skinSh: '#8a5236', skinHi: '#d69a6c',
  hair: '#1c1820', shirt: '#c8962c', shirtSh: '#946b1d', shirtHi: '#e0b450',
  tee: '#ece6d8', jeans: '#2e3954', jeansSh: '#212a40', shoe: '#2a2a2e', sole: '#d9d4c8',
  pencil: '#f0c02c', eraser: '#e8899a',
};
// the friend: different silhouette so he reads at a distance: teal hoodie, grey joggers, white sneakers, backpack
export const FR = {
  skin: '#8c5a3c', skinSh: '#6a3f28', hair: '#151217', hoodie: '#2f7f7b', hoodieSh: '#1f5a57',
  pants: '#5b6170', pantsSh: '#434856', shoe: '#ecebe6', pack: '#c4513f', packSh: '#8e3527', bud: '#f7f7f4',
};

// a cool or warm wash laid over a character so he sits in the shot's light
const CoolFilter: React.FC<{ id: string }> = ({ id }) => (
  <filter id={`${id}-cool`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0.52 0.06 0.06 0 0.02  0.06 0.6 0.08 0 0.04  0.08 0.12 0.86 0 0.1  0 0 0 1 0" /></filter>
);

// ---- profile head, facing right, in a 200 x 240 box (neck bottom at y = 240) ----
const HEAD = 'M 60 178 C 34 160 18 130 20 92 C 22 44 62 10 112 10 C 150 12 170 40 172 72 L 174 96 C 180 106 188 118 192 128 C 194 134 188 138 178 137 C 181 145 182 151 177 155 C 182 160 180 167 173 169 C 172 180 166 188 156 193 C 140 199 120 197 108 189 C 100 184 92 182 86 188 L 88 240 L 54 240 L 60 178 Z';

export const ProfileHead: React.FC<{ skin: string; skinSh: string; hair: string; hairStyle: 'short' | 'curly'; mouth?: 'closed' | 'shout' | 'open'; brow?: number; eye?: 'fwd' | 'up'; pencil?: boolean; bud?: string }> =
  ({ skin, skinSh, hair, hairStyle, mouth = 'closed', brow = 0, eye = 'fwd', pencil, bud }) => (
  <g>
    <path d={HEAD} fill={skin} stroke="#140f12" strokeWidth={3.2} strokeLinejoin="round" />
    {/* soft form shadow: back of the skull, under the jaw, the neck */}
    <path d="M 60 178 C 34 160 18 130 20 92 C 40 120 60 140 86 150 C 92 170 92 182 86 188 L 88 240 L 54 240 Z" fill={skinSh} opacity={0.55} />
    <path d="M 108 189 C 120 197 140 199 156 193 C 150 186 132 182 112 182 Z" fill={skinSh} opacity={0.45} />
    {hairStyle === 'short' ? (<>
      <path d="M 17 104 C 8 52 50 2 114 4 C 152 6 176 30 178 62 C 170 52 160 48 148 50 C 136 42 118 42 104 48 C 98 68 84 84 70 92 C 60 100 58 118 62 132 C 44 132 26 122 17 104 Z" fill={hair} stroke="#0d0a0e" strokeWidth={3} />
      <path d="M 104 48 C 112 36 134 30 152 38" stroke="#3a3340" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
      <path d="M 96 96 L 100 128 L 92 126 Z" fill={hair} />
    </>) : (<>
      <path d="M 16 104 C 4 60 34 6 100 2 C 150 0 180 26 182 62 C 176 56 168 52 160 54 C 150 44 128 42 110 48 C 100 70 86 86 72 92 C 60 102 58 120 62 134 C 42 132 26 122 16 104 Z" fill={hair} stroke="#0d0a0e" strokeWidth={3} />
      {[[40, 30], [70, 14], [104, 8], [138, 14], [30, 64], [22, 96]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill={hair} />)}
    </>)}
    {/* ear */}
    <ellipse cx={80} cy={112} rx={13} ry={20} fill={skin} stroke="#140f12" strokeWidth={2.6} />
    <path d="M 78 102 C 86 106 86 118 78 122" stroke={skinSh} strokeWidth={3} fill="none" />
    {bud && <g><ellipse cx={84} cy={114} rx={7} ry={6} fill={bud} stroke="#9aa0a8" strokeWidth={1.4} /><rect x={81} y={118} width={5} height={14} rx={2.5} fill={bud} /></g>}
    {pencil && <g transform="rotate(-18 82 84)">
      <rect x={44} y={78} width={86} height={11} fill={STU.pencil} stroke="#5a4510" strokeWidth={1.6} />
      <rect x={44} y={78} width={86} height={4} fill="#fff2b0" opacity={0.5} />
      <rect x={34} y={78} width={11} height={11} fill={STU.eraser} stroke="#7a3a44" strokeWidth={1.4} />
      <rect x={44} y={78} width={7} height={11} fill="#b8b8b8" />
      <path d="M 130 78 L 146 83.5 L 130 89 Z" fill="#e6c79a" stroke="#5a4510" strokeWidth={1.4} />
      <path d="M 141 81.8 L 146 83.5 L 141 85.2 Z" fill="#2a2a2a" />
    </g>}
    {/* brow and eye */}
    <path d={`M 138 ${90 - brow} Q 152 ${83 - brow} 167 ${89 - brow}`} stroke={hair} strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M 144 104 Q 153 97 162 103 Q 153 108 144 104 Z" fill="#fbf6ee" stroke="#140f12" strokeWidth={2} />
    <circle cx={eye === 'up' ? 156 : 157} cy={eye === 'up' ? 100 : 103} r={3.6} fill="#1a1210" />
    <path d="M 142 101 Q 153 94 164 101" stroke="#140f12" strokeWidth={2.4} fill="none" />
    {/* nose shade, mouth */}
    <path d="M 176 128 C 180 132 182 134 178 137" stroke={skinSh} strokeWidth={3} fill="none" />
    {mouth === 'closed' && <path d="M 175 156 Q 168 158 162 156" stroke="#5a2a20" strokeWidth={3} fill="none" strokeLinecap="round" />}
    {mouth === 'open' && <path d="M 176 152 Q 166 154 162 156 Q 168 164 176 162 Z" fill="#3a1414" stroke="#140f12" strokeWidth={2} />}
    {mouth === 'shout' && <g><path d="M 180 146 L 160 150 Q 158 164 166 172 L 178 170 Q 186 160 180 146 Z" fill="#3a1414" stroke="#140f12" strokeWidth={2.4} /><path d="M 166 166 Q 172 170 177 168" stroke="#c45b5b" strokeWidth={4} fill="none" /><path d="M 162 151 L 179 148" stroke="#f3eee6" strokeWidth={3} /></g>}
    <path d="M 160 124 C 152 132 146 138 150 146" stroke={skinSh} strokeWidth={2} fill="none" opacity={0.6} />
  </g>
);

// ---- an arm: upper arm (sleeve, rolled cuff) and forearm with a hand; angles in degrees, 0 = hanging down ----
const Arm: React.FC<{ a: number; b: number; sleeve: string; sleeveSh: string; cuff: string; skin: string; skinSh: string; rolled?: boolean; fist?: boolean }> =
  ({ a, b, sleeve, sleeveSh, cuff, skin, skinSh, rolled = true, fist }) => (
  <g transform={`rotate(${a})`}>
    <path d="M -24 -6 C -26 60 -22 120 -20 160 L 20 160 C 22 120 26 60 22 -6 Z" fill={sleeve} stroke="#140f12" strokeWidth={3} />
    <path d="M 6 0 C 10 60 12 120 12 160 L 20 160 C 22 120 26 60 22 -6 Z" fill={sleeveSh} opacity={0.6} />
    <g transform="translate(0 168)">
      <g transform={`rotate(${b})`}>
        {rolled ? <>
          <path d="M -17 -6 L 17 -6 L 15 128 L -15 128 Z" fill={skin} stroke="#140f12" strokeWidth={3} />
          <path d="M 6 -6 L 17 -6 L 15 128 L 8 128 Z" fill={skinSh} opacity={0.5} />
        </> : <path d="M -18 -6 L 18 -6 L 16 128 L -16 128 Z" fill={sleeve} stroke="#140f12" strokeWidth={3} />}
        {fist
          ? <g transform="translate(0 146)"><rect x={-19} y={-18} width={38} height={40} rx={14} fill={skin} stroke="#140f12" strokeWidth={3} /><path d="M -12 -4 H 12 M -12 6 H 12" stroke={skinSh} strokeWidth={2} /></g>
          : <g transform="translate(0 150)">
            <path d="M -16 -20 C -22 0 -20 22 -8 34 C 0 40 12 38 18 28 C 22 10 20 -10 16 -20 Z" fill={skin} stroke="#140f12" strokeWidth={3} />
            <path d="M -16 -6 C -26 0 -28 12 -22 18" stroke="#140f12" strokeWidth={3} fill={skin} />
            <path d="M -6 30 V 12 M 4 32 V 12 M 12 26 V 10" stroke={skinSh} strokeWidth={2} />
          </g>}
      </g>
      {/* the rolled cuff sits over the elbow */}
      {rolled && <rect x={-25} y={-14} width={50} height={26} rx={8} fill={cuff} stroke="#140f12" strokeWidth={3} />}
    </g>
  </g>
);

// ---- the student, full figure, facing right ----
export const Student: React.FC<{ light: Light; pose: 'door' | 'shout'; idp: string }> = ({ light, pose, idp }) => {
  const near = pose === 'door' ? { a: -57, b: -2 } : { a: -60, b: 226 };
  const far = pose === 'door' ? { a: -50, b: -8 } : { a: 8, b: -6 };
  const arm = (p: { a: number; b: number }, dark?: boolean) => <Arm a={p.a} b={p.b} sleeve={dark ? STU.shirtSh : STU.shirt} sleeveSh={STU.shirtSh} cuff={dark ? '#b98a28' : STU.shirtHi} skin={dark ? STU.skinSh : STU.skin} skinSh={STU.skinSh} />;
  return (
    <g filter={light === 'cool' ? `url(#${idp}-cool)` : undefined}>
      <defs><CoolFilter id={idp} /></defs>
      {/* far arm behind the body */}
      <g transform="translate(118 212)">{arm(far, true)}</g>
      {/* legs */}
      <path d="M 52 552 L 150 552 L 152 760 L 150 958 L 114 958 L 104 724 L 94 958 L 58 958 L 50 760 Z" fill={STU.jeans} stroke="#140f12" strokeWidth={3} strokeLinejoin="round" />
      <path d="M 104 600 L 104 724 L 114 958 L 150 958 L 152 760 L 150 600 Z" fill={STU.jeansSh} opacity={0.45} />
      <path d="M 56 954 L 98 954 C 112 958 124 972 124 990 L 50 990 Z" fill={STU.shoe} stroke="#140f12" strokeWidth={3} />
      <path d="M 112 954 L 152 954 C 166 958 178 972 178 990 L 108 990 Z" fill={STU.shoe} stroke="#140f12" strokeWidth={3} />
      <path d="M 50 984 H 124 M 108 984 H 178" stroke={STU.sole} strokeWidth={6} />
      {/* torso: tee under an open overshirt */}
      <path d="M 44 190 C 70 170 136 170 158 188 L 168 330 C 172 420 164 520 160 566 L 42 566 C 36 480 30 380 36 300 Z" fill={STU.shirt} stroke="#140f12" strokeWidth={3.2} strokeLinejoin="round" />
      <path d="M 118 196 L 126 566 L 160 566 C 164 520 172 420 168 330 L 158 188 Z" fill={STU.shirtSh} opacity={0.55} />
      <path d="M 96 186 L 92 566 L 118 566 L 122 188 Z" fill={STU.tee} stroke="#140f12" strokeWidth={2.4} />
      <path d="M 86 182 L 100 226 L 92 236 Z M 128 184 L 120 230 L 130 236 Z" fill={STU.shirtHi} stroke="#140f12" strokeWidth={2.4} />
      <path d="M 50 380 L 84 380 L 84 420 L 50 420 Z" fill="none" stroke={STU.shirtSh} strokeWidth={3} />
      {/* head */}
      <g transform="translate(36 -4) scale(0.78)"><ProfileHead skin={STU.skin} skinSh={STU.skinSh} hair={STU.hair} hairStyle="short" pencil mouth={pose === 'shout' ? 'shout' : 'closed'} brow={pose === 'shout' ? 5 : 0} /></g>
      {/* near arm in front */}
      <g transform="translate(96 212)">{arm(near)}</g>
    </g>
  );
};

// ---- the friend, walking, facing right; `up` tilts his head back to look up ----
export const Friend: React.FC<{ up?: boolean; idp: string; light?: Light }> = ({ up, idp, light = 'cool' }) => (
  <g filter={light === 'cool' ? `url(#${idp}-cool)` : undefined}>
    <defs><CoolFilter id={idp} /></defs>
    {/* back leg, then backpack, body, front leg */}
    <path d="M 70 560 L 112 560 L 88 770 L 52 960 L 18 952 L 54 760 Z" fill={FR.pantsSh} stroke="#140f12" strokeWidth={3} />
    <path d="M 16 948 L 56 956 C 64 966 64 980 58 992 L 2 986 C 0 970 6 958 16 948 Z" fill={FR.shoe} stroke="#140f12" strokeWidth={3} />
    <g transform="translate(110 212)"><Arm a={22} b={-12} sleeve={FR.hoodieSh} sleeveSh={FR.hoodieSh} cuff={FR.hoodieSh} skin={FR.skinSh} skinSh={FR.skinSh} rolled={false} fist /></g>
    <path d="M 18 212 C 6 260 6 380 20 440 L 62 446 L 64 210 Z" fill={FR.pack} stroke="#140f12" strokeWidth={3} />
    <path d="M 18 300 L 60 304 L 60 360 L 22 356 Z" fill={FR.packSh} stroke="#140f12" strokeWidth={2.4} />
    <path d="M 52 190 C 78 172 136 172 158 190 L 170 340 C 174 430 166 520 160 572 L 50 572 C 42 480 40 380 46 300 Z" fill={FR.hoodie} stroke="#140f12" strokeWidth={3.2} strokeLinejoin="round" />
    <path d="M 120 196 L 128 572 L 160 572 C 166 520 174 430 170 340 L 158 190 Z" fill={FR.hoodieSh} opacity={0.55} />
    <path d="M 60 204 C 62 236 66 300 70 332" stroke="#140f12" strokeWidth={6} fill="none" /><path d="M 60 204 C 62 236 66 300 70 332" stroke={FR.pack} strokeWidth={3} fill="none" />
    <path d="M 120 520 L 150 520" stroke={FR.hoodieSh} strokeWidth={4} />
    <path d="M 112 560 L 156 560 L 178 760 L 214 940 L 180 952 L 140 770 Z" fill={FR.pants} stroke="#140f12" strokeWidth={3} />
    <path d="M 178 936 L 216 932 C 232 940 240 958 236 980 L 174 984 C 170 968 170 950 178 936 Z" fill={FR.shoe} stroke="#140f12" strokeWidth={3} />
    {/* earbud cable-free buds: one white dot in the ear is enough to read "can't hear you" */}
    <g transform={`translate(${up ? 52 : 44} ${up ? 14 : -8}) rotate(${up ? -26 : 0} 76 220) scale(0.8)`}>
      <ProfileHead skin={FR.skin} skinSh={FR.skinSh} hair={FR.hair} hairStyle="curly" mouth={up ? 'open' : 'closed'} brow={up ? 6 : 0} eye={up ? 'up' : 'fwd'} bud={FR.bud} />
    </g>
    <path d="M 70 190 C 90 214 126 214 142 192 L 150 206 C 128 232 84 232 64 206 Z" fill={FR.hoodieSh} stroke="#140f12" strokeWidth={2.6} />
    <g transform="translate(104 212)"><Arm a={-16} b={-24} sleeve={FR.hoodie} sleeveSh={FR.hoodieSh} cuff={FR.hoodie} skin={FR.skin} skinSh={FR.skinSh} rolled={false} fist /></g>
  </g>
);

// ---- the room window: two casements under a transom. The SAME shape from inside (scene 1, 2) and outside (2, 5) ----
export const WindowFrame: React.FC<{ w: number; h: number; frame: string; frameSh: string; glass: React.ReactNode }> = ({ w, h, frame, frameSh, glass }) => {
  const t = 22, tr = h * 0.24;
  return (
    <g>
      {glass}
      <path d={`M 0 0 H ${w} V ${h} H 0 Z M ${t} ${t} V ${tr} H ${w - t} V ${t} Z M ${t} ${tr + t * 0.6} V ${h - t} H ${w / 2 - t * 0.35} V ${tr + t * 0.6} Z M ${w / 2 + t * 0.35} ${tr + t * 0.6} V ${h - t} H ${w - t} V ${tr + t * 0.6} Z`} fill={frame} fillRule="evenodd" stroke="#140f12" strokeWidth={3} />
      <rect x={-14} y={h - 4} width={w + 28} height={16} fill={frameSh} stroke="#140f12" strokeWidth={3} />
      <circle cx={w / 2 - 22} cy={tr + (h - tr) / 2} r={5} fill={frameSh} /><circle cx={w / 2 + 22} cy={tr + (h - tr) / 2} r={5} fill={frameSh} />
    </g>
  );
};
