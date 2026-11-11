import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender,
  interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';

export const FPS = 30;
export const DURATION_S = 46.8;  // v4
const s = (sec) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

const C = {
  accent: '#f0a640',
  white: '#ffffff',
  muted: '#9aa4ad',
  chipBg: 'rgba(14,18,26,0.78)',
  chipLine: 'rgba(240,166,64,0.55)',
};

/* ---------- fonts (bundled locally) ---------- */
const fontHandle = delayRender('fonts');
Promise.all([
  ['Sora', 'fonts/sora-latin-700-normal.woff2', '700'],
  ['Sora', 'fonts/sora-latin-600-normal.woff2', '600'],
  ['Plex Mono', 'fonts/ibm-plex-mono-latin-500-normal.woff2', '500'],
].map(([family, file, weight]) => new FontFace(family, `url(${staticFile(file)})`, { weight }).load().then((f) => document.fonts.add(f))))
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));

/* ---------- narration (George, Kokoro bm_george) ---------- */
const VO = [['l1', 0.1], ['l2', 2.85], ['l3', 5.45], ['l4', 9.2], ['l5', 19.2], ['l6', 32.1], ['l7', 38.1], ['l8s', 42.35]];  // v4: one line over the open phone, then the sign-off  // l7 split so the close sound lands in a quiet gap

/* ---------- on-screen text: one continuous track, each entry replaces the previous one ----------
   *asterisks* = accent colour, '|' = line break */
const TEXT = [
  { at: 0, kind: 'price' },
  { at: 2.85, text: 'But glass *cracks* when you bend it' },
  { at: 4.7, kind: 'punch', text: 'So how?' },
  { at: 5.45, text: 'Let’s open it up' },
  { at: 6.75, text: 'Just *5.2 mm* thin', sub: 'open · 11.3 mm closed' },
  { at: 9.2, text: 'Trick 1: the screen is *~10 thin layers*' },
  { at: 13, text: 'They *slide* like paper, so nothing snaps' },
  { at: 19.2, text: 'Trick 2: a hinge of *100+ parts*', sub: 'cams · springs · 3D-printed titanium cover' },
  { at: 24.9, text: 'Closing, it *curls into a teardrop* instead of folding flat' },
  { at: 32.1, text: 'Bend the same spot *again and again*' },
  { at: 35, text: '…and you get *the crease* you can feel' },
  { at: 38.2, text: 'It doesn’t fold like paper.|It *rolls like a poster.*', size: 62 },
];
const SWAP = 7; // frames for the slide-up swap

/* ---------- transitions ---------- */
const SWEEPS = [9.12, 19.12];                // light sweep on the "trick" reveals
const PUNCHES = [11.28, 20.48];              // zoom punch when the counters land

