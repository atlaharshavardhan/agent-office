Render the InvisiTech MacBook glowing-logo Short **V5.5** in **4K** on this GPU machine. Do not change any scene, text, timing, voice or audio — only render at 4K.

**Source**
- Repo: `github.com/atlaharshavardhan/agent-office`, branch `claude/macbook-logo-short`, at commit `54bcd8b` or later.
- Work in `macbook-logo/`. Fonts and three.js come from `phone-teardown/` in the same repo, so clone the whole repo.
- Clone it with my GitHub access. The repo is private.

**Everything needed is in the repo**
- The 3 photos: `macbook-logo/higgsfield/still1_hook.png`, `still2_cafe.png`, `still3_bedroom.png`.
- The InvisiTech logo (`assets/invisitech-logo.png`).
- Chris's voice and the final audio mix (`voice/chris_v5/`, `audio/mix_chris_v5.wav`).
- The fonts and three.js, in `phone-teardown/`.
- Tested from a fresh clone: renders at 2160×3840 with the photo inserts.

**Setup**
- Node 18+, `npm i playwright`, then `npx playwright install --with-deps chromium`.
- ffmpeg with libx264.
- Python 3 with `pip install numpy pillow fonttools soundfile scipy`.

**Use the GPU**
- `render.cjs` uses software WebGL unless `GL_ARGS` is set.
- Try `export GL_ARGS="--use-gl=angle --use-angle=vulkan --enable-features=Vulkan --ignore-gpu-blocklist"`, or `--use-angle=gl` for EGL.
- Check it with:
  ```
  cd macbook-logo && GL_INFO=1 VW=1080 VH=1920 DSF=2 node render.cjs "$PWD/logo-video-v5.html" stills /tmp/chk 30 20
  ```
  It should print an NVIDIA/GPU renderer, not "SwiftShader".
- If the GPU will not work, unset `GL_ARGS`. Software rendering still works, just slower.
- Compare `/tmp/chk/t20.00.jpg` with a software-rendered one. They must look the same: same lighting, no missing glow.

**Steps** (in `macbook-logo/`)
1. **Do not rebuild the page.** `logo-video-v5.html` is committed, ready to render, and already contains the MacBook 3D model. The model's separate source file is not in the repo, so `build-video.py` would fail.
2. Render natively at 2160×3840 (do NOT upscale), in parallel parts:
   ```
   HTML=logo-video-v5.html VOICE=chris_v5 ./render-parts.sh /tmp/r4k 4 2
   ```
   - The last argument `2` is the device scale factor: 1080×1920 layout → 2160×3840 pixels.
   - Use more parts if the machine has many cores and memory.
   - Result: `/tmp/r4k/video.mp4`, 1125 frames, 37.5 s, silent.
3. Photo inserts (the tool reads the video size, so it works at 4K):
   ```
   python3 tools/real_inserts.py /tmp/r4k/video.mp4 /tmp/r4k/ins.mp4 voice/chris_v5
   ```
4. Watermark plus a 50 Mbps constant-bitrate encode:
   ```
   python3 tools/watermark.py /tmp/r4k/ins.mp4 /tmp/r4k/wm.mp4 --scale 2 --pos right-middle --margin 40 --opacity 0.55 --size 0.85 --hide-last 2.0 --bitrate 50M --cbr
   ```
5. Add the audio (already mixed, -14 LUFS):
   ```
   ffmpeg -y -i /tmp/r4k/wm.mp4 -i audio/mix_chris_v5.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest macbook-logo-glow-v5.5-4k.mp4
   ```

**Check before delivering**
- `ffprobe` must show:
  - 2160×3840, 30 fps, 1125 frames, 37.5 s
  - H.264, yuv420p, about 50 Mbps
  - AAC 48 kHz
- Look at frames at 0.5, 3, 5, 15, 20, 26, 29.6, 31, 33, 36.5 s and compare them with `macbook-logo-glow-v5.5-1080.mp4` (in the repo):
  - same content
  - photo inserts at 0–1.2 s and 29.5–32.5 s
  - watermark at the right-middle, gone on the last 2 s
  - no black frames, no missing glow

**Deliver**
- The file is about 230 MB, over GitHub's 100 MB limit, so do **not** commit it.
- Put it in my Google Drive: InvisiTech folder → this video's folder.
- Also make a sub-100 MB copy for phone sharing:
  ```
  ffmpeg -i macbook-logo-glow-v5.5-4k.mp4 -c:v libx264 -preset slow -b:v 18M -maxrate 20M -bufsize 36M -pix_fmt yuv420p -c:a copy -movflags +faststart macbook-logo-glow-v5.5-4k-share.mp4
  ```
- Tell me both file sizes and the `ffprobe` results.
