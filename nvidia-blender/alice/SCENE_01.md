# Alice Huang Short — Scene 1 · Hook (0.0–3.5 s · frames 1–105 @ 30 fps · 1080×1920)

## Purpose
Stop the scroll. On frame 1, with sound off, the viewer must already know: this is about NVIDIA's CEO and a security/spy question.

## Voice-over (Kokoro am_michael, US, confident, ~1.25× pace)
"Did a woman U.S. officials suspect of spying for China get close to the most powerful man in AI?"
(20 words, ~3.3 s; starts at 0.15 s; ends ≤ 3.45 s)

## Picture (reuse — NO new Blender render)
Source: `renders/preview_frames/f_0001–f_0090.png` (existing GPU hook, already 1080×1920).
Retime 90 → 105 frames (play at 0.857×, frame-blended), so the beats land on the voice:

| Out time | Hook frames | What we see | VO word |
|---|---|---|---|
| 0.00–0.95 s | 1–24 | Macro on die/HBM edge, green pulses, pull-back reveal | "Did a woman U.S. officials…" |
| 0.95–1.80 s | 25–45 | Package rises, orbit, green flickers, red creeps in | "…suspect of spying for China…" |
| 1.80–2.70 s | 46–69 | Red wave sweeps board, subtle cracks (metaphor only) | "…get close to…" |
| 2.70–3.50 s | 70–90 | Fast push-in, dark set, red rim, top kept clear | "…the most powerful man in AI?" |

## New overlays (Remotion, on top of the frames)
1. **Red security-scan line** — 6 px horizontal bar, #E5484D at 70 %, soft 40 px glow, sweeps top→bottom 0.3–1.3 s, again 1.9–2.6 s. Leaves a faint red tint where it passed.
2. **Headline (visible on frame 1, no fade-in):**
   - Line 1: `WHO GOT CLOSE` — Inter Display ExtraBold 128 px, white
   - Line 2: `TO NVIDIA'S CEO?` — 128 px, NV green #76B900 → turns red #E5484D at 1.8 s
   - Top 220 px, centred inside safe area (L90 / R180), letter-spacing −3, shadow 0 6 30 #000
   - Tiny scale settle 1.04 → 1.0 over 0.3 s
3. **Tag chip (1.0 s →):** `ALLEGATIONS · NOT PROVEN` — white pill, black 34 px bold text, below headline (top ≈ 500 px).
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
