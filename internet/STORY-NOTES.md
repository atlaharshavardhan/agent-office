# Internet Short: story notes from Harsh

## The woman is the key character (noted 14 Nov 2026)
- The story follows HER. She is the thread that ties every scene together.
- Scene 1: the man flashes a torch to her across the street (the hook, up to HELLO / "too slow").
- As she moves further away, the network has to expand to keep reaching her:
  the next house, the next street, the city, other cities, across the sea.
  Each move = one new piece of the internet (wire, many wires, switch/router, ISP, undersea cable...).
- The grandmother from the reference story is part of this journey (her house is one of the places the woman goes).
- So in every later scene the woman must be visible and recognisable (same coral kurti, jeans, long hair),
  and the camera should follow her rather than the man.

## Look that is approved so far
- Isometric 2.5D night neighbourhood, individual houses, both on first-floor balconies.
- College-age couple; she wears dress option 1; slightly fairer skin; dark door behind each of them.
- Her house on the right, park in the middle, road + cars + trees kept.

## Correction (15 Nov 2026): she is the one who moves, all the way overseas
- NOT the grandmother. Grandma is not a main role (drop her, or keep her only as a background extra).
- The girlfriend herself moves further and further away, and each move forces the network to grow:
  1. Across the street: torch, then the rope-gun wire (done).
  2. She moves to another house / the next street: one wire per place does not scale -> the router.
  3. She moves to another city: router to router (and packets for big videos).
  4. She moves overseas: glass cable under the sea, light inside it; anchors cut cables, so there are hundreds.
  5. Ending: he still reaches her instantly; "that is how this video reached you".
- He stays on his balcony the whole time; the camera travels with her.

## Step 2 look chosen (15 Nov 2026)
- Router scene uses the simple version: small router, one cyan wire per house, dots flowing towards the router, door numbers -> IP addresses.
- The full glowing web/mesh (dots + thin lines + bokeh over the whole neighbourhood) is built but switched off (MESH_ON in IsoStreet.tsx).
  Harsh wants to use it LATER, for a bigger-network scene (city / world).
- Timing is not final; to be fixed later.

## Detail pass approved (15 Nov 2026): "This is really amazing, let's go with this"
- From the next render onward, every street scene uses the detail pass (now the default in IsoStreet.tsx):
  bricks, framed windows + curtains, tiled roofs, chimneys with smoke, rooftop solar panels / dishes / washing lines,
  doormats, plants, paving, lamp reflections, scooter, bench + cat, fireflies, haze, vignette, film grain.
- Still to do: bring the step 3 region map (IsoCity.tsx) up to the same level; re-render hook, wire and step 2 in this look.
- Offered but not yet confirmed: dim neighbours behind the router, move the router pole off the FRIEND'S house, dark band behind subtitles.

## Short: corrections noted, not rendered yet (17 Nov 2026)
Harsh is collecting corrections first. Do not render a new draft until he asks.
- "She moved to London": use only the V3 plane-and-globe shot (moon, plane, then the globe with her flight line Mumbai to London).
  Remove the airport, the runway and the 3D flight. His words: "not required airport and going everything, remove all".
  Already set up in audio/make_short_mix.py (cut list starts with ShortFly) and v3/src/v4/Short.tsx; the shot and the captions layer still need rendering
  (v3/render_short_extras.sh, then v3/join_short.sh).
  Open: his picture also showed the cable drawing across the globe ("Now the routers link up under the sea"); left out for now because the sea cable comes later.
  Open: whether the 3D London street and flat stay after the globe.
- Last rendered draft is internet/video/internet-short-v4-draft1.mp4 (still has the airport and 3D flight).

## New structure from Harsh (17 Nov 2026): two parts. Noted, not rendered yet.
His words: "in this scene [city routers, Pune to Mumbai, 'pass the message along, hop by hop'] we need to show what if we need to send a pic,
how packets move. First tell without packets, if you send it, it will down all lines of router; tell me real what happens. After this we will show
now she moved to London, that's part 1. Part 2: what happens if we need to send an image from there. So first we will see part 1."
- PART 1 (in the existing city scene, same drawn look): text "Hello" hops router to router -> now he sends a PHOTO ->
  (a) without packets: the photo goes as one big block, holds every line on its path until it is through, other people's messages queue behind it,
      one glitch and the whole photo starts again -> (b) with packets: photo cut into about 2,000 small numbered pieces, each with her address,
      mixed in with everyone else's traffic, some take another road, a lost one is sent again on its own, her phone puts them back in order
  -> then "she moved to London" (V3 plane-and-globe shot only). End of part 1.
