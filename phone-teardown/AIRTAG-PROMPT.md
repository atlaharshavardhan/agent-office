# AirTag 3D teardown — prompt

Create an interactive 3D teardown of an Apple AirTag as a single HTML page (three.js), plus a 1920×1080, 30 fps video of its guided tour.

**Look (make it look like the real AirTag)**
- Glossy white polycarbonate face, slightly domed, 31.9 mm across and 8.0 mm thick.
- Polished mirror stainless-steel back cap with the Apple logo in the centre and the small printed text ring.
- Dark studio background, soft key light, white rim highlights; real reflections from a studio environment map.
- Thin, clean part labels with leader lines; an info card for the selected part.

**Parts (exploded front to back, 7 layers)**
1. White enclosure — one-piece polycarbonate shell, no holes; IP67 once the cap is on. About 11 g with the battery.
2. Antennas — thin traces around the rim, away from the metal: one for Bluetooth LE, one for Ultra Wideband (Precision Finding).
3. Logic board — a ring-shaped board with the speaker in the middle: Bluetooth LE chip, Ultra Wideband chip, NFC chip, accelerometer.
4. Speaker — copper voice coil around a small magnet; the whole tag vibrates as the speaker, so no speaker holes. Plays for Play Sound and for unwanted-tracking alerts.
5. Battery tray and contacts — plastic tray, three springy metal contacts, bayonet tabs for the twist-lock cap.
6. CR2032 coin cell — 3 V lithium (~225 mAh), about a year of use, user-replaceable.
7. Stainless steel cap — press and twist anticlockwise to open; metal kept on the side away from the antennas.

Each part card: name, one-line role, two or three plain-English sentences, and three short spec chips.

**Interaction**
- Drag to rotate, scroll or pinch to zoom, tap a part to focus it (other parts fade), Explode slider, Play tour button.
- Works on phone and desktop; controls never cover the part list.

**Guided tour → video**
- Starts assembled with a slow turn showing the white face, then the steel back with the Apple logo.
- Explodes into the 7 layers, then visits each part for a few seconds (camera move + its card), then reassembles and twists the cap shut.
- About 65 seconds. Render the tour frame by frame (headless Chromium → ffmpeg) to `airtag-teardown.mp4`.

**Accuracy notes**
- Dimensions, IP67, CR2032 and the chip list follow Apple's specs and public teardowns (iFixit). Proportions are approximate; not affiliated with Apple.
