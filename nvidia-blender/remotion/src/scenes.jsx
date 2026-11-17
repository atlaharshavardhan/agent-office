// Scenes built on the Blender renders (1, 3, 5, 7) and the branding card (8).
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { C, TL, SAFE, FONT, BODY, ramp, clamp, lerp, sec } from './theme';
import { Title, R, G, Seq, Source, Disclaimer, Vignette, Flash } from './ui';

const blurBg = (src, extra = '') => (
  <AbsoluteFill>
    <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `blur(24px) brightness(.32) ${extra}`, transform: 'scale(1.1)' }} />
  </AbsoluteFill>
);

// 1 · The $2 trillion shock: Blender hook + valuation counter + "$2 TRILLION GONE"
export const S1 = ({ start, end }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const fr = (lt) => (lt < 0.3 ? 1 : lt < 3.3 ? Math.round(1 + (lt - 0.3) * 29.67) : 90);
  const push = 1 + 0.03 * clamp((t - 3.3) / 1.0);
  const cnt = ramp(f, 1.8, 1.15);
  const val = lerp(5.77, 3.76, cnt);
  const showCount = ramp(f, 0.9, 0.35) * (1 - ramp(f, 3.0, 0.15));
  const gone = ramp(f, 3.05, 0.3);
  const col = cnt < 0.05 ? C.green : C.red;
  return (
    <AbsoluteFill>
      <Seq dir="hook" start={start} frameAt={(lt) => Math.min(90, Math.max(1, fr(lt)))} scale={push} dy={190} />
      <Vignette strength={0.45} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 230, textAlign: 'center', opacity: showCount }}>
        <div style={{ font: `600 30px ${BODY}`, color: '#ddd', letterSpacing: 4 }}>NVIDIA MARKET VALUE</div>
        <div style={{ font: `800 150px/1.05 ${FONT}`, color: col, textShadow: `0 0 40px ${col}66` }}>${val.toFixed(2)}T</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 226, textAlign: 'center', opacity: gone, transform: `scale(${1.25 - 0.25 * gone})` }}>
        <div style={{ font: `800 112px/1 ${FONT}`, color: C.red, letterSpacing: -2, textShadow: '0 0 50px rgba(229,72,77,.5), 0 6px 30px #000' }}>$2 TRILLION</div>
        <div style={{ font: `800 112px/1 ${FONT}`, color: C.white, letterSpacing: -2, textShadow: '0 6px 30px #000' }}>GONE</div>
        <div style={{ marginTop: 14, font: `600 32px ${BODY}`, color: '#e8e8e8', textShadow: '0 3px 14px #000' }}>$5.77T → $3.76T · Oct 6 → Nov 16 close · −35%</div>
      </div>
      <Flash at={3.05} color={C.red} max={0.35} />
      <Disclaimer />
    </AbsoluteFill>
  );
};

