# AI-Assisted Web Developer — training programme

A 21-module curriculum that takes an IT administrator to the point of being able to plan,
build, deploy and maintain modern websites with AI assistance.

**Course interface: English. Video resources: Hindi.** Official documentation is linked in
English because that is where it is authoritative and kept current.

- **Live site:** <https://khalidnoshtek.github.io/ai-web-dev-training/>
- **Curriculum source of truth:** [`data/curriculum.json`](data/curriculum.json)
- **Readable version:** [`CURRICULUM.md`](CURRICULUM.md) (generated — do not edit by hand)

## What this is

| | |
|---|---|
| Core modules | 19 |
| Elective modules | 2 (WordPress, React/Next.js) |
| **Core hours** | **373** |
| Elective hours | 55 |
| Core duration | ~25 weeks at 15 hrs/week, ~19 weeks at 20 hrs/week |

Every total displayed on the site and in `CURRICULUM.md` is computed from the per-module
hours in `data/curriculum.json`. There is no hand-written total anywhere, by design.

## Provenance and corrections

This curriculum was rebuilt from a deep-research report that contained several errors. They
are recorded in the `corrections` array of `data/curriculum.json` and rendered on the site
rather than being silently patched. The significant ones:

1. **Fabricated CLI commands.** The report taught `claude plan`, `claude write`, `claude fix`,
   `claude test` and `claude doc` as the Claude Code interface. None of those commands exist.
   Module 11 now teaches the real surface (`claude`, `claude -p`, `claude update`,
   `claude doctor`, `claude mcp`, `claude config`, in-session slash commands, plan mode) and
   links the official documentation first.
2. **Self-contradicting timings.** The report claimed 12–16 weeks / 200–230 hours while its own
   module table summed to roughly 21–25 weeks. Hours are now per-module and totals are computed.
3. **Unsourced citations.** The report's Sources section named W3C, MDN, Cloudflare, GitHub and
   Wikipedia without a single URL, and its resource list was full of "if available" / "if exists".
   Every resource here is a real URL, found by search and marked `verified` in the JSON.
4. **Unworkable progress tracking.** The report proposed learners editing `progress.json` on a
   static GitHub Pages host, which a browser cannot write to. Progress is now kept in
   `localStorage` with an **Export progress** button that produces a JSON snapshot for the trainer.
5. Removed: a "use Mandarin (Hindi) articles" instruction, a leftover drafting note naming the
   author, and a ₹50L+/yr salary framing that a first web-development course cannot deliver.

## Running it locally

```bash
python3 -m http.server 8791
```

Then open <http://localhost:8791>. A server is required — the page fetches
`data/curriculum.json`, which the browser blocks over `file://`.

## Editing the curriculum

Edit `data/curriculum.json` only, then regenerate the Markdown:

```bash
python3 tools/build-md.py
```

The site reads the JSON directly, so it needs no build step.

## Progress tracking

Progress is stored per-browser in `localStorage` under `aiwd.progress.v1`. It is not shared
between devices and never leaves the machine. **Export progress** downloads a dated JSON file
listing completed modules and hours for the trainer.

## Structure

```
index.html              the course site
assets/styles.css       styling, light and dark
assets/app.js           rendering, progress, filters, export
data/curriculum.json    single source of truth
tools/build-md.py       regenerates CURRICULUM.md from the JSON
CURRICULUM.md           generated — do not edit by hand
```
