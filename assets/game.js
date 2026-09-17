// Levels, XP and badges — Duolingo-style progression computed entirely from real
// progress. Nothing here is cosmetic state: every number is derived from which
// modules are ticked and which videos are watched, so it can never disagree with
// the learning path.

export const XP_PER_HOUR = 10;
export const XP_PER_VIDEO = 20;

export const LEVELS = [
  { n: 1, at: 0,    name: 'Newcomer' },
  { n: 2, at: 300,  name: 'Page Builder' },
  { n: 3, at: 700,  name: 'Stylist' },
  { n: 4, at: 1200, name: 'Scripter' },
  { n: 5, at: 1800, name: 'Version Controller' },
  { n: 6, at: 2500, name: 'AI Operator' },
  { n: 7, at: 3300, name: 'Shipper' },
  { n: 8, at: 4200, name: 'Web Developer' }
];

// Badges are declarative: each has a test against {mods, vids, hours, pct, DATA}.
export const BADGES = [
  { id: 'first',      name: 'First Steps',       icon: 'check',     hint: 'Finish Orientation & Setup',            test: c => c.mods[0] },
  { id: 'howweb',     name: 'Under the Hood',    icon: 'book',      hint: 'Finish How Websites Actually Work',     test: c => c.mods[1] },
  { id: 'html',       name: 'Page Builder',      icon: 'layers',    hint: 'Finish HTML Foundations',               test: c => c.mods[2] },
  { id: 'css',        name: 'Stylist',           icon: 'dashboard', hint: 'Finish CSS Fundamentals',               test: c => c.mods[3] },
  { id: 'responsive', name: 'Fits Any Screen',   icon: 'dashboard', hint: 'Finish Responsive Layout',              test: c => c.mods[4] },
  { id: 'js',         name: 'Scripter',          icon: 'play',      hint: 'Finish JavaScript Essentials',          test: c => c.mods[5] },
  { id: 'git',        name: 'Version Controlled',icon: 'refresh',   hint: 'Finish Git & GitHub',                   test: c => c.mods[6] },
  { id: 'prompt',     name: 'Prompt Smith',      icon: 'award',     hint: 'Finish Prompt Engineering',             test: c => c.mods[8] },
  { id: 'agent',      name: 'Agent Operator',    icon: 'users',     hint: 'Finish Claude Code',                    test: c => c.mods[11] },
  { id: 'api',        name: 'Data Wrangler',     icon: 'download',  hint: 'Finish APIs & Data',                    test: c => c.mods[13] },
  { id: 'deploy',     name: 'Shipped It',        icon: 'external',  hint: 'Finish Deployment & Domains',           test: c => c.mods[16] },
  { id: 'secure',     name: 'Locked Down',       icon: 'lock',      hint: 'Finish Web Security Basics',            test: c => c.mods[18] },
  { id: 'watch10',    name: 'Tuned In',          icon: 'play',      hint: 'Watch 10 video lessons',                test: c => c.vids >= 10 },
  { id: 'watch25',    name: 'Binge Learner',     icon: 'play',      hint: 'Watch 25 video lessons',                test: c => c.vids >= 25 },
  { id: 'watchAll',   name: 'Seen It All',       icon: 'award',     hint: 'Watch every video lesson',              test: c => c.videoCount > 0 && c.vids >= c.videoCount },
  { id: 'half',       name: 'Halfway There',     icon: 'progress',  hint: 'Reach 50% of the core track',           test: c => c.pct >= 50 },
  { id: 'elective',   name: 'Going Further',     icon: 'layers',    hint: 'Finish any elective module',            test: c => c.electivesDone >= 1 },
  { id: 'certified',  name: 'Certified',         icon: 'award',     hint: 'Complete every core module',            test: c => c.complete }
];

export function xpFor(DATA, state) {
  const hours = DATA.modules
    .filter(m => state.modules[m.id])
    .reduce((a, m) => a + m.hours, 0);
  return hours * XP_PER_HOUR + Object.keys(state.videos).length * XP_PER_VIDEO;
}

export function levelFor(xp) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.at) cur = l;
  const next = LEVELS.find(l => l.at > xp) || null;
  const span = next ? next.at - cur.at : 1;
  const into = next ? xp - cur.at : 1;
  return {
    ...cur,
    next,
    xpIntoLevel: into,
    xpForNext: next ? next.at - xp : 0,
    pctToNext: next ? Math.min(100, Math.round(into / span * 100)) : 100,
    isMax: !next
  };
}

export function badgesFor(ctx) {
  return BADGES.map(b => ({ ...b, earned: !!b.test(ctx) }));
}
