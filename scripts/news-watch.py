#!/usr/bin/env python3
"""Continuous newsroom watcher.

Runs frequently (e.g. every ~30 min via launchd). It scans recent news for the
single most SIGNIFICANT, specific, NEW event in Cumulant's areas. If one clears a
HIGH bar (and is not already covered, and the daily cap is not reached), it fires
the full article pipeline at that exact event and auto-publishes + deploys.
Otherwise it does nothing. A lock prevents overlapping runs; a daily cap and the
high bar keep it from flooding.
"""
from __future__ import annotations

import datetime as _dt
import json
import os
import re
import subprocess
import sys
from pathlib import Path

SITE_DIR = Path(os.environ.get("SITE_DIR", str(Path.home() / "cloner")))
BUILDS = SITE_DIR / ".article-builds"
COVERED = BUILDS / "covered.jsonl"
LOCK = BUILDS / "watch.lock"
MAX_PER_DAY = int(os.environ.get("ARTICLE_MAX_PER_DAY", "4"))
AUTO_DEPLOY = os.environ.get("ARTICLE_AUTODEPLOY", "1") == "1"
CLAUDE = os.environ.get("FCRI_CLAUDE_BIN", "claude")
TODAY = _dt.date.today().isoformat()


def log(m: str) -> None:
    print(f"[{_dt.datetime.now():%Y-%m-%d %H:%M:%S}] {m}", flush=True)


def claude(prompt: str, *, web: bool = True, timeout: int = 600) -> str:
    args = [CLAUDE, "-p"] + (["--allowedTools", "WebSearch,WebFetch"] if web else [])
    p = subprocess.run(args, input=prompt, capture_output=True, text=True, timeout=timeout)
    if p.returncode != 0:
        raise RuntimeError((p.stderr or "").strip()[:200])
    return (p.stdout or "").strip()


def extract_json(text: str) -> dict:
    t = re.sub(r"^```(?:json)?", "", text.strip()).strip()
    t = re.sub(r"```$", "", t).strip()
    m = re.search(r"\{.*\}", t, re.S)
    if not m:
        raise RuntimeError("no JSON object")
    return json.loads(m.group(0))


def load_covered() -> list[dict]:
    out = []
    if COVERED.exists():
        for line in COVERED.read_text(encoding="utf-8").splitlines():
            try:
                out.append(json.loads(line))
            except ValueError:
                pass
    return out


def record(slug: str, event: str, published: bool) -> None:
    with COVERED.open("a", encoding="utf-8") as f:
        f.write(json.dumps({"date": TODAY, "slug": slug, "event": event, "published": published}) + "\n")


def main() -> None:
    BUILDS.mkdir(parents=True, exist_ok=True)

    # One run at a time; clear a stale lock (>90 min, longer than a full article).
    if LOCK.exists():
        if (_dt.datetime.now().timestamp() - LOCK.stat().st_mtime) < 90 * 60:
            log("A run is already in progress; skipping this cycle.")
            return
        LOCK.unlink()

    covered = load_covered()
    if sum(1 for c in covered if c.get("date") == TODAY) >= MAX_PER_DAY:
        log(f"Daily cap reached ({MAX_PER_DAY}); skipping.")
        return
    recent = [c.get("event", "")[:90] for c in covered[-30:]]

    log("scanning recent news for a worthy new event...")
    avoid = ("\n- " + "\n- ".join(recent)) if recent else " (none yet)"
    try:
        verdict = extract_json(claude(
            "You are Cumulant Research's news desk. Use web search to scan the LAST FEW HOURS of news for the "
            "single most SIGNIFICANT, SPECIFIC, researchable NEW event in markets, finance, IPOs and offerings, "
            "tariffs and trade, AI investment, corporate disclosure, major corporate events (large deals, "
            "earnings shocks, leadership or regulatory actions), or economic policy. It must be: (a) specific and "
            "concrete (a named company, deal, filing, or policy, not a vague trend); (b) significant enough to "
            "justify a deep data article; (c) supported by primary sources; and (d) NOT one of these "
            f"already-covered items:{avoid}\n\nHold a HIGH bar: most hours, nothing qualifies. Return STRICT JSON: "
            '{"worthy": true or false, "event": "one sentence with the key fact and date", "slug": "kebab-case", '
            '"why": "why it clears the bar"}. Output ONLY the JSON object.'))
    except Exception as exc:  # noqa: BLE001
        log(f"scan failed ({exc}); skipping.")
        return

    if "--scan-only" in sys.argv:
        log(f"SCAN-ONLY verdict: {json.dumps(verdict)}")
        return

    if not verdict.get("worthy"):
        log(f"Nothing clears the bar right now. {verdict.get('why', '')}".strip())
        return
    event = (verdict.get("event") or "").strip()
    slug = re.sub(r"[^a-z0-9-]", "", (verdict.get("slug") or "").lower()).strip("-")
    if not event or not slug:
        log("Worthy but missing event/slug; skipping.")
        return
    if any(slug == c.get("slug") for c in covered) or (SITE_DIR / "content" / "articles" / f"{slug}.json").exists():
        log(f"Already covered: {slug}; skipping.")
        return

    log(f"WORTHY: {event}  ->  researching + writing ({slug})")
    LOCK.write_text(slug, encoding="utf-8")
    try:
        outdir = BUILDS / slug
        subprocess.run([sys.executable, str(SITE_DIR / "scripts" / "article-standalone.py"), str(outdir),
                        "--event", event], check=True)
        art = outdir / "article.json"
        if not art.exists():
            log("No article produced; skipping.")
            return

        subprocess.run(["node", "scripts/localize-lead-image.mjs", str(art)], cwd=str(SITE_DIR))
        gate = subprocess.run(["node", "scripts/article-ingest.mjs", str(art), "--publish"], cwd=str(SITE_DIR))
        if gate.returncode != 0:
            log("Quality gate failed; holding as a draft.")
            subprocess.run(["node", "scripts/article-ingest.mjs", str(art)], cwd=str(SITE_DIR))
            record(slug, event, published=False)
            return

        subprocess.run(["git", "-C", str(SITE_DIR), "add", "content/articles/"])
        subprocess.run(["git", "-C", str(SITE_DIR), "-c", "commit.gpgsign=false", "commit", "-m", f"Article: {slug}"])
        if AUTO_DEPLOY:
            subprocess.run(["bash", str(SITE_DIR / "scripts" / "deploy.sh"), f"Article: {slug}"],
                           cwd=str(SITE_DIR), env={**os.environ, "SITE_DIR": str(SITE_DIR)})
        record(slug, event, published=True)
        log(f"Published + deployed: {slug}")

        # Distribution: generate platform-tailored posts and auto-post to every
        # connected platform (each is skipped cleanly until you connect it).
        try:
            subprocess.run([sys.executable, str(SITE_DIR / "scripts" / "social-pack.py"), str(art), str(outdir)])
            social = outdir / "social.json"
            if social.exists():
                log("posting to connected social platforms")
                subprocess.run([sys.executable, str(SITE_DIR / "scripts" / "social-post.py"), str(social)])
        except Exception as exc:  # noqa: BLE001 - distribution must not fail the publish
            log(f"social step failed ({exc})")
    finally:
        if LOCK.exists():
            LOCK.unlink()


if __name__ == "__main__":
    main()
