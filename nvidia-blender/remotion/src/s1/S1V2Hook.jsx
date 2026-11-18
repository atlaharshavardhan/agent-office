// S1 V2 · cinematic hook refinement (5.0 s · 150 f · 30 fps · 1080x1920). Free/local assets only.
// One continuous Kling take (1.50-4.70 s): Shot 1 full frame -> becomes the TOP panel of a diagonal split
// (Jensen on stage | Alice in her office, separate environments, no meeting depicted) -> panels part along
// the diagonal to reveal the redesigned Blender GPU (renders/s1_v2/gpu), which fills the frame and dives
// into the compute die. No map, no floating portraits, no circuit overlays.
import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, random, Easing } from 'remotion';
import { W, H, FONT, BODY, SAFE, clamp, lerp } from '../theme';
import { FontFace } from '../ui';
import { V } from '../alicev4/brand';
import { Grade, Shot2 as AliceScene } from './S1Final';
import VO from './s1f_vo.json';

const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const eio = (x) => Easing.inOut(Easing.cubic)(clamp(x));
const eout = (x) => Easing.out(Easing.cubic)(clamp(x));
const span = (f, a, b) => ease((f - a) / Math.max(1, b - a));
const pad = (n) => String(n).padStart(4, '0');
const GREEN = V.green;
const SPLIT_IN = [40, 54], SPLIT_OUT = [88, 100];
// diagonal divider (final position): from (0, YL) to (W, YR)
const YL = 1010, YR = 840;
const NMATTE = 53;

// ------------------------------------------------------------------ LED wall behind him: logo + wordmark + faint grid
const LedWall = ({ f }) => (
  <div style={{ position: 'absolute', left: -60, top: 90, width: 1200, height: 760, mixBlendMode: 'screen',
    WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, #000 40%, transparent 76%)', maskImage: 'radial-gradient(ellipse at 50% 45%, #000 40%, transparent 76%)' }}>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,38,22,.7), rgba(6,14,10,.4))' }} />
    <div style={{ position: 'absolute', inset: 0, opacity: 0.16, backgroundImage: 'linear-gradient(rgba(118,185,0,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(118,185,0,.5) 1px, transparent 1px)', backgroundSize: '48px 48px', backgroundPosition: `0 ${(f * 1.5) % 48}px` }} />
    <div style={{ position: 'absolute', left: 110, top: 120, width: 140, height: 110, background: GREEN, opacity: 0.85, WebkitMask: `url(${staticFile('alice/logos/nvidia.svg')}) center/contain no-repeat`, mask: `url(${staticFile('alice/logos/nvidia.svg')}) center/contain no-repeat`, filter: 'drop-shadow(0 0 16px rgba(118,185,0,.7))' }} />
    <div style={{ position: 'absolute', right: 96, top: 80, font: `900 80px ${FONT}`, letterSpacing: 5, color: 'rgba(235,245,225,.85)', textShadow: '0 0 26px rgba(118,185,0,.6)' }}>NVIDIA</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: (f * 9) % 760, height: 90, background: 'linear-gradient(180deg, transparent, rgba(190,255,120,.08), transparent)' }} />
  </div>
);

