# GCP GPU VM: Scene S1 "Who is Alice Huang?" — approval stills (and, after approval, the 5 s animation)

## A. Stills now (approval gate)
1. cd agent-office && git pull origin claude/nvidia-video && cd nvidia-blender
2. Build the scene + render the 5 review stills on the GPU (1080×1920, Cycles, 64 samples; OPTIX/CUDA is auto-detected):
   .venv/bin/python scripts/s1_alice_mystery.py --stills review/s1/raw --samples 64
   -> review/s1/raw/frame-000.png, -036, -084, -129, -149
3. Add the text overlays with Remotion (spec frame N = Blender frame N+1):
   mkdir -p renders/s1
   for n in 0 36 84 129 149; do cp review/s1/raw/frame-$(printf %03d $n).png renders/s1/f_$(printf %04d $((n+1))).png; done
   cd remotion && npm install && npx remotion browser ensure
   for n in 0 36 84 129 149; do npx remotion still src/index.jsx S1AliceMystery ../review/s1/frame-$(printf %03d $n).png --frame=$n; done
   cd ..
4. Contact sheet:
   .venv/bin/python -c "from PIL import Image; fs=[0,36,84,129,149]; s=Image.new('RGB',(360*5,640)); [s.paste(Image.open('review/s1/frame-%03d.png'%n).convert('RGB').resize((360,640)),(i*360,0)) for i,n in enumerate(fs)]; s.save('review/s1/s1-contact-sheet.jpg',quality=90)"
5. Upload review/s1/frame-*.png and review/s1/s1-contact-sheet.jpg to Drive InvisiTech/Handoff/to-app/s1/
   Reply with: GPU name, seconds per still, the Drive links, and anything that looked wrong.
   STOP here and wait for approval.

## B. Only after approval: full 5 s animation
   .venv/bin/python scripts/render_shot.py blender/s1_alice_mystery.blend renders/s1 --samples 64     (150 frames)
   cd remotion && npx remotion render src/index.jsx S1AliceMystery ../exports/S1-alice-mystery-v1-1080.mp4 --codec=h264 --crf=18
   Check: 1080x1920, 150 frames, 5.0 s. Upload the MP4 to Drive InvisiTech/Handoff/to-app/s1/ and reply with the link.

Rules: S1 only; no Higgsfield; don't change other scenes; don't commit renders/ or node_modules/ (your GitHub key is read-only).
