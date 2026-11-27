import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CITY } from '../lib/palette';
import { keys, prog, pulse, lerp, easeOut, FPS } from '../lib/anim';
import { Layer, Sky, Skyline, Block, BalconyBack, BalconyFront, StreetLamp, Tree, Wires, SharedDefs, GROUND, Cam } from './City';
import { Character, Pose, CharStyle } from './Character';

export const BOY: CharStyle = { skin: CITY.skinBoy, skinShade: '#8a5a3e', hair: CITY.hair, top: CITY.teal, topShade: CITY.tealDark, hairStyle: 'boy', rim: '#ffd0a6' };
export const GIRL: CharStyle = { skin: CITY.skinGirl, skinShade: '#94603f', hair: CITY.hair, top: CITY.lavCloth, topShade: CITY.lavClothDark, accent: CITY.cream2, hairStyle: 'girl', rim: '#ffd0a6' };
export const BOY_POS = { x: 470, y: 1862, s: 1.15 };
export const GIRL_POS = { x: 1560, y: 1862, s: 1.15 };

const limb = (x: number, y: number, a: number, len: number) => { const r = a * Math.PI / 180; return [x + Math.sin(r) * len, y + Math.cos(r) * len]; };
/** world position of the torch lens for a pose */
export const lensOf = (p: Pose, pos = BOY_POS) => {
  const sh = -138 + p.breathe * 2.2 + 6; const [ex, ey] = limb(74, sh, p.armR[0], 78); const [wx, wy] = limb(ex, ey, p.armR[1], 72);
  const r = (90 - p.armR[1]) * Math.PI / 180; const lx = wx + Math.cos(r) * 95 * 0.95, ly = wy + Math.sin(r) * 95 * 0.95;
  return { x: pos.x + lx * pos.s, y: pos.y + ly * pos.s };
};

/** blinking + breathing helpers (deterministic) */
const blinkAt = (t: number, times: number[]) => Math.max(0, ...times.map((b) => 1 - Math.abs(t - b) / 0.07)) ;

export const boyPose = (f: number): Pose => {
  const t = f / FPS;
  const raise = keys(f, [[0.25, 0], [0.45, -0.12], [1.0, 1]], easeOut);   // small dip (anticipation) then raise
  const on = Math.max(pulse(f, 1.15, 1.42), pulse(f, 1.62, 1.9), pulse(f, 2.2, 8));
  return {
    breathe: Math.sin(t * 2.2), blink: blinkAt(t, [0.12, 2.05, 3.6]), look: [0.9, -0.1 * raise], brow: 0.15 * on, smile: 0.25 + 0.5 * prog(f, 2.3, 2.7),
    headTilt: -3 * raise, armR: [lerp(12, 78, raise), lerp(6, 92, raise)], armL: [-10, -6], holdTorch: true, torchOn: on,
  };
};
export const girlPose = (f: number): Pose => {
  const t = f / FPS;
  const notice = prog(f, 1.45, 1.75, easeOut), joy = prog(f, 1.8, 2.3, easeOut);
  const wave = prog(f, 2.55, 2.85, easeOut) * (1 - prog(f, 3.9, 4.2));
  const osc = Math.sin((t - 2.55) * 11) * 14 * wave;
  return {
    breathe: Math.sin(t * 2.2 + 1.3), blink: blinkAt(t, [0.7, 3.2]), look: [lerp(0.2, 1, notice), -0.15], brow: 0.9 * notice * (1 - 0.6 * joy), smile: lerp(0.15, 0.95, joy),
    headTilt: lerp(0, 6, joy) + Math.sin(t * 1.4) * 1.5, armR: [lerp(10, 150, wave), lerp(6, 168, wave) + osc], armL: [-10, -6],
  };
};

