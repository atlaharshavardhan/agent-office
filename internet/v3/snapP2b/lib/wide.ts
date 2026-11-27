/* 16:9 mode. The scenes were laid out for a tall 1080 x 1920 frame. For the wide film the same layout is drawn at WK scale in the
   middle of a 1920 x 1080 frame and the world is allowed to spill out to both sides (see <WideWrap>), so the picture fills the screen.
   WK = 0.72 puts the tall layout's safe zone (y 220 - 1500) exactly inside the wide frame's height. */
export const WK = 0.72;
let wide = false;
export const setWide = (w: boolean) => { wide = w; };
export const isWide = () => wide;
/* full-frame backdrops (sky, haze, vignette, grain) must reach the sides in wide mode: x and width of those rectangles */
export const fx = () => (wide ? -820 : 0), fw = () => (wide ? 2720 : 1080);
