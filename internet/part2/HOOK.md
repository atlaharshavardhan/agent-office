# Part 2 hook (Harsh's idea, 28 Nov 2026) - stills only, nothing rendered
1. Plane clip (3 s): "Imagine your girlfriend moves to London."
2. Globe (3 s): "You send her a photo. How does it cross the ocean? A satellite?" (satellite with a question mark)
3. Globe (1.5 s): "Almost never." (red cross over the satellite)
4. Globe (3 s): "Nearly all of it goes through cables under the sea." (cables light up)
5. Phone (3 s): "Let's follow one photo." then Scene 1.
Fact: TeleGeography says the "over 99% in cables" figure is true (https://blog.telegeography.com/2023-mythbusting-part-3); it has no exact satellite share. Say "nearly all", no exact number.
Open: direction of the route (the globe stills still show London to Hyderabad; flip once Harsh decides).
Code: v3/src/v4/Hook.tsx (HookGlobeV), Snap.tsx (SnapV). Stills: v3/stills/p2/.

## NOTE from Harsh (28 Nov 2026): the globe ROTATES in the hook video
When the hook video is built (not yet), the globe must slowly rotate (turn) in beats 2 to 4, not stay still. Keep the pins on their cities as it turns (pins hide when a city turns to the far side). Currently HookGlobe in v3/src/v4/Hook.tsx uses fixed late Planet frames (camera held), so the rotation still has to be added. Do not render until Harsh says "render".

## Hook globe timing, built as stills (28 Nov 2026), as Harsh described: ONE ROTATION FIRST, no points, then the pins, then the explaining
0 to 4 s: the globe turns one full turn (chip: "How does a photo cross the ocean?"). No pins, no cables, no satellite.
4.2 s: Google Maps pins drop on London, then Hyderabad (0.3 s later).
5.4 s: satellite flies in with "?" ("A satellite?").
7.2 s: red cross ("Almost never").
8.4 s: the cables under the sea light up ("Nearly all of it goes through cables under the sea").
Total 11 s (330 frames). Code: Hook.tsx (HookGlobeV) with overrides in Planet.tsx (ov.lon, ov.show, ov.pins). Stills: v3/stills/p2/rotation.png.

## NEW HOOK STORY (Harsh, 28 Nov 2026): replaces the satellite-first idea as the opening; DIRECTION DECIDED: Hyderabad to London
"Imagine your girlfriend moved to London." Then: Hyderabad, his finger taps send (photo of the Charminar) -> the photo flies over the globe (pins, cables) with a millisecond counter -> London: her phone lies charging on the table, window beside it shows London (Big Ben, London Eye, red bus, rain), 3:42 pm -> phone lights up with a notification (Arjun, Photo) -> camera zooms in on the lock screen.
Warm colour theme (not all blue): plum, coral, amber, teal curtain. iPhone 18 Pro look.
Timing facts: Hyderabad to London is about 7,700 km straight (light in glass needs at least 39 ms); real cable routes are longer, typical India to London ping is about 130 ms round trip, so about 65 ms one way across the ocean (https://anuragbhatia.com/post/2025/06/india-europe-high-latency/). The whole photo send takes longer (about a second or two, mostly the phone upload): never claim 65 ms for the whole send.
Code: v3/src/v4/Story.tsx (HydSendV, FlyGlobeV, LondonRoomV, NotifV); Planet.tsx route now Hyderabad to London. Stills: part2/storyboard/story-board.png. Globe rotation (one turn first, then pins) still applies to the globe beat.
Follow-up still needed: flip the later clips (packets tag "TO: MEERA - LONDON", chat with Meera, arrival on her phone, shore = Indian coast) to Hyderabad to London.

## London room, Harsh's markup on v3 (28 Nov 2026) and what v4 does
Teal curtain and teal rug circled = colour not liked -> mustard curtain, terracotta rug with cream and gold border. Charging removed (no socket, plug or cable). Desk made longer (full width) with a drawer and a rug in front, so it reads as furniture. Pen lies aside. Both hands on the table, typing on the laptop (fingers move); on the notification she stops and the right hand goes to the phone. Phone smaller (about half as long as the laptop is wide, like a real 6.3 inch phone next to a 14 inch laptop). More detail: laptop screen with document and chart, sticky note, keyboard rows and trackpad, plant, glasses, mug with LONDON. Code: LondonRoom in v3/src/v4/Story.tsx.

## London room v5 (28 Nov 2026): Harsh's refinement list applied in Story.tsx (LondonRoom, Window, Hand/Limb, Lock)
Timeline (5 s, 150 frames, unchanged): 0 to 1.2 s both hands type; 1.2 s phone buzzes, lights up with 3:42 and one banner, typing pauses, left hand stays; 1.55 s right hand lifts; 1.85 to 3.0 s the right arm reaches diagonally (sleeve, wrist and hand move together, index finger extends, others curl, thumb on the correct side); 3.0 to 3.4 s fingertip rests on the banner; 3.4 s the banner presses in with a glow and a ripple; "ding! bzzzt" is gone by 2.4 s.
Desk: plant pot rests on the desk with its own shadow and leaves clear of the laptop; laptop has a hinge, keys in perspective rows, a spacebar and a centred trackpad; notebook has a centre fold, pen lies beside it, the phone overlaps the left page a little with a contact shadow; mug has rim, coffee surface, open handle, steam from the coffee; lamp has a wide base, stem, socket and shade, its light pool lies on the desk.
Window: sill only a little wider than the frame; curtain on a rod with rings and folds; rain, skyline and bus are clipped to the opening; one bus pass over the whole scene; tower clock at 3:42; the LONDON label sits left of the window.
Check that is still to do when rendering: use --concurrency=1 and v3/check_glitch.py. Stills: part2/storyboard/london-v5/.

## London room v6 (28 Nov 2026): Harsh said v5 was perfect, plus
Laptop screen is a document ("Script - Part 2 (draft)") with the script typed live (the 4th line types in until the phone buzzes, cursor blinks); hands keep moving while she types (fingers tap, wrists sway). The London Eye is no longer static: its spokes and pods turn slowly (one turn in about 20 s) and it sits in the left pane behind the Houses of Parliament; Big Ben stays in the right pane. Rain falls faster all the time (80 streaks plus a few slow drops). Stills: part2/storyboard/london-v6/.

## London room v7 (28 Nov 2026): the "LONDON 3:42 pm" tag is replaced by a wall clock and a plaque
Wall clock at 3:42 (hour hand 111 deg, minute hand 252 deg, red second hand sweeping) on the left wall; plaque under it: LONDON, 3:42 pm, Saturday 28 November GMT, Raining over the Thames, Hyderabad is 5 h 30 min ahead (9:12 pm). Time check: 3:42 pm GMT = 9:12 pm IST (UTC+5:30). Stills: part2/storyboard/london-v7/.
(v8, same day: Harsh did not want the plaque card; the "LONDON · 3:42 pm" tag is back at the top left and the wall clock hangs just below it.)