/** the city shot: camera + all layers. `ots` adds the over-the-shoulder foreground. */
export const CityShot: React.FC<{ cam: Cam; dark?: number; ots?: number }> = ({ cam, dark = 0, ots = 0 }) => {
  const f = useCurrentFrame();
  const bp = boyPose(f), gp = girlPose(f);
  const lens = lensOf(bp);
  const tgt = { x: GIRL_POS.x - 40, y: GIRL_POS.y - 250 };
  const on = bp.torchOn || 0;
  const ang = Math.atan2(tgt.y - lens.y, tgt.x - lens.x), len = Math.hypot(tgt.x - lens.x, tgt.y - lens.y);
  // a bright packet of light travelling along the beam each time the torch switches on
  const travel = [1.15, 1.62, 2.2].map((s) => { const u = (f / FPS - s) / 0.32; return u > 0 && u < 1.2 ? u : -1; });
  return (
    <AbsoluteFill style={{ backgroundColor: CITY.skyTop }}>
      <SharedDefs />
      <Sky dark={dark} />
      <Layer cam={cam} depth={0.32} blur={1.2}><Skyline /></Layer>
      <Layer cam={cam} depth={0.6} blur={0.6}>
        {/* second row of blocks between skyline and the street */}
        <g opacity={0.92}>
          <Block x={-520} w={480} floors={8} face={CITY.peach} side={CITY.peachSide} sideW={70} seed={21} litRatio={0.3} />
          <Block x={820} w={420} floors={9} face={CITY.peach} side={CITY.peachSide} sideW={60} seed={22} litRatio={0.3} />
          <Block x={2250} w={500} floors={8} face={CITY.cream} side={CITY.creamSide} sideW={60} sideLeft seed={23} litRatio={0.3} />
        </g>
        <rect x={-2000} y={GROUND - 300} width={6000} height={300} fill="#c69aa0" opacity={0.25} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <rect x={-2000} y={GROUND} width={7000} height={800} fill={CITY.street} />
        <rect x={-2000} y={GROUND} width={7000} height={18} fill="#5a4f6a" />
        {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={880 + i * 60} y={GROUND + 150} width={34} height={8} rx={4} fill="#efe3cf" opacity={0.5} />)}
        {/* footpath, curb and a parked auto-rickshaw to fill the street level */}
        <rect x={-2000} y={GROUND} width={7000} height={70} fill="#6b5f7c" /><rect x={-2000} y={GROUND + 70} width={7000} height={14} fill="#4a405a" />
        {Array.from({ length: 60 }).map((_, i) => <rect key={i} x={-600 + i * 70} y={GROUND + 6} width={2} height={60} fill="#5a4f6a" />)}
        <ellipse cx={980} cy={GROUND + 330} rx={260} ry={60} fill="#ffc477" opacity={0.18} />
        <g transform={`translate(1280 ${GROUND + 250})`}>
          <ellipse cx={0} cy={58} rx={220} ry={20} fill="#000" opacity={0.25} />
          <path d="M -190 40 L -190 -60 Q -180 -150 -60 -170 L 120 -170 Q 190 -160 200 -60 L 210 40 Z" fill="#2a2a34" />
          <path d="M -180 40 L -180 -40 L 196 -40 L 204 40 Z" fill="#f2c94c" />
          <path d="M -180 -40 L 196 -40 L 196 -20 L -180 -20 Z" fill="#3fa86a" />
          <path d="M 120 -160 Q 200 -150 205 -40 L 140 -40 Z" fill="#9fd8ff" opacity={0.55} />
          <rect x={-40} y={-150} width={10} height={110} fill="#2a2a34" />
          {[-130, 150].map((x) => <g key={x}><circle cx={x} cy={44} r={34} fill="#18181e" /><circle cx={x} cy={44} r={14} fill="#8a8a96" /></g>)}
          <circle cx={208} cy={0} r={10} fill="#fff1c4" />
        </g>
        <Block x={150} w={640} floors={6} face={CITY.cream} side={CITY.creamSide} sideW={90} skip={[[3, 1]]} seed={1} />
        <Block x={1250} w={640} floors={6} face={CITY.lav} side={CITY.lavSide} sideW={90} sideLeft skip={[[3, 1]]} seed={2} />
        <BalconyBack x={364} y={1880} w={212} />
        <BalconyBack x={1464} y={1880} w={212} />
        <g transform={`translate(${BOY_POS.x} ${BOY_POS.y}) scale(${BOY_POS.s})`}><Character s={BOY} p={bp} id="b" /></g>
        <g transform={`translate(${GIRL_POS.x} ${GIRL_POS.y}) scale(${-GIRL_POS.s} ${GIRL_POS.s})`}><Character s={GIRL} p={gp} id="g" /></g>
        <BalconyFront x={364} y={1880} w={212} />
        <BalconyFront x={1464} y={1880} w={212} />
        <Wires f={f} />
        <StreetLamp x={905} glow={1} /><StreetLamp x={1135} flip glow={1} />
        <Tree x={1020} s={0.7} f={f} seed={1} />
        {/* the torch beam: soft wedge + a travelling pulse of light */}
        {on > 0.01 && (
          <g transform={`translate(${lens.x} ${lens.y}) rotate(${ang * 180 / Math.PI})`} style={{ mixBlendMode: 'screen' }}>
            <path d={`M 0 -8 L ${len} -70 L ${len} 70 L 0 8 Z`} fill="url(#beam)" opacity={0.75 * on} filter="url(#soft)" />
            <path d={`M 0 -3 L ${len} -24 L ${len} 24 L 0 3 Z`} fill="url(#beam)" opacity={0.9 * on} />
            <circle cx={len} cy={0} r={90} fill="#ffe9c4" opacity={0.28 * on} filter="url(#soft2)" />
          </g>
        )}
        {travel.map((u, i) => u >= 0 && (
          <g key={i} transform={`translate(${lens.x + Math.cos(ang) * len * Math.min(1, u)} ${lens.y + Math.sin(ang) * len * Math.min(1, u)})`}>
            <circle r={34} fill="#fff6dc" opacity={0.8 * (1 - Math.max(0, u - 1) * 5)} filter="url(#soft)" /><circle r={10} fill="#ffffff" opacity={1 - Math.max(0, u - 1) * 5} />
          </g>
        ))}
        {on > 0.01 && <circle cx={lens.x} cy={lens.y} r={46} fill="#fff4d8" opacity={0.65 * on} filter="url(#soft)" />}
      </Layer>
      {/* foreground parallax: bougainvillea and a power pole, out of focus */}
      <Layer cam={cam} depth={1.45} blur={7}>
        <g transform="translate(-160 2050)">
          {Array.from({ length: 22 }).map((_, i) => <ellipse key={i} cx={(i % 6) * 70} cy={-Math.floor(i / 6) * 70 - (i % 3) * 20} rx={46} ry={30} transform={`rotate(${i * 37} ${(i % 6) * 70} ${-Math.floor(i / 6) * 70})`} fill={i % 3 === 0 ? '#c75a8a' : i % 3 === 1 ? '#4f6b5a' : '#da7aa4'} />)}
        </g>
        <rect x={2380} y={600} width={46} height={2400} fill="#231d30" />
        <rect x={2330} y={760} width={150} height={18} fill="#231d30" />
      </Layer>
      {/* over-the-shoulder foreground: the boy seen from behind, out of focus */}
      {ots > 0 && (
        <AbsoluteFill style={{ opacity: ots, filter: 'blur(5px)' }}>
          <svg width={1080} height={1920}>
            <g transform={`translate(${lerp(-80, 0, ots)} 0)`}>
              <path d="M -120 1920 L -120 1380 Q 40 1240 260 1300 Q 380 1340 420 1460 L 470 1920 Z" fill={CITY.tealDark} />
              <path d="M 200 1330 Q 420 1250 640 1180 L 690 1215 Q 470 1330 280 1420 Z" fill={CITY.teal} />
              <circle cx={700} cy={1196} r={34} fill={CITY.skinBoy} />
              <ellipse cx={150} cy={1150} rx={170} ry={190} fill={CITY.hair} />
              <ellipse cx={300} cy={1170} rx={26} ry={36} fill="#8a5a3e" />
              <path d="M 40 1010 Q 150 960 260 1020" stroke="#ffffff" strokeOpacity={0.08} strokeWidth={16} fill="none" />
            </g>
          </svg>
        </AbsoluteFill>
      )}
      {/* warm grade + vignette */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(20,10,40,.45) 100%)' }} />
      <AbsoluteFill style={{ backgroundColor: '#080F1C', opacity: dark * 0.85 }} />
    </AbsoluteFill>
  );
};
