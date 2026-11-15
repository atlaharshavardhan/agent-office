# InvisiTech 3D Short: how the MacBook logo Short was made (handoff for a new session)

Use this to make a **similar Short on a new topic** in a fresh session. The finished example is `macbook-logo/` on branch `claude/macbook-logo-short`; read its `SCRIPT.md` (facts, script, every change Harsh asked for).

## Workflow Harsh expects
1. Fact sheet from real sources (open the original: iFixit, the maker's support page). Quote them in `SCRIPT.md`. If a site is blocked, ask to allow it (environment network), don't guess.
2. Script (~40 s, simple words), viewer panel, then **wait for Harsh's OK on the script**.
3. Build the 3D scenes, show **still images first**, wait for his OK. Never render 4K until he says so.
4. Render 1080×1920 with voice + music + SFX + burned subtitles + watermark; also a no-music version and a sentence-level English SRT. 4K only after his OK.
5. Rules: `notes/INVISITECH-CHAT-NOTES.md` (Shorts rules 16–23). No Higgsfield. Canva only for the cover.

## What he cares about (learned the hard way)
- **Premium every scene** (rule 23): glass x-ray, soft bloom only on things that glow, glowing layer edges, rim light, contact shadow, dark clean backgrounds, mirror desk reflection.
- **Accuracy**: build internals only from the teardown; label "Illustrative · not to scale"; credit the source on screen (e.g. "Source: iFixit teardown"); show the real method (e.g. the real Terminal command), never invented UI.
- **No glitches**: check stills zoomed in for z-fighting dots (coplanar surfaces → move one 0.25 mm), moiré from fine textures, blocky bloom (use half-float targets, high threshold), sprites cut by surfaces (depthTest off), leftover model textures peeking at edges, labels overlapping (shorten text, offset). Check reflections too.
- Reference images he sends apply exactly where he says (e.g. a screen wallpaper look = the device's screen in every scene, not the title). Ask if unclear.
- Safe margins 120 left / 180 right / 220 top / 350 bottom; subtitles 1250–1450 px; watermark right-middle, hidden on the branding.
- Ending: video shrinks onto the device's screen, then clean InvisiTech card (logo, Invisi**Tech**, "The tech behind everyday life.") on that screen; soft sonic logo; no CTA icons.
- Sound: no whooshes; subtle clicks/activations; minimal music; voice on top. Voice: free Kokoro **bm_george** (en-gb, 1.18).

## Tools in `macbook-logo/` to copy and adapt
- `logo-video.src.html` (three.js r128 scene + overlays) → `build-data.py` (packs the CC-BY glTF model) → `build-video.py` (single HTML).
- `render.cjs` (Playwright frames → ffmpeg; needs `phone-teardown` three.js + fonts, see its README), `sheet.sh` (stills), `render-parts.sh` (parallel render).
- `voice/make_voice.py`, `voice/make_timeline.py` (Kokoro → voice.wav, scene cuts, captions, SRT), `audio/make_sounds.py`, `audio/mix.sh`, `tools/watermark.py`.
- Kokoro setup: `python3 -m venv kvenv && kvenv/bin/pip install kokoro-onnx soundfile`, models from github.com/thewh1teagle/kokoro-onnx releases (model-files-v1.0).