- PART 2: sending an image from/to London: tower, fibre under the street, routers, shore, sea floor, repeater, cable layers, globe, arrival.
- Facts to use: packet about 1,500 bytes max (about 1,460 of photo in each); 3 MB photo = about 2,000 packets; a router does not crash from a big file,
  the real problem is the line being held and the full resend. Real networks do not accept one giant block at all.
- This replaces the 3D "1,500 packets from a 2 MB video" intro as the first place packets are explained; decide later whether part 2 keeps that shot.
- 17 Nov: Harsh said "yes, first lets do part1 video" and "do not worry about time" (length). Part 1 built: v3/src/dusk/CityPhoto.tsx
  (photo as one block, then packets, on the city map; 36 tiles stand for about 2,000 packets), closing shot Part1Fly in v3/src/v4/Short.tsx,
  sound audio/make_part1_mix.py, render + join v3/render_part1.sh -> internet/video/internet-part1-v1.mp4.
- 17 Nov 2026: Part 1 v1 rendered and sent (internet/video/internet-part1-v1.mp4, 93 s). Known flaw: 'start again' label overlaps a 'waiting' counter near his home router.
- 17 Nov 2026: Harsh: no whoosh sounds in Part 1. Removed: all whooshes and the plane fly-by rush in make_part1_mix.py; camera whooshes subtracted from hook-mix.wav; line-whizz air sound removed in make_wire_mix.py; two swish moments in city-mix.wav turned down (no recipe existed for that file). Old files kept as *-with-whoosh.wav. Result: internet/video/internet-part1-v2.mp4 (street-nw.mp4 / city-nw.mp4 in video/part1 carry the new sound; chunks3 originals untouched). Rule for Part 2 and later: no whoosh sounds.

## Part 1 version 3: Harsh's review notes (21 Nov 2026)
- Remove the "glass core / blinks every second" close-up; just say it is a wire like a LAN cable. Done: street scene without that cutaway, line "So we use a LAN cable."
- Remove the "Reads the address / inside the router" explainer. Done: the street view stays on screen.
- Phones: use a real-looking small iPhone. He types, taps send, the message jumps out and travels the lines, and the phone disappears. The same for the photo. The receiving phone shows up only when packets arrive; they land jumbled, then sort by number into the photo.
- Then she flies to London, plane and globe, fast (5.4 s instead of 7.1 s).
- Hook must lock the viewer. New opening line in the first second: "You can build the internet with a torch. Seriously." then "Flash it at your friend across the street, and you've basically built the internet."
- Build: Phone.tsx (iPhone), CityPhoto.tsx, IsoCity2 "all" mode (composition CityAll), make_hook_mix.py, render_part1_v3.sh. Output: internet/video/internet-part1-v3.mp4.
- 22 Nov 2026: Part 1 v3 rendered and sent (internet/video/internet-part1-v3.mp4, 90.1 s). Watermark is now added in the join: horizontal, 42% see-through, position per scene set by MARKS in render_part1_v3.sh. Flight and globe 4 s. Closing line: 'Next: how a photo crosses an ocean.'

## Part 1 in 16:9 (23 Nov 2026)
- Harsh asked for Part 1 as a true full-screen 16:9 film at 1080p (not the tall video inside a wide frame).
- How: src/lib/wide.ts + WideWrap.tsx draw the tall layout at 0.72 scale in the middle of 1920 x 1080 and let the world spill to both sides; skies, ground, skyline and vignettes are widened; the first-person shot gets extra neighbour houses; phones are bigger and stand beside the middle column.
- Compositions WStreet, WCity, WFly. Script: v3/render_part1_wide.sh. Output: internet/video/internet-part1-wide-v1.mp4. Sound is the same as the vertical version 3.
- 24 Nov 2026: Part 1 16:9 v1 rendered and sent (internet/video/internet-part1-wide-v1.mp4, 90.1 s, 1920 x 1080). Render took about 14 hours of short runs; the plane/globe/end card alone took about 4 hours.
- 26 Nov 2026: Harsh: no whoosh or movement sound at all, including while messages travel. Version 4 = version 3 picture with a new sound mix: removed every sweep, riser, noise burst, hum, data chirp and the ticking while messages/packets move. Kept: voice, music, torch clicks, bit beeps, wire thump and clink, typing taps, send tap, arrival and "photo complete" dings, the error thump. City sound rebuilt from scratch (audio/make_city_mix.py). RULE for all future parts: no movement sounds.
- Decision (26 Nov): Part 1 goes out first as the 9:16 Short; the 16:9 film will be Part 1 + Part 2 in one video.
- 26 Nov 2026: Harsh heard 'continuous car horns'. Cause: the music's pluck motif (a note twice per beat). Turned down from 0.05 to 0.011 in every mix (audio/bed-soft.wav for hook and wire; make_city_mix.py; make_part1_mix.py). Result: internet/video/internet-part1-v5.mp4. RULE: keep the pluck layer at this faint level.
- 26 Nov 2026, NOTED, NOT DONE (Harsh said "note it"): ways to shorten Part 1 (now 90 s). Do none of these until he asks.
  A. Speed the whole video up 5%, voice pitch kept: saves about 4.5 s, no re-render.
  B. End card 3.6 s to 2.4 s: saves 1.2 s, no re-render.
  C. Photo lesson: drop the "starts all over again" replay after the error: about 3 s, re-render about 3 h.
  D. Street: two house moves instead of three: about 2.5 s, re-render about 1 h plus a new voice line.
  E. Cities: drop "One router can't reach that far": about 2 s, re-render about 1 h.
  My pick was A + B (about 84 s). All five: about 77 s.