/* ---------- sound design (seconds, volume) — public/sfx2, synthesised by sfx/make_sound.py ---------- */
const SFX = [   // no hard whooshes: soft 'glide' swells on the camera moves, plus hits, clicks and tones
  ['impact.wav', 0, 0.55], ['shimmer.wav', 0.05, 0.35],      // cold open on the price
  ['open.wav', 3.98, 0.75],                                     // magnetic release as it opens
  ['chime.wav', 4.85, 0.4],                                     // screen lands flat
  ['impact.wav', 4.7, 0.5],                                     // "So how?"
  ['impact-small.wav', 11.28, 0.5],                             // counter lands on 10
  ['ratchet.wav', 19.55, 0.5], ['impact-small.wav', 20.48, 0.45], // hinge clicks as 100+ counts up
  ['glide.wav', 2.15, 0.45],                                    // turns to face you
  ['glide-up.wav', 5, 0.4],                                   // opens up into the parts
  ['glide.wav', 8.95, 0.4],                                     // into the screen layers
  ['glide-low.wav', 13.3, 0.35],                                // layers bend
  ['glide.wav', 18.95, 0.4],                                    // into the hinge
  ['glide-low.wav', 24.4, 0.35],                                // down into the V
  ['glide.wav', 31.7, 0.35],                                    // the crease
  ['glide.wav', 37.9, 0.3],                                     // turns to face you, wide open
  ['shimmer.wav', 42.35, 0.4], ['impact-small.wav', 42.4, 0.4], // channel card, after the close
  ['tap.wav', 43.9, 0.6], ['pluck7.wav', 44.35, 0.5], ['pluck9.wav', 44.8, 0.45], ['chime.wav', 45.25, 0.3],  // like · heart · comment · subscribe
  ['glide.wav', 45.75, 0.25],                                    // glides back to the opening shot (loop)
  ['glide-up.wav', 25.15, 0.35], ['shimmer.wav', 25.35, 0.4],  // A20 sends blue power waves through the Duo
  ['close.wav', 41.95, 1.0],                                    // the close, in the clear — then the channel card
];
// a soft rising pluck as each numbered label appears (exploded phone, then the 10 screen layers)
const PART_PLUCKS = Array.from({ length: 8 }, (_, i) => [7.27 + i * 0.1, i]);
const LAYER_PLUCKS = Array.from({ length: 10 }, (_, i) => [10.12 + i * 0.13, i]);
const VO_LEN = { l1: 2.347, l2: 2.432, l3: 3.392, l4: 8.469, l5: 10.773, l6: 5.76, l7: 3.179, l8s: 3.52, };
// music: louder in the gaps, tucked under George
const musicVolume = (f) => {
  const t = f / FPS;
  const talking = VO.some(([k, at]) => t > at - 0.15 && t < at + VO_LEN[k] + 0.1);
  const near = VO.reduce((m, [k, at]) => Math.min(m, Math.abs(t - (at - 0.15)), Math.abs(t - (at + VO_LEN[k] + 0.1))), 9);
  if (t > 41.5 && t < 42.3) return interpolate(t, [41.5, 41.75, 42.1, 42.3], [0.16, 0.0, 0.0, 0.16], clamp);  // near-silence so the close is heard clearly
  const base = talking ? 0.16 : 0.34;
  const other = talking ? 0.34 : 0.16;
  return near < 0.2 ? base + (other - base) * (1 - near / 0.2) * 0.5 : base;
};

/* ---------- helpers ---------- */
const parseWords = (text) => {
  let i = 0, inside = false;
  return text.split('|').map((line) => line.split(' ').map((raw) => {
    if (raw.startsWith('*')) inside = true;
    const w = { word: raw.replace(/\*/g, ''), accent: inside, idx: i++ };
    if (raw.replace(/[.,!?…]+$/, '').endsWith('*')) inside = false;
    return w;
  }));
};

const PriceBlock = ({ local }) => {
  const n = Math.round(interpolate(local, [0, 14], [250000, 299900], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }));
  const pop = spring({ frame: local - 12, fps: FPS, config: { damping: 9, stiffness: 220 } });
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 132, letterSpacing: '-0.04em', color: C.accent, transform: `scale(${1 + 0.06 * (pop - Math.min(pop, 1))})`, textShadow: '0 8px 40px rgba(240,166,64,0.35)', fontVariantNumeric: 'tabular-nums' }}>
        {'₹' + n.toLocaleString('en-IN')}
      </div>
      <div style={{ marginTop: 0, fontFamily: 'Sora', fontWeight: 700, fontSize: 62, color: C.white, letterSpacing: '-0.02em' }}>
        This iPhone <span style={{ color: C.accent }}>folds in half</span>
      </div>
    </div>
  );
};

