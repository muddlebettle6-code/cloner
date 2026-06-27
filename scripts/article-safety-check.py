#!/usr/bin/env python3
"""Safety review gate for the autonomous daily article.

Complements the structural quality gate in `article-ingest.mjs` (which only
checks that >=3 sources EXIST, section/chart counts, honesty caveats, etc.). This
gate checks the things that one does not:

  * defamation: a negative / accusatory / reputation-damaging claim about a NAMED
    living person or identifiable private company must be directly supported by a
    listed source, or the article is HELD;
  * sourcing: a specific statistic, dollar figure, dated fact, or quote must be
    traceable to a listed source;
  * overreach: a strong causal / predictive conclusion the cited evidence cannot
    support;
  * no investment advice.

It runs through the same local `claude` CLI the writer uses (no API key) and adds
a few deterministic backstops. It is CONSERVATIVE and fails CLOSED: any error,
bad model output, or non-low risk => HOLD.

Exit codes (match the pipeline's convention):
  0  cleared to publish
  2  HOLD as a draft (gate failed, or internal error -> fail closed)

Usage: python3 scripts/article-safety-check.py <article.json>
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys

CLAUDE = os.environ.get("FCRI_CLAUDE_BIN", "claude")

_ADVICE_RE = re.compile(
    r"\b(price target|buy rating|sell rating|should buy|should sell|strong buy|"
    r"strong sell|back up the truck|guaranteed return|table[\s-]?pounding)\b",
    re.IGNORECASE,
)

_PROMPT = """You are the editorial safety reviewer for Cumulant Research. You are the LAST gate before this \
data-journalism article auto-publishes to a public website. Protect against inaccuracy, unsupported claims, and \
defamation. Be conservative: when in doubt, HOLD.

The article (headline, deck, question, takeaways, sections, and the SOURCES it may rely on) as JSON:
---
{article}
---

HOLD the article if ANY of these is true:
1. It makes a negative, accusatory, or reputation-damaging claim about a NAMED living person or an identifiable \
private company/organization that is not directly and clearly supported by one of the listed SOURCES.
2. A specific statistic, dollar figure, percentage, dated fact, or direct quote cannot be traced to a listed SOURCE.
3. It presents analysis/opinion as established fact, overstates a causal or predictive conclusion the evidence \
cannot support, or blurs market reaction with economic effect in a way that misleads.
4. It contains investment advice, a price target, or buy/sell guidance.
5. The sources look irrelevant to, or insufficient for, the claims being made.

Otherwise it may PUBLISH.

Return STRICT JSON, nothing else:
{{
  "decision": "publish" | "hold",
  "risk": "low" | "medium" | "high",
  "reasons": ["short, specific"],
  "unsupported_claims": ["[] if none"],
  "defamation_flags": ["[] if none"]
}}
Only "publish" with "risk":"low" may go live. Any "medium"/"high" MUST be "hold". Return ONLY the JSON object."""


def _claude(prompt: str, timeout: int = 600) -> str:
    proc = subprocess.run([CLAUDE, "-p"], input=prompt, capture_output=True, text=True, timeout=timeout)
    if proc.returncode != 0:
        raise RuntimeError(f"claude failed (rc={proc.returncode}): {(proc.stderr or '').strip()[:300]}")
    return (proc.stdout or "").strip()


def _extract_json(text: str) -> dict:
    t = re.sub(r"^```(?:json)?", "", text.strip()).strip()
    t = re.sub(r"```$", "", t).strip()
    m = re.search(r"\{.*\}", t, re.S)
    if not m:
        raise RuntimeError("no JSON object in response")
    return json.loads(m.group(0))


def _subset(article: dict) -> str:
    keep = {k: article.get(k) for k in
            ("headline", "deck", "question", "takeaways", "sections", "sources")}
    return json.dumps(keep, ensure_ascii=False, indent=2)


def _content_text(article: dict) -> str:
    """Visible prose only. Excludes honesty/methodology/limitations, which
    legitimately mention 'investment advice' / 'price target' to negate them -
    scanning those would be a false positive."""
    parts: list[str] = [str(article.get("headline") or ""), str(article.get("deck") or "")]
    parts += [str(t) for t in (article.get("takeaways") or [])]

    def walk(x):
        if isinstance(x, str):
            parts.append(x)
        elif isinstance(x, list):
            for y in x:
                walk(y)
        elif isinstance(x, dict):
            for y in x.values():
                walk(y)

    walk(article.get("sections"))
    return " ".join(parts)


def _deterministic_flags(article: dict) -> list[str]:
    flags: list[str] = []
    sources = article.get("sources") or []
    with_url = [s for s in sources if re.match(r"^https?://", (s or {}).get("url", ""))]
    if len(with_url) < 3:
        flags.append("fewer than 3 sourced URLs")
    if _ADVICE_RE.search(_content_text(article)):
        flags.append("investment-advice language detected")
    if not (article.get("honesty") or []):
        flags.append("no honesty caveats")
    return flags


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: article-safety-check.py <article.json>", file=sys.stderr)
        return 2
    try:
        article = json.load(open(sys.argv[1], encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        print(f"SAFETY: cannot read article ({exc}) -> HOLD", file=sys.stderr)
        return 2

    try:
        verdict = _extract_json(_claude(_PROMPT.format(article=_subset(article))))
    except Exception as exc:  # noqa: BLE001 - fail closed
        print(f"SAFETY: reviewer failed ({exc}) -> HOLD", file=sys.stderr)
        return 2

    decision = str(verdict.get("decision", "hold")).lower()
    risk = str(verdict.get("risk", "high")).lower()
    reasons = list(verdict.get("reasons") or [])
    unsupported = list(verdict.get("unsupported_claims") or [])
    defamation = list(verdict.get("defamation_flags") or [])
    hard = _deterministic_flags(article)

    cleared = (
        decision == "publish" and risk == "low"
        and not unsupported and not defamation and not hard
    )

    if cleared:
        print(f"SAFETY: cleared (risk=low). {('; '.join(reasons)) or 'clean'}")
        return 0

    msg = reasons + [f"unsupported: {c}" for c in unsupported] \
        + [f"defamation: {c}" for c in defamation] + [f"backstop: {f}" for f in hard]
    print("SAFETY: HOLD ->\n - " + "\n - ".join(msg or ["held"]), file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
