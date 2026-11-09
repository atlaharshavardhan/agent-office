"""Generate George (Kokoro bm_george) lines, one WAV per line, and print durations.
Usage: python gen.py lines.txt outdir   (one line of narration per text line)"""
import sys, json, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
lines = [l.strip() for l in open(sys.argv[1]) if l.strip()]
out = sys.argv[2]
meta = []
for i, text in enumerate(lines, 1):
    samples, sr = k.create(text, voice="bm_george", speed=1.0, lang="en-gb")
    path = f"{out}/l{i:02d}.wav"
    sf.write(path, samples, sr)
    meta.append({"line": i, "text": text, "file": path, "seconds": round(len(samples) / sr, 3)})
    print(f"{i:02d} {len(samples)/sr:5.2f}s  {text}")
json.dump(meta, open(f"{out}/lines.json", "w"), indent=1)
