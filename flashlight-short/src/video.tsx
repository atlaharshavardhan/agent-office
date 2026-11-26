// "How You'd Invent a Flashlight": the 50 s Short. The storyboard stills are cut to George's narration
// (public/vo, made by tools/vo_george.py) with slow camera pushes, a few in-shot effects and word-by-word captions.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import vo from '../public/vo/vo.json';
import { S01A, S01B, S02A, S02B, S03, S04A, S04B, S05, S06, S07, S08A, S08B, S09, S10 } from './storyboard';

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
  s6: { from: 24, to: 30, lines: [['s06', 0.3]] },
  s7: { from: 30, to: 37, lines: [['s07', 0.3]] },
  s8: { from: 37, to: 43, lines: [['s08', 0.2]] },
  s9: { from: 43, to: 48, lines: [['s09', 0.35]] },
  s10: { from: 48, to: 50, lines: [] },
} as const;
export const DURATION = f(50);
const FADE = 8;

// key moments (seconds inside their scene)
const CUT_POWER = 0.15 + wordAt('s01', 'cuts') + 0.12;
const FLASH_04 = 0.2 + wordAt('s04', 'flash');
const CLICK_05 = 0.25 + wordAt('s05', 'switch');
const MOVE_08 = 0.2 + wordAt('s08', 'move');
const TIGHT_08 = 0.2 + vo.s08.words[vo.s08.words.length - 1].e;
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

// ---- shot-specific effects
const FlashOverlay: React.FC = () => {
  // the 6 V bulb: one bright flash at the bulb, then nothing
  const fr = useCurrentFrame();
  const o = interpolate(fr, [0, 2, 9], [0, 1, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 540 - 520, top: 930 - 520, width: 1040, height: 1040, borderRadius: '50%', opacity: o, background: 'radial-gradient(circle, rgba(255,250,225,1) 0%, rgba(255,210,120,0.75) 22%, rgba(255,170,60,0) 70%)', mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: '#fff4d6', opacity: o * 0.35, mixBlendMode: 'screen' }} />
    </AbsoluteFill>
  );
};
const PowerFlicker: React.FC = () => {
  // the lamp stutters once as it dies
  const fr = useCurrentFrame();
  return fr === 2 || fr === 3 ? <AbsoluteFill><S01A /></AbsoluteFill> : null;
};
const Shot08B: React.FC<{ len: number }> = ({ len }) => {
  const fr = useCurrentFrame();
  const t = interpolate(fr, [f(0.4), len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <S08B t={t} />;
};
const Shot09: React.FC = () => {
  // two flashes, then it stays on; he stops and turns on "stops"
  const fr = useCurrentFrame();
  const on = (a: number, b: number) => fr >= f(a) && fr < f(b);
  const flash = on(0.3, 0.55) || on(0.75, 1.0) ? 1 : fr >= f(STOP_09 - 0.05) ? 0.85 : 0;
  return <S09 flash={flash} turned={fr >= f(STOP_09)} />;
};
const Wiggle07: React.FC = () => <S07 />;

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
      {/* 01 · locked in, power cuts */}
      <Scene sc={SC.s1} first>
        <Cam len={len('s1')} z={1.07} ox={260} oy={900}>
          <At s={0} e={CUT_POWER}><S01A /></At>
          <At s={CUT_POWER}><S01B /><PowerFlicker /></At>
        </Cam>
      </Scene>
      {/* 02 · the shout fails */}
      <Scene sc={SC.s2}>
        <At s={0} e={2.0}><Cam len={f(2.2)} z={1.05} ox={700} oy={700}><S02A /></Cam></At>
        <At s={2.0}><Cam len={f(2.2)} z={1.04} ox={540} oy={800}><S02B /></Cam></At>
      </Scene>
      {/* 03 · the candle fails */}
      <Scene sc={SC.s3}><Cam len={len('s3')} z={1.07} ox={300} oy={600}><S03 /></Cam></Scene>
      {/* 04 · the first bulb burns out */}
      <Scene sc={SC.s4}>
        <Cam len={len('s4')} z={1.08} ox={560} oy={1000}>
          <At s={0} e={FLASH_04 + 0.12}><S04A /></At>
          <At s={FLASH_04 + 0.12}><S04B /></At>
          <At s={FLASH_04} e={FLASH_04 + 0.5}><FlashOverlay /></At>
        </Cam>
      </Scene>
      {/* 05 · matched voltage + a switch */}
      <Scene sc={SC.s5}><Cam len={len('s5')} z={1.06} ox={560} oy={1000}><S05 /></Cam></Scene>
      {/* 06 · the physics board */}
      <Scene sc={SC.s6}><Cam len={len('s6')} z={1.08} ox={760} oy={500}><S06 /></Cam></Scene>
      {/* 07 · electrons in the metal (waves travel, electrons wiggle) */}
      <Scene sc={SC.s7}><Cam len={len('s7')} z={1.04} ox={540} oy={980}><Wiggle07 /></Cam></Scene>
      {/* 08 · build the reflector, then the spot tightens */}
      <Scene sc={SC.s8}>
        <At s={0} e={MOVE_08}><Cam len={f(MOVE_08)} z={1.05} ox={540} oy={1050}><S08A /></Cam></At>
        <At s={MOVE_08}><Shot08B len={f(TIGHT_08 - MOVE_08)} /></At>
      </Scene>
      {/* 09 · two flashes, he stops, looks up */}
      <Scene sc={SC.s9}><Cam len={len('s9')} z={1.05} ox={560} oy={900}><Shot09 /></Cam></Scene>
      {/* 10 · end card */}
      <Scene sc={SC.s10}><S10 /></Scene>

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
      <Sequence from={f(SC.s9.from + 0.3)}><Audio src={staticFile('sfx/click.wav')} volume={0.35} /></Sequence>
      <Sequence from={f(SC.s9.from + 0.75)}><Audio src={staticFile('sfx/click.wav')} volume={0.35} /></Sequence>
    </AbsoluteFill>
  );
};
