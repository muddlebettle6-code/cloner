#!/usr/bin/env python3
"""Source Monitor (Phase 4, agent 1) - polls approved primary sources for newly
published documents.

Currently monitors SEC EDGAR (latest 8-K / S-1 / prospectus filings) and the
Federal Register (new rules and proposed rules). It detects new documents,
deduplicates against a seen store, captures source metadata (url, published time,
retrieval time, type, reliability), assigns a cheap preliminary score, and
appends source alerts to the queue for the source engine to triage.

Respects SEC's descriptive User-Agent + rate-limit guidance and uses public,
keyless APIs only. AI is not involved here; this is plain document monitoring.

Usage: python3 scripts/source-monitor.py
"""
from __future__ import annotations

import datetime as _dt
import json
import os
import re
import ssl
import time
import urllib.parse
import urllib.request
from pathlib import Path

try:
    import certifi
    CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:  # noqa: BLE001
    CTX = ssl.create_default_context()

SITE_DIR = Path(os.environ.get("SITE_DIR", str(Path.home() / "cloner")))
BUILDS = SITE_DIR / ".article-builds"
SEEN = BUILDS / "source-seen.json"
QUEUE = BUILDS / "source-queue.jsonl"
UA = os.environ.get("SOURCE_UA", "Cumulant Research newsroom (contact@cumulant.org)")


def now_iso() -> str:
    return _dt.datetime.now().isoformat(timespec="seconds")


def get(url: str, accept: str | None = None, timeout: int = 25) -> str:
    headers = {"User-Agent": UA}
    if accept:
        headers["Accept"] = accept
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read().decode("utf-8", "replace")


def load_seen() -> set[str]:
    try:
        return set(json.loads(SEEN.read_text(encoding="utf-8")))
    except Exception:  # noqa: BLE001
        return set()


def save_seen(s: set[str]) -> None:
    SEEN.write_text(json.dumps(sorted(s)[-6000:]), encoding="utf-8")


def emit(ev: dict) -> None:
    with QUEUE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(ev) + "\n")


def sec_filings(forms=("8-K", "S-1", "S-1/A", "424B4")) -> list[dict]:
    out: list[dict] = []
    for form in forms:
        try:
            xml = get(
                "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type="
                f"{urllib.parse.quote(form)}&company=&dateb=&owner=include&count=40&output=atom",
                accept="application/atom+xml",
            )
        except Exception as e:  # noqa: BLE001
            print(f"  sec {form} fetch failed: {e}", flush=True)
            continue
        for m in re.finditer(r"<entry>(.*?)</entry>", xml, re.S):
            block = m.group(1)
            title = re.search(r"<title>(.*?)</title>", block, re.S)
            link = re.search(r'<link[^>]*href="([^"]+)"', block)
            updated = re.search(r"<updated>(.*?)</updated>", block)
            if not title or not link:
                continue
            t = re.sub(r"\s+", " ", title.group(1)).strip()
            url = link.group(1)
            cm = re.match(r".+?-\s*(.+?)\s*\((\d+)\)", t)
            entity = cm.group(1).strip() if cm else ""
            out.append({
                "id": "sec:" + re.sub(r"[^a-zA-Z0-9]", "", url)[-44:],
                "sourceType": "sec-" + form.lower().replace("/", "").replace(" ", ""),
                "title": t, "url": url, "entity": entity,
                "publishedAt": updated.group(1).strip() if updated else None,
                "reliability": "regulatory",
            })
        time.sleep(0.6)  # polite to SEC
    return out


def federal_register() -> list[dict]:
    out: list[dict] = []
    try:
        url = (
            "https://www.federalregister.gov/api/v1/documents.json?per_page=30&order=newest"
            "&conditions[type][]=RULE&conditions[type][]=PRORULE"
            "&fields[]=title&fields[]=type&fields[]=abstract&fields[]=publication_date"
            "&fields[]=html_url&fields[]=document_number&fields[]=agencies"
        )
        data = json.loads(get(url))
    except Exception as e:  # noqa: BLE001
        print(f"  federal register fetch failed: {e}", flush=True)
        return out
    for d in data.get("results", []):
        ags = ", ".join(a.get("name", "") for a in (d.get("agencies") or []))[:90]
        out.append({
            "id": "fr:" + str(d.get("document_number")),
            "sourceType": "federal-register-" + ("rule" if d.get("type") == "Rule" else "proposed-rule"),
            "title": (d.get("title") or "").strip(), "url": d.get("html_url", ""), "entity": ags,
            "publishedAt": d.get("publication_date"), "reliability": "official",
            "abstract": (d.get("abstract") or "")[:600],
        })
    return out


