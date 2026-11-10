import {
  AbsoluteFill, Audio, OffthreadVideo, Sequence, continueRender, delayRender,
  interpolate, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';

export const FPS = 30;
export const DURATION_S = 40;
const s = (sec) => Math.round(sec * FPS);

const C = {
  accent: '#f0a640',
  white: '#ffffff',
  muted: '#9aa4ad',
  chipBg: 'rgba(14,18,26,0.78)',
  chipLine: 'rgba(240,166,64,0.55)',
};

/* ---------- fonts (bundled locally, so renders never depend on the network) ---------- */
const fontHandle = delayRender('fonts');
Promise.all([
  ['Sora', 'fonts/sora-latin-700-normal.woff2', '700'],
  ['Sora', 'fonts/sora-latin-600-normal.woff2', '600'],
  ['Plex Mono', 'fonts/ibm-plex-mono-latin-500-normal.woff2', '500'],
  ['Plex Sans', 'fonts/ibm-plex-sans-latin-500-normal.woff2', '500'],
].map(([family, file, weight]) => new FontFace(family, `url(${staticFile(file)})`, { weight }).load().then((f) => document.fonts.add(f))))
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));

/* ---------- caption timeline (seconds), matched to the 3D shots ----------
   Words wrapped in *asterisks* get the accent colour. */
const CAPTIONS = [
  { from: 2.25, to: 3.8, text: 'But glass *cracks* when you bend it' },
  { from: 5.05, to: 6.75, text: 'Just *5.2 mm* thin' },
  { from: 6.75, to: 9.0, text: 'Let’s open it up' },
  { from: 9.3, to: 13.4, text: 'Trick 1: the screen is *~10 thin layers*' },
  { from: 13.4, to: 19.0, text: 'They *slide* like paper, so nothing snaps' },
  { from: 19.25, to: 24.5, text: 'Trick 2: a hinge of *100+ parts*', sub: 'gears · springs · 3D-printed titanium cover' },
  { from: 24.75, to: 30.0, text: 'Closing, it *curls into a teardrop* instead of folding flat' },
  { from: 30.3, to: 33.1, text: 'Bend the same spot *again and again*' },
  { from: 33.1, to: 36.0, text: '…and you get *the crease* you can feel' },
  { from: 36.2, to: 40.0, text: 'It doesn’t fold like paper.|It *rolls like a poster.*' },
];

/* ---------- sound design (seconds) ---------- */
const SFX = [
  ['hit.wav', 0.02, 0.9],
  ['whoosh.wav', 1.9, 0.55],          // starts opening
  ['riser.wav', 2.45, 0.5],
  ['hit.wav', 3.8, 0.75],             // "So how?"
  ['whoosh.wav', 5.15, 0.6],          // explode
  ['whoosh-short.wav', 9.1, 0.45],    // move to the screen layers
  ['whoosh.wav', 19.0, 0.5],          // to the hinge
  ['whoosh.wav', 24.6, 0.55],         // collapse
  ['whoosh-short.wav', 26.2, 0.4],    // start of the fold
  ['whoosh-short.wav', 30.1, 0.4],    // unfold for the crease shot
  ['whoosh.wav', 36.1, 0.55],         // fold shut
  ['snap.wav', 38.55, 0.8],           // halves meet
];
const POPS = CAPTIONS.map((c) => c.from);
const LAYER_TICKS = Array.from({ length: 10 }, (_, i) => 9.6 + i * 0.16);
const PART_TICKS = Array.from({ length: 8 }, (_, i) => 19.4 + i * 0.11);

/* ---------- pieces ---------- */
const Word = ({ word, accent, delay, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 180, mass: 0.6 } });
  const out = interpolate(frame, [exitAt - 6, exitAt], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <span style={{
      display: 'inline-block', marginRight: '0.26em', color: accent ? C.accent : C.white,
      opacity: Math.min(p, 1) * out, transform: `translateY(${(1 - p) * 36}px) scale(${0.92 + 0.08 * p})`,
    }}>{word}</span>
  );
};

const Caption = ({ text, sub, durationInFrames }) => {
  const frame = useCurrentFrame();
  // words between *asterisks* are accented; '|' starts a new line
  let i = 0, inside = false;
  const lines = text.split('|').map((line) => line.split(' ').map((raw) => {
    if (raw.startsWith('*')) inside = true;
    const w = { word: raw.replace(/\*/g, ''), accent: inside, idx: i++ };
    if (raw.replace(/[.,!?…]+$/, '').endsWith('*')) inside = false;
    return w;
  }));
  const subOp = interpolate(frame, [8, 18, durationInFrames - 6, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ top: 190, height: 'auto', alignItems: 'center', padding: '0 70px' }}>
      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 76, lineHeight: 1.12, letterSpacing: '-0.02em', textAlign: 'center', textShadow: '0 6px 30px rgba(0,0,0,0.7)' }}>
        {lines.map((ws, li) => (
          <div key={li}>{ws.map((w) => <Word key={w.idx} word={w.word} accent={w.accent} delay={w.idx * 2} exitAt={durationInFrames} />)}</div>
        ))}
      </div>
      {sub ? <div style={{ marginTop: 22, fontFamily: 'Plex Mono', fontWeight: 500, fontSize: 27, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, whiteSpace: 'nowrap', opacity: subOp }}>{sub}</div> : null}
    </AbsoluteFill>
  );
};

