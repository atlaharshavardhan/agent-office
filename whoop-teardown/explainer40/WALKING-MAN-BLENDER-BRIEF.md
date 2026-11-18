# Blender brief: walking man with WHOOP (2.5D, realistic hand), stills first

For the render VM's **WHOOP explainer** chat. Scene S4 "Steps" in storyboard v3 (15.0–20.0 s). Approval: **3 preview stills first, then wait for Harsh's OK** (rule 11).

## Style reference
`walking-style-ref.png`: Harsh's reference frame. A flat 2.5D man walking side-on in front of dark city blocks with warm lit windows, faceless (cropped at the chin), soft gradients and rim light. Match this look, but make **the hand and forearm much more realistic** than the reference.

## Look: 2.5D in Blender
- **Body and clothes:** stylised, not photo-real. Simple clean shapes with toon-style shading (Shader to RGB plus a colour ramp with 3–4 soft steps), a gentle gradient and a thin warm rim on the back edge. EEVEE is fine for these; Cycles if the hand needs it.
  - Olive-green cotton shirt, sleeves rolled to the elbow, chest pocket, small buttons, stitched seams.
  - Dark indigo jeans with a fine diagonal twill and light-orange stitching, black belt, phone in the back pocket.
  - Faceless: the frame cuts at the chin, or the head is in shadow. No face anywhere.
- **Hand and forearm (the focus, realistic):** reuse the realistic hand from `BLENDER-HAND-BRIEF.md` (same skin, same source).
  - Medium-brown Indian skin with subsurface warmth.
  - Correct knuckles, tendons, nails with cuticles, five properly jointed fingers, relaxed mid-swing pose.
  - Faint veins on the back of the hand. A little short, fine dark hair on the forearm and back of the wrist only (none on palm or fingers).
  - Blend it into the 2.5D body with the same rim light and colour grade, so it looks premium rather than pasted on.
- **WHOOP band:** `whoop-pod.glb` (`part_band` and the shell parts) on the left wrist. Model the strap loop around this wrist (black knit). No screen. Only the plain "WHOOP" text on the plate, no other logos (rule 14). A faint green glow where the sensor meets the skin.
- **Background:** flat planes of dark charcoal-brown city blocks with a grid of warm amber emissive windows, slight depth-of-field blur, a few dark flat silhouettes of people in the distance, pavement in deep shadow. Make it an Indian city street at dusk (a small chai stall or shop shutter is fine), no readable signs.
- **Light:** low-key and warm. A soft key from the front-top, a warm rim from behind, very little bloom.

## Preview stills (1080 × 1920)
1. **Wide walk:** the man side-on, mid-stride, like the reference. Torso between 450 and 1500 px, wrist and band at about y 1100–1200 and x 340–560.
2. **Mid push-in:** halfway zoom toward the wrist, with the hand and band filling the middle third. Shows the skin detail and hair.
3. **Close on the band:** the pod side-on at the same angle as our x-ray Steps shot, so it can match-cut into the 3D teardown (motion chip glowing).

## Safe zones
Keep 220–450 px clear for the title, keep the subject between 450 and 1500 px, and keep nothing important right of 940 px below 1100 (rules 16–17). No text in the render; captions are added later.

## After approval (later message)
A 5.0 s shot at 30 fps:
- A walk cycle (about 1 s per stride), camera tracking alongside, then a slow push-in from shot 1 to shot 3 over the last 2 s.
- The arm swings naturally and the band stays locked to the wrist bone.
- A second 1.5 s variant: hands on a shopping trolley (no arm swing), for the line "even when your arm isn't swinging".

## Rules
No Higgsfield (rule 10). No AI-generated meshes. Licence-safe human base (MPFB2 / MakeHuman CC0, or CC0 / CC-BY assets), credit noted. Faceless.

## Deliver to
Drive `InvisiTech/WHOOP explainer/renders/walking-previews/` (PNG) plus the `.blend`.
