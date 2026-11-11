# How Face ID works — standalone Short (draft, awaiting Harsh's approval)

Format: 9:16, ~42 s, English narration (George, Kokoro bm_george), 3D renders in the iPhone Duo reel style.
Cycle 1 slot: standalone Short (open slot, confirmed by Harsh on 11 Nov 2026).

## Fact sheet (every number in the script comes from here)

| Fact | Source |
|---|---|
| TrueDepth projects **more than 30,000** invisible infrared dots | CTA, Apple Face ID Security Guide |
| An infrared flood illuminator lights the face so the IR camera can see it, even in the dark | Apple Platform Security guide |
| The IR camera reads the dot pattern; it warps with depth → depth map (structured light) | Apple Platform Security guide (2D images + depth maps) |
| Matching runs in the **Secure Enclave**, a sealed part of the chip, using neural networks | Apple Platform Security guide |
| The face is stored as an encrypted **mathematical representation**; only the Secure Enclave can read it | Apple Platform Security guide |
| Captured images are **discarded** right after the maths is computed | Apple Platform Security guide |
| Face data is not sent to Apple or backed up to iCloud | Apple Face ID & Privacy page |
| Attention check (eyes open, looking) is **on by default**, can be turned off | Apple Platform Security guide |
| Random-person false match: **less than 1 in 1,000,000** (higher for twins, look-alike siblings, under-13s) | Apple Face ID Security Guide |
| Matching networks trained on over a billion images; extra network resists photos and masks | Apple Face ID Security Guide |

Sources:
- [Apple Platform Security guide (Aug 2026)](https://help.apple.com/pdf/security/en_US/apple-platform-security-guide.pdf)
- [Facial matching security — Apple Support](https://support.apple.com/guide/security/facial-matching-security-sece151358d1/web)
- [Face ID Security Guide (Nov 2017)](https://apple.com/business-docs/FaceID_Security_Guide.pdf)
- [Face ID & Privacy — Apple](https://www.apple.com/legal/privacy/data/en/face-id/)
- [CTA: The Labyrinth of Biometric Possibility](https://www.cta.tech/articles/the-labyrinth-of-biometric-possibility/)

## Script

| # | Time | Narration | Visual | Source |
|---|---|---|---|---|
| 1 | 0–3 s | Every time you unlock your iPhone, it fires over 30,000 invisible dots at your face. | Phone front; burst of glowing dots in "infrared vision" | code (3D) |
| 2 | 3–5 s | So how does it know it's you, not your photo? | Printed photo of the same face held to the phone; "?" | code (3D) |
| 3 | 5–8 s | Infrared light, like a TV remote's, lights you up even in the dark. | Room goes dark; face still lit in IR view | code (3D) |
| 4 | 8–15 s | Then the dots land on your face. A special camera sees the pattern warp around your curves, and builds a 3D map. | Dot grid wraps over nose and cheeks; IR camera; mesh face builds | code (3D) |
| 5 | 15–18 s | A photo is flat, so the map gives it away. | Same dots on the flat photo: flat grid, red ✕ | code (3D) |
| 6 | 18–21 s | But here's the clever part: it can tell if your eyes are shut. | Eyes-closed face, phone stays locked | code (3D) |
| 7 | 21–24 s | By default, it only unlocks if your eyes are open and looking. | Eyes open → padlock unlocks | code (3D) |
| 8 | 24–28 s | Your face becomes a secret code, sealed in a vault inside the chip. | Mesh → numbers → vault labelled "Secure Enclave" in the chip | code (3D) |
| 9 | 28–32 s | Apple puts a stranger's odds of unlocking it at less than one in a million. | Counter "< 1 in 1,000,000" | code |
| 10 | 32–35 s | And your face data never leaves your phone. | Cloud icon crossed out | code |
| 11 | 35–38 s | Follow InvisiTech for more. | End card; glide back to the opening shot (seamless loop) | code |

134 words, about 40 s at George's speed (1.18). Plus "3D illustration · not affiliated with Apple" for the first ~3 s.

**Credits:** 0. Everything is code/3D (three.js + Remotion, same pipeline as the iPhone Duo reel). Budget for a Short is ~21.

## Viewer panel (2 rounds, then locked)

Round 1 findings, fixed:
- The payoff landed at 22 s with nothing after it → added the "eyes shut" twist as a re-hook and moved it before the vault line.
- The vault line ran 8 s with the wrong order (map into the vault, then into numbers) → now one short line, and the odds are a separate beat.
- "30,000" → "over 30,000"; "one in a million" → "less than one in a million"; "by default" added to the attention check.

Round 2 findings, fixed:
- "Dots bend" → "pattern warps".
- "It knows if you're asleep / creepier" (it can't detect sleep) → "it can tell if your eyes are shut".
- "Its own chip" (the Secure Enclave is inside the main chip) → "a vault inside the chip".
- End card trimmed to ~3 s so the loop comes sooner.
