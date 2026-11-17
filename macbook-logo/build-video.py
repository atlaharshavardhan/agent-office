"""Make logo-video.html: one self-contained file (scripts, model, logo, voice timeline and captions inlined),
so it plays on a phone and renders in render.cjs from file://. Run build-data.py first if the model changes."""
import base64, json, os, re
here = os.path.dirname(os.path.abspath(__file__))
import sys
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'george40'   # V4: george40 = ~40 s timing; voice/george (default) or voice/ (v1, Michael: pass '.')
SRC, OUT = os.environ.get('SRC', 'logo-video.src.html'), os.environ.get('OUT', 'logo-video.html')   # V5: SRC=logo-video-v5.src.html OUT=logo-video-v5.html
src = open(os.path.join(here, SRC), encoding='utf-8').read()
def inline(m):
    return '<script>\n' + open(os.path.normpath(os.path.join(here, m.group(1))), encoding='utf-8').read() + '\n</script>'
out = re.sub(r'<script src="((?:\.\./|assets/)[^"]+)"></script>', inline, src)
logo = base64.b64encode(open(os.path.join(here, 'assets', 'invisitech-logo.png'), 'rb').read()).decode()
tl = json.load(open(os.path.join(here, 'voice', VOICE, 'timeline.json'))); caps = json.load(open(os.path.join(here, 'voice', VOICE, 'captions.json')))
out = out.replace('__LOGO__', 'data:image/png;base64,' + logo).replace('__TL__', json.dumps(tl)).replace('__CAPS__', json.dumps(caps))
open(os.path.join(here, OUT), 'w', encoding='utf-8').write(out)
print('ok', len(out) // 1024, 'KB')
