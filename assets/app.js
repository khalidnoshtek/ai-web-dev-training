import { FIREBASE_CONFIG, isConfigured } from './firebase-config.js';
import { isAdmin } from './admins.js';
import { confetti } from './celebrate.js';
import { icon, hydrateIcons } from './icons.js';
import { xpFor, levelFor, badgesFor } from './game.js';
import { startQuiz } from './quiz.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';
const LOCAL_KEY = 'aiwd.progress.v2';
const LEGACY_KEY = 'aiwd.progress.v1';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let DATA = null;
let filter = 'all';
let state = { modules: {}, videos: {}, quizzes: {}, certifiedAt: null };
let QUIZ = null;   // { meta, quizzes }
let cloud = null;
let saveTimer = null;

/* --------------------------------------------------------------- storage */

function readLocal() {
  try {
    const v2 = JSON.parse(localStorage.getItem(LOCAL_KEY));
    if (v2 && v2.modules) return { modules: v2.modules || {}, videos: v2.videos || {},
                                   quizzes: v2.quizzes || {}, certifiedAt: v2.certifiedAt || null };
    const v1 = JSON.parse(localStorage.getItem(LEGACY_KEY));
    if (v1) return { modules: v1, videos: {}, quizzes: {}, certifiedAt: null };
  } catch {}
  return { modules: {}, videos: {}, quizzes: {}, certifiedAt: null };
}
const writeLocal = () => { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)); } catch {} };
const merge = (a, b) => ({
  modules: { ...(a.modules || {}), ...(b.modules || {}) },
  videos: { ...(a.videos || {}), ...(b.videos || {}) },
  // Per module, the higher score wins when merging devices.
  quizzes: mergeQuizzes(a.quizzes, b.quizzes),
  // Keep the EARLIEST certification date across devices — the day they finished.
  certifiedAt: [a.certifiedAt, b.certifiedAt].filter(Boolean).sort()[0] || null
});

function mergeQuizzes(a = {}, b = {}) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    const prev = out[k];
    out[k] = !prev ? v : {
      best: Math.max(prev.best || 0, v.best || 0),
      attempts: (prev.attempts || 0) + (v.attempts || 0),
      passed: !!(prev.passed || v.passed),
      lastAt: [prev.lastAt, v.lastAt].filter(Boolean).sort().pop() || ''
    };
  }
  return out;
}

function setSync(kind, detail = '') {
  const el = $('#sync');
  const map = { local: 'Local mode', saving: 'Saving…', saved: 'Saved', error: 'Save failed' };
  el.textContent = map[kind] || '';
  el.title = detail;
  el.dataset.kind = kind;
}

function persist() {
  writeLocal();
  if (!cloud) return;
  setSync('saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await cloud.setDoc(cloud.doc(cloud.db, 'progress', cloud.uid), {
        modules: state.modules, videos: state.videos, quizzes: state.quizzes,
        certifiedAt: state.certifiedAt || '',
        email: cloud.email || '', displayName: cloud.displayName || '',
        photoURL: cloud.photoURL || '', updatedAt: new Date().toISOString()
      }, { merge: true });
      setSync('saved');
    } catch (err) {
      console.error('Cloud save failed:', err);
      setSync('error', err.message);
    }
  }, 600);
}

/* ----------------------------------------------------------------- totals */

function totals() {
  const mods = DATA.modules;
  const core = mods.filter(m => m.track === 'core');
  const coreHours = core.reduce((a, m) => a + m.hours, 0);
  const doneCore = core.filter(m => state.modules[m.id]);
  const videoCount = mods.reduce((a, m) => a + m.resources.filter(r => r.embed).length, 0);
  const hours = doneCore.reduce((a, m) => a + m.hours, 0);
  return {
    mods, core, coreHours, coreCount: core.length,
    doneCount: doneCore.length, hours,
    pct: coreHours ? Math.round(hours / coreHours * 100) : 0,
    electiveHours: mods.filter(m => m.track === 'elective').reduce((a, m) => a + m.hours, 0),
    videoCount, videosSeen: Object.keys(state.videos).length,
    perWeek: DATA.meta.hoursPerWeekDefault,
    complete: core.length > 0 && doneCore.length === core.length
  };
}