// ------------------------------------------------------------------ stage light beams (from the truss)
const StageBeam = ({ x, w, f, a0, amp, speed, ph, col, op }) => {
  const a = a0 + Math.sin((f + ph) / 30 * speed) * amp;
  return <div style={{ position: 'absolute', left: x - w / 2, top: -40, width: w, height: 1900, transformOrigin: '50% 0%', transform: `rotate(${a}deg)`,
    background: `linear-gradient(180deg, ${col} 0%, rgba(0,0,0,0) 78%)`, opacity: op, mixBlendMode: 'screen', filter: 'blur(16px)',
    clipPath: 'polygon(46% 0, 54% 0, 100% 100%, 0 100%)' }} />;
};
const BEAMS = [
  { x: 90, w: 300, a0: -14, amp: 9, speed: 1.3, ph: 0, col: 'rgba(118,185,0,.85)', op: 0.48 },
  { x: 300, w: 230, a0: 6, amp: 6, speed: 0.8, ph: 31, col: 'rgba(235,242,255,.7)', op: 0.36 },
  { x: 640, w: 240, a0: -4, amp: 8, speed: 1.1, ph: 57, col: 'rgba(235,242,255,.65)', op: 0.32 },
  { x: 760, w: 300, a0: 16, amp: 10, speed: 1.6, ph: 12, col: 'rgba(118,185,0,.8)', op: 0.45 },
  { x: 1000, w: 280, a0: 22, amp: 7, speed: 0.95, ph: 80, col: 'rgba(118,185,0,.7)', op: 0.4 },
];
const Beams = ({ f, k = 1 }) => <>{BEAMS.map((b, i) => <StageBeam key={i} {...b} op={b.op * k} f={f} />)}</>;

const Haze = ({ f, top, op }) => (
  <div style={{ position: 'absolute', left: -300, top, width: 1700, height: 900, opacity: op, mixBlendMode: 'screen', filter: 'blur(55px)',
    transform: `translateX(${Math.sin(f / 37) * 80 + f * 1.1}px)`,
    background: 'radial-gradient(ellipse at 30% 50%, rgba(175,200,230,.45), transparent 60%), radial-gradient(ellipse at 75% 40%, rgba(118,185,0,.28), transparent 55%)' }} />
);

// foreground audience: soft silhouettes close to camera (depth), independent sway + a few phone screens
const Audience = ({ f }) => {
  const heads = useMemo(() => [...Array(11)].map((_, k) => ({ x: -60 + k * 115 + random(`ax${k}`) * 50, y: 1700 + random(`ay${k}`) * 90, r: 95 + random(`ar${k}`) * 40, p: random(`ap${k}`) * 6 })), []);
  const phones = useMemo(() => [...Array(5)].map((_, k) => ({ x: 120 + random(`px${k}`) * 840, y: 1660 + random(`py${k}`) * 120, p: random(`pp${k}`) * 6 })), []);
  return (
    <AbsoluteFill style={{ filter: 'blur(14px)' }}>
      {heads.map((h, k) => (
        <div key={k} style={{ position: 'absolute', left: h.x + Math.sin(f / 23 + h.p) * 8, top: h.y + Math.sin(f / 17 + h.p) * 5, width: h.r * 2.2, height: h.r * 3.2,
          borderRadius: '48% 48% 40% 40%', background: 'radial-gradient(ellipse at 50% 0%, rgba(60,90,50,.6), #020304 55%)' }} />
      ))}
      {phones.map((p, k) => <div key={`p${k}`} style={{ position: 'absolute', left: p.x, top: p.y, width: 34, height: 54, borderRadius: 6, background: '#dfe9ff', opacity: 0.25 + 0.2 * Math.sin(f / 9 + p.p), boxShadow: '0 0 30px #b8d0ff' }} />)}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ Jensen layer (shot 1 -> top panel)
const Jensen = ({ f }) => {
  const i = Math.min(95, Math.max(0, f));
  const push = eio(f / 42);                                   // shot 1 push-in
  const toPanel = eio((f - SPLIT_IN[0]) / (SPLIT_IN[1] - SPLIT_IN[0]));
  const drift = clamp((f - SPLIT_IN[1]) / 40);
  const s = lerp(lerp(1.03, 1.17, push), 1.0, toPanel) + drift * 0.03;
  const tx = lerp(lerp(8, -30, push), -10, toPanel) - drift * 14, ty = lerp(lerp(0, 10, push), 36, toPanel);
  const cam = (d) => `translate(${tx * d}px, ${ty * d}px) scale(${1 + (s - 1) * d})`;
  const fg = staticFile(`s1v2/j/fg/${pad(Math.min(NMATTE - 1, i))}.png`);
  const useMatte = f < NMATTE;
  const flash = 1 - span(f, 0, 8);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: V.bg }}>
      <AbsoluteFill style={{ transform: cam(0.8), transformOrigin: '50% 30%' }}>
        <Img src={staticFile(`s1v2/j/plate/${pad(i + 1)}.jpg`)} style={{ position: 'absolute', inset: 0, width: W, height: H }} />
        <LedWall f={f} />
        {useMatte && <><Beams f={f} /><Haze f={f} top={220} op={0.3} /></>}
      </AbsoluteFill>
      {useMatte && (
        <AbsoluteFill style={{ transform: cam(1.0), transformOrigin: '50% 30%' }}>
          <Img src={fg} style={{ position: 'absolute', inset: 0, width: W, height: H }} />
          <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: `url(${fg})`, maskImage: `url(${fg})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', mixBlendMode: 'screen',
            background: `linear-gradient(${96 + Math.sin(f / 12) * 10}deg, transparent ${lerp(5, 45, push)}%, rgba(118,185,0,.34) ${lerp(14, 54, push)}%, transparent ${lerp(26, 66, push)}%)` }} />
          <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: `url(${fg})`, maskImage: `url(${fg})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', mixBlendMode: 'soft-light',
            background: 'linear-gradient(90deg, rgba(255,226,190,.4), transparent 55%, rgba(170,210,255,.3))' }} />
        </AbsoluteFill>
      )}
      {!useMatte && <AbsoluteFill style={{ transform: cam(0.8), transformOrigin: '50% 30%' }}><Beams f={f} k={0.45} /></AbsoluteFill>}
      {/* foreground audience (strongest parallax), fades as the frame becomes the top panel */}
      <AbsoluteFill style={{ transform: cam(1.35), transformOrigin: '50% 30%', opacity: 1 - toPanel }}><Audience f={f} /></AbsoluteFill>
      <Haze f={f + 40} top={1000} op={0.16 * (1 - toPanel)} />
      {/* frame-0 impact: stage strobe settling */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 45% 18%, rgba(210,255,160,.55), transparent 55%)', opacity: flash, mixBlendMode: 'screen' }} />
    </AbsoluteFill>
  );
};

