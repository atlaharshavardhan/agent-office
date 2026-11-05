"""Command line: `invisitech <command>`  (or `python -m invisitech <command>`)."""
from __future__ import annotations

import argparse
import json
import logging
import sys
import threading
from pathlib import Path


def _director():
    from .graph import Director
    from .services import make_services
    return Director(make_services())


def cmd_init(a):
    from .services import make_services
    sv = make_services()
    print(f"Database: {sv.settings.db_path}")
    names = [s.display_name + ("" if s.enabled else " (phase 2)") for s in sv.specs.values()]
    print(f"Agents:   {', '.join(names)}")
    print(f"Telegram: {'on' if sv.settings.telegram_token else 'off (console + CLI approvals)'}")
    print(f"Drive:    {sv.settings.rclone_remote or 'local folder ' + str(sv.settings.data_dir / 'drive')}")


def cmd_scout(a):
    from .agents import TopicScout
    from .services import make_services
    sv = make_services()
    topics = TopicScout(sv).scout(a.month)
    for t in topics:
        print(f"{t['score']:>5.0f}  [{t['kind']}] {t['title']}  ({t['status']})")


def cmd_topics(a):
    from datetime import date
    from .services import make_services
    sv = make_services()
    for t in sv.db.topics_for_month(a.month or date.today().strftime("%Y-%m")):
        print(f"#{t['id']:<4} {t['score'] or 0:>5.0f}  [{t['kind']}] {t['title']}  ({t['status']})")


def _print_status(st: dict) -> None:
    if not st["next"]:
        print(f"Video #{st['video_id']}: finished (stage {st['stage']}).")
    elif st["waiting"]:
        w = st["waiting"][0]
        print(f"Video #{st['video_id']}: waiting for your approval #{w['approval_id']}.\n"
              f"  invisitech approve {w['approval_id']}\n  invisitech changes {w['approval_id']} \"notes\"")
    else:
        print(f"Video #{st['video_id']}: stopped before {st['next']} (stage {st['stage']}). "
              f"Continue with: invisitech resume {st['video_id']}")


def cmd_run(a):
    d = _director()
    vid = d.start(a.topic, a.month)
    _print_status(d.status(vid))


def cmd_resume(a):
    d = _director()
    _print_status(d.resume(a.video_id))


def cmd_decide(decision):
    def run(a):
        d = _director()
        st = d.decide(a.approval_id, decision, " ".join(getattr(a, "notes", []) or []), "cli")
        if st:
            _print_status(st)
        else:
            print("Recorded.")
    return run


def cmd_allow_spend(a):
    """The owner 'says so': record a one-time approval for a paid tool."""
    from .services import make_services
    sv = make_services()
    aid = sv.db.request_approval("spend", a.video, "harsha", f"Owner pre-approved {a.tool}", scope=a.tool.lower())
    sv.db.decide(aid, "approved", a.note or "pre-approved from CLI", "cli")
    print(f"Approval #{aid}: one use of '{a.tool}'" + (f" for video #{a.video}" if a.video else "") + ".")


def cmd_status(a):
    if a.video_id:
        d = _director()
        st = d.status(a.video_id)
        _print_status(st)
        for line in st["values"].get("log", [])[-15:]:
            print("  ·", line)
        return
    from .services import make_services
    sv = make_services()
    for v in sv.db.q("SELECT * FROM videos ORDER BY id DESC LIMIT 10"):
        print(f"#{v['id']:<4} {v['stage']:<26} {v['title']}")
    for p in sv.db.q("SELECT * FROM approvals WHERE status='pending'"):
        print(f"  pending approval #{p['id']} ({p['kind']}) video #{p['video_id']}")


def cmd_validate(a):
    from .config import Settings
    from .rules import validate_script
    script = json.loads(Path(a.file).read_text(encoding="utf-8"))
    v = validate_script(script.get("script", script), Settings.from_env().narration_wpm)
    print(v.summary())
    for i in v.issues:
        print(f"  [{i['severity']}] {i['rule']}: {i['problem']}" + (f" (scene {i['scene']})" if i.get("scene") else ""))
    sys.exit(0 if v.passed else 1)


def _start_bot(d):
    from .bot import TelegramBot
    from .notify import TelegramNotifier
    if not isinstance(d.sv.notifier, TelegramNotifier):
        print("Telegram is not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID); bot not started.")
        return None
    bot = TelegramBot(d, d.sv.notifier)
    threading.Thread(target=bot.poll_forever, daemon=True).start()
    return bot


def cmd_bot(a):
    d = _director()
    if _start_bot(d):
        print("Bot running. Ctrl+C to stop.")
        threading.Event().wait()


def cmd_dashboard(a, with_bot=False):
    import uvicorn
    from .config import Settings
    from .dashboard.app import create_app
    st = Settings.from_env()
    if with_bot:
        _start_bot(_director())
    port = a.port or st.dashboard_port
    print(f"Dashboard: http://127.0.0.1:{port}")
    uvicorn.run(create_app(st), host="127.0.0.1", port=port, log_level="warning")


def main(argv=None):
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    p = argparse.ArgumentParser(prog="invisitech", description="InvisiTech pre-production pipeline (Harsha).")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("init", help="create the database and show settings").set_defaults(fn=cmd_init)
    s = sub.add_parser("scout", help="run the Topic Scout now"); s.add_argument("--month"); s.set_defaults(fn=cmd_scout)
    s = sub.add_parser("topics", help="list topics"); s.add_argument("--month"); s.set_defaults(fn=cmd_topics)
    s = sub.add_parser("run", help="start a new video"); s.add_argument("--topic"); s.add_argument("--month")
    s.set_defaults(fn=cmd_run)
    s = sub.add_parser("resume", help="continue a stopped video"); s.add_argument("video_id", type=int)
    s.set_defaults(fn=cmd_resume)
    s = sub.add_parser("approve", help="approve a script or a spend"); s.add_argument("approval_id", type=int)
    s.add_argument("notes", nargs="*"); s.set_defaults(fn=cmd_decide("approve"))
    s = sub.add_parser("changes", help="request script changes"); s.add_argument("approval_id", type=int)
    s.add_argument("notes", nargs="+"); s.set_defaults(fn=cmd_decide("changes"))
    s = sub.add_parser("deny", help="deny a spend"); s.add_argument("approval_id", type=int)
    s.set_defaults(fn=cmd_decide("deny"))
    s = sub.add_parser("allow-spend", help="pre-approve ONE use of a paid tool (e.g. higgsfield)")
    s.add_argument("tool"); s.add_argument("--video", type=int); s.add_argument("--note")
    s.set_defaults(fn=cmd_allow_spend)
    s = sub.add_parser("status", help="videos and pending approvals"); s.add_argument("video_id", type=int, nargs="?")
    s.set_defaults(fn=cmd_status)
    s = sub.add_parser("validate", help="run the Rule Validator on a script JSON file"); s.add_argument("file")
    s.set_defaults(fn=cmd_validate)
    sub.add_parser("bot", help="run the Telegram bot").set_defaults(fn=cmd_bot)
    s = sub.add_parser("dashboard", help="live dashboard"); s.add_argument("--port", type=int)
    s.set_defaults(fn=cmd_dashboard)
    s = sub.add_parser("up", help="dashboard + Telegram bot together"); s.add_argument("--port", type=int)
    s.set_defaults(fn=lambda a: cmd_dashboard(a, with_bot=True))
    a = p.parse_args(argv)
    a.fn(a)


if __name__ == "__main__":
    main()
