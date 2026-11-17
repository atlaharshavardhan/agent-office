"""Alice Short narration v3 (Kokoro am_michael, US). One wav per sentence + sentences.json.
Usage: .venv/bin/python alice/voice/vo_lines.py"""
import json, subprocess
from pathlib import Path
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).parent
ROOT = HERE.parent.parent
S = [  # (scene, spoken)
    (1, "Did a woman U.S. officials suspect of spying for China get close to the most powerful man in A.I.?"),
    (2, "Meet Alice Huang, no relation, former C.E.O. of Megaspeed, a Singapore firm renting out Nvidia computing power."),
    (3, "Bloomberg estimates it imported at least four point six billion dollars of Nvidia hardware."),
    (3, "Its largest client, reports say: Alibaba."),
    (4, "Renting that power abroad wasn't banned. Shipping chips into China was."),
    (4, "Investigators are probing whether chips crossed that line. No charges have been filed."),
    (5, "The New York Times reported officials suspect she worked with Chinese intelligence, and had a relationship with Jensen Huang."),
    (6, "Reuters says he called it routine business."),
    (7, "On November twelfth, he resigned."),
    (8, "China calls the claims groundless. Megaspeed denies wrongdoing."),
    (9, "So, did America's top A.I. tech leak? Nvidia's board says it has no reason to believe so."),
    (10, "Follow Invisi Tech."),
]
k = Kokoro(str(ROOT / "voice/models/kokoro-v1.0.onnx"), str(ROOT / "voice/models/voices-v1.0.bin"))
out = []
for i, (sc, say) in enumerate(S):
    a, sr = k.create(say, voice="am_michael", speed=1.38, lang="en-us")
    raw, f = HERE / f"_raw{i:02d}.wav", HERE / f"s_{i:02d}.wav"
    sf.write(raw, a, sr)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(raw), "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,"
                    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse", str(f)], check=True)
    raw.unlink()
    out.append({"scene": sc, "say": say, "dur": round(sf.info(f).duration, 3)})
json.dump(out, open(HERE / "sentences.json", "w"), indent=1)
print("speech", round(sum(x["dur"] for x in out), 2))
for x in out: print(x["scene"], x["dur"], x["say"][:60])
