#!/usr/bin/env python3
"""Live-story updater - keeps developing stories current.

Finds articles marked as developing (breakingNewsStatus == "developing", or
liveStory == true), checks the web for NEW confirmed developments since the last
update, appends to the visible update log, refreshes the timestamp, and
re-publishes. A story is retired (updates stop) once it stops developing or after
a maximum age, so the loop converges instead of running forever. Reuses the
existing deploy path and serializes against both engines via the shared lock.

Usage:
  python3 scripts/live-updater.py            # check + update all live stories
  python3 scripts/live-updater.py --mark SLUG # mark a story as developing/live
"""
from __future__ import annotations

import datetime as _dt
import json
import os
import re
import subprocess
import sys
from pathlib import Path

CLAUDE = os.environ.get("FCRI_CLAUDE_BIN", "claude")
SITE_DIR = Path(os.environ.get("SITE_DIR", str(Path.home() / "cloner")))
ART = SITE_DIR / "content" / "articles"
BUILDS = SITE_DIR / ".article-builds"
MAX_AGE_H = int(os.environ.get("LIVE_MAX_AGE_HOURS", "36"))
AUTO_DEPLOY = os.environ.get("ARTICLE_AUTODEPLOY", "1") == "1"


def log(m: str) -> None:
    print(f"[{_dt.datetime.now():%Y-%m-%d %H:%M:%S}] {m}", flush=True)


def claude(prompt: str, *, web: bool = True, timeout: int = 600) -> str:
    args = [CLAUDE, "-p"] + (["--allowedTools", "WebSearch,WebFetch"] if web else [])
    r = subprocess.run(args, input=prompt, capture_output=True, text=True, timeout=timeout)
    if r.returncode != 0:
        raise RuntimeError((r.stderr or "").strip()[:200])
    return r.stdout.strip()


def extract_json(t: str) -> dict:
    t = re.sub(r"^```(?:json)?", "", t.strip()).strip()
    t = re.sub(r"```$", "", t).strip()
    m = re.search(r"\{.*\}", t, re.S)
    if not m:
        raise RuntimeError("no JSON in response")
    return json.loads(m.group(0))


def is_live(a: dict) -> bool:
    return bool(a.get("liveStory")) or a.get("breakingNewsStatus") == "developing"


def save(f: Path, a: dict) -> None:
    f.write_text(json.dumps(a, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def mark(slug: str) -> None:
    f = ART / f"{slug}.json"
    a = json.loads(f.read_text(encoding="utf-8"))
    a["breakingNewsStatus"] = "developing"
    a.setdefault("updateHistory", [])
    save(f, a)
    log(f"marked live: {slug}")


def main() -> None:
    if "--mark" in sys.argv:
        mark(sys.argv[sys.argv.index("--mark") + 1])
        return

    for lk in (BUILDS / "watch.lock", BUILDS / "source.lock"):
        if lk.exists() and (_dt.datetime.now().timestamp() - lk.stat().st_mtime) < 90 * 60:
            log(f"an engine is writing ({lk.name}); skipping.")
            return

    live = []
    for f in ART.glob("*.json"):
        try:
            a = json.loads(f.read_text(encoding="utf-8"))
        except Exception:  # noqa: BLE001
            continue
        if a.get("published") is not False and is_live(a):
            live.append((f, a))
    log(f"{len(live)} live stories")
    changed = False

    for f, a in live:
        ref = a.get("updatedAt") or a.get("publishedAt") or f"{a.get('date','')}T00:00:00"
        try:
            age_h = (_dt.datetime.now() - _dt.datetime.fromisoformat(ref.replace("Z", ""))).total_seconds() / 3600
        except Exception:  # noqa: BLE001
            age_h = 0
        if age_h > MAX_AGE_H:
            a["breakingNewsStatus"] = "confirmed"
            a.pop("liveStory", None)
            save(f, a)
            log(f"retired (settled): {a['slug']}")
            changed = True
            continue

        log(f"checking: {a['slug']}")
        prior = "; ".join(u.get("note", "") for u in a.get("updateHistory", []))[-1400:]
        try:
            v = extract_json(claude(
                "You are updating a developing news story. Use web search for the LATEST CONFIRMED developments. "
                f"STORY: {a['headline']}\nEVENT: {a.get('event','')}\nALREADY LOGGED: {prior or 'none'}\n\n"
                'Return STRICT JSON {"hasUpdate": true or false, "update": "one sentence describing a NEW '
                'confirmed development, with its time or date (empty string if none)", "newConfirmedFacts": [..], '
                '"stillDeveloping": true or false}. Report ONLY genuinely new, confirmed, material developments not '
                "already logged; if nothing new is confirmed, set hasUpdate=false. Never speculate."))
        except Exception as e:  # noqa: BLE001
            log(f"  check failed: {e}")
            continue

        if v.get("hasUpdate") and v.get("update"):
            a.setdefault("updateHistory", []).append(
                {"time": _dt.datetime.now().isoformat(timespec="minutes"), "note": v["update"]})
            if v.get("newConfirmedFacts"):
                a["confirmedFacts"] = list(dict.fromkeys((a.get("confirmedFacts") or []) + v["newConfirmedFacts"]))
            a["updatedAt"] = _dt.datetime.now().isoformat(timespec="seconds")
            a["breakingNewsStatus"] = "developing" if v.get("stillDeveloping") else "updated"
            if not v.get("stillDeveloping"):
                a.pop("liveStory", None)
            save(f, a)
            log(f"  UPDATED: {v['update'][:74]}")
            changed = True
        else:
            log("  no new confirmed developments")

    if changed and AUTO_DEPLOY:
        subprocess.run(["git", "-C", str(SITE_DIR), "add", "content/articles/"])
        subprocess.run(["git", "-C", str(SITE_DIR), "-c", "commit.gpgsign=false", "commit", "-m", "Live story update"],
                       capture_output=True)
        subprocess.run(["bash", str(SITE_DIR / "scripts" / "deploy.sh"), "Live story update"],
                       cwd=str(SITE_DIR), env={**os.environ, "SITE_DIR": str(SITE_DIR)})
        log("deployed live updates.")


if __name__ == "__main__":
    main()
