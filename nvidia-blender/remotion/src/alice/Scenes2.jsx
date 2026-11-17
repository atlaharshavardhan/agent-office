// Alice Short · Scenes 2, 3, 5, 6, 7, 10 + full composition with global short-chunk captions.
import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, BODY, SAFE, ramp, clamp, lerp } from '../theme';
import { FontFace } from '../ui';
import { BlendSeq, Shade } from '../v2/kit';
import { NvLogo, NytLogo, TextBadge, FlagUS, StoryChain } from './Logos';
import { AliceS1 } from './S1Hook';
import { AliceS4 } from './S4Map';
import { AliceS8, AliceS9 } from './S8S9';
import TL from './timeline.json';
import fs from './frames.json';

const Tag = ({ text = 'Illustration · not affiliated with NVIDIA' }) => <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(245,245,245,.62)', textShadow: '0 1px 6px #000' }}>{text}</div>;
const Head = ({ a = 1, lines, size = 96, top = 220 }) => (
  <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top, textAlign: 'center', opacity: a }}>
    {lines.map(([txt, col], k) => <div key={k} style={{ font: `800 ${size}px/1.02 ${FONT}`, letterSpacing: -2.5, color: col || '#fff', textShadow: '0 6px 30px #000' }}>{txt}</div>)}
  </div>
);
// a rendered sequence if its frames exist (GPU deliveries), else a fallback
const Seq = ({ dir, n, d, fallback, ...rest }) => (fs[dir] ? <BlendSeq dir={dir} start={0} first={1} last={fs[dir]} rate={fs[dir] / (d * 30)} {...rest} /> : fallback);

// 2 · case file on the desk (GPU render) + story chain builds
export const AliceS2 = ({ d }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Seq dir="alice_s2" d={d} fallback={<Img src={staticFile('alice/s02_still.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />} />
      <Shade top={0.8} bottom={0.5} />
      <StoryChain top={230} a1={ramp(f, d * 0.55, 0.3)} a2={ramp(f, d * 0.62, 0.3)} a3={0} block={0} />
      <Tag />
    </AbsoluteFill>
  );
};

// 3 · data centre: $4.6B+ (Bloomberg estimate) -> largest client Alibaba (reported)
export const AliceS3 = ({ d }) => {
  const f = useCurrentFrame();
  const b = ramp(f, d * 0.62, 0.3);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <BlendSeq dir="shot03" start={0} first={1} last={45} rate={45 / (d * 30)} filter="brightness(.8)" />
      <Shade top={0.85} bottom={0.55} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 230, textAlign: 'center', opacity: 1 - b }}>
        <div style={{ font: `800 200px/0.95 ${FONT}`, letterSpacing: -6, color: C.green, textShadow: '0 0 60px rgba(118,185,0,.4), 0 6px 30px #000' }}>$4.6B+</div>
        <div style={{ font: `800 48px ${FONT}`, color: '#fff', textShadow: '0 4px 20px #000' }}>of NVIDIA hardware</div>
        <div style={{ font: `700 36px ${BODY}`, color: 'rgba(255,255,255,.85)', marginTop: 10 }}>Bloomberg estimate</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 250, textAlign: 'center', opacity: b, transform: `scale(${0.92 + 0.08 * b})` }}>
        <div style={{ font: `700 34px ${BODY}`, color: 'rgba(255,255,255,.8)', letterSpacing: 3 }}>LARGEST CLIENT, REPORTS SAY</div>
        <div style={{ display: 'inline-block', marginTop: 14, background: '#F5F5F5', borderRadius: 18, padding: '10px 40px', font: `800 110px/1.05 ${FONT}`, color: '#FF6A00' }}>ALIBABA</div>
      </div>
      <Tag text="Data-center illustration · not affiliated with NVIDIA or Alibaba" />
    </AbsoluteFill>
  );
};

