# iPhone Duo: spec check before rendering

Checked against Apple's iPhone Duo spec pages, Apple's Duo guide, Apple newsroom, and teardown/hands-on reports (iFixit, MacRumors, Engadget, Android Authority, MacObserver). ✅ = model and Short match. 🔧 = was wrong and is now fixed. ⚠️ = approximation, noted.

## Body
| Spec | Source value | Model |
|---|---|---|
| Open size | 164.6 × 117.8 × 5.2 mm | ✅ |
| Closed size | 84.1 × 117.8 × 11.3 mm | ✅ (closed stack 11.3 mm) |
| Weight | 254 g | ✅ (in text) |
| Frame | Grade 5 titanium, mirror-polished | 🔧 was matte; now mirror-polished navy |
| Front / back glass | Ceramic Shield 2 front, Ceramic Shield back | ✅ |
| Colours | Night Sky, Star White | ✅ Night Sky |
| Water/dust | IP68 | ✅ (in text) |

## Displays
| Spec | Source value | Model |
|---|---|---|
| Inner | 7.6″, 2670 × 1878, 430 ppi, 10 ultrathin layers, nano-texture, up to 120 Hz | ⚠️ drawn with a ~2 mm bezel to match hands-on photos (Apple measures 7.6″ as a full rectangle, so the visible border looks thinner than the spec math). Text says 7.6″ |
| Inner camera | Under-display 1080p FaceTime camera | 🔧 had a visible punch-hole; now hidden under the display |
| Outer | 5.4″, same aspect ratio as inner, ~90% of iPhone 18 Pro area | ⚠️ thin ~1.5–2 mm bezel to match photos; straight edge on the hinge side |
| Outer camera | 12 MP Center Stage in a punch-hole | ✅ top outer corner |
| Brightness | 1000 typ / 1600 HDR / 3000 outdoor nits | ✅ (in text) |

## Controls and ports (placed from Apple's Duo guide diagram, scaled to 164.6 × 117.8 mm)
Open, inner screen facing you (camera half on the right):

| # | Apple label | Model position |
|---|---|---|
| 1 | Under-display FaceTime camera | camera half, ~34 mm right of centre, near the top |
| 2 | Volume buttons | top edge, just right of the camera (two ~10 mm buttons) |
| 3 | Side button / Touch ID | outer edge of the camera half, upper part, ~19 mm long, slightly raised |
| 4 | Camera Control | same edge, about three-quarters of the way down; ~14 mm, about ¾ of the side button length (matches photo) |
| 5 | USB-C connector | bottom edge of the cover-screen half, ~¼ from the left (with speaker and mic grilles) |
| 6–8 | Ultra Wide, Main, flash (mic slot above flash) | wide pill at the top outer corner of the back |
| 9 | Center Stage front camera | top outer corner of the cover screen |

No Action button. Top and bottom speakers per Apple's repair manual (earpiece slit + bottom grille).

## Cameras
| Spec | Source value | Model |
|---|---|---|
| Rear | 48 MP Fusion Main (26 mm, ƒ/1.6) + 48 MP Fusion Ultra Wide, 12 MP 2× crop, no telephoto | ✅ two lenses + flash; text updated |
| Layout | Pill across the back at the top outer corner of the camera half, flash toward the hinge | ✅ matches reference photos |

## Inside
| Spec | Source value | Model |
|---|---|---|
| Chip / modem / wireless | A20 Pro, C2, N1 (Wi-Fi 7) | ✅ |
| Logic board | Single layer + separate I/O board, linked by flex through the hinge | ✅ |
| Batteries | 2,962 + 1,921 mAh (≈4,883 mAh), electrically released adhesive | ✅ |
| Hinge | 100+ parts: gears, springs, joints; 3D-printed Grade 5 titanium **cover**; waterdrop fold | 🔧 text said the whole hinge was 3D-printed; now "100+ parts under a 3D-printed titanium cover" |
| Charging | MagSafe + Qi2 up to 25 W, USB-C (USB 3, 10 Gb/s) | 🔧 MagSafe coil + magnet ring added behind the logo |
| SIM | eSIM only | ✅ no SIM tray |
| Speakers | Not published for the Duo | ⚠️ standard iPhone layout used: loudspeaker grille right of USB-C, mic grille left, earpiece slit above the cover screen |
| Internal part positions | Not published | ⚠️ approximate, based on teardown descriptions |

## Short script lines
| Line | Source | Status |
|---|---|---|
| ₹2,99,900 | Indian launch price (256 GB) | ✅ |
| 5.2 mm thin | Apple specs | ✅ |
| ~10 thin layers that slide | Apple (10 ultrathin layers), iFixit | ✅ |
| Hinge | | 🔧 caption now "a hinge of 100+ parts" + "gears · springs · 3D-printed titanium cover" |
| Teardrop / waterdrop curl | iFixit | ✅ |
| Crease deepens with repeated folds | Android Authority, MacObserver | ✅ |

## Internal layout (checked against Apple's internal image of the iPhone Duo, front view)

| Part | Apple's image | Model (v4) |
|---|---|---|
| Hinge | Full-height strip; two long modules (springs, "eye" cams, rollers) + black twin-bar centre | ✓ rebuilt to match |
| Logic board + A20 Pro | Camera half, column beside the hinge, A20 at mid-height, top bar under the camera module | ✓ moved here (was in the other half) |
| Battery 1 | Large cell filling most of the non-camera half | ✓ enlarged (66 × 70 mm footprint) |
| Battery 2 | Camera half, tall cell beside / below the board | ✓ |
| Rear cameras | Top outer corner of the camera half | ✓ |
| Under-display selfie camera | Camera half, near the top, ~70% across the open screen | ✓ |
| Earpiece | Top of the non-camera half | ✓ added |
| USB-C + loudspeaker | Bottom of the non-camera half (Apple's Duo guide diagram) | ✓ |
| Board chips besides A20 | NAND, modem, wireless, PMIC — names are typical for 2026 iPhones, not confirmed by Apple for the Duo | ⚠ illustrative |
