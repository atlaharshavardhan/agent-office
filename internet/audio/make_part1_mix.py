"""Audio and caption times for the new end of Part 1: the photo lesson on the city map (28 s), then she flies to London and the end card (10.7 s).
Writes v3/public/part1-mix.wav and v3/src/dusk/part1-plan.json (captions, read by the scene). Run from internet/."""
import json, numpy as np, soundfile as sf
SR = 48000; rng = np.random.default_rng(31); PHOTO = 28.0; FLY = 4.0; FLYK = 7.1 / 4.0; END = 3.6; DUR = PHOTO + FLY + END; N = int(DUR * SR)   # the flight shot plays FLYK times faster than drawn
V = [("liam/a1", 0.2, ["A text is tiny.", "But what about a *photo?*"]), ("liam/b1", 3.05, ["Send it as *one big piece,*", "and it *blocks* the whole line."]), ("liam/b2", 6.4, ["Everyone else has to *wait.*"]),
     ("liam/b3", 8.3, ["One small error, and it has to *start again.*"]), ("liam/c1p", 10.8, ["So the internet *never* sends it in one piece."]),
     ("liam/d1", 13.1, ["It cuts the photo into", "about *2,000* small pieces,", "called *packets,*"]), ("liam/d2", 16.4, ["each with her *address* and a *number.*"]), ("liam/d3", 18.5, ["They *share the wires* with everyone else."]),
     ("liam/d4", 20.7, ["Wire busy? Some take *another path.*"]), ("liam/d5", 22.7, ["One lost? Only *that one* is sent again."]), ("liam/d6", 25.3, ["And her phone puts them *back in order.*"]),
     ("liam/t3", PHOTO + 0.1, ["Then she flies to *London.*"]), ("liam/z2", PHOTO + 1.75, ["Next: how a photo *crosses an ocean.*"]), ("liam/t10", PHOTO + FLY + 0.5, [])]
midi = lambda m: 440 * 2 ** ((m - 69) / 12); beat = 60 / 96
def env(n, a=0.005, r=0.2, shape=4.0): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-shape * t / max(r, 1e-4))
out = np.zeros((N, 2))
def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); s = sig[: j - i] * gain; out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
# the film's night theme; the plucks and the kick stop while the line is held, and come back with the packets
CH = [[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71], [52, 59, 64, 67]]
for j in range(int(DUR / 2.5) + 1):
    L = int(2.8 * SR); tt = np.arange(L) / SR
    for k, m in enumerate(CH[j % 6]):
        f = midi(m); tone = sum(np.sin(2 * np.pi * f * (1 + d) * tt) for d in (-0.003, 0, 0.003)) / 3
        place(tone * np.minimum(1, tt / 0.6) * np.minimum(1, (2.8 - tt) / 0.5).clip(0), j * 2.5, 0.045, (k - 1.5) * 0.4)
