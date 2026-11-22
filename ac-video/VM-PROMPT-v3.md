```
AC video v2: new narration (replaces my earlier handoff message that said "about 89 s")

Goal: remake the full AC video (AC-full-v1-1080.mp4, 76.4 s) with Harsh's new approved
narration. Same story and visuals, new voice-over in plain everyday English, "let's build
our own AC" style: every part first says WHY we need it, then introduces it.
New length: about 1:52 (112 s).

1. PROJECT
   - Work from the AC project that made AC-full-v1-1080.mp4: ~/invisitech/agent-office-ac
     (air-conditioning/, Blender + Remotion, origin/claude/nvidia-video plus your local changes).

2. NARRATION (already made, use it as-is)
   - git fetch origin claude/whoop-teardown, then take the folder ac-video/narration-v3/:
       line01.wav ... line22.wav  (Kokoro bm_george, en-gb, speed 1.15, same voice as v1, 24 kHz)
       narration-v3.srt           (the exact text of each line + timing with 0.35 s gaps)
       AC-narration-v3-george.mp3 (full track, -14 LUFS, for reference)
   - Script text: ac-video/SCRIPT-casual-v3.md (also on Drive InvisiTech/Handoff/AC-full/AC-script-v3-why-first.md).
   - Place each lineNN.wav on its shot. Gaps between lines can be changed to fit the picture
     (0.2-0.8 s); do not speed up or change the voice.

3. SHOT PLAN (line -> what is on screen)
   1  Hot room 35C, window opens          12 Outdoor fan blows heat, gas -> liquid
   2  Fan in window, still hot air         13 CONDENSER label
   3  Ice block in front of fan, 32C       14 WHY valve: liquid still warm + squeezed
   4  Ice melts, tray overflows, puddle    15 EXPANSION VALVE appears ON "a tiny valve",
   5  Back to 35C ("build our own ice")       pressure drops, cold, flows back inside
   6  Copper coil, liquid boils to gas     16 Water beads on the cold coil
   7  EVAPORATOR label                     17 DRAIN pipe, drop outside
   8  WHY compressor: gas full of heat,    18 WHY thermostat: keeps cooling forever
      35C outside, heat flows hot->cold    19 Thermostat: compressor ON -> OFF at set temp
   9  Compressor squeezes, glows hot       20 WHY filter: dust on the wet coil, then filter
   10 COMPRESSOR label                     21 Ducts to other rooms
   11 WHY condenser + second coil outside  22 Final room, "you just built an AC" -> end card

4. STRETCHING THE PICTURE (76 s -> about 112 s)
   - First use slow holds with a gentle camera push or drift so nothing looks frozen.
   - Where a hold would be longer than about 3 s with no motion (likely lines 8, 11, 14,
     18-20), render extra Blender frames on the L4 (OPTIX, same samples as v1) to keep the
     camera and flows (refrigerant dots, heat arrows, water drops) moving.
   - Line 15: the expansion valve must appear right on the words "a tiny valve", not before.
   - Line 20 needs a filter visual if v1 has none: a simple mesh filter sliding in front of
     the indoor coil, in the same style. Show me a still before animating it.

5. CAPTIONS, LABELS, AUDIO
   - Word-by-word captions re-timed to the new audio (same style and position as v1).
   - Keep the on-screen labels (EVAPORATOR, CONDENSER, EXPANSION VALVE, DRAIN, temperatures).
   - Keep the v1 music bed (ducked under the voice) and SFX, moved to the new timing. No whoosh.
   - Watermark right-middle as in v1; end card as in v1.
   - Final mix -14 LUFS.

6. APPROVAL
   - First send me 4 stills (line 8, line 15 on "a tiny valve", line 19, line 20 filter)
     and wait for my OK. Then render the full 1080x1920 30 fps draft.
   - 4K only after I approve the draft.

7. CHECK AND DELIVER
   - ffprobe (1080x1920, 30 fps, about 112 s), loudness -14 LUFS, no black frames,
     captions match the voice.
   - Upload to Drive InvisiTech/Handoff/AC-full/AC-full-v2-1080.mp4 (stills to AC-full/v2-stills/).
   - Tell me the link, the length and the render time.

Rules: no Higgsfield, no brand logos, faceless. Facts in the script were checked
(heat flows hot to cold; compressing heats the gas; the valve's pressure drop cools it;
the cold coil condenses water; the thermostat cycles the compressor; dust on the coil cuts airflow).
```
