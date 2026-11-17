#!/bin/bash
# Blender render queue for nvidia-market-collapse v1 (resumable: finished frames are skipped).
cd "$(dirname "$0")/.."
PY=.venv/bin/python
[ -f renders/stills/scene05a_datacenter_red.png ] || $PY scripts/render_shot.py blender/still05a_datacenter_red.blend renders/stills/scene05a_datacenter_red.png --still --samples 40
[ -f renders/stills/scene05c_boardroom.png ] || $PY scripts/render_shot.py blender/still05c_boardroom.blend renders/stills/scene05c_boardroom.png --still --samples 40
$PY scripts/render_shot.py blender/shot03_datacenter.blend renders/shot03 --pct 67 --samples 16
$PY scripts/render_shot.py blender/shot07_orbit.blend renders/shot07 --pct 67 --samples 16
echo QUEUE_DONE
