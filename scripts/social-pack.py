#!/usr/bin/env python3
"""Turn a published article into platform-tailored social posts.

Reads an article JSON and writes a social.json with copy for Reddit, LinkedIn,
X/Twitter, Instagram, and Facebook. Pure text generation via the Claude CLI - no
account or API key needed; the posting step (social-post.py) handles delivery.

Usage: python3 scripts/social-pack.py <article.json> [out-dir]
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

CLAUDE = os.environ.get("FCRI_CLAUDE_BIN", "claude")
SITE_URL = os.environ.get("CUMULANT_URL", "https://cumulant.org").rstrip("/")


def claude(prompt: str, timeout: int = 600) -> str:
    proc = subprocess.run([CLAUDE, "-p"], input=prompt, capture_output=True, text=True, timeout=timeout)
    if proc.returncode != 0:
        raise RuntimeError((proc.stderr or "").strip()[:200])
    return (proc.stdout or "").strip()


def extract_json(text: str) -> dict:
    t = re.sub(r"^```(?:json)?", "", text.strip()).strip()
    t = re.sub(r"```$", "", t).strip()
    m = re.search(r"\{.*\}", t, re.S)
    if not m:
        raise RuntimeError("no JSON object in response")
    return json.loads(m.group(0))


SPEC = (
    "Return ONLY a JSON object:\n"
    '{"reddit": {"subreddits": [2-3 relevant subreddit names, no "r/"], "title": "specific, non-clickbait", '
    '"body": "a substantive, non-promotional summary of the finding and how it was reached, 4-8 sentences, '
    'ending with the link"}, '
    '"linkedin": "a professional post: the insight, why it matters, then the link (3-6 short lines)", '
    '"x": ["thread of 3 to 6 tweets; hook first; one idea each; <=270 chars; put the link in the LAST tweet"], '
    '"instagram": {"caption": "conversational hook + the finding + a call to read, link in bio style", '
    '"hashtags": ["6-10 relevant tags without the # sign"]}, '
    '"facebook": "a short post: the finding and why it matters, with the link"}\n'
    "Every claim must be accurate to the article - no hype, no clickbait, no fabricated numbers. Plain hyphens, "
    "never long dashes."
)


def build(article_path: str, out_dir: str | None = None) -> dict:
    a = json.loads(Path(article_path).read_text(encoding="utf-8"))
    url = f"{SITE_URL}/articles/{a['slug']}"
    keep = {k: a[k] for k in ("headline", "deck", "takeaways", "event", "question") if k in a}
    keep["finding"] = " ".join(
        b.get("text", "") for s in a.get("sections", [])[:6] for b in s.get("blocks", []) if b.get("type") == "p"
    )[:2200]
    prompt = (
        "You run social media for Cumulant Research, a data-journalism research desk. Write platform-tailored "
        "posts that pull readers into the article. The brand voice is sharp, factual, and curious - never "
        "salesy. RULES: stay accurate to the article only; no hype, no clickbait, no fabricated numbers; plain "
        f"hyphens, never long dashes; include the URL.\n\nARTICLE URL: {url}\nARTICLE:\n{json.dumps(keep)[:9000]}"
        f"\n\n{SPEC}"
    )
    pack = extract_json(claude(prompt))

    def declash(o):
        if isinstance(o, str):
            return re.sub(r"[—–−]", "-", o)
        if isinstance(o, list):
            return [declash(x) for x in o]
        if isinstance(o, dict):
            return {k: declash(v) for k, v in o.items()}
        return o

    pack = declash(pack)
    pack["url"] = url
    pack["slug"] = a["slug"]
    out = Path(out_dir) if out_dir else Path(article_path).parent
    out.mkdir(parents=True, exist_ok=True)
    (out / "social.json").write_text(json.dumps(pack, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return pack


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: social-pack.py <article.json> [out-dir]", file=sys.stderr)
        sys.exit(1)
    result = build(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
    print(json.dumps(result, indent=2, ensure_ascii=False)[:2000])
