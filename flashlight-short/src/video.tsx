// "How You'd Invent a Flashlight": the 50 s Short. The storyboard stills are cut to George's narration
// (public/vo, made by tools/vo_george.py) with slow camera pushes, a few in-shot effects and word-by-word captions.
import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { FoilBuild } from './idea/IdeaToFoil';
import vo from '../public/vo/vo.json';
import { S01A, S01B, S02A, S02B, S03, S04M, S05, S06, S07, S08A, S08B, S09, S10 } from './storyboard';

export const FPS = 30;
const f = (s: number) => Math.round(s * FPS);
type Line = keyof typeof vo;
const wordAt = (l: Line, w: string) => vo[l].words.find((x) => x.w.toLowerCase().startsWith(w))!.s;

// scene windows from the script (seconds) and where each line starts inside its scene
const SC = {
  s1: { from: 0, to: 4, lines: [['s01', 0.15]] },
  s2: { from: 4, to: 8, lines: [['s02a', 0.15], ['s02b', 2.05]] },
  s3: { from: 8, to: 12, lines: [['s03', 0.2]] },
  s4: { from: 12, to: 18, lines: [['s04', 0.2]] },
  s5: { from: 18, to: 24, lines: [['s05', 0.25]] },
  s6: { from: 24, to: 29.4, lines: [['s06', 0.3]] },
  s7: { from: 29.4, to: 35.7, lines: [['s07', 0.3]] },
  s8: { from: 35.7, to: 44, lines: [['s08', 3.3]] },
  s9: { from: 44, to: 48, lines: [['s09', 0.35]] },
  s10: { from: 48, to: 50, lines: [] },
} as const;
export const DURATION = f(50);
const FADE = 8;

// key moments (seconds inside their scene)
const CUT_POWER = 0.15 + wordAt('s01', 'cuts') + 0.12;
const FLASH_04 = 0.2 + wordAt('s04', 'flash');
const CLICK_05 = 0.25 + wordAt('s05', 'switch');
const FOIL_SPEED = 1.6;                       // the 8 s foil build plays at 1.6x (5 s)
const MOVE_08 = 3.3 + wordAt('s08', 'move');
const TIGHT_08 = 3.3 + vo.s08.words[vo.s08.words.length - 1].e;
const CLIP_06 = 3.0;                           // the Higgsfield reach takes over here in scene 06
const STOP_09 = 0.35 + wordAt('s09', 'stops');

// a slow push-in: scale 1 -> z around (ox, oy) across the shot
const Cam: React.FC<{ len: number; z?: number; ox?: number; oy?: number; children: React.ReactNode }> = ({ len, z = 1.06, ox = 540, oy = 900, children }) => {
  const fr = useCurrentFrame();
  const k = interpolate(fr, [0, len], [1, z], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ transform: `scale(${k})`, transformOrigin: `${ox}px ${oy}px` }}>{children}</AbsoluteFill>;
};
// a scene: fades in over FADE frames, runs to the next scene's start plus the overlap
const Scene: React.FC<{ sc: { from: number; to: number }; first?: boolean; children: React.ReactNode }> = ({ sc, first, children }) => (
  <Sequence from={f(sc.from)} durationInFrames={f(sc.to - sc.from) + FADE}>
    <FadeIn skip={first}>{children}</FadeIn>
  </Sequence>
);
const FadeIn: React.FC<{ skip?: boolean; children: React.ReactNode }> = ({ skip, children }) => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: skip ? 1 : interpolate(fr, [0, FADE], [0, 1], { extrapolateRight: 'clamp' }) }}>{children}</AbsoluteFill>;
};
// a shot that starts part-way into a scene (hard cut)
const At: React.FC<{ s: number; e?: number; children: React.ReactNode }> = ({ s, e, children }) =>
  <Sequence from={f(s)} durationInFrames={e === undefined ? undefined : f(e - s)} layout="none">{children}</Sequence>;

