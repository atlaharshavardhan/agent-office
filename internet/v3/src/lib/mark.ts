/* The channel watermark is no longer drawn inside the scenes: it is added in the final join (render_part1_v3.sh) as a horizontal,
   see-through strip that moves to a free spot in each scene. Set this back to 0.8 to draw the old vertical one. */
export const MARK_O = 0;