const Shot1Type = ({ f }) => {
  const out = span(f, 38, 46);
  const a = eout(f / 10);
  return (
    <div style={{ position: 'absolute', left: SAFE.l, top: 1030, opacity: 1 - out, transform: `translateY(${-out * 30}px)` }}>
      <div style={{ font: `800 30px ${BODY}`, letterSpacing: lerp(16, 8, a), color: GREEN, marginBottom: 12, textShadow: '0 2px 12px #000' }}>JENSEN HUANG</div>
      <div style={{ font: `900 128px/0.95 ${FONT}`, letterSpacing: lerp(4, -3, a), color: V.text, textShadow: '0 10px 40px rgba(0,0,0,.95)', whiteSpace: 'nowrap', transform: `scale(${lerp(1.05, 1, a)})`, transformOrigin: '0 50%' }}>
        NVIDIA’S<br /><span style={{ color: GREEN }}>CEO</span>
      </div>
      <div style={{ font: `600 28px ${BODY}`, color: 'rgba(244,246,248,.86)', marginTop: 14, opacity: span(f, 6, 14), textShadow: '0 2px 10px #000' }}>Stepped down Nov 12, 2026</div>
    </div>
  );
};

// ------------------------------------------------------------------ split screen
const AliceType = ({ f }) => {
  const a = span(f, 50, 62), b = span(f, 56, 68), out = span(f, SPLIT_OUT[0], SPLIT_OUT[0] + 6);
  return (
    <div style={{ position: 'absolute', right: SAFE.r, top: 1075, textAlign: 'right', opacity: 1 - out }}>
      <div style={{ font: `700 21px ${BODY}`, letterSpacing: 5, color: 'rgba(244,246,248,.78)', opacity: a, marginBottom: 12 }}>FORMER MEGASPEED<br />EXECUTIVE</div>
      <div style={{ overflow: 'hidden', paddingBottom: 6 }}>
        <div style={{ font: `900 86px/0.95 ${FONT}`, letterSpacing: lerp(10, -2, a), color: V.text, textShadow: '0 8px 34px rgba(0,0,0,.95)', transform: `translateY(${(1 - a) * 110}%)` }}>ALICE<br />HUANG</div>
      </div>
      <div style={{ marginLeft: 'auto', width: lerp(0, 150, b), height: 3, background: GREEN, marginTop: 16 }} />
    </div>
  );
};

