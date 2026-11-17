# Prompt for the GCP GPU VM — Alice Short, Scene 1 STILLS ONLY

You are on InvisiTech's GCP render VM (NVIDIA GPU). Render 4 approval STILLS of Scene 1 for a YouTube Short. Do NOT render a video.

## 1. Get the project
```bash
git clone -b claude/nvidia-video https://github.com/atlaharshavardhan/agent-office.git
cd agent-office/nvidia-blender
```
(If already cloned: `git fetch origin claude/nvidia-video && git checkout claude/nvidia-video && git pull`.)
Read `alice/SCENE_01.md` — it is the creative brief for this scene.

## 2. Python + Blender (bpy as a pip module, Python 3.13)
```bash
python3.13 -m venv .venv
.venv/bin/pip install bpy==5.3.0 numpy pillow
nvidia-smi   # confirm the GPU is visible
```

## 3. Re-render the hook source frames 30–90 on the GPU (1080×1920)
The scene reuses the existing GPU hook shot (`blender/nvidia_hook.blend`, already committed). Frames are not in git, so render them:
```bash
.venv/bin/python scripts/render_preview.py frames 30 90
ls renders/preview_frames | wc -l     # expect 61 files f_0030.png … f_0090.png
```
`scripts/build_scene.py::detect_device()` picks OPTIX/CUDA automatically. If the log says CPU, enable the GPU in Cycles preferences (OPTIX first, then CUDA) and re-run. Check one frame looks right: chip on motherboard, green → red, red cracks by frame 70+.

## 4. Remotion (Node 20+)
```bash
cd remotion
npm install
npx remotion browser ensure      # downloads Remotion's headless browser if needed
mkdir -p ../alice/stills
for fr in 0 30 60 90; do
  npx remotion still src/index.jsx AliceS1 ../alice/stills/s01_f$(printf %03d $fr).png --frame=$fr
done
```
`remotion/public/hook` is a symlink to `../../renders/preview_frames` — keep it. `remotion.config.js` auto-detects the browser; if WebGL errors appear add `--gl=angle` (or `--gl=swangle`).

## 5. Check before sending
For each still: 1080×1920; headline "WHO GOT CLOSE / TO NVIDIA'S CEO?" fully readable at the top (line 2 green at 0 s, red from ~1.8 s); white pill "ALLEGATIONS · NOT PROVEN" from 1 s; chip in the middle; caption at the bottom; small disclaimer bottom-left; text inside safe margins (left 90 px, right 180 px, top 200 px, bottom 350 px); nothing cut off; no watermark.

## 6. Deliver
- Commit only the 4 PNGs: `git add alice/stills/*.png && git commit -m "Alice Short: scene 1 stills (GCP GPU)" && git push origin claude/nvidia-video`
- Also copy them to Google Drive `InvisiTech/Handoff/alice/scene01/`.
- Reply with: GPU used, render time per hook frame, any problems, and the 4 file paths.

Rules: do not render the full video or 4K; do not change scene code without saying what and why; do not commit `renders/` or `node_modules/`.
