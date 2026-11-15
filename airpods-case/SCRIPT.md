# AirPods in someone else's case — will they charge? (Short, script v3 — approved by Harsh 2026-11-15)

Format: 9:16, ~45 s, continuous narration (Michael, Kokoro am_michael), 3D in the AirPods case teardown style.
Hook = the swap itself; payoff = how the case charges.

## Fact sheet
| Fact | Source | Confidence |
|---|---|---|
| A same-model case charges another person's AirPods; you don't need to pair them for charging | Third-party guides (Burga, SmartNested, TechBloat) + Apple Community threads | Medium: consistent, but not stated by Apple |
| AirPods can be linked to only one Apple Account in Find My; to set up someone else's, remove them from the other account first | Apple Support HT212611 (via search) | High |
| iPhone shows a "Mismatched AirPods" / "AirPods Mismatch" alert when the AirPods in the case are a different generation or belong to someone else; the fix is to set them up again | Apple Support HT212611 (via search; support.apple.com is blocked in this cloud session) | High |
| Different model/generation AirPods don't work with another model's case | Third-party guides (Burga, TinyGrab); some disagree on 1st vs 2nd gen basic AirPods | Medium; say "a different model" only |
| Spring-loaded pins in each well press on the two metal contacts at the stem tip; magnets seat the bud | AirPods Pro 3 teardown page notes (iFixit / Lumafield) | High |
| One 1.334 Wh battery in the Pro 3 case (Pro 2 had two cells); up to 24 h listening with the case | iFixit teardown; Apple specs | High |
| Charging board controls charging (and has the UWB chip for Find My) | iFixit / Apple specs | High |
| Case charges by USB-C, MagSafe, Qi2 and an Apple Watch charger; copper coil + magnet ring | Apple specs; iFixit (magnets rearranged for MagSafe + Qi2) | High |

