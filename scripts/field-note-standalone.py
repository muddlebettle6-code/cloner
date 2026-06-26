#!/usr/bin/env python3
"""Standalone daily field-note generator.

Generates a current-events field note using the FCRI field-note logic and the
Claude CLI, WITHOUT needing the full FCRI virtualenv. It loads only the two
modules it needs (field_note + news_gdelt) directly, so the requirements are
just Python 3, certifi, and the `claude` CLI being on PATH.

Usage:  python3 scripts/field-note-standalone.py [output-dir] [--timespan 2d]
Writes <output-dir>/note.json and prints its path.
"""
from __future__ import annotations

import importlib.util
import json
import os
import sys
import types
from pathlib import Path

FCRI = Path(os.environ.get("FCRI_DIR", str(Path.home() / "Desktop" / "cumulant" / "FCRI")))


def _load(modname: str, path: Path):
    spec = importlib.util.spec_from_file_location(modname, str(path))
    module = importlib.util.module_from_spec(spec)
    sys.modules[modname] = module
    spec.loader.exec_module(module)
    return module


# Register light parent packages so the dotted import inside field_note resolves
# without running FCRI's real package __init__ (which would need the full env).
for pkg in ("fcri", "fcri.data_sources", "fcri.publication"):
    sys.modules.setdefault(pkg, types.ModuleType(pkg))

_load("fcri.data_sources.news_gdelt", FCRI / "fcri" / "data_sources" / "news_gdelt.py")
field_note = _load("fcri.publication.field_note", FCRI / "fcri" / "publication" / "field_note.py")


class _Config:
    """Minimal config: field_note only reads memory_dir (for KG grounding)."""

    memory_dir = FCRI / "memory"


def main() -> None:
    args = sys.argv[1:]
    timespan = "2d"
    if "--timespan" in args:
        i = args.index("--timespan")
        timespan = args[i + 1]
        del args[i : i + 2]
    out_dir = Path(args[0]) if args else (FCRI / "field_notes" / "manual")
    out_dir.mkdir(parents=True, exist_ok=True)

    try:
        note = field_note.generate_field_note(_Config(), timespan=timespan)
    except field_note.FieldNoteError as exc:
        print(f"field-note generation failed: {exc}", file=sys.stderr)
        sys.exit(1)

    note_path = out_dir / "note.json"
    note_path.write_text(json.dumps(note, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(str(note_path))


if __name__ == "__main__":
    main()
