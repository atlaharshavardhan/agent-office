"""InvisiTech Duo reel: sound kit + 45 s music bed, synthesised from scratch (no third-party audio).

Run with any Python that has numpy + soundfile (e.g. the Kokoro venv):
  ../../../invisitech-yt/tools/voice/.venv/bin/python sfx/make_sound.py
Writes public/sfx2/*.wav and public/sfx2/music.wav (48 kHz stereo).
"""
from pathlib import Path
import numpy as np
import soundfile as sf

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx2"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)


# ---------------------------------------------------------------- helpers
def t_(dur):
    return np.arange(int(dur * SR)) / SR


def env(n, a, d, curve=4.0):
    """attack (s) then exponential-ish decay over d (s)."""
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-4), 0, 1)
    dec = np.exp(-curve * np.clip(t - a, 0, None) / max(d, 1e-4))
    return att * dec


def onepole_lp(x, fc):
    """one-pole low-pass; fc may be an array (time-varying)."""
    fc = np.broadcast_to(np.asarray(fc, float), x.shape[:1])
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    z = np.zeros(x.shape[1:]) if x.ndim > 1 else 0.0
    for i in range(len(x)):
        z = (1 - a[i]) * x[i] + a[i] * z
        y[i] = z
    return y


def svf_bp(x, fc, q=2.0):
    """state-variable band-pass, time-varying centre frequency."""
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    f = 2 * np.sin(np.pi * np.clip(fc, 20, SR / 6) / SR)
    lo = bp = 0.0
    y = np.empty_like(x)
    damp = 1 / q
    for i in range(len(x)):
        hp = x[i] - lo - damp * bp
        bp += f[i] * hp
        lo += f[i] * bp
        y[i] = bp
    return y


def hp(x, fc):
    return x - onepole_lp(x, fc)


def fft_conv(x, ir):
    n = len(x) + len(ir) - 1
    N = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(ir, N), N)[:n]


def make_ir(dur=2.2, decay=3.2, damp=6000, seed=1):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    t = np.arange(n) / SR
    irs = []
    for ch in range(2):
        noise = r.standard_normal(n) * np.exp(-decay * t)
        noise = onepole_lp(noise, np.linspace(damp, 1500, n))  # darker tail
        noise[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))  # pre-delay softening
        irs.append(noise / np.sqrt(np.sum(noise ** 2)))
    return irs


IR_HALL = make_ir(2.4, 2.6, 7000, 1)
IR_ROOM = make_ir(0.6, 9.0, 9000, 2)


def reverb(st, ir, wet):
    out = np.zeros((len(st) + len(ir[0]) - 1, 2))
    for c in range(2):
        out[:, c] = fft_conv(st[:, c], ir[c])
    dry = np.zeros_like(out)
    dry[: len(st)] = st
    return dry * (1 - wet * 0.35) + out * wet


def pan(mono, p):
    """p: -1 (left) .. 1 (right), scalar or array; equal power."""
    p = np.broadcast_to(np.asarray(p, float), mono.shape)
    a = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)], 1)


def norm(st, peak_db):
    m = np.max(np.abs(st)) or 1
    return st / m * 10 ** (peak_db / 20)


def trim_tail(st, thresh=1e-4):
    idx = np.where(np.max(np.abs(st), 1) > thresh)[0]
    st = st[: (idx[-1] + 1) if len(idx) else len(st)]
    f = min(len(st), int(0.03 * SR))
    st[-f:] *= np.linspace(1, 0, f)[:, None]
    return st


def save(name, st, peak_db=-3):
    st = trim_tail(norm(st, peak_db))
    sf.write(OUT / name, st.astype(np.float32), SR)
    print(f"{name:20s} {len(st) / SR:5.2f}s")


def noise(n):
    return rng.standard_normal(n)


def sine_sweep(f0, f1, n, curve=1.0):
    f = f0 + (f1 - f0) * (np.linspace(0, 1, n) ** curve)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


# ---------------------------------------------------------------- sound effects
def whoosh(dur=0.9, f_lo=350, f_hi=2600, peak=0.55, pan_from=-0.6, pan_to=0.6, air=True, rev=0.35):
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    shape = np.where(u < peak, (u / peak) ** 2.2, np.exp(-5 * (u - peak) / (1 - peak)))
    fc = f_lo + (f_hi - f_lo) * np.sin(np.pi * np.clip(u / (peak * 1.6), 0, 1)) ** 1.5
    body = svf_bp(noise(n), fc, 1.4) * shape
    sub = svf_bp(noise(n), fc * 0.35, 1.0) * shape * 0.6 if air else 0
    mono = body + sub
    st = pan(mono, np.linspace(pan_from, pan_to, n))
    return reverb(st, IR_HALL, rev)


