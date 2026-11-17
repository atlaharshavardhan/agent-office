Render the InvisiTech Short **"The Pillar Paradox"** on this GPU machine: first a **1080p preview**, then **4K only after Harsh approves the preview**. Do not change any scene, text, numbers, timing, voice or audio — only render.

**Source**
- Repo: `github.com/atlaharshavardhan/agent-office`, branch `claude/macbook-logo-short` (latest commit). The repo is private: clone it with my GitHub access.
- Work in `pillar/`. Fonts and three.js come from `phone-teardown/` in the same repo, so clone the whole repo.
- The watermark tool is `macbook-logo/tools/watermark.py` (same repo).

**Everything needed is in the repo**
- `pillar/pillar.html`: the built page, ready to render. It already contains the crowd simulation data (`assets/runs.js`), captions and logo. **Do not rebuild it** and do not re-run the simulation; the numbers on screen must stay exactly as they are.
- `pillar/audio/mix.wav`: the final audio (George's voice + sound effects, no music, no footsteps, −14 LUFS).
- `pillar/pillar.en.srt`: English subtitles.
- Length: 45.0 s at 30 fps = 1350 frames (43 s of content + 2 s InvisiTech end card).

**Setup**
- Node 18+, `npm i playwright`, then `npx playwright install --with-deps chromium`.
- ffmpeg with libx264.
- Python 3 with `pip install numpy pillow`.

**Use the GPU**
- `render.cjs` uses software WebGL unless `GL_ARGS` is set.
- Try `export GL_ARGS="--use-gl=angle --use-angle=vulkan --enable-features=Vulkan --ignore-gpu-blocklist"`, or `--use-angle=gl` for EGL.
- Check it:
  ```
  cd pillar && GL_INFO=1 VW=1080 VH=1920 node render.cjs "$PWD/pillar.html" stills /tmp/chk 30 14 30
  ```
  It must print an NVIDIA/GPU renderer, not "SwiftShader".
- Compare `/tmp/chk/t14.00.jpg` and `t30.00.jpg` with `pillar/stills-v3/t14.00.jpg` and `t31.00.jpg`. Same look: blue stadium seats, dark grid floor, light-blue crowd, red people stuck at the door, dark pillar with a yellow top.
- If the GPU will not work, unset `GL_ARGS`. Software still works, just much slower.

**Step 1: 1080p preview** (in `pillar/`)
1. Render in parallel parts. Use more parts if the machine has many cores and memory, e.g. 8:
   ```
   ./render-parts.sh /tmp/r1080 8 1
   ```
   - Result: `/tmp/r1080/video.mp4`, silent, 1350 frames.
   - Each part logs to `/tmp/r1080/logN.txt`. If a part is missing, re-render only that frame range: `FROM=… TO=… VW=1080 VH=1920 node render.cjs "$PWD/pillar.html" video /tmp/r1080/partN.mp4 30`, then concat again.
   - Run it with `nohup … &` so it survives a closed terminal.
2. Watermark at the right-middle, hidden on the last 2 s (end card):
   ```
   python3 ../macbook-logo/tools/watermark.py /tmp/r1080/video.mp4 /tmp/r1080/wm.mp4 --pos right-middle --margin 40 --opacity 0.55 --size 0.85 --hide-last 2.0
   ```
3. Add the audio:
   ```
   ffmpeg -y -i /tmp/r1080/wm.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "out/Pillar paradox Short (1080p preview).mp4"
   ```
4. Check, then deliver:
   - `ffprobe` must show 1080×1920, 30 fps, 1350 frames, 45.0 s, H.264 yuv420p, AAC 48 kHz.
   - Look at frames at 2, 8, 14, 20.6, 26, 31, 36, 40.5 and 44 s. They must match `pillar/stills-v3/` (same text, numbers and counters), with the watermark at the right-middle and none on the end card. No black or frozen frames.
   - If the file is under 95 MB, commit it with `pillar.en.srt` (copy into `pillar/out/`) to the same branch and push. Also put both in my Google Drive: InvisiTech folder → this video's folder.
   - Tell me the file size and the `ffprobe` results. **Then stop and wait for my OK before 4K.**

**Step 2: 4K, only after I approve the preview**
1. Render natively at 2160×3840 (do NOT upscale). The last argument `2` is the device scale factor: 1080×1920 layout → 2160×3840 pixels.
   ```
   ./render-parts.sh /tmp/r4k 8 2
   ```
2. Watermark and encode at 50 Mbps constant bitrate:
   ```
   python3 ../macbook-logo/tools/watermark.py /tmp/r4k/video.mp4 /tmp/r4k/wm.mp4 --scale 2 --pos right-middle --margin 40 --opacity 0.55 --size 0.85 --hide-last 2.0 --bitrate 50M --cbr
   ```
3. Add the audio:
   ```
   ffmpeg -y -i /tmp/r4k/wm.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest pillar-paradox-4k.mp4
   ```
4. `ffprobe` must show 2160×3840, 30 fps, 1350 frames, 45.0 s, about 50 Mbps, AAC 48 kHz. Compare frames with the 1080p preview: same content.
5. Delivery:
   - The 4K file is over GitHub's 100 MB limit, so do **not** commit it. Put it in my Google Drive (InvisiTech folder → this video's folder).
   - Also make a copy under 100 MB for sharing from my phone:
     ```
     ffmpeg -i pillar-paradox-4k.mp4 -c:v libx264 -preset slow -b:v 18M -maxrate 20M -bufsize 36M -pix_fmt yuv420p -c:a copy -movflags +faststart pillar-paradox-4k-share.mp4
     ```
   - Tell me both file sizes and the `ffprobe` results.