// ---- animated shots (each reads its own frame inside its Sequence)
const useT = () => useCurrentFrame() / FPS;
const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const ramp = (t: number, a: number, b: number) => ease((t - a) / (b - a));

const Shot01: React.FC<{ lit: boolean; t0?: number }> = ({ lit, t0 = 0 }) => {
  const t = useT() + t0;
  // tug, tug, tug: sharp pulls that relax; after the cut he freezes mid-pull
  const tug = Math.pow(Math.abs(Math.sin(t * Math.PI * 1.5)), 0.5);
  const pull = lit ? 0.15 + 0.8 * tug : 0.5 + 0.08 * Math.sin(t * 2);
  return lit ? <S01A pull={pull} fx={-60 + t * 40} fph={t * 0.9} /> : <S01B pull={pull} fx={-60 + t * 40} fph={t * 0.9} />;
};
const PowerFlicker: React.FC = () => {
  const fr = useCurrentFrame();
  return fr === 2 || fr === 3 ? <AbsoluteFill><Shot01 lit t0={CUT_POWER} /></AbsoluteFill> : null;
};
const Shot02A: React.FC = () => {
  const t = useT();
  const hey = 0.15 + wordAt('s02a', 'hey'), look = 0.15 + wordAt('s02a', 'look');
  const push = Math.max(Math.exp(-Math.pow((t - hey - 0.1) / 0.18, 2)), Math.exp(-Math.pow((t - look - 0.15) / 0.25, 2)));
  return <S02A wave={t * 1.8} push={push} />;
};
const Shot02B: React.FC = () => { const t = useT(); return <S02B x={170 + t * 200} ph={t * 0.6} />; };
const Shot03: React.FC = () => { const t = useT(); return <S03 x={430 + t * 190} ph={0.3 + t * 0.6} flick={t * 3} />; };
const Shot04: React.FC = () => {
  const t = useT();
  const k = ramp(t, 0.4, FLASH_04);                       // the lead creeps toward the terminal
  const r = ramp(t, FLASH_04 + 0.05, FLASH_04 + 0.3);      // jerks back after the flash
  const bulb = t < FLASH_04 ? 'off' : t < FLASH_04 + 0.17 ? 'lit' : 'burnt';
  const smoke = t < FLASH_04 + 0.1 ? 0 : Math.min(2, (t - FLASH_04 - 0.1) / 1.6);
  return <S04M k={k} r={r} bulb={bulb} smoke={smoke} />;
};
const FlashOverlay: React.FC = () => {
  const fr = useCurrentFrame();
  const o = interpolate(fr, [0, 2, 9], [0, 1, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 540 - 520, top: 930 - 520, width: 1040, height: 1040, borderRadius: '50%', opacity: o, background: 'radial-gradient(circle, rgba(255,250,225,1) 0%, rgba(255,210,120,0.75) 22%, rgba(255,170,60,0) 70%)', mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: '#fff4d6', opacity: o * 0.35, mixBlendMode: 'screen' }} />
    </AbsoluteFill>
  );
};
const Shot05: React.FC = () => {
  const t = useT();
  const press = ramp(t, CLICK_05 - 0.9, CLICK_05);
  const light = t < CLICK_05 ? 0 : Math.min(1, (t - CLICK_05) / 0.12) * (1 - 0.04 * Math.sin(t * 23));
  return <S05 press={press} light={light} />;
};
const Shot06: React.FC = () => {
  const t = useT();
  // looking down at the bulb ("How do you aim it?"), then up at the board; the clip carries the realization
  const look = 1 - ramp(t, 1.7, 2.4);
  return <S06 look={look} breath={t * 0.3} />;
};
const Shot08A: React.FC = () => { const t = useT(); return <S08A rub={t * 1.1} />; };
const Shot08B: React.FC<{ len: number }> = ({ len }) => {
  const fr = useCurrentFrame();
  const t = interpolate(fr, [f(0.4), len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <S08B t={ease(t)} />;
};
const Shot09: React.FC = () => {
  // walking -> two flashes on the pavement ahead -> he stops, turns -> looks up
  const t = useT();
  const on = (a: number, b: number) => t >= a && t < b;
  const flash = on(0.3, 0.55) || on(0.75, 1.0) ? 1 : t >= STOP_09 - 0.05 ? 0.85 : 0;
  const lookUp = 0.35 + wordAt('s09', 'looks');
  if (t < STOP_09) return <S09 flash={flash} turned={false} x={420 - 190 * (STOP_09 - t)} ph={t * 0.6} />;
  return <S09 flash={flash} turned up={0.25 + 0.75 * ramp(t, lookUp - 0.2, lookUp + 0.4)} />;
};
const EndCard: React.FC = () => {
  const fr = useCurrentFrame();
  const k = interpolate(fr, [0, 12], [0.92, 1], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ transform: `scale(${k})` }}><S10 /></AbsoluteFill>;
};

// ---- captions: short word groups in the lower centre, the spoken word lit in amber
const groups = (l: Line) => {
  const out: { s: number; e: number; words: { w: string; s: number; e: number }[] }[] = [];
  let cur: typeof out[0]['words'] = [];
  vo[l].words.forEach((w, i) => {
    cur.push(w);
    const end = /[.!?,]$/.test(w.w) || cur.length >= 4 || i === vo[l].words.length - 1;
    if (end) {
      // a lone word joins the group before it, when that group did not end a sentence
      const prev = out[out.length - 1];
      if (cur.length === 1 && prev && prev.words.length < 4 && !/[.!?]$/.test(prev.words[prev.words.length - 1].w)) { prev.words.push(...cur); prev.e = cur[0].e; }
      else out.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur });
      cur = [];
    }
  });
  return out;
};
const Caption: React.FC<{ l: Line }> = ({ l }) => {
  const fr = useCurrentFrame(), t = fr / FPS;
  const gs = groups(l);
  const g = gs.find((x, i) => t >= x.s - 0.05 && t < (gs[i + 1]?.s ?? x.e + 0.4) - 0.05);
  if (!g) return null;
  const pop = interpolate(t - g.s, [-0.05, 0.08], [0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 1430 }}>
      <div style={{ transform: `scale(${pop})`, maxWidth: 860, textAlign: 'center', font: '800 72px/1.15 Inter, sans-serif', letterSpacing: '-0.01em', color: '#fff', textShadow: '0 4px 0 #000, 0 0 18px rgba(0,0,0,0.85)', WebkitTextStroke: '3px #0b0b0b', paintOrder: 'stroke fill' }}>
        {g.words.map((w, i) => <span key={i} style={{ color: t >= w.s - 0.02 && t < w.e + 0.05 ? '#ffc24a' : '#fff' }}>{w.w.replace(/\.\.\.$/, '…')}{i < g.words.length - 1 ? ' ' : ''}</span>)}
      </div>
    </AbsoluteFill>
  );
};

