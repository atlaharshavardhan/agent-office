"""Door sounds, synthesized -> public/sfx/rattle.wav   Usage: python3 tools/make_sfx_door.py
rattle: a lever handle clacking against its plate: a low wood thump, then three metallic clatters that decay and a short creak."""
import numpy as np, wave, pathlib
SR = 44100; OUT = pathlib.Path(__file__).resolve().parent.parent / "public/sfx"; OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(21)
def t(d): return np.arange(int(SR * d)) / SR
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
d = 0.9; x = t(d); out = np.zeros_like(x)
def hit(at, amp, f0):
    i = int(at * SR); n = int(0.18 * SR); tt = np.arange(n) / SR
    click = rng.normal(0, 1, n) * np.exp(-tt * 380)
    ring = (np.sin(2 * np.pi * f0 * tt) + 0.6 * np.sin(2 * np.pi * f0 * 2.76 * tt) + 0.35 * np.sin(2 * np.pi * f0 * 5.4 * tt)) * np.exp(-tt * 38)
    out[i:i + n] += amp * (0.5 * bp(click, 1500, 9000) + ring)
hit(0.05, 1.0, 1850); hit(0.17, 0.75, 2100); hit(0.27, 0.5, 1700); hit(0.36, 0.3, 2050)
tt = t(0.16); out[:len(tt)] += 0.9 * np.sin(2 * np.pi * 95 * tt) * np.exp(-tt * 28)                    # the door leaf thumps
cr = t(0.35); creak = bp(rng.normal(0, 1, len(cr)), 300, 900) * np.sin(np.pi * cr / 0.35) ** 2 * (0.5 + 0.5 * np.sin(2 * np.pi * 38 * cr))
out[int(0.12 * SR):int(0.12 * SR) + len(cr)] += 0.18 * creak
out = out / np.abs(out).max() * 0.7
with wave.open(str(OUT / "rattle.wav"), "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print("ok")
