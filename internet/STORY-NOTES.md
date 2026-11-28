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

## Part 1 review, 27 Nov 2026 (NOT FIXED YET: Harsh wants the list first, more notes coming, no rendering)
Harsh's points: (1) street router scene: the router itself cannot be seen (hidden under the ROUTER label and the 192.168.1.3 tag), and tags sit behind the captions (192.168.1.5); (2) the phone takes too much space, wants another plan; (3) needs camera zooms.
My review of version 5, frame by frame every 2 s:
- Photo lesson (55-83 s) is one fixed wide shot for 28 s; counters, LINE HELD, packet numbers are tiny; lower 40% of the frame is empty.
- Watermark sits on the action in several places (his balcony 0-3 s, home router area 56-66 s, "only #1597 sent again" label at 78 s) and jumps between spots.
- Caption line breaks leave one word alone on the second line ("too.", "box:", "city.", "far.", "way.", "wire.").
- 42.6 s: his and her face pins overlap, HOME ROUTER label cut; HYDERABAD plate half hidden; 44.6 s PUNE plate cut at the edge; 52.5 s "hop 2" label cut at the edge; 86 s MUMBAI label cut at the edge.
- 50.5 s: phone covers the PUNE plate and a router; map shows through the phone while it pops in.
- 54.5 s: after "Hello" arrives the screen is mostly empty and dark.
- Title card "This torch explains the internet" stays up while the caption says something different (two texts at once).
- 20.8 s card: small text "torch: ~40 s · wire: 0.00000004 s" is unreadable on a phone.
- Flight: the plane is on screen for about 1.5 s only since the shot was cut to 4 s.
- Liam speaks faster, so several lines leave longer pauses (version 7, not rendered).
- Fact simplification: 192.168.1.x are addresses inside one home network; the scene uses them as house numbers on a street.

