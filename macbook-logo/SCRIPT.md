# How does the new MacBook Pro's Apple logo glow? (Short, script v2 approved by Harsh on 15 Nov 2026)

Format: 9:16, ~40 s, continuous narration (Michael, Kokoro am_michael 1.12), premium glass x-ray 3D.
Harsh's direction: no comparison with the old glowing logo — the "back after 10 years" news is the hook only; the video is the teardown of how it works inside.
Model: "Macbook Pro 13 inch 2020" by timblewee, CC BY 4.0 (assets/macbook-pro-13-2020, see CREDITS.md). The inner layers are built in code and marked "Illustrative · not to scale".

## Fact sheet
| Fact | Source |
|---|---|
| Glowing Apple logo returns on the new 14- and 16-inch OLED MacBook Pro; announced 28 Oct 2026, on sale 6 Nov; first time since the 2016 redesign removed it | MacRumors, AppleInsider |
| OLED panels have no backlight (each pixel makes its own light), so a new method was needed | MacRumors / iFixit (via Six Colors, Notebookcheck) |
| iFixit teardown: four tiny LEDs hidden behind the OLED display; light hits a reflective layer and passes through a diffuser for an even glow | iFixit via Six Colors, Notebookcheck |
| Apple built a custom light source just so the logo can glow (Apple to John Gruber) | Six Colors / Daring Fireball via search |
| Logo is lit whenever the Mac is awake; dimmer in a dim room, brighter in a bright room | Apple statement via MacRumors / 9to5Mac |
| Apple explains how to turn the glow off | 9to5Mac |
| Logo is white light only (can't change colour) | MacRumors (Backglow app) |

Sources:
- [MacRumors: Illuminated logo returns](https://www.macrumors.com/2026/10/28/illuminated-logo-returns-to-macbook-pro/)
- [MacRumors: Real-world look](https://www.macrumors.com/2026/10/28/macbook-pro-glowing-apple-logo/)
- [Six Colors: iFixit reveals the magic](https://sixcolors.com/link/2026/11/ifixit-reveals-the-magic-behind-the-new-glowing-macbook-pro-logo/)
- [Notebookcheck: iFixit tears down the MacBook Pro OLED](https://www.notebookcheck.net/What-s-inside-Apple-s-new-glowing-logo-iFixit-tears-down-the-MacBook-Pro-OLED.1447816.0.html)
- [AppleInsider: It's back](https://appleinsider.com/articles/26/10/28/its-back---the-glowing-apple-logo-makes-a-return-on-macbook-pro-at-last)
- [9to5Mac: How to turn it off](https://9to5mac.com/2026/11/05/apple-explains-how-to-turn-off-the-new-macbook-pros-glowing-logo/)
- [MacRumors: Backglow](https://www.macrumors.com/2026/11/07/backglow-customize-macbook-pro-apple-logo/)

## Viewer panel round 1 (on v1) and changes
- Silent 2.5 s opening + "Back after 10 years" didn't say what came back → voice starts at ~0.3 s with the puzzle, music under it.
- "OLED / no backlight" lost Riya; the panel suggested explaining the old way, but Harsh doesn't want an old-vs-new comparison → plain wording instead: the screen only makes light from the front, there's no light behind it.
- 8-second bounce/diffuser section felt slow → squeezed to one line (~6 s).
- Kiran: soften specific claims → "Apple says it built this light source just for the logo"; "four tiny LEDs" is from iFixit's teardown.

## Script v2
| # | Time | Narration | Visual |
|---|---|---|---|
| 1 | 0–3 s | This logo shouldn't be able to glow. | Dark desk; closed MacBook wakes; logo fades up; text "Back after 10 years" |
| 2 | 3–9 s | After ten years, Apple brought it back on the new MacBook Pro. But its OLED screen only makes light from the front. There's no light behind it. | Slow orbit; glass x-ray: pixels light up facing forward, the back of the panel stays dark |
| 3 | 9–12 s | So where's the glow coming from? Let's open the lid. | Lid separates into layers (side callouts) |
| 4 | 12–19 s | Hidden behind the screen are four tiny LEDs. Apple says it built this light source just for the logo. | Four tiny LEDs light up, side callouts |
| 5 | 19–26 s | A mirror-like layer bounces their light, a frosted sheet spreads it out evenly, and it shines through the logo. No bright spots. | Rays bounce off the reflector, spread through the diffuser, exit the logo window; layers close |
| 6 | 26–35 s | It glows whenever your Mac is awake. Brighter in a bright room, dimmer in a dark one. Don't like it? Apple lets you switch it off. | Room light changes, logo follows; a switch turns it off |
| 7 | 35–38 s | Follow InvisiTech for more. | End card |

~105 words, ~38–40 s. Credits: "Macbook Pro 13 inch 2020" 3D model by timblewee (sketchfab.com/timblewee), CC BY 4.0, modified.

## Build status
- Script v2 and the Apple logo approved (logo shown with "3D illustration · not affiliated with Apple" on screen the whole time).
- Voice: Michael (Kokoro am_michael, speed 1.12): `voice/make_voice.py` then `voice/make_timeline.py` → `voice/voice.wav`, `timeline.json` (scene cuts), `captions.json`, `../macbook-logo-glow.en.srt`. 39.2 s; voice 0.6–36.8 s.
- Scene page: `logo-video.src.html` → `python3 build-data.py && python3 build-video.py` → `logo-video.html` (self-contained). Stills: `./sheet.sh <dir> <sheet.jpg> t1 t2 …` (uses `render.cjs`, which needs three.js + fonts in `../phone-teardown`, see its README).
- Stills v1 in `stills-v1/`. Stills v2 in `stills-v2/`: + mirror effect (glossy desk reflects the laptop and the glowing logo, fading out above the subtitles; `assets/Reflector.js` from three.js r128, MIT), wide shots pulled back to make room for the reflection. Waiting for Harsh's OK before the video render.
- Stills v3 (`stills-v3/ending-board.jpg`): Harsh's new ending: after the switch-off, the whole video shrinks onto the MacBook's screen (the Short playing on the Mac), the camera pulls back to the laptop from the front, and the InvisiTech card (logo, Invisi**Tech**, @TheInvisiTech, Like/Comment/Follow, Subscribe) plays on that screen; "Hidden LEDs." pill below. End card now 4.8 s (total 39.8 s).

## iFixit's own teardown (read 15 Nov 2026): "We Tore Down the MacBook PROLED XDR and Found the Secret of the Glowing Apple"
https://www.ifixit.com/News/120152/we-tore-down-the-macbook-proled-xdr-and-found-the-secret-of-the-glowing-apple
- The laptop: 14-inch MacBook Pro with PROLED XDR, the first touchscreen MacBook; tandem OLED (two light-emitting layers), 120 Hz, 2,000 nits peak; M5 Pro / M5 Max; 1.38 kg.
- "Behind that fancy display, there's a much less fancy LED strip, featuring four little lights that give the apple its glow."
- iFixit had to break the screen to get in: "The rubber trim lifted. Then the glass delaminated, cracking the OLED and capacitive layers underneath." / "getting inside that lid cost us the panel."
- "two light, rigid foam pads flanking the logo. Our best guess is they give the OLED a little backing when you press on the glass."
- "Under a taped patch in the middle we found four LEDs, all in a strip along one edge. The light hits a reflective layer and passes through a diffuser, turning four little points of light into one evenly glowing apple."
- "The logo itself has a mirror-like coating that looks shiny with the lights off."
- "this is an insane repair path for reaching the glowing logo." Repairability 5/10 (would be 4 under their 2027 rubric).
- Microscope: the OLED's blue subpixel is much bigger than red and green (blue materials wear faster).
- Photos in the article (reference only, iFixit's copyright, not for the video): "Apple logo pulled out of the lid", "Stacked layers over Apple logo", "Under the MacBook PROLED display", "Closeup of the foam backing", "Apple-lid-cutout".
- Fix needed in our 3D: the four LEDs are one strip along one edge (not at four corners), under a taped patch, between two foam pads; the logo is a two-way-mirror window.
- Stills v4 (`stills-v4/board.jpg`): lid inside rebuilt from iFixit's teardown, screen part only: cover glass + rubber trim, touch layer, tandem OLED (bigger blue subpixels), two foam pads with a taped patch between them, reflective layer with ONE strip of four side-firing LEDs along one edge (+ amber flex), diffuser, mirror-coated logo (shiny when off). The 1080 video (George) still shows the old corner LEDs; needs a re-render after Harsh's OK. 4K on hold until Harsh says.
- Harsh: "I want more premium, remember" (rule 23 — every scene must look premium). Stills v5 (`stills-v5/board.jpg`): bloom on everything that glows (UnrealBloomPass, multisampled, 24-bit depth), glowing edges on every lid layer, charcoal foam, dark polished steel mirror, cool rim light inside the lid, softer logo halo.

## V3 final polish (Harsh's brief, 15 Nov 2026)
Verified at the source (support.apple.com/en-us/149248, "About the illuminated Apple logo on MacBook Pro with PROLED XDR Display", 5 Nov 2026):
- "The Apple logo behind the built-in display is illuminated whenever the Mac is awake. It automatically dims or brightens based on the brightness level of the built-in screen and the lighting conditions detected by the computer's ambient light sensor. For all screen-brightness levels, the Apple logo will be dimmer in a dim room and brighter in a bright room."
- Turn off (Terminal, no Settings toggle): `sudo defaults write com.apple.CoreBrightness LEBacklightMode -int 0` — back on: `sudo defaults delete com.apple.CoreBrightness LEBacklightMode`.
- 4 LEDs: iFixit's own teardown (see above) → on-screen credit "Source: iFixit teardown".
- Built (stills v6, `stills-v6/board.jpg`): hook close-up dark → lit in 0.5 s → pull-back, "THE GLOW IS BACK." (+28% size); OLED pixels light one by one + empty dashed "No backlight" sheet; labels one by one with thin 1.4 px leaders and soft layer shadows; "4 HIDDEN LEDs" with activation rings + "Source: iFixit teardown"; light particles, 4 concentrated hot spots → one even glow; brightness (Apple Support wording); Terminal with Apple's exact command (no invented toggle); zoom-out onto the MacBook screen with no CTA icons; 2.0 s branding (logo, InvisiTech, "The tech behind everyday life."). Logo bloom −27%, edge rim light, contact shadow, safe margins 120/180/220/350, lighter subtitles, no whooshes, minimal music, soft sonic logo. Main 40.44 s + outro 2.0 s = 42.44 s.

## V4 final polish (Harsh's brief, 15 Nov 2026)
A refinement of V3, not a redesign. Only the normal video is made (no no-music version from V4 on).
- Ending glitch fixed: V3 flew the camera out of the screen *through* the laptop (keyboard sliding up under the subtitles, a frozen copy of the video with a small laptop inside it on the screen). V4: calm front view of the MacBook showing its lock screen (light-streak wallpaper, "Sunday 15 November", "9:41"), rising slowly to the high, dark angle; the screen then fades into the same clean InvisiTech card (2.0 s outro unchanged).
- Hook: logo bloom ~15% lower (emissive, spill and bloom pass), edges stay sharp; animation, pull-back and "THE GLOW IS BACK." unchanged.
- 4 hidden LEDs: continuous ~7% push-in (camera zoom), starting as the first LED lights, on top of the existing move.
- Optical scene: labels +15% (3.15 → 3.62 vw), darker backing and brighter border; "4 bright spots" and "Diffuser spreads it evenly" moved above the light path (no longer on the glowing diffuser). Leader lines stay 1.4 px.
- Switch-off scene (Harsh, after V4 brief): no Terminal and no extra switch. The "Room light / Logo glow" card stays on screen to the end of the scene; on "switch it off" the Logo glow bar empties and the logo goes dark. Apple has no Settings toggle, so the note under the subtitles says "Switched off via Terminal (Apple Support)". Command re-checked against Apple Support 149248 (5 Nov 2026, "Requires MacBook Pro with PROLED XDR Display"): `sudo defaults write com.apple.CoreBrightness LEBacklightMode -int 0`; back on: `sudo defaults delete com.apple.CoreBrightness LEBacklightMode`.
- Desk reflection darkened (0.42× instead of 1.15×): it read as a brighter grey block under the laptop.
- Watermark (`watermark.py --pos safe-bottom-right`): right-middle at the 180 px margin sat on the subject (logo in the hook, glowing diffuser, keyboard in the ending; rule 17), so the clear mark sits bottom-right inside the safe area (right edge 900 px, bottom 356 px up), below the subtitles and clear of the IG/YT buttons; the faint drifting copy stays inside 100/180. Checked with simulated Reels/Shorts overlays.
- Sound (`audio/make_sounds_v4.py` → `sfx_v4.wav`, `mix_v4.wav`): no whooshes; soft electronic activation tone on each LED in sync with the picture, soft clicks for labels, layers and Terminal keystrokes, restrained low impacts (hook, lid, LEDs, switch-off, branding), soft two-note sonic logo. Music bed and George's voice unchanged. Mix: -14 LUFS, peak -1.5 dBFS, LRA 1.3 LU, no clipping.
- Facts re-checked: Apple Support 149248 (models, always-on while awake, dims/brightens with screen brightness and ambient light, Terminal command); iFixit teardown via MacRumors 10 Nov 2026 (strip of four LEDs along one edge, reflective layer, diffuser, mirror-like coating on the logo). No claim changed.
- Export: render natively (no upscaling). 1080: 1080×1920, 30 fps, H.264 ~18 Mbps, yuv420p, AAC 320 kbps 48 kHz, faststart → `macbook-logo-glow-v4-final-1080.mp4`. 4K master: 2160×3840 (DSF=2), ~50 Mbps → `macbook-logo-glow-v4-final-4k.mp4`. The "512×910" Harsh saw was the chat app's preview copy; the V3 file itself is 1080×1920 (ffprobe).
- Delivered: `macbook-logo-glow-v4-final-1080.mp4`: 1080×1920 (9:16, SAR 1:1), 30 fps, H.264 High, yuv420p, two-pass ~15.1 Mbps video (the dark frames don't use more), AAC LC 48 kHz stereo at 320 kbps target (ffprobe reports ~287 kbps average), faststart, 42.44 s. No 4K (Harsh: "No 4k").
- V4 round 2 (Harsh, from phone screenshots): (1) no Touch Bar (the 2026 MacBook Pro has none; viewers spot it): the model's Touch Bar parts (Object_23/24/25/27) are hidden and a full-height function row is built in code (esc, F1–F12 with icons, Touch ID); (2) when the camera turns round in scene 2, the screen shows only the light-streak wallpaper, lighting up block by block (no coloured pixel pattern); (3) the ending starts as if sitting at the MacBook: its lock screen fills the phone (date and time inside the safe margins), then the camera pulls back to the laptop and the InvisiTech card. Fixed a commented-out camera update in the ending.
- V4 round 3 (Harsh): in scenes 2–3 only the lid turns to glass; the keyboard half stays solid so its keys are readable (`setXray(x, true)`). In the light scenes (4–5) the base stays see-through as before, so it never blocks the glowing layers.
- V4 round 4 (Harsh): the ending is "watching this video on the laptop" again: the last picture of the switch-off scene (laptop, room card, logo off) carries on seamlessly, then the camera zooms out and it is playing on the MacBook screen over the light-streak wallpaper, then the InvisiTech card. No dip to black before it. The faint moving watermark copy is removed (`watermark.py --drift` brings it back); only the fixed mark stays, bottom-right inside the safe area.
- V4 round 5 (Harsh): no wallpaper behind the video on the MacBook screen; it plays on a plain dark page (#0f0f0f) like a channel video, corners rounding off as we zoom out. No platform logos or buttons.
- V4 round 6 (Harsh): no subtitles or grey note during the zoom-out and the title (George still says "Follow InvisiTech for more"); the title card on the MacBook adds "Follow for more", Like / Comment / Follow icons and a red Subscribe button, popping in one by one with soft clicks (this replaces the brief's "no buttons" for the outro, at Harsh's request).
- V4 round 7 (Harsh: "close to 40 secs"): total 40.07 s (main 38.07 + 2.0 s card). No words cut: `voice/george40` = the same George lines 2% faster (atempo, same pitch), `make_timeline.py george40` with tighter breaths (0.08 s in a line, 0.26 s at a cut), voice from 0.45 s, 0.8 s hold before the card (zoom-out ~2.7 s). Music re-rendered at the new length (`audio/make_music_v4.py` → `music_v4.wav`, same piece, fade-out on the new end); `mix_v4.wav` = george40 + music_v4 + sfx_v4: -14 LUFS, peak -1.5 dBFS, LRA 1.1. `build-video.py`, `render-parts.sh` and `make_sounds_v4.py` now default to george40 (voice/george is untouched). The English SRT was regenerated for the new timing.
- V4 round 8 (Harsh): hook only: less blur haze around the Apple logo (spill around the logo at 50%, bloom strength 0.65× and a slightly tighter radius in scene 1); the logo itself stays as bright, edges sharper. `hook-glow-before-after.jpg`.
- Delivered (final, 15 Nov 2026; re-rendered after rounds 9–12): `macbook-logo-glow-v4-final-1080.mp4`: 1080×1920 (9:16), 30 fps, H.264 High, yuv420p, 16.0 Mbps constant bitrate (`watermark.py --bitrate 16M --cbr`; x264's VBR stops at ~14.7 Mbps on these dark frames), AAC LC 48 kHz stereo (320 kbps target, ~294 kbps reported), faststart, 40.07 s. Fixed watermark bottom-right inside the safe area, hidden on the 2 s card; no moving copy. No 4K, no no-music version.
- V4 round 9 (Harsh, phone screenshot at 0:10): a stepped grey edge across the screen in the OLED scene. Cause: the inner layers, still stacked inside the lid in scene 2, reflected a studio light from the low-res environment map. Fix: the layers are hidden in scene 2 (they appear and open up in scene 3); the screen there is black with the wallpaper lighting up block by block.
- V4 round 10 (Harsh): dark screen in every scene (no wallpaper, no block reveal). Teardown "not premium" → realistic materials (his choice): neutral white studio rim light instead of blue, faint neutral edges instead of glowing wireframe, near-clear touch film with a fine silver mesh, black glass OLED panel, matte black foam, glossy black tape, polished silver reflector on a black frame, white LED packages with a yellow phosphor window on an amber flex with gold traces, frosted diffuser. `teardown-realistic-stills.jpg`, `teardown-realistic-closeup.jpg`.
- V4 round 11 (Harsh: "zoom on the diffuser, different colour, wow"): on "a frosted sheet spreads it out evenly" the camera pushes in on the diffuser (about half the distance), the sheet turns cyan (accent colour) and cyan ripples spread from the 4 bright spots across it, with a soft shimmer; it settles back to white for "and it shines through the logo" (the real glow is white). The "Mirror bounces it" label hides during the zoom. `diffuser-wow-stills.jpg`.
- V4 round 12 (Harsh: "more cinematic", teardown scenes; his picks: lens flare + light streaks, smoother camera): anamorphic light streak on each LED as it switches on and on the logo as the light shines through; smootherstep camera and layer moves with a slow floating drift (orbit yaw ±0.9°, pitch ±0.5°) in scenes 3–5; LEDs switch on a little slower (every 0.5 s, rings 0.85 s) with the sound moved to match. `teardown-cinematic-stills.jpg`.
- V4 round 13 (Harsh, 16 Nov): watermark back at the right edge, vertical centre (rule 22), blended: 55% opacity, 85% size, 34 px from the edge (`watermark.py --pos right-middle --margin 40 --opacity 0.55 --size 0.85`); still hidden on the 2 s card. Re-applied to the same render (no re-render).
- V4 round 14 (Harsh: "more good animation on the light beams, wow feel"), scene 5: warm light fans from each LED across the mirror with travelling pulses (custom shader), soft light curtains rising from the mirror to the diffuser with upward pulses, a slowly rotating burst of 12 light shafts out of the logo on "and it shines" (kept above the subtitles); the old thin line rays are gone. Soft glow/shimmer/impact sounds added at those moments. `beams-wow-stills.jpg`.
- V4 round 15 (Harsh, 16 Nov): 3 Higgsfield photos (GPT Image 2.6, 0.75 credits; no AI video, "do not waste") are animated in code and inserted after the render (`tools/real_inserts.py`, 0 credits): 0–0.96 s the opening photo (logo glows on, slow push-in, title + subtitle) with a clean cut into the 3D close-up; "Brighter in a bright room" = café photo, "dimmer in a dark one" = bedroom photo, each with a slow push-in, the live room card copied from the 3D frames and the subtitle. Each photo shot says "AI-generated image · not affiliated with Apple" (use YouTube's altered/synthetic content label on upload). Higgsfield month total: 109 / 400. `higgsfield/inserts-preview.jpg`.
- Delivered (final, 16 Nov 2026): `macbook-logo-glow-v4-final-1080.mp4` with the wow beams, the 3 animated Higgsfield photos and the blended right-middle watermark: 1080×1920, 30 fps, H.264 16 Mbps CBR, AAC 48 kHz, 40.07 s, -14.1 LUFS, peak -1.5 dBFS.