- Current files: vertical internet-part1-v5.mp4 (latest sound). Wide internet-part1-wide-v1.mp4 still has the OLD sound (v3 mix); give it the v5 sound when Part 2 is joined.
- 26 Nov 2026: Harsh wants the hook very straight and fast with an expressive voice, like the Face ID Short (George, Kokoro bm_george, speed 1.18). Samples of a new hook line in four voices are in internet/voice/samples/. Line tried: "Flash a torch at your friend, and you've just built the internet. Seriously! That's all it is: light, blinking on and off." Waiting for his pick of voice and wording; nothing re-recorded or rendered yet.
- 26 Nov 2026: CORRECTION from Harsh: the Face ID Short's voice is Liam (ElevenLabs), not George. face-id/SCRIPT.md still says George in its draft header. Liam sample of the new hook: internet/voice/samples/hook-5-liam.mp3 (voice id TX3LPaxmHKxFdv7VOQHJ, model eleven_multilingual_v2, stability 0.4, style 0.35, speed 1.12). ElevenLabs uses his paid character allowance; this session's key cannot read the balance or the voice list. Ask before recording the full script.
- 26 Nov 2026: HOOK WORDING APPROVED by Harsh: "Flash a torch at your friend, and you've just built the internet. That's all it is: light, blinking on and off." RULE: say it in an expressive voice (Liam, ElevenLabs). Three expressive takes in internet/voice/samples/: A (multilingual v2, stability 0.3, style 0.55, speed 1.12), B (stability 0.2, style 0.8, speed 1.15, extra emphasis written into the text), C (eleven_v3 with [excited]/[amazed] tags, 7.7 s). Waiting for his pick before recording the rest of Part 1 with Liam.
- 26 Nov 2026: Harsh asked me to choose the take: chose A. Part 1 version 6 (vertical) in progress: all 34 lines re-recorded with Liam (voice/make_liam_voice.py, files in voice/liam/, 1,235 characters), same line start times so only the hook is re-rendered. The 2.5 s gap between the hook line and "On is one" is cut out, so the video is 87.6 s. Script: v3/render_part1_v6.sh. Output: internet/video/internet-part1-v6.mp4.
- 26 Nov 2026: Harsh approved simpler wording, all nine lines: "So we use a wire." / "Now the neighbours want to join too." / "The router reads the number and delivers the message." / "Send it as one big piece, and it blocks the whole line." / "One small error, and it has to start again." / "So the internet never sends it in one piece." / "It cuts the photo into about 2,000 small pieces, called packets," / "They share the wires with everyone else." / "Wire busy? Some take another path." On-screen chip now reads "the photo as one big piece". Version 7 = version 6 + these lines (v3/render_part1_v7.sh). Version 6 is not being delivered: its sound already carries the new lines.
- The 16:9 file still has the old voice, wording and sound. It needs a full re-render with the version 7 script and sound before it is joined with Part 2.
- 26 Nov 2026: Harsh said "wait, do not render, just note it". ALL RENDERING STOPPED. Do not render version 6 or 7 until he says so.
  Ready and saved, waiting for his go: Liam voice files for every line (voice/liam/), the approved hook, the nine simpler lines, updated captions in the scene code, rebuilt sound mixes, and the scripts v3/render_part1_v6.sh and v3/render_part1_v7.sh.
  When he says render: run render_part1_v6.sh first (it only needs to finish the six hook pieces; ignore its joined file), then render_part1_v7.sh (about 2 to 2.5 hours). Latest delivered file is still internet-part1-v5.mp4 (old voice).