## Part 1 version 8 plan, 27 Nov 2026 (built in code, preview stills sent, NOT rendered: waiting for Harsh's "render")
Harsh: "fix all", and his rule: FOCUS ON THE AREA BEING EXPLAINED. Close shots by default; go wide only when the whole picture is needed. For the hook: a closer shot with both of them on screen.
Done in code:
- Hook opens on a close two-shot (both balconies). Title card removed (it showed a second text over the caption).
- Wire scene stays on the two of them. House moves: the camera follows each move (hostel, friend's place), goes wide for "another" and the neighbours, close on the router, medium for the door numbers, wide for the delivery.
- Router drawn bigger with its name above; the 192.168.1.3 tag moved off it.
- Cities: faces no longer overlap at the start; city plates and hop labels fade out before the frame edge cuts them; phones are smaller (scale 1.0) and stand beside the person.
- Photo lesson: new camera (photoKeys in CityPhoto.tsx): close on him and his phone, follow the block, wide for "everyone waits", close on the error, close on him for the packets, follow one packet with a big "To: her phone / #0685" tag, wide for sharing wires and another path, close on the lost packet, close on the resend, close on her router and phone for the sorting. Her phone appears only in that last shot.
- Captions use balanced line breaks. "HELLO = 40 blinks" small line enlarged. Flight: the plane keeps normal speed for 1.9 s, the globe runs faster.
- Watermark: one fixed spot, top centre (x 330, y 156), 42% see-through.
Not changed: the 192.168.1.x simplification; Liam's shorter lines still leave some pauses.
16:9: the wide layout has not been adapted to these cameras and phone positions yet.
Render: v3/render_part1_v8.sh (full re-render, about 5 to 6 hours). Preview stills: v3/stills/v8/.

## Part 1 version 9 (vertical 9:16 ONLY), 27 Nov 2026: Harsh's list, built and sent as stills, render started
Harsh: do NOT render or make images for 16:9 now. Only 9:16.
- Names: he is Arjun (Hyderabad), she is Meera (Mumbai). Names chosen by me, Harsh did not give any. Shown on the phone headers and on the packet tag ("To: Meera's phone"). Narration still says she/her.
- Only two city plates remain: HYDERABAD and MUMBAI. Village names (Solapur, Pune) removed. Plates also fade out before the frame edge and stay out of the bottom margin (y over 1450).
- Third house move (new flat, "Then another!") cut out: street frames 832-888 and the same 1.9 s of sound. Her line "Then a friend's place. Another wire." now starts at 2.85 s. Video is 85.7 s.
- Watermark: middle-left (x 24, y 926), horizontal, 30% see-through, not on the end card (render_part1_v8.sh, MARK_X/MARK_Y/MARK_ALPHA).
- Captions: word by word (Kar and capAt in dusk/Extras.tsx): spoken words white, the word being said in a highlight box, the rest dim, accent words amber. Balanced line breaks. Caption zone y 1260-1450, right margin 150 (Instagram and YouTube Shorts safe area). Nothing important below y 1500 or right of x 940 below y 1100.
- Cards: heading card ("WITHOUT/WITH PACKETS") is one compact centred card; packet tag is a two-line card with its text inside; the "why" for 40 blinks ("Hello" = 5 letters x 8 blinks = 40) now shows on the first-person card (my reading of "this scene is missing why": Harsh may have meant something else).
- End card (Part 1 version only, EndCard p2): smaller logo and handle under the globe, not touching it; "PART 2 coming soon" card; torch small; everything above y 1480.
- Render: v3/render_part1_v8.sh fresh, short runs under 28 min. Estimated 8 to 10 hours (my earlier 5 to 6 hour guess was too low).
- 27 Nov 2026: Part 1 v8 (9:16 only) rendered, checked on 25 frames and sent: internet/video/internet-part1-v8.mp4 (85.7 s, 39 MB re-encode crf 23). Sound could not be listened to by me. 16:9 untouched and out of date (old voice, wording, cameras).
- 27 Nov 2026: Harsh: remove the continuous horn-like sounds in the HOOK (keep only 2 or 3 beeps). Done in the hook sound only (audio/bed-hook.wav, audio/sfx-hook.wav, make_hook_mix.py): no music plucks, no torch tone, no bit-by-bit beeps, no counter ticks, no movement sounds. Only 3 small beeps remain: "one", "zero" and the chime when the letter H lands. Faint plucks (gain 0.011) still run in the later parts. 6% speed-up applied in the join (SPEED=1.06).
- 27 Nov 2026: Harsh: 'fix those also' (horns). Removed the repeating music notes (plucks) from the whole video, not only the hook, and the 6 'photo sliced' beeps. Remaining beeps: one, zero, H chime in the hook; typing taps, send tap and arrival dings in the cities; send tap, resend beep and 'photo complete' dings in the photo lesson. Ask him which of those to remove if any still sounds like a horn.
- 27 Nov 2026: Part 1 v8 re-joined and sent again: card no longer covers her face, 6% faster (80.9 s), hook horn sounds removed and repeating notes removed everywhere. File internet/video/internet-part1-v8.mp4 (37 MB).
- 27 Nov 2026: Harsh: pauses between lines too long, move faster. Version 9: audio/retime.py plays every pause faster (pause over 0.3 s kept at 0.3 s + 35% of the rest; a 3.3 s pause became about 1.4 s) from the speech logs the mix scripts now write (audio/voicelog-*.json); speech stays at 1.06 speed. 85.7 s to 75.6 s. To rebuild: SPEED=1.0 OUT=<file> v3/render_part1_v8.sh, then python audio/retime.py <1x file> <out>. Files: internet/video/internet-part1-v9.mp4.
- 28 Nov 2026: pre-upload fixes (Harsh: "make all fixes"): (1) accuracy: line b1 is now "Imagine sending it as one big piece. It blocks the whole line." (Liam re-recorded; caption "Imagine" accented); (2) the phone message field says "Message" instead of "iMessage" (Apple trademark); (3) upload text prepared in chat. Not changed: the 192.168.x house numbers. Rendering: 19 CityAll pieces re-rendered via render_part1_v8.sh (SPEED=1.0), then audio/retime.py for the tight cut. Output: internet-part1-v10.mp4.
- 28 Nov 2026: Thumbnail (9:16 cover, no person, Canva only). Version 1: https://www.canva.com/M/MAHcF8qDKTM . Version 2 (globe and light centred, torch upright, warm light on blue): https://www.canva.com/M/MAHcF5LlycM (media id MAHcF5LlycM). Harsh's next change, NOT YET MADE because Canva said "credit usage is cooling down": smaller torch, much bigger globe (about half the frame) centred behind the headline, add a glowing router and a message bubble on the light path between torch and globe. Retry generate-image with imageReferences MAHcF5LlycM when the cooldown ends. Also no PNG export yet: create-design failed with quota_cooldown too.
- 28 Nov 2026: Part 1 version 10 FINAL candidate sent with the cover: internet/video/internet-part1-v10.mp4 (75.7 s, 40 MB) and internet/thumbnail/part1-cover-torch.png. Includes: Imagine line, Message placeholder, pause tightening, no horn sounds, hook rework. Upload text given in chat (title 'Build the Internet With a Torch? (Part 1)', description, tags, pinned comment about Part 2). Not done: Canva cover with router and message (cooldown); 16:9 version out of date.
- 28 Nov 2026: Subtitles for Part 1 v10: internet/subtitles/part1-v10.srt (35 cues, English), made by audio/make_srt.py: speech times from the mix logs mapped onto the delivered video by matching frames. Captions are already burned into the video, so the SRT is optional (YouTube Studio > Subtitles > Upload file; useful for accessibility, search and translations). Not for Instagram.
- 28 Nov 2026 (Part 2 hook): Harsh's hook idea: plane to London, then "how will you send a photo across the ocean? A satellite?" (satellite crossed out, nearly all goes through cables under the sea), then follow one photo. The GLOBE MUST ROTATE during the hook video (noted by Harsh, to do when building the hook). Pins are Google Maps style (red teardrop, white dot). New phones use the iPhone 18 Pro look (Cherry frame, smaller island). No render until Harsh says "render". Flicker cause: render 3D scenes with --concurrency=1 and run v3/check_glitch.py. See internet/part2/HOOK.md, SCENES.md, SCRIPT.md.
- 28 Nov 2026: PART 2 FIRST FULL CUT, 9:16, 43.2 s, result-first order: internet/video/internet-part2-v1.mp4 (17.5 MB), subtitles/part2-v1.srt. Harsh asked for it ("render now"). Order: Hyderabad (Arjun taps send, photo flies out of the window) -> London (Meera's phone buzzes) -> globe "How does a photo cross an ocean that fast?" -> packets -> tower and cable -> routers -> Mumbai coast -> sea floor with a ms counter 012 to 065 -> repeater -> globe -> notification zoom -> end card. Narration Liam (ElevenLabs, 12 lines, 629 characters, voice/p2/), played at 1.06; sound made in code (soft pad, send tap, notification ding and buzz, arrival chime; no whoosh, no repeating notes); word-by-word captions (ASS) inside the safe area; watermark 30% middle left. Scenes: Story.tsx (London room LOCKED, with a dog picture and Union Jack), HydRoom.tsx (Arjun's room, tricolour, Charminar), Hook.tsx, Final.tsx (ms counters). Scripts: v3/render_part2_final.sh (one worker, glitch check), audio/make_part2_final.py, audio/compose_part2_final.py, voice/make_part2_voice.py. Facts used: ocean crossing about 65 ms (about half of a typical 130 ms India to London ping); whole send "a second later" is a simplification (the upload takes about a second or two). Sound could not be listened to by me.
- 28 Nov 2026: PART 2 HOOK VIDEO (hook only, as asked): internet/video/internet-part2-hook-v1.mp4, 18.3 s, 9:16, subtitles/part2-hook-v1.srt. Order: Hyderabad tap (photo leaves) -> globe 0 ms -> sea floor (14 to 55 ms, racing light and speed streaks, readout) -> globe to London -> London buzz (hand reaches) -> notification zoom with the question "How does a photo cross an ocean that fast?". Narration Liam: h1, n1 (new, 74 characters), h2, h3. Speed readout: ms, km travelled (about 13,000 km in 65 ms), 200,000 km/s light in glass. Scripts: v3/render_hook_only.sh, audio/make_hook_final.py. The sound could not be listened to by me (mean -22.2 dB, peak -1.0 dB). The earlier full cut internet-part2-v1.mp4 stays for later.
- 28 Nov 2026: RULE (Harsh, repeated): free voice first for all drafts; ElevenLabs only when the script is final and he says so. Part 2 recorded 839 characters of ElevenLabs without asking (voice/p2/); do not record more. He disliked the line "Let's follow it".
- 28 Nov 2026: PART 2 HOOK v2, 12 s, 9:16: internet/video/internet-part2-hook-v2.mp4 (subtitles/part2-hook-v2.srt). Harsh's story hook: "Imagine the movement when you click send." Hyderabad tap, the dog photo (dog named ROCKY) breaks the window with glass sound -> globe 0 ms -> sea-floor light flare with ms, km and 200,000 km/s readout (18 to 53 ms) -> globe lands on London (65 ms) -> London room, her phone buzzes -> notification zoom, "So how did it get there?". Voice Liam: s1, g1, g2, g3, s4 (Harsh allowed ElevenLabs for the hook only; total used on Part 2 about 960 characters). Scripts: v3/render_hook12.sh, audio/make_hook12_audio.py, audio/compose_hook12.py, audio/make_glass.py. Sound not listened to by me.
- 28 Nov 2026: PART 2 HOOK v3 (final 12 s plan, rendered at Harsh's "yes render"): internet/video/internet-part2-hook-v3.mp4, 12.0 s, 9:16, 360 frames, no dropped frames, mean -20.2 dB, peak -0.9 dB; subtitles/part2-hook-v3.srt. Shots: Hyderabad tap + the carpet-paper dog photo breaks the window (glass sound) | globe 0 ms | light cable 1.5 s with one soft sound and the speed readout | globe + satellite "A satellite?" crossed out "Almost never", photo lands on London at 65 ms | London buzz | notification. Voice Liam: s1, g1, g2, q1, s4, s5. Scripts: v3/render_hook12c.sh, audio/make_hook12c_audio.py, audio/compose_hook12c.py. Known small issues: the satellite is small and sits under the readout, the red cross overlaps the km line; the counter jumps from 11 ms (end of globe shot) to 27 ms (start of cable shot). Sound not listened to by me.
- 28 Nov 2026: PART 2 HOOK v4 (Harsh's "strong hook" script, rendered on his "render now"): internet/video/internet-part2-hook-v4.mp4, 12.0 s, 9:16, 360 frames, no dropped frames, peak -1.7 dB; subtitles/part2-hook-v4.srt. Order: Hyderabad: the carpet-paper dog photo breaks the window at 1.0 s with "13,000 km -> 0.065 s" on screen ("You hit send. She gets it before you blink.") | globe with the satellite, red cross, "No" ("A satellite? No.") | the light cable with the speed readout ("Just light, through a cable under the sea,") | globe lands on London at 65 ms ("sixty-five milliseconds.") | London buzz | notification ("How? Let's see."). Voice Liam lines w1, n2, n3, n4, n5. ElevenLabs use for this hook: 214 characters (including an accidental re-record because two lines were both named n1: fixed by renaming). Scripts: v3/render_hook12d.sh, audio/make_hook12d_audio.py, audio/compose_hook12d.py. Sound not listened to by me. 10 s was considered but the 8.6 s of speech needs 12 s.
- 28 Nov 2026: PART 2 HOOK v5 with Harsh's own script and the FREE voice (Kokoro am_michael, speed 1.12, NO ElevenLabs): internet/video/internet-part2-hook-v5-free.mp4, 12.0 s, 9:16, no dropped frames, peak -1.8 dB; subtitles/part2-hook-v5-free.srt. Script (his): 0-3 He taps send, the window breaks: "Imagine sending a photo to your girlfriend in London." | 3-5 globe, satellite with a question mark: "You'd think it travels through a satellite," | 5-9 dive to the sea floor, light in the cable (11 to 65 ms readout): "but it actually crosses the ocean through a cable as light," | 9-10 her phone buzzes: "in a fraction of a second." | 10-12 notification: "But how?" Scripts: voice/make_part2_free_voice.py (needs the Kokoro model files from the kokoro-onnx release, downloaded to /tmp/kokoro-models), v3/render_hook12e.sh, audio/make_hook12e_audio.py, audio/compose_hook12e.py. NOT YET DONE: the new caption style (pill, highlighted word, free space) - captions are still the old white outline style, and sit on objects in the first shot. Sound not listened to by me.
- 28 Nov 2026: PART 2 HOOK v6 = v5 (Harsh's script, free voice Michael) with the NEW CAPTION STYLE: internet/video/internet-part2-hook-v6.mp4 (12.0 s, no dropped frames). Pill with rounded corners in each scene's own colours (dark plum in the rooms, deep night blue on the globe and the sea floor, brown in London), warm cream text, the spoken word in a rounded box (amber, gold, amber, coral, amber) with dark text. Positions (free space): Hyderabad = the wall left, under the window, above the desk; globe and sea floor = the sky at the left, left of the speed readout; London = the wall under the clock tag; notification = the empty part of the phone screen. Script: audio/make_caps_hook.py (Pillow, writes caps.mov with alpha), audio/compose_hook12f.py. Captions are no longer burned with ASS in this version.
- 28 Nov 2026: PART 2 HOOK v8 (Harsh's strict brief: no redesign, only camera, transition timing and narration): internet/video/internet-part2-hook-v8.mp4, 12.0 s, 9:16, no dropped frames, peak -1.3 dB. The v5-free shots are reused (zoom and pan over the rendered shots, crossfades while the camera moves): push-in to his phone -> accelerate through the window break -> pull out to Earth -> look at the satellite -> whip to the ocean -> forward tracking along the cable -> glide to London -> push-in on her notification. Narration (free voice Michael, no ElevenLabs): "You send a photo to your girlfriend in London. You'd think it travels through space, but it actually races across the ocean as light, through an underwater cable. But how?" Existing sounds kept (tap, glass, soft cable tone, buzz and ding, notification chime). Two small scene changes asked by Harsh: the satellite sits outside the globe with dots running only towards the Earth; the "13,000 km -> 0.065 s" tag is removed from the first shot. Captions: approved pill style, CENTRED, bottom band (y 1290) or the wall strip in the first second; on objects when there is no free space. Scripts: voice/make_hook_v8_voice.py, audio/make_hook_v8.py (camera), audio/make_hook_v8_final.py (mix, captions, join), v3/render_hook_v8_pieces.sh. The ms and km readout of v5 is still in the globe and cable shots (kept because Harsh said not to redesign). Sound not listened to by me.

## 28 Nov 2026 - SOUND GUIDE from Harsh (overrides the older "no whoosh" rule for Part 2): Hooks = Bass Impact, Zoom In = Quick Whoosh, Transitions = Camera Shutter, Text popping up = Soft Pop, Captions = Keyboard Typing, Reveals = Metallic Riser, CTA = Bell Ding. All made in code, kept quiet. Used in internet/audio/make_part2b_final.py.

## 28 Nov 2026 - STRUCTURE Harsh wants us to follow (Reels "perfect structure"): 01 Hook, 02 Lead, 03 Body 1, 04 Open loop, 05 Body 2, 06 Open loop, 07 Body 3, 08 CTA.
Mapping for Part 2: Hook = locked 12 s (v10). Lead = your phone, send, photo breaks. Body 1 = ones and zeros, encrypted, nothing to see. Open loop = "but where do the packets go?" Body 2 = packets, label, mobile tower. Open loop = "and then it must cross an ocean...". Body 3 = glass cable, light, (next parts). CTA = follow (Bell Ding sound).

## 28 Nov 2026 - RULE (Harsh): do NOT create or send .srt subtitle files until he says. Make the video only. (Earlier videos have srt files already; leave them alone, make no new ones.)