const Split = ({ f }) => {
  const inK = eio((f - SPLIT_IN[0]) / (SPLIT_IN[1] - SPLIT_IN[0]));
  const outK = eio((f - SPLIT_OUT[0]) / (SPLIT_OUT[1] - SPLIT_OUT[0]));
  const rise = (1 - inK) * 1150;                                  // bottom panel rises into place
  const part = outK * 1200;                                       // panels part along the diagonal normal
  const yl = YL + rise, yr = YR + rise;
  const blur = Math.sin(Math.PI * clamp((f - SPLIT_IN[0]) / 14)) * 6 + Math.sin(Math.PI * clamp((f - SPLIT_OUT[0]) / 12)) * 6;
  const clipBottom = `polygon(0 ${yl}px, ${W}px ${yr}px, ${W}px ${H + 400}px, 0 ${H + 400}px)`;
  const clipTop = `polygon(0 -400px, ${W}px -400px, ${W}px ${yr}px, 0 ${yl}px)`;
  const g = f - 45;                                               // Alice scene local frame
  return (
    <>
      {/* top panel: Jensen (same take continues) */}
      <AbsoluteFill style={{ clipPath: f >= SPLIT_IN[0] ? clipTop : 'none', transform: `translateY(${-part * 0.95}px)`, filter: `blur(${blur * 0.6}px)` }}>
        <Jensen f={f} />
        <div style={{ position: 'absolute', left: SAFE.l, top: YL - 150, opacity: span(f, 50, 60) * (1 - outK), font: `800 24px ${BODY}`, letterSpacing: 4, color: V.text, textShadow: '0 2px 10px #000' }}>
          JENSEN HUANG <span style={{ color: GREEN }}>· NVIDIA</span></div>
      </AbsoluteFill>
      {f >= SPLIT_IN[0] && (
        <AbsoluteFill style={{ clipPath: clipBottom, transform: `translateY(${part}px) perspective(1600px) rotateX(${(1 - inK) * 6}deg)`, transformOrigin: '50% 0%', filter: `blur(${blur}px)` }}>
          <AbsoluteFill style={{ transform: `translate(-80px, ${860 + (1 - inK) * -120}px)` }}><AliceScene f={g} /></AbsoluteFill>
          <AbsoluteFill style={{ background: `linear-gradient(${180 - 9}deg, rgba(0,0,0,.55) ${((yl + yr) / 2 - 30) / H * 100}%, transparent ${((yl + yr) / 2 + 90) / H * 100}%)` }} />
          <AliceType f={f} />
        </AbsoluteFill>
      )}
      {/* divider: thin light edge with soft glow + shadow (depth between the two environments) */}
      {f >= SPLIT_IN[0] && outK < 1 && (
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, transform: `translateY(${-part * 0.95}px)` }}>
          <defs><linearGradient id="dv" x1="0" x2="1"><stop offset="0" stopColor="#ffffff" stopOpacity=".2" /><stop offset=".5" stopColor="#e9f7d6" stopOpacity=".95" /><stop offset="1" stopColor={GREEN} stopOpacity=".5" /></linearGradient></defs>
          <line x1={0} y1={yl} x2={W} y2={yr} stroke="url(#dv)" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 8px rgba(190,255,140,.55)) drop-shadow(0 14px 18px rgba(0,0,0,.7))' }} />
          <line x1={0} y1={yl} x2={W * span(f, 46, 60)} y2={yl + (yr - yl) * span(f, 46, 60)} stroke="#ffffff" strokeWidth="1.5" opacity=".9" />
        </svg>
      )}
    </>
  );
};