Sources:
- [Apple: If you get an alert that says "Mismatched AirPods"](https://support.apple.com/HT212611)
- [iFixit: How to pair replacement AirPods Pro to an AirPods Pro case](https://www.ifixit.com/Guide/How+to+Pair+Replacement+AirPods+Pro+to+Airpods+Pro+Case/156065)
- [Burga: Can you use someone else's AirPod case?](https://burga.com/blogs/news/can-you-use-someone-else-s-airpod-case)
- [SmartNested: Can AirPods work in a different case?](https://smartnested.com/can-airpods-work-in-a-different-case/)
- [TechBloat: Can you charge AirPods in someone else's case?](https://www.techbloat.com/can-you-charge-airpods-in-someone-elses-case.html)
- [Apple Community: Charge AirPods from a different case](https://discussions.apple.com/thread/7807820)
- [iFixit teardown: AirPods Pro 3](https://www.igeeksblog.com/ifixit-airpods-pro-3-teardown/) · [MacRumors: AirPods Pro 3 design](https://www.macrumors.com/2025/09/10/airpods-pro-3-design/)

## Script v1
| # | Time | Narration | Visual |
|---|---|---|---|
| 1 | 0–2.5 s | (music, no voice) | Two cases side by side; one bud moves from case A into case B, magnetic click, lid snaps, light glows; music cuts |
| 2 | 2.5–6 s | You just put your AirPods in your friend's case. Will they charge? | Close on case B, "?" over the light |
| 3 | 6–9 s | Yes — if it's the same model. The case doesn't care whose AirPods they are. | Light turns green; battery % ticking up |
| 4 | 9–17 s | Inside each slot, two tiny spring pins press on two metal dots at the tip of the stem. Magnets pull the bud down, so they always touch. | Glass x-ray; zoom into the well; pins and contacts glow |
| 5 | 17–23 s | Power flows from one big battery in the case, through a charging board, straight into the earbud's own battery. | Current path: battery → board → pins → bud battery |
| 6 | 23–30 s | And the case refills itself — with a USB-C cable, or wirelessly: a copper coil under the shell picks up power from a MagSafe charger. | USB-C plug; case on a puck, coil lights up |
| 7 | 30–38 s | But there's a catch. Your iPhone notices — it says "Mismatched AirPods", because the buds and the case were paired as a set. Set them up again, and they're yours. | iPhone pop-up; "Set up" tick |
| 8 | 38–42 s | Try a different model, though, and it won't work at all. | Different bud doesn't fit, red ✕ |
| 9 | 42–45 s | Follow InvisiTech for more. | End card |

~115 words. Credits: 0 (all code/3D, Canva only for the cover).

## Viewer panel (round 1) and what changed in v2
- Answer came too early (6 s), so Riya and Arjun would leave at ~9 s → v2 says "Yes… but your iPhone is about to call you out" and saves the catch.
- Pins / power path / case recharging were high risk and section 6 (MagSafe) was off-topic → cut to one plain 9 s explanation; case recharging removed.
- Kiran: "straight into the earbud's battery" is wrong (the bud's own charging chip controls it) → fixed; "different model won't fit" is misleading (different Pro generations look the same and fit) → now "can fit perfectly and still not work properly"; one bud vs "your AirPods" mismatch → both buds swap.
- Silent first 2.5 s is a swipe risk → on-screen text from frame 0, music under it.

## Script v2
| # | Time | Narration | Visual |
|---|---|---|---|
| 1 | 0–2 s | (music; on-screen text "Wrong case… will it charge?") | Both buds lift out of case A and drop into an identical case B with a magnetic click; lid snaps shut; music cuts |
| 2 | 2–5.5 s | You just put your AirPods in your friend's case. Will they charge? | Close on case B, "?" pulses over the status light |
| 3 | 5.5–8.5 s | Yes, they will… but your iPhone is about to call you out. | Light turns green; iPhone slides in from the side, screen still dark |
| 4 | 8.5–19 s | Inside each slot, two tiny spring pins touch two gold dots at the tip of the stem. Magnets snap the bud down, so they always touch. Power flows from the case battery, and a little chip inside the earbud decides how fast to fill it. | Glass x-ray of the case; zoom into the well; pins + stem dots glow; current path battery → pins → bud's charging chip → bud battery |
| 5 | 19–28 s | Now the catch. Your iPhone pops up "Mismatched AirPods". Your buds and your case were set up as a pair, so your iPhone notices they're not together. | iPhone pop-up "Mismatched AirPods"; a dotted link between the original case and buds breaks |
| 6 | 28–37 s | Charging still works. Put them back in their own case, or set them up again with this one — after your friend removes it from their Find My — and the warning is gone. | Buds hop back to case A; pop-up clears with a tick |
| 7 | 37–43 s | A different generation, though, can fit perfectly… and still not work properly. | Two look-alike buds; one drops in, red ✕ on the screen |
| 8 | 43–46 s | Follow InvisiTech for more. | End card |

~120 words, ~43 s with Michael at 1.12. Credits: 0.

## v2.1 (approved 2026-11-15)
Harsh approved v2 with one change: line 6 now says "after your friend removes it from their Find My", because AirPods can only be linked to one Apple Account in Find My (Apple HT212611, read through search results since support.apple.com is blocked here). About 130 words, ~45 s, still under the 50 s limit.

## Build notes (stills round 2, 2026-11-15)
- Cases engraved like Apple's free engraving, to tell them apart: "Harsha ⭐" (yours) and "Karan 🌙" (your friend's). Tags use the same names.
- Phone: iPhone Pro model from the HyperFrames registry block `vfx-iphone-device` (Apache 2.0), Apple logo hidden (rule 14), our own screen.

Credits for the description:
- "AirPods Pro" 3D model by Jed Falcone (CC BY 4.0, modified).
- iPhone model from HyperFrames (heygen-com/hyperframes, Apache 2.0).
- Phone screen: plain black glass, no reflections or shine (Harsh's choice).
- Pop-up rebuilt like the real iPhone alert Harsh shared (screenshot, 2026-11-15): white sheet, "Mismatched AirPods Pro", "The AirPods in the charging case do not belong to you and do not work together.", Left/Right AirPod "Not Yours" labels on a picture of the case (our own 3D case, not Apple's image). Fixed state: "AirPods Pro Connected", "Yours ✓".

## Script v3 (APPROVED 2026-11-15): Harsh's new order: hook → how AirPods charge → the swap
About 124 words, ~48 s with Michael at 1.12 (limit 50 s).

| # | Narration | Visual |
|---|---|---|
| 1 | (music; text "Wrong case… will it charge?") | Both buds jump from Harsha's case into Karan's case; lid snaps shut |
| 2 | You just put your AirPods in your friend's case. Will they charge? First, how does charging even work? | Close on Karan's case, "?" over the light |
| 3 | Two tiny spring pins in each slot touch two gold dots on the stem. Magnets hold the bud down. Power flows from the case battery, and a chip in the earbud decides how fast to fill it. | Glass x-ray: pins + gold dots + magnet, then the power path battery → pins → bud chip → bud battery |
| 4 | Your friend's case has the same pins in the same place. So yes, they charge. But your iPhone notices. | Back to Karan's case, light turns green; iPhone slides in |
| 5 | It pops up "Mismatched AirPods", because your buds and case were set up as a pair. | Real-style alert ("Not Yours"); the pair link breaks |
| 6 | Put them back in their own case, or set them up again after your friend removes them from Find My. | Buds hop home; "Connected" |
| 7 | A different generation can fit perfectly, and still not work properly. | Look-alike bud drops in, red ✕ |
| 8 | Follow InvisiTech for more. | End card |
- Alert card sized like the real one (Harsh's photo): lower half of the screen, small margins.
- Alert in iPhone dark mode (Harsh's screenshot): dark grey card, white text, red "Not Yours" / green "Yours ✓".
- Look: black studio like Apple's launch frames (pure black, top softbox + side rim lights), and huge white words behind the product with a small green line above in the hook ("Wrong case?") and the close-up ("Will it charge?"). Our own words, no logos.
- Behind the alert: dark-mode home screen with generic app icons (no real logos), blurred and dimmed as the card slides up.
- Phone wallpaper: purple (lilac/pink at the top into deep purple), apps blurred behind the card (Harsh's reference).
- Green accent (Apple launch green #63e06a), Inter font, stacked titles (small white / big green / small white; red for warnings), labels as dark tiles, green power path, end card as a tile grid with the case, facts, logo, @TheInvisiTech, Like/Comment/Follow, Subscribe.
- X-ray charging animation: green power flow, both bud batteries glow brighter as they fill, pins pulse, iOS-style battery widget (Left/Right rings 40% → 100%, Case 100% → 94%), note "Sped up · real charging takes longer".

## Sound plan (built with the voice, all made in code, no copyrighted audio)
| Moment | Sound |
|---|---|
| Hook: buds lift / fly | soft whoosh per bud |
| Buds drop into Karan's case | magnetic "tk" click ×2 |
| Lid shuts | firm plastic snap, then music dips for a breath |
| "?" / big words | low soft hit |
| X-ray turns to glass | glassy shimmer |
| Pins + gold dots touch | tiny metallic tick ×2 |
| Power flows | low electric hum rising while the green line travels |
| Battery widget fills | soft rising tone + gentle charging chime at the end (our own, not Apple's) |
| Light turns green / "Yes, they charge" | bright two-note ping |
| Phone slides in | short slide whoosh |
| "Mismatched" card | soft alert tone + card swoosh |
| Pair link breaks / red ✕ | glass crack + low buzz |
| Buds hop home / "Connected" | two clicks + success ping |
| Different generation drop / ✕ | click, then error buzz |
| End-card tiles | soft pops, one per tile |
| Music | dark, minimal electronic bed (Apple-launch feel), ducked under Michael |

## Copyright and trademark check (2026-11-15)
| Item | Where it comes from | Status |
|---|---|---|
| AirPods case, lid, buds (3D) | "AirPods Pro" by Jed Falcone, CC BY 4.0, modified | OK with the credit line in the description |
| iPhone (3D) | HyperFrames block `vfx-iphone-device`, Apache 2.0; Apple logo hidden | OK with the credit line |
| Case internals, pins, coil, battery, power path | Built by us in code | Ours |
| Voice | Kokoro TTS (am_michael), Apache 2.0 model | OK for commercial use |
| Music and every sound effect | Synthesised in `audio/make_sounds.py`; no samples, no Apple sounds | Ours |
| Fonts | Inter, Sora, IBM Plex (SIL Open Font License); emoji = Noto Color Emoji (OFL) | Free for video; no Apple font or Apple emoji used |
| "Mismatched AirPods Pro" card | Redrawn by us; wording quoted from the real alert; case picture is our own render | Low risk: a short quote of real interface text to explain it (commentary / education) |
| Home screen behind the card | Our own purple gradient and made-up app icons | Ours; the two icons that looked like Apple's (Photos flower, Activity rings) were replaced |
| Black studio look, big words behind the product, green accent, tile grid | A style, re-made with our own words and layout | Styles are not protected; no Apple image, slogan or logo is copied |
| "AirPods", "AirPods Pro", "iPhone", "Find My", "MagSafe" | Apple trademarks, used only as names to say what the video is about | Allowed as naming use; keep "not affiliated with Apple" (on screen in the hook + in the description) |
| InvisiTech logo, names "Harsha" and "Karan" | Ours / made up | Ours |

Things to avoid when publishing: Apple's own product photos or keynote clips in the cover, the Apple logo, Apple's slogans ("All-new", "Rebuilt from the sound up"), and copyrighted music added in the Instagram / YouTube app.

Description lines:
- "AirPods Pro" 3D model by Jed Falcone (sketchfab.com/jedlas012), CC BY 4.0, modified.
- iPhone 3D model from HyperFrames (github.com/heygen-com/hyperframes), Apache 2.0.
- 3D illustration, not to scale. Not affiliated with or endorsed by Apple. AirPods, iPhone and Find My are trademarks of Apple Inc.

## v2 change list (Harsh, 2026-11-15) — applied to the scene file; video not rendered until he says "render"
1. Hook: more space in the big "Wrong case?" words and between the two labels.
2. Subtitles centred on screen; one key word per line in green.
3. Engraving bigger. OPEN: which name on the friend's case (Karan, as now, or Harsha: `?swap=1`).
4. Charging scene: case centred and below the title, widget / subtitle / note on one centre line, missing right-side labels restored (a stray comment had disabled them).
5. A little more light on the AirPods.
6. End card: Case battery tile moved under "2 pins"; InvisiTech tile full width, bigger, green glow; fact tiles blur and dim; Like/Comment/Follow/Subscribe stays sharp.

## V2 "cinematic upgrade" (Harsh's brief, 2026-11-15) — 34.0 s
Narration (Michael, Kokoro am_michael 1.12), starts with the hook, no long pauses:
1. Your AirPods can charge inside your friend's case. But there's a catch. — WRONG CASE?
2. Inside every charging case is a tiny power system. — INSIDE THE CASE
3. When the earbuds snap into place, their metal contacts connect to the charging circuit. — CONTACTS CONNECT
4. Power flows from the case's battery, through its circuit board, and into the earbuds. — POWER FLOWS
5. But charging doesn't necessarily mean everything will work normally. — THE CATCH
6. A compatible case can charge your AirPods. But incompatible models may not fit or charge correctly. — COMPATIBILITY MATTERS
7. So yes. A different compatible case can charge your AirPods. — YES. IF COMPATIBLE.

One continuous take: every shot starts on the camera pose the last one ended on, and the last frame matches the first (loop).
Accuracy notes: warning card wording is Apple's real "Mismatched AirPods Pro" alert (Harsh's screenshots); 1.334 Wh = AirPods Pro 3 case (iFixit);
spring contacts + magnets per the Pro 3 teardown; "may not fit or charge correctly" is kept hedged, the on-screen label says "Different generation".
V1 scene file, voice and sound script are kept in `versions/v1/`.

## V3 (Harsh's "Final Cinematic V3" brief, 2026-11-15) — 45.0 s = 43.0 s film + 2.0 s InvisiTech signature
Narration unchanged from the 45 s V2 (`voice/lines.txt`). What changed:
- Native vertical look: the 3D picture fills the whole frame (floor, soft background lights, fog); the hard text bands are gone, replaced by soft scrims behind the headline and the subtitles.
- Cases staged diagonally at different heights and depths (yours lower-front, friend's upper-back).
- Scene 2: lid closes so the glass case is larger; scene 6: large upright iPhone above/behind the case; scene 8 ends on a hero shot.
- Scene 9: light pulse from the charging LED → logo → "InvisiTech" → "Tech Behind Our Daily Life" → light sweep. No buttons.
- V2 source kept in `versions/v2/source/`.
