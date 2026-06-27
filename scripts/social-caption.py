#!/usr/bin/env python3
"""Social caption generator — platform-tuned copy for an article's social post.

Writes captions for LinkedIn, Instagram, Facebook, Reddit, and X in the Cumulant
voice (sharp, credible, never hype, never investment advice, AI-assisted +
source-backed disclosure preserved). Output: captions.md beside the cards.

Usage:
  python3 scripts/social-caption.py --slug <slug> [--out DIR]
  python3 scripts/social-caption.py --latest 1
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

CLAUDE = os.environ.get("FCRI_CLAUDE_BIN", "claude")
ROOT = Path(os.environ.get("SITE_DIR", str(Path.home() / "cloner")))
ART = ROOT / "content" / "articles"
OUT_BASE = Path(os.environ.get("SOCIAL_OUT", str(Path.home() / "Downloads" / "cumulant-social")))


def arg(name, default=None):
    a = sys.argv
    return a[a.index(f"--{name}") + 1] if f"--{name}" in a and a.index(f"--{name}") + 1 < len(a) else default


def claude(prompt: str, timeout: int = 240) -> str:
    p = subprocess.run([CLAUDE, "-p"], input=prompt, capture_output=True, text=True, timeout=timeout)
    if p.returncode != 0:
        raise RuntimeError((p.stderr or "").strip()[:200])
    return p.stdout.strip()


def extract_json(t: str) -> dict:
    t = re.sub(r"^```(?:json)?", "", t.strip()).strip()
    t = re.sub(r"```$", "", t).strip()
    m = re.search(r"\{.*\}", t, re.S)
    if not m:
        raise RuntimeError("no JSON")
    return json.loads(m.group(0))


def load_article():
    slug = arg("slug")
    if slug:
        return json.loads((ART / f"{slug}.json").read_text())
    arts = [json.loads(f.read_text()) for f in ART.glob("*.json")]
    arts = [a for a in arts if a.get("published") is not False]
    arts.sort(key=lambda a: a.get("publishedAt", a.get("date", "")), reverse=True)
    return arts[0]


def main() -> None:
    a = load_article()
    slug = a["slug"]
    link = f"cumulant.org/articles/{slug}"
    takeaways = "\n".join(f"- {t}" for t in (a.get("takeaways") or [])[:5])
    keypoints = "\n".join(f"- {k}" for k in (a.get("keyPoints") or [])[:4])

    prompt = (
        "You are the social editor for Cumulant Research, an independent, AI-assisted financial-and-economic "
        "newsroom. Write platform-tuned captions for a social post (a carousel) about the article below. "
        "VOICE: sharp, credible, plain-language; never hype; never investment advice or a recommendation to buy or "
        "sell; do not promise outcomes. Where natural, preserve that the analysis is AI-assisted and source-backed. "
        "No em dashes. Reddit must be non-promotional and analytical (Reddit dislikes marketing).\n\n"
        f"HEADLINE: {a['headline']}\n"
        f"DECK: {a.get('deck','')}\n"
        f"WHY IT MATTERS: {a.get('whyItMatters','')}\n"
        f"TAKEAWAYS:\n{takeaways}\n"
        f"KEY POINTS:\n{keypoints}\n"
        f"LINK: {link}\n\n"
        "Return STRICT JSON:\n"
        '{\n'
        '  "linkedin": "hook line, then 2-3 sentences of the core insight, a soft question to the reader, the link, '
        'and 3-5 professional hashtags",\n'
        '  "instagram": "punchy hook, 1-2 sentences of context, then \'Full analysis at the link in our bio\', then '
        '6-9 relevant hashtags",\n'
        '  "facebook": "conversational 2-3 sentences plus the link",\n'
        '  "reddit": {"title": "a neutral, specific, non-clickbait title", "body": "2-4 analytical sentences, the '
        'link, and a note that it is AI-assisted analysis"},\n'
        '  "x": "<= 270 characters: hook plus the link plus 1-2 hashtags"\n'
        '}\nOutput ONLY the JSON.'
    )
    print(f"writing captions for {slug} ...", flush=True)
    c = extract_json(claude(prompt))

    out_dir = Path(arg("out") or (OUT_BASE / f"carousel-{slug}"))
    out_dir.mkdir(parents=True, exist_ok=True)
    rd = c.get("reddit", {}) if isinstance(c.get("reddit"), dict) else {"title": "", "body": str(c.get("reddit", ""))}
    md = (
        f"# Social captions — {a['headline']}\n\n{link}\n\n"
        f"## LinkedIn\n\n{c.get('linkedin','')}\n\n"
        f"## Instagram\n\n{c.get('instagram','')}\n\n"
        f"## Facebook\n\n{c.get('facebook','')}\n\n"
        f"## Reddit\n\n**Title:** {rd.get('title','')}\n\n{rd.get('body','')}\n\n"
        f"## X / Twitter\n\n{c.get('x','')}\n"
    )
    (out_dir / "captions.md").write_text(md, encoding="utf-8")
    print(f"saved -> {out_dir / 'captions.md'}\n")
    print(md)


if __name__ == "__main__":
    main()