const LineBlock = ({ entry, local }) => {
  const lines = parseWords(entry.text);
  const n = lines.flat().length;
  const step = Math.min(2, 12 / Math.max(n, 1)); // whole line in ≤ 0.4 s
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: entry.size || 76, lineHeight: 1.12, letterSpacing: '-0.02em', textShadow: '0 6px 30px rgba(0,0,0,0.7)' }}>
        {lines.map((ws, li) => (
          <div key={li}>
            {ws.map((w) => {
              const p = spring({ frame: local - w.idx * step, fps: FPS, config: { damping: 15, stiffness: 240, mass: 0.5 } });
              return <span key={w.idx} style={{ display: 'inline-block', marginRight: '0.26em', color: w.accent ? C.accent : C.white, opacity: Math.min(p, 1), transform: `translateY(${(1 - p) * 22}px)` }}>{w.word}</span>;
            })}
          </div>
        ))}
      </div>
      {entry.sub ? <div style={{ marginTop: 22, fontFamily: 'Plex Mono', fontWeight: 500, fontSize: 27, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, whiteSpace: 'nowrap', opacity: interpolate(local, [6, 14], [0, 1], clamp) }}>{entry.sub}</div> : null}
    </div>
  );
};

const PunchBlock = ({ entry, local }) => {
  const p = spring({ frame: local, fps: FPS, config: { damping: 8, stiffness: 260, mass: 0.7 } });
  return <div style={{ textAlign: 'center', fontFamily: 'Sora', fontWeight: 700, fontSize: 170, color: C.accent, letterSpacing: '-0.04em', transform: `scale(${0.5 + 0.5 * p})`, textShadow: '0 10px 50px rgba(240,166,64,0.4)' }}>{entry.text}</div>;
};

const Block = ({ entry, local }) => entry.kind === 'price' ? <PriceBlock local={local} /> : entry.kind === 'punch' ? <PunchBlock entry={entry} local={local} /> : <LineBlock entry={entry} local={local} />;

/* the text track: never empty — the outgoing line slides up while the next slides in */
const TextTrack = () => {
  const frame = useCurrentFrame();
  let cur = 0;
  TEXT.forEach((e, i) => { if (frame >= s(e.at)) cur = i; });
  const local = frame - s(TEXT[cur].at);
  const prev = cur > 0 && local < SWAP ? cur - 1 : -1;
  const p = interpolate(local, [0, SWAP], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const wrap = (children, style) => <div style={{ position: 'absolute', top: 232, left: 60, right: 60, ...style }}>{children}</div>;
  return (
    <AbsoluteFill>
      {prev >= 0 ? wrap(<Block entry={TEXT[prev]} local={frame - s(TEXT[prev].at)} />, { opacity: 1 - p, transform: `translateY(${-70 * p}px)` }) : null}
      {wrap(<Block entry={TEXT[cur]} local={local} />, cur > 0 ? { opacity: p, transform: `translateY(${50 * (1 - p)}px)` } : {})}
    </AbsoluteFill>
  );
};

const Chip = ({ label, value, durationInFrames, bumpAt, top = 1372 }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame, fps: FPS, config: { damping: 15, stiffness: 180 } });
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp);
  const bump = bumpAt != null ? interpolate(frame - bumpAt, [0, 3, 9], [0, 1, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{ top, height: 'auto', alignItems: 'center' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 18, padding: '18px 34px', borderRadius: 999,
        background: C.chipBg, border: `2px solid ${C.chipLine}`,
        transform: `translateY(${(1 - p) * 40}px) scale(${1 + 0.08 * bump})`, opacity: Math.min(p, 1) * out,
        boxShadow: `0 0 ${40 * bump}px rgba(240,166,64,${0.55 * bump})`,
      }}>
        <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 64, color: C.accent, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        <span style={{ fontFamily: 'Plex Mono', fontWeight: 500, fontSize: 30, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.white }}>{label}</span>
      </div>
    </AbsoluteFill>
  );
};

const CountChip = ({ label, to, suffix = '', countFrames, durationInFrames }) => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [4, 4 + countFrames], [1, to], clamp));
  const done = frame >= 4 + countFrames;
  return <Chip label={label} value={String(n).padStart(2, '0') + (done ? suffix : '')} durationInFrames={durationInFrames} bumpAt={4 + countFrames} />;
};

