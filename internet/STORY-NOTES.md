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
