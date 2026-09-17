import { FIREBASE_CONFIG, isConfigured } from './firebase-config.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';
const LOCAL_KEY = 'aiwd.progress.v2';
const LEGACY_KEY = 'aiwd.progress.v1';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let DATA = null;
let filter = 'all';
let state = { modules: {}, videos: {} };
let cloud = null;          // { db, uid, doc, setDoc, serverTimestamp } when signed in
let saveTimer = null;

/* ---------------------------------------------------------------- storage */

function readLocal() {
  try {
    const v2 = JSON.parse(localStorage.getItem(LOCAL_KEY));
    if (v2 && v2.modules) return { modules: v2.modules || {}, videos: v2.videos || {} };
    const v1 = JSON.parse(localStorage.getItem(LEGACY_KEY));   // migrate old format
    if (v1) return { modules: v1, videos: {} };
  } catch {}
  return { modules: {}, videos: {} };
}

function writeLocal() {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)); } catch {}
}

function mergeProgress(a, b) {
  return {
    modules: { ...(a.modules || {}), ...(b.modules || {}) },
    videos: { ...(a.videos || {}), ...(b.videos || {}) }
  };
}

function persist() {
  writeLocal();
  if (!cloud) return;
  setSync('saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await cloud.setDoc(cloud.doc(cloud.db, 'progress', cloud.uid), {
        modules: state.modules,
        videos: state.videos,
        email: cloud.email || '',
        displayName: cloud.displayName || '',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setSync('saved');
    } catch (err) {
      console.error('Cloud save failed:', err);
      setSync('error', err.message);
    }
  }, 600);
}

function setSync(kind, detail = '') {
  const el = $('#sync');
  if (!el) return;
  const map = {
    local: ['Local mode', 'Progress saved in this browser only'],
    saving: ['Saving…', ''],
    saved: ['Saved to your account', ''],
    error: ['Save failed', detail]
  };
  const [label, title] = map[kind] || ['', ''];
  el.textContent = label;
  el.title = title;
  el.dataset.kind = kind;
}

/* ------------------------------------------------------------------ video */

function embedSrc(e, autoplay) {
  const a = autoplay ? '&autoplay=1' : '';
  return e.kind === 'playlist'
    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${e.id}&rel=0${a}`
    : `https://www.youtube-nocookie.com/embed/${e.id}?rel=0&modestbranding=1${a}`;
}

function videoHTML(r) {
  const e = r.embed;
  const watched = !!state.videos[e.id];
  const thumb = e.kind === 'video'
    ? `<img class="thumb" loading="lazy" alt="" src="https://i.ytimg.com/vi/${e.id}/hqdefault.jpg">`
    : `<div class="thumb thumb-list" aria-hidden="true"><span>Playlist</span></div>`;

  return `<div class="vid ${watched ? 'watched' : ''}" data-vid="${esc(e.id)}" data-kind="${e.kind}">
    <div class="vid-frame" data-src="${esc(embedSrc(e, true))}">
      ${thumb}
      <button class="play" aria-label="Play ${esc(r.title)}"><span>&#9654;</span></button>
    </div>
    <div class="vid-meta">
      <span class="lang hi">HI</span>
      <b>${esc(r.title)}</b>
      <button class="seen" aria-pressed="${watched}">${watched ? '&#10003; Watched' : 'Mark watched'}</button>
    </div>
  </div>`;
}

/* ----------------------------------------------------------------- render */

function renderStats() {
  const mods = DATA.modules;
  const core = mods.filter(m => m.track === 'core');
  const coreHours = core.reduce((a, m) => a + m.hours, 0);
  const elHours = mods.filter(m => m.track === 'elective').reduce((a, m) => a + m.hours, 0);
  const doneHours = mods.filter(m => state.modules[m.id]).reduce((a, m) => a + m.hours, 0);
  const coreDone = core.filter(m => state.modules[m.id]).length;
  const coreDoneHours = core.filter(m => state.modules[m.id]).reduce((a, m) => a + m.hours, 0);
  const pct = coreHours ? Math.round(coreDoneHours / coreHours * 100) : 0;
  const pw = DATA.meta.hoursPerWeekDefault;
  const totalVids = mods.reduce((a, m) => a + m.resources.filter(r => r.embed).length, 0);
  const seenVids = Object.keys(state.videos).length;

  $('#stats').innerHTML = `
    <div class="stat"><small>Core progress</small><b>${pct}%</b>${coreDone} of ${core.length} modules</div>
    <div class="stat"><small>Hours logged</small><b>${doneHours}</b>of ${coreHours} core (+${elHours} elective)</div>
    <div class="stat"><small>Videos watched</small><b>${seenVids}</b>of ${totalVids} embedded</div>
    <div class="stat"><small>Core duration</small><b>${(coreHours / pw).toFixed(0)} wks</b>at ${pw} hrs/week</div>`;
  $('.bar i').style.width = pct + '%';
}

