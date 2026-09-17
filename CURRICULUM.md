# AI-Assisted Web Developer

> Course UI in English · Video resources in Hindi  
> Curriculum version 1.0.0 — updated 2026-09-17

## At a glance

| | |
|---|---|
| Core modules | 19 |
| Elective modules | 2 |
| **Core hours** | **373** |
| Elective hours | 55 |
| Core duration @ 15 hrs/week | 25 weeks |
| Core duration @ 20 hrs/week | 19 weeks |

All totals above are computed from the per-module hours below. Do not hand-write a total anywhere.

## Corrections applied to the source research

- **Fabricated Claude Code commands** _(high)_ — The source report taught `claude plan`, `claude write`, `claude fix`, `claude test`, `claude doc`. None of these exist. Module 11 now teaches the real CLI surface and links the official docs first.
- **Self-contradicting time estimates** _(high)_ — The report claimed 12-16 weeks / 200-230 hours while its own module table summed to roughly 21-25 weeks. All totals on this site are now computed from module hours in this file, so they cannot drift apart again.
- **'Use Mandarin (Hindi) tech news articles'** _(medium)_ — Mandarin is not Hindi. Removed.
- **Drafting notes left in the deliverable** _(medium)_ — The report's API section contained 'Postman/Khalid Shaikh (the user might know from profile)? (Not sure)'. Removed.
- **Citations with no sources** _(high)_ — The report's Sources section name-dropped W3C, MDN, Cloudflare, GitHub and Wikipedia without a single URL, and Section 6 listed resources as 'if available' / 'if exists'. Every resource here is a real URL found by search and marked verified.
- **Unrealistic salary framing** _(medium)_ — The report tied the programme to a stated goal of Rs 50L+/yr. That is not a realistic outcome of a first web development course and has been dropped from the objectives.
- **Module 11 had no time estimate** _(low)_ — The only module in the table without a duration was the Claude Code module. It is now 21 hours.
- **Progress tracking design could not work** _(medium)_ — The report proposed learners editing progress.json on a static GitHub Pages host, which is not writable from the browser. Progress here is stored in localStorage with an export button that produces a JSON file for the trainer.

## Modules

### 00. Orientation & Setup

`Core` · **3 hours**

**Goal:** Get accounts, tools and the progress tracker working before any code is written.

**Topics**

- How this course is structured: 20% concepts, 20% video, 50% building, 10% assessment
- Install VS Code, Git, Chrome; create a GitHub account
- Create the course repo and turn on GitHub Pages
- How to mark progress and export it for the trainer

**Resources**

