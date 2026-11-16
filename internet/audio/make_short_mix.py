"""Audio and timing plan for the new 3D part of the Short (flight to end card).
Writes v3/public/short-mix.wav (music, narration, code-made effects) and v3/src/v4/short-plan.json (the cut list and caption times,
read by the caption overlay and by v3/join_short.sh). Run from internet/."""
import json, numpy as np, soundfile as sf
SR = 48000; rng = np.random.default_rng(23)
# ---- the cut list: (clip, in, out) in seconds of each clean scene render
SEGS = [("FlightV", 0, 6.4), ("FlightV", 8.4, 16.0), ("LondonV4V", 0, 2.6), ("LondonV4V", 4.6, 14.0), ("PacketBurstV", 0, 10.0), ("UndergroundV", 0, 8.0),
        ("RoutersV", 0, 12.0), ("ShoreV", 0, 9.5), ("SeabedV", 0, 9.8), ("SeabedRepeaterV", 0, 6.5), ("SeaCableV", 0, 15.0), ("PlanetV", 0, 12.0),
        ("ShortEndA", 0, 4.8), ("LondonV4V", 10.4, 14.0), ("ShortEndB", 0, 6.8)]
starts = []; T = 0.0
for c, a, b in SEGS: starts.append(round(T, 3)); T = round(T + b - a, 3)
DUR = T; N = int(DUR * SR); ENDCARD = starts[14] + 3.2
# ---- narration: (file, earliest start, caption pieces; *word* is the highlighted one)
V = [("f1", 0.5, ["Then she moves to *London.*"]), ("f2", 6.9, ["*Seven thousand* kilometres away."]), ("f3", 9.4, ["Her flight takes *nine hours.*"]), ("f4", 11.6, ["His video has to do it in *under a second.*"]),
     ("l1", 14.4, ["A new *city.*"]), ("l2", 17.0, ["A new street, far from *his balcony.*"]), ("l3", 21.5, ["And she is waiting for *his video.*"]),
     ("p1", 26.3, ["He hits *send.*"]), ("p2", 27.8, ["The video is chopped into", "*1,500* small packets,"]), ("p3", 31.4, ["each stamped with *her address.*"]), ("p4", 33.2, ["*Radio waves* carry them to the nearest cell tower."]),
     ("u1", 36.5, ["From the tower, they dive *under the street,*"]), ("u2", 39.5, ["into a glass cable, as *flashes of light.*"]),
     ("r1", 44.4, ["Every *router* reads the address,"]), ("r2", 46.7, ["and passes the packet *one step closer.*"]), ("r3", 50.5, ["If one road is jammed, it picks *another.*"]),
     ("s1", 56.5, ["Then the *land runs out.*"]), ("s2", 59.2, ["So the cable keeps going, straight *into the sea.*"]),
     ("b1", 65.9, ["*Three kilometres* down, in the dark,"]), ("b2", 68.5, ["the light races along the *sea floor,*"]), ("b3", 71.2, ["at *200,000 kilometres* a second."]),
     ("e1", 75.6, ["The light *fades* on the way,"]), ("e2", 77.6, ["so a *repeater* boosts it,", "every *60 to 100* kilometres."]),
     ("c1", 82.2, ["And the cable? About as thick as a *garden hose.*"]), ("c2", 86.4, ["Steel, plastic and copper, *layer on layer,*"]), ("c3", 90.0, ["all to protect a few *glass fibres,*"]), ("c4", 92.8, ["each as thin as a *human hair.*"]),
     ("g1", 97.2, ["Our packet crosses the *Arabian Sea,*", "the *Red Sea,* the *Mediterranean,*", "and reaches *London.*"]), ("g2", 103.4, ["More than *95 percent* of data", "between continents travels this way."]),
     ("t7a", starts[12] + 0.1, ["*Anchors* cut them,"]), ("t7b", starts[12] + 1.9, ["so we lay *hundreds.*"]), ("t7c", starts[12] + 3.5, ["Packets *reroute.*"]),
     ("n1", starts[13] + 0.15, ["All 1,500 packets reach her phone *in a blink.*"]),
     ("t9", starts[14] + 0.4, ["That's how *this video* reached you."]), ("t10", ENDCARD + 0.5, [])]
# ---- music bed: the film's own night theme (96 bpm), made to this length
midi = lambda m: 440 * 2 ** ((m - 69) / 12); beat = 60 / 96
def env(n, a=0.005, r=0.2, shape=4.0): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-shape * t / max(r, 1e-4))
out = np.zeros((N, 2))
def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); s = sig[: j - i] * gain; out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
CH = [[57, 64, 67, 71], [53, 60, 64, 69], [57, 64, 67, 72], [53, 60, 64, 69], [55, 62, 65, 71], [52, 59, 64, 67]]
for j in range(int(DUR / 2.5) + 1):
    L = int(2.8 * SR); tt = np.arange(L) / SR
    for k, m in enumerate(CH[j % 6]):
        f = midi(m); tone = sum(np.sin(2 * np.pi * f * (1 + d) * tt) for d in (-0.003, 0, 0.003)) / 3
        place(tone * np.minimum(1, tt / 0.6) * np.minimum(1, (2.8 - tt) / 0.5).clip(0), j * 2.5, 0.045, (k - 1.5) * 0.4)
