#!/usr/bin/env python3
"""Generate BRIEFS.md from data/briefs.json.

Learner-facing only. The marking keys (ambiguities, withheld facts, rubric) are NOT
in this repository — they live in Firestore under `briefKeys`, trainer-read-only."""
import json, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((root / "data/briefs.json").read_text())

L = []
w = L.append
w("# Capstone client briefs\n")
w(f"> {d['meta']['note']}\n")
w(f"**Trainer key:** {d['meta'].get('trainerKey','')}\n")

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

    w("### Trainer key\n")
    w("The ambiguities, the facts withheld until asked, and the rubric are **not** in this")
    w("repository. They live in the Firestore collection `briefKeys`, readable only by an")
    w("allowlisted trainer, and are shown on the trainer dashboard.\n")

(root / "BRIEFS.md").write_text("\n".join(L))
print(f"BRIEFS.md written — {len(d['briefs'])} briefs")
