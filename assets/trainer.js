import { FIREBASE_CONFIG, isConfigured } from './firebase-config.js';
import { isAdmin } from './admins.js';
import { icon, hydrateIcons } from './icons.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let DATA = null;
let rows = [];
let ctx = null;   // { db, fs, auth, a }

/* ------------------------------------------------------------------ helpers */

function courseTotals() {
  const core = DATA.modules.filter(m => m.track === 'core');
  return {
    core,
    coreHours: core.reduce((a, m) => a + m.hours, 0),
    coreCount: core.length,
    videoCount: DATA.modules.reduce((a, m) => a + m.resources.filter(r => r.embed).length, 0)
  };
}

function summarise(doc) {
  const { core, coreHours, coreCount, videoCount } = courseTotals();
  const mods = doc.modules || {};
  const vids = doc.videos || {};
  const doneCore = core.filter(m => mods[m.id]);
  const hours = doneCore.reduce((a, m) => a + m.hours, 0);
  const allDone = DATA.modules.filter(m => mods[m.id]);
  return {
    uid: doc.__uid,
    name: doc.displayName || '(no name)',
    email: doc.email || '',
    photo: doc.photoURL || '',
    modulesDone: doneCore.length,
    modulesTotal: coreCount,
    electivesDone: allDone.length - doneCore.length,
    hours,
    coreHours,
    pct: coreHours ? Math.round(hours / coreHours * 100) : 0,
    videos: Object.keys(vids).length,
    videoCount,
    updated: doc.updatedAt || '',
    mods
  };
}

function ago(iso) {
  if (!iso) return 'never';
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (isNaN(d)) return iso;
  if (d < 90) return 'just now';
  if (d < 5400) return `${Math.round(d / 60)} min ago`;
  if (d < 172800) return `${Math.round(d / 3600)} hrs ago`;
  return `${Math.round(d / 86400)} days ago`;
}

/* ------------------------------------------------------------------- render */

function renderSummary() {
  const { coreHours, videoCount } = courseTotals();
  const n = rows.length;
  const avg = n ? Math.round(rows.reduce((a, r) => a + r.pct, 0) / n) : 0;
  const active = rows.filter(r => r.updated &&
    Date.now() - new Date(r.updated).getTime() < 7 * 864e5).length;
  const finished = rows.filter(r => r.modulesDone === r.modulesTotal).length;

  const card = (k, v, sub, colour) =>
    `<div class="card stat"><div class="k">${k}<i style="background:${colour}"></i></div>
       <b>${v}</b><small>${sub}</small></div>`;

  $('#summary').innerHTML = [
    card('Learners', n, 'signed in at least once', 'var(--primary)'),
    card('Average core progress', avg + '%', `of ${coreHours} curriculum hours`, 'var(--success)'),
    card('Active this week', active, 'touched their progress', 'var(--ai)'),
    card('Completed core', finished, 'all core modules ticked', 'var(--warn)')
  ].join('');
}

function learnerHTML(r) {
  const byTrack = DATA.modules.map(m => {
    const done = !!r.mods[m.id];
    return `<span class="pip ${done ? 'on' : ''} ${m.track === 'elective' ? 'el' : ''}"
      title="${esc(String(m.id).padStart(2, '0'))} ${esc(m.title)} — ${done ? 'done' : 'not done'}">${m.id}</span>`;
  }).join('');

  return `<article class="learner">
    <div class="l-head">
      ${r.photo ? `<img class="avatar lg" src="${esc(r.photo)}" alt="" referrerpolicy="no-referrer">`
                : `<div class="avatar lg ph">${esc((r.name[0] || '?').toUpperCase())}</div>`}
      <div class="l-id">
        <b>${esc(r.name)}</b>
        <span>${esc(r.email)}</span>
      </div>
      <div class="l-num"><b>${r.pct}%</b><small>core</small></div>
      <div class="l-num"><b>${r.modulesDone}/${r.modulesTotal}</b><small>modules</small></div>
      <div class="l-num"><b>${r.hours}</b><small>hours</small></div>
      <div class="l-num"><b>${r.videos}/${r.videoCount}</b><small>videos</small></div>
      <div class="l-when">${esc(ago(r.updated))}</div>
    </div>
    <div class="l-bar"><i style="width:${r.pct}%"></i></div>
    <div class="pips">${byTrack}</div>
  </article>`;
}

function renderBoard() {
  if (!rows.length) {
    $('#board').innerHTML = `<div class="callout ai">
      <b>No learners yet.</b> Nobody has signed in to the course site. As soon as someone does and ticks
      their first module, they appear here.</div>`;
    return;
  }
  rows.sort((a, b) => b.pct - a.pct || a.name.localeCompare(b.name));
  $('#board').innerHTML = rows.map(learnerHTML).join('');
}