export const FlashlightShort: React.FC = () => {
  const len = (k: keyof typeof SC) => f(SC[k].to - SC[k].from) + FADE;
  return (
    <AbsoluteFill style={{ background: '#0b0f1e' }}>
      {/* 01 · locked in: he tugs at the stuck door; the power cuts */}
      <Scene sc={SC.s1} first>
        <Cam len={len('s1')} z={1.04} ox={260} oy={900}>
          <At s={0} e={CUT_POWER}><Shot01 lit /></At>
          <At s={CUT_POWER}><Shot01 lit={false} t0={CUT_POWER} /><PowerFlicker /></At>
        </Cam>
      </Scene>
      {/* 02 · he shouts and waves; the friend walks on with his earbuds in */}
      <Scene sc={SC.s2}>
        <At s={0} e={2.0}><Cam len={f(2.2)} z={1.03} ox={700} oy={700}><Shot02A /></Cam></At>
        <At s={2.0}><Shot02B /></At>
      </Scene>
      {/* 03 · the candle flickers; the friend keeps walking */}
      <Scene sc={SC.s3}><Cam len={len('s3')} z={1.04} ox={300} oy={600}><Shot03 /></Cam></Scene>
      {/* 04 · the lead touches: one flash, then it's dead */}
      <Scene sc={SC.s4}>
        <Cam len={len('s4')} z={1.05} ox={560} oy={1000}>
          <Shot04 />
          <At s={FLASH_04} e={FLASH_04 + 0.5}><FlashOverlay /></At>
        </Cam>
      </Scene>
      {/* 05 · the thumb presses the switch, the bulb comes on */}
      <Scene sc={SC.s5}><Cam len={len('s5')} z={1.04} ox={560} oy={1000}><Shot05 /></Cam></Scene>
      {/* 06 · he looks up at the board, then at the bowl */}
      <Scene sc={SC.s6}>
        <At s={0} e={CLIP_06}><Cam len={f(CLIP_06)} z={1.05} ox={760} oy={500}><Shot06 /></Cam></At>
        {/* the Higgsfield reach (source frames 43-101 at 24 fps), ending as his fingertips touch the carton */}
        <At s={CLIP_06}><OffthreadVideo src={staticFile('clips/higgsfield-reach.mp4')} startFrom={54} endAt={126} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></At>
      </Scene>
      {/* 07 · electrons in the metal (waves travel, electrons wiggle) */}
      <Scene sc={SC.s7}><Cam len={len('s7')} z={1.03} ox={540} oy={980}><S07 /></Cam></Scene>
      {/* 08 · smoothing the foil, then the spot tightens */}
      <Scene sc={SC.s8}>
        <At s={0} e={MOVE_08}><FoilBuild speed={FOIL_SPEED} /></At>
        <At s={MOVE_08}><Shot08B len={f(TIGHT_08 - MOVE_08)} /></At>
      </Scene>
      {/* 09 · two flashes, he stops, turns, looks up */}
      <Scene sc={SC.s9}><Shot09 /></Scene>
      {/* 10 · end card */}
      <Scene sc={SC.s10}><EndCard /></Scene>

      {/* narration + captions */}
      {Object.values(SC).flatMap((sc) => sc.lines.map(([l, at]) => (
        <Sequence key={l} from={f(sc.from + at)} durationInFrames={f(vo[l as Line].len + 0.6)}>
          <Audio src={staticFile(`vo/${l}.wav`)} />
          <Caption l={l as Line} />
        </Sequence>
      )))}
      {/* sound effects */}
      <Sequence from={f(CUT_POWER) - 8}><Audio src={staticFile('sfx/powercut.wav')} volume={0.5} /></Sequence>
      <Sequence from={f(SC.s4.from + FLASH_04)}><Audio src={staticFile('sfx/pop.wav')} volume={0.45} /></Sequence>
      <Sequence from={f(SC.s5.from + CLICK_05)}><Audio src={staticFile('sfx/click.wav')} volume={0.5} /></Sequence>
      {[['flap', 0.9, 0.35], ['rustle_pull', 2.2, 0.4], ['tear', 4.1, 0.55], ['rustle_press', 6.0, 0.4]].map(([n, at, v]) => (
        <Sequence key={n as string} from={f(SC.s8.from + (at as number) / FOIL_SPEED)}><Audio src={staticFile(`sfx/${n}.wav`)} volume={v as number} /></Sequence>
      ))}
      <Sequence from={f(SC.s9.from + 0.3)}><Audio src={staticFile('sfx/click.wav')} volume={0.35} /></Sequence>
      <Sequence from={f(SC.s9.from + 0.75)}><Audio src={staticFile('sfx/click.wav')} volume={0.35} /></Sequence>
    </AbsoluteFill>
  );
};