// 3 · NVIDIA's AI empire: through the chip into the data center (Blender shot03)
export const S3 = ({ start, end }) => {
  const f = useCurrentFrame();
  const t = f / 30, lt = t - start;
  const through = clamp(1 - lt / 0.45);
  return (
    <AbsoluteFill>
      <Seq dir="shot03" start={start} frameAt={(x) => Math.min(176, Math.max(1, Math.round(1 + x * 30)))} />
      {through > 0 && (
        <AbsoluteFill style={{ opacity: through }}>
          <Img src={staticFile('hook/f_0024.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1 + (1 - through) * 5})`, transformOrigin: '45% 52%' }} />
        </AbsoluteFill>
      )}
      <Vignette strength={0.4} />
      <Title at={start + 0.1} sub={lt > 1.2 ? 'about 80% of AI accelerators' : null}>
        {lt < 1.25 ? <>Why so <G>valuable?</G></> : <><G>8 in 10</G> AI chips</>}
      </Title>
      <Source at={start + 1.3}>AI accelerator share ~80% · IDC est. via Silicon Analysts, 2026</Source>
      <Disclaimer />
    </AbsoluteFill>
  );
};

// 5 · What went wrong: three verified shocks, three distinct looks
export const S5 = ({ start, end }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const [r1, r2, r3] = TL.beats.reasons;
  if (t < r1) {
    const a = ramp(f, start, 0.3);
    return (
      <AbsoluteFill>
        {blurBg('hook/f_0090.png')}
        <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 560, textAlign: 'center', opacity: a }}>
          <div style={{ font: `800 210px/1 ${FONT}`, color: C.red, textShadow: '0 0 60px rgba(229,72,77,.45)', transform: `scale(${0.8 + 0.2 * a})` }}>3</div>
          <div style={{ font: `800 96px/1 ${FONT}`, color: C.white, marginTop: 10 }}>SHOCKS</div>
          <div style={{ display: 'flex', gap: 26, justifyContent: 'center', marginTop: 34 }}>
            {[0, 1, 2].map((k) => <div key={k} style={{ width: 22, height: 22, borderRadius: 11, background: C.red, opacity: ramp(f, start + 0.25 + k * 0.15, 0.2) }} />)}
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  if (t < r2) {
    const lt = t - r1;
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ transform: `scale(${1.04 + lt * 0.025})` }}>
          <Img src={staticFile('stills/scene05a_datacenter_red.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </AbsoluteFill>
        <Vignette strength={0.55} />
        <Title at={r1 + 0.05} sub="40 of 41 local votes backed limits · Nov 3"><R>1</R> · Data-center limits</Title>
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.75) 0%, transparent 28%)' }} />
        <div style={{ position: 'absolute', left: SAFE.l, top: 1010, opacity: ramp(f, r1 + 0.9, 0.3), background: 'rgba(8,8,10,.72)', padding: '16px 24px', borderRadius: 18, border: `1px solid ${C.red}55` }}>
          <div style={{ font: `800 84px/1 ${FONT}`, color: C.red }}>−9.3%</div>
          <div style={{ font: `600 28px ${BODY}`, color: '#eee' }}>NVIDIA on Nov 5 · worst day since DeepSeek</div>
        </div>
        <Source at={r1 + 0.4} top={1196}>Ballotpedia (uncertified) · CNBC · 24/7 Wall St</Source>
      </AbsoluteFill>
    );
  }
  if (t < r3) {
    const lt = t - r2;
    const a = (k) => ramp(f, r2 + 0.15 + k * 0.45, 0.5);
    const node = (x, y, label, c, k) => (
      <g transform={`translate(${x},${y}) scale(${0.7 + 0.3 * a(k)})`} opacity={a(k)}>
        <circle r="96" fill="#101418" stroke={c} strokeWidth="5" />
        <text textAnchor="middle" y="11" fontSize="31" fontWeight="800" fill="#F5F5F5" fontFamily="Inter">{label}</text>
      </g>
    );
    const arc = (d, k) => <path d={d} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - a(k + 0.6)} fill="none" stroke={C.red} strokeWidth="6" markerEnd={a(k + 0.6) > 0.95 ? 'url(#ah)' : undefined} />;
    const q = ramp(f, r2 + 1.9, 0.35);
    return (
      <AbsoluteFill>
        {blurBg('stills/scene05a_datacenter_red.png')}
        <Title at={r2 + 0.05} sub="NVIDIA invests in customers that buy its chips"><R>2</R> · The money loop</Title>
        <svg width="810" height="700" viewBox="0 0 810 700" style={{ position: 'absolute', left: SAFE.l, top: 480 }}>
          <defs><marker id="ah" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12z" fill={C.red} /></marker></defs>
          {arc('M490,140 Q690,240 640,440', 0)}
          {arc('M520,580 Q400,660 280,590', 1)}
          {arc('M150,440 Q100,250 290,140', 2)}
          <text x="660" y="250" fill="#F5F5F5" fontSize="27" fontWeight="700" fontFamily="Inter" opacity={a(0.6)}>invests $</text>
          <text x="330" y="680" fill="#F5F5F5" fontSize="27" fontWeight="700" fontFamily="Inter" opacity={a(1.6)}>buys chips</text>
          <text x="0" y="280" fill="#F5F5F5" fontSize="27" fontWeight="700" fontFamily="Inter" opacity={a(2.6)}>sales $</text>
          {node(390, 130, 'NVIDIA', C.green, 0)}{node(620, 540, 'AI start-ups', C.silver, 1)}{node(170, 540, 'Chip orders', C.gold, 2)}
          <text x="405" y="420" textAnchor="middle" fontSize="170" fontWeight="800" fill={C.red} fontFamily="Inter" opacity={q}>?</text>
        </svg>
        <Source at={r2 + 0.5} top={1196}>BofA est.: ~$70B stakes + ~$230B guarantees · CNBC, Aug 2026</Source>
      </AbsoluteFill>
    );
  }
  const lt = t - r3;
  const h = ramp(f, r3 + 0.6, 0.45);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1.08 - lt * 0.02})`, transformOrigin: '50% 45%' }}>
        <Img src={staticFile('stills/scene05c_boardroom.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <Vignette strength={0.5} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,.5) 22%, transparent 38%)' }} />
      <Title at={r3 + 0.05} sub="Nov 12, 2026 · amid a board investigation"><R>3</R> · CEO steps down</Title>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1010, opacity: h, transform: `translateY(${(1 - h) * 30}px)` }}>
        <div style={{ background: '#F5F5F5', color: '#101214', padding: '20px 26px', borderLeft: `10px solid ${C.red}` }}>
          <div style={{ font: `700 22px ${BODY}`, letterSpacing: 3, color: C.red }}>MARKETS · NOV 12, 2026</div>
          <div style={{ font: `800 38px/1.15 ${FONT}`, marginTop: 6 }}>Jensen Huang steps down as NVIDIA CEO; CFO Colette Kress named interim CEO</div>
        </div>
      </div>
      <Source at={r3 + 0.5} top={1214}>Reported by Bloomberg, CNBC, Nov 12, 2026</Source>
    </AbsoluteFill>
  );
};

// 7 · The final question: split-lit orbit (Blender shot07)
export const S7 = ({ start, end }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const q = TL.beats.question;
  const a = ramp(f, q, 0.6);
  return (
    <AbsoluteFill>
      <Seq dir="shot07" start={start} frameAt={(x) => Math.min(165, Math.max(1, Math.round(1 + x * 30)))} />
      <Vignette strength={0.35} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 470, textAlign: 'center', opacity: ramp(f, start + 0.2, 0.4) * (1 - a) }}>
        <div style={{ font: `600 30px ${BODY}`, color: '#ddd', letterSpacing: 3 }}>SALES ARE STILL GROWING</div>
        <div style={{ font: `800 92px/1.05 ${FONT}`, color: C.green }}>$96.2B</div>
        <div style={{ font: `600 30px ${BODY}`, color: '#ddd' }}>last reported quarter · +106% a year</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 236, textAlign: 'center' }}>
        {['AI BUBBLE', 'OR MARKET', 'PANIC?'].map((w, k) => {
          const b = ramp(f, q + k * 0.22, 0.5);
          return <div key={k} style={{ font: `800 104px/1.02 ${FONT}`, letterSpacing: -2, opacity: b, transform: `translateY(${(1 - b) * 24}px)`,
            color: k === 0 ? C.green : k === 2 ? C.red : C.white, textShadow: '0 6px 30px #000' }}>{w}</div>;
        })}
      </div>
      <Source at={start + 0.3} top={1196}>Q2 FY2027 revenue, reported Aug 26, 2026</Source>
      <Disclaimer />
    </AbsoluteFill>
  );
};

// 8 · InvisiTech branding, exactly 2 s
export const S8 = ({ start }) => {
  const f = useCurrentFrame();
  const a = ramp(f, start, 0.35), b = ramp(f, start + 0.2, 0.35), c = ramp(f, start + 0.45, 0.3);
  const out = 1 - ramp(f, start + 1.75, 0.25);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {blurBg('shot07/f_0165.png')}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: out, paddingRight: SAFE.r - SAFE.l, paddingBottom: 140 }}>
        <Img src={staticFile('logo.png')} style={{ width: 190, height: 190, borderRadius: '50%', opacity: a, transform: `scale(${0.7 + 0.3 * a})`,
          boxShadow: '0 0 0 14px rgba(118,185,0,.12), 0 0 60px rgba(118,185,0,.45)' }} />
        <div style={{ marginTop: 26, font: `800 104px/1 ${FONT}`, color: C.white, opacity: b }}>Invisi<span style={{ color: C.green }}>Tech</span></div>
        <div style={{ marginTop: 14, font: `600 46px ${BODY}`, color: '#eee', opacity: b }}>@TheInvisiTech</div>
        <div style={{ marginTop: 30, padding: '16px 56px', borderRadius: 50, background: C.red, font: `700 40px ${BODY}`, color: '#fff', opacity: c }}>Follow for more</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