const nextModule = () => DATA.modules.find(m => m.track === 'core' && !state.modules[m.id]);

/* ------------------------------------------------------------------ video */

const embedSrc = (e, auto) => e.kind === 'playlist'
  ? `https://www.youtube-nocookie.com/embed/videoseries?list=${e.id}&rel=0${auto ? '&autoplay=1' : ''}`
  : `https://www.youtube-nocookie.com/embed/${e.id}?rel=0&modestbranding=1${auto ? '&autoplay=1' : ''}`;

function videoHTML(r) {
  const e = r.embed;
  const seen = !!state.videos[e.id];
  const thumb = e.kind === 'video'
    ? `<img class="thumb" loading="lazy" alt="" src="https://i.ytimg.com/vi/${e.id}/hqdefault.jpg">`
    : `<div class="thumb thumb-list" aria-hidden="true"><span>Playlist</span></div>`;
  return `<div class="vid ${seen ? 'watched' : ''}" data-vid="${esc(e.id)}">
    <div class="vid-frame" data-src="${esc(embedSrc(e, true))}">${thumb}
      <button class="play" aria-label="Play ${esc(r.title)}">${icon('play', 18)}</button></div>
    <div class="vid-meta"><span class="lang hi">HI</span><b>${esc(r.title)}</b>
      <button class="seen" aria-pressed="${seen}">${seen ? 'Watched' : 'Mark watched'}</button></div>
  </div>`;
}

/* Turns a full topic line into a short chip label: take the first clause, then
   trim on a word boundary rather than mid-word. */