/* light sweep: a thin amber streak crossing the frame in ~0.3 s */
const LightSweep = ({ at }) => {
  const frame = useCurrentFrame();
  const t = (frame - s(at)) / s(0.32);
  if (t < 0 || t > 1) return null;
  const x = interpolate(t, [0, 1], [-60, 160]);
  const a = Math.sin(t * Math.PI);
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: '-20%', bottom: '-20%', left: `${x}%`, width: 70, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, rgba(240,166,64,0) 0%, rgba(255,196,110,0.9) 50%, rgba(240,166,64,0) 100%)', filter: 'blur(6px)', opacity: a }} />
      <div style={{ position: 'absolute', top: '-20%', bottom: '-20%', left: `${x - 6}%`, width: 260, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, rgba(240,166,64,0) 0%, rgba(240,166,64,0.22) 50%, rgba(240,166,64,0) 100%)', filter: 'blur(18px)', opacity: a }} />
    </AbsoluteFill>
  );
};

/* Trick 1: the 10-layer screen model (separate render), cross-faded over the phone footage */
const LAYERS_AT = 9.2, LAYERS_DUR = 10;
const LayersShot = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 8, s(LAYERS_DUR) - 8, s(LAYERS_DUR)], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{ opacity: a }}><OffthreadVideo src={staticFile('duo-layers-3d.mp4')} muted /></AbsoluteFill>;
};

