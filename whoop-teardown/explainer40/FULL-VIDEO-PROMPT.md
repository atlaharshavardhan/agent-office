```
PROJECT: "How WHOOP reads your body" - InvisiTech faceless 3D tech explainer
FORMAT: 1080 x 1920 (9:16), 30 fps, exactly 45.0 s, Instagram Reel + YouTube Short.
TOOLS: Blender (Cycles on the L4 GPU) for the hand, walking man, sleep bedroom and hero.
Three.js teardown model (whoop-pod-draco.glb) for the pod, x-ray and PPG scenes.
Remotion / HTML for captions, graphs and the end card. ffmpeg for the final cut.
NO Higgsfield. NO AI-generated video or meshes. NO slideshow: every shot moves.

GLOBAL LOOK
- Dark premium: charcoal background with a subtle warm gradient. Soft top key,
  cool rim from behind-left, warm rim right. Soft shadows, AO, glossy close-ups,
  controlled chrome reflections, very little bloom. Accent colour: WHOOP green
  light (#3CFF7A glow) only where the LEDs shine.
- Internals: glass x-ray shell (fresnel edges). Navy boards, gold pads, brushed
  steel, black glass chips, amber flex. No green PCBs. All parts stay inside the shell.
- Humans: faceless (cropped at the chin or in shadow). Indian medium-brown skin.
  Realistic hand and forearm (subsurface skin, knuckles, nails, five correct
  fingers, a little fine hair on forearm and back of wrist only). Bodies and
  clothes can be 2.5D toon-shaded.
- Band: black knit strap over the pod, thin chrome rim, chrome clasp plate with
  plain text "WHOOP". No screen. No other logos anywhere.
- Every 3D scene shows small text "Illustrative - not to scale".

MOTION RULES (match Harsh's reference Reel)
- The camera never stops: slow dollies, orbits and push-ins, ease-in-out.
- Join scenes with match-cuts (same shape or angle carries across), not fades.
- Hook: let the first moment play, no fast cuts in the first 1.5 s.
- No repeated whooshes. One clear motion idea per shot.

TEXT AND SAFE ZONES
- Captions: word-by-word, bold white with the key word highlighted, y 1250-1450.
- Titles / scene labels: y 220-450 only. Top 0-220 empty. Nothing at y 1500-1920.
- Subject: y 450-1500. Nothing right of x 940 below y 1100.
- Nothing (titles, captions, tags, cards, watermark) overlaps the subject.
- Watermark: InvisiTech logo at right-middle, hidden on the end card.

AUDIO
- Voice: Kokoro am_michael, speed 1.12, one continuous narration, scenes cut to the lines.
- Music: royalty-free dark ambient pulse bed, ducked under the voice. No copyrighted tracks.
- SFX listed per scene, subtle.

SCENES
S1 Hook (0.0-3.5) - Blender
  Close 3/4 on the WHOOP on the wrist, hand relaxed. Camera dollies in with a slight
  orbit. The skin turns see-through: veins and the radial artery appear, a pulse
  travels along them.
  VO: "This band has no screen. So how does it read your body?"
  SFX: a soft heartbeat starts.

S2 Inside (3.5-7.5) - Three.js
  Match-cut to the underside: a green glow pulses under the pod. The pod lifts off
  the wrist and the teardown comes apart in line (band, top shell, battery, main
  board, sensor board, bottom), slow orbit. The green LEDs switch on.
  VO: "That green glow comes from LEDs inside."
  SFX: 3 soft mechanical clicks, an LED tick.

S3 Blood and light (7.5-15.0) - Three.js
  Fly into a skin cross-section. Green light beams enter the tissue, scatter and
  come back to the photodiodes. Red blood cells flow and the vessel swells with
  each beat; the returning glow dims on each beat. Dots stream onto a graph at
  "26 readings / second" and form a PPG wave. The gaps between peaks light up
  with "ms" labels and the word HRV.
  VO: "Blood soaks up green light, so every heartbeat dims the glow. It reads that
  26 times a second, and the gaps between beats are your HRV."
  SFX: heartbeat synced to the wave, small data ticks.

S4 Steps (15.0-20.0) - Blender + Three.js
  2.5D faceless man walking side-on along an Indian city street at dusk (lit
  windows, chai stall, distant silhouettes), camera tracking alongside. Push in to
  the wrist, then match-cut into the x-ray pod: the motion chip (IMU) glows, 3 axis
  arrows swing with the arm, and an acceleration line spikes once per footstep while
  a step counter ticks up. A quick beat with hands on a trolley: no arm swing,
  the counter still ticks.
  VO: "A motion sensor feels each footstep as a spike and counts it, even when your
  arm isn't swinging."
  SFX: soft footstep ticks synced to the spikes.

S5 Gym (20.0-25.5) - Blender + overlay
  Dark gym, low-key light. Close on an arm doing a dumbbell curl with the band on the
  wrist. Motion trails show the speed of each rep. Beside it the heart rate climbs
  through coloured zones. Both stream into a circular Strain gauge that fills:
  "cardio load + muscular load". Small tag "Strength Trainer".
  VO: "In the gym, heart rate gives the cardio load, and wrist motion measures every
  rep, so Strain counts your lifting too."
  SFX: a soft dumbbell clank, a rising tone as the gauge fills.

S6 Sleep (25.5-31.5) - Blender
  Dark bedroom at night, cool moonlight from a window, warm hallway rim. Faceless
  person asleep on their side, wrist with the band on the blanket, chest slowly
  rising. Slow 8% push-in. Three lines (heart rate, breathing, movement) glide
  across the lower frame, get cut into 30-second blocks, and each block drops into
  a hypnogram: Awake / Light / Deep / REM. REM blocks show faster, uneven breathing;
  deep blocks show calm, even breathing.
  VO: "At night, it checks heart rate, breathing and movement in 30-second blocks and
  sorts each one into a sleep stage."
  SFX: slow breathing, a soft tick per block.

S7 Alcohol (31.5-34.5) - Three.js / HTML
  A wine glass catches the light. Cut to a Journal card: "Alcohol: Yes" (logged by
  the user). The next night's line shows a higher resting heart rate and lower HRV
  (illustrative).
  VO: "Log a drink, and your night can show it."
  SFX: a soft glass clink, a UI tick.

S8 Blood pressure (34.5-38.5) - Three.js
  An upper-arm cuff inflates once (calibration). Cut into an artery with a pulse wave
  travelling through it. Signals flow into a model and out as an estimated BP range.
  Label "WHOOP MG / Life". Small text "Wellness estimate - not a medical measurement".
  VO: "On MG, a cuff calibration lets it estimate blood-pressure trends."
  SFX: a short cuff hiss.

S9 Metrics (38.5-41.5) - Three.js
  All signal lines flow into the main chip on the board, then branch into cards:
  SpO2, Skin temp, Stress, Strain, ECG (MG), Healthspan. They settle into three
  rings: Sleep, Recovery, Strain (our own ring design, not WHOOP's app UI).
  VO: "All of it becomes recovery, strain and sleep."
  SFX: an electronic pulse per card.

S10 Hero (41.5-43.5) - Blender
  The pod reassembles in mid-air with a soft thunk, slow turntable, green rim light.
  Title: "YOUR BODY. DECODED."
  VO: "Your body, decoded."
  SFX: a soft assembly thunk.

END (43.5-45.0) - HTML
  The video's last frame in a rounded panel over a blurred copy. InvisiTech logo,
  "Invisi" + bold "Tech", @TheInvisiTech, Like / Comment / Follow, red Subscribe
  button, two-tone topic pill "Body decoded." No watermark.
  VO: "Follow InvisiTech for more."

FACT RULES
- Mark unverified details "Illustrative": LED / photodiode count, step and Strain
  graphs, sleep lines and hypnogram, alcohol pattern.
- WHOOP does not detect alcohol; the user logs it.
- BP Insights: MG + Life only, beta, needs cuff calibration, estimates only.
- ECG: MG / Life only.

DELIVERY
- Preview stills for each scene first, then wait for Harsh's OK. Then one full render.
- Renders and .blend files go to Drive InvisiTech/WHOOP explainer/renders/.
```