function shortTag(topic) {
  let t = String(topic).split(/[:\u2014(]/)[0].trim();
  if (t.length > 20) {
    const head = t.split(',')[0].trim();
    t = head.length >= 6 && head.length <= 22 ? head : t;
  }
  if (t.length > 22) {
    const cut = t.slice(0, 22);
    const sp = cut.lastIndexOf(' ');
    t = (sp > 8 ? cut.slice(0, sp) : cut).replace(/[,;.\s]+$/, '') + '…';
  }
  return t.replace(/[,;]+$/, '');
}

/* ------------------------------------------------------------ module card */

function moduleHTML(m, i) {
  const done = !!state.modules[m.id];
  const nxt = nextModule();
  const isNow = !done && nxt && nxt.id === m.id;
  const vids = m.resources.filter(r => r.embed);
  const docs = m.resources.filter(r => !r.embed);
  const status = done ? '<span class="pill done">Complete</span>'
    : isNow ? '<span class="pill now">Up next</span>'
    : m.track === 'elective' ? '<span class="pill el">Elective</span>' : '';

  return `<div class="node ${done ? 'done' : ''} ${isNow ? 'now' : ''}" data-id="${m.id}">
    <div class="dot">${done ? icon('check', 18) : m.id}</div>
    <div class="card">
      <div class="m-top">
        <h3>${esc(m.title)}</h3>
        ${status}
        <div class="m-pct">${m.hours}h<small>${vids.length} video${vids.length === 1 ? '' : 's'}</small></div>
      </div>
      <p class="m-goal">${esc(m.goal)}</p>
      <div class="track ${done ? 'ok' : ''}"><i style="width:${done ? 100 : 0}%"></i></div>
      <div class="tags">
        ${m.topics.slice(0, 3).map(t => `<span class="tagm">${esc(shortTag(t))}</span>`).join('')}
        ${quizFor(m.id) ? `<span class="tagm">Quiz ${quizFor(m.id).length}Q</span>` : ''}
      </div>

      <div class="detail">
        ${m.warning ? `<div class="callout warn" style="margin-bottom:6px"><b>Correction from the source research:</b> ${esc(m.warning)}</div>` : ''}
        <h4>Topics</h4><ul>${m.topics.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        ${vids.length ? `<h4>Watch here &mdash; Hindi</h4><div class="vids">${vids.map(videoHTML).join('')}</div>` : ''}
        ${docs.length ? `<h4>Reference docs (open externally)</h4><ul class="docs">${docs.map(r => `
          <li><span class="lang ${r.lang}">${r.lang.toUpperCase()}</span>
          <a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a>
          <span class="ext">&#8599;</span></li>`).join('')}</ul>` : ''}
        <h4>Exercises</h4><ul>${m.exercises.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
        ${m.deliverable ? `<h4>Deliverable</h4><div class="callout ok">${esc(m.deliverable)}</div>` : ''}
        <div style="margin-top:16px;display:flex;gap:9px;flex-wrap:wrap">
          ${quizFor(m.id) ? `<button class="btn ${done ? '' : 'primary'} takequiz">
              ${scoreOf(m.id) ? `Retake quiz — best ${scoreOf(m.id).best}%` : `Take quiz (${quizFor(m.id).length} questions)`}
            </button>` : ''}
          <button class="btn tick">${done ? 'Completed — undo' : 'Mark complete manually'}</button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ----------------------------------------------------------------- render */

function renderPath() {
  const list = DATA.modules.filter(m =>
    filter === 'all' ? true :
    filter === 'todo' ? !state.modules[m.id] : m.track === filter);
  const open = new Set($$('.node.open').map(e => e.dataset.id));
  $('#path').innerHTML = list.map(moduleHTML).join('') ||
    '<p class="muted">Nothing matches this filter.</p>';
  open.forEach(id => $(`.node[data-id="${id}"]`)?.classList.add('open'));
  $('#mod-title').textContent = `${DATA.modules.length} modules · IT admin to AI web developer`;
}

function statCard(k, val, of, sub, colour) {
  return `<div class="card stat"><div class="k">${esc(k)}<i style="background:${colour}"></i></div>
    <b>${val}${of ? `<span class="of"> / ${of}</span>` : ''}</b><small>${esc(sub)}</small></div>`;
}

function renderDash() {
  const t = totals();
  const name = cloud?.displayName?.split(' ')[0] || 'learner';
  $('#dash-hi').textContent = `Welcome back, ${name}`;
  $('#dash-eyebrow').textContent = `${t.doneCount} of ${t.coreCount} core modules · apprenticeship track`;

  const nxt = nextModule();
  $('#dash-sub').innerHTML = nxt
    ? `Next up is <b>${esc(nxt.title)}</b> — ${esc(nxt.goal)}`
    : 'Every core module is complete. Move on to the final assessment.';

  $('#dash-cta').innerHTML = nxt
    ? `<button class="btn primary" id="go-next">Continue learning &rarr;</button>`
    : '';

  $('#dash-stats').innerHTML = [
    statCard('Core progress', t.pct + '%', '', `${t.doneCount} of ${t.coreCount} modules`, 'var(--primary)'),
    statCard('Hours logged', t.hours, t.coreHours, 'core curriculum hours', 'var(--success)'),
    statCard('Videos watched', t.videosSeen, t.videoCount, 'Hindi lessons, played in-page', 'var(--ai)'),
    statCard('Remaining', Math.max(0, t.coreHours - t.hours), '', `≈ ${Math.ceil((t.coreHours - t.hours) / t.perWeek)} weeks at ${t.perWeek} hrs/week`, 'var(--warn)')
  ].join('');

  $('#dash-next').innerHTML = nxt
    ? `<div class="path">${moduleHTML(nxt)}</div>`
    : '<div class="card"><p class="muted" style="margin:0">Nothing left in the core track.</p></div>';
}

function renderProgress() {
  const t = totals();
  $('#prog-stats').innerHTML = [
    statCard('Core modules', t.doneCount, t.coreCount, 'required for certification', 'var(--primary)'),
    statCard('Core hours', t.hours, t.coreHours, `${t.electiveHours} more in electives`, 'var(--success)'),
    statCard('Videos', t.videosSeen, t.videoCount, 'Hindi video lessons', 'var(--ai)'),
    statCard('Completion', t.pct + '%', '', 'of the core track', 'var(--warn)')
  ].join('');

  $('#prog-core i').style.width = t.pct + '%';
  $('#prog-core-txt').textContent =
    `${t.hours} of ${t.coreHours} core hours complete. Electives add ${t.electiveHours} hours on top.`;
  const vp = t.videoCount ? Math.round(t.videosSeen / t.videoCount * 100) : 0;
  $('#prog-vid i').style.width = vp + '%';
  $('#prog-vid-txt').textContent = `${t.videosSeen} of ${t.videoCount} Hindi video lessons marked watched.`;

  $('#prog-time').innerHTML =
    `The core track is <b>${t.coreHours} hours</b> — roughly <b>${Math.round(t.coreHours / t.perWeek)} weeks</b> at
     ${t.perWeek} hrs/week, or ${Math.round(t.coreHours / 20)} weeks at 20 hrs/week. The two electives add
     ${t.electiveHours} hours. Treat &ldquo;3–4 months&rdquo; as achievable only at 20+ hrs/week with both electives skipped.`;

  $('#fixes').innerHTML = DATA.corrections.map(c => `
    <div class="card" style="border-left:3px solid var(--warn);margin-bottom:9px">
      <span class="pill" style="float:right">${esc(c.severity)}</span>
      <h3 style="margin-bottom:4px">${esc(c.issue)}</h3>
      <p class="muted" style="margin:0;font-size:.87rem">${esc(c.detail)}</p></div>`).join('');
}



/* ----------------------------------------------------------------- quiz */

const quizFor = id => (QUIZ && QUIZ.quizzes[String(id)]) || null;
const scoreOf = id => state.quizzes[String(id)] || null;
const passMark = () => (QUIZ && QUIZ.meta.passMark) || 70;

function openQuiz(moduleId) {
  const bank = quizFor(moduleId);
  if (!bank) return;
  const m = DATA.modules.find(x => x.id === Number(moduleId));
  showView('v-quiz');
  startQuiz($('#quiz-host'), {
    moduleId, title: m.title, questions: bank, passMark: passMark(),
    best: scoreOf(moduleId)?.best ?? null,
    onFinish: ({ score, passed }) => {
      const prev = scoreOf(moduleId) || { best: 0, attempts: 0, passed: false };
      state.quizzes[String(moduleId)] = {
        best: Math.max(prev.best || 0, score),
        attempts: (prev.attempts || 0) + 1,
        passed: prev.passed || passed,
        lastAt: new Date().toISOString()
      };
      // Passing the quiz completes the module; failing never un-completes it.
      const wasComplete = totals().complete;
      if (passed) state.modules[moduleId] = true;
      const justFinished = !wasComplete && totals().complete;
      if (justFinished && !state.certifiedAt) state.certifiedAt = new Date().toISOString();
      persist();
      renderDash(); renderPath(); renderProgress(); renderLevel(); renderBadges(); renderCert(); renderScorecard();
      if (justFinished) { confetti(); }
    },
    onExit: () => {
      showView('v-modules');
      const el = $(`.node[data-id="${moduleId}"]`);
      if (el) { el.classList.add('open'); el.scrollIntoView({ block: 'center' }); }
    }
  });
}

function renderScorecard() {
  if (!QUIZ) return;
  const rows = DATA.modules.filter(m => quizFor(m.id));
  const taken = rows.filter(m => scoreOf(m.id));
  const passed = rows.filter(m => scoreOf(m.id)?.passed);
  const avg = taken.length
    ? Math.round(taken.reduce((a, m) => a + scoreOf(m.id).best, 0) / taken.length) : 0;

  $('#score-lead').innerHTML =
    `<b>${passed.length} of ${rows.length}</b> quizzes passed &middot; average best score ` +
    `<b>${avg}%</b> &middot; pass mark ${passMark()}%. Passing a quiz marks that module complete.`;

  $('#scorecard').innerHTML = rows.map(m => {
    const sc = scoreOf(m.id);
    const cls = !sc ? 'untaken' : sc.passed ? 'passed' : 'attempted';
    return `<div class="score-row ${cls}" data-quiz="${m.id}">
      <span class="sn">${String(m.id).padStart(2, '0')}</span>
      <span class="st"><b>${esc(m.title)}</b>
        <span>${sc ? `${sc.attempts} attempt${sc.attempts === 1 ? '' : 's'} · ${quizFor(m.id).length} questions`
                   : `${quizFor(m.id).length} questions · not attempted`}</span></span>
      <span class="sv">${sc ? sc.best + '%' : 'Not taken'}</span>
      <button class="btn sgo" data-quiz-go="${m.id}">${sc ? 'Retake' : 'Start'}</button>
    </div>`;
  }).join('');
}

/* -------------------------------------------------------- level & badges */

function gameCtx() {
  const t = totals();
  const electivesDone = DATA.modules.filter(m => m.track === 'elective' && state.modules[m.id]).length;
  return { mods: state.modules, vids: t.videosSeen, videoCount: t.videoCount,
           pct: t.pct, complete: t.complete, electivesDone };
}

function renderLevel() {
  const xp = xpFor(DATA, state);
  const lv = levelFor(xp);
  $('#dash-level').innerHTML = `
    <div class="level">
      <div class="level-ring" style="--p:${lv.pctToNext}%"><b>${lv.n}</b></div>
      <div class="level-txt">
        <b>Level ${lv.n} — ${esc(lv.name)}</b>
        <span>${lv.isMax ? 'Top level reached' :
          `${lv.xpForNext} XP to Level ${lv.next.n} — ${esc(lv.next.name)}`}</span>
      </div>
      <div class="level-xp"><b>${xp.toLocaleString()}</b><span>XP</span></div>
    </div>`;
}

function renderBadges() {
  const list = badgesFor(gameCtx());
  const got = list.filter(b => b.earned).length;
  $('#badges').innerHTML = list.map(b => `
    <div class="badge ${b.earned ? 'earned' : 'locked'}" title="${esc(b.hint)}">
      <span class="bi">${icon(b.earned ? b.icon : 'lock', 20)}</span>
      <b>${esc(b.name)}</b>
      <small>${b.earned ? 'Earned' : esc(b.hint)}</small>
    </div>`).join('');
  const h = $('#badges').previousElementSibling;
  if (h && h.classList.contains('lead')) {
    h.innerHTML = `<b>${got} of ${list.length}</b> earned — awarded automatically from real progress, ` +
                  `there is no way to get one without doing the work.`;
  }
}

/* --------------------------------------------------------- certificate */

function certId() {
  const seed = (cloud?.uid || 'local') + (state.certifiedAt || '');
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return 'NA-' + h.toString(36).toUpperCase().padStart(7, '0').slice(0, 7);
}

function renderCert() {
  const t = totals();
  const done = t.complete;
  $('#cert-locked').hidden = done;
  $('#cert-wrap').hidden = !done;
  $('#cert-lead').textContent = done
    ? 'Issued by Noshtek Academy on completion of every core module.'
    : 'Complete all core modules to unlock your certificate.';

  if (!done) {
    $('#cert-locked-txt').textContent =
      `${t.doneCount} of ${t.coreCount} core modules complete — ${t.coreCount - t.doneCount} to go ` +
      `(${t.coreHours - t.hours} hours remaining).`;
    $('#cert-bar').style.width = t.pct + '%';
    return;
  }

  const when = state.certifiedAt ? new Date(state.certifiedAt) : new Date();
  $('#cert-name').textContent = cloud?.displayName || cloud?.email || 'Learner';
  $('#cert-detail').textContent =
    `${t.coreCount} core modules, ${t.coreHours} hours of study`;
  $('#cert-date').textContent = when.toLocaleDateString('en-IN',
    { day: 'numeric', month: 'long', year: 'numeric' });
  $('#cert-id').textContent = certId();
}

function renderAll() { renderDash(); renderPath(); renderProgress(); renderLevel(); renderBadges(); renderCert(); renderScorecard(); }

/* ------------------------------------------------------------------ views */

function showView(id) {
  $$('.view').forEach(v => { v.hidden = v.id !== id; });
  $$('.nav button[data-view]').forEach(b => b.setAttribute('aria-current', String(b.dataset.view === id)));
  scrollTo({ top: 0, behavior: 'smooth' });
}

/* ----------------------------------------------------------------- events */

document.addEventListener('click', e => {
  const play = e.target.closest('.play');
  if (play) {
    const f = play.closest('.vid-frame');
    f.innerHTML = `<iframe src="${f.dataset.src}" title="Course video" loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    return;
  }
  const seen = e.target.closest('.seen');
  if (seen) {
    e.stopPropagation();
    const card = seen.closest('.vid');
    const id = card.dataset.vid;
    if (state.videos[id]) delete state.videos[id]; else state.videos[id] = true;
    const on = !!state.videos[id];
    card.classList.toggle('watched', on);
    seen.setAttribute('aria-pressed', on);
    seen.innerHTML = on ? 'Watched' : 'Mark watched';
    persist(); renderDash(); renderProgress(); renderLevel(); renderBadges(); renderCert();
    return;
  }
  const tq = e.target.closest('.takequiz');
  if (tq) { e.stopPropagation(); openQuiz(tq.closest('.node').dataset.id); return; }

  const sgo = e.target.closest('[data-quiz-go]');
  if (sgo) { openQuiz(sgo.dataset.quizGo); return; }

  const tick = e.target.closest('.tick');
  if (tick) {
    e.stopPropagation();
    const id = tick.closest('.node').dataset.id;
    const wasComplete = totals().complete;
    if (state.modules[id]) delete state.modules[id]; else state.modules[id] = true;

    const nowComplete = totals().complete;
    const justFinished = nowComplete && !wasComplete;
    if (justFinished && !state.certifiedAt) state.certifiedAt = new Date().toISOString();

    persist(); renderAll();

    if (justFinished) {
      confetti();
      showView('v-cert');
    }
    return;
  }
  const go = e.target.closest('#go-next');
  if (go) { showView('v-modules'); const n = nextModule();
    if (n) { const el = $(`.node[data-id="${n.id}"]`); el?.classList.add('open'); el?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    return; }
  const card = e.target.closest('.node .card');
  if (card && !e.target.closest('a,iframe')) card.parentElement.classList.toggle('open');
});