| Lang | Resource | Type |
|---|---|---|
| EN | [VS Code — official download](https://code.visualstudio.com/download) | docs |
| EN | [GitHub — Hello World quickstart](https://docs.github.com/en/get-started/start-your-journey/hello-world) | docs |

**Exercises**

- Install VS Code and Git; run `git --version` and paste the output into your notes.
- Create a GitHub account and a public repo named `web-dev-practice`.
- Open this course site, tick this module complete, and export your progress JSON.

**Deliverable:** A GitHub account plus an empty `web-dev-practice` repo.

### 01. How Websites Actually Work

`Core` · **12 hours**

**Goal:** Explain, without hand-waving, what happens between typing a URL and seeing a page.

**Topics**

- Client, server, request/response
- Domain names, registrars, DNS records (A, CNAME, nameservers)
- Hosting: shared vs static vs cloud
- HTTP vs HTTPS, status codes (200/301/404/500)
- Front-end vs back-end vs CMS vs API
- Browser DevTools: Network tab, View Source

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [How Website Works? Domain aur Hosting kya hai](https://www.youtube.com/watch?v=Zy37T7G8t08) | video |
| HI | [What is DNS? Domain Name Server — Hindi](https://www.youtube.com/watch?v=VsWsJhedZIY) | video |
| HI | [Domain ko Hosting se connect karna (Nameserver + DNS records) — Hindi](https://www.youtube.com/watch?v=X0TQbHKiZCc) | video |
| EN | [MDN — How the web works](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works) | docs |

**Exercises**

- Open DevTools → Network on any news site. Record: how many requests, total transfer size, slowest request.
- Run `dig medlab.noshtek.ai` (or any domain) and write down what the A record resolves to.
- Find one site that returns a 301 redirect and one that returns 404. Screenshot both in the Network tab.

**Deliverable:** A one-page written note (English or Hindi) tracing a URL to a rendered page.

### 02. HTML Foundations

`Core` · **30 hours**

**Goal:** Write valid, semantic HTML5 from scratch without copying a template.

**Topics**

- Document skeleton: DOCTYPE, html, head, body, meta, charset, viewport
- Text: headings, paragraphs, strong/em, lists
- Links and images, relative vs absolute paths, alt text
- Semantic layout: header, nav, main, section, article, aside, footer
- Tables when they are actually appropriate
- Forms: input types, label, select, textarea, button, required, validation attributes
- Accessibility basics baked in from day one

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [Web Development Tutorials For Beginners In Hindi (HTML section) — CodeWithHarry](https://www.youtube.com/playlist?list=PLu0W_9lII9agiCUZYRsvtGTXdxkzPyItg) | playlist |
| HI | [Front End Web Development Full Course [22 Hours] — WsCube Tech](https://www.youtube.com/watch?v=kUJPZbUPqro) | video |
| HI | [Web Development Course [Hindi] — HTML, CSS, JavaScript — WsCube](https://www.youtube.com/playlist?list=PLf0LpPWikpPf1RKBsgKl-bMuEIJUn1ilC) | playlist |
| EN | [MDN — HTML elements reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements) | docs |

**Exercises**

- Build `profile.html`: your bio, a photo, a skills list, and a table of past roles. No CSS yet.
- Build `contact.html` with a form: name, email, phone, dropdown for enquiry type, message, submit. Use correct input types.
- Run both pages through the W3C validator and fix every error.

**Deliverable:** Two valid HTML pages committed to `web-dev-practice`.

### 03. CSS Fundamentals

`Core` · **27 hours**

**Goal:** Style a page deliberately — and know why a rule wins over another.

**Topics**

- Selectors: element, class, id, descendant, pseudo-class, pseudo-element
- Specificity and the cascade — the #1 source of beginner confusion
- Box model: content, padding, border, margin, box-sizing
- Units: px, rem, em, %, vw/vh
- Colour, typography, web fonts
- Backgrounds, borders, shadows, transitions
- Organising CSS: variables, naming, file structure

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [CSS Tutorial In Hindi (with notes) — CodeWithHarry](https://www.youtube.com/watch?v=Edsxf_NBFrw) | video |
| HI | [CSS Full Free Course (New Updated) — WsCube Tech](https://www.youtube.com/playlist?list=PLjVLYmrlmjGcotVRgbduK05oOMnt-9r8H) | playlist |
| EN | [MDN — CSS cascade and specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity) | docs |

**Exercises**

- Style `profile.html` completely. Use CSS custom properties for every colour — no hard-coded hex outside `:root`.
- Deliberately create a specificity conflict, then resolve it without using `!important`. Write down what you learned.
- Rebuild one real site's hero section (pick any Indian SaaS homepage) from a screenshot.

**Deliverable:** A styled profile page using CSS variables and no `!important`.

### 04. Responsive Layout — Flexbox & Grid

`Core` · **18 hours**

**Goal:** Build layouts that hold up from 360px to 1920px without magic numbers.

**Topics**

- Mobile-first thinking
- Flexbox: axes, justify-content, align-items, flex-grow/shrink/basis, wrap
- Grid: template columns/rows, gap, areas, auto-fit/minmax
- When to reach for Flexbox vs Grid
- Media queries and sensible breakpoints
- Responsive images and fluid typography
- Optional: Tailwind CSS as a faster path to the same result

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [Fully Responsive Website Project using HTML & CSS — CodeWithHarry (Hindi)](https://www.youtube.com/watch?v=8KVrdL0VcAk) | video |
| HI | [Tailwind CSS Course in Hindi — CodeWithHarry](https://www.youtube.com/playlist?list=PLCZo59YnSsMb18_B5j5UDl9PqWxJPoBBv) | playlist |
| EN | [MDN — CSS Flexbox guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox) | docs |
| EN | [MDN — CSS Grid guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout) | docs |

**Exercises**

- Convert `profile.html` to a responsive 3-column → 1-column layout using Grid.
- Build a navbar that collapses to a hamburger menu at 768px (CSS only, no JS yet).
- Test every page at 360px, 768px and 1440px in DevTools device mode. Fix all horizontal scroll.

**Deliverable:** A responsive multi-section page with zero horizontal scroll at 360px.

### 05. JavaScript Essentials

`Core` · **45 hours**

**Goal:** Read, write and debug the JavaScript that a business website actually needs.

**Topics**

- let/const, types, template literals
- Functions, arrow functions, scope
- Arrays and objects; map/filter/find/reduce
- Conditionals, loops, truthiness
- DOM: querySelector, classList, textContent, createElement
- Events: click, submit, input, delegation, preventDefault
- Form validation in JS
- Async: callbacks → promises → async/await
- fetch(), JSON.parse/stringify, error handling
- localStorage
- Debugging: console, breakpoints, reading stack traces

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [Chai aur Javascript | हिन्दी — Hitesh Choudhary](https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37) | playlist |
| EN | [Source code for the Chai aur JS Hindi series](https://github.com/hiteshchoudhary/js-hindi-youtube) | repo |
| HI | [Web Development Tutorials In Hindi (JS section) — CodeWithHarry](https://www.youtube.com/playlist?list=PLu0W_9lII9agiCUZYRsvtGTXdxkzPyItg) | playlist |
| EN | [MDN — JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) | docs |

**Exercises**

- Build a to-do list: add, delete, mark done, persist in localStorage.
- Build an image slideshow with prev/next and auto-advance.
- Wire `contact.html` to validate in JS and show inline error messages.
- Deliberately break three things, then fix each using only DevTools breakpoints.

**Deliverable:** A working to-do app that survives a page refresh.

### 06. Git & GitHub

`Core` · **21 hours**

**Goal:** Use version control the way a team does, not just `git push` on main.

**Topics**

- Why version control; repo, commit, staging area
- `git init/add/commit/status/log/diff`
- Branching and merging; resolving a real conflict
- Remotes: clone, push, pull, fetch
- Pull requests and review
- `.gitignore` and what must never be committed (keys, .env, node_modules)
- Undo: `git restore`, `git revert`, and why not to force-push shared branches
- GitHub Pages deployment

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [Complete Git and GitHub Course in Hindi — Chai aur Code](https://www.youtube.com/watch?v=q8EevlEpQ2A) | video |
| HI | [Git Tutorial for Beginners: Learn Git in One Video — CodeWithHarry](https://www.youtube.com/watch?v=AB3J8ufDYHQ) | video |
| HI | [Git & GitHub Tutorial For Beginners — हिंदी में (single video)](https://www.youtube.com/watch?v=gwWKnnCMQ5c) | video |
| EN | [GitHub Docs — Configuring a publishing source for GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) | docs |

**Exercises**

- Push everything from Modules 2–5 to `web-dev-practice` with meaningful commit messages.
- Create a `feature/dark-mode` branch, build the feature, open a PR against main, merge it.
- Force a merge conflict on purpose and resolve it by hand.
- Publish the repo on GitHub Pages and share the live URL.

**Deliverable:** A live GitHub Pages URL plus a repo with at least one merged PR.

### 07. AI Fundamentals

`Core` · **12 hours**

**Goal:** Understand what an LLM is doing well enough to predict when it will be wrong.

**Topics**

- What an LLM is; tokens and the context window
- Why hallucinations happen — and why they look confident
- Training cutoffs: why a model may not know current library versions
- Cost and rate limits in practice
- Data privacy: what you must never paste into a chat window
- The landscape: Claude, ChatGPT, Gemini, Copilot — rough strengths
- The non-negotiable rule: verify generated code before you ship it

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [Generative AI Tutorial (Hindi) — playlist](https://www.youtube.com/playlist?list=PLSwH4ViBDl2TmkWPtnB6UAzBKD-_QTtoK) | playlist |
| HI | [Introduction to LLM & Generative AI Course in Hindi](https://www.youtube.com/watch?v=cIJGCbLPYP8) | video |
| HI | [Generative AI Full Course Hindi 2026](https://www.youtube.com/watch?v=M3VzG_57QoY) | video |

**Exercises**

- Ask any chatbot for a factual claim you can verify. Verify it. Record whether it was right.
- Get a model to contradict itself across two turns; save the transcript.
- Write your own one-page list of what you will never paste into an AI tool (client data, keys, credentials).

**Deliverable:** A written 'AI usage rules' page for yourself.

### 08. Prompt Engineering

`Core` · **15 hours**

**Goal:** Turn a vague business request into a prompt that returns usable code.

**Topics**

- Structure: Role → Context → Task → Constraints → Examples → Acceptance criteria
- Why 'make me a website' fails and what to write instead
- Giving the model the actual file, not a description of it
- Few-shot examples
- Asking for a plan before asking for code
- Iterating: how to correct a wrong answer instead of restarting
- Asking the model to critique its own output

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [Prompt Engineering Full Course in Hindi (beginner to master)](https://www.youtube.com/playlist?list=PLyz4Eb45WBQ02Md7BiIO1sUsKTs8GcWKS) | playlist |
| HI | [Master Prompt Engineering With ChatGPT — Full Course In Hindi](https://www.youtube.com/watch?v=GGYXv5FtMwY) | video |
| HI | [Generative AI and Prompt Engineering Full Course in Hindi](https://www.youtube.com/watch?v=mkiKUPqcFEs) | video |
| EN | [Anthropic — Prompt engineering overview (official)](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview) | docs |

**Exercises**

- Take the prompt 'make a website for a dentist'. Rewrite it with all six structural parts. Compare both outputs side by side.
- Build a reusable prompt template for 'generate a responsive component' and use it three times.
- Give a model broken code and get a fix in one turn by supplying the error text, the file, and the expected behaviour.

**Deliverable:** A personal prompt-template file with at least 5 templates you actually use.

### 09. ChatGPT for Web Development

`Core` · **15 hours**

**Goal:** Use a chat assistant across the whole development cycle, not just for snippets.

**Topics**

- Requirements: turning a client brief into a feature list and sitemap
- UI ideation: layout options, colour systems, copy drafts
- Code generation for components — and reviewing what comes back
- Debugging: how to present an error so the answer is useful
- Code review: asking for a critique of your own code
- Generating meta tags, alt text, and README content
- Where it reliably fails: current library versions, your private codebase, exact pixel design

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [ChatGPT MasterClass — Prompt Engineering Course in Hindi](https://www.youtube.com/watch?v=fdXB89WwtU0) | video |
| EN | [OpenAI — Prompt engineering guide (official)](https://platform.openai.com/docs/guides/prompt-engineering) | docs |

**Exercises**

- Take a one-paragraph client brief. Use AI to produce a sitemap and feature list. Edit it by hand — note every change you made and why.
- Generate a pricing-table component. Find at least two things wrong with it before using it.
- Paste your to-do app from Module 5 and ask for a code review. Implement only the suggestions you agree with.

**Deliverable:** A before/after code review log showing which AI suggestions you rejected and why.

### 10. Claude for Development

`Core` · **15 hours**

**Goal:** Use Claude's long-context chat for multi-file, multi-step planning work.

**Topics**

- Claude web/desktop: Projects and persistent context
- Uploading files and giving real project context
- Long-context work: reviewing a whole codebase in one conversation
- Artifacts for previewing generated pages
- Practical differences vs ChatGPT for coding work
- Choosing a model: reasoning-heavy vs fast/cheap

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [Claude AI Full Course in Hindi — playlist](https://www.youtube.com/playlist?list=PLXwTOG3-tRwiclBE5xAmqo3lhSy6S-7D0) | playlist |
| HI | [Claude AI Full Course in Hindi — How to Use Claude AI](https://www.youtube.com/watch?v=vnVLl04VM8o) | video |
| EN | [Anthropic — Claude Docs (official)](https://docs.claude.com/en/home) | docs |

**Exercises**

- Create a Claude Project for your capstone site; upload your brief and existing files.
- Ask for a full sitemap + page-by-page content plan for a 6-page business site.
- Upload your Module 5 JS and ask for a refactor. Diff it against the original before accepting anything.

**Deliverable:** A Claude Project containing your capstone brief and a generated build plan.

### 11. Claude Code (CLI agent)

`Core` · **21 hours**

**Goal:** Drive an agentic coding tool that edits real files in a real repo — safely.

> ⚠️ **Correction from the source research:** The source research document listed commands (`claude plan`, `claude write`, `claude fix`, `claude test`, `claude doc`) that do not exist. The commands below are the real CLI surface — verify against the official docs, which are linked first.

**Topics**

- Install and authenticate: `npm install -g @anthropic-ai/claude-code`, then `claude`
- Real CLI commands: `claude` (interactive), `claude -p "..."` (print/headless), `claude update`, `claude doctor`, `claude mcp`, `claude config`
- In-session slash commands: `/init`, `/review`, `/clear`, `/compact`, `/model`, `/help`
- Plan mode (Shift+Tab) — get a plan before any file is touched
- CLAUDE.md: giving the agent persistent project context
- Permission modes: what the agent may edit or run without asking
- Git safety: always work on a branch; read every diff before committing
- When the agent is wrong and you must take over

**Resources**

| Lang | Resource | Type |
|---|---|---|
| EN | [Claude Code — official documentation (authoritative)](https://docs.claude.com/en/docs/claude-code/overview) | docs |
| EN | [Claude Code CLI reference (official)](https://docs.claude.com/en/docs/claude-code/cli-reference) | docs |
| HI | [Claude Code Complete Course in Hindi 2026 (40+ concepts, ~5 hrs)](https://www.youtube.com/watch?v=TIKReAs7yGE) | video |
| HI | [Claude Code Tutorial in Hindi — Beginner to Pro, Day 1](https://www.youtube.com/watch?v=FyS3pt2kiK4) | video |
| HI | [Claude Code Tutorial in Hindi — Day 2](https://www.youtube.com/watch?v=jX0h8ppKLZs) | video |
| HI | [Claude Code Installation + first build, in Hindi](https://www.youtube.com/watch?v=-EG6cfS6rYY) | video |

**Exercises**

- Install Claude Code, run `claude doctor`, and paste the output into your notes.
- Run `/init` in `web-dev-practice` to generate a CLAUDE.md. Edit it by hand to describe your project properly.
- On a new branch, use plan mode to add a dark-mode toggle. Read the full diff before committing.
- Find one thing the agent got wrong or over-engineered, and fix it yourself. Write up what happened.

**Deliverable:** A merged PR authored with Claude Code, plus a written note on one thing it got wrong.

### 12. AI-Driven Build Workflow (Capstone 1)

`Core` · **30 hours**

**Goal:** Run one complete brief-to-deployed-site cycle using the whole toolkit.

**Topics**

- Reading a client brief and extracting real requirements
- Planning with AI, then editing the plan with human judgement
- Scaffold → style → add behaviour → test → deploy
- Keeping commits small so a bad AI change is easy to revert
- Manual testing checklist for every AI-generated block
- Writing handover documentation

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [Chai aur Javascript | हिन्दी (reference while building)](https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37) | playlist |
| EN | [Claude Code — common workflows (official)](https://docs.claude.com/en/docs/claude-code/common-workflows) | docs |

**Exercises**

- Take the supplied brief (a Pune-based coaching institute, 5 pages, enquiry form).
- Produce a plan, build it AI-assisted, and deploy to GitHub Pages.
- Log every AI suggestion you rejected. A log with zero rejections means you were not reviewing.

**Deliverable:** A live 5-page site + a rejection log.

### 13. APIs & Data

`Core` · **15 hours**

**Goal:** Pull live data into a page and handle the ways it fails.

**Topics**

- REST basics: endpoints, GET/POST, headers, status codes
- JSON structure and parsing
- fetch() with async/await; loading and error states
- API keys: why they can never be safe in front-end-only code
- `.env` files, `.gitignore`, and what a static host can and cannot hide
- Mock APIs for practice (JSONPlaceholder, json-server)
- CORS — what the error means and why it is not your code's fault

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [Fetch API | JavaScript Tutorial in Hindi #66 — CodeWithHarry](https://www.youtube.com/watch?v=Atq7VjVbaA8) | video |
| HI | [Sending POST request with Fetch API — Hindi #67](https://www.youtube.com/watch?v=57SrCBCxdgc) | video |
| HI | [JSON server tutorial in Hindi — make a fake REST API](https://www.youtube.com/watch?v=u7dPGuGB0Kc) | video |
| EN | [MDN — Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) | docs |

**Exercises**

- Fetch and render posts from JSONPlaceholder with a loading spinner and an error message.
- Break it on purpose: kill your network mid-request and make sure the UI degrades gracefully.
- Write a short note explaining why putting a paid API key in a GitHub Pages site would leak it.

**Deliverable:** A data-driven page with working loading and error states.

### 14. WordPress for Business Sites

`Elective` · **15 hours**

**Goal:** Deliver a CMS site fast when the client needs to edit content themselves.

**Topics**

- When WordPress beats hand-coding — and when it does not
- Install, themes, Gutenberg blocks
- Elementor for page building
- Essential plugins: SEO, forms, caching, backup
- Security: updates, weak plugins, login hardening
- Backups and migration

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [WordPress Full Course in Hindi — playlist](https://www.youtube.com/playlist?list=PLhNkyjXGHmD_SMdv7sR3BNCLZZATfBfNW) | playlist |
| HI | [Elementor Tutorial for Beginners in Hindi — playlist](https://www.youtube.com/playlist?list=PLSoJJghaAk8X5p8oo6RkcmvXs4xPcqsgY) | playlist |
| HI | [WordPress Tutorial in Hindi — playlist](https://www.youtube.com/playlist?list=PLXwTOG3-tRwhVJ2blXiMUxS5KmNZTqrkG) | playlist |

**Exercises**

- Build a 4-page business site locally with Elementor.
- Install an SEO plugin and a backup plugin; take and restore one backup.
- Write a one-page handover doc a non-technical client could follow.

**Deliverable:** A local WordPress site plus a client handover document.

### 15. Modern Front-End (React / Next.js)

`Elective` · **40 hours**

**Goal:** Read and modify a React codebase. Only take this if the target role requires it.

**Topics**

- Why components; JSX
- Props and state; `useState`, `useEffect`
- Lists, keys, conditional rendering
- Fetching data in a component
- Next.js: file routing, static vs server rendering
- Build and deploy to Vercel
- Honest guidance on when vanilla JS is the better answer

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [Chai aur React | with projects — Hindi](https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige) | playlist |
| HI | [React JS Tutorials in Hindi — CodeWithHarry](https://www.youtube.com/playlist?list=PLu0W_9lII9agx66oZnT6IyhcMIbUMNMdt) | playlist |
| EN | [React — official docs (Learn)](https://react.dev/learn) | docs |
| EN | [Next.js — official docs](https://nextjs.org/docs) | docs |

**Exercises**

- Rebuild the Module 5 to-do app in React.
- Build a 3-page Next.js site with file-based routing and deploy it to Vercel.
- Write 200 words on when you would NOT use React for a client site.

**Deliverable:** A deployed Next.js site.

### 16. Deployment & Domains

`Core` · **15 hours**

**Goal:** Put a site on the public internet on a real domain, with HTTPS.

**Topics**

- GitHub Pages: publishing source, branch vs /docs, `.nojekyll`
- Custom domains: CNAME file, DNS records at the registrar, HTTPS enforcement
- Netlify / Vercel for builds and previews
- Build output vs source; what actually gets served
- Lighthouse audit and reading the results
- Rollback: how to undo a bad deploy

**Resources**

| Lang | Resource | Type |
|---|---|---|
| EN | [GitHub Docs — Configuring a custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages) | docs |
| HI | [Domain ko hosting se connect karna — DNS records in Hindi](https://www.youtube.com/watch?v=X0TQbHKiZCc) | video |
| EN | [Netlify Docs — deploy overview](https://docs.netlify.com/deploy/create-deploys/) | docs |

**Exercises**

- Deploy the Module 12 capstone to GitHub Pages and confirm HTTPS is enforced.
- Run Lighthouse; record Performance / Accessibility / SEO scores before and after fixes.
- Deploy the same site to Netlify and compare the workflow.

**Deliverable:** A live HTTPS site plus before/after Lighthouse screenshots.

### 17. Technical SEO & Performance

`Core` · **12 hours**

**Goal:** Ship a site that search engines can read and users do not abandon.

**Topics**

- Title tags, meta descriptions, heading hierarchy
- Canonical URLs, robots.txt, sitemap.xml
- Open Graph and Twitter cards
- Structured data basics (LocalBusiness)
- Core Web Vitals: LCP, INP, CLS
- Image optimisation, lazy loading, font loading
- Accessibility basics: alt text, contrast, focus states, keyboard navigation

**Resources**

| Lang | Resource | Type |
|---|---|---|
| HI | [SEO Complete Course in Hindi — playlist](https://www.youtube.com/playlist?list=PLXwTOG3-tRwjmg2Z2ZzW3Ajui1cgQBOMm) | playlist |
| HI | [SEO Tutorials for Beginners — step by step in Hindi (WsCube)](https://www.youtube.com/playlist?list=PLjVLYmrlmjGe7LcdgTeT70Gi-4CWaSc3A) | playlist |
| EN | [Google — Core Web Vitals](https://web.dev/articles/vitals) | docs |
| EN | [Google — SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) | docs |

**Exercises**

- Add complete meta, Open Graph and canonical tags to the capstone site.
- Generate robots.txt and sitemap.xml.
- Get Lighthouse SEO and Accessibility both above 90.
- Navigate your entire site using only the keyboard. Fix whatever you cannot reach.

**Deliverable:** Lighthouse SEO ≥ 90 and Accessibility ≥ 90 on the capstone.

### 18. Web Security Basics

`Core` · **12 hours**

**Goal:** Avoid the handful of mistakes that actually get small sites compromised.

**Topics**

- HTTPS everywhere and why
- XSS: what it is, and why you never inject user input with innerHTML
- Injection attacks in general terms
- Secrets: never in the repo, never in front-end code
- What to do when you commit a key by accident (rotate it — deleting the commit is not enough)
- Dependency risk and `npm audit`
- Authentication concepts: sessions vs tokens (awareness level)
- Backups and updates as a security control

**Resources**

| Lang | Resource | Type |
|---|---|---|
| EN | [OWASP Top 10 — official](https://owasp.org/www-project-top-ten/) | docs |
| EN | [MDN — Website security](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Website_security) | docs |
| EN | [Cloudflare Learning — What is HTTPS?](https://www.cloudflare.com/learning/ssl/what-is-https/) | docs |

**Exercises**

- Write a script that renders user input with `innerHTML`, demonstrate an XSS payload on your own local page, then fix it with `textContent`.
- Audit every repo you have made in this course for committed secrets.
- Write your personal incident checklist for 'I pushed an API key to GitHub'.

**Deliverable:** A written XSS demo + fix, and a clean secrets audit.

### 19. Real-World Client Project (Capstone 2)

`Core` · **40 hours**

**Goal:** Deliver a complete site against a brief you did not write, to a deadline.

**Topics**

- Requirement gathering and scoping
- Estimating and planning
- Building with the full AI-assisted workflow
- Cross-browser and cross-device testing
- Client handover: documentation, credentials, maintenance plan
- Presenting and defending your technical decisions

**Resources**

| Lang | Resource | Type |
|---|---|---|
| EN | [Claude Code — common workflows (official)](https://docs.claude.com/en/docs/claude-code/common-workflows) | docs |
| EN | [GitHub Docs — About README files](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) | docs |

**Exercises**

- Receive the brief from the trainer. Ask clarifying questions before writing any code.
- Deliver: live site, repo, README, and a maintenance guide.
- Present for 15 minutes: what you built, what AI did, what you overrode.

**Deliverable:** A portfolio-grade live site with full documentation.

### 20. Final Assessment

`Core` · **15 hours**

**Goal:** Prove the skills independently, under time pressure.

**Topics**

- Practical exam: build a small spec'd site in 6 hours
- Written exam: DNS, HTTP, Git, CSS specificity, JS async, AI limitations, security
- Portfolio review of both capstones
- Oral defence of technical decisions

**Exercises**

- Practical: a 3-page responsive site from a spec, deployed live, within 6 hours.
- Written: 40 questions across all core modules.
- Defence: explain any five decisions in your capstone.

**Deliverable:** Pass mark: practical complete and deployed, written ≥ 70%, both capstones live.