function moduleHTML(m) {
  const done = !!state.modules[m.id];
  const vids = m.resources.filter(r => r.embed);
  const docs = m.resources.filter(r => !r.embed);

  const docList = docs.map(r => `
    <li><span class="lang ${r.lang}">${r.lang.toUpperCase()}</span>
      <a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a>
      <span class="kind">${esc(r.type)} &#8599;</span></li>`).join('');

  return `<article class="mod ${done ? 'done' : ''}" data-id="${m.id}" data-track="${m.track}">
    <div class="mod-head">
      <button class="tick" role="checkbox" aria-checked="${done}" aria-label="Mark module ${m.id} complete">&#10003;</button>
      <div class="mod-t">
        <h3><span class="num">${String(m.id).padStart(2, '0')}</span> ${esc(m.title)}</h3>
        <p>${esc(m.goal)}</p>
        <div class="tags">
          <span class="tag hrs">${m.hours} hrs</span>
          ${m.track === 'elective' ? '<span class="tag el">Elective</span>' : '<span class="tag">Core</span>'}
          ${vids.length ? `<span class="tag">${vids.length} video${vids.length > 1 ? 's' : ''}</span>` : ''}
          ${m.quiz && m.quiz.questions ? `<span class="tag">Quiz &middot; ${m.quiz.questions} Q</span>` : ''}
        </div>
      </div>
    </div>
    <div class="mod-body">
      ${m.warning ? `<div class="warnbox"><b>Correction from the source research:</b> ${esc(m.warning)}</div>` : ''}
      <h4>Topics</h4><ul>${m.topics.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      ${vids.length ? `<h4>Watch here &mdash; Hindi</h4><div class="vids">${vids.map(videoHTML).join('')}</div>` : ''}
      ${docList ? `<h4>Reference documentation (opens externally)</h4><ul class="res">${docList}</ul>` : ''}
      <h4>Exercises</h4><ul>${m.exercises.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
      ${m.deliverable ? `<h4>Deliverable</h4><div class="deliver">${esc(m.deliverable)}</div>` : ''}
    </div>
  </article>`;
}

function render() {
  const open = new Set([...document.querySelectorAll('.mod.open')].map(e => e.dataset.id));
  const list = DATA.modules.filter(m =>
    filter === 'all' ? true :
    filter === 'todo' ? !state.modules[m.id] : m.track === filter);

  $('#modules').innerHTML = list.map(moduleHTML).join('') ||
    '<p style="color:var(--text-dim)">Nothing matches this filter.</p>';
  open.forEach(id => {
    const el = $(`.mod[data-id="${id}"]`);
    if (el) el.classList.add('open');
  });
  renderStats();
}

function renderFixes() {
  $('#fixes').innerHTML = DATA.corrections.map(c => `
    <div class="fix"><span class="sev ${c.severity}">${c.severity}</span>
      <b>${esc(c.issue)}</b><p>${esc(c.detail)}</p></div>`).join('');
}

/* ------------------------------------------------------------------ events */

