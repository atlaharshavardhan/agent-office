"""Small synthesized sound effects (no samples) -> public/sfx/*.wav.   Usage: python3 tools/make_sfx.py
powercut: a relay thunk and the room hum dropping away · pop: a tiny filament flash and crackle · click: a push-switch click"""
import numpy as np, wave, pathlib
SR = 44100; OUT = pathlib.Path(__file__).resolve().parent.parent / "public/sfx"; OUT.mkdir(parents=True, exist_ok=True); rng = np.random.default_rng(3)
def t(d): return np.arange(int(SR * d)) / SR
def save(name, x, peak=0.8):
    x = x / max(1e-9, np.abs(x).max()) * peak
    with wave.open(str(OUT / name), "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
# powercut: hum (50 Hz + harmonics) for 0.25 s, a thunk, then the hum slides down and fades
x = t(1.2); f = np.where(x < 0.25, 100.0, 100.0 * np.exp(-(x - 0.25) * 2.2)); ph = 2 * np.pi * np.cumsum(f) / SR
hum = (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * np.where(x < 0.25, 0.25, 0.25 * np.exp(-(x - 0.25) * 3.5))
thunk = np.zeros_like(x); k = int(0.25 * SR); tt = t(0.25)
thunk[k:k + len(tt)] = (np.sin(2 * np.pi * 70 * tt) * np.exp(-tt * 22) + rng.normal(0, 1, len(tt)) * np.exp(-tt * 90) * 0.4)
save("powercut.wav", hum + thunk)
# pop: a bright tick, a short fizz and a few crackles
x = t(0.6); b = np.sin(2 * np.pi * 2400 * x) * np.exp(-x * 120) + rng.normal(0, 1, len(x)) * np.exp(-x * 14) * 0.35
for at in [0.05, 0.11, 0.19, 0.26]:
    i = int(at * SR); n = int(0.006 * SR); b[i:i + n] += rng.normal(0, 1, n) * 0.8 * np.exp(-np.arange(n) / (0.0015 * SR))
save("pop.wav", b, 0.7)
# click: two short clicks (press, and the contact closing)
x = t(0.2); b = np.zeros_like(x)
for at, a in [(0.0, 1.0), (0.035, 0.6)]:
    i = int(at * SR); n = int(0.012 * SR); tt = np.arange(n) / SR
    b[i:i + n] += a * (np.sin(2 * np.pi * 3200 * tt) + rng.normal(0, 0.6, n)) * np.exp(-tt * 600)
save("click.wav", b, 0.6)
print("ok")
