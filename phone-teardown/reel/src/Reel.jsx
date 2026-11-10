import {
  AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender,
  interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';

export const FPS = 30;
export const DURATION_S = 40;
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
const VO = [['l1', 0.1], ['l2', 2.85], ['l3', 5.45], ['l4', 9.2], ['l5', 19.2], ['l6', 30.3], ['l7', 36.4]];

/* ---------- on-screen text: one continuous track, each entry replaces the previous one ----------
   *asterisks* = accent colour, '|' = line break */
const TEXT = [
  { at: 0.0, kind: 'price' },
  { at: 2.85, text: 'But glass *cracks* when you bend it' },
  { at: 4.7, kind: 'punch', text: 'So how?' },
  { at: 5.45, text: 'Let’s open it up' },
  { at: 6.75, text: 'Just *5.2 mm* thin' },
  { at: 9.2, text: 'Trick 1: the screen is *~10 thin layers*' },
  { at: 13.0, text: 'They *slide* like paper, so nothing snaps' },
  { at: 19.2, text: 'Trick 2: a hinge of *100+ parts*', sub: 'gears · springs · 3D-printed titanium cover' },
  { at: 24.9, text: 'Closing, it *curls into a teardrop* instead of folding flat' },
  { at: 30.3, text: 'Bend the same spot *again and again*' },
  { at: 33.2, text: '…and you get *the crease* you can feel' },
  { at: 36.4, text: 'It doesn’t fold like paper.|It *rolls like a poster.*' },
];
const SWAP = 7; // frames for the slide-up swap

/* ---------- transitions ---------- */
const SWEEPS = [9.12, 19.12];                // light sweep on the "trick" reveals
const PUNCHES = [11.28, 20.48];              // zoom punch when the counters land

/* ---------- sound design (seconds, volume) — kept under the narration ---------- */
const SFX = [
  ['hit.wav', 0.02, 0.7],
  ['whoosh.wav', 1.9, 0.4],           // starts opening
  ['riser.wav', 3.3, 0.35],
  ['hit.wav', 4.7, 0.55],             // "So how?"
  ['whoosh.wav', 5.15, 0.4],          // explode
  ['whoosh-short.wav', 9.08, 0.45],   // sweep → screen layers
  ['whoosh-short.wav', 19.08, 0.45],  // sweep → hinge
  ['whoosh.wav', 24.6, 0.35],         // pull back as it closes
  ['whoosh-short.wav', 30.1, 0.3],
  ['whoosh.wav', 36.1, 0.4],          // fold shut
  ['snap.wav', 38.55, 0.6],           // halves meet
  ...PUNCHES.map((t) => ['snap.wav', t, 0.45]),
];
const POPS = TEXT.filter((x) => !x.kind).map((x) => x.at);
const LAYER_TICKS = Array.from({ length: 10 }, (_, i) => 9.62 + i * 0.16);
const PART_TICKS = Array.from({ length: 8 }, (_, i) => 19.55 + i * 0.11);

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
  const n = Math.round(interpolate(local, [2, 14], [0, 299900], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }));
  const pop = spring({ frame: local - 12, fps: FPS, config: { damping: 9, stiffness: 220 } });
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 158, letterSpacing: '-0.04em', color: C.accent, transform: `scale(${1 + 0.06 * (pop - Math.min(pop, 1))})`, textShadow: '0 8px 40px rgba(240,166,64,0.35)', fontVariantNumeric: 'tabular-nums' }}>
        {'₹' + n.toLocaleString('en-IN')}
      </div>
      <div style={{ marginTop: 6, fontFamily: 'Sora', fontWeight: 700, fontSize: 72, color: C.white, letterSpacing: '-0.02em' }}>
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
      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 76, lineHeight: 1.12, letterSpacing: '-0.02em', textShadow: '0 6px 30px rgba(0,0,0,0.7)' }}>
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
  const wrap = (children, style) => <div style={{ position: 'absolute', top: 175, left: 60, right: 60, ...style }}>{children}</div>;
  return (
    <AbsoluteFill>
      {prev >= 0 ? wrap(<Block entry={TEXT[prev]} local={frame - s(TEXT[prev].at)} />, { opacity: 1 - p, transform: `translateY(${-70 * p}px)` }) : null}
      {wrap(<Block entry={TEXT[cur]} local={local} />, cur > 0 ? { opacity: p, transform: `translateY(${50 * (1 - p)}px)` } : {})}
    </AbsoluteFill>
  );
};

const Chip = ({ label, value, durationInFrames, bumpAt, top = 1395 }) => {
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
      <OffthreadVideo src={staticFile('duo-short-3d.mp4')} muted />
      <Sequence from={s(LAYERS_AT)} durationInFrames={s(LAYERS_DUR)}><LayersShot /></Sequence>
    </AbsoluteFill>
  );
};

const Chrome = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <AbsoluteFill style={{ background: 'linear-gradient(#000 0%, rgba(0,0,0,0.88) 17%, rgba(0,0,0,0) 34%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, height: 7, width: `${(frame / durationInFrames) * 100}%`, background: C.accent }} />
      <div style={{ position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', fontFamily: 'Plex Mono', fontWeight: 500, fontSize: 26, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.55)' }}>INVISITECH · TEARDOWN</div>
    </>
  );
};

/* ---------- the reel ---------- */
export const Reel = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Footage />
    {SWEEPS.map((t) => <LightSweep key={t} at={t} />)}
    <Chrome />
    <TextTrack />

    <Sequence from={s(6.85)} durationInFrames={s(2.2)}><Chip value="5.2 mm" label="open · 11.3 mm closed" durationInFrames={s(2.2)} top={330} /></Sequence>
    <Sequence from={s(9.55)} durationInFrames={s(9.3)}><CountChip to={10} label="ultrathin layers" countFrames={s(1.6)} durationInFrames={s(9.3)} /></Sequence>
    <Sequence from={s(19.45)} durationInFrames={s(5.2)}><CountChip to={100} suffix="+" label="hinge parts" countFrames={s(0.9)} durationInFrames={s(5.2)} /></Sequence>

    {/* narration */}
    {VO.map(([f, t]) => <Sequence key={f} from={s(t)}><Audio src={staticFile(`vo/${f}.wav`)} volume={1} /></Sequence>)}
    {/* music bed, ducked under the voice */}
    <Audio src={staticFile('sfx/bed.wav')} volume={0.28} />
    {SFX.map(([f, t, v], k) => <Sequence key={'sfx' + k} from={s(t)}><Audio src={staticFile('sfx/' + f)} volume={v} /></Sequence>)}
    {POPS.map((t, k) => <Sequence key={'pop' + k} from={s(t)}><Audio src={staticFile('sfx/pop.wav')} volume={0.22} /></Sequence>)}
    {LAYER_TICKS.map((t, k) => <Sequence key={'lt' + k} from={s(t)}><Audio src={staticFile('sfx/tick.wav')} volume={0.3} /></Sequence>)}
    {PART_TICKS.map((t, k) => <Sequence key={'pt' + k} from={s(t)}><Audio src={staticFile('sfx/tick.wav')} volume={0.28} /></Sequence>)}
  </AbsoluteFill>
);
