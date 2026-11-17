# Alice Huang Short — Scene 1 · Hook (0.0–3.5 s · frames 1–105 @ 30 fps · 1080×1920)

## Purpose
Stop the scroll. On frame 1, with sound off, the viewer must already know: this is about NVIDIA's CEO and a security/spy question.

## Voice-over (Kokoro am_michael, US, confident, ~1.25× pace)
"Did a woman U.S. officials suspect of spying for China get close to the most powerful man in AI?"
(20 words, ~3.3 s; starts at 0.15 s; ends ≤ 3.45 s)

## Picture (reuse the V2 hook shot — NO new Blender render)
Same shot as Scene 1 of `nvidia-market-collapse-v2-1080.mp4` (0–4.25 s): the GPU on the motherboard,
3/4 top-down, green → red, red crack lines spreading across the dies.
The V2 mp4 has the old "$2 TRILLION GONE" text burned in, so we rebuild the shot from the clean source frames
with the exact same motion as V2 (`BlendSeq dir="hook" first=30 last=90`, slow zoom 1.04 → 1.09, image lifted 150 px, top/bottom shade):
- Source: `renders/preview_frames/f_0030–f_0090.png` (1080×1920, already rendered)
- Retime: 61 source frames over 3.5 s (105 out frames, frame-blended) — slightly faster than V2's 4.25 s

| Out time | What we see | VO |
|---|---|---|
| 0.0–1.0 s | Chip sharp, green edge light, NVIDIA package fills the middle | "Did a woman U.S. officials…" |
| 1.0–2.2 s | Red light floods in, first crack lines appear on the dies | "…suspect of spying for China…" |
| 2.2–3.5 s | Cracks glow red across both dies, board goes dark red, slow push-in | "…get close to the most powerful man in AI?" |

The chip sits in the middle third (≈ 560–1150 px), so the headline goes above it and captions below — same layout as V2.

## New overlays (Remotion, on top of the frames)
1. **Red security-scan line** — 6 px horizontal bar, #E5484D at 70 %, soft 40 px glow, sweeps top→bottom 0.3–1.3 s, again 1.9–2.6 s. Leaves a faint red tint where it passed.
2. **Headline (visible on frame 1, no fade-in):**
   - Line 1: `WHO GOT CLOSE` — Inter Display ExtraBold 128 px, white
   - Line 2: `TO NVIDIA'S CEO?` — 128 px, NV green #76B900 → turns red #E5484D at 1.8 s
   - Top 220 px (same position as V2's "$2 TRILLION GONE"), centred inside safe area (L90 / R180), letter-spacing −3, shadow 0 6 30 #000
   - Tiny scale settle 1.04 → 1.0 over 0.3 s
3. **Tag chip (1.0 s →):** `ALLEGATIONS · NOT PROVEN` — white pill, black 34 px bold text, directly under the headline (top ≈ 500 px, above the chip).
4. **Captions:** sentence caption at 54 px, top 1262 px, "spying for China" highlighted red, "most powerful man in AI" green.
5. **Disclaimer:** `3D illustration · not affiliated with NVIDIA` — 22 px, 62 % white, top 1528, left 90.
6. Top/bottom shade gradients (0.7 / 0.4) so text always reads.
No watermark.

## Sound
- 0.00 s: low sub-bass hit (45 Hz, 0.6 s decay) + short digital "scan" tick.
- 0.3 s & 1.9 s: soft electronic scan sweep (filtered noise, rising 0.8 s), −20 dB.
- 1.8 s: tension drone fades in (dark minor pad), ducked −14 dB under voice.
- 2.7 s: second, deeper impact on the push-in. No whooshes.
- Mix target: −14 LUFS overall, true peak ≤ −1 dBTP.

## Must NOT
- No face/likeness of Alice Huang; no romance imagery; no news photos.
- Never state "spy" as fact on screen (the question + "ALLEGATIONS · NOT PROVEN" tag carry the attribution).
- No NVIDIA eye logo (word "NVIDIA" only).

## How it is made / where
- Built here (no rendering): Remotion component `alice/src/S1Hook.jsx`, timeline JSON, narration WAV.
- Rendered on the **GCP GPU VM** (invisitech-vm handoff): stills at 0.0 s, 1.0 s, 2.0 s, 3.0 s → `alice/stills/s01_*.png` for approval. Video only after approval.

## Approval checklist
- [ ] Headline readable on frame 1 at phone size
- [ ] Text inside safe margins, not over the chip's focal point after 2.7 s
- [ ] Red scan reads as "security check", not a glitch
- [ ] VO ends before 3.5 s
