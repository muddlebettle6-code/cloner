#!/usr/bin/env python3
"""Standalone deep-article pipeline for the autonomous daily job.

Drives the data-journalism desk roles through the Claude CLI (no API key; real
web research via --allowedTools): scout -> frame -> field study -> analysis ->
write -> critique -> revise. Writes a publication-quality article.json.

Usage: python3 scripts/article-standalone.py [output-dir]
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
TODAY = _dt.date.today().strftime("%d %B %Y")


def claude(prompt: str, *, web: bool = True, timeout: int = 1500) -> str:
    args = [CLAUDE, "-p"]
    if web:
        args += ["--allowedTools", "WebSearch,WebFetch"]
    proc = subprocess.run(args, input=prompt, capture_output=True, text=True, timeout=timeout)
    if proc.returncode != 0:
        raise RuntimeError(f"claude failed (rc={proc.returncode}): {(proc.stderr or '').strip()[:300]}")
    return (proc.stdout or "").strip()


def extract_json(text: str) -> dict:
    t = re.sub(r"^```(?:json)?", "", text.strip()).strip()
    t = re.sub(r"```$", "", t).strip()
    m = re.search(r"\{.*\}", t, re.S)
    if not m:
        raise RuntimeError("no JSON object in response")
    return json.loads(m.group(0))


STANDARD = (
    "You are Cumulant Research's data-journalism desk. The product is a deeply reported article that "
    "combines a research paper's rigor with a news feature's clarity and a data story's visuals (FT / "
    "Economist / NYT Upshot / ProPublica level, no single house voice). RULES: ground EVERY factual claim "
    "and number in a real web-found source with a URL (use web search/fetch); NEVER fabricate statistics, "
    "quotes, studies, datasets, or experts; distinguish market reaction from economic effect and description "
    "from causation; answer ONE narrow consequential question with evidence (not a broad overview); use plain "
    "hyphens, never em dashes; byline is Cumulant Research.\n"
) + (
    f"Today is {TODAY}. Strongly prefer an event from today or the last 7 days; the fresher the better. "
    "Treat anything older than about 10 days as stale unless it is the essential backdrop to a development "
    "happening right now.\n"
)

JSON_SPEC = (
    "Return ONLY a JSON object with keys: slug (kebab-case), headline (specific, matches the finding), deck "
    "(1-2 sentences: what happened, what the analysis found, why it matters), event, question, readingMinutes "
    "(int), tags (array), leadChartId, charts (array of {id, kind one of "
    "[keynumber,bar,comparison,line,timeline,range,table], title, subtitle?, source, units?, period?, note?, "
    "alt, data}), sections (array of {heading, blocks: array of {type one of [p,pullquote,callout,chart,list], "
    "text?, label?, chartId?, items?}}), methodology (array), sources (array of {title, publisher?, url, kind "
    "one of [primary,secondary,academic,data]}), limitations (array), honesty (array). "
    "Chart data shapes: keynumber {value,label,sub?}; bar/comparison {bars:[{label,value,highlight?}],max?}; "
    "line {series:[{name,points:[{x,y}]}]}; timeline {events:[{date,title,detail?}]}; range "
    "{items:[{label,low,mid,high}]}; table {columns:[...],rows:[[...]]}. Every number must trace to a source in "
    "sources[]. Output JSON only, no prose around it."
)


def main() -> None:
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("article_out")
    out.mkdir(parents=True, exist_ok=True)
    log = lambda m: print(f"[{_dt.datetime.now():%H:%M:%S}] {m}", flush=True)  # noqa: E731

    log("scout")
    scout = claude(STANDARD + "Use web search to find 4 SPECIFIC events from TODAY or the last 7 days (prefer "
        "the most recent; check the dates) suitable for a deep data article in markets, finance, IPOs/offerings, "
        "tariffs/trade, AI investment, disclosure, or economic policy. For each: event, date, why it matters, "
        "the main public claim, primary sources (URLs), "
        "available datasets, historical comparison opportunities, what remains unknown, and 1-5 scores for "
        "research value, visual potential, and public interest. Reject broad, speculative, or unsourced events. "
        "Return a clear report.")

    log("frame")
    frame = claude(STANDARD + "From this scouting report, SELECT the one event where original analysis adds the "
        "most evidence and is most likely to yield a NON-OBVIOUS conclusion (not just the most popular topic). "
        "Frame the investigation: one narrow research question, one falsifiable claim, one expected historical "
        "comparison, one evidence base, one lead visual, one plausible alternative explanation, and why it "
        f"matters now.\n\nREPORT:\n{scout}")

    log("field study")
    dossier = claude(STANDARD + "Build a reporting dossier. Use web search/fetch for REAL material: primary "
        "documents (filings, regulator/government releases, official statements, data releases), datasets with "
        "actual numbers, academic/expert sources, prior comparable cases with figures, the main public claims, "
        "contradictory evidence, useful exact quotations (with who said them and the URL), and a dated timeline. "
        "Label each source primary/secondary/academic/data with URLs, and capture specific numbers with their "
        f"source. Invent nothing.\n\nFRAMING:\n{frame}")

    log("analysis")
    analysis = claude(STANDARD + "Do the original analysis a data journalist would (historical comparison, "
        "cross-sectional exposure, concentration, distribution, scenario analysis, or simple time-series), "
        "grounded only in the dossier (extend with web search if needed). Produce the main finding, at least one "
        "counter-finding, the key uncertainty, the specific NON-OBVIOUS point the headlines miss, and 4-6 chart "
        f"specs with real sourced data.\n\nDOSSIER:\n{dossier[:14000]}")

    log("write")
    draft = extract_json(claude(STANDARD + "Write the full article. Sections in order: a real news hook (a "
        "decision/filing/market move/data release, not a definition), the central question, what happened "
        "(dates and actors), what the data says (lead the evidence), what the headline misses (the intellectual "
        "center), competing explanations (>=2 with support for each), historical comparison (similar/different/"
        "where the analogy breaks), who is exposed (companies/regions/households/industries), what happens next "
        "(base/upside/downside scenarios, each with the evidence that would make it likelier), limitations, and "
        "a conclusion that returns to the event. Use blocks p/pullquote/callout/chart/list; place charts where "
        f"they answer a question; set leadChartId.\n\nFRAMING:\n{frame}\n\nANALYSIS + CHARTS:\n{analysis[:14000]}"
        f"\n\n{JSON_SPEC}", web=False))

    log("critique")
    critique = claude(STANDARD + "Review this draft hard, simultaneously as an investigative editor, a data "
        "journalist + statistician, a skeptical market analyst, and a general reader. List concrete required "
        "fixes: unsupported claims, headline overreach beyond the evidence, a missing counterargument, a "
        "dishonest visual, confusing market reaction with economic effect, a missing exposed group, jargon, or "
        f"weak transitions.\n\nDRAFT:\n{json.dumps(draft)[:15000]}", web=False)

    log("revise")
    final = extract_json(claude(STANDARD + "Produce the FINAL article addressing every critique: remove "
        "unsupported claims, match the headline to the evidence, ensure >=2 competing explanations, note where "
        "the historical comparison breaks, give each scenario its triggering evidence, make every chart honest "
        f"and sourced, and make the limitations explicit.\n\nDRAFT:\n{json.dumps(draft)[:13000]}\n\nCRITIQUE:\n"
        f"{critique[:8000]}\n\n{JSON_SPEC}", web=False))

    final["date"] = _dt.date.today().isoformat()
    final.setdefault("byline", "Cumulant Research")
    final["honesty"] = [
        "This is AI-assisted analysis under stated assumptions; it is not investment advice or a price target.",
        "Figures are as of the publication date and trace to the cited sources; markets and disclosures change.",
    ]

    (out / "article.json").write_text(json.dumps(final, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(str(out / "article.json"))


if __name__ == "__main__":
    main()
