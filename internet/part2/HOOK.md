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