$$('.nav button[data-view]').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
$('#cert-print').addEventListener('click', () => print());
$('#cert-again').addEventListener('click', () => confetti());
$('#nav-trainer').addEventListener('click', () => { location.href = 'trainer.html'; });

$$('#filters .pill').forEach(c => c.addEventListener('click', () => {
  filter = c.dataset.filter;
  $$('#filters .pill').forEach(x => {
    const on = x === c;
    x.setAttribute('aria-pressed', on);
    x.classList.toggle('now', on);
  });
  renderPath();
}));

$('#theme').addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : cur === 'light' ? 'dark'
    : (matchMedia('(prefers-color-scheme:dark)').matches ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('aiwd.theme', next); } catch {}
});

$('#export').addEventListener('click', () => {
  const t = totals();
  const out = {
    exportedAt: new Date().toISOString(),
    account: cloud ? cloud.email : '(local mode — not signed in)',
    course: DATA.meta.title,
    completedModules: DATA.modules.filter(m => state.modules[m.id]).map(m => ({ id: m.id, title: m.title, hours: m.hours })),
    videosWatched: t.videosSeen, videosTotal: t.videoCount,
    coreHoursCompleted: t.hours, coreHoursTotal: t.coreHours
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }));
  a.download = `progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click(); URL.revokeObjectURL(a.href);
});

(function initTheme() {
  try { const t = localStorage.getItem('aiwd.theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch {}
})();

/* ------------------------------------------------------------------- auth */

const showGate = show => { $('#gate').hidden = !show; document.body.classList.toggle('locked', show); };

function showUser(u) {
  const box = $('#account');
  if (!u) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = `${u.photoURL ? `<img class="avatar" src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">` : ''}
    <span class="who">${esc(u.displayName || u.email)}</span>
    <button class="icon-btn" id="signout" title="Sign out" aria-label="Sign out">${icon('signout', 18)}</button>`;
}

async function startAuth() {
  const [{ initializeApp }, auth, fs] = await Promise.all([
    import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`), import(`${SDK}/firebase-firestore.js`)
  ]);
  const app = initializeApp(FIREBASE_CONFIG);
  const a = auth.getAuth(app), db = fs.getFirestore(app);
  const provider = new auth.GoogleAuthProvider();
  const POPUP_FAILED = new Set(['auth/popup-blocked', 'auth/popup-closed-by-user',
    'auth/cancelled-popup-request', 'auth/operation-not-supported-in-this-environment']);

  $('#signin').addEventListener('click', async () => {
    $('#gate-err').textContent = '';
    try { await auth.signInWithPopup(a, provider); }
    catch (err) {
      if (POPUP_FAILED.has(err.code)) {
        $('#gate-err').textContent = 'Popup blocked — redirecting you to Google…';
        try { await auth.signInWithRedirect(a, provider); return; }
        catch (e2) { $('#gate-err').textContent = `Sign-in failed: ${e2.message}`; return; }
      }
      $('#gate-err').textContent = err.code === 'auth/unauthorized-domain'
        ? 'This domain is not in the Firebase authorised-domains list.'
        : `Sign-in failed: ${err.message}`;
    }
  });

  auth.getRedirectResult(a).catch(err => {
    if (err.code !== 'auth/no-auth-event') console.error('Redirect sign-in:', err);
  });

  auth.onAuthStateChanged(a, async user => {
    if (!user) { cloud = null; showUser(null); showGate(true); $('#nav-trainer').hidden = true; return; }
    cloud = { db, uid: user.uid, email: user.email, displayName: user.displayName,
              photoURL: user.photoURL, doc: fs.doc, setDoc: fs.setDoc };

    // UI gate only. firestore.rules is what actually stops a non-trainer reading
    // anyone else's progress — hiding a nav link is not security.
    $('#nav-trainer').hidden = !isAdmin(user.email);
    try {
      const snap = await fs.getDoc(fs.doc(db, 'progress', user.uid));
      const remote = snap.exists() ? snap.data()
                                   : { modules: {}, videos: {}, quizzes: {}, certifiedAt: null };
      const merged = merge(remote, readLocal());
      const changed = JSON.stringify(merged) !== JSON.stringify({
        modules: remote.modules || {}, videos: remote.videos || {},
        quizzes: remote.quizzes || {}, certifiedAt: remote.certifiedAt || null });
      state = merged; writeLocal();
      showUser(user); showGate(false); renderAll();
      if (changed) persist(); else setSync('saved');
    } catch (err) {
      console.error('Could not load cloud progress:', err);
      setSync('error', err.message);
      showUser(user); showGate(false); renderAll();
    }
    $('#signout')?.addEventListener('click', () => auth.signOut(a));
  });
}

