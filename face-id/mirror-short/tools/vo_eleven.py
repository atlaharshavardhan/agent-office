"""Narration with ElevenLabs: one WAV per line in public/vo + public/vo/lengths.json.
Lines come from tools/vo_lines.json ({"order": [...], "text": {id: text}}).  Usage: python3 tools/vo_eleven.py
Each line is sent with the line before and after it, so the read carries on naturally from one line to the next.
Finished audio is cached in tools/vo_cache by text + voice + settings, so a re-run only pays for lines that changed.
The API key is supplied by the environment's proxy; the header value here is a placeholder."""
import hashlib, json, pathlib, subprocess, urllib.request
VOICE = "TX3LPaxmHKxFdv7VOQHJ"        # Liam: young, energetic, made for short-form narration
MODEL = "eleven_multilingual_v2"
SET = {"stability": 0.35, "similarity_boost": 0.8, "style": 0.45, "use_speaker_boost": True, "speed": 1.15}
ROOT = pathlib.Path(__file__).resolve().parent.parent; OUT = ROOT / "public/vo"; CACHE = ROOT / "tools/vo_cache"; CACHE.mkdir(exist_ok=True)
J = json.load(open(ROOT / "tools/vo_lines.json")); order, text = J["order"], J["text"]
L = json.load(open(OUT / "lengths.json")) if (OUT / "lengths.json").exists() else {}
spent = 0
for i, n in enumerate(order):
    key = hashlib.sha1(json.dumps([text[n], VOICE, MODEL, SET], sort_keys=True).encode()).hexdigest()[:16]; mp3 = CACHE / f"{key}.mp3"
    if not mp3.exists():
        body = {"text": text[n], "model_id": MODEL, "voice_settings": SET}
        if i: body["previous_text"] = text[order[i - 1]]
        if i + 1 < len(order): body["next_text"] = text[order[i + 1]]
        rq = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128", json.dumps(body).encode(),
                                    {"xi-api-key": "placeholder", "Content-Type": "application/json"})
        mp3.write_bytes(urllib.request.urlopen(rq, timeout=120).read()); spent += len(text[n])
    wav = OUT / f"{n}.wav"
    # trim silence at both ends so lines butt together with no gaps, and level the loudness
    af = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,loudnorm=I=-16:TP=-1.5"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-af", af, "-ar", "44100", "-ac", "1", str(wav)], check=True)
    L[n] = round(float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)])), 3)
json.dump(L, open(OUT / "lengths.json", "w"), indent=1); print("characters sent:", spent, {n: L[n] for n in order})
