"""Part 2 narration in Liam's voice (ElevenLabs, same settings as Part 1: voice TX3LPaxmHKxFdv7VOQHJ, eleven_multilingual_v2, stability 0.3, similarity 0.8, style 0.55, speed 1.12).
One 24 kHz WAV per line in voice/p2/. Uses Harsh's paid ElevenLabs allowance: each line is recorded once, only if the file does not exist yet.
Usage: python make_part2_voice.py [name ...]"""
import json, subprocess, sys, numpy as np, soundfile as sf
from pathlib import Path
OUT = Path(__file__).parent / "p2"; OUT.mkdir(exist_ok=True)
VOICE = "TX3LPaxmHKxFdv7VOQHJ"; SET = {"stability": 0.3, "similarity_boost": 0.8, "style": 0.55, "use_speaker_boost": True, "speed": 1.12}
L = [
 ("s1", "Imagine the movement when you click send."),
 ("s2", "How does it travel to your girlfriend, who is in London?"),
 ("s3", "Let's follow it."),
 ("h1", "Arjun taps send."),
 ("h2", "A second later, Meera's phone buzzes, in London."),
 ("h3", "How does a photo cross an ocean that fast?"),
 ("n1", "The photo races under the sea at two hundred thousand kilometres a second."),
 ("b1", "First, his phone cuts the photo into about two thousand small packets."),
 ("b2", "Radio to the nearest tower, then glass cable under the street."),
 ("b3", "Routers pass each packet along. Road jammed? Another path."),
 ("b4", "Then the land ends, and the cable goes into the sea."),
 ("b5", "Three kilometres down, the packets are just light."),
 ("b6", "A repeater boosts the fading light."),
 ("b7", "The whole trip, Hyderabad to London, takes light about sixty-five milliseconds."),
 ("b8", "Her phone puts the packets back in order, and the photo appears."),
 ("e1", "That's how a photo crosses an ocean. Follow for more."),
]
def say(text, prev, nxt):
    body = {"text": text, "model_id": "eleven_multilingual_v2", "voice_settings": SET, "previous_text": prev, "next_text": nxt}
    r = subprocess.run(["curl", "-sS", "-m", "90", "-f", f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=pcm_24000", "-H", "xi-api-key: dummy", "-H", "Content-Type: application/json", "-d", json.dumps(body)], capture_output=True)
    if r.returncode: raise SystemExit("ElevenLabs request failed: " + r.stderr.decode()[:300])
    a = np.frombuffer(r.stdout, dtype="<i2").astype(np.float64) / 32768; loud = np.where(np.abs(a) > 0.012)[0]
    a = a[max(0, loud[0] - 480): loud[-1] + 1200]; return a * (0.073 / a.std())
want = sys.argv[1:]; chars = 0; log = {}
for i, (name, text) in enumerate(L):
    f = OUT / f"{name}.wav"
    if (want and name not in want) or (not want and f.exists()):
        if f.exists(): log[name] = round(len(sf.read(f)[0]) / 24000, 2)
        continue
    a = say(text, L[i - 1][1] if i else "", L[i + 1][1] if i + 1 < len(L) else ""); chars += len(text)
    sf.write(f, a, 24000); log[name] = round(len(a) / 24000, 2); print(name, log[name], text)
print("characters used:", chars); json.dump(log, open(OUT / "durations.json", "w"))