// 5 · investigation board (dark): pinned cards + red threads, NYT credit
const Card = ({ x, y, w, h, a, rot = 0, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: a, transform: `rotate(${rot}deg) scale(${0.9 + 0.1 * a})`,
    background: '#E9E4D8', borderRadius: 6, boxShadow: '0 16px 40px rgba(0,0,0,.8)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ position: 'absolute', top: 8, left: '50%', width: 18, height: 18, marginLeft: -9, borderRadius: 9, background: C.red, boxShadow: '0 2px 4px #000' }} />
    {children}
  </div>
);
export const AliceS5 = ({ d }) => {
  const f = useCurrentFrame(), t = f / 30;
  const z = 1 + 0.08 * clamp(t / d);
  const ac = (k) => ramp(f, 0.1 + k * 0.35, 0.3);
  const thread = ramp(f, 1.6, 0.6);
  const pin = { J: [300, 760], A: [700, 760], M: [700, 1110], U: [300, 1110] };
  return (
    <AbsoluteFill style={{ background: '#0c0b0a' }}>
      <FontFace />
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: '50% 55%' }}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, #3a2a1c 0%, #1a130d 55%, #070605 100%)' }} />
        <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
          {[['J', 'A'], ['A', 'M'], ['M', 'U'], ['U', 'A'], ['J', 'M']].map(([p, q], k) => {
            const [x1, y1] = pin[p], [x2, y2] = pin[q];
            return <line key={k} x1={x1} y1={y1 - 150} x2={lerp(x1, x2, thread)} y2={lerp(y1 - 150, y2 - 150, thread)} stroke="#E5484D" strokeWidth="5" opacity=".9" />;
          })}
        </svg>
        <Card x={150} y={560} w={300} h={380} a={ac(0)} rot={-3}>
          <Img src={staticFile('alice/jensen_cut.png')} style={{ height: 300, filter: 'brightness(.5) contrast(1.3) drop-shadow(-3px -2px 0 rgba(118,185,0,.8))', marginTop: 20 }} />
          <div style={{ font: `800 30px ${FONT}`, color: '#101214', marginTop: -6 }}>JENSEN HUANG</div>
        </Card>
        <Card x={550} y={560} w={300} h={380} a={ac(1)} rot={2.5}>
          <div style={{ width: 200, height: 260, background: '#111', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 110px ${FONT}`, color: C.red, marginTop: 20 }}>?</div>
          <div style={{ font: `800 30px ${FONT}`, color: '#101214', marginTop: 16 }}>ALICE HUANG</div>
        </Card>
        <Card x={550} y={1000} w={300} h={170} a={ac(2)} rot={-2}><TextBadge text="MEGASPEED" sub="Singapore" color="#101214" h={42} /></Card>
        <Card x={150} y={1000} w={300} h={170} a={ac(3)} rot={2}>
          <FlagUS h={44} /><div style={{ font: `800 26px ${FONT}`, color: '#101214', marginTop: 10 }}>U.S. OFFICIALS</div>
        </Card>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 230, display: 'flex', justifyContent: 'center', opacity: ramp(f, 0, 0.25) }}>
        <div style={{ background: 'rgba(10,11,13,.88)', borderRadius: 16, padding: '14px 26px', textAlign: 'center', border: '2px solid rgba(255,255,255,.18)' }}>
          <NytLogo h={42} />
          <div style={{ font: `800 30px ${BODY}`, color: C.red, marginTop: 8, letterSpacing: 2 }}>REPORTED · NOT PROVEN</div>
        </div>
      </div>
      <Tag />
    </AbsoluteFill>
  );
};

// 6 · Reuters: blurred boardroom + one line
export const AliceS6 = ({ d }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <BlendSeq dir="v2_meeting" start={0} first={1} last={105} step={2} rate={1.2} filter="blur(8px) brightness(.9)" />
      <Shade top={0.85} bottom={0.6} />
      <AbsoluteFill style={{ background: 'rgba(0,0,0,.35)' }} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 520, textAlign: 'center', opacity: ramp(f, 0, 0.2) }}>
        <div style={{ display: 'inline-block', font: `800 46px ${FONT}`, letterSpacing: 6, color: '#fff', border: '3px solid #FF8000', padding: '6px 22px', borderRadius: 8 }}>REUTERS</div>
        <div style={{ font: `700 38px ${BODY}`, color: 'rgba(255,255,255,.8)', marginTop: 30 }}>He told executives it was</div>
        <div style={{ font: `800 112px/1 ${FONT}`, color: '#fff', letterSpacing: -3, marginTop: 6 }}>ROUTINE</div>
        <div style={{ font: `800 112px/1 ${FONT}`, color: '#fff', letterSpacing: -3 }}>BUSINESS</div>
      </div>
      <Tag text="Reuters report · paraphrased · illustration" />
    </AbsoluteFill>
  );
};

// 7 · resignation: Jensen from behind, lights off (GPU render) + date
export const AliceS7 = ({ d }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Seq dir="alice_s7" d={d} fallback={<BlendSeq dir="v2_stage" start={0} first={20} last={60} rate={1} filter={`brightness(${lerp(0.9, 0.25, clamp(f / (d * 30)))})`} />} />
      <Shade top={0.8} bottom={0.5} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 230, textAlign: 'center' }}>
        <div style={{ font: `800 60px ${FONT}`, color: C.red, letterSpacing: 4, opacity: ramp(f, 0, 0.2) }}>NOV 12, 2026</div>
        <div style={{ font: `800 140px/1 ${FONT}`, color: '#fff', letterSpacing: -4, opacity: ramp(f, 0.2, 0.25) }}>RESIGNED</div>
      </div>
      <Tag text="Stylized illustration · not real footage" />
    </AbsoluteFill>
  );
};

// 10 · outro (2 s)
export const AliceS10 = () => {
  const f = useCurrentFrame();
  const a = ramp(f, 0, 0.3), b = ramp(f, 0.18, 0.3), c = ramp(f, 0.4, 0.3), out = 1 - ramp(f, 1.75, 0.25);
  return (
    <AbsoluteFill style={{ background: C.bg, alignItems: 'center', justifyContent: 'center', opacity: out, paddingRight: SAFE.r - SAFE.l, paddingBottom: 140 }}>
      <Img src={staticFile('logo.png')} style={{ width: 200, height: 200, borderRadius: '50%', opacity: a, transform: `scale(${0.7 + 0.3 * a})`, boxShadow: '0 0 60px rgba(118,185,0,.45)' }} />
      <div style={{ marginTop: 26, font: `800 110px/1 ${FONT}`, color: '#fff', opacity: b }}>Invisi<span style={{ color: C.green }}>Tech</span></div>
      <div style={{ marginTop: 14, font: `700 48px ${BODY}`, color: '#eee', opacity: b }}>@TheInvisiTech</div>
      <div style={{ marginTop: 30, padding: '16px 56px', borderRadius: 50, background: C.red, font: `800 42px ${BODY}`, color: '#fff', opacity: c }}>Follow for more</div>
    </AbsoluteFill>
  );
};

// ---- global captions: 2-4 word chunks timed by word count
const REP = [['A.I.', 'AI'], ['C.E.O.', 'CEO'], ['four point six billion dollars', '$4.6 billion'], ['Nvidia', 'NVIDIA'], ['twelfth', '12'], ['Invisi Tech', 'InvisiTech']];
const RED = /spying|China|banned\.|Shipping|groundless|resigned|leak|Chinese|intelligence|relationship|denies|wrongdoing|charges/i;
const GREEN = /\$4\.6|Alibaba|NVIDIA|Renting|routine|board/i;
const chunk = (txt) => {
  const w = txt.split(' '); const out = []; let cur = [];
  w.forEach((x) => { cur.push(x); if (cur.length >= 3 || /[,.?:]$/.test(x)) { out.push(cur.join(' ')); cur = []; } });
  if (cur.length) out.push(cur.join(' '));
  return out;
};
const CH = TL.sentences.flatMap((s) => {
  let txt = s.say; REP.forEach(([a, b]) => { txt = txt.split(a).join(b); });
  const parts = chunk(txt); const n = parts.reduce((k, p) => k + p.split(' ').length, 0);
  let t = s.t0;
  return parts.map((p) => { const dur = (s.t1 - s.t0) * p.split(' ').length / n; const c = { p, t0: t, t1: t + dur }; t += dur; return c; });
});
const Captions = () => {
  const f = useCurrentFrame(), t = f / 30;
  if (t >= TL.scenes[9]) return null;
  const c = CH.find((x, k) => t >= x.t0 && t < (CH[k + 1] ? CH[k + 1].t0 : x.t1 + 0.3));
  if (!c) return null;
  const a = ramp(f, c.t0, 0.06);
  const col = RED.test(c.p) ? C.red : GREEN.test(c.p) ? C.green : C.white;
  return (
    <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1300, textAlign: 'center' }}>
      <span style={{ font: `800 64px/1.1 ${BODY}`, color: col, opacity: a, display: 'inline-block', transform: `scale(${0.92 + 0.08 * a})`, textShadow: '0 0 10px #000, 0 4px 18px #000, 0 0 3px #000' }}>{c.p}</span>
    </div>
  );
};

const SCENES = [AliceS1, AliceS2, AliceS3, AliceS4, AliceS5, AliceS6, AliceS7, AliceS8, AliceS9, AliceS10];
export const AliceMain = ({ withAudio = true }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <FontFace />
    {TL.scenes.map((s0, i) => {
      const s1 = TL.scenes[i + 1] ?? TL.end, Comp = SCENES[i];
      return <Sequence key={i} from={Math.round(s0 * 30)} durationInFrames={Math.round((s1 - s0) * 30)}><Comp d={s1 - s0} /></Sequence>;
    })}
    <Captions />
    {withAudio && <Audio src={staticFile('audio/alice_mix.wav')} />}
  </AbsoluteFill>
);
export const ALICE_FRAMES = TL.frames;