// ------------------------------------------------------------------ Shot 3: GPU
const GpuShot = ({ f }) => {
  const g = f - 96;                                            // 0..53 (frames 88-95 hold the first frame)
  const gi = Math.min(53, Math.max(0, g));
  const pre = 1 - eio((f - 86) / 14);
  const t = span(g, 8, 18) * (1 - span(g, 40, 47));
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 62%, #121a22 0%, #07090c 62%)', overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(118,185,0,.10), transparent 50%)', opacity: 0.6 + 0.4 * span(g, 20, 53) }} />
      <AbsoluteFill style={{ transform: `scale(${1 + pre * 0.06}) translateY(${pre * 40}px)` }}>
        <Img src={staticFile(`s1v2/gpu/${pad(gi)}.png`)} style={{ width: W, height: H, filter: 'drop-shadow(0 50px 70px rgba(0,0,0,.8))' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(5,7,10,.85) 0%, rgba(5,7,10,.35) 26%, transparent 40%)', opacity: t }} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.l, top: 250, textAlign: 'center', opacity: t, transform: `translateY(${(1 - span(g, 8, 20)) * 26}px)` }}>
        <div style={{ font: `900 104px/0.98 ${FONT}`, letterSpacing: -2.5, color: V.text, textShadow: '0 10px 40px #000' }}>WHAT DID</div>
        <div style={{ font: `900 104px/0.98 ${FONT}`, letterSpacing: -2.5, color: GREEN, textShadow: '0 10px 40px #000' }}>NVIDIA KNOW?</div>
        <div style={{ font: `600 22px ${BODY}`, color: 'rgba(244,246,248,.75)', marginTop: 18, letterSpacing: 1 }}>Questions raised in Bloomberg and Reuters reporting</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, top: 1530, font: `600 20px ${BODY}`, color: 'rgba(244,246,248,.6)', opacity: span(g, 4, 10) * (1 - span(g, 42, 48)) }}>3D illustration of an AI accelerator</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ captions + disclosure
const Captions = ({ f }) => {
  const t = f / 30;
  const line = t < 2.2 ? VO.q1 : VO.q2;
  const s = line[0].s - 0.05, e = line[line.length - 1].e + 0.3;
  if (t < s || t > e) return null;
  const op = clamp((t - s) / 0.12) * clamp((e - t) / 0.15);
  return (
    <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.l, top: 1452, textAlign: 'center', opacity: op }}>
      <span style={{ font: `700 44px/1.2 ${BODY}`, padding: '6px 16px', borderRadius: 10, background: 'rgba(4,7,10,.6)', color: V.text }}>
        {line.map((w, k) => <span key={k} style={{ color: t >= w.s && t < w.e + 0.08 ? GREEN : V.text }}>{w.w}{k < line.length - 1 ? ' ' : ''}</span>)}
      </span>
    </div>
  );
};

export const S1V2Hook = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: V.bg }}>
      <FontFace />
      {f >= 86 && <GpuShot f={f} />}
      {f < 100 && <Split f={f} />}
      {f < 47 && <Shot1Type f={f} />}
      <Grade />
      <Captions f={f} />
      {f < 92 && <div style={{ position: 'absolute', left: SAFE.l, top: 1536, font: `600 20px ${BODY}`, color: 'rgba(244,246,248,.72)', textShadow: '0 1px 6px #000' }}>
        AI-generated illustration{f >= 50 ? 's · not a photo of Alice Huang' : ''}</div>}
      <Audio src={staticFile('s1f/s1f_mix.wav')} />
    </AbsoluteFill>
  );
};
