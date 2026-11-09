# Late and Expired OTP: phone scene (Remotion)

19.7 s · 590 frames · 30 fps · 1920×1080, phone-only cut (no woman or train shots), with George's voice (Kokoro `bm_george`) and synthesised sound effects. Every cut is snapped to the generated voice (`VO` and `S` in `src/WomanScene.jsx`).

| Shot | Frames | Voice | Picture |
|---|---|---|---|
| Open | 0–56 | "But it's not always this fast." | Her phone, now (9:41) |
| Rewind | 56–96 | | The clock rolls back 9:41 → 9:21, blue-grey tint, "20 MIN EARLIER" chip, film grain 0.06; rewind blip |
| S3 | 96–182 | "At the last station, she asked for a code," | The thumb taps the coral "Send code", it squashes to 0.94, a "Sending code…" toast appears and signal arcs rise |
| S4 | 182–266 | "with hundreds of people on one tower." | Her phone shrinks into a crowd. **Her request goes up:** phone → tower → BANK ("makes your code"). The bank makes her amber code and passes it to the SMS CENTRE ("your mobile operator"), which drops it into the tower's queue. "600+ phones · 1 tower" |
| S5 | 266–342 | "Her code got stuck in the queue." | "← WAITING FOR A FREE SLOT · 1 AT A TIME": codes wait at the tower to come **down**, and one at a time leaves the front and drops to a phone. Her card waits with ⏳ while its 3:00 life drains |
| S6 | 342–435 | "It arrived minutes later, already expired." | The card lands at 9:26, turns grey, EXPIRED stamp; "valid 3 min / arrived after 5" |
| S7 | 435–590 | "A code only lives a few minutes, so a late code is a dead code." | Life bar 0–5 min, then "Late code = dead code" |

## Build
```bash
npm install
npx remotion render WomanScene out/phone-scene.mp4
```
To regenerate the voice and sound effects, see `tts/`. It needs the Kokoro model files from the kokoro-onnx GitHub release (`kokoro-v1.0.onnx`, `voices-v1.0.bin`).

```bash
python tts/gen.py tts/lines.txt tts/vo
python tts/sfx.py
```
After regenerating the voice, convert the WAVs to `public/audio/*.mp3`, then re-snap `VO` and `S`.