motif = [69, 76, 72, 76, 69, 76, 74, 76, 65, 72, 69, 72, 65, 72, 71, 72]
UNDER = (starts[8], starts[10])      # on the sea floor the plucks and the kick drop out, leaving the pad
for i in range(int(DUR / (beat / 2))):
    at = i * beat / 2
    if UNDER[0] < at < UNDER[1] or at > DUR - 2.6: continue
    L = int(0.5 * SR); tt = np.arange(L) / SR; f = midi(motif[i % 16] + 12)
    place((np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * env(L, 0.002, 0.35, 5), at, 0.05, 0.35 if i % 2 else -0.35)
for q in range(int(DUR / beat)):
    at = q * beat
    if UNDER[0] < at < UNDER[1] or at > DUR - 2.6: continue
    L = int(0.4 * SR); tt = np.arange(L) / SR; place(np.sin(2 * np.pi * (42 + 70 * np.exp(-tt * 28)) * tt) * env(L, 0.002, 0.3, 6), at, 0.32)
out *= 0.5
# ---- narration, music ducked under each line; no line starts before the one before it has finished
subs = []; prev_end = 0.0
for name, at, pieces in V:
    path = f"voice/{name}.wav" if name.startswith("t") else f"voice/short/{name}.wav"; a, sr = sf.read(path); a = np.interp(np.arange(len(a) * 2) / 2, np.arange(len(a)), a)
    if at < prev_end + 0.12: print("pushed", name, at, "->", round(prev_end + 0.12, 2)); at = prev_end + 0.12
    i = int(at * SR); n = min(len(a), N - i); pad = int(0.12 * SR); lo, hi = max(0, i - pad), min(N, i + n + pad)
    duck = np.full(hi - lo, 0.5); k = min(pad, (hi - lo) // 2); duck[:k] = np.linspace(1, 0.5, k); duck[-k:] = np.linspace(0.5, 1, k); out[lo:hi] *= duck[:, None]
    out[i:i + n] += np.stack([a[:n], a[:n]], 1) * 0.92; d = len(a) / SR; prev_end = at + d
    tot = sum(len(p.replace("*", "")) for p in pieces) or 1; c = at
    for p in pieces: w = d * len(p.replace("*", "")) / tot; subs.append([round(c, 2), round(c + w + (0.25 if p is pieces[-1] else 0), 2), p]); c += w
# ---- effects
def put(sig, at, g=1.0): place(sig, at, g * np.sqrt(2))
def t(d): return np.arange(int(d * SR)) / SR
def fx(x, a=0.004, r=4.0): n = len(x); return x * np.minimum(1, np.arange(n) / (a * SR)) * np.exp(-r * np.arange(n) / n)
def noise(d, k=24): w = rng.standard_normal(int(d * SR)); return np.convolve(w, np.ones(k) / k, 'same')
def whoosh(at, d=0.5, g=0.4, k=24): x = t(d); put(noise(d, k)[:len(x)] * np.sin(np.pi * x / d) ** 2, at, g)
def ding(at, f0=1318, g=0.18): x = t(0.9); put(fx(np.sin(2 * np.pi * f0 * x) + 0.5 * np.sin(2 * np.pi * f0 * 1.5 * x), r=6), at, g)
def blip(at, f0, g=0.07, d=0.05): x = t(d); put(fx(np.sin(2 * np.pi * f0 * x), r=5), at, g)
def rumble(at, d, g): x = t(d); put(noise(d, 400)[:len(x)] * np.minimum(1, x / 0.4) * np.clip((d - x) / 0.6, 0, 1), at, g)
def engine(at, d, g): x = t(d); put(noise(d, 90)[:len(x)] * np.sin(np.pi * x / d) ** 1.5 * (1 + 0.3 * np.sin(2 * np.pi * 38 * x)), at, g)
for s in starts[1:]: whoosh(s - 0.22, 0.45, 0.22)
S = starts
engine(S[0] + 3.2, 3.2, 0.5); engine(S[1], 2.8, 0.4)                                   # runway, then in the air
for i in range(3): blip(S[1] + 5.2 + i * 0.12, 880 + 220 * i, 0.06, 0.08)             # the dot reaches London
P = S[4]; blip(P + 1.45, 1500, 0.1, 0.07); whoosh(P + 1.6, 0.5, 0.25)                 # send
for i in range(40): blip(P + 2.0 + i * 0.07, 1700 + 130 * (i % 6), 0.045, 0.03)       # packets pouring out
ding(P + 5.2, 1568, 0.12)
for i in range(10): x = t(0.5); put(np.sin(2 * np.pi * (500 + 60 * i) * x) * np.sin(np.pi * x / 0.5) ** 2, P + 6.6 + i * 0.3, 0.035)   # radio waves
U = S[5]; x = t(1.2); put(np.sin(2 * np.pi * (700 - 420 * x / 1.2) * x) * np.sin(np.pi * x / 1.2) * 0.1, U + 1.2); rumble(U + 2.0, 5.5, 0.9)
for i in range(22): blip(U + 2.4 + i * 0.22, 2200 + rng.uniform(0, 900), 0.03, 0.03)
R = S[6]
for i in range(14): blip(R + 0.6 + i * 0.35, 1300 + 240 * (i % 4), 0.045, 0.04)
x = t(0.35); put(np.sin(2 * np.pi * 180 * x) * np.sin(np.pi * x / 0.35), R + 7.3, 0.12)   # the busy road
for i in range(5): blip(R + 8.0 + i * 0.7, 1500 + 150 * i, 0.06)
H = S[7]
for k in range(4): x = t(2.2); put(noise(2.2, 60)[:len(x)] * np.sin(np.pi * x / 2.2) ** 2, H + 0.4 + k * 2.1, 0.35)      # waves on the beach
whoosh(H + 8.6, 0.9, 0.5, 60)                                                                                             # the dive
B = S[8]; rumble(B, 9.8 + 6.5 + 15.0, 1.3)                                                                                # deep water under three scenes
x = t(3.6); put(np.sin(2 * np.pi * (200 + 500 * (x / 3.6) ** 2) * x) * np.sin(np.pi * x / 3.6) * 0.09, B + 2.9); whoosh(B + 3.0, 3.4, 0.4, 14)   # the light runs
for i in range(26): x = t(0.08); put(fx(np.sin(2 * np.pi * (500 + rng.uniform(0, 900) + 2500 * x) * x), r=5), B + rng.uniform(0, 30), 0.045)     # bubbles
E_ = S[9]; x = t(0.9); put(np.sin(2 * np.pi * (300 + 900 * x / 0.9) * x) * np.sin(np.pi * x / 0.9) * 0.12, E_ + 2.6); ding(E_ + 3.4, 1976, 0.1)   # the boost
C = S[10]
for k_, at in enumerate([3.6, 5.6, 7.6, 9.6, 11.4]): whoosh(C + at, 0.4, 0.22); blip(C + at + 0.3, 900 + 160 * k_, 0.06, 0.08)      # layers peel away
G = S[11]; x = t(2.4); put(np.sin(2 * np.pi * (220 + 380 * (x / 2.4) ** 2) * x) * np.sin(np.pi * x / 2.4) * 0.09, G + 3.4)
for i in range(30): blip(G + 4.3 + i * 0.05, 1500 + 110 * (i % 7), 0.03, 0.04)
ding(G + 6.5, 1318, 0.14)
K = S[12]; x = t(1.9); put(noise(1.9, 400)[:len(x)] * np.minimum(1, x / 0.2), K, 1.3)                                  # anchor drag and the snap
for i in range(11): x = t(0.06); put(fx(np.sin(2 * np.pi * (2100 + rng.uniform(-300, 900)) * x) + 0.4 * rng.standard_normal(len(x)), r=6), K + 0.05 + i * 0.075, 0.07)
x = t(0.5); put(fx(rng.standard_normal(len(x)), a=0.001, r=14) * 0.6 + fx(np.sin(2 * np.pi * (70 * np.exp(-x * 9) + 40) * x), r=5) * 0.9, K + 1.0)
for i in range(18): blip(K + 2.0 + i * 0.05, 900 + 60 * i, 0.035, 0.04)
for i in range(16): blip(K + 3.3 + i * 0.09, 1200 + 260 * (i % 5), 0.06)
ding(S[13] + 1.2, 1175, 0.18); ding(S[13] + 1.35, 1760, 0.1)                                                           # it lands on her phone
ding(S[14] + 0.85, 1318, 0.2); ding(S[14] + 1.0, 1976, 0.12); whoosh(ENDCARD - 0.1, 0.6, 0.35)
out[:int(0.4 * SR)] *= np.linspace(0, 1, int(0.4 * SR))[:, None]; out[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))[:, None]
ab = np.abs(out); out = np.where(ab > 0.75, np.sign(out) * (0.75 + 0.15 * np.tanh((ab - 0.75) / 0.15)), out)
sf.write('v3/public/short-mix.wav', out.astype(np.float32), SR)
json.dump({"dur": DUR, "endcard": ENDCARD, "segs": [[c, a, b, s] for (c, a, b), s in zip(SEGS, starts)], "subs": subs}, open('v3/src/v4/short-plan.json', 'w'), indent=1)
print("length", DUR, "peak", round(float(np.abs(out).max()), 3))
