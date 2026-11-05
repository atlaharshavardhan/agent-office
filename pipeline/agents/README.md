# Agent instructions

One file per agent. The front matter is read by the pipeline and the dashboard:

| key | meaning |
|---|---|
| `name` | id used in code and the database |
| `display_name` | shown on the dashboard |
| `team` | Research / Creative / Quality |
| `tools` | tool badges this agent may light up |
| `claude_allowed_tools` | tools passed to `claude -p --allowedTools` |
| `enabled` | `false` = written but not wired into the flow yet |

Everything after the front matter is the agent's instructions. Edit freely; the
next run picks up the change. Every agent also gets `channel_guide.md`.
