# NVIDIA: How NVIDIA Lost $2 Trillion. v1 script and storyboard

- **Length:** 45.000 s (1,350 frames at 30 fps). The story runs 0–43 s and InvisiTech branding runs 43–45 s.
- **Format:** 9:16.
- **Audience:** US tech, AI and business viewers.
- **Narration:** 109 words, American English. The voice is Michael (Kokoro `am_michael`), with a confident documentary delivery at speed 1.15, raised to 1.22–1.24 on the hook and on the three shocks.
- **Facts:** every number comes from `RESEARCH.md`, with figures as of the Nov 16, 2026 close.
- **Before publishing:** re-check after the Nov 17 (Q3 FY2027) earnings report.

## Narration with timestamps

| Time (s) | Narration | Fact / source (RESEARCH.md) |
|---|---|---|
| 0.35–4.08 | In six weeks, NVIDIA lost two trillion dollars in market value. | $5.77T on Oct 6 to $3.76T at the Nov 16 close = $2.00T (-34.7%) |
| 4.40–5.75 | That's more than all of Meta. | Meta was about $1.59T (Nov 10–13 snapshot) |
| 5.93–7.27 | Not cash. Paper value. | This is market cap, not cash. Free cash flow was $21.3B last quarter. |
| 7.59–8.71 | Why so valuable? | |
| 8.89–11.85 | NVIDIA makes about eight in ten AI chips. | About 80% of AI accelerators (IDC est., about 81%) |
| 13.47–17.58 | This year, Big Tech plans to spend over seven hundred billion on AI. | Microsoft, Alphabet, Amazon and Meta plan 2026 capex of about $720–745B (est.) |
| 17.76–19.27 | NVIDIA sits at the center. | |
| 19.84–20.83 | Then, three shocks. | |
| 21.01–23.10 | Voters backed limits on new data centers. | Restrictions won 40 of 41 local measures on Nov 3 (Ballotpedia). NVIDIA fell 9.26% on Nov 5. |
| 23.28–26.16 | Investors questioned NVIDIA funding its own customers. | Circular financing: about $70B in stakes plus about $230B in guarantees (BofA via CNBC) |
| 26.34–30.12 | And CEO Jensen Huang stepped down, amid a board investigation. | Nov 12, 2026; CFO Colette Kress is interim CEO (Bloomberg, CNBC). Wording kept neutral. |
| 30.44–34.79 | From a record five point seven seven trillion, to three point seven six. | Oct 6 record close and Nov 16 close |
| 34.97–36.31 | Down thirty-five percent. | -34.7% |
| 37.53–38.76 | Sales are still growing. | Q2 FY27 revenue $96.2B, +106% (reported Aug 26, 2026) |
| 38.94–41.67 | So, is this an AI bubble, or market panic? | An open question, not a prediction |
| 43.25–44.33 | Follow InvisiTech. | |

Story structure: shocking loss → why NVIDIA was so valuable → what changed → why investors reacted → scale of the decline → the final question.

## Storyboard (scene by scene)

| # | Time | Tool | Picture | On screen |
|---|---|---|---|---|
| 1 | 0.00–4.25 | Blender + Remotion | Extreme macro on the existing hero GPU and its board, green pulses in the copper, a fast pull-back, a red transition, cracks and metal chips (the approved 3 s hook). A bass impact hits on frame 1. | Counter **$5.77T → $3.76T** (green turning red), then **$2 TRILLION GONE** with "$5.77T → $3.76T · Oct 6 → Nov 16 close · −35%" |
| 2 | 4.25–7.44 | Three.js + Remotion | 3D valuation columns. NVIDIA's column rises to $5.77T, its top $2.0T turns red and slides off beside Meta's column (~$1.59T), then dissolves into a wireframe. | **Bigger than all of Meta** · "MARKET VALUE · NOT CASH" |
| 3 | 7.44–13.32 | Blender (existing renders) | A match cut into the chip, then a 1 s GPU macro pull-out (`renders/shot03` frames 1–30), then the existing data-centre still (`renders/stills/scene03_datacenter.png`) with a slow camera push | **Why so valuable?** → **8 in 10 AI chips** |
| 4 | 13.32–19.69 | Three.js + Remotion | Capital streams of light pulses run from Microsoft, Alphabet, Amazon and Meta into the hero GPU on a pedestal, while a ring network of data-centre blocks expands outward. | **The AI gold rush** · counter to **$700B+** |
| 5 | 19.69–30.29 | Blender + Remotion | "3 SHOCKS" card, then: (1) the data-centre corridor switched to red standby, (2) the money loop NVIDIA → AI start-ups → chip orders with a "?", (3) an empty boardroom with the head chair in a spotlight and a factual headline card. | **1 · Data-center limits** (40 of 41 votes, −9.3% on Nov 5) · **2 · The money loop** · **3 · CEO steps down** |
| 6 | 30.29–37.38 | Three.js + Remotion | 3D chart of 18 verified closes (4 derived and labelled as such). The line draws as the camera follows it down, the GPU rides the line, and the scene shifts from green to red, then pulls back to the whole fall. | **The collapse** · $5.77T record · Oct 6 → $3.76T Nov 16 close · **−35%** · −$2.0T in 6 weeks |
| 7 | 37.38–43.00 | Blender (existing renders) | The opening hook's own orbit section (frames 25–45: green flicker on one side, red creeping in on the other), slowed, then a slow push in on frame 45 | "Sales are still growing: $96.2B" → **AI BUBBLE / OR MARKET / PANIC?** |
| 8 | 43.00–45.00 | Remotion | InvisiTech logo, Invisi**Tech**, @TheInvisiTech, "Follow for more" (2 s, no long subscribe animation) | |

## Layout

- **Safe margins:** left 90, right 180, top 200 and bottom 350 px.
- **Text bands:**
  - Titles: 226–450 px.
  - Subject: 450–1250 px.
  - Captions: 1262–1442 px.
  - Source tags: about 1196 px.
  - Disclaimer: 1530 px.
- **Watermark:** right edge, middle (rule 22), hidden on the end card.
- **Colours:** losses in red #E5484D, technology keywords in green #76B900.

> v1 uses only Blender renders that already existed (the hook frames, the data-centre still and the two reason stills). The new animated shots in `scripts/build_shots.py` (shot03 dolly, shot07 orbit) were stopped at Harsh's request. They can be rendered later on a GPU machine for v2.
