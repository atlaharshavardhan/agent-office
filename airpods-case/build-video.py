"""Inline the local scripts and the logo so case-video.html is one self-contained file (works on a phone and in render.js)."""
import os, re, base64, json
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'case-video.src.html'), encoding='utf-8').read()
def inline(m):
    path = os.path.normpath(os.path.join(here, m.group(1)))
    return '<script>\n' + open(path, encoding='utf-8').read() + '\n</script>'
out = re.sub(r'<script src="((?:\.\./|assets/)[^"]+)"></script>', inline, src)
logo = base64.b64encode(open(os.path.join(here, 'assets', 'invisitech-logo.png'), 'rb').read()).decode()
out = out.replace('__LOGO__', 'data:image/png;base64,' + logo)
# voice timeline + captions, once recorded
tl, cp = os.path.join(here, 'voice', 'timeline.json'), os.path.join(here, 'voice', 'captions.json')
pre = ''
if os.path.exists(tl): pre += 'window.__B = %s;' % json.dumps(json.load(open(tl))['B'])
if os.path.exists(cp): pre += 'window.__CAPS = %s;' % json.dumps(json.load(open(cp)))
if pre: out = out.replace('<script>\n(() => {', '<script>' + pre + '</script>\n<script>\n(() => {', 1)
open(os.path.join(here, 'case-video.html'), 'w', encoding='utf-8').write(out)
print('ok', len(out) // 1024, 'KB')
