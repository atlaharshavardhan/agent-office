import time

from invisitech.bot import TelegramBot


class FakeTG:
    chat_id = "42"

    def __init__(self):
        self.sent = []

    def send(self, text, buttons=None):
        self.sent.append(text)

    def call(self, method, data=None, files=None):
        return {}


class FakeDirector:
    def __init__(self, db):
        self.db = db
        self.decisions = []
        self.started = []

    def decide(self, aid, decision, notes="", by="owner"):
        self.decisions.append((aid, decision, notes, by))

    def start(self, topic=None):
        self.started.append(topic)

    def resume(self, vid):
        pass


def wait_for(cond, timeout=2):
    end = time.time() + timeout
    while time.time() < end and not cond():
        time.sleep(0.01)
    assert cond()


def make(services):
    vid = services.db.create_video("OTP")
    aid = services.db.request_approval("script", vid, "script_writer", "v1 ready")
    d = FakeDirector(services.db)
    return TelegramBot(d, FakeTG()), d, aid


def cb(data, chat="42"):
    return {"callback_query": {"id": "1", "data": data, "message": {"chat": {"id": int(chat)}}}}


def msg(text, chat="42"):
    return {"message": {"text": text, "chat": {"id": int(chat)}}}


def test_approve_button(services):
    bot, d, aid = make(services)
    bot.handle(cb(f"script:approve:{aid}"))
    wait_for(lambda: d.decisions)
    assert d.decisions[0][:2] == (aid, "approve")


def test_request_changes_asks_for_notes(services):
    bot, d, aid = make(services)
    bot.handle(cb(f"script:changes:{aid}"))
    assert "Type your change notes" in bot.tg.sent[-1] and not d.decisions
    bot.handle(msg("Shorter outro please"))
    wait_for(lambda: d.decisions)
    assert d.decisions[0] == (aid, "changes", "Shorter outro please", "telegram")


def test_ignores_other_chats(services):
    bot, d, aid = make(services)
    bot.handle(cb(f"script:approve:{aid}", chat="999"))
    bot.handle(msg("/new hack", chat="999"))
    time.sleep(0.05)
    assert not d.decisions and not d.started


def test_already_decided(services):
    bot, d, aid = make(services)
    services.db.decide(aid, "approved")
    bot.handle(cb(f"script:approve:{aid}"))
    assert "already approved" in bot.tg.sent[-1] and not d.decisions


def test_commands(services):
    bot, d, aid = make(services)
    bot.handle(msg("/status"))
    assert "OTP" in bot.tg.sent[-1]
    bot.handle(msg("/new How UPI works"))
    wait_for(lambda: d.started)
    assert d.started == ["How UPI works"]