document.addEventListener('click', e => {
  const play = e.target.closest('.play');
  if (play) {
    const frame = play.closest('.vid-frame');
    frame.innerHTML = `<iframe src="${frame.dataset.src}" title="Course video" loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    return;
  }

  const seen = e.target.closest('.seen');
  if (seen) {
    const card = seen.closest('.vid');
    const id = card.dataset.vid;
    if (state.videos[id]) delete state.videos[id]; else state.videos[id] = true;
    const on = !!state.videos[id];
    card.classList.toggle('watched', on);
    seen.setAttribute('aria-pressed', on);
    seen.innerHTML = on ? '&#10003; Watched' : 'Mark watched';
    persist();
    renderStats();
    return;
  }

  const tick = e.target.closest('.tick');
  if (tick) {
    e.stopPropagation();
    const id = tick.closest('.mod').dataset.id;
    if (state.modules[id]) delete state.modules[id]; else state.modules[id] = true;
    persist();
    render();
    return;
  }

  const head = e.target.closest('.mod-head');
  if (head) head.parentElement.classList.toggle('open');
});

$('#theme').addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : cur === 'light' ? 'dark'
    : (matchMedia('(prefers-color-scheme:dark)').matches ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('aiwd.theme', next); } catch {}
});

$('#export').addEventListener('click', () => {
  const mods = DATA.modules;
  const out = {
    exportedAt: new Date().toISOString(),
    account: cloud ? cloud.email : '(local mode — not signed in)',
    course: DATA.meta.title,
    completedModules: mods.filter(m => state.modules[m.id]).map(m => ({ id: m.id, title: m.title, hours: m.hours })),
    videosWatched: Object.keys(state.videos).length,
    coreHoursCompleted: mods.filter(m => m.track === 'core' && state.modules[m.id]).reduce((a, m) => a + m.hours, 0),
    coreHoursTotal: mods.filter(m => m.track === 'core').reduce((a, m) => a + m.hours, 0)
  };
  const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
  filter = c.dataset.filter;
  document.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === c));
  render();
}));

(function initTheme() {
  try {
    const t = localStorage.getItem('aiwd.theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
  } catch {}
})();

/* -------------------------------------------------------------------- auth */

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
    <span class="who">${esc(user.displayName || user.email || 'Signed in')}</span>
    <button class="btn" id="signout">Sign out</button>`;
}

async function startAuth() {
  const [{ initializeApp }, auth, fs] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`)
  ]);

  const app = initializeApp(FIREBASE_CONFIG);
  const a = auth.getAuth(app);
  const db = fs.getFirestore(app);
  const provider = new auth.GoogleAuthProvider();

  // A popup that was blocked (common on mobile and in locked-down browsers) falls back
  // to a full-page redirect, which no popup blocker can stop.
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
        try {
          await auth.signInWithRedirect(a, provider);
          return;
        } catch (err2) {
          $('#gate-err').textContent = `Sign-in failed: ${err2.message}`;
          return;
        }
      }
      $('#gate-err').textContent = err.code === 'auth/unauthorized-domain'
        ? 'This domain is not in the Firebase authorised-domains list. Add it in Authentication → Settings → Authorised domains.'
        : `Sign-in failed: ${err.message}`;
    }
  });

  // Completes a redirect-based sign-in when the user lands back on the page.
  auth.getRedirectResult(a).catch(err => {
    if (err.code !== 'auth/no-auth-event') console.error('Redirect sign-in:', err);
  });

  auth.onAuthStateChanged(a, async user => {
    if (!user) {
      cloud = null;
      showUser(null);
      showGate(true);
      return;
    }

    cloud = {
      db, uid: user.uid, email: user.email, displayName: user.displayName,
      doc: fs.doc, setDoc: fs.setDoc
    };

    // Merge whatever is already in this browser with what is in the account,
    // so ticking things before signing in is never lost.
    try {
      const snap = await fs.getDoc(fs.doc(db, 'progress', user.uid));
      const remote = snap.exists() ? snap.data() : { modules: {}, videos: {} };
      const merged = mergeProgress(remote, readLocal());
      const changed = JSON.stringify(merged) !== JSON.stringify({
        modules: remote.modules || {}, videos: remote.videos || {}
      });
      state = merged;
      writeLocal();
      showUser(user);
      showGate(false);
      render();
      if (changed) persist(); else setSync('saved');
    } catch (err) {
      console.error('Could not load cloud progress:', err);
      setSync('error', err.message);
      showUser(user);
      showGate(false);
      render();
    }

    const out = $('#signout');
    if (out) out.addEventListener('click', () => auth.signOut(a));
  });
}

/* -------------------------------------------------------------------- boot */

fetch('data/curriculum.json')
  .catch(err => {
    $('#modules').innerHTML = `<p style="color:var(--accent)">Could not load <code>data/curriculum.json</code> &mdash; ${esc(err.message)}. Serve this page over HTTP: <code>python3 -m http.server</code></p>`;
    throw err;
  })
  .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then(async d => {
    DATA = d;
    $('#updated').textContent = d.meta.updated;
    state = readLocal();
    renderFixes();

    if (isConfigured(FIREBASE_CONFIG)) {
      showGate(true);
      render();
      try {
        await startAuth();
      } catch (err) {
        console.error('Firebase failed to load:', err);
        $('#gate-err').textContent = 'Could not reach Google sign-in. Continuing in local mode.';
        showGate(false);
        setSync('local');
      }
    } else {
      showGate(false);
      setSync('local');
      $('#setup-note').hidden = false;
      render();
    }
  })
  .catch(err => console.error('Boot failed:', err));