/* ------------------------------------------------------------------- boot */

Promise.all([
  fetch('data/curriculum.json').then(r => { if (!r.ok) throw new Error('curriculum HTTP ' + r.status); return r.json(); }),
  fetch('data/quizzes.json').then(r => r.ok ? r.json() : null).catch(() => null)
])
  .then(async ([d, qz]) => {
    DATA = d;
    QUIZ = qz;
    hydrateIcons();
    state = readLocal();
    const t = totals();
    $('#term-line').textContent =
      `→ ${d.modules.length} modules · ${t.videoCount} video lessons · 2 projects`;
    renderAll();
    if (isConfigured(FIREBASE_CONFIG)) {
      showGate(true);
      try { await startAuth(); }
      catch (err) {
        console.error('Firebase failed to load:', err);
        $('#gate-err').textContent = 'Could not reach Google sign-in. Continuing in local mode.';
        showGate(false); setSync('local'); $('#setup-note').hidden = false;
      }
    } else {
      showGate(false); setSync('local'); $('#setup-note').hidden = false;
    }
  })
  .catch(err => {
    console.error('Boot failed:', err);
    document.querySelector('main').insertAdjacentHTML('afterbegin',
      `<div class="callout warn"><b>Could not load the curriculum.</b> ${esc(err.message)} — serve this page over HTTP.</div>`);
  });
