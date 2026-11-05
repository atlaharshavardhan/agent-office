-- InvisiTech shared memory. LangGraph adds its own checkpoint tables
-- (checkpoints, writes) to the same file.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS topics (
  id          INTEGER PRIMARY KEY,
  month       TEXT NOT NULL,              -- '2026-11'
  rank        INTEGER,
  title       TEXT NOT NULL,
  thing       TEXT,                       -- the thing we follow
  angle       TEXT,
  kind        TEXT CHECK (kind IN ('trending','expected','manual')) DEFAULT 'trending',
  why_now     TEXT,
  score       REAL,
  sources     TEXT,                       -- JSON list
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','picked','done','rejected')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS videos (
  id           INTEGER PRIMARY KEY,
  topic_id     INTEGER REFERENCES topics(id),
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL,
  stage        TEXT NOT NULL DEFAULT 'topic',
  -- topic, scripting, script_review, awaiting_script_approval, storyboarding,
  -- ready_for_render, done, failed
  drive_folder TEXT,                      -- link only; files live in Drive
  thread_id    TEXT UNIQUE,               -- LangGraph thread
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scripts (
  id           INTEGER PRIMARY KEY,
  video_id     INTEGER NOT NULL REFERENCES videos(id),
  version      INTEGER NOT NULL,
  content      TEXT NOT NULL,             -- JSON from the Script Writer
  word_count   INTEGER,
  est_seconds  REAL,
  change_notes TEXT,
  status       TEXT NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft','rule_failed','review_failed','reviewed','approved','changes_requested')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (video_id, version)
);

CREATE TABLE IF NOT EXISTS reviews (
  id          INTEGER PRIMARY KEY,
  script_id   INTEGER NOT NULL REFERENCES scripts(id),
  reviewer    TEXT NOT NULL,              -- 'rule_validator' | 'script_reviewer'
  score       REAL,
  pass        INTEGER NOT NULL,
  issues      TEXT,                       -- JSON list
  summary     TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS storyboards (
  id          INTEGER PRIMARY KEY,
  video_id    INTEGER NOT NULL REFERENCES videos(id),
  script_id   INTEGER REFERENCES scripts(id),
  scene_no    INTEGER NOT NULL,
  caption     TEXT,
  method      TEXT,                       -- playwright | chrome | blender | svg
  width       INTEGER,
  height      INTEGER,
  drive_link  TEXT,                       -- link only
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS approvals (
  id           INTEGER PRIMARY KEY,
  video_id     INTEGER REFERENCES videos(id),
  kind         TEXT NOT NULL CHECK (kind IN ('script','spend','rule')),
  subject_id   INTEGER,                   -- e.g. scripts.id
  scope        TEXT,                      -- for spend: tool name, e.g. 'higgsfield'
  agent        TEXT,                      -- whose card shows "waiting for approval"
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','approved','changes_requested','rejected','used')),
  notes        TEXT,
  request_text TEXT,
  telegram_msg TEXT,
  requested_at TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at   TEXT,
  decided_by   TEXT
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id          INTEGER PRIMARY KEY,
  agent       TEXT NOT NULL,
  team        TEXT,
  tool        TEXT,                       -- tool in use right now (badge)
  status      TEXT NOT NULL DEFAULT 'working' CHECK (status IN ('working','done','failed')),
  task        TEXT,
  video_id    INTEGER,
  score       REAL,
  output      TEXT,                       -- short summary of the latest output
  error       TEXT,
  started_at  TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_runs_agent ON agent_runs(agent, id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status, kind);