def soft_impact(dur=1.6, f0=95, f1=42, bright=0.25, rev=0.4):
    n = int(dur * SR)
    thump = sine_sweep(f0, f1, n, 0.35) * env(n, 0.004, 0.45, 3.5)
    tex = svf_bp(noise(n), np.linspace(1800, 300, n), 0.8) * env(n, 0.002, 0.25, 5) * bright
    st = pan(thump + tex, 0)
    return reverb(st, IR_HALL, rev)


def close_thock():
    """the 'premium' magnetic close: soft air push, firm low thock, tiny metal click, short room."""
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    air = svf_bp(noise(n), np.linspace(500, 1500, n), 1.0) * np.clip(1 - t / 0.07, 0, 1) ** 2 * 0.25
    pre = int(0.055 * SR)  # air leads the impact a little
    thock = np.zeros(n)
    k = n - pre
    tk = np.arange(k) / SR
    body = (np.sin(2 * np.pi * (78 + 40 * np.exp(-tk * 40)) * tk) * np.exp(-tk * 16)
            + 0.45 * np.sin(2 * np.pi * 176 * tk) * np.exp(-tk * 30)
            + 0.22 * np.sin(2 * np.pi * 412 * tk) * np.exp(-tk * 45))
    click = svf_bp(noise(k), 3800, 3.0) * np.exp(-tk * 260) * 0.55
    clack = svf_bp(noise(k), 1200, 1.6) * np.exp(-tk * 90) * 0.35
    thock[pre:] = body + click + clack
    mono = np.concatenate([air[:pre], np.zeros(n - pre)]) + thock
    st = pan(mono, 0)
    return reverb(st, IR_ROOM, 0.22)


def open_release(swish=True):
    """magnetic release: a soft 'tk' then a short airy swish as the halves part."""
    n = int(0.12 * SR)
    tk = np.arange(n) / SR
    tick = (svf_bp(noise(n), 2600, 3.0) * np.exp(-tk * 180) * 0.6
            + np.sin(2 * np.pi * 240 * tk) * np.exp(-tk * 60) * 0.35)
    st = pan(tick, 0)
    sw = whoosh(1.1, 300, 1800, 0.45, 0.2, -0.3, air=True, rev=0.25) * (0.55 if swish else 0.0)
    out = np.zeros((max(len(st), len(sw) + int(0.04 * SR)), 2))
    out[: len(st)] += st
    out[int(0.04 * SR): int(0.04 * SR) + len(sw)] += sw
    return reverb(out, IR_ROOM, 0.15)


def chime(freqs=(1046.5, 1568.0, 2093.0), dur=2.2, spread=0.06):
    """glassy screen-on bell: soft attack, inharmonic shimmer, wide."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for i, f in enumerate(freqs):
        d = i * spread
        e = np.clip((t - d) / 0.012, 0, 1) * np.exp(-np.clip(t - d, 0, None) * (2.2 + i))
        for ratio, amp in ((1, 1.0), (2.76, 0.22), (5.4, 0.08)):
            tone = np.sin(2 * np.pi * f * ratio * t + rng.uniform(0, 6.28)) * e * amp
            out += pan(tone, (-0.5, 0.5, 0)[i % 3])
    return reverb(out, IR_HALL, 0.55)


def pluck(f, dur=0.55, bright=0.5, p=0.0):
    """soft UI pluck (Karplus-Strong), used for labels popping in."""
    n = int(dur * SR)
    L = int(SR / f)
    buf = onepole_lp(svf_bp(noise(L), f * 2.5, 0.7), f * 6) * 2.0 + noise(L) * 0.2 * bright
    y = np.zeros(n)
    y[:L] = buf
    for i in range(L, n):
        y[i] = 0.497 * (y[i - L] + y[i - L + 1]) if i - L + 1 < n else 0
    y *= env(n, 0.002, dur, 3)
    y += np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, 0.003, 0.18, 4) * 0.35  # rounder attack
    return reverb(pan(y, p), IR_ROOM, 0.3)


def soft_tone(f, dur=0.9, p=0.0, wet=0.45):
    """premium UI tone: pure sine + a little octave, slow-ish attack, long smooth decay, airy reverb"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    e = np.clip(t / 0.012, 0, 1) ** 2 * np.exp(-t * 4.2)
    y = (np.sin(2 * np.pi * f * t) + 0.18 * np.sin(4 * np.pi * f * t) * np.exp(-t * 6)) * e
    return reverb(pan(y, p), IR_HALL, wet)


