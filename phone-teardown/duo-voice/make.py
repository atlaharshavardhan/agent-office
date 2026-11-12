"""Hindi / Telugu voiceovers for the iPhone Duo Reel with Sarvam bulbul:v3 (speaker shubh, 48 kHz).
master = pace 1.0 (locked setting); fit = one uniform Sarvam pace per language so the lines land on the English cues."""
import json, urllib.request, urllib.error, base64, subprocess, os, sys, math, time
L = json.load(open('lines.json'))
EDIT = {'hi': {9: "Hundred से ज़्यादा parts, gears और springs, 3D-printed titanium cover के नीचे।", 16: "और videos के लिए InvisiTech को follow करो।"},
        'te': {6: "ఇందులో దాదాపు ten thin layers.", 7: "Paper stack లాగా, bend అయినప్పుడు layers ఒకదానిపై ఒకటి slide అవుతాయి, అందుకే ఏదీ విరగదు.",
               9: "Hundred కి పైగా parts, gears, springs, 3D-printed titanium cover కింద.", 12: "కానీ same spot ని మళ్ళీ మళ్ళీ bend చేస్తే, అది perfect గా flat అవ్వదు.",
               16: "మరిన్ని videos కోసం InvisiTech ని follow చేయండి."}}
VIDEO = 46.8
def tts(text, lang, pace, path):
    body = {"text": text, "target_language_code": lang + '-IN', "speaker": "shubh", "model": "bulbul:v3", "speech_sample_rate": 48000, "pace": pace}
    for attempt in range(8):   # Sarvam rate-limits bursts: wait and retry
        try:
            req = urllib.request.Request('https://api.sarvam.ai/text-to-speech', data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
            open(path, 'wb').write(base64.b64decode(json.loads(urllib.request.urlopen(req, timeout=120).read())['audios'][0])); break
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 7: raise
            time.sleep(5 * (attempt + 1))
    time.sleep(0.6)
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]))
def place(durs):
    t, out = 0, []
    for i, l in enumerate(L):
        st = l['start'] if i == 0 else max(l['start'], t + 0.12); out.append(round(st, 3)); t = st + durs[i]
    return out, t
def master(lang, tag, durs, starts):
    d = f'{lang}_{tag}'; ins, flt = [], []
    for i, p in enumerate(starts):
        ins += ['-i', f'{d}/{i+1:02d}.wav']; ms = int(p * 1000); flt.append(f'[{i}:a]aresample=48000,adelay={ms}|{ms}[a{i}]')
    end = max(VIDEO, starts[-1] + durs[-1] + 0.4)
    raw = f'{d}/_mix.wav'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(flt) + ';' + ''.join(f'[a{i}]' for i in range(len(starts))) + f'amix=inputs={len(starts)}:normalize=0,apad,atrim=0:{end:.3f},pan=stereo|c0=c0|c1=c0[o]', '-map', '[o]', raw], check=True)
    I = float([x for x in subprocess.check_output(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'ebur128', '-f', 'null', '-'], stderr=subprocess.STDOUT).decode().split('Summary')[-1].splitlines() if 'I:' in x][0].split()[1])
    name = f'InvisiTech_iPhone-Duo_{lang}' + ('' if tag == 'master' else '_fit')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-af', f'volume={-14 - I:.2f}dB,alimiter=limit=0.84', '-ar', '48000', '-c:a', 'pcm_s24le', name + '.wav'], check=True)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', name + '.wav', '-c:a', 'libmp3lame', '-b:a', '192k', name + '.mp3'], check=True)
    return name, end
report = json.load(open('report.json')) if os.path.exists('report.json') else {}
for lang in (sys.argv[1:] or ['hi', 'te']):
    texts = [EDIT[lang].get(i, l[lang]) for i, l in enumerate(L)]
    for tag, pace in (('master', 1.0),):
        os.makedirs(f'{lang}_{tag}', exist_ok=True)
        durs = [tts(t, lang, pace, f'{lang}_{tag}/{i+1:02d}.wav') for i, t in enumerate(texts)]
        starts, end = place(durs); name, _ = master(lang, tag, durs, starts)
    # one uniform pace so the last line ends inside the video
    need = (end - L[0]['start']) / (VIDEO - 0.6 - L[0]['start']); pace = round(min(1.3, max(1.0, math.ceil(need * 20) / 20)), 2)
    while True:
        os.makedirs(f'{lang}_fit', exist_ok=True)
        fd = [tts(t, lang, pace, f'{lang}_fit/{i+1:02d}.wav') for i, t in enumerate(texts)]
        fs, fend = place(fd)
        if fend <= VIDEO - 0.3 or pace >= 1.3: break
        pace = round(pace + 0.05, 2)
    fname, _ = master(lang, 'fit', fd, fs)
    drift = max(round(s - l['start'], 2) for s, l in zip(fs, L))
    report[lang] = {'texts': texts, 'master_end': round(end, 2), 'fit_pace': pace, 'fit_end': round(fend, 2), 'fit_max_late': drift}
    print(lang, report[lang]['master_end'], 'fit pace', pace, 'fit ends', round(fend, 2), 'max late vs English cue', drift)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', '../iphone-duo-reel-v4.mp4', '-i', fname + '.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', f'preview_iPhone-Duo_{lang}.mp4'], check=True)
    json.dump(report, open('report.json', 'w'), ensure_ascii=False, indent=1)
