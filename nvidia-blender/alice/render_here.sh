#!/bin/bash
# Render the two Alice animations on this machine (CPU): 67% res, every 2nd frame (Remotion blends between).
cd "$(dirname "$0")/.."
PY=.venv/bin/python
$PY scripts/render_shot.py blender/alice_s7_stage.blend renders/alice_s7 --pct 67 --samples 20 --step 2
$PY scripts/render_shot.py blender/alice_s2_desk.blend renders/alice_s2 --pct 67 --samples 20 --step 2
echo ALICE_RENDER_DONE
