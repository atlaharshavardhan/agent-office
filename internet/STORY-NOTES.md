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
