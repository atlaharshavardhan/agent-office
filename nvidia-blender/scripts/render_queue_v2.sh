#!/bin/bash
# V2 Blender render queue (resumable). Slow shots render every 2nd frame; Remotion blends between them.
cd "$(dirname "$0")/.."
PY=.venv/bin/python
$PY scripts/render_shot.py blender/v2_stage.blend renders/v2_stage --pct 67 --samples 12
$PY scripts/render_shot.py blender/shot03_datacenter.blend renders/shot03 1 45 --pct 67 --samples 16
$PY scripts/render_shot.py blender/v2_meeting.blend renders/v2_meeting --pct 67 --samples 12 --step 2
$PY scripts/render_shot.py blender/v2_trading.blend renders/v2_trading --pct 67 --samples 12 --step 2
$PY scripts/render_shot.py blender/v2_build.blend renders/v2_build --pct 67 --samples 12 --step 2
$PY scripts/render_shot.py blender/v2_overlook.blend renders/v2_overlook --pct 67 --samples 12 --step 2
echo QUEUE_DONE
