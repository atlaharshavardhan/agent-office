# InvisiTech pipeline: pre-production ("trailer") phase

Harsha, the director, runs a team of Claude agents that take a video from topic to
approved script to storyboard. Everything runs **locally on your laptop**. Only the
high-quality render will run later on the GCP VM (stubbed for now).

```
Topic Scout ──► Harsha picks topic ──► Script Writer ⇄ Rule Validator + Script Reviewer
                                                      │ (loops until pass, max 4 rounds)
                                                      ▼
                                    YOUR APPROVAL (Telegram: Approve / Request changes)
                                                      ▼
                         Storyboard Artist ──► album to you ──► render stub ──► done
```

## What's built

| Piece | Where | Status |
|---|---|---|
| Orchestrator "Harsha" (LangGraph) | `invisitech/graph.py` | ✅ |
| SQLite shared memory + LangGraph checkpointer (same file) | `invisitech/schema.sql`, `invisitech/db.py` | ✅ resumes after a stop |
| Claude via Claude Code headless (`claude -p`, your subscription) | `invisitech/claude.py` | ✅ |
| Topic Scout (Research) | `agents/topic_scout.md` | ✅ uses vidIQ |
| Script Writer (Creative) | `agents/script_writer.md` | ✅ |
| Script Reviewer (Quality) → `{score, issues, pass}` | `agents/script_reviewer.md` | ✅ |
| Storyboard Artist (Creative), free methods only | `agents/storyboard_artist.md` | ✅ SVG/HTML → PNG, Blender optional |
| Rule Validator (plain code, not an agent) | `invisitech/rules.py` | ✅ |
| Telegram bot (approvals, updates, albums) | `invisitech/notify.py`, `invisitech/bot.py` | ✅ |
| Google Drive via rclone (DB stores links only) | `invisitech/drive.py` | ✅ |
| Live dashboard (FastAPI + SSE) | `invisitech/dashboard/` | ✅ |
| Performance Analyst, Feedback Learner | `agents/*.md` | 📝 instructions written; code is phase 2 |
| Render on GCP VM | `invisitech/render.py` | ⏸ stub |

## Setup (once)

You need Python 3.10+, [Claude Code](https://code.claude.com) installed and logged in,
and Google Chrome (or Chromium/Edge) for storyboard frames. **Everything installed
below is free and open source.**

```bash
cd pipeline
python -m venv .venv
```

```bash
# macOS/Linux:  source .venv/bin/activate      Windows:  .venv\Scripts\activate
pip install -e ".[dev]"
```

```bash
cp .env.example .env      # then fill in Telegram + rclone (both optional for a first test)
invisitech init
```

- **vidIQ**: the Topic Scout calls vidIQ through your Claude Code MCP setup. Check
  that `claude` on your laptop lists the vidIQ server (`claude mcp list`).
- **Telegram**: create a bot with @BotFather → `TELEGRAM_BOT_TOKEN`. Send it any
  message, get your id from @userinfobot → `TELEGRAM_CHAT_ID`. Without these,
  updates print to the terminal and you approve with the CLI.
- **Drive**: `rclone config` → add a Google Drive remote (e.g. `gdrive`), then set
  `RCLONE_REMOTE=gdrive:InvisiTech`. Without it, files go to `data/drive/`.

## Use it

```bash
invisitech up                 # dashboard (http://127.0.0.1:8765) + Telegram bot
```

In a second terminal (or send `/new` to the bot):

```bash
invisitech run                                        # Topic Scout + Harsha picks
invisitech run --topic "How FASTag pays your toll"    # you pick the topic
```

The run stops at your script approval. Answer on Telegram, or:

```bash
invisitech approve 3
invisitech changes 3 "Shorter outro, mention SIM-swap fraud"
```

Other commands: `invisitech status [video]`, `invisitech resume <video>` (continue
after a crash or Ctrl+C), `invisitech topics`, `invisitech scout`,
`invisitech validate script.json`, `invisitech allow-spend higgsfield --video 3`.

Telegram commands: `/status`, `/new [topic]`, `/resume <video>`.

## Approvals and money

- **Script always needs your approval.** "Request changes" asks you to type notes; the
  Script Writer gets them and the loop runs again.
- **Routine steps auto-approve** and just send an update ("✅ Script v2 reviewed 9/10").
- **Nothing paid runs without approval.** `rules.check_spend()` runs before any paid
  call. Free: Claude (subscription), vidIQ, Blender, HTML/Chrome, Drive, Telegram.
  Anything else (Higgsfield, GCP VM, unknown tools) needs an approved, single-use
  approval; otherwise the video pauses and you get *Allow once / Deny* buttons.
- **Higgsfield is blocked twice:** every `claude -p` call gets
  `--disallowedTools mcp__Higgsfield`, and no agent file lists it. To allow it, say
  so (`invisitech allow-spend higgsfield --video N`) or approve when asked.

## Rule Validator (deterministic)

| Rule | Check |
|---|---|
| Long video 4–8 min | narration words ÷ 150 wpm within 4–8 min |
| Sized to the script, never dragged | ≤ 15 % over the writer's `target_minutes`; no scene > 75 s; no repeated sentences; < 6 % repeated 5-word runs; filler phrases flagged |
| Never stretched | format must be exactly 16:9 (1920×1080); every storyboard image is measured and must be exactly 16:9; a 16:9 drawing at another scale is resized evenly, any other shape is re-drawn, never stretched |
| Hook in first 10 s | `hook_line` is the first thing said and ≤ 25 words |
| Sections | hook, main and outro all present, in that order |
| Money | `check_spend()` before any paid call |

Settings in `.env`: `NARRATION_WPM`, `REVIEW_MIN_SCORE` (8), `MAX_SCRIPT_ROUNDS` (4).
If the loop hasn't passed after the max rounds, Harsha sends it to you anyway with a ⚠️.

## Where things live

| What | Where |
|---|---|
| Agent instructions (one file each; names shown on the dashboard) | `agents/*.md` |
| Channel guide (every agent reads it) | `channel_guide.md` |
| Database | `data/invisitech.sqlite`: `topics, videos, scripts, reviews, storyboards, approvals, agent_runs` + LangGraph `checkpoints, writes` |
| Working files (git-ignored) | `data/work/video-N/`; raw Claude replies for debugging in `data/work/claude-replies/` |
| Heavy files | Drive: `videos/NNN-slug/script-vN.md`, `videos/NNN-slug/storyboard/scene-NN.png` |

## Tests

```bash
pytest                                   # unit tests + flow test, fake Claude, ~2 s
python benchmarks/run_benchmarks.py      # OTP + FASTag reference scripts vs. Rule Validator
python benchmarks/run_benchmarks.py --live   # real Claude: writer/reviewer loop on both topics
```

- `tests/test_flow.py` runs the whole flow on the OTP topic: rule-fail loop → review
  loop → approval pause → **process stops and restarts** → change request → approval →
  storyboard → done. It also covers crash-and-resume and the paid-call gate.
- `benchmarks/otp.json` and `benchmarks/fastag.json` are reference scripts; they must
  always pass the Rule Validator. `--live` also checks that the Reviewer passes them.

## Dashboard

`http://127.0.0.1:8765`: one card per agent grouped by team, with status (idle /
working / waiting for approval), current task, latest output, score and tool badges
(vidIQ, Claude, Blender, HTML, Drive) that light up while in use. It reads SQLite
only (`/api/state` JSON, `/events` SSE), so the isometric Agent Office app can use
the same endpoints later.