motif = [69, 76, 72, 76, 69, 76, 74, 76, 65, 72, 69, 72, 65, 72, 71, 72]; HELD = (3.6, 11.2)
for i in range(int(DUR / (beat / 2))):
    at = i * beat / 2
    if HELD[0] < at < HELD[1] or at > DUR - 2.6: continue
    L = int(0.5 * SR); tt = np.arange(L) / SR; f = midi(motif[i % 16] + 12); place((np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * env(L, 0.002, 0.35, 5), at, 0.0, 0.35 if i % 2 else -0.35)
for q in range(int(DUR / beat)):
    at = q * beat
    if HELD[0] < at < HELD[1] or at > DUR - 2.6: continue
    L = int(0.4 * SR); tt = np.arange(L) / SR; place(np.sin(2 * np.pi * (42 + 70 * np.exp(-tt * 28)) * tt) * env(L, 0.002, 0.3, 6), at, 0.32)
out *= 0.5
subs = []; fly = []; prev = 0.0; LOGP = []
for name, at, pieces in V:
    a, sr = sf.read(f"voice/{name}.wav"); a = np.interp(np.arange(len(a) * 2) / 2, np.arange(len(a)), a)
    if at < prev + 0.1: print("pushed", name, at, "->", round(prev + 0.1, 2)); at = prev + 0.1
    i = int(at * SR); n = min(len(a), N - i); pad = int(0.12 * SR); lo, hi = max(0, i - pad), min(N, i + n + pad)
    duck = np.full(hi - lo, 0.5); k = min(pad, (hi - lo) // 2); duck[:k] = np.linspace(1, 0.5, k); duck[-k:] = np.linspace(0.5, 1, k); out[lo:hi] *= duck[:, None]
    out[i:i + n] += np.stack([a[:n], a[:n]], 1) * 0.92; d = len(a) / SR; prev = at + d; LOGP.append([round(50.1 + at, 3), round(50.1 + at + d, 3)])
    tot = sum(len(p.replace("*", "")) for p in pieces) or 1; c = at
    for p in pieces:
        w = d * len(p.replace("*", "")) / tot; row = [round(c, 2), round(c + w + (0.2 if p is pieces[-1] else 0), 2), p]
        (subs if at < PHOTO else fly).append(row if at < PHOTO else [round(row[0] - PHOTO, 2), round(row[1] - PHOTO, 2), p]); c += w
def put(sig, at, g=1.0): place(sig, at, g * np.sqrt(2))
def t(d): return np.arange(int(d * SR)) / SR
def fx(x, a=0.004, r=4.0): n = len(x); return x * np.minimum(1, np.arange(n) / (a * SR)) * np.exp(-r * np.arange(n) / n)
def noise(d, k=24): w = rng.standard_normal(int(d * SR)); return np.convolve(w, np.ones(k) / k, 'same')
def whoosh(at, d=0.5, g=0.4, k=24): pass   # whooshes removed at Harsh's request (17 Nov 2026)
def ding(at, f0=1318, g=0.18): x = t(0.9); put(fx(np.sin(2 * np.pi * f0 * x) + 0.5 * np.sin(2 * np.pi * f0 * 1.5 * x), r=6), at, g)
def blip(at, f0, g=0.07, d=0.05): x = t(d); put(fx(np.sin(2 * np.pi * f0 * x), r=5), at, g)
whoosh(0.3, 1.2, 0.3, 40)                                                                                    # camera pulls back
pass   # sweep removed (26 Nov 2026: no movement sounds)
blip(3.1, 1500, 0.1, 0.07); blip(13.3, 1500, 0.1, 0.07)                                                        # he taps send
pass   # crawl hum removed
pass   # queue ticks removed
x = t(0.5); put(fx(np.sin(2 * np.pi * (90 * np.exp(-x * 8) + 45) * x), r=5) * 0.8, 7.7)   # the glitch
pass   # sweep removed
pass   # sweep removed
pass   # crawl hum removed
whoosh(10.6, 0.8, 0.35)                                                                                      # the line is freed
pass   # slice blips removed (27 Nov 2026: only 2 or 3 beeps)
pass   # packet ticks removed
pass   # landing ticks removed
pass   # sweep removed
blip(22.9, 1800, 0.09, 0.08)
pass   # sorting ticks removed
ding(27.1, 1568, 0.16); ding(27.25, 2093, 0.1)                                   # sent again; photo complete
F0 = PHOTO; whoosh(F0 + 1.55, 0.6, 0.35)   # the plane
pass   # blips removed
pass   # cable sweep removed
pass   # sparkle removed
whoosh(F0 + 6.35, 0.9, 0.5, 60); whoosh(F0 + FLY - 0.1, 0.6, 0.35)
out[:int(0.4 * SR)] *= np.linspace(0, 1, int(0.4 * SR))[:, None]; out[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))[:, None]
ab = np.abs(out); out = np.where(ab > 0.75, np.sign(out) * (0.75 + 0.15 * np.tanh((ab - 0.75) / 0.15)), out)
sf.write('v3/public/part1-mix.wav', out.astype(np.float32), SR)
json.dump(LOGP, open('audio/voicelog-part1.json', 'w'))
json.dump({"photo": PHOTO, "fly": FLY, "flyk": FLYK, "end": END, "subs": subs, "flysubs": fly}, open('v3/src/dusk/part1-plan.json', 'w'), indent=1); print("length", DUR, "peak", round(float(np.abs(out).max()), 3))
