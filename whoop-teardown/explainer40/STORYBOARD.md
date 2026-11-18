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
