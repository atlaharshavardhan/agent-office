"""v1 narration (US English, Michael / Kokoro am_michael), generated per SENTENCE so captions and
scene cuts land exactly; writes voice_v1/s_XX.wav + voice_v1/sentences.json (text, line, duration).
Usage: .venv/bin/python voice_v1/vo_lines.py   (models in voice/models, Apache-2.0)"""
import json, subprocess
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).parent
# (scene line, spoken text, caption text)
S = [
    (1, "In six weeks, Nvidia lost two trillion dollars in market value.", "In six weeks, NVIDIA lost **$2 trillion** in market value."),
    (2, "That's more than all of Meta.", "That’s more than **all of Meta.**"),
    (2, "Not cash. Paper value.", "Not cash. **Paper value.**"),
    (3, "Why so valuable?", "Why so valuable?"),
    (3, "Nvidia makes about eight in ten A.I. chips.", "NVIDIA makes about **8 in 10 AI chips.**"),
    (4, "This year, Big Tech plans to spend over seven hundred billion on A.I.", "This year, Big Tech plans to spend **$700B+ on AI.**"),
    (4, "Nvidia sits at the center.", "NVIDIA sits at **the center.**"),
    (5, "Then, three shocks.", "Then, **three shocks.**"),
    (5, "Voters backed limits on new data centers.", "Voters backed **limits on new data centers.**"),
    (5, "Investors questioned Nvidia funding its own customers.", "Investors questioned NVIDIA **funding its own customers.**"),
    (5, "And CEO Jensen Huang stepped down, amid a board investigation.", "And CEO Jensen Huang **stepped down** amid a board investigation."),
    (6, "From a record five point seven seven trillion, to three point seven six.", "From a record **$5.77T** to **$3.76T.**"),
    (6, "Down thirty-five percent.", "Down **35%.**"),
    (7, "Sales are still growing.", "Sales are **still growing.**"),
    (7, "So, is this an A.I. bubble, or market panic?", "So, is this an **AI bubble,** or **market panic?**"),
    (8, "Follow Invisi Tech.", "Follow InvisiTech."),
]
SPEED = {1: 1.22, 5: 1.24}
k = Kokoro(str(HERE.parent / "voice/models/kokoro-v1.0.onnx"), str(HERE.parent / "voice/models/voices-v1.0.bin"))
out = []
for i, (line, say, cap) in enumerate(S):
    a, sr = k.create(say, voice="am_michael", speed=SPEED.get(line, 1.15), lang="en-us")
    raw, f = HERE / f"_raw{i:02d}.wav", HERE / f"s_{i:02d}.wav"
    sf.write(raw, a, sr)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(raw), "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,"
                    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse", str(f)], check=True)
    raw.unlink()
    out.append({"line": line, "say": say, "cap": cap, "dur": round(sf.info(f).duration, 3)})
json.dump(out, open(HERE / "sentences.json", "w"), indent=1)
print("words", sum(len(x["say"].split()) for x in out), "speech", round(sum(x["dur"] for x in out), 2))
for x in out: print(x["line"], x["dur"], x["say"])
