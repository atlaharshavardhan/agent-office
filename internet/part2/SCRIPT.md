# Part 2 script (draft 1, direction A: London to Hyderabad)
Agreed by Harsh on 28 Nov 2026 ("you have everything right"). Not rendered.
Meera (London) sends a photo to Arjun (Hyderabad).

1. Now Meera is in London. She takes a photo.
2. She taps send.
3. Her phone cuts the photo into about 2,000 small packets.
4. First stop: a radio signal to the nearest cell tower.
5. From the tower, a glass cable under the street.
6. Routers pass each packet along, hop by hop.
7. Road jammed? A packet takes another path.
8. Then the land runs out. The cable goes into the sea.
9. Three kilometres down, on the sea floor, the packets are just light.
10. Light fades, so every so often a repeater boosts it.
11. The cable is thin. Glass fibres, wrapped in layers to protect them.
12. This is how the photo crosses the ocean.
13. On the other side, the packets leave the sea and head for Hyderabad.
14. Arjun's phone puts them back in order.
15. The photo appears. The whole trip takes a moment.
16. Follow for the next part.

## Clip check against Part 1 rules (from stills)
- 01 London: caption text is faint; fine otherwise.
- 02 Packets: phone header says "Her", chat says "Show me the street!"; change to Meera. Packet count text must be about 2,000 for a photo (clip says "1 video / 1,500 packets").
- 03 Underground: ok; small labels too small for a phone.
- 04 Routers: tag "TO: HER . LONDON" is the wrong way round; must say Arjun / Hyderabad.
- 05 Shore: shows the Mumbai coast; for London to Hyderabad it must be the UK coast leaving, and arrival on the Indian coast (Mumbai landing is real, then onward to Hyderabad). Needs a re-render or a re-label.
- 06 to 08 Seabed, repeater, cable layers: no direction, keep. Labels tiny.
- 09 Planet: route drawn Mumbai to London, labels MUMBAI and LONDON; Part 1 rule says show only two city names: LONDON and HYDERABAD.
- Text in several clips is below the readable size for a phone.
- Facts to verify before use: "95%+ of data between continents in undersea cables", "200,000 km/s", cable repeater spacing "every 50 to 100 km".

## 28 Nov 2026 - scene after the hook: your phone, packets, encryption (Harsh approved the pictures; tower comes later)
No names. Squares for the photo blocks, rectangles for packets. Free voice first, ElevenLabs only after Harsh says final.
1 (0-3 s) "Let's start where the photo starts: your phone, in Hyderabad. You tap send." Picture: tap send, camera zooms into the phone until the dog photo fills the screen (stills pf0, z1, z2), then it breaks into pieces (e1).
2 (3-6) "First, the photo breaks into tiny pieces."
3 (6-9) "Each piece is just ones and zeros."
4 (9-11) "Your whole photo, only ones and zeros."
5 (11-14) "Then your phone locks it. It is encrypted."
6 (14-18) "If anyone tries to look, they find nothing. Only noise."
7 (18-22) "Now it is cut into about 2,000 packets."
8 (22-27) "Every packet gets a label: where it is going, where it came from, and its number, so the pieces can be put back in order."
9 (later) "Then radio waves carry them to your Wi-Fi router or the nearest mobile tower."
Board: part2/storyboard/part2-packets-board.png. Stills: v3/stills/p2/enc/ and v3/stills/p2/pk/. Code: v3/src/v4/Encrypt.tsx, PacketsHyd.tsx.

## 28 Nov 2026 - tower scene (Harsh: after the packets, go straight to the cell tower and explain; no radio-waves-over-city shot)
a (0-3 s) tower from below, label "Mobile tower": "Next, a mobile tower, close to you."
b (3-6) antennas close: "Its antennas catch the radio waves."
c (6-10) box at the foot: "A box at the bottom turns them into light, and sends them down a glass cable." (usually fibre; some towers use microwave links, say "usually")
Stills: v3/stills/p2/tw/t2-t4.png. Code: v3/src/v4/TowerHyd.tsx (3D, reuses the Packets.tsx tower). First draft, needs polish.

## 28 Nov 2026 - after the tower box (Harsh's references: box glows, cable under the ground, light goes in, light races)
d (10-13 s) "At the bottom, a box turns the signal into light." (tower box with glow, still tw/t4.png)
e (13-17 s) "It sends that light down a glass cable, buried under the street." (cutaway, fb/f2.png) then the light enters (fb/f3.png)
f (17-20 s) "Inside, the light races." (fb/f4.png)
Code: v3/src/v4/FibreHyd.tsx (2D). First drafts.
