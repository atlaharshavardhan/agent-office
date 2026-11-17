# GCP GPU VM: Alice Short, render Scene 2 + Scene 7 animations (1080×1920, 30 fps)

1. cd agent-office/nvidia-blender && git checkout claude/nvidia-video && git pull origin claude/nvidia-video
   (`git log --oneline -1` must show the "scene 7" commit or newer)
2. Scene 2 (case folder, 135 frames; scene file is final):
   .venv/bin/python scripts/render_shot.py blender/alice_s2_desk.blend renders/alice_s2 --pct 100 --samples 96
3. Scene 7 (Jensen from behind, stage lights switch off; 90 frames; NEW file):
   .venv/bin/python scripts/render_shot.py blender/alice_s7_stage.blend renders/alice_s7 --pct 100 --samples 96
   Check frames 1, 30, 60, 90 first: frame 1 shows him from behind (silver hair, glossy croc-texture
   leather jacket) facing the green NVIDIA wall; lights go out one by one; frame 90 is almost dark with only
   a thin rim on his hair/shoulders. If frame 1 is too dark or too bright, adjust the light energies in
   scripts/alice_s7_stage.py, rebuild (`.venv/bin/python scripts/alice_s7_stage.py`) and say what you changed.
4. Use the GPU (OPTIX/CUDA). Expect 135 + 90 PNGs.
5. Deliver (frames are big, so NOT in git):
   - zip renders/alice_s2 → alice_s2_frames.zip and renders/alice_s7 → alice_s7_frames.zip,
     upload both to Google Drive InvisiTech/Handoff/to-app/
   - commit 4 preview stills per scene: copy f_0001/0030/0060/0090 (s7) and f_0001/0030/0060/0135 (s2) to
     alice/stills/vm_s7_fXXXX.png and alice/stills/vm_s2_fXXXX.png, then
     git add alice/stills/vm_* (+ any script/blend changes) && git commit -m "Alice Short: scenes 2+7 rendered on GPU" && git push origin claude/nvidia-video
   - REQUIRED: run `git log origin/claude/nvidia-video --oneline -1` and paste the output in your reply,
     plus GPU model and seconds per frame.
Rules: no full-video or 4K render; no real photos/faces; don't commit renders/ or node_modules/.
