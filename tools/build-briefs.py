#!/usr/bin/env python3
"""Generate BRIEFS.md from data/briefs.json — learner-facing briefs plus the
trainer key, clearly separated. data/briefs.json stays the single source of truth."""
import json, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((root / "data/briefs.json").read_text())

L = []
w = L.append
w("# Capstone client briefs\n")
w(f"> {d['meta']['note']}\n")
w(f"**How to run these:** {d['meta']['howToUse']}\n")

def bullets(title, items):
    if not items: return
    w(f"**{title}**\n")
    for i in items: w(f"- {i}")
    w("")

for mid, b in d["briefs"].items():
    w(f"\n---\n\n## Module {mid} — {b['title']}\n")
    w(f"**Client:** {b['client']} · {b['contact']}  ")
    w(f"**Sector:** {b['sector']}  ")
    w(f"**Time:** {b['budgetTime']}\n")

    w("### The email as it arrived\n")
    w(f"> **Subject:** {b['email']['subject']}")
    w(">")
    for line in b["email"]["body"]:
        w(f"> {line}")
        w(">")
    w("")

    bullets("Attached", b["attachments"])
    bullets("Must have", b["mustHave"])
    bullets("Nice to have", b["niceToHave"])
    bullets("Out of scope", b["outOfScope"])
    bullets("Constraints", b["constraints"])
    bullets("Deliverables", b["deliverables"])

    w("### TRAINER KEY — do not give to the learner\n")
    bullets("What they must surface before coding", b["ambiguities"])
    w("**Facts to release only when asked**\n")
    w("| If they ask about | Tell them |")
    w("|---|---|")
    for k, v in b["facts"].items(): w(f"| {k} | {v} |")
    w("")
    w("**Rubric**\n")
    w("| Area | Weight | Criteria |")
    w("|---|---|---|")
    for r in b["rubric"]: w(f"| {r['area']} | {r['weight']}% | {r['criteria']} |")
    w("")

(root / "BRIEFS.md").write_text("\n".join(L))
print(f"BRIEFS.md written — {len(d['briefs'])} briefs")
