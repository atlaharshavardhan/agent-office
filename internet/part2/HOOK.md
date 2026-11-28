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
