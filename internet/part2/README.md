# Part 2 (internet series): hand-off for the new session

Owner: Harsh (InvisiTech). He is not a developer: explain everything in simple words, ask before deleting or overwriting, check facts, no Higgsfield and no paid AI video generation, Canva only for thumbnails. Commit and push everything (a stop hook complains about untracked files); always `git pull -q --rebase origin <branch>` before pushing. No pull requests unless he asks.

## Where Part 1 stands (uploaded by Harsh on 28 Nov 2026)
- Final file: `internet/video/internet-part1-v10.mp4` (9:16, 1080x1920, 75.7 s). Cover: `internet/thumbnail/part1-cover-torch.png`. Subtitles: `internet/subtitles/part1-v10.srt`.
- Part 1 ends with her (Meera, Mumbai) flying to London, the globe shot, and the caption "Next: how a photo crosses an ocean." then an end card with "PART 2 coming soon".
- Read `internet/STORY-NOTES.md` (all decisions and rules, newest at the bottom) before doing anything.

## What Part 2 is
"What happens when a photo has to cross an ocean": from a phone in London to the other side of the world: radio waves to a cell tower, glass fibre under the street, routers, the shore, the sea floor, repeaters, the cable's layers, the globe, arrival. Harsh's words: "part 2: what happens if we need to send an image from there (London)".
- OPEN DECISION (ask Harsh, one short question): which direction? The clips below were made for India to London (his video travelling to her). Part 2 as he describes it sends a photo FROM London. Mirror the story (London to Hyderabad) or keep the route and say "to London"?
- Format: build the vertical 9:16 Short first (1080x1920, about 75 to 90 s). The 16:9 film (Part 1 + Part 2 joined) comes later, only when he asks. Do NOT render or make images for 16:9 until then.

## Clips already rendered (clean, no captions, no sound), in `part2/clips/`
Made on 16 Nov 2026 for the first full Short draft. Source scenes are in `internet/v3/src/v4/` (React/Remotion 3D). They have NOT been checked against Part 1's newer rules (below).
| File | Length | Shows | Source scene |
|---|---|---|---|
| 01-LondonV4V | 14 s | London street, her flat, a new city | `London.tsx` |
| 02-PacketBurstV | 10 s | the photo/video chopped into packets leaving the phone | `Packets.tsx` |
| 03-UndergroundV | 9 s | cell tower, then diving under the street into the glass cable | `Underground.tsx` |
| 04-RoutersV | 12 s | routers passing the packet along, jammed road, another path | `Routers.tsx` |
| 05-ShoreV | 9.5 s | the land runs out, the cable goes into the sea | `Shore.tsx` |
| 06-SeabedV | 9.8 s | 3 km down, light racing along the sea floor | `Seabed.tsx` |
| 07-SeabedRepeaterV | 7.5 s | the repeater boosting the fading light | `Seabed.tsx` (repeater shot) |
| 08-SeaCableV | 15 s | the cable's layers peeling away to the glass fibres | `SeaCable.tsx` |
| 09-PlanetV | 12 s | the globe: the route across the sea to the other city | `Planet.tsx` |
| 10-FlightV | 17 s | the plane flight (Part 1 now ends with its own flight shot; probably not needed) | `Flight.tsx` |
| 11-ShortEndA-old-ending | 4.8 s | old ending pieces, flat 2D style (probably replace) | `Short.tsx` |
Old narration for these (Kokoro voice, now replaced by Liam) is in `old-short-voice-lines.json`; old cut list and timings in `old-short-plan.json`; old full draft: `internet/video/internet-short-v4-draft1.mp4`.

## Rules learned in Part 1 (apply them to Part 2)
- Voice: Liam, ElevenLabs, voice id `TX3LPaxmHKxFdv7VOQHJ`, model `eleven_multilingual_v2`, stability 0.3, similarity 0.8, style 0.55, speed 1.12 (script: `internet/voice/make_liam_voice.py`; the key is injected by the proxy, use a dummy header). It uses Harsh's paid characters: keep texts short and record each line once. Play speech at 1.06 and tighten pauses with `internet/audio/retime.py` (see its docstring).
- Words: simple and short, one idea per line, check every number. Part 1 wording must not contradict Part 2 (a photo is about 2,000 packets; routers pass packets hop by hop).
- Sound: music and effects generated in code only. NO whoosh or movement sounds, NO repeating music notes (they sound like horns), only a few small beeps or dings. See the mix scripts in `internet/audio/` (`make_part1_mix.py` is the template).
- Captions: word by word (`Kar` and `capAt` in `internet/v3/src/dusk/Extras.tsx`), inside the safe area: captions y 1260 to 1450, titles y 220 to 450, nothing important below y 1500 or right of x 940 below y 1100. Balanced line breaks.
- Camera: stay close on what is being explained, go wide only when the whole picture is needed. Cards of text must be tidy and centred. Phones small and out of the way (`Phone.tsx`).
- Names: he is Arjun (Hyderabad), she is Meera (Mumbai). Show only the two main city names. Use "Message", never "iMessage".
- Watermark: horizontal, 30% see-through, middle-left, added in the final join. End card: `EndCard` in `internet/v3/src/tail/Ends.tsx` (`p2` variant for Part 1; make a Part 2 ending with "follow" and no "coming soon").
- Facts to keep honest: packets are about 1,500 bytes; light in glass travels about 200,000 km/s; more than 95% of intercontinental data travels in undersea cables (check the wording against a source before using).

## How Part 1 was built (copy the pattern)
Remotion project in `internet/v3`. Render in small saved pieces from a frozen copy so a 28-minute limit per run cannot lose work: see `internet/v3/render_part1_v8.sh` (renders pieces, joins sound and watermark; re-running skips finished pieces). Background jobs are killed after about 30 minutes to 2 hours: run `timeout 28m <script>` in the background and re-run until done. Use `--gl=swangle`, concurrency 4. The 3D scenes render slowly (several minutes per second of video): plan for many hours.
Always send Harsh preview stills of each shot first and wait for his "render" before a long render, unless he already said to render.

## Suggested first steps
1. Read the notes, then look at each clip in `part2/clips/` and at `internet/video/internet-short-v4-draft1.mp4`.
2. Ask Harsh the direction question and agree a short script (about 12 to 16 lines) in simple words.
3. Check each clip against the rules above (names, text, camera, captions, no old "his video" wording), then send him stills.
4. Build the sound and captions, render, retime, check frames, deliver with a cover (Canva, no person) and SRT.

## Flicker fix (28 Nov 2026)
Harsh saw continuous flicker in the first Part 2 re-renders. Cause: rendering 3D scenes with --concurrency=4 (and 2) drops frames, which come out almost black. Concurrency 1 is clean. Rule: render Part 2 pieces with --concurrency=1 and run internet/v3/check_glitch.py on each piece (render_part2_clips.sh and render_part2_new.sh do this and retry up to 4 times). Fixed clips: internet/part2/clips-v3/ (old glitchy clips-v2 removed).
