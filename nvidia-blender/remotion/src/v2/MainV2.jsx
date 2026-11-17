// V2: cinematic version. Blender character scenes (stage, meeting, construction, trading floor,
// overlook) + Three.js financial structures + Remotion typography. No side watermark (brand card only).
import React from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, Sequence } from 'remotion';
import { C, FONT, BODY, SAFE, ramp, clamp, lerp } from '../theme';
import { FontFace } from '../ui';
import { BlendSeq, BigTitle, Shade, CutFlash, Stat, IllustrationTag } from './kit';
import { Monoliths } from './Monoliths';
import { MoneyLoop3D } from './MoneyLoop3D';
import { GoldRush } from '../three/GoldRush';
import { Chart3D } from '../three/Chart3D';
import TL from './timeline_v2.json';

const SC = TL.scenes.map((s, i) => ({ start: s, end: TL.scenes[i + 1] ?? TL.end }));
const B = TL.beats;

// 1 · "$2 TRILLION GONE" readable on frame 1; existing Blender hook (frames 30-90) pushes in, green -> red
const S1 = ({ start, end }) => {
  const f = useCurrentFrame(), t = f / 30;
  const drop = ramp(f, 0.35, 0.9);
  const v = lerp(5.77, 3.76, drop);
  return (
    <AbsoluteFill>
      <BlendSeq dir="hook" start={start} first={30} last={90} rate={60 / ((end - start) * 30)} scale={1.04 + 0.05 * clamp(t / (end - start))} dy={150} />
      <Shade top={0.75} bottom={0.4} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 222, textAlign: 'center' }}>
        <div style={{ font: `800 150px/0.95 ${FONT}`, letterSpacing: -4, color: C.red, textShadow: '0 0 60px rgba(229,72,77,.5), 0 6px 30px #000',
          transform: `scale(${1.06 - 0.06 * ramp(f, 0, 0.3)})` }}>{TL.headline[0]}</div>
        <div style={{ font: `800 150px/0.95 ${FONT}`, letterSpacing: -4, color: C.white, textShadow: '0 6px 30px #000' }}>{TL.headline[1]}</div>
        <div style={{ marginTop: 18, font: `800 64px ${FONT}`, color: drop < 0.05 ? C.green : C.red, textShadow: '0 4px 20px #000' }}>
          ${v.toFixed(2)}T</div>
        <div style={{ font: `700 32px ${BODY}`, color: '#F5F5F5', textShadow: '0 3px 14px #000' }}>NVIDIA market value · Oct 6 → Nov 16, 2026</div>
      </div>
      <IllustrationTag text="3D illustration · not affiliated with NVIDIA" />
    </AbsoluteFill>
  );
};

