"""Inline scripts + logo into stadium.html (one file; renders from file:// in render.cjs)."""
import base64, os, re
here = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(here, 'stadium.src.html'), encoding='utf-8').read()
s = re.sub(r'<script src="(assets/[^"]+)"></script>', lambda m: '<script>\n' + open(os.path.join(here, m.group(1)), encoding='utf-8').read() + '\n</script>', s)
s = s.replace('__LOGO__', 'data:image/png;base64,' + base64.b64encode(open(os.path.join(here, 'assets', 'invisitech-logo.png'), 'rb').read()).decode())
js = re.findall(r'<script>\n(.*?)</script>', open(os.path.join(here, 'stadium.src.html'), encoding='utf-8').read(), re.S)[-1]
import subprocess, tempfile
f = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False); f.write(js); f.close()
r = subprocess.run(['node', '--check', f.name], capture_output=True, text=True); os.unlink(f.name)
if r.returncode: raise SystemExit('SYNTAX ERROR in stadium.src.html:\n' + r.stderr)
open(os.path.join(here, 'stadium.html'), 'w', encoding='utf-8').write(s); print('ok', len(s) // 1024, 'KB')
