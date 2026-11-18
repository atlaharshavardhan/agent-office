#!/usr/bin/env python3
"""Build shots.html: the teardown page plus a shot mode (shots.src.js) for the Short's explainer stills.
Usage: python3 build-shots.py   then   VW=1080 VH=1920 Q='&shot=1' node render.js shots.html stills <dir> 30 0 1 2 3 4 5"""
import pathlib
here = pathlib.Path(__file__).parent
page = (here / 'whoop-teardown.html').read_text()
hook = '/* ---------------- Video render hook ---------------- */'
expose = ('if (new URLSearchParams(location.search).has("shot")) window.__T = { scene, camera, renderer, root, ARM, table, BAND, BAND_LOOP, BAND_ENDS, BOTTOM, SENSOR, parts,'
          ' applyExplode, applyMaterials, applyLed, setExplode: v => { explode = v; }, setGlass: v => { glass = v; }, pillow, knitMat, POD, FRAME, METAL_ENV, key, rim, rim2, kick };\n')
assert page.count(hook) == 1
page = page.replace(hook, expose + hook)
old = 'if (RENDER) { applyState(stateAt(0)); draw(); return; }'
assert page.count(old) == 1
page = page.replace(old, 'if (RENDER) { if (!Q.has("shot")) { applyState(stateAt(0)); draw(); } return; }')
page = page.replace('<title>Fitness Band Pod Teardown</title>', '<title>Band Explainer Shots</title>')
page += '\n<script>\n' + (here / 'shots.src.js').read_text() + '\n</script>\n'
(here / 'shots.html').write_text(page)
print('wrote shots.html', len(page))
