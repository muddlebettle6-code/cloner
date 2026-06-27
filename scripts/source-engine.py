#!/usr/bin/env python3
"""Source Engine (Phases 5-8) - turns queued primary-source alerts into stories.

Pipeline of distinct roles (no single model does everything):
  1. Story-Priority desk triages the queue (most routine filings -> ignore).
  2. For a qualifying event, the Research-Packet role builds an impact map +
     angle + verification (web-grounded), and decides if human review is needed.
  3. Editorial memory dedupes against published articles.
  4. Routing:
       - high-impact / sensitive  -> a DRAFT held for human review (not published)
       - otherwise                -> a source-backed brief written + published
     Writing reuses the existing engine (article-standalone.py); the produced
     article is stamped with source metadata + the packet's fact/analysis split.

The existing autonomous engine is untouched. This adds a parallel, source-driven,
human-gated layer.

Usage:
  python3 scripts/source-engine.py [--triage-only]
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
BUILDS = SITE_DIR / ".article-builds"
QUEUE = BUILDS / "source-queue.jsonl"
PROCESSED = BUILDS / "source-processed.json"
REVIEW = BUILDS / "review-queue.jsonl"
LOCK = BUILDS / "source.lock"
AUTO_DEPLOY = os.environ.get("ARTICLE_AUTODEPLOY", "1") == "1"

ROUTINE = re.compile(
    r"airworthiness directive|obsolete reference|technical amendment|meeting notice|"
    r"information collection|privacy act|sunshine act|drawbridge|fisheries of the",
    re.I,
)


def log(m: str) -> None:
    print(f"[{_dt.datetime.now():%Y-%m-%d %H:%M:%S}] {m}", flush=True)


def claude(prompt: str, *, web: bool = False, timeout: int = 900) -> str:
    args = [CLAUDE, "-p"] + (["--allowedTools", "WebSearch,WebFetch"] if web else [])
    p = subprocess.run(args, input=prompt, capture_output=True, text=True, timeout=timeout)
    if p.returncode != 0:
        raise RuntimeError((p.stderr or "").strip()[:200])
    return (p.stdout or "").strip()


def extract_json(t: str):
    t = re.sub(r"^```(?:json)?", "", t.strip()).strip()
    t = re.sub(r"```$", "", t).strip()
    m = re.search(r"[\[{].*[\]}]", t, re.S)
    if not m:
        raise RuntimeError("no JSON in response")
    return json.loads(m.group(0))


def load_queue() -> list[dict]:
    if not QUEUE.exists():
        return []
    return [json.loads(l) for l in QUEUE.read_text(encoding="utf-8").splitlines() if l.strip()]


def load_processed() -> set[str]:
    try:
        return set(json.loads(PROCESSED.read_text(encoding="utf-8")))
    except Exception:  # noqa: BLE001
        return set()


def save_processed(s: set[str]) -> None:
    PROCESSED.write_text(json.dumps(sorted(s)[-9000:]), encoding="utf-8")


def triage(alerts: list[dict]) -> list[dict]:
    cand = [a for a in alerts if not ROUTINE.search(a.get("title", "") + " " + a.get("abstract", ""))][:40]
    if not cand:
        return []
    items = "\n".join(
        f"{i}. [{a['sourceType']}] {a.get('entity','')}: {a['title']} -- {a.get('abstract','')[:160]}"
        for i, a in enumerate(cand)
    )
    out = extract_json(claude(
        "You are the story-priority desk for a financial-and-economic newsroom (CNBC / Bloomberg / FT breadth, "
        "research-led identity). Triage these newly-detected PRIMARY-SOURCE documents (SEC filings, Federal "
        "Register rules). Score each on economic impact, market relevance, policy importance, people and "
        "industries affected, timeliness, originality, and source quality. Assign a priority lane: immediate, "
        "high, standard, briefing, monitor, or ignore. MOST routine filings are 'ignore' or 'monitor'; only "
        "genuinely consequential developments are 'standard' or above.\n\n"
        f"DOCUMENTS:\n{items}\n\n"
        'Return STRICT JSON array: [{"i": index, "priority": "immediate|high|standard|briefing|monitor|ignore", '
        '"score": 0-100, "why": "one line", "sensitive": true or false (named individuals, allegations, legal, '
        'election, or clearly market-moving)}]. Output ONLY the JSON array.'))
    res = []
    for r in out if isinstance(out, list) else []:
        try:
            a = cand[int(r["i"])]
        except (KeyError, IndexError, ValueError, TypeError):
            continue
        if r.get("priority") in ("immediate", "high", "standard"):
            res.append({**a, "priority": r["priority"], "engineScore": r.get("score", 0),
                        "why": r.get("why", ""), "sensitive": bool(r.get("sensitive"))})
    res.sort(key=lambda x: x.get("engineScore", 0), reverse=True)
    return res


def build_packet(alert: dict) -> dict:
    return extract_json(claude(
        "Build a research packet for this primary-source event for a financial newsroom. Use web search and "
        "fetch to confirm the facts against the source and reputable reporting. Map the impact and propose the "
        "single sharpest consequential angle. Be precise; never invent; keep confirmed facts separate from "
        "reported-but-unconfirmed claims.\n\n"
        f"SOURCE: [{alert['sourceType']}] {alert.get('entity','')}\nTITLE: {alert['title']}\n"
        f"URL: {alert['url']}\nABSTRACT: {alert.get('abstract','')}\n\n"
        'Return STRICT JSON: {"event": "one precise sentence with the key fact and date", "section": "desk slug '
        '(economy, policy, markets, deals, banking, energy, technology, geopolitics, healthcare, trade, labor, '
        'consumer, real-estate)", "whatChanged": [..], "confirmedFacts": [..], "reportedClaims": [..], '
        '"unknowns": [..], "impact": {"companies": [..], "industries": [..], "assetClasses": [..]}, '
        '"angle": "the consequential question to answer", "confidence": 0-100, "humanReviewRequired": true or '
        'false (true for legal/political/allegation/named-individual/market-moving)}. Output ONLY JSON.', web=True))


def already_covered(alert: dict) -> bool:
    ent = re.sub(r"[^a-z0-9]+", "-", alert.get("entity", "").lower()).strip("-")[:22]
    if not ent or len(ent) < 4:
        return False
    art = SITE_DIR / "content" / "articles"
    for f in art.glob("*.json"):
        try:
            if ent in json.loads(f.read_text(encoding="utf-8")).get("slug", ""):
                return True
        except Exception:  # noqa: BLE001
            pass
    return False


def stamp_source_metadata(article_path: Path, alert: dict, pk: dict, review: bool) -> None:
    a = json.loads(article_path.read_text(encoding="utf-8"))
    a["sourceType"] = alert.get("sourceType")
    a["sourcePublishedAt"] = alert.get("publishedAt")
    a["sourceRetrievedAt"] = alert.get("retrievedAt")
    a["sourceReliability"] = alert.get("reliability")
    a["priority"] = alert.get("priority")
    a["confidenceScore"] = pk.get("confidence")
    a["verificationStatus"] = "verified" if (pk.get("confidence") or 0) >= 75 else "partial"
    a["humanReviewStatus"] = "pending" if review else "not-required"
    for k in ("whatChanged", "confirmedFacts", "reportedClaims"):
        if pk.get(k):
            a[k] = pk[k]
    if pk.get("unknowns"):
        a.setdefault("limitations", [])
        a["limitations"] = list(dict.fromkeys(a["limitations"] + pk["unknowns"]))
    article_path.write_text(json.dumps(a, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    only_triage = "--triage-only" in sys.argv
    BUILDS.mkdir(parents=True, exist_ok=True)
    # Serialize against both engines so they never write/deploy at the same time.
    for lk in (LOCK, BUILDS / "watch.lock"):
        if lk.exists() and (_dt.datetime.now().timestamp() - lk.stat().st_mtime) < 90 * 60:
            log(f"an engine run is in progress ({lk.name}); skipping.")
            return
    processed = load_processed()
    alerts = [a for a in load_queue() if a["id"] not in processed]
    log(f"{len(alerts)} unprocessed source alerts")
    if not alerts:
        return

    log("triaging the queue...")
    q = triage(alerts)
    log(f"{len(q)} cleared the bar (standard or above):")
    for a in q[:8]:
        log(f"  [{a['priority']:9s}] {a.get('engineScore')}  {a.get('entity','')[:26]:26s} {a['title'][:46]}")

    if only_triage:
        keep = {a["id"] for a in q}
        for a in alerts:
            if a["id"] not in keep:
                processed.add(a["id"])
        save_processed(processed)
        return

    if not q:
        for a in alerts:
            processed.add(a["id"])
        save_processed(processed)
        return

    top = q[0]
    processed.add(top["id"])
    if already_covered(top):
        log(f"editorial memory: already covered ({top.get('entity')}); skipping.")
        save_processed(processed)
        return

    LOCK.write_text(top["id"], encoding="utf-8")
    try:
        log(f"research packet: {top['title'][:60]}")
        pk = build_packet(top)
        review = bool(pk.get("humanReviewRequired")) or top.get("sensitive") or top["priority"] in ("immediate", "high")
        outdir = BUILDS / ("src-" + re.sub(r"[^a-z0-9]+", "-", top["title"].lower())[:40].strip("-"))
        cmd = [sys.executable, str(SITE_DIR / "scripts" / "article-standalone.py"), str(outdir),
               "--event", pk.get("event", top["title"])]
        if pk.get("section"):
            cmd += ["--section", pk["section"]]
        log(f"writing ({'DRAFT for review' if review else 'source brief'})...")
        subprocess.run(cmd, check=True)
        art = outdir / "article.json"
        if not art.exists():
            log("no article produced.")
            save_processed(processed)
            return
        subprocess.run(["node", "scripts/localize-lead-image.mjs", str(art)], cwd=str(SITE_DIR))
        stamp_source_metadata(art, top, pk, review)

        if review:
            # Held for a human: ingest as a draft, record in the review queue.
            subprocess.run(["node", "scripts/article-ingest.mjs", str(art)], cwd=str(SITE_DIR))
            with REVIEW.open("a", encoding="utf-8") as f:
                f.write(json.dumps({"time": _dt.datetime.now().isoformat(timespec="seconds"),
                                    "title": top["title"], "source": top["url"], "priority": top["priority"],
                                    "outdir": str(outdir)}) + "\n")
            log("DRAFT written and held for human review (not published).")
        else:
            gate = subprocess.run(["node", "scripts/article-ingest.mjs", str(art), "--publish"], cwd=str(SITE_DIR))
            if gate.returncode != 0:
                log("quality gate failed; holding as a draft.")
                subprocess.run(["node", "scripts/article-ingest.mjs", str(art)], cwd=str(SITE_DIR))
            else:
                subprocess.run(["git", "-C", str(SITE_DIR), "add", "content/articles/"])
                subprocess.run(["git", "-C", str(SITE_DIR), "-c", "commit.gpgsign=false", "commit",
                                "-m", "Source brief"], capture_output=True)
                if AUTO_DEPLOY:
                    subprocess.run(["bash", str(SITE_DIR / "scripts" / "deploy.sh"), "Source-driven brief"],
                                   cwd=str(SITE_DIR), env={**os.environ, "SITE_DIR": str(SITE_DIR)})
                log("source-backed brief published + deployed.")
        save_processed(processed)
    finally:
        if LOCK.exists():
            LOCK.unlink()


if __name__ == "__main__":
    main()
