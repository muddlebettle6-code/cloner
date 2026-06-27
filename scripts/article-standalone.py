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
) + (
    "Write for a MIXED audience - a curious general reader AND a finance professional. Explain every technical "
    "term in plain language; use a concrete comparison or analogy where it makes a hard idea click; and walk the "
    "reader through the research steps so a non-specialist can follow how you reached the finding, without losing "
    "rigor. Prose should be clear and genuinely enjoyable to read, never stilted or awkward. "
    "Design every chart to read cleanly: at most about 8 bars or rows, short clear labels, honest axes that start "
    "at zero unless there is a stated reason, and a chart only when it answers a specific question (never "
    "decoration). Numbers in a chart must be small, comparable, and sane (no value far off the axis).\n"
)

JSON_SPEC = (
    "Return ONLY a JSON object with keys: slug (kebab-case), headline (specific, matches the finding), deck "
    "(1-2 sentences: what happened, what the analysis found, why it matters), takeaways (array of 3 to 5 short "
    "plain-language bullets - the quick version a busy reader sees first), "
    "glossary (array of {term, definition}: EVERY term a non-expert might not know - acronyms, jargon, financial "
    "or technical concepts - each with one plain-language sentence a total beginner could follow), "
    "event, question, readingMinutes (int), tags (array), leadChartId, "
    "leadImage (OPTIONAL {src, caption, credit, alt}; include ONLY an openly-licensed image you verified - "
    "Wikimedia Commons, public domain, a government source, or an official company press image - with a clear "
    "credit; OMIT the key entirely if you cannot confirm the license), "
    "charts (array of {id, kind one of [keynumber,bar,comparison,line,timeline,range,table], title, subtitle?, "
    "source, units?, period?, note?, alt, data}), sections (array of {heading, blocks: array of {type one of "
    "[p,pullquote,callout,chart,image,list], text?, label?, chartId?, items?, src?, caption?, credit?, alt?}}), "
    "methodology (array), sources (array of {title, publisher?, url, kind one of [primary,secondary,academic,"
    "data]}), limitations (array), honesty (array). "
    "Chart data shapes: keynumber {value,label,sub?}; bar/comparison {bars:[{label,value,highlight?}],max?}; "
    "line {series:[{name,points:[{x,y}]}]}; timeline {events:[{date,title,detail?}]}; range "
    "{items:[{label,low,mid,high}]}; table {columns:[...],rows:[[...]]}. Every number traces to a source in "
    "sources[]. Output JSON only, no prose around it."
)


