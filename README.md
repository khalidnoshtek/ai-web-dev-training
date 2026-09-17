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

## Google sign-in setup (one-time, console only)

The site runs in **local mode** until this is done — progress saves to the browser and
nothing breaks. These steps need your Google account, so they cannot be scripted.

1. **Create a project** at <https://console.firebase.google.com> (a new one — do not reuse an
   unrelated production project). Google Analytics can be left off.
2. **Add a web app**: Project settings → Your apps → Web (`</>`). Copy the `firebaseConfig` object.
3. **Paste it** into [`assets/firebase-config.js`](assets/firebase-config.js), replacing the
   `REPLACE_ME` placeholders. These values are *not* secrets — Firebase web API keys are public
   identifiers and are meant to ship in client code. Access is controlled by the security rules
   in step 5.
4. **Enable Google sign-in**: Authentication → Sign-in method → Google → Enable → set a support
   email → Save. Then under Authentication → Settings → **Authorised domains**, add
   `khalidnoshtek.github.io`. Without this, sign-in fails with `auth/unauthorized-domain` —
   the site shows that exact message if it happens.
5. **Create Firestore**: Build → Firestore Database → Create database → production mode →
   region `asia-south1` (Mumbai). Then paste the contents of
   [`firestore.rules`](firestore.rules) into the Rules tab and Publish. Those rules let each
   signed-in user read and write **only their own** progress document, and nothing else.
6. Commit and push. Sign-in is live.

### What is stored

One document per learner at `progress/{uid}`:

```json
{
  "modules":  { "6": true },
  "videos":   { "q8EevlEpQ2A": true },
  "email":    "learner@example.com",
  "displayName": "Learner Name",
  "updatedAt": "2026-09-17T12:00:00.000Z"
}
```

Name, email and photo are read from the Google profile purely to label progress. If the learner
ticks modules before signing in, that local progress is **merged** into the account on first
sign-in rather than being overwritten.

### Trainer dashboard

[`trainer.html`](trainer.html) is a separate page showing every learner: core percentage, modules
done, hours, videos watched, last activity, and a per-module grid of what is and is not finished.
It sorts by progress and exports the cohort to CSV.

Access is enforced in `firestore.rules`, not in the page. Only an allowlisted trainer may `list`
the `progress` collection, so one learner can never enumerate or read another's document. To
change who counts as a trainer, edit `trainers()` at the top of
[`firestore.rules`](firestore.rules) and redeploy:

```bash
firebase deploy --only firestore:rules
```

A non-allowlisted account that opens the dashboard gets a clear "This account is not a trainer"
message rather than an empty page.

## Design

The interface follows the **AI Web Developer** LMS design artifact: Plus Jakarta Sans for UI,
Hind for Devanagari, JetBrains Mono for code, indigo primary, 14px cards and 20px pills, with
the learning-path timeline, stat cards and bottom navigation from that design.

Screens in the design that are **not** built, because there is no data behind them: streaks,
the quiz engine and scores, AI challenges, badges/certification, the prompt library and the
glossary. The curriculum file records quiz *question counts* only — no question bank exists yet,
so a quiz screen would have been a mockup rather than a feature.

Built screens: sign-in, dashboard, learning path, module detail with video players, my progress,
and the trainer dashboard.

## Videos

All 40 Hindi video resources are embedded and play inside the page via
`youtube-nocookie.com` — the learner never leaves the site. Each card has its own
**Mark watched** toggle that syncs with the rest of the progress.

Players load only when the play button is pressed (a thumbnail facade), so opening a module
does not pull in several megabytes of YouTube iframes.

The 28 **documentation** links (MDN, Claude docs, GitHub Docs, OWASP, web.dev) still open in a
new tab. That is not a shortcut: those sites send `X-Frame-Options`/`frame-ancestors` headers
that refuse framing, so they cannot be embedded by anyone.

Every embed is availability-checked. One playlist in Module 6
(CodeWithHarry's Git series) returned "This video is unavailable" when framed and was replaced
with Chai aur Code's and CodeWithHarry's single-video Git courses.

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

With Google sign-in configured, progress lives in Firestore against the learner's account and
follows them to any device. `localStorage` (`aiwd.progress.v2`) is kept as an offline cache and
is merged into the account on sign-in, so nothing is lost. Progress saved under the older
`aiwd.progress.v1` key is migrated automatically.

**Export** downloads a dated JSON snapshot of completed modules, hours and videos watched.

## Structure

```
index.html                  the course site (dashboard, path, progress)
trainer.html                trainer dashboard — cohort progress, CSV export
assets/styles.css           design system, light and dark
assets/app.js               rendering, auth, cloud sync, video players, export
assets/trainer.js           trainer dashboard logic
assets/firebase-config.js   YOUR Firebase web config goes here
firestore.rules             security rules — paste into the Firestore console
data/curriculum.json        single source of truth
tools/build-md.py           regenerates CURRICULUM.md from the JSON
CURRICULUM.md               generated — do not edit by hand
```
