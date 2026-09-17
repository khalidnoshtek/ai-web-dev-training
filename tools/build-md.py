#!/usr/bin/env python3
"""Generate CURRICULUM.md from data/curriculum.json.

The JSON is the single source of truth. Every total in the Markdown is computed
here, so the headline duration can never drift away from the module list -- which
is exactly the failure mode in the original research report.
"""
import json, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((root / "data/curriculum.json").read_text())
m = d["meta"]
mods = d["modules"]
core = [x for x in mods if x["track"] == "core"]
elec = [x for x in mods if x["track"] == "elective"]
core_h = sum(x["hours"] for x in core)
elec_h = sum(x["hours"] for x in elec)

L = []
w = L.append
w(f"# {m['title']}\n")
w(f"> {m['subtitle']}  \n> Curriculum version {m['version']} — updated {m['updated']}\n")
w("## At a glance\n")
w("| | |")
w("|---|---|")
w(f"| Core modules | {len(core)} |")
w(f"| Elective modules | {len(elec)} |")
w(f"| **Core hours** | **{core_h}** |")
w(f"| Elective hours | {elec_h} |")
w(f"| Core duration @ {m['hoursPerWeekDefault']} hrs/week | {core_h/m['hoursPerWeekDefault']:.0f} weeks |")
w(f"| Core duration @ 20 hrs/week | {core_h/20:.0f} weeks |")
w("")
w("All totals above are computed from the per-module hours below. Do not hand-write a total anywhere.\n")

w("## Corrections applied to the source research\n")
for c in d["corrections"]:
    w(f"- **{c['issue']}** _({c['severity']})_ — {c['detail']}")
w("")

w("## Modules\n")
for x in mods:
    tag = "Elective" if x["track"] == "elective" else "Core"
    w(f"### {x['id']:02d}. {x['title']}\n")
    w(f"`{tag}` · **{x['hours']} hours**\n")
    w(f"**Goal:** {x['goal']}\n")
    if x.get("warning"):
        w(f"> ⚠️ **Correction from the source research:** {x['warning']}\n")
    w("**Topics**\n")
    for t in x["topics"]:
        w(f"- {t}")
    w("")
    if x["resources"]:
        w("**Resources**\n")
        w("| Lang | Resource | Type |")
        w("|---|---|---|")
        for r in x["resources"]:
            w(f"| {r['lang'].upper()} | [{r['title']}]({r['url']}) | {r['type']} |")
        w("")
    w("**Exercises**\n")
    for e in x["exercises"]:
        w(f"- {e}")
    w("")
    if x.get("deliverable"):
        w(f"**Deliverable:** {x['deliverable']}\n")

(root / "CURRICULUM.md").write_text("\n".join(L))
print(f"CURRICULUM.md written — {len(mods)} modules, core {core_h}h ({core_h/15:.1f} wks @15h), elective {elec_h}h")