def main() -> None:
    args = sys.argv[1:]
    seed_event = None
    if "--event" in args:
        i = args.index("--event")
        seed_event = args[i + 1]
        del args[i : i + 2]
    seed_section = None
    if "--section" in args:
        i = args.index("--section")
        seed_section = args[i + 1]
        del args[i : i + 2]
    out = Path(args[0]) if args else Path("article_out")
    out.mkdir(parents=True, exist_ok=True)
    log = lambda m: print(f"[{_dt.datetime.now():%H:%M:%S}] {m}", flush=True)  # noqa: E731

    if seed_event:
        log("frame (seeded event)")
        frame = claude(STANDARD + "Frame an investigation of THIS specific current event for a deep data article. "
            "Use web search to confirm the details, dates, and figures. Provide: one narrow research question, one "
            "falsifiable claim, one expected historical comparison, one evidence base, one lead visual, one "
            "plausible alternative explanation, and why it matters now.\n\nEVENT:\n" + seed_event)
    else:
        log("scout")
        scout = claude(STANDARD + "Use web search to find 4 SPECIFIC events from TODAY or the last 7 days (prefer "
            "the most recent; check the dates) suitable for a deep data article in markets, finance, "
            "IPOs/offerings, tariffs/trade, AI investment, disclosure, or economic policy. For each: event, date, "
            "why it matters, the main public claim, primary sources (URLs), available datasets, historical "
            "comparison opportunities, what remains unknown, and 1-5 scores for research value, visual potential, "
            "and public interest. Reject broad, speculative, or unsourced events. Return a clear report.")
        log("frame")
        frame = claude(STANDARD + "From this scouting report, SELECT the one event where original analysis adds "
            "the most evidence and is most likely to yield a NON-OBVIOUS conclusion (not just the most popular "
            "topic). Frame the investigation: one narrow research question, one falsifiable claim, one expected "
            "historical comparison, one evidence base, one lead visual, one plausible alternative explanation, "
            f"and why it matters now.\n\nREPORT:\n{scout}")

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
        "a conclusion that returns to the event. Provide a 'quick version' of 3 to 5 takeaway bullets. If you can "
        "confirm an openly-licensed image (Wikimedia Commons, public domain, government, or official press), add "
        "a leadImage with its credit; otherwise omit it. Use blocks p/pullquote/callout/chart/image/list; place "
        "charts where they answer a question; set leadChartId. Explain hard concepts with a plain analogy and "
        "walk the reader through the research steps. The article must be understandable to ANYONE: define each "
        "technical term in plain words on first use AND add it to the glossary so the reader can hover for a "
        f"definition.\n\nFRAMING:\n{frame}\n\nANALYSIS + CHARTS:\n{analysis[:14000]}"
        f"\n\n{JSON_SPEC}", web=False))

    log("critique")
    critique = claude(STANDARD + "Review this draft hard, simultaneously as an investigative editor, a data "
        "journalist + statistician, a skeptical market analyst, a VISUAL EDITOR, and a curious general reader. "
        "List concrete required fixes.\n"
        "CHECK THE VISUALS (this matters): for every chart, does it answer a real question, are the numbers sane "
        "and comparable (no value that would blow past the axis or dwarf the rest), are there at most ~8 "
        "bars/rows, are labels short and clear, are axes honest. Flag any chart that is confusing, decorative, "
        "mis-scaled, or has bad/overflowing data, and say exactly how to fix it or that it should be cut.\n"
        "CHECK READABILITY: flag anything awkwardly phrased or jargon-heavy; require a plain-language analogy or "
        "comparison wherever a hard concept appears; confirm a non-specialist can follow the research steps; "
        "confirm the takeaways are a genuinely clear quick summary.\n"
        "ALSO: unsupported claims, headline overreach beyond the evidence, a missing counterargument, confusing "
        f"market reaction with economic effect, a missing exposed group.\n\nDRAFT:\n{json.dumps(draft)[:15000]}", web=False)

    # Save the (valid) draft so a revise-parse failure can fall back to it.
    (out / "draft.json").write_text(json.dumps(draft, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    log("revise")
    final = draft
    try:
        revised = extract_json(claude(STANDARD + "Produce the FINAL article addressing every critique: remove "
            "unsupported claims, match the headline to the evidence, ensure >=2 competing explanations, note where "
            "the historical comparison breaks, give each scenario its triggering evidence, make every chart honest "
            "and sourced, and make the limitations explicit. Output ONLY the JSON object, nothing before or after "
            f"it.\n\nDRAFT:\n{json.dumps(draft)[:13000]}\n\nCRITIQUE:\n{critique[:8000]}\n\n{JSON_SPEC}", web=False))
        if revised.get("headline") and revised.get("sections"):
            final = revised
        else:
            log("revise output incomplete; using the critiqued draft")
    except Exception as exc:  # noqa: BLE001 - never lose the article over a parse hiccup
        log(f"revise parse failed ({exc}); using the critiqued draft")

    log("verify")
    try:
        checked = extract_json(claude(STANDARD + "FACT-CHECK and clarify this finished article; use web search "
            "and fetch. (1) For EVERY number, date, name, quote, and factual claim, confirm it against a primary "
            "or reputable source; if you cannot confirm it, or it is wrong, FIX it to match the source or cut it "
            "- never invent and never keep a shaky claim. (2) Make sure a NON-EXPERT can understand every "
            "sentence: reword anything awkward, vague, or confusing, and explain each technical term in plain "
            "words on first use. (3) Fill 'glossary' with every term a general reader might not know, each one "
            "plain sentence. Keep all real sources. Return the corrected FULL article as JSON.\n\nARTICLE:\n"
            f"{json.dumps(final)[:15000]}\n\n{JSON_SPEC}", web=True))
        if checked.get("headline") and checked.get("sections"):
            final = checked
        else:
            log("verify output incomplete; keeping the revised article")
    except Exception as exc:  # noqa: BLE001 - verification is best-effort
        log(f"verify parse failed ({exc}); keeping the revised article")

    log("illustrate")
    try:
        img = extract_json(claude(STANDARD + "Find ONE real, high-resolution, OPENLY-LICENSED photograph to "
            "illustrate this article. The license MUST be public domain, CC0, CC BY, or CC BY-SA - strongly "
            "prefer Wikimedia Commons (or NASA, public domain, for space topics). It must be a REAL photo of the "
            "concrete subject (a chip or silicon wafer for semiconductors, a satellite or phased-array antenna "
            "for SpaceX, a quantum computer for quantum, a lab for biotech, a data center for AI, an Apple Store "
            "or device for Apple). At least 1600px wide, ideally 3000px+. Use web search and fetch to find the "
            "file and VERIFY the direct url returns an image and the license is as stated. Return JSON {found, "
            "imageUrl (the DIRECT upload.wikimedia.org/... file url of the original or a large rendering, NOT the "
            "File: page), credit ('Photo: <author>, <license>, via Wikimedia Commons'), caption (one sentence "
            "tying it to the story), alt}. Return {\"found\": false} if you cannot verify one.\n\nARTICLE: "
            f"{final.get('headline', '')}\nEVENT: {str(final.get('event', ''))[:400]}", web=True))
        if img.get("found") and img.get("imageUrl"):
            final["leadImage"] = {
                "src": img["imageUrl"], "credit": img.get("credit", ""),
                "caption": img.get("caption", ""), "alt": img.get("alt", final.get("headline", "")),
            }
    except Exception as exc:  # noqa: BLE001 - illustration is best-effort
        log(f"illustrate failed ({exc})")

    log("classify")
    try:
        meta = extract_json(claude(STANDARD + "Classify this finished article for a financial newsroom and write "
            "editorial metadata, based ONLY on the article. Return JSON with: primarySection (one of: markets, "
            "economy, politics, policy, geopolitics, business, technology, ai, banking, investing, "
            "personal-finance, real-estate, energy, commodities, healthcare, consumer, labor, trade, deals, "
            "crypto, global-markets, research, explainers, opinion, breaking); articleType (one of: breaking, "
            "news-analysis, market-brief, explainer, data-story, company-analysis, policy-impact, geopolitical, "
            "personal-finance-guide, feature, research-note, opinion); companies[]; people[]; regions[]; "
            "industries[]; assetClasses[]; impactTags[]; topicTags[] (2-6 controlled, non-duplicative); "
            "readerLevel (Beginner/Intermediate/Advanced); timeHorizon (Short-Term/Medium-Term/Long-Term); "
            "newsScore (0-100); confidenceLevel (high/medium/low); keyPoints[] (3-5 crisp bullets); whyItMatters "
            "(2-4 sentences connecting the event to markets, industries and people); whatToWatch[] (2-4 "
            "forward-looking).\n\nARTICLE:\n"
            f"{json.dumps({k: final.get(k) for k in ('headline', 'deck', 'event', 'question', 'takeaways', 'sections')})[:13000]}",
            web=False))
        for k in ("articleType", "companies", "people", "regions", "industries", "assetClasses", "impactTags",
                  "readerLevel", "timeHorizon", "newsScore", "confidenceLevel", "keyPoints", "whyItMatters",
                  "whatToWatch"):
            if meta.get(k) is not None:
                final[k] = meta[k]
        final["primarySection"] = seed_section or meta.get("primarySection") or "markets"
        if meta.get("topicTags"):
            final["tags"] = list(dict.fromkeys((final.get("tags") or []) + meta["topicTags"]))[:8]
    except Exception as exc:  # noqa: BLE001 - classification is best-effort
        log(f"classify failed ({exc})")
        if seed_section:
            final["primarySection"] = seed_section

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
