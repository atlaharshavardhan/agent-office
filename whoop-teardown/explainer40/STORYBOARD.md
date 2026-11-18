# WHOOP: 40 s cinematic explainer, storyboard v1 (for Harsh's OK)

Format: 1080 × 1920, 9:16, 30 fps, exactly 40.0 s, Reel/Shorts safe zones.
Build: Scenes 1–3 and 5–8 in Three.js on the existing teardown model (this repo, render.js + ffmpeg).
Scene 4 (sleeping person, bedroom) in Blender on the Home PC, delivered as a 6 s clip.
Voice: Kokoro am_michael at 1.12. Music bed ducked under the voice, plus subtle SFX (heartbeat, electronic pulse, assembly clicks). No repeated whooshes.
Watermark right-middle, hidden on the end card. "Illustrative · not to scale" on every 3D scene.

| # | Time | Visual | Voice (draft) | SFX |
|---|------|--------|---------------|-----|
| 1 | 0.0–4.0 | WHOOP on the wrist. Camera pushes in. The skin turns see-through and shows vessels, with a pulse travelling along them | "This band has no screen. So how does it read your body?" | soft heartbeat starts |
| 2 | 4.0–8.0 | The teardown comes apart in line: band and clasp, top shell, battery, main board, sensor board, bottom housing. Green LEDs switch on | "Inside: a battery, a tiny processor, and green LEDs." | 3 soft mechanical clicks, LED "tick" |
| 3 | 8.0–14.0 | Skin slice: green light scatters into tissue and back to the photodiodes. Red cells flow and the vessel swells with each beat. The returning light becomes a PPG wave, and the gaps between beats are highlighted (HRV) | "Blood soaks up green light, so every heartbeat dims the glow. The gaps between beats are your HRV." | heartbeat synced to the wave |
| 4 | 14.0–20.0 | **(Blender, PC)** A stylised person asleep in a dark cinematic bedroom, chest gently breathing. Heart-rate, breathing and motion lines merge into a sleep-stage timeline: Awake / Light / Deep / REM | "At night, heart rate, breathing and movement combine into your sleep stages." | slow breathing bed |
| 5 | 20.0–25.0 | A glass, then a Journal entry: "Alcohol: Yes" (logged by the user). Two overnight patterns side by side (illustrative): higher resting HR, lower HRV, Recovery possibly lower | "Log a drink, and that night can show a higher resting heart rate and lower HRV." | glass clink (soft), UI tick |
| 6 | 25.0–31.0 | An upper-arm cuff calibrates. Cut into an artery with a pulse wave. Overnight signals flow into a model and come out as estimated BP ranges. Label: **WHOOP MG / Life**. Small text: *Wellness estimate — not a medical measurement* | "On WHOOP MG, a cuff calibration lets it estimate blood-pressure trends." | cuff pump hiss (short) |
| 7 | 31.0–37.0 | Signals flow into a central chip, then branch into cards: SpO₂, Skin temp, Stress, Strain, ECG (MG), Healthspan. They end on three rings: Sleep, Recovery, Strain (our own ring design) | "All of it feeds models for oxygen, stress, strain and more." | electronic pulses, one per card |
| 8 | 37.0–38.5 | The pod reassembles. Hero shot with a slow turn and green rim light. **YOUR BODY. DECODED.** | "Your body, decoded." | soft assembly thunk |
| End | 38.5–40.0 | End card in the video's theme: the pod in a rounded panel over blur, logo, Invisi**Tech**, @TheInvisiTech, Like / Comment / Follow, red Subscribe, topic pill "**Body** decoded." | "Follow InvisiTech for more." | — |

Voice draft is about 95 words. It will be timed with the real Kokoro audio, and each scene will be cut to its line (rule 18).

## Fact check (rule 7)
- Optical PPG, 26 samples/s: official. 5 LEDs + 4 photodiodes: unverified, shown as illustrative.
- HRV from the time between beats: standard method.
- Sleep stages Awake / Light / Deep (SWS) / REM: official WHOOP stages. Exact algorithm inputs are not public, so the scene shows "heart rate, breathing and movement" as illustrative inputs.
- Alcohol: WHOOP does **not** detect alcohol. The user logs it in the Journal. Higher RHR and lower HRV after drinking are shown as illustrative patterns.
- Blood Pressure Insights: WHOOP MG with the Life membership, beta, needs cuff calibration, gives estimates only. Label as briefed plus the disclaimer.
- ECG: MG / Life only. SpO₂ and skin temperature: Health Monitor. Stress Monitor and Healthspan: Peak and Life.
- Rings: our own ring design, not a copy of WHOOP's app UI. The only WHOOP text is the name, as approved.

Sources: WHOOP / Business Wire launch release; the5krunner 5.0 / MG spec page; WHOOP "Which membership is right for you".

## v2 (after Harsh's feedback: real 3D scenes, more depth). Proposed timing, still exactly 40.0 s