// 3 · stylized character on an illustrative keynote stage -> push into the GPU -> data center
const S3 = ({ start, end }) => {
  const f = useCurrentFrame(), t = f / 30, lt = t - start;
  const cut = B.dc;                                       // cut through the chip into the data center
  if (t < cut) {
    const dur = cut - start;
    return (
      <AbsoluteFill>
        <BlendSeq dir="v2_stage" start={start} first={1} last={135} rate={135 / (dur * 30)} />
        <Shade top={0.6} bottom={0.35} />
        <BigTitle at={start + 0.1} lines={[['Why so'], ['valuable?', C.green]]} size={100} hold={dur - 0.5} />
        <IllustrationTag text="Stylized illustration · not real keynote footage" />
        <CutFlash at={cut} color="#0b1a05" max={0.9} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <BlendSeq dir="shot03" start={cut} first={1} last={45} rate={45 / ((end - cut) * 30)} />
      <Shade top={0.6} bottom={0.3} />
      <BigTitle at={cut + 0.05} lines={[['~8 in 10', C.green], ['AI chips']]} sub="NVIDIA’s est. share of AI accelerators" size={110} />
      <IllustrationTag text="3D illustration · not affiliated with NVIDIA" />
    </AbsoluteFill>
  );
};

// 4 · fictional executives + hologram -> expanding network of data centers
const S4 = ({ start, end }) => {
  const f = useCurrentFrame(), t = f / 30;
  if (t < B.network) {
    return (
      <AbsoluteFill>
        <BlendSeq dir="v2_meeting" start={start} first={1} last={105} step={2} rate={105 / ((B.network - start) * 30)} filter="brightness(1.9) contrast(1.05)" />
        <Shade top={0.6} bottom={0.35} />
        <BigTitle at={start + 0.1} lines={[[TL.capex.big, C.green]]} sub={TL.capex.sub} size={128} />
        <IllustrationTag text="Fictional executives · illustration" />
      </AbsoluteFill>
    );
  }
  return <GoldRush start={B.network} end={end} />;
};

// 5 · three verified reasons, each in its own environment
const S5 = ({ start, end }) => {
  const f = useCurrentFrame(), t = f / 30;
  const [r1, r2, r3] = B.reasons;
  if (t < r1) {
    return (
      <AbsoluteFill style={{ background: C.bg }}>
        <BlendSeq dir="v2_trading" start={start} first={1} last={20} step={2} rate={0.5} filter="blur(14px) brightness(.45)" />
        <BigTitle at={start} lines={[['Then,'], ['three shocks', C.red]]} size={120} top={600} />
      </AbsoluteFill>
    );
  }
  if (t < r2) {
    return (
      <AbsoluteFill>
        <BlendSeq dir="v2_build" start={r1} first={1} last={75} step={2} rate={75 / ((r2 - r1) * 30)} />
        <Shade top={0.55} bottom={0.3} />
        <BigTitle at={r1 + 0.05} lines={[['1 · Data-center', C.white], ['limits', C.red]]} sub={TL.reason1.sub} size={96} />
        <Stat at={r1 + 0.6} value={TL.reason1.stat} label={TL.reason1.label} top={1050} />
        <IllustrationTag text="Illustration" />
      </AbsoluteFill>
    );
  }
  if (t < r3) return <MoneyLoop3D start={r2} end={r3} />;
  return (
    <AbsoluteFill>
      <BlendSeq dir="v2_trading" start={r3} first={1} last={109} step={2} rate={109 / ((end - r3) * 30)} filter="brightness(1.7)" />
      <Shade top={0.6} bottom={0.35} />
      <BigTitle at={r3 + 0.05} lines={[['3 · CEO', C.white], ['steps down', C.red]]} sub={TL.reason3.sub} size={96} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1020, opacity: ramp(f, r3 + 0.5, 0.35) }}>
        <div style={{ background: '#F5F5F5', color: '#101214', padding: '18px 24px', borderLeft: `10px solid ${C.red}` }}>
          <div style={{ font: `700 24px ${BODY}`, letterSpacing: 3, color: C.red }}>{TL.reason3.kicker}</div>
          <div style={{ font: `800 40px/1.12 ${FONT}`, marginTop: 6 }}>{TL.reason3.headline}</div>
        </div>
      </div>
      <IllustrationTag text="Fictional investors · illustration" />
    </AbsoluteFill>
  );
};

// 7 · the character from behind overlooking the AI data hall; camera pulls back
const S7 = ({ start, end }) => {
  const f = useCurrentFrame(), t = f / 30;
  const q = B.question;
  return (
    <AbsoluteFill>
      <BlendSeq dir="v2_overlook" start={start} first={1} last={169} step={2} rate={169 / ((end - start) * 30)} />
      <Shade top={0.7} bottom={0.3} />
      {t < q
        ? <BigTitle at={start + 0.1} lines={[['Sales are'], ['still growing', C.green]]} sub={TL.sales} size={100} />
        : <BigTitle at={q} lines={[['AI BUBBLE', C.green], ['OR MARKET'], ['PANIC?', C.red]]} size={116} />}
      <IllustrationTag text="Stylized illustration · not a real event" />
    </AbsoluteFill>
  );
};

