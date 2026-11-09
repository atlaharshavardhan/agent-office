# Why you shouldn't spam Resend OTP (InvisiTech, Remotion)

A 10 s, 1920×1080 (YouTube 16:9), 30 fps explainer with four quick scenes, :

| Time | On-screen text | Scene |
|---|---|---|
| 0–3 s | "Code late? You tap Resend. Again. And again." | A thumb taps Resend 3 times. The button shakes harder each time (×1, ×2, ×3). |
| 3–6.5 s | "Now three codes, and the old ones may not work." | Three JM-MYBANK-T OTP texts stack up. The two older ones grey out, are crossed out and are stamped EXPIRED. |
| 6.5–8.5 s | "Wait for the countdown." | Resend locks with a padlock, and a big timer ticks 0:30 → 0:29. |
| 8.5–10 s | "Use the newest one." | The newest text is highlighted green, its code types into the boxes, then a green tick and "Verified". |

## Render
Video only, no audio.

```bash
npm install
npx remotion render ResendOtp out/resend-otp.mp4 --muted
```

Scene start frames are in `T` at the top of `src/ResendOtp.jsx`. On your own machine, remove the `setBrowserExecutable` line in `remotion.config.js`.
