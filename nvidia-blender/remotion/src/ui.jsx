// Shared on-screen elements. All text stays inside the safe margins (SAFE in theme.js).
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, BODY, SAFE, TL, sec, ramp, clamp } from './theme';

export const FontFace = () => (
  <style>{`@font-face { font-family: 'Inter Display'; src: url(${staticFile('InterDisplay-Bold.otf')}); font-weight: 800; }`}</style>
);

// Title block in the 220-450 px band. `at` = absolute seconds when it appears.
export const Title = ({ at, children, sub, size = 92, color = C.white }) => {
  const f = useCurrentFrame();
  const a = ramp(f, at, 0.45), b = ramp(f, at + 0.18, 0.45);
  return (
    <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 226, textAlign: 'center' }}>
      <div style={{ font: `800 ${size}px/1.02 ${FONT}`, letterSpacing: -2, color, opacity: a,
        transform: `translateY(${(1 - a) * 36}px) scale(${0.95 + 0.05 * a})`, textShadow: '0 6px 30px rgba(0,0,0,.75)' }}>{children}</div>
      {sub && <div style={{ marginTop: 16, font: `600 34px ${BODY}`, color: 'rgba(245,245,245,.82)', opacity: b,
        textShadow: '0 3px 14px #000' }}>{sub}</div>}
    </div>
  );
};

export const R = ({ children }) => <span style={{ color: C.red }}>{children}</span>;
export const G = ({ children }) => <span style={{ color: C.green }}>{children}</span>;

// Sentence captions in the 1250-1450 px band (left 90 / right 180 margins)
export const Captions = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const S = TL.sentences;
  const i = S.findIndex((s, k) => t >= s.t0 - 0.05 && t < (S[k + 1] ? S[k + 1].t0 - 0.05 : s.t1 + 0.6));
  if (i < 0 || t >= TL.scenes[7]) return null;            // the outro card carries its own text
  const s = S[i];
  const a = ramp(f, s.t0 - 0.05, 0.12);
  const out = 1 - clamp((t - (s.t1 + 0.35)) / 0.2);
  const parts = s.cap.split(/\*\*(.+?)\*\*/g);
  const hl = (txt) => /\$|%|trillion|Meta|lost|down|panic|shocks|limits|funding|stepped/i.test(txt) ? C.red : C.green;
  return (
    <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1262, height: 180, display: 'flex',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ font: `700 50px/1.18 ${BODY}`, color: C.white, opacity: a * out, transform: `translateY(${(1 - a) * 10}px)`,
        textShadow: '0 0 6px #000, 0 3px 12px #000, 0 0 2px #000' }}>
        {parts.map((p, k) => (k % 2 ? <span key={k} style={{ color: hl(p) }}>{p}</span> : <span key={k}>{p}</span>))}
      </div>
    </div>
  );
};

export const Watermark = () => {
  const f = useCurrentFrame();
  if (f >= sec(TL.scenes[7])) return null;                // hidden on the end card (rule 22)
  return (
    <div style={{ position: 'absolute', right: 22, top: 960, transform: 'translateY(-50%)', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: 10, opacity: 0.78 }}>
      <Img src={staticFile('logo.png')} style={{ width: 52, height: 52, borderRadius: '50%' }} />
      <span style={{ writingMode: 'vertical-rl', font: `700 22px ${BODY}`, color: 'rgba(245,245,245,.85)', textShadow: '0 1px 6px #000' }}>@TheInvisiTech</span>
    </div>
  );
};

export const Source = ({ at, children, top = 1196 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: SAFE.l, top, font: `600 23px ${BODY}`, color: 'rgba(245,245,245,.72)',
      background: 'rgba(0,0,0,.55)', padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.14)',
      opacity: ramp(f, at, 0.4), maxWidth: 1080 - SAFE.l - SAFE.r }}>{children}</div>
  );
};

export const Disclaimer = () => (
  <div style={{ position: 'absolute', left: SAFE.l, top: 1530, font: `500 21px ${BODY}`, color: 'rgba(245,245,245,.5)' }}>
    3D illustration · not affiliated with NVIDIA
  </div>
);

// Image sequence with a time remap: frameAt(localSeconds) -> source frame number
export const Seq = ({ dir, frameAt, digits = 4, scale = 1, origin = '50% 50%', filter, start, dy = 0 }) => {
  const f = useCurrentFrame();
  const lt = f / 30 - start;
  const n = frameAt(lt);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img src={staticFile(`${dir}/f_${String(n).padStart(digits, '0')}.png`)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `translateY(${-dy}px) scale(${scale})`, transformOrigin: origin, filter }} />
      {dy > 0 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: dy + 240, background: 'linear-gradient(transparent, #101214 240px)' }} />}
    </AbsoluteFill>
  );
};

export const Vignette = ({ strength = 0.6 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, transparent 42%, rgba(0,0,0,${strength}))` }} />
);

export const Flash = ({ at, color = '#fff', dur = 0.25, max = 0.6 }) => {
  const f = useCurrentFrame();
  const t = f / 30 - at;
  if (t < 0 || t > dur) return null;
  return <AbsoluteFill style={{ background: color, opacity: max * (1 - t / dur) }} />;
};
