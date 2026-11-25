"""Small synthesized sound effects (no samples, no whooshes) -> public/sfx/*.wav.   Usage: python3 tools/make_sfx.py
fire: the projector throws its dots (a quick shower of tiny ticks) · scan: the camera / Face ID reading (a rising, pulsing tone)
deny: no match, stays locked (two low buzzes) · ok: match (two-note chime) · unlock: a latch click and a rising three-note chime"""
import numpy as np, wave, pathlib
SR = 44100; OUT = pathlib.Path(__file__).resolve().parent.parent / "public/sfx"; rng = np.random.default_rng(7)
def t(d): return np.arange(int(SR * d)) / SR
def env(x, a=0.005, r=0.08):
    n = len(x); e = np.ones(n); na, nr = int(SR * a), int(SR * r); e[:na] = np.linspace(0, 1, na); e[-nr:] = np.linspace(1, 0, nr); return x * e
def tone(f, d, decay=6.0, harm=0.25): x = t(d); return (np.sin(2 * np.pi * f * x) + harm * np.sin(4 * np.pi * f * x)) * np.exp(-decay * x)
def put(buf, x, at): i = int(SR * at); buf[i:i + len(x)] += x[:len(buf) - i]
def save(name, x):
    x = x / max(1e-9, np.abs(x).max()) * 0.8
    with wave.open(str(OUT / name), "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
# fire: ~70 tiny ticks, dense at first then thinning, each a 3 ms click at a random high pitch
b = np.zeros(int(SR * 1.0)); at = 0.0
for k in range(70):
    at += 0.004 + 0.00022 * k + rng.uniform(0, 0.004)
    if at > 0.9: break
    put(b, env(np.sin(2 * np.pi * rng.uniform(2600, 5200) * t(0.012)) * np.exp(-400 * t(0.012)), 0.0005, 0.004) * (1 - at) , at)
put(b, env(tone(180, 0.25, 14, 0.5), 0.002, 0.1) * 0.5, 0)          # a soft low thud as it fires
save("fire.wav", b)
# scan: tone rising 520 -> 1040 Hz with a fast pulse, then a short confirming blip
x = t(0.7); f = 520 * 2 ** (x / 0.7); ph = 2 * np.pi * np.cumsum(f) / SR
b = np.zeros(int(SR * 0.95)); put(b, env(np.sin(ph) * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 22 * x))), 0.01, 0.06) * 0.6, 0); put(b, env(tone(1320, 0.14, 18), 0.002, 0.05), 0.74)
save("scan.wav", b)
# deny: two low buzzes
bz = lambda d: env(np.sign(np.sin(2 * np.pi * 140 * t(d))) * 0.5 + np.sin(2 * np.pi * 70 * t(d)), 0.004, 0.03)
b = np.zeros(int(SR * 0.5)); put(b, bz(0.13), 0); put(b, bz(0.17), 0.19); save("deny.wav", b)
# ok: two-note chime
b = np.zeros(int(SR * 0.8)); put(b, env(tone(988, 0.3, 7), 0.003, 0.1), 0); put(b, env(tone(1319, 0.6, 5), 0.003, 0.2), 0.11); save("ok.wav", b)
# unlock: latch click, then a rising three-note chime
b = np.zeros(int(SR * 1.2)); put(b, env(rng.normal(0, 1, int(SR * 0.02)) * np.exp(-300 * t(0.02)), 0.0005, 0.008) * 0.9, 0); put(b, env(tone(240, 0.06, 40), 0.001, 0.02) * 0.8, 0.005)
for k, fq in enumerate([784, 988, 1319]): put(b, env(tone(fq, 0.9 - 0.12 * k, 4.5), 0.003, 0.25) * 0.8, 0.07 + 0.085 * k)
save("unlock.wav", b); print("ok")
