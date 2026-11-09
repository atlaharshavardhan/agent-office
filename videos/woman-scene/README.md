# Woman: Late and Expired OTP (Remotion)

24 s · 720 frames · 30 fps · 1920×1080, with George's voice (Kokoro `bm_george`) and synthesised sound effects. Every cut is snapped to the generated voice (`VO` and `S` in `src/WomanScene.jsx`).

| Shot | Frames | Voice | Picture |
|---|---|---|---|
| S1 | 0–75 | "But it's not always this fast." | Train (flat stand-in for the Blender cutback). Her mini-phone floats above her head; slow push 1.0 → 1.08 |
| Dive | 75–90 | | PHONE DIVE: the mini-phone springs to full frame (damping 18); the train blurs 0 → 12 px and darkens; whoosh |
| S2 | 90–126 | "Dive into her phone." | Full phone. The clock rolls back 9:41 → 9:21, the screen tint turns blue-grey and a "20 MIN EARLIER" chip appears. Film grain 0.06 through the flashback; rewind blip |
| S3 | 126–212 | "At the last station, she asked for a code," | Verify screen. The thumb taps the coral "Send code" button, it squashes to 0.94, a "Sending code…" toast appears and signal arcs rise |
| S4 | 212–296 | "with hundreds of people on one tower." | Her phone shrinks into a crowd of phones. One grey tower with red lights; "600+ phones · 1 tower"; crowd murmur |
| S5 | 296–372 | "Her code got stuck in the queue." | Push into "QUEUE · 1 AT A TIME". Her amber card waits with ⏳, its 3-minute life draining; cards bump forward on each tick |
| S6 | 372–465 | "It arrived minutes later, already expired." | Her card flies into her phone (9:26), turns grey #5B6782, the red EXPIRED stamp slams down with a thud. Label: "valid 3 min / arrived after 5" |
| S7 | 465–606 | "A code only lives a few minutes, so a late code is a dead code." | A code lives 3 minutes: the bar shows 0–5 min, her grey card arrives at 5, then "Late code = dead code" |
| S8 | 606–650 | | Reverse dive back into the train; colour returns; she sighs, head and shoulders drop |
| S9 | 650–720 | PA: "Itarsi Junction, in forty minutes." (`bf_emma`) | ITARSI JN station board + rail-alert popup; chime |

## Build
```bash
npm install
npx remotion render WomanScene out/woman-scene.mp4
```
To regenerate the voice and sound effects, see `tts/`. It needs the Kokoro model files from the kokoro-onnx GitHub release (`kokoro-v1.0.onnx`, `voices-v1.0.bin`).

```bash
python tts/gen.py tts/lines.txt tts/vo
python tts/sfx.py
```
After regenerating the voice, convert the WAVs to `public/audio/*.mp3`, then re-snap `VO` and `S`.
