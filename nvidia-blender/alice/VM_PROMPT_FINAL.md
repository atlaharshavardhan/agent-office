# GCP GPU VM: Alice Short, FINAL video with the GPU frames (1080×1920, 43.7 s)

Your frames are already in nvidia-blender/renders/alice_s2 (135) and renders/alice_s7 (90). Keep them.

1. cd agent-office && git pull origin claude/nvidia-video     (must include the "frames.json: step" commit or newer)
2. cd nvidia-blender
   Tell the edit your frames are every frame (local edit only, don't commit):
   echo '{"alice_s2": {"last": 135, "step": 1}, "alice_s7": {"last": 90, "step": 1}}' > remotion/src/alice/frames.json
3. Audio (voice + music + SFX, already designed):
   .venv/bin/pip install soundfile numpy   (if missing; ffmpeg must be installed)
   .venv/bin/python alice/audio/mix.py      -> remotion/public/audio/alice_mix.wav
4. Video:
   cd remotion && npm install && npx remotion browser ensure
   npx remotion render src/index.jsx AliceMain ../exports/alice-huang-nvidia-1080-gpu.mp4 --codec=h264 --crf=18 --audio-bitrate=192k
   (if WebGL errors: add --gl=angle)
5. Check: ffprobe shows 1080x1920, 1311 frames, ~43.7 s; scene 2 (5-11 s) shows the case folder, scene 7 (32-33.7 s) the empty chair.
6. Upload exports/alice-huang-nvidia-1080-gpu.mp4 to Drive InvisiTech/Handoff/to-app/ and reply with the link.
   (Don't commit it; your GitHub key is read-only.)
