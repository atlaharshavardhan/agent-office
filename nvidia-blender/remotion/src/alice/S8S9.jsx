// Alice Short · Scene 8 (denials, 3.5 s) and Scene 9 (final question, 5 s). Reuse existing renders only.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT, BODY, SAFE, ramp } from '../theme';
import { FontFace } from '../ui';
import { BlendSeq, Shade } from '../v2/kit';
import { Chunks } from './Chunks';
import { FlagCN, NvLogo, TextBadge } from './Logos';

const Tag = () => <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(245,245,245,.62)', textShadow: '0 1px 6px #000' }}>Illustration · not affiliated with NVIDIA</div>;

// one statement card: logo/flag on top, one big word line, small source line
const Statement = ({ a, top, head, big, src, color }) => (
  <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top, opacity: a, transform: `translateY(${(1 - a) * 24}px)`, display: 'flex', justifyContent: 'center' }}>
    <div style={{ background: 'rgba(10,11,13,.86)', border: `2px solid ${color}66`, borderRadius: 22, padding: '22px 34px', textAlign: 'center', minWidth: 640, boxShadow: '0 20px 60px rgba(0,0,0,.6)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, height: 56 }}>{head}</div>
      <div style={{ font: `800 84px/1.05 ${FONT}`, color, letterSpacing: -2, marginTop: 10 }}>{big}</div>
      <div style={{ font: `700 26px ${BODY}`, color: 'rgba(255,255,255,.7)', marginTop: 8 }}>{src}</div>
    </div>
  </div>
);

export const AliceS8 = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <FontFace />
      <BlendSeq dir="v2_trading" start={0} first={1} last={109} step={2} rate={1} filter="brightness(.75) saturate(1.1)" />
      <Shade top={0.8} bottom={0.6} />
      <AbsoluteFill style={{ background: 'rgba(0,0,0,.35)' }} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 220, textAlign: 'center', font: `800 96px/1 ${FONT}`, letterSpacing: -2.5, color: '#fff', textShadow: '0 6px 30px #000', opacity: ramp(f, 0, 0.25) }}>THEY DENY IT</div>
      <Statement a={ramp(f, 0.15, 0.3)} top={400} color={C.red} big="“GROUNDLESS”" src="China’s foreign ministry"
        head={<><FlagCN h={46} /><span style={{ font: `800 40px ${FONT}`, color: '#fff', letterSpacing: 2 }}>CHINA</span></>} />
      <Statement a={ramp(f, 1.6, 0.3)} top={760} color={'#F5F5F5'} big="DENIES WRONGDOING" src="Company statement"
        head={<TextBadge text="MEGASPEED" h={46} />} />
      <Tag />
    </AbsoluteFill>
  );
};

export const AliceS9 = ({ d = 5 }) => {
  const f = useCurrentFrame(), t = f / 30;
  const cut = 1.3, ans = ramp(f, d * 0.52, 0.3);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <FontFace />
      {t < cut
        ? <BlendSeq dir="shot03" start={0} first={1} last={45} rate={1} />
        : <BlendSeq dir="v2_overlook" start={cut} first={1} last={169} step={2} rate={169 / ((d - cut) * 30)} filter="brightness(.62) saturate(.5) contrast(1.1)" />}
      <Shade top={0.75} bottom={0.5} />
      {t >= cut - 0.1 && t < cut + 0.15 && <AbsoluteFill style={{ background: '#000', opacity: 0.7 * (1 - Math.abs(t - cut) / 0.15) }} />}
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 220, textAlign: 'center', opacity: 1 - ans }}>
        <div style={{ font: `800 104px/1 ${FONT}`, letterSpacing: -3, color: '#fff', textShadow: '0 6px 30px #000' }}>DID AI TECH</div>
        <div style={{ font: `800 104px/1 ${FONT}`, letterSpacing: -3, color: C.red, textShadow: '0 6px 30px #000' }}>LEAK?</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 230, display: 'flex', justifyContent: 'center', opacity: ans, transform: `scale(${0.94 + 0.06 * ans})` }}>
        <div style={{ background: 'rgba(10,11,13,.86)', border: `2px solid ${C.green}66`, borderRadius: 22, padding: '20px 32px', textAlign: 'center' }}>
          <NvLogo h={44} />
          <div style={{ font: `800 30px ${BODY}`, color: 'rgba(255,255,255,.75)', marginTop: 10, letterSpacing: 2 }}>BOARD SAYS</div>
          <div style={{ font: `800 60px/1.08 ${FONT}`, color: '#fff', marginTop: 6 }}>“No reason to believe”</div>
          <div style={{ font: `800 60px/1.08 ${FONT}`, color: C.green }}>secrets were compromised</div>
        </div>
      </div>
      <Tag />
    </AbsoluteFill>
  );
};