/* the 3D footage, with a quick 5% zoom punch when the numbers land */
const Footage = () => {
  const frame = useCurrentFrame();
  const bump = PUNCHES.reduce((m, t) => Math.max(m, interpolate(frame - s(t), [0, 3, 10], [0, 1, 0], clamp)), 0);
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + 0.05 * bump})` }}>
      <OffthreadVideo src={staticFile('duo-short-3d-v4.mp4')} muted />
      <Sequence from={s(LAYERS_AT)} durationInFrames={s(LAYERS_DUR)}><LayersShot /></Sequence>
    </AbsoluteFill>
  );
};

const Chrome = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <AbsoluteFill style={{ background: 'linear-gradient(rgb(3,6,15) 0%, rgba(3,6,15,0.85) 17%, rgba(3,6,15,0) 34%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, height: 7, width: `${(frame / durationInFrames) * 100}%`, background: C.accent }} />
    </>
  );
};

/* ---------- the reel ---------- */
/* 40–45 s: channel end card over the 3D hero shot — InvisiTech wordmark, handle, like · heart · comment */
const END_AT = 42.3, END_OUT = 45.85;
const Thumb = ({ fill }) => (
  <svg width="104" height="104" viewBox="0 0 24 24"><path d="M7 10v11H3V10h4zm2 11h9.2a2 2 0 0 0 2-1.6l1.3-6.6A2 2 0 0 0 19.5 10H14l.9-4.3a1.6 1.6 0 0 0-2.9-1.2L9 9.6V21z" fill={fill} /></svg>
);
const Heart = ({ fill, stroke }) => (
  <svg width="104" height="104" viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" /></svg>
);
const Bubble = ({ stroke }) => (
  <svg width="104" height="104" viewBox="0 0 24 24"><path d="M12 3.5c4.9 0 8.5 3.4 8.5 7.8s-3.6 7.8-8.5 7.8c-1.2 0-2.3-.2-3.3-.5L4 20.5l1.3-4.1A7.4 7.4 0 0 1 3.5 11.3C3.5 6.9 7.1 3.5 12 3.5z" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" /></svg>
);
/* wordmark reveal: letters rise out of a soft blur one by one, tracking tightens, then a light sweep crosses it */
const Wordmark = ({ frame }) => {
  const letters = 'InvisiTech'.split('');
  const track = interpolate(frame, [4, 30], [0.14, -0.03], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const sweep = interpolate(frame, [26, 46], [-30, 130], clamp);
  return (
    <div style={{ position: 'relative', display: 'flex', fontFamily: 'Sora', fontWeight: 700, fontSize: 112, lineHeight: 1, letterSpacing: `${track}em`, textShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
      {letters.map((ch, i) => {
        const p = interpolate(frame, [4 + i * 1.6, 16 + i * 1.6], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
        return <span key={i} style={{ color: i < 6 ? C.white : '#5bc8e0', opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 26}px)`, display: 'inline-block' }}>{ch}</span>;
      })}
      <div style={{ position: 'absolute', inset: '-10px -20px', pointerEvents: 'none', mixBlendMode: 'overlay',
        background: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep - 12}%, rgba(255,255,255,0.85) ${sweep}%, rgba(255,255,255,0) ${sweep + 12}%)` }} />
    </div>
  );
};

const Subscribe = ({ frame, at }) => {
  const p = spring({ frame: frame - 34, fps: FPS, config: { damping: 13, stiffness: 190 } });
  const press = interpolate(frame - at, [0, 3, 8, 13], [1, 0.9, 1.06, 1], clamp);
  const done = frame >= at + 3;
  return (
    <div style={{ marginTop: 26, transform: `translateY(${(1 - Math.min(1, p)) * 40}px) scale(${press})`, opacity: Math.min(1, p),
      padding: '10px 34px', borderRadius: 999, background: done ? 'rgba(255,255,255,0.14)' : '#ff2d2d', border: done ? '2px solid rgba(255,255,255,0.35)' : '2px solid #ff2d2d',
      fontFamily: 'Sora', fontWeight: 700, fontSize: 32, color: '#fff', letterSpacing: '0.02em' }}>{done ? '✓ Subscribed' : 'Subscribe'}</div>
  );
};

const EndCard = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [s(END_OUT - END_AT) - 9, s(END_OUT - END_AT)], [1, 0], clamp);
  const sp = (d, cfg = { damping: 14, stiffness: 170 }) => spring({ frame: frame - d, fps: FPS, config: cfg });
  const shade = interpolate(frame, [0, 12], [0, 1], clamp);
  const handle = sp(22), follow = sp(28);
  const icon = (d) => sp(d + 8, { damping: 11, stiffness: 200 });
  const tapAt = s(1.6), heartAt = s(2.05), cmtAt = s(2.5), subAt = s(2.95);
  const press = interpolate(frame - tapAt, [0, 3, 7, 12], [1, 0.82, 1.12, 1], clamp);
  const liked = frame >= tapAt + 3;
  const hp = interpolate(frame - heartAt, [0, 4, 10], [1, 1.3, 1], clamp);
  const filled = frame >= heartAt + 2;
  const cp = interpolate(frame - cmtAt, [0, 4, 10], [1, 1.22, 1], clamp);
  const ring = (at) => { const u = (frame - at) / 14; return u > 0 && u < 1 ? <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: `4px solid rgba(91,200,224,${0.7 * (1 - u)})`, transform: `scale(${0.8 + 0.35 * u})` }} /> : null; };
  const slot = (child, i, scale, at) => (
    <div style={{ position: 'relative', transform: `translateY(${(1 - icon(26 + i * 4)) * 50}px) scale(${Math.min(1, icon(26 + i * 4)) * scale})`, opacity: Math.min(1, icon(26 + i * 4)) }}>{ring(at)}{child}</div>
  );
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ opacity: shade, background: 'linear-gradient(rgba(0,0,0,0) 50%, rgba(3,6,14,0.7) 58%, rgba(3,6,14,0.9) 100%)' }} />
      <div style={{ position: 'absolute', top: 1066, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>  {/* phone sits in 450–1050, card text in 1060–1450 */}
        <Wordmark frame={frame} />
        <div style={{ marginTop: 14, fontFamily: 'Sora', fontWeight: 700, fontSize: 54, color: C.white, opacity: Math.min(1, handle), transform: `translateY(${(1 - handle) * 30}px)` }}>@TheInvisiTech</div>
        <div style={{ marginTop: 12, fontFamily: 'Sora', fontWeight: 600, fontSize: 34, color: C.accent, opacity: Math.min(1, follow), transform: `translateY(${(1 - follow) * 30}px)` }}>Like · follow · comment</div>
        <div style={{ marginTop: 16, display: 'flex', gap: 110, alignItems: 'center', zoom: 0.7 }}>  {/* zoom (not transform) so the row's real height is used for spacing */}
          {slot(<Thumb fill={liked ? '#5bc8e0' : '#ffffff'} />, 0, press, tapAt)}
          {slot(<Heart fill={filled ? '#ff3b5c' : 'none'} stroke={filled ? '#ff3b5c' : '#ffffff'} />, 1, hp, heartAt)}
          {slot(<Bubble stroke="#ffffff" />, 2, cp, cmtAt)}
        </div>
        <Subscribe frame={frame} at={subAt} />
      </div>
    </AbsoluteFill>
  );
};

/* watermark: right side, just above centre (clear of the like/comment column), softly blended into the scene */
/* small legal line for the first seconds: this is our own 3D illustration */
const Disclaimer = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 6, s(3.2), s(3.6)], [0, 1, 1, 0], clamp);
  return a > 0 ? <div style={{ position: 'absolute', left: 0, right: 0, top: 1452, textAlign: 'center', fontFamily: 'Plex Mono', fontWeight: 500, fontSize: 24, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.55)', opacity: a }}>3D ILLUSTRATION · NOT AFFILIATED WITH APPLE</div> : null;
};

const Watermark = () => {
  const t = useCurrentFrame() / FPS;
  const k = interpolate(t, [42.0, 42.3, 45.8, 46.1], [1, 0, 0, 1], clamp);  // steps aside while the channel card is up
  return (
  <Img src={staticFile('watermark-clear.png')} style={{ position: 'absolute', right: 34, top: 860, height: 50, opacity: 0.42 * k, mixBlendMode: 'screen', filter: 'saturate(0.85)' }} />
  );
};

export const ReelV4 = ({ bg } = {}) => (
  <AbsoluteFill style={{ background: '#000' }}>
    {bg ? <Img src={staticFile(bg)} style={{ width: 1080, height: 1920 }} /> : <Footage />}  {/* bg: storyboard still instead of the video */}
    {SWEEPS.map((t) => <LightSweep key={t} at={t} />)}
    <Chrome />
    <Sequence durationInFrames={s(END_AT + 0.3)}><TextTrack /></Sequence>

    <Sequence from={s(9.95)} durationInFrames={s(8.9)}><CountChip to={10} label="ultrathin layers" countFrames={s(1.2)} durationInFrames={s(8.9)} /></Sequence>
    <Sequence from={s(19.45)} durationInFrames={s(5.2)}><CountChip to={100} suffix="+" label="hinge parts" countFrames={s(0.9)} durationInFrames={s(5.2)} /></Sequence>
    <Sequence from={s(END_AT)} durationInFrames={s(END_OUT - END_AT)}><EndCard /></Sequence>
    <Watermark />
    <Disclaimer />

    {/* narration */}
    {VO.map(([f, t]) => <Sequence key={f} from={s(t)}><Audio src={staticFile(`vo/${f}.wav`)} volume={1} /></Sequence>)}
    {/* music bed (sfx/make_sound.py), ducked under the voice */}
    <Audio src={staticFile('sfx2/music-v4.wav')} volume={musicVolume} />
    {SFX.map(([f, t, v], k) => <Sequence key={'sfx' + k} from={s(t)}><Audio src={staticFile('sfx2/' + f)} volume={v} /></Sequence>)}
    {PART_PLUCKS.map(([t, i]) => <Sequence key={'pp' + i} from={s(t)}><Audio src={staticFile(`sfx2/pluck${i}.wav`)} volume={0.34} /></Sequence>)}
    {LAYER_PLUCKS.map(([t, i]) => <Sequence key={'lp' + i} from={s(t)}><Audio src={staticFile(`sfx2/pluck${i}.wav`)} volume={0.32} /></Sequence>)}
  </AbsoluteFill>
);
