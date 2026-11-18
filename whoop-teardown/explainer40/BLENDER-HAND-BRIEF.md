# Blender brief: realistic hand + WHOOP (stills first)

For the render machine's Blender chat. Video name: **WHOOP explainer**. Approval: **3 preview stills first, then wait for Harsh's OK** (rule 11).

## Inputs
- `whoop-pod.glb`: our WHOOP model from the repo, real size in metres. Nodes `part_band` (knit strip over the pod, chrome frame and clasp plate with the plain "WHOOP" text), `part_top`, `part_battery`, `part_board`, `part_sensor`, `part_bottom`. Keep the parts as they are: same geometry, materials and look. The wrist strap that goes round the arm is **not** in the file; model it in Blender to fit the new wrist (black knit, same weave), so it runs into the pod's ends with no gap.
- Style references: `whoop-teardown/explainer40/storyboard-v2-sheet.jpg` and Harsh's reference Reel (frames in the chat).

## The hand (the main point)
- **Realistic adult forearm and hand, Indian skin tone (medium brown), faceless framing.**
- **Fingers and palm must be right:** five fingers with correct joints, knuckles, nails with cuticles, palm creases and a relaxed natural pose (fingers slightly curled). No melted or fused fingers.
- **Skin:** Principled BSDF with subsurface (random walk), a slightly warm subsurface colour, roughness about 0.45, fine pore bump and faint veins on the back of the hand. Slight sheen at grazing angles.
- **Hair:** a little fine dark-brown hair on the forearm and the back of the wrist (sparse, short, lying toward the hand). **None on the palm or fingers.** Use hair curves with thin strands.
- **Source:** a licence-safe human base (for example MPFB2 / MakeHuman CC0 assets) or a CC0 / CC-BY scanned hand, with the credit noted. No AI-generated meshes, no Higgsfield (rule 10), no real brand marks (rule 14) apart from the approved WHOOP plate text.

## Look (match our explainer)
- Dark charcoal background with a subtle warm gradient. Top key light (soft), a cool rim from behind-left, a warm rim right. Soft shadows, AO, controlled reflections on the chrome. Very little bloom.
- A faint green glow where the sensor touches the skin.

## Preview stills (1080 × 1920, Cycles, GPU if available)
1. **Top 3/4 on the wrist:** the band on the wrist, the hand relaxed toward bottom-right, fingers visible.
2. **Push-in frame:** close on the pod and strap, showing the skin detail and hair around the band.
3. **Palm-up:** the wrist turned over so the palm and fingers face camera and the pod's sensor side peeks under the wrist (this becomes the match-cut into our underside glow shot).

Safe zones: keep 220–450 px clear for the title, keep the subject between 450 and 1250 px, and keep nothing important right of 940 px below 1100.

## After approval (later message)
A 3.5 s push-in for S1 (camera dolly toward the band with a slight orbit, 30 fps), with a version where the skin turns see-through to show the vessels. Then the S8 hero turntable and the S4 sleeper (see SCENE4-BLENDER-BRIEF.md).

## Deliver to
Drive `InvisiTech/WHOOP explainer/renders/hand-previews/` (PNG) plus the `.blend`.