| # | Time | Keyframe | Voice (draft) |
|---|------|----------|---------------|
| S1 | 0.0–3.5 | keyframes/S1-wrist-anatomy (skin turns see-through, pulse in the vessels) | "This band has no screen. So how does it read your body?" |
| S2a | 3.5–5.5 | explainer-stills/1-underside-glow | "That green glow underneath…" |
| S2b | 5.5–8.0 | explainer-stills/5-exploded-green-leds (teardown comes apart, LEDs on) | "…comes from green LEDs inside." |
| S3a | 8.0–9.8 | ppg-stills/1-green-light-in | "Their light goes into your skin." |
| S3b | 9.8–11.6 | explainer-stills/6-blood-cell-green-light | "Blood soaks up green light…" |
| S3c | 11.6–13.4 | ppg-stills/2-blood-soaks-light | "…so every heartbeat dims the glow." |
| S3d | 13.4–15.2 | ppg-stills/3-26-readings-a-second | "It reads that 26 times a second…" |
| S3e | 15.2–17.0 | ppg-stills/4-gap-between-beats (label HRV) | "…and the gaps between beats are your HRV." |
| S4 | 17.0–21.5 | Blender (PC), mock in frames/S4 | "At night, heart rate, breathing and movement become sleep stages." |
| S5 | 21.5–25.5 | keyframes/S5-alcohol-journal | "Log a drink, and your night can show it." |
| S6 | 25.5–30.0 | keyframes/S6-blood-pressure | "On MG, a cuff calibration lets it estimate blood-pressure trends." |
| S7 | 30.0–35.0 | keyframes/S7-signals-to-metrics | "All of it feeds oxygen, stress, strain and more." |
| S8 | 35.0–38.5 | keyframes/S8-hero-decoded | "Your body, decoded." |
| End | 38.5–40.0 | frames/S9 (end card) | "Follow InvisiTech for more." |

Change from v1: Scene 3 grows from 6 s to 9 s (5 beats); S1, S2, S5, S7 and S8 are tightened to make room.

## v3 (Harsh: add steps, gym and a sleep animation; up to 45 s is fine). Proposed, exactly 45.0 s

| # | Time | Visual | Voice (draft) |
|---|------|--------|---------------|
| S1 | 0.0–3.5 | Wrist push-in, skin turns see-through, pulse in the vessels (Blender hand) | "This band has no screen. So how does it read your body?" |
| S2 | 3.5–7.5 | Underside glow, then the teardown comes apart with the LEDs on | "That green glow comes from LEDs inside." |
| S3 | 7.5–15.0 | PPG: light into skin, blood soaks the green light, 26 readings a second, the gaps between beats (HRV) | "Blood soaks up green light, so every heartbeat dims the glow. It reads that 26 times a second, and the gaps between beats are your HRV." |
| **S4 Steps (new)** | 15.0–20.0 | The walking man on the street, then a match-cut into the x-ray pod: the motion chip (IMU) glows, 3 axis arrows move with the arm, and the acceleration line spikes once per footstep. Each spike adds to a step counter. A second pass with no arm swing (hands on a trolley) still counts | "A motion sensor feels each footstep as a spike and counts it, even when your arm isn't swinging." |
| **S5 Gym (new)** | 20.0–25.5 | An arm doing a dumbbell curl. Motion trails show the speed of each rep (accelerometer and gyroscope). Heart rate climbs through coloured zones beside it. Both flow into a Strain gauge: cardio load plus muscular load. Tag "Strength Trainer" | "In the gym, heart rate gives the cardio load, and wrist motion measures every rep, so Strain counts your lifting too." |
| **S6 Sleep (expanded)** | 25.5–31.5 | Blender bedroom, person asleep, chest breathing. Three lines (heart rate, breathing, movement) are cut into 30-second blocks; each block drops into a hypnogram row: Awake / Light / Deep / REM. REM blocks show faster, uneven breathing; deep sleep shows calm, even breathing | "At night, it checks heart rate, breathing and movement in 30-second blocks and sorts each one into a sleep stage." |
| S7 | 31.5–34.5 | Glass, Journal "Alcohol: Yes", the night after (illustrative) | "Log a drink, and your night can show it." |
| S8 | 34.5–38.5 | Cuff calibration, artery, BP range, "WHOOP MG / Life", wellness disclaimer | "On MG, a cuff calibration lets it estimate blood-pressure trends." |
| S9 | 38.5–41.5 | Signals into the main chip, then the metric cards and three rings | "All of it becomes recovery, strain and sleep." |
| S10 | 41.5–43.5 | Pod reassembles, hero turn, **YOUR BODY. DECODED.** | "Your body, decoded." |
| End | 43.5–45.0 | Themed end card | "Follow InvisiTech for more." |

New SFX: footstep ticks synced to the spikes (S4), a soft dumbbell clank and a rising tone as the Strain gauge fills (S5), slow breathing under S6.

### Fact check for the new scenes (rule 7)
- Steps: counted from the accelerometer. The newer algorithm on WHOOP 5.0 / MG is meant to count steps with little arm swing (treadmill, pushing a trolley) and works on the wrist or bicep. The exact algorithm is not public, so the spike-per-step graph is **Illustrative**.
- Gym: Strength Trainer uses the accelerometer and gyroscope to measure rep speed and intensity (muscular load), which feeds Strain with heart-rate (cardio) load. WHOOP says it can detect strength training on its own; logging the exercises improves accuracy. How the two loads are combined is not public, so the gauge is **Illustrative**.
- Sleep: sleep is detected from changes in heart rate and movement. Staging uses a model trained on lab sleep studies (polysomnography); it sorts 30-second blocks into Wake, Light, Slow Wave (Deep) and REM, using heart rate, HRV, breathing rate and movement. The REM vs deep breathing difference is from WHOOP's own article. Lines and hypnogram are **Illustrative**.

Sources: WHOOP Steps page and the5krunner (Oct 2024); idevice.com on the 5.0 / MG no-arm-swing update; WHOOP Strength Trainer press release (Business Wire, Apr 2023) and "How WHOOP measures muscular load"; WHOOP "The WHOOP approach to measuring sleep" and "How well WHOOP measures sleep".
