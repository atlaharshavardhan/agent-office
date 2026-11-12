# AirPods Pro 3 earbud internals: what is modelled and where it comes from

Exploded view = one earbud, 10 parts (tip → stem). The case appears only assembled.

| # | Part | Facts on the card | Source |
|---|---|---|---|
| 1 | Foam-infused ear tip | Silicone with foam inside; five sizes XXS, XS, S, M, L | Apple tech specs; iFixit teardown |
| 2 | Heart-rate sensor | IR LED (wire-bonded die) with a photodetector below it, behind an IR window on the ear-facing surface; pulses 256×/s; skin-detect sensor | Lumafield CT teardown; Apple; iFixit ("infrared window") |
| 3 | Inward-facing mic + mesh | In front of the driver, facing the ear canal; feeds ANC and Adaptive EQ | Apple specs (inward-facing mic, Adaptive EQ); Lumafield (mic in front of driver) |
| 4 | Driver + amplifier | Custom high-excursion Apple driver; custom high-dynamic-range amplifier; destroyed if removed | Apple specs; iFixit |
| 5 | Battery | 0.221 Wh; up to 8 h ANC / 7.5 h Spatial Audio + head tracking; press connector; glued | iFixit; Apple specs |
| 6 | Accelerometers | Motion-detecting + speech-detecting | Apple specs |
| 7 | Outward mic + vent | Outward beamforming mic under the top mesh; pressure-equalisation vent; multiport acoustic architecture | Apple specs |
| 8 | Housing | 30.9 × 19.2 × 27.0 mm, 5.55 g, IP57; glued, 0/10 repairability | Apple specs; iFixit |
| 9 | H2 modules | H2 functions split across several BGA modules along the stem (one SiP in Pro 2); up to 2× more ANC than Pro 2 | Lumafield CT; Apple |
| 10 | Stem base | Touch control (press, swipe, press and hold); bottom beamforming mic between the charging contacts | Apple specs; Lumafield |

Not confirmed by any source, so not shown as fact: stem antenna position (only one unverified page), sensor suppliers
(Digitimes reports TASC photodetectors, unconfirmed), exact cell part number. Shapes and positions are approximate,
placed inside the real AirPods Pro shell ("AirPods Pro" model by Jed Falcone, CC-BY 4.0).

Sources: Apple AirPods Pro 3 tech specs (support.apple.com/en-us/125135, apple.com/airpods-pro/specs);
iFixit "AirPods Pro 3 Teardown: Still a Tragedy" (ifixit.com/News/113507); Lumafield "CT Teardown: AirPods Pro (3rd
Generation)"; TechInsights A3063 summary; coverage by MacRumors, Cult of Mac, Phone Repair Guru, AppleInsider.
