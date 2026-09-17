const STORE = 'aiwd.progress.v1';
let DATA = null;
let filter = 'all';

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

function load() {
  try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
  catch { return {}; }
}
function save(p) {
  try { localStorage.setItem(STORE, JSON.stringify(p)); } catch {}
}

let progress = load();

function weeks(hours, perWeek) { return hours / perWeek; }

function renderStats() {
  const mods = DATA.modules;
  const core = mods.filter(m => m.track === 'core');
  const coreHours = core.reduce((a, m) => a + m.hours, 0);
  const elHours = mods.filter(m => m.track === 'elective').reduce((a, m) => a + m.hours, 0);
  const doneMods = mods.filter(m => progress[m.id]);
  const doneHours = doneMods.reduce((a, m) => a + m.hours, 0);
  const coreDone = core.filter(m => progress[m.id]).length;
  const pct = coreHours ? Math.round(core.filter(m => progress[m.id]).reduce((a, m) => a + m.hours, 0) / coreHours * 100) : 0;
  const pw = DATA.meta.hoursPerWeekDefault;

  $('#stats').innerHTML = `
    <div class="stat"><small>Core progress</small><b>${pct}%</b>${coreDone} of ${core.length} modules</div>
    <div class="stat"><small>Hours logged</small><b>${doneHours}</b>of ${coreHours} core (+${elHours} elective)</div>
    <div class="stat"><small>Core duration</small><b>${weeks(coreHours, pw).toFixed(0)} wks</b>at ${pw} hrs/week</div>
    <div class="stat"><small>Accelerated</small><b>${weeks(coreHours, 20).toFixed(0)} wks</b>at 20 hrs/week</div>`;
  $('.bar i').style.width = pct + '%';
}

function moduleHTML(m) {
  const done = !!progress[m.id];
  const res = (m.resources || []).map(r => `
    <li><span class="lang ${r.lang}">${r.lang.toUpperCase()}</span>
      <a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a>
      <span class="kind">${esc(r.type)}</span></li>`).join('');

  return `<article class="mod ${done ? 'done' : ''}" data-id="${m.id}" data-track="${m.track}">
    <div class="mod-head">
      <button class="tick" role="checkbox" aria-checked="${done}" aria-label="Mark module ${m.id} complete">&#10003;</button>
      <div class="mod-t">
        <h3><span class="num">${String(m.id).padStart(2, '0')}</span> ${esc(m.title)}</h3>
        <p>${esc(m.goal)}</p>
        <div class="tags">
          <span class="tag hrs">${m.hours} hrs</span>
          ${m.track === 'elective' ? '<span class="tag el">Elective</span>' : '<span class="tag">Core</span>'}
          ${m.quiz && m.quiz.questions ? `<span class="tag">Quiz · ${m.quiz.questions} Q</span>` : ''}
        </div>
      </div>
    </div>
    <div class="mod-body">
      ${m.warning ? `<div class="warnbox"><b>Correction from the source research:</b> ${esc(m.warning)}</div>` : ''}
      <h4>Topics</h4><ul>${m.topics.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      ${res ? `<h4>Resources — Hindi video, English docs</h4><ul class="res">${res}</ul>` : ''}
      <h4>Exercises</h4><ul>${m.exercises.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
      ${m.deliverable ? `<h4>Deliverable</h4><div class="deliver">${esc(m.deliverable)}</div>` : ''}
    </div>
  </article>`;
}

function render() {
  const list = DATA.modules.filter(m =>
    filter === 'all' ? true :
    filter === 'todo' ? !progress[m.id] : m.track === filter);
  $('#modules').innerHTML = list.map(moduleHTML).join('') ||
    '<p style="color:var(--text-dim)">Nothing matches this filter.</p>';
  renderStats();
}

function renderFixes() {
  $('#fixes').innerHTML = DATA.corrections.map(c => `
    <div class="fix"><span class="sev ${c.severity}">${c.severity}</span>
      <b>${esc(c.issue)}</b><p>${esc(c.detail)}</p></div>`).join('');
}

document.addEventListener('click', e => {
  const tick = e.target.closest('.tick');
  if (tick) {
    e.stopPropagation();
    const id = tick.closest('.mod').dataset.id;
    progress[id] = !progress[id];
    if (!progress[id]) delete progress[id];
    save(progress);
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
    course: DATA.meta.title,
    completedModules: mods.filter(m => progress[m.id]).map(m => ({ id: m.id, title: m.title, hours: m.hours })),
    coreHoursCompleted: mods.filter(m => m.track === 'core' && progress[m.id]).reduce((a, m) => a + m.hours, 0),
    coreHoursTotal: mods.filter(m => m.track === 'core').reduce((a, m) => a + m.hours, 0)
  };
  const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

$('#reset').addEventListener('click', () => {
  if (confirm('Clear all progress on this device? This cannot be undone.')) {
    progress = {}; save(progress); render();
  }
});

document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
  filter = c.dataset.filter;
  document.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === c));
  render();
}));

(function initTheme() {
  try { const t = localStorage.getItem('aiwd.theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch {}
})();

fetch('data/curriculum.json')
  .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .catch(err => {
    $('#modules').innerHTML = `<p style="color:var(--accent)">Could not load <code>data/curriculum.json</code> — ${esc(err.message)}. If you opened this page directly from disk, serve it over HTTP instead: <code>python3 -m http.server</code></p>`;
    throw err;
  })
  .then(d => {
    DATA = d;
    $('#updated').textContent = d.meta.updated;
    render();
    renderFixes();
  })
  .catch(err => { console.error('Render failed:', err); });