/* --------------------------------------------------------------------- data */

async function loadLearners() {
  const { fs, db } = ctx;
  $('#board').innerHTML = '<p style="color:var(--text-dim)">Loading learner progress…</p>';
  try {
    const snap = await fs.getDocs(fs.collection(db, 'progress'));
    rows = snap.docs.map(d => summarise({ ...d.data(), __uid: d.id }));
    renderSummary();
    renderBoard();
  } catch (err) {
    console.error('Load failed:', err);
    const denied = err.code === 'permission-denied';
    $('#board').innerHTML = `<div class="callout warn">
      <b>${denied ? 'This account is not a trainer.' : 'Could not load progress.'}</b>
      ${denied
        ? 'Add the address to <code>trainers()</code> in <code>firestore.rules</code>, then run <code>firebase deploy --only firestore:rules</code>.'
        : esc(err.message)}</div>`;
    rows = [];
    renderSummary();
  }
}

function toCSV() {
  const head = ['name', 'email', 'core_percent', 'modules_done', 'modules_total',
                'electives_done', 'hours_done', 'hours_total', 'videos_watched',
                'videos_total', 'last_updated'];
  const esc2 = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const body = rows.map(r => [r.name, r.email, r.pct, r.modulesDone, r.modulesTotal,
    r.electivesDone, r.hours, r.coreHours, r.videos, r.videoCount, r.updated].map(esc2).join(','));
  return [head.join(','), ...body].join('\n');
}

/* ------------------------------------------------------------------- events */

$('#theme').addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : cur === 'light' ? 'dark'
    : (matchMedia('(prefers-color-scheme:dark)').matches ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('aiwd.theme', next); } catch {}
});

$('#refresh').addEventListener('click', () => { if (ctx) loadLearners(); });

$('#csv').addEventListener('click', () => {
  if (!rows.length) return;
  const blob = new Blob([toCSV()], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `learner-progress-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
});

(function initTheme() {
  try {
    const t = localStorage.getItem('aiwd.theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
  } catch {}
})();

function showGate(show) {
  $('#gate').hidden = !show;
  document.body.classList.toggle('locked', show);
}

function showUser(user) {
  const box = $('#account');
  if (!user) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = `
    ${user.photoURL ? `<img class="avatar" src="${esc(user.photoURL)}" alt="" referrerpolicy="no-referrer">` : ''}
    <span class="who">${esc(user.displayName || user.email)}</span>
    <button class="icon-btn" id="signout" title="Sign out" aria-label="Sign out">${icon('signout', 18)}</button>`;
  $('#signout').addEventListener('click', () => ctx.auth.signOut(ctx.a));
}

/* --------------------------------------------------------------------- boot */

async function start() {
  const [{ initializeApp }, auth, fs] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`)
  ]);

  const app = initializeApp(FIREBASE_CONFIG);
  const a = auth.getAuth(app);
  const db = fs.getFirestore(app);
  const provider = new auth.GoogleAuthProvider();
  ctx = { auth, fs, a, db };

  const POPUP_FAILED = new Set([
    'auth/popup-blocked', 'auth/popup-closed-by-user',
    'auth/cancelled-popup-request', 'auth/operation-not-supported-in-this-environment'
  ]);

  $('#signin').addEventListener('click', async () => {
    $('#gate-err').textContent = '';
    try {
      await auth.signInWithPopup(a, provider);
    } catch (err) {
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

  auth.onAuthStateChanged(a, user => {
    if (!user) { showUser(null); showGate(true); return; }
    showUser(user);
    showGate(false);
    if (!isAdmin(user.email)) {
      rows = [];
      renderSummary();
      $('#board').innerHTML = `<div class="callout warn">
        <b>This account is not a trainer.</b> ${esc(user.email || '')} is not on the trainer
        allowlist, so it cannot read learner progress. Add it to <code>trainers()</code> in
        <code>firestore.rules</code> and redeploy, or
        <a href="index.html">go to the course site</a>.</div>`;
      return;
    }
    loadLearners();
  });
}

fetch('data/curriculum.json')
  .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then(async d => {
    DATA = d;
    hydrateIcons();
    if (!isConfigured(FIREBASE_CONFIG)) {
      showGate(false);
      $('#setup-note').hidden = false;
      rows = [];
      renderSummary();
      renderBoard();
      return;
    }
    showGate(true);
    await start();
  })
  .catch(err => {
    console.error('Boot failed:', err);
    $('#board').innerHTML = `<p style="color:var(--accent)">Could not start: ${esc(err.message)}</p>`;
  });
