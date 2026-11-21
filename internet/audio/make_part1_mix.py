"""Audio and caption times for the new end of Part 1: the photo lesson on the city map (28 s), then she flies to London and the end card (10.7 s).
Writes v3/public/part1-mix.wav and v3/src/dusk/part1-plan.json (captions, read by the scene). Run from internet/."""
import json, numpy as np, soundfile as sf
SR = 48000; rng = np.random.default_rng(31); PHOTO = 28.0; FLY = 5.4; FLYK = 7.1 / 5.4; END = 3.6; DUR = PHOTO + FLY + END; N = int(DUR * SR)   # the flight shot plays FLYK times faster than drawn
V = [("part1/a1", 0.2, ["A text is tiny.", "But what about a *photo?*"]), ("part1/b1", 3.05, ["Send it as *one big block,*", "and it holds the *whole line.*"]), ("part1/b2", 6.4, ["Everyone else has to *wait.*"]),
     ("part1/b3", 8.3, ["One glitch, and it *starts all over* again."]), ("part1/c1", 10.8, ["So the internet *never* sends it whole."]),
     ("part1/d1", 13.1, ["It cuts the photo into", "about *2,000* small packets,"]), ("part1/d2", 16.4, ["each with her *address* and a *number.*"]), ("part1/d3", 18.5, ["They *share the lines* with everyone else."]),
     ("part1/d4", 20.7, ["Busy road? Some go *another way.*"]), ("part1/d5", 22.7, ["One lost? Only *that one* is sent again."]), ("part1/d6", 25.3, ["And her phone puts them *back in order.*"]),
     ("t3", PHOTO + 0.25, ["Then she flies to *London.*"]), ("part1/z1", PHOTO + 2.05, ["So how does a photo *cross an ocean?*", "That's *part two.*"]), ("t10", PHOTO + FLY + 0.5, [])]
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
    L = int(0.5 * SR); tt = np.arange(L) / SR; f = midi(motif[i % 16] + 12); place((np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * env(L, 0.002, 0.35, 5), at, 0.05, 0.35 if i % 2 else -0.35)
for q in range(int(DUR / beat)):
    at = q * beat
    if HELD[0] < at < HELD[1] or at > DUR - 2.6: continue
    L = int(0.4 * SR); tt = np.arange(L) / SR; place(np.sin(2 * np.pi * (42 + 70 * np.exp(-tt * 28)) * tt) * env(L, 0.002, 0.3, 6), at, 0.32)
out *= 0.5
subs = []; fly = []; prev = 0.0
for name, at, pieces in V:
    a, sr = sf.read(f"voice/{name}.wav"); a = np.interp(np.arange(len(a) * 2) / 2, np.arange(len(a)), a)
    if at < prev + 0.1: print("pushed", name, at, "->", round(prev + 0.1, 2)); at = prev + 0.1
    i = int(at * SR); n = min(len(a), N - i); pad = int(0.12 * SR); lo, hi = max(0, i - pad), min(N, i + n + pad)
    duck = np.full(hi - lo, 0.5); k = min(pad, (hi - lo) // 2); duck[:k] = np.linspace(1, 0.5, k); duck[-k:] = np.linspace(0.5, 1, k); out[lo:hi] *= duck[:, None]
    out[i:i + n] += np.stack([a[:n], a[:n]], 1) * 0.92; d = len(a) / SR; prev = at + d
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
x = t(0.5); put(np.sin(2 * np.pi * (160 + 120 * x) * x) * np.sin(np.pi * x / 0.5), 3.6, 0.16)                 # the line is taken
blip(3.1, 1500, 0.1, 0.07); blip(13.3, 1500, 0.1, 0.07)                                                        # he taps send
x = t(4.0); put(np.sin(2 * np.pi * 70 * x) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * x)) * np.minimum(1, x / 0.3) * np.clip((4.0 - x) / 0.2, 0, 1), 3.7, 0.16)   # the heavy block crawling
for i in range(14): blip(4.3 + i * 0.42, 520 - 12 * i, 0.05, 0.09)                                             # others piling up
x = t(0.5); put(fx(rng.standard_normal(len(x)), a=0.001, r=12) * 0.5 + fx(np.sin(2 * np.pi * (90 * np.exp(-x * 8) + 45) * x), r=5) * 0.8, 7.7)   # the glitch
x = t(0.5); put(np.sin(2 * np.pi * (600 - 380 * x / 0.5) * x) * np.sin(np.pi * x / 0.5) * 0.14, 7.75)
x = t(0.4); put(np.sin(2 * np.pi * (300 + 300 * x / 0.4) * x) * np.sin(np.pi * x / 0.4) * 0.1, 8.7)           # start again
x = t(1.5); put(np.sin(2 * np.pi * 70 * x) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * x)) * np.minimum(1, x / 0.3) * np.clip((1.5 - x) / 0.3, 0, 1), 9.1, 0.14)
whoosh(10.6, 0.8, 0.35)                                                                                      # the line is freed
for k_ in range(6): blip(12.0 + k_ * 0.15, 1400 + 120 * k_, 0.07, 0.04)                                       # the photo is sliced
for i in range(36): blip(14.3 + i * 0.2, 1500 + 140 * (i % 6), 0.045, 0.035)                                  # packets leaving
for i in range(36): blip(25.85 if i == 28 else 14.3 + i * 0.2 + (3.4 if i % 3 == 1 else 2.6) + 0.35, 2100 + 90 * (i % 6), 0.03, 0.03)   # tiles landing
x = t(0.3); put(np.sin(2 * np.pi * (500 - 300 * x / 0.3) * x) * np.sin(np.pi * x / 0.3), 21.2, 0.14)   # one is lost
blip(22.9, 1800, 0.09, 0.08)
for i in range(12): blip(26.1 + i * 0.07, 900 + 70 * i, 0.04, 0.04)                                              # her phone sorts them by number
ding(27.1, 1568, 0.16); ding(27.25, 2093, 0.1)                                   # sent again; photo complete
F0 = PHOTO; whoosh(F0 + 1.55, 0.6, 0.35)   # the plane
for i in range(3): blip(F0 + (3.4 + i * 0.12) / FLYK, 880 + 220 * i, 0.06, 0.08)
x = t(1.5); put(np.sin(2 * np.pi * (220 + 380 * (x / 1.5) ** 2) * x) * np.sin(np.pi * x / 1.5) * 0.1, F0 + 4.25 / FLYK)   # the cable draws across the globe
for i in range(20): blip(F0 + (4.3 + i * 0.1) / FLYK, 1800 + rng.uniform(0, 2400), 0.035)
whoosh(F0 + 6.35, 0.9, 0.5, 60); whoosh(F0 + FLY - 0.1, 0.6, 0.35)
out[:int(0.4 * SR)] *= np.linspace(0, 1, int(0.4 * SR))[:, None]; out[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))[:, None]
ab = np.abs(out); out = np.where(ab > 0.75, np.sign(out) * (0.75 + 0.15 * np.tanh((ab - 0.75) / 0.15)), out)
sf.write('v3/public/part1-mix.wav', out.astype(np.float32), SR)
json.dump({"photo": PHOTO, "fly": FLY, "flyk": FLYK, "end": END, "subs": subs, "flysubs": fly}, open('v3/src/dusk/part1-plan.json', 'w'), indent=1); print("length", DUR, "peak", round(float(np.abs(out).max()), 3))