def swell(dur=1.4):
    """smooth airy swell for the hinge counter (replaces the ratchet clicks)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    shape = np.sin(np.pi * np.clip(u / 0.85, 0, 1)) ** 2
    air = svf_bp(noise(n), 500 + 900 * u, 0.9) * shape * 0.5
    t = np.arange(n) / SR
    pad = sum(np.sin(2 * np.pi * f * t) for f in (220, 330, 440)) * shape * 0.12
    return reverb(pan(air + pad, 0), IR_HALL, 0.5)


def tick(f=2400, p=0.0):
    n = int(0.06 * SR)
    tk = np.arange(n) / SR
    x = svf_bp(noise(n), f, 4) * np.exp(-tk * 220) + np.sin(2 * np.pi * f / 2 * tk) * np.exp(-tk * 120) * 0.3
    return reverb(pan(x, p), IR_ROOM, 0.2)


def ratchet(count=8, gap=0.11):
    """gear ratchet clicks for the '100+ hinge parts' counter."""
    n = int((count * gap + 0.3) * SR)
    out = np.zeros((n, 2))
    for i in range(count):
        c = tick(1700 + 120 * i, np.sin(i) * 0.4) * (0.7 + 0.3 * (i == count - 1))
        s = int(i * gap * SR)
        out[s: s + len(c)] += c[: n - s]
    return out


def swish_bend(dur=1.6, reverse=False):
    w = whoosh(dur, 250, 1400, 0.7 if not reverse else 0.3, -0.4, 0.4, air=True, rev=0.3) * 0.8
    return w


def shimmer(dur=1.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for i, f in enumerate([1318.5, 1760, 2637, 3520, 2093]):
        d = i * 0.07
        e = np.clip((t - d) / 0.01, 0, 1) * np.exp(-np.clip(t - d, 0, None) * 4)
        out += pan(np.sin(2 * np.pi * f * t) * e * (0.5 / (1 + i * 0.3)), np.sin(i * 1.7) * 0.7)
    return reverb(out, IR_HALL, 0.6)


def like_tap():
    """thumb press: soft low tap + bright pop."""
    a = soft_impact(0.5, 160, 90, 0.4, 0.15) * 0.5
    b = pluck(1318.5, 0.4, 0.8)
    n = max(len(a), len(b) + 2400)
    out = np.zeros((n, 2))
    out[: len(a)] += a
    out[2400: 2400 + len(b)] += b
    return out


save("whoosh.wav", whoosh(0.95), -4)
save("whoosh-soft.wav", whoosh(1.3, 250, 1600, 0.55, -0.4, 0.4, rev=0.45), -6)
save("whoosh-fast.wav", whoosh(0.55, 500, 3500, 0.5, 0.6, -0.6, rev=0.3), -5)
save("impact.wav", soft_impact(), -2)
save("impact-small.wav", soft_impact(1.0, 120, 60, 0.35, 0.3), -5)
save("close.wav", close_thock(), -1)
save("open.wav", open_release(swish=False), -4)
save("chime.wav", chime(), -6)
save("shimmer.wav", shimmer(), -8)
save("ratchet.wav", ratchet(), -9)
save("bend.wav", swish_bend(), -7)
save("unbend.wav", swish_bend(1.4, True), -8)
save("tap.wav", like_tap(), -4)
save("tick.wav", tick(), -12)
SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0]  # C major pentatonic-ish, rising
for i, f in enumerate(SCALE):
    save(f"pluck{i}.wav", pluck(f, 0.5, 0.4, -0.5 + i / 9), -10)


# ---------------------------------------------------------------- music bed (45 s, 100 BPM, C major vi-IV-I-V)
BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT
DUR = 45.0
N = int(DUR * SR)
T = np.arange(N) / SR
mix = np.zeros((N, 2))
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
CHORDS = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]]  # Am F C G
ROOTS = [45, 41, 48, 43]


def section_gain(t, pts):
    xs, ys = zip(*pts)
    return np.interp(t, xs, ys)


def add(buf, at, st, g=1.0):
    s = int(at * SR)
    if s >= N:
        return
    e = min(N, s + len(st))
    buf[s:e] += st[: e - s] * g


# pad: additive saw-ish voices, two detuned layers, slow filter breathing
pad = np.zeros((N, 2))
nbars = int(np.ceil(DUR / BAR)) + 1
for b in range(nbars):
    chord = CHORDS[b % 4]
    start = b * BAR
    n = int((BAR + 1.2) * SR)
    t = np.arange(n) / SR
    e = np.clip(t / 0.5, 0, 1) * np.clip((BAR + 1.2 - t) / 1.2, 0, 1)
    v = np.zeros((n, 2))
    for m in chord:
        f = midi(m)
        for det, side in ((-7, -0.6), (7, 0.6)):
            ff = f * 2 ** (det / 1200)
            s = np.zeros(n)
            for h in range(1, 9):
                s += np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28)) / h ** 1.25
            v += pan(s * e, side) * 0.06
    add(pad, start, v)
pad = onepole_lp(pad, 900 + 700 * (0.5 + 0.5 * np.sin(2 * np.pi * T / (BAR * 2))))
pad = reverb(pad, IR_HALL, 0.5)[:N]

# sub bass with sidechain-style pump on every beat
bass = np.zeros(N)
for b in range(nbars):
    f = midi(ROOTS[b % 4] - 12)
    n = int(BAR * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    s *= np.clip(t / 0.03, 0, 1) * np.clip((BAR - t) / 0.05, 0, 1)
    st = int(b * BAR * SR)
    if st >= N:
        continue
    e = min(N, st + n)
    bass[st:e] += s[: e - st] * 0.32
pump = 1 - 0.55 * np.exp(-((T % BEAT) / 0.11))

# pluck arpeggio (8ths) with ping-pong delay
arp = np.zeros((N, 2))
pl_cache = {}
for k in range(int(DUR / (BEAT / 2))):
    at = k * BEAT / 2
    chord = CHORDS[int(at // BAR) % 4]
    m = chord[[0, 2, 1, 3, 2, 1, 3, 2][k % 8]] + 12
    if m not in pl_cache:
        pl_cache[m] = pluck(midi(m), 0.45, 0.0)
    add(arp, at, pl_cache[m] * 0.42)
dly = int(BEAT * 0.75 * SR)
echo = np.zeros_like(arp)
echo[dly:, 0] = arp[:-dly, 1] * 0.35
echo[dly * 2:, 1] = arp[:-dly * 2, 0] * 0.22
arp = arp + echo

# drums
def kick():
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * np.cumsum(48 + 110 * np.exp(-t * 32)) / SR) * np.exp(-t * 7.5)
            + svf_bp(noise(n), 3000, 2) * np.exp(-t * 300) * 0.25)


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    return hp(noise(n), 7000) * np.exp(-t * (25 if open_ else 110))


def clap():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    x = svf_bp(noise(n), 1500, 1.2)
    e = sum(np.exp(-np.clip(t - d, 0, None) * 60) * (t >= d) for d in (0, 0.011, 0.022)) + np.exp(-t * 14) * 0.5
    return x * e


K, H, HO, C = kick(), hat(), hat(True), clap()
drums = np.zeros((N, 2))
for k in range(int(DUR / BEAT)):
    at = k * BEAT
    add(drums, at, pan(K, 0) * 0.9)
    if k % 2 == 1:
        add(drums, at, reverb(pan(C, 0.1), IR_ROOM, 0.35)[: len(C) + 4000] * 0.32)
    add(drums, at + BEAT / 2, pan(H, 0.35) * 0.05)

# arrangement (seconds): intro pad → arp at 2.4 → break before "So how?" → groove at 5.0 →
# lighter under the crease → build into the close (38.5 thock) → outro pad + end card
g_pad = section_gain(T, [(0, 0.0), (0.6, 1.0), (45, 1.0)])
g_arp = section_gain(T, [(0, 0), (2.3, 0), (2.6, 0.8), (4.5, 0.8), (4.7, 0.15), (5.0, 0.9), (30, 0.9), (30.4, 0.55), (36, 0.55), (38.4, 0.9), (38.5, 0), (40, 0), (40.5, 0.5), (44, 0.4), (45, 0)])
g_drm = section_gain(T, [(0, 0), (4.95, 0), (5.0, 1), (30, 1), (30.4, 0.45), (36, 0.45), (38.45, 1), (38.5, 0), (45, 0)])
g_bas = section_gain(T, [(0, 0), (2.3, 0), (2.6, 0.6), (4.6, 0.6), (4.7, 0), (5.0, 1), (38.45, 1), (38.5, 0), (40.2, 0), (40.6, 0.6), (44, 0.4), (45, 0)])
g_all = section_gain(T, [(0, 1), (43.2, 1), (45, 0)])

mix += pad * g_pad[:, None] * 1.0
mix += arp * (g_arp * pump)[:, None] * 0.9
mix += pan(bass * pump * g_bas, 0) * 1.0
mix += drums * g_drm[:, None] * 0.75
mix *= g_all[:, None]
# gentle bus glue: soft clip + normalise
mix = onepole_lp(mix, 9000)
mix = np.tanh(mix * 1.4) / 1.4
mix = norm(mix, -2)
sf.write(OUT / "music.wav", mix.astype(np.float32), SR)
print("music.wav", DUR, "s")
