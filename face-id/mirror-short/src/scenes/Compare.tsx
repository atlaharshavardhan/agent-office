import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, Label, clamp, ramp } from '../theme';

// Scene 4 (19–28 s, 270 frames). Kept apart from any lock screen: no result is shown.
const CROP = { x: 110, y: 230, w: 540, h: 720 }; // face region of the 752 x 1344 stills

const Card: React.FC<{ src: string; x: number; y: number; w: number; o: number; filter?: string }> = ({ src, x, y, w, o, filter }) => {
  const k = w / CROP.w, h = CROP.h * k;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: o, overflow: 'hidden', borderRadius: 22, border: `3px solid ${C.violetDim}`, background: '#000', boxShadow: '0 20px 60px rgba(0,0,0,.6)' }}>
      <Img src={staticFile(src)} style={{ position: 'absolute', left: -CROP.x * k, top: -CROP.y * k, width: 752 * k, height: 1344 * k, filter }} />
    </div>
  );
};

export const Compare: React.FC = () => {
  const l = useCurrentFrame();
  const m = ramp(l, 95, 106);                 // snap into the comparison layout (22.2–22.5 s)
  const W0 = 420, W1 = 250;
  const w = interpolate(m, [0, 1], [W0, W1]);
  const y = interpolate(m, [0, 1], [330, 210]);
  const lx = interpolate(m, [0, 1], [80, 265]), rx = interpolate(m, [0, 1], [540, 565]);
  const irIn = ramp(l, 6, 12);
  const lab = 1 - ramp(l, 93, 97);
  const h1 = CROP.h * (W1 / CROP.w);
  const enr = ramp(l, 116, 124), cmp = ramp(l, 106, 112);
  const EW = 330, EH = CROP.h * (EW / CROP.w), EX = 540 - EW / 2 + 0, EY = 760;
  const scanBottom = 210 + h1;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 50% at 50% 40%, #241911 0%, #120d0a 75%)' }} />
      <div style={{ position: 'absolute', inset: 0, transform: 'translateY(215px)' }}>
      <Card src="face_depth.png" x={lx} y={y} w={w} o={1} filter="contrast(1.18)" />
      <Card src="face_ir.png" x={rx + (1 - irIn) * 140} y={y} w={w} o={irIn} />
      <Label text="DEPTH MAP" x={lx + w / 2} y={y + w * CROP.h / CROP.w + 22} o={lab} size={30} align="center" />
      <Label text="INFRARED IMAGE" x={rx + w / 2} y={y + w * CROP.h / CROP.w + 22} o={lab * irIn} size={30} align="center" />
      {/* the two captures feed one comparison */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={cmp} stroke={C.violet} strokeWidth={3} fill="none">
          <path d={`M ${265 + W1 / 2} ${scanBottom + 8} C ${265 + W1 / 2} ${scanBottom + 70}, 540 ${scanBottom + 40}, 540 ${scanBottom + 95}`} />
          <path d={`M ${565 + W1 / 2} ${scanBottom + 8} C ${565 + W1 / 2} ${scanBottom + 70}, 540 ${scanBottom + 40}, 540 ${scanBottom + 95}`} />
          <circle cx={540} cy={scanBottom + 140} r={44} fill="rgba(18,13,10,.9)" />
          <path d={`M 518 ${scanBottom + 128} H 562 M 552 ${scanBottom + 118} L 562 ${scanBottom + 128} L 552 ${scanBottom + 138} M 562 ${scanBottom + 152} H 518 M 528 ${scanBottom + 142} L 518 ${scanBottom + 152} L 528 ${scanBottom + 162}`} strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M 540 ${scanBottom + 184} V ${EY - 12}`} strokeDasharray="6 8" opacity={enr} />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: scanBottom + 132, textAlign: 'center', opacity: cmp, font: `800 26px/1 ${FONT}`, letterSpacing: '0.14em', color: C.label, transform: 'translateX(-200px)' }}>THIS SCAN</div>
      {/* enrolled face data: a stored template (abstracted), not a picture of the lock screen */}
      <div style={{ position: 'absolute', left: EX, top: EY + (1 - enr) * 40, width: EW, height: EH, opacity: enr, borderRadius: 22, overflow: 'hidden', border: `3px solid ${C.violet}`, background: '#0c0a12' }}>
        <Img src={staticFile('face_depth.png')} style={{ position: 'absolute', left: -CROP.x * EW / CROP.w, top: -CROP.y * EW / CROP.w, width: 752 * EW / CROP.w, height: 1344 * EW / CROP.w, opacity: 0.55, filter: 'contrast(1.2) sepia(1) hue-rotate(215deg) saturate(1.6)' }} />
        <svg width={EW} height={EH} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: 15 }, (_, i) => <line key={'h' + i} x1={0} x2={EW} y1={(i + 0.5) * EH / 15} y2={(i + 0.5) * EH / 15} stroke={C.violet} strokeWidth={1} opacity={0.28} />)}
          {Array.from({ length: 11 }, (_, i) => <line key={'v' + i} y1={0} y2={EH} x1={(i + 0.5) * EW / 11} x2={(i + 0.5) * EW / 11} stroke={C.violet} strokeWidth={1} opacity={0.28} />)}
        </svg>
      </div>
      <Label text="ENROLLED FACE DATA" x={540} y={EY + EH + 20} o={enr} size={30} align="center" />
      </div>
    </AbsoluteFill>
  );
};
