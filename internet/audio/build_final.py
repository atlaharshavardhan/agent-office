"""FINAL Part 2 build. Run from internet/ after v3/render_final.sh lanes A-D finished and voice/make_part2c|d_voice.py ran.
Makes one clip folder per part (video/rf-<part>), runs each part's mix script on a copy with: new clip folder, new output, NO sound effects (voice + soft pad only, Harsh's rule),
then joins hook + parts with short dissolves."""
import os, re, subprocess, sys
R = 'video/rf'
MAP = {  # part: (script, {clip name: source in rf})
 'c': ('audio/make_part2c_final.py', {'s1': 's1', 'b2': 'b2', 's5': 's5', 's6': 's6', 'pa': 'pa', 'tw': 'tw1', 'ug': 'ug'}),
 'd': ('audio/make_part2d_final.py', {n: n for n in ('rt', 'sh', 'sb', 'rp', 'cb')}),
 'g': ('audio/make_part2g_final.py', {'gl': 'gl'}),
 'i': ('audio/make_part2i_final.py', {'gc': 'gc'}),
 'h': ('audio/make_part2h_final.py', {'tw': 'tw', 'nt': 'nt', 'ar': 'ar', 'en': 'en'}),
}
os.makedirs('video/rf-out', exist_ok=True)
for p, (script, clips) in MAP.items():
    d = f'video/rf-{p}'; os.makedirs(d, exist_ok=True)
    for dst, src in clips.items():
        t = f'{d}/{dst}.mp4'
        if os.path.lexists(t): os.remove(t)
        os.symlink(os.path.abspath(f'{R}/{src}.mp4'), t)
    s = open(script).read()
    s = re.sub(r"D = 'video/[a-z0-9]+'", f"D = '{d}'", s, count=1)
    s = re.sub(r"'video/internet-part2-[a-z0-9-]+\.mp4'", f"'video/rf-out/{p}.mp4'", s)
    m = re.search(r'^def (bass|shutter)\(', s, re.M); assert m, p
    s = s[:m.start()] + 'place = lambda *a, **k: None   # Harsh: no sound effects yet\n' + s[m.start():]
    open(f'audio/_rf_{p}.py', 'w').write(s)
    r = subprocess.run([sys.executable, f'audio/_rf_{p}.py'], capture_output=True, text=True); print(p, r.stdout[-300:], r.stderr[-400:])
