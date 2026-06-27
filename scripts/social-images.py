#!/usr/bin/env python3
"""Find + download openly-licensed images for an article's social carousel.

Asks Claude (web) for a few DISTINCT, relevant, high-resolution, openly-licensed
images (prefer Wikimedia Commons), downloads them to .social-assets/<slug>-N.jpg,
and records their credits to .social-assets/<slug>-credits.txt for the caption.
Idempotent: skips if enough images are already present.

Usage: python3 scripts/social-images.py <slug>
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
DEST = ROOT / ".social-assets"
N = int(os.environ.get("SOCIAL_IMAGES_N", "3"))


def claude(prompt: str, timeout: int = 360) -> str:
    p = subprocess.run([CLAUDE, "-p", "--allowedTools", "WebSearch,WebFetch"],
                       input=prompt, capture_output=True, text=True, timeout=timeout)
    if p.returncode != 0:
        raise RuntimeError((p.stderr or "").strip()[:200])
    return p.stdout.strip()


def extract_json(t: str):
    t = re.sub(r"^```(?:json)?", "", t.strip()).strip()
    t = re.sub(r"```$", "", t).strip()
    m = re.search(r"\[.*\]", t, re.S)
    if not m:
        raise RuntimeError("no JSON array")
    return json.loads(m.group(0))


def main() -> None:
    if len(sys.argv) < 2:
        print("usage: social-images.py <slug>")
        return
    slug = sys.argv[1]
    a = json.loads((ART / f"{slug}.json").read_text(encoding="utf-8"))
    DEST.mkdir(exist_ok=True)
    existing = sorted(DEST.glob(f"{slug}-*.jpg"))
    if len(existing) >= N:
        print(f"{slug}: {len(existing)} images already present; skipping")
        return

    prompt = (
        f"Find {N} DISTINCT, real, high-resolution, OPENLY-LICENSED photographs (public domain, CC0, CC BY, or "
        f"CC BY-SA; strongly prefer Wikimedia Commons) to illustrate a financial-news social carousel about this "
        f"story. Each must be a DIFFERENT relevant subject (no near-duplicates), at least 2000px wide, and you must "
        f"return the DIRECT downloadable image FILE url (e.g. upload.wikimedia.org/.../<File>.jpg of the original or "
        f"a large rendering, NOT the 'File:' page). Use web search and fetch to verify each url returns a real image "
        f"and the license is as stated.\n\n"
        f"HEADLINE: {a['headline']}\nDECK: {a.get('deck','')}\n"
        f"TAGS: {', '.join(a.get('tags') or [])}\nINDUSTRIES: {', '.join(a.get('industries') or [])}\n"
        f"COMPANIES: {', '.join(a.get('companies') or [])}\nREGIONS: {', '.join(a.get('regions') or [])}\n\n"
        f'Return ONLY a JSON array of up to {N} objects: '
        f'[{{"imageUrl":"...","credit":"Photo: <author>, <license>, via Wikimedia Commons","subject":"..."}}]. '
        f"Fewer than {N} is fine if you cannot verify enough; never invent a url."
    )
    print(f"{slug}: finding {N} images...", flush=True)
    try:
        imgs = extract_json(claude(prompt))
    except Exception as e:  # noqa: BLE001
        print(f"{slug}: image search failed ({e})")
        return

    n = len(existing)
    credits = []
    for img in imgs if isinstance(imgs, list) else []:
        url = img.get("imageUrl") if isinstance(img, dict) else None
        if not url:
            continue
        n += 1
        dest = DEST / f"{slug}-{n}.jpg"
        r = subprocess.run(["node", "scripts/fetch-image.mjs", url, str(dest)], cwd=str(ROOT))
        if r.returncode == 0:
            credits.append(img.get("credit", "") or "")
            print(f"  saved {dest.name}: {img.get('subject','')[:40]}")
        else:
            n -= 1
    if credits:
        cf = DEST / f"{slug}-credits.txt"
        prev = cf.read_text(encoding="utf-8").splitlines() if cf.exists() else []
        cf.write_text("\n".join(dict.fromkeys([*prev, *[c for c in credits if c]])) + "\n", encoding="utf-8")
    print(f"{slug}: {n} images in .social-assets/")


if __name__ == "__main__":
    main()
