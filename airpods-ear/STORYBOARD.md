# How do AirPods know they're in your ear? — YouTube Short storyboard (draft)

Format: 9:16, ~50 s. 3D in code (three.js), dark style, red = invisible infrared. No Higgsfield, no Canva (thumbnail only).
Model: AirPods Pro 3. Stills: `storyboard/shot1.jpg` … `shot6.jpg`, built by `storyboard.html?shot=N`.

## Fact sheet
| Fact | Source |
|---|---|
| AirPods Pro 3 have a **skin-detect sensor** (listed under Sensors) | Apple AirPods Pro 3 tech specs (apple.com/airpods-pro/specs) |
| It tells your ear apart from a pocket or a table and pauses when you take a bud out | Apple AirPods (3rd gen) press release, Oct 2021 (via MacRumors / 9to5Mac) |
| Older AirPods (1, 2, Pro 1) used optical sensors that bounce infrared light; they could be fooled by a pocket or a table | 9to5Mac, MacRumors, BGR (2021) |
| The skin-detect sensor uses short-wave infrared (SWIR) LEDs and InGaAs photodiodes | TrendForce report (via iClarified, 9to5Mac) |
| How it recognises skin (possibly water content) is **not confirmed** by Apple, so the script only says "reads the light that bounces back" | — |
| The H2 chip handles it and tells the phone to pause over Bluetooth | Apple specs (H2 chip); pause on removal is the Automatic Ear Detection setting |

## Shots
| # | Time | Visual | On screen |
|---|---|---|---|
| 1 | 0–3 s | Bud pulled out of the ear, player flips to Paused | "Pull one out… music stops." · "How did it know?" |
| 2 | 3–15 s | Shell goes see-through, sensor window glows red | "Inside: a skin-detect sensor" |
| 3 | 15–25 s | Bud in the ear, red light into skin, dashed light back | "It shines invisible light and reads what bounces back" |
| 4 | 25–35 s | Bud on a table, light comes back wrong, red ✕ | "Table or pocket? The light doesn't match skin" |
| 5 | 35–45 s | Signal runs sensor → H2 chip → Bluetooth to phone, Paused | "Sensor → H2 chip → your phone" |
| 6 | 45–50 s | Bud back in, player flips to Playing | "Skin = play. Anything else = pause." |

Internals and the sensor's exact position are illustrative. Credits for the final video description:
- "AirPods Pro" 3D model by Jed Falcone (sketchfab.com/jedlas012), CC BY 4.0, modified.
- Head scan "Lee Perry-Smith" by Infinite Realities, CC BY 3.0.
