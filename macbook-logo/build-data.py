"""Pack the CC BY 4.0 MacBook model (scene.gltf + scene.bin + textures) into one JS file with data URIs,
so the page works from file:// in render.js and on a phone. Output: assets/mbp-data.js (not edited by hand)."""
import base64, json, os
here = os.path.dirname(os.path.abspath(__file__)); d = os.path.join(here, 'assets', 'macbook-pro-13-2020')
g = json.load(open(os.path.join(d, 'scene.gltf')))
b64 = lambda p: base64.b64encode(open(os.path.join(d, p), 'rb').read()).decode()
for b in g['buffers']: b['uri'] = 'data:application/octet-stream;base64,' + b64(b['uri'])
for im in g.get('images', []): im['uri'] = 'data:image/png;base64,' + b64(im['uri'])
open(os.path.join(here, 'assets', 'mbp-data.js'), 'w').write('window.MBP_GLTF = ' + json.dumps(json.dumps(g)) + ';\n')
print('ok', os.path.getsize(os.path.join(here, 'assets', 'mbp-data.js')) // 1024, 'KB')
