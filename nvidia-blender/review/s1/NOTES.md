# S1 · Who is Alice Huang? — review notes

## Narration (tested, Kokoro am_michael, free/local)
"Who is Alice Huang, and why did her NVIDIA connection draw scrutiny?" — 12 words.
Measured: 4.57 s at speed 1.0 = 158 wpm (fits 5.0 s with a short tail). Beat cues:
"Who is Alice Huang," 0–36 · "and why did her NVIDIA connection" 36–84 · "draw scrutiny?" 84–135.

## Facts used (research.json)
- Alice Huang = former Megaspeed executive (C02; not "CEO"/"founder").
- Megaspeed = Singapore cloud company and NVIDIA customer (C03).
Shown as "ALICE HUANG → former exec → MEGASPEED → customer → NVIDIA". No espionage, export wall, China, Alibaba,
remote computing, resignation or payoff in S1.

## Reused assets
- NVIDIA-style GPU package: scripts/build_gpu.py via build_shots.gpu_asset() (same model as all earlier scenes).
- Material helpers (common.py), lights/world/render settings (build_scene.py), fonts (Inter Display, OFL), NVIDIA logo (Simple Icons, CC0 data).

## New
- scripts/s1_alice_mystery.py -> blender/s1_alice_mystery.blend (collections S1_ENVIRONMENT, S1_IDENTITY_CARD,
  S1_NVIDIA_GPU, S1_CONNECTIONS, S1_LIGHTING, S1_CAMERA): brushed-titanium profile card + stand, Megaspeed plaque
  (text only), growing green connection lines, product-photo lights incl. animated light sweep, keyed camera
  position/lens/focus/f-stop with Bezier easing, motion blur, AgX, Cycles (GPU auto-detect, CPU fallback).
- remotion/src/s1/S1AliceMystery.jsx: overlays (headline, relationship row, captions), plate = renders/s1/f_0001..0150.

## Run
- Build only:  .venv/bin/python scripts/s1_alice_mystery.py          (or: blender -b -P scripts/s1_alice_mystery.py --)
- Stills:      .venv/bin/python scripts/s1_alice_mystery.py --stills review/s1/raw --samples 64
- Animation:   .venv/bin/python scripts/render_shot.py blender/s1_alice_mystery.blend renders/s1 --samples 64
- 4K:          add --final when building (2160x3840, 160 samples)