_BILL_PATH = {"HR": "house-bill", "S": "senate-bill", "HJRES": "house-joint-resolution",
              "SJRES": "senate-joint-resolution", "HCONRES": "house-concurrent-resolution",
              "SCONRES": "senate-concurrent-resolution", "HRES": "house-resolution", "SRES": "senate-resolution"}


def congress() -> list[dict]:
    """Recent congressional bills/actions (api.data.gov DEMO_KEY works; a free
    Congress.gov key raises the rate limit)."""
    key = os.environ.get("CONGRESS_API_KEY", "DEMO_KEY")
    out: list[dict] = []
    try:
        data = json.loads(get(f"https://api.congress.gov/v3/bill?api_key={key}&sort=updateDate+desc&limit=20&format=json"))
    except Exception as e:  # noqa: BLE001
        print(f"  congress fetch failed: {e}", flush=True)
        return out
    for b in data.get("bills", []):
        typ, num, cong = b.get("type", ""), b.get("number", ""), b.get("congress", "")
        upd = b.get("updateDate", "")
        action = (b.get("latestAction") or {}).get("text", "")
        pub = f"https://www.congress.gov/bill/{cong}th-congress/{_BILL_PATH.get(typ, 'house-bill')}/{num}"
        out.append({
            "id": f"congress:{typ}{num}:{upd}", "sourceType": "congress-bill",
            "title": f"{typ} {num}: {(b.get('title') or '').strip()}",
            "url": pub, "entity": "U.S. Congress", "publishedAt": upd, "reliability": "official",
            "abstract": (action or "")[:300],
        })
    return out


def fred() -> list[dict]:
    """Latest readings of key economic series (gated on a free FRED_API_KEY)."""
    key = os.environ.get("FRED_API_KEY")
    out: list[dict] = []
    if not key:
        return out
    series = {
        "CPIAUCSL": "Consumer Price Index", "UNRATE": "Unemployment rate", "GDPC1": "Real GDP",
        "FEDFUNDS": "Federal funds rate", "PAYEMS": "Nonfarm payrolls", "RSAFS": "Retail sales",
        "MORTGAGE30US": "30-year mortgage rate", "PCEPI": "PCE price index",
    }
    for sid, name in series.items():
        try:
            d = json.loads(get(
                f"https://api.stlouisfed.org/fred/series/observations?series_id={sid}"
                f"&api_key={key}&file_type=json&sort_order=desc&limit=1"))
            obs = d.get("observations", [])
            if not obs:
                continue
            o = obs[0]
            out.append({
                "id": f"fred:{sid}:{o['date']}", "sourceType": "fred-economic-data",
                "title": f"{name}: latest reading for {o['date']} is {o['value']}",
                "url": f"https://fred.stlouisfed.org/series/{sid}", "entity": "Federal Reserve (FRED)",
                "publishedAt": o["date"], "reliability": "official",
                "abstract": f"{name} ({sid}) updated to {o['value']} as of {o['date']}.",
            })
        except Exception as e:  # noqa: BLE001
            print(f"  fred {sid} failed: {e}", flush=True)
        time.sleep(0.3)
    return out


def prelim_score(ev: dict) -> int:
    st = ev["sourceType"]
    if st.startswith("sec-s-1") or st.startswith("sec-424"):
        return 55  # offering / IPO
    if st == "sec-8-k":
        return 40  # material event
    if st == "federal-register-rule":
        return 50
    if st == "federal-register-proposed-rule":
        return 44
    if st == "fred-economic-data":
        return 58  # economic releases are high-value
    if st == "congress-bill":
        return 42
    return 30


def main() -> None:
    BUILDS.mkdir(parents=True, exist_ok=True)
    seen = load_seen()
    found = sec_filings() + federal_register() + congress() + fred()
    new = [e for e in found if e["id"] not in seen]
    print(f"[{now_iso()}] scanned {len(found)} primary-source docs, {len(new)} new", flush=True)
    for e in new:
        e["retrievedAt"] = now_iso()
        e["score"] = prelim_score(e)
        emit(e)
        seen.add(e["id"])
    save_seen(seen)
    print(f"  queued {len(new)} source alerts -> {QUEUE}", flush=True)


if __name__ == "__main__":
    main()
