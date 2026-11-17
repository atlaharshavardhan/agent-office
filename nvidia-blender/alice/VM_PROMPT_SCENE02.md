# Prompt for the GCP GPU VM: Alice Short, Scene 2 STILLS ONLY

You are on InvisiTech's GCP render VM (NVIDIA GPU). Render 4 approval STILLS of Scene 2. Do NOT render the full animation yet.

Scene: a dark desk lit by one warm desk lamp. A kraft case folder slides in (frames 1-24) and its cover opens (frames 30-58), showing a
profile card: a blank silhouette with "?" (no face), "ALICE HUANG · Former CEO, Megaspeed · Singapore-based NVIDIA customer ·
No relation to Jensen Huang", status "U.S. probes ongoing · No charges filed", and a red "NOT PROVEN" box. Our 3D GPU lies on the desk
top-right. The camera slowly pushes in over the folder. 135 frames, 30 fps, 1080×1920.

1. Update the project (it is already cloned from Scene 1; otherwise clone branch claude/nvidia-video):
   cd agent-office/nvidia-blender && git fetch origin claude/nvidia-video && git checkout claude/nvidia-video && git pull
   .venv/bin/pip install pillow    (if missing)

2. The scene file is committed: blender/alice_s2_desk.blend. To rebuild it: .venv/bin/python scripts/alice_s2_desk.py

3. Render the stills on the GPU at full resolution (frames 1, 30, 60, 135):
   mkdir -p alice/stills
   for fr in 1 30 60 135; do
     .venv/bin/python scripts/render_still_frame.py blender/alice_s2_desk.blend alice/stills/s02_f$(printf %03d $fr).png $fr 128
   done
   Make sure Cycles uses the GPU (OPTIX or CUDA), not the CPU.

4. Check each still:
   - Frame 1: the folder is entering at the top; the desk and lamp glow read.
   - Frame 30: the folder is on the desk, closed, with the red tab visible.
   - Frame 60: the cover is open and the card text is readable.
   - Frame 135: closer; the card fills the middle of the frame and the name and "NOT PROVEN" are readable.
   - Nothing important sits in the top 200 px or the bottom 350 px. Fix exposure if the frames are too dark or blown out
     (lamp spot energy in the script is LampSpot 9.0e4); say what you changed.

5. Optional, if this VM has internet access: improve realism with free CC0 models from Poly Haven
   (https://polyhaven.com, API https://api.polyhaven.com/assets?t=models), e.g. a desk lamp, a pen, or a coffee mug.
   Use CC0 only, record each asset name and URL in ASSET_LICENSES.md, and keep the layout the same.

6. Deliver:
   - git add alice/stills/s02_*.png (plus any script, blend or licence changes) && git commit -m "Alice Short: scene 2 stills (GCP GPU)"
     && git push origin claude/nvidia-video
   - Copy the stills to Google Drive InvisiTech/Handoff/alice/scene02/
   - Reply with: the GPU used, seconds per frame, the changes made, and the file paths.

Rules: no full-animation or 4K render yet; never add a real photo or face of any real person; do not commit renders/ or node_modules/.