const PriceHook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.round(interpolate(frame, [2, 16], [0, 299900], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 3) }));
  const pop = spring({ frame: frame - 14, fps, config: { damping: 9, stiffness: 220 } });
  const inOp = interpolate(frame, [0, 5, s(2.2) - 6, s(2.2)], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const rupees = '₹' + n.toLocaleString('en-IN');
  return (
    <AbsoluteFill style={{ top: 175, height: 'auto', alignItems: 'center', opacity: inOp }}>
      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 158, letterSpacing: '-0.04em', color: C.accent, transform: `scale(${1 + 0.06 * pop - 0.06 * Math.min(pop, 1)})`, textShadow: '0 8px 40px rgba(240,166,64,0.35)', fontVariantNumeric: 'tabular-nums' }}>{rupees}</div>
      <div style={{ marginTop: 6, fontFamily: 'Sora', fontWeight: 700, fontSize: 72, color: C.white, letterSpacing: '-0.02em' }}>
        This iPhone <span style={{ color: C.accent }}>folds in half</span>
      </div>
    </AbsoluteFill>
  );
};

const Punch = ({ text, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 8, stiffness: 260, mass: 0.7 } });
  const out = interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ top: 200, height: 'auto', alignItems: 'center' }}>
      <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 170, color: C.accent, letterSpacing: '-0.04em', transform: `scale(${0.4 + 0.6 * p})`, opacity: out, textShadow: '0 10px 50px rgba(240,166,64,0.4)' }}>{text}</div>
    </AbsoluteFill>
  );
};

const Chip = ({ label, value, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 15, stiffness: 160 } });
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ top: 1395, height: 'auto', alignItems: 'center' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 18, padding: '18px 34px', borderRadius: 999,
        background: C.chipBg, border: `2px solid ${C.chipLine}`, backdropFilter: 'blur(8px)',
        transform: `translateY(${(1 - p) * 40}px)`, opacity: Math.min(p, 1) * out,
      }}>
        <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 64, color: C.accent, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        <span style={{ fontFamily: 'Plex Mono', fontWeight: 500, fontSize: 30, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.white }}>{label}</span>
      </div>
    </AbsoluteFill>
  );
};

const CountChip = ({ label, to, suffix = '', countFrames, durationInFrames }) => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [4, 4 + countFrames], [1, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const done = frame >= 4 + countFrames;
  return <Chip label={label} value={String(n).padStart(2, '0') + (done ? suffix : '')} durationInFrames={durationInFrames} />;
};

const Chrome = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <AbsoluteFill style={{ background: 'linear-gradient(#000 0%, rgba(0,0,0,0.88) 17%, rgba(0,0,0,0) 34%)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 60% at 50% 58%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, height: 7, width: `${(frame / durationInFrames) * 100}%`, background: C.accent }} />
      <div style={{ position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', fontFamily: 'Plex Mono', fontWeight: 500, fontSize: 26, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.55)' }}>INVISITECH · TEARDOWN</div>
    </>
  );
};

/* ---------- the reel ---------- */
export const Reel = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <OffthreadVideo src={staticFile('duo-short-3d.mp4')} muted />
    <Chrome />

    <Sequence from={0} durationInFrames={s(2.2)}><PriceHook /></Sequence>
    <Sequence from={s(3.8)} durationInFrames={s(1.2)}><Punch text="So how?" durationInFrames={s(1.2)} /></Sequence>
    {CAPTIONS.map((c) => (
      <Sequence key={c.from} from={s(c.from)} durationInFrames={s(c.to - c.from)}>
        <Caption text={c.text} sub={c.sub} durationInFrames={s(c.to - c.from)} />
      </Sequence>
    ))}

    <Sequence from={s(5.3)} durationInFrames={s(3.6)}><Chip value="5.2 mm" label="open · 11.3 mm closed" durationInFrames={s(3.6)} /></Sequence>
    <Sequence from={s(9.5)} durationInFrames={s(9.3)}><CountChip to={10} label="ultrathin layers" countFrames={s(1.6)} durationInFrames={s(9.3)} /></Sequence>
    <Sequence from={s(19.3)} durationInFrames={s(5.1)}><CountChip to={100} suffix="+" label="hinge parts" countFrames={s(0.9)} durationInFrames={s(5.1)} /></Sequence>

    {/* sound */}
    <Audio src={staticFile('sfx/bed.wav')} volume={0.55} />
    {SFX.map(([f, t, v], k) => <Sequence key={'sfx' + k} from={s(t)}><Audio src={staticFile('sfx/' + f)} volume={v} /></Sequence>)}
    {POPS.map((t, k) => <Sequence key={'pop' + k} from={s(t)}><Audio src={staticFile('sfx/pop.wav')} volume={0.35} /></Sequence>)}
    {LAYER_TICKS.map((t, k) => <Sequence key={'lt' + k} from={s(t)}><Audio src={staticFile('sfx/tick.wav')} volume={0.4} /></Sequence>)}
    {PART_TICKS.map((t, k) => <Sequence key={'pt' + k} from={s(t)}><Audio src={staticFile('sfx/tick.wav')} volume={0.35} /></Sequence>)}
  </AbsoluteFill>
);