// 8 · InvisiTech, exactly 2 s
const S8 = ({ start }) => {
  const f = useCurrentFrame();
  const a = ramp(f, start, 0.3), b = ramp(f, start + 0.18, 0.3), c = ramp(f, start + 0.4, 0.3);
  const out = 1 - ramp(f, start + 1.75, 0.25);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill><Img src={staticFile('v2_overlook/f_0169.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(24px) brightness(.3)', transform: 'scale(1.1)' }} /></AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: out, paddingRight: SAFE.r - SAFE.l, paddingBottom: 140 }}>
        <Img src={staticFile('logo.png')} style={{ width: 200, height: 200, borderRadius: '50%', opacity: a, transform: `scale(${0.7 + 0.3 * a})`, boxShadow: '0 0 0 14px rgba(118,185,0,.12), 0 0 60px rgba(118,185,0,.45)' }} />
        <div style={{ marginTop: 26, font: `800 110px/1 ${FONT}`, color: C.white, opacity: b }}>Invisi<span style={{ color: C.green }}>Tech</span></div>
        <div style={{ marginTop: 14, font: `700 48px ${BODY}`, color: '#eee', opacity: b }}>@TheInvisiTech</div>
        <div style={{ marginTop: 30, padding: '16px 56px', borderRadius: 50, background: C.red, font: `800 42px ${BODY}`, color: '#fff', opacity: c }}>Follow for more</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CaptionsV2 = () => {
  const f = useCurrentFrame(), t = f / 30;
  const S = TL.sentences;
  const i = S.findIndex((s, k) => t >= s.t0 - 0.05 && t < (S[k + 1] ? S[k + 1].t0 - 0.05 : s.t1 + 0.5));
  if (i < 0 || t >= TL.scenes[7]) return null;
  const s = S[i];
  const a = ramp(f, s.t0 - 0.05, 0.1), out = 1 - clamp((t - (s.t1 + 0.3)) / 0.2);
  const parts = s.cap.split(/\*\*(.+?)\*\*/g);
  return (
    <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1262, height: 186, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ font: `800 54px/1.16 ${BODY}`, color: C.white, opacity: a * out, textShadow: '0 0 8px #000, 0 3px 14px #000, 0 0 3px #000' }}>
        {parts.map((p, k) => (k % 2 ? <span key={k} style={{ color: /\$|%|lost|down|panic|shocks|limits|stepped|Meta|fear/i.test(p) ? C.red : C.green }}>{p}</span> : <span key={k}>{p}</span>))}
      </div>
    </div>
  );
};

const pick = (i, s) => [S1, null, S3, S4, S5, null, S7, S8][i];

export const FrameV2 = ({ withAudio = true }) => {
  const f = useCurrentFrame(), t = f / 30;
  let i = SC.findIndex((s) => t >= s.start && t < s.end);
  if (i < 0) i = SC.length - 1;
  const s = SC[i];
  let body;
  if (i === 1) body = <Monoliths {...s} loss={TL.compare.loss} cmpValue={TL.compare.value} cmpName={TL.compare.name} cashAt={B.cash} />;
  else if (i === 5) body = <Chart3D {...s} down35={B.down35} />;
  else { const Comp = pick(i); body = <Comp {...s} />; }
  const toCut = s.end - t, fromCut = t - s.start;
  const dip = Math.max(i > 0 ? Math.max(0, 1 - fromCut / 0.1) : 0, i < SC.length - 1 ? Math.max(0, 1 - toCut / 0.067) : 0);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <FontFace />
      {body}
      <CaptionsV2 />
      {dip > 0 && <AbsoluteFill style={{ background: '#000', opacity: dip * 0.55 }} />}
      {withAudio && <Audio src={staticFile('audio/mix_v2.wav')} />}
    </AbsoluteFill>
  );
};

export const MainV2 = () => <FrameV2 />;
export const SceneV2 = ({ index }) => <Sequence from={-Math.round(SC[index].start * 30)}><FrameV2 withAudio={false} /></Sequence>;
export const SC_V2 = SC;
export const TL_V2 = TL;
