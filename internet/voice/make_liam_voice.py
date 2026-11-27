"""Part 1 narration in Liam's voice (ElevenLabs), the expressive style Harsh approved on 26 Nov 2026 (take A).
One 24 kHz WAV per line in voice/liam/, same names as the old Kokoro files. Each line must fit its slot (seconds until the
next line starts); a line that runs over is asked again a little faster. Uses Harsh's ElevenLabs allowance: about 1,300 characters.
Usage: python make_liam_voice.py [name ...]   (no names = every line not recorded yet)"""
import json, subprocess, sys, numpy as np, soundfile as sf
from pathlib import Path
OUT = Path(__file__).parent / "liam"; OUT.mkdir(exist_ok=True)
VOICE = "TX3LPaxmHKxFdv7VOQHJ"; SET = {"stability": 0.3, "similarity_boost": 0.8, "style": 0.55, "use_speaker_boost": True}
L = [  # name, text, slot in seconds
 ("p1", "On is one. Off is zero.", 2.1), ("p2", "Eight blinks make one letter.", 1.95), ("p3", "But hello takes forty blinks.", 1.85), ("p4", "Too slow.", 1.5),
 ("p5c", "So we use a wire.", 2.1), ("p6", "Now it's a billion blinks, every second.", 2.65), ("p6b", "Hello arrives before you blink.", 2.65),
 ("n1", "Then she moves to a hostel. New wire.", 3.0), ("n2", "Then a friend's place. Another wire.", 2.43), ("n3", "Then another!", 1.08), ("n4", "Now the neighbours want to join too.", 1.7),
 ("n5", "So every house plugs into one box:", 2.28), ("m4", "the router.", 0.93), ("m5", "Every house gets a number, like a door number.", 2.85), ("m6", "That's its IP address.", 1.64), ("m7", "The router reads the number and delivers the message.", 2.6),
 ("c1", "Then she moves to another city.", 3.1), ("c2", "One router can't reach that far.", 2.0), ("c3", "So routers connect to other routers,", 2.7), ("c4", "and pass the message along, hop by hop.", 5.0),
 ("a1", "A text is tiny. But what about a photo?", 2.85), ("b1", "Imagine sending it as one big piece. It blocks the whole line.", 3.35), ("b2", "Everyone else has to wait.", 1.9), ("b3", "One small error, and it has to start again.", 2.5),
 ("c1p", "So the internet never sends it in one piece.", 2.3), ("d1", "It cuts the photo into about two thousand small pieces, called packets,", 3.3), ("d2", "each with her address and a number.", 2.1), ("d3", "They share the wires with everyone else.", 2.2),
 ("d4", "Wire busy? Some take another path.", 2.0), ("d5", "One lost? Only that one is sent again.", 2.6), ("d6", "And her phone puts them back in order.", 2.8),
 ("t3", "Then she flies to London.", 1.65), ("z2", "Next: how a photo crosses an ocean.", 2.6), ("t10", "Follow InvisiTech for more.", 3.0)]
def say(text, prev, nxt, speed):
    body = {"text": text, "model_id": "eleven_multilingual_v2", "voice_settings": {**SET, "speed": speed}, "previous_text": prev, "next_text": nxt}
    r = subprocess.run(["curl", "-sS", "-m", "90", "-f", f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=pcm_24000", "-H", "xi-api-key: dummy", "-H", "Content-Type: application/json", "-d", json.dumps(body)], capture_output=True)
    if r.returncode: raise SystemExit("ElevenLabs request failed: " + r.stderr.decode()[:200])
    a = np.frombuffer(r.stdout, dtype="<i2").astype(np.float64) / 32768; loud = np.where(np.abs(a) > 0.012)[0]
    a = a[max(0, loud[0] - 480): loud[-1] + 1200]; return a * (0.073 / a.std())
want = sys.argv[1:]; rep = {}; chars = 0
for i, (name, text, slot) in enumerate(L):
    f = OUT / f"{name}.wav"
    if (want and name not in want) or (not want and f.exists()): continue
    prev = L[i - 1][1] if i else "That's all it is: light, blinking on and off."; nxt = L[i + 1][1] if i + 1 < len(L) else ""
    for speed in (1.12, 1.2):
        a = say(text, prev, nxt, speed); chars += len(text); d = len(a) / 24000
        if d <= slot - 0.05: break
    sf.write(f, a, 24000); rep[name] = (round(d, 2), slot, speed); print(name, round(d, 2), "of", slot, "speed", speed, "" if d <= slot - 0.05 else "  <-- TOO LONG")
print("characters used:", chars)
