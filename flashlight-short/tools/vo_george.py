"""Narration with ElevenLabs "George" (premade voice): one WAV per line in public/vo, plus public/vo/vo.json
with each line's length and word timings (for captions).  Usage: python3 tools/vo_george.py
Lines come from tools/vo_lines.json. Each line is sent with its neighbours so the read flows.
Audio is cached in tools/vo_cache by text + voice + settings, so a re-run only pays for lines that changed.
The API key is supplied by the environment's proxy; the header value here is a placeholder."""
import base64, hashlib, json, pathlib, subprocess, urllib.request
VOICE = "JBFqnCBsd6RMkjVDRZzb"        # George: warm, steady British storyteller
MODEL = "eleven_multilingual_v2"
SET = {"stability": 0.45, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": True, "speed": 1.08}
ROOT = pathlib.Path(__file__).resolve().parent.parent; OUT = ROOT / "public/vo"; CACHE = ROOT / "tools/vo_cache"
OUT.mkdir(parents=True, exist_ok=True); CACHE.mkdir(exist_ok=True)
J = json.load(open(ROOT / "tools/vo_lines.json")); order, text = J["order"], J["text"]
res, spent = {}, 0
for i, n in enumerate(order):
    key = hashlib.sha1(json.dumps([text[n], VOICE, MODEL, SET], sort_keys=True).encode()).hexdigest()[:16]; js = CACHE / f"{key}.json"
    if not js.exists():
        body = {"text": text[n], "model_id": MODEL, "voice_settings": SET}
        if i: body["previous_text"] = text[order[i - 1]]
        if i + 1 < len(order): body["next_text"] = text[order[i + 1]]
        rq = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128", json.dumps(body).encode(),
                                    {"xi-api-key": "placeholder", "Content-Type": "application/json"})
        js.write_bytes(urllib.request.urlopen(rq, timeout=120).read()); spent += len(text[n])
    d = json.load(open(js)); al = d["alignment"]
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    t0 = max(0.0, st[0] - 0.03); t1 = en[-1] + 0.12
    mp3 = CACHE / f"{key}.mp3"; mp3.write_bytes(base64.b64decode(d["audio_base64"]))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-af", f"atrim={t0}:{t1},asetpts=PTS-STARTPTS,loudnorm=I=-16:TP=-1.5", "-ar", "44100", "-ac", "1", str(OUT / f"{n}.wav")], check=True)
    # words with start/end (seconds from the start of the trimmed line)
    words, cur, ws = [], "", None
    for c, a, b in zip(chars, st, en):
        if c.isspace():
            if cur: words.append({"w": cur, "s": round(ws - t0, 3), "e": round(we - t0, 3)}); cur = ""
            continue
        if not cur: ws = a
        cur += c; we = b
    if cur: words.append({"w": cur, "s": round(ws - t0, 3), "e": round(we - t0, 3)})
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(OUT / f"{n}.wav")]))
    res[n] = {"text": text[n], "len": round(dur, 3), "words": words}
json.dump(res, open(OUT / "vo.json", "w"), indent=1)
print("characters sent:", spent, {n: res[n]["len"] for n in order}, "total", round(sum(r["len"] for r in res.values()), 2))
