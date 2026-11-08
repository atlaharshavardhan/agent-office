# Why you shouldn't spam Resend OTP (InvisiTech, Remotion)

A 10 s, 1080×1920, 30 fps explainer with four quick scenes, timed to the narration slots:

| Time | Narration | Scene |
|---|---|---|
| 0–3 s | "Code late? You tap Resend. Again. And again." | A thumb taps Resend 3 times. The button shakes harder each time (×1, ×2, ×3). |
| 3–6.5 s | "Now three codes, and the old ones may not work." | Three JM-MYBANK-T OTP texts stack up. The two older ones grey out, are crossed out and are stamped EXPIRED. |
| 6.5–8.5 s | "Wait for the countdown." | Resend locks with a padlock, and a big timer ticks 0:30 → 0:29. |
| 8.5–10 s | "Use the newest one." | The newest text is highlighted green, its code types into the boxes, then a green tick and "Verified". |

## Add the audio
Voice: vidIQ "George", a warm British male narrator. It comes out at 12.1 s, so fit it to the cut first:

```bash
npm install
scripts/prep-audio.sh ~/Downloads/voice.mp3 ~/Downloads/music.wav   # writes public/voice.mp3 + public/music.mp3
npx remotion render ResendOtp out/resend-otp.mp4
```

The composition picks up `public/voice.mp3` and `public/music.mp3` automatically if they exist. The music plays at 18% volume under the voice. Without them it renders silent.

Scene start frames are in `T` at the top of `src/ResendOtp.jsx`. After fitting the voice, nudge them if a line lands early or late.
