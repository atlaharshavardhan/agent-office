"""Inline the local scripts so ear-video.html is one self-contained file (works on a phone and in render.js)."""
import os, re
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'ear-video.src.html'), encoding='utf-8').read()
def inline(m):
    path = os.path.normpath(os.path.join(here, m.group(1)))
    return '<script>\n' + open(path, encoding='utf-8').read() + '\n</script>'
out = re.sub(r'<script src="((?:\.\./|assets/)[^"]+)"></script>', inline, src)
assert '../' not in re.findall(r'<script src="([^"]+)"', out).__str__()
import base64
logo = base64.b64encode(open(os.path.join(here, 'assets', 'invisitech-logo.png'), 'rb').read()).decode()
out = out.replace('__LOGO__', 'data:image/png;base64,' + logo)
open(os.path.join(here, 'ear-video.html'), 'w', encoding='utf-8').write(out)
print('ok', len(out) // 1024, 'KB')
