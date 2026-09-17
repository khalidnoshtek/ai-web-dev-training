// Quiz engine: one question at a time, immediate feedback with an explanation,
// then a result card. Pure UI — it owns no persistent state and hands the final
// score back through onFinish so the app decides what to store.

import { icon } from './icons.js';

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function startQuiz(host, { moduleId, title, questions, passMark = 70, best = null,
                                  onFinish, onExit }) {
  let i = 0;
  let picked = null;      // index chosen for the current question
  let correct = 0;
  const wrong = [];

  const pct = () => Math.round(correct / questions.length * 100);

  function paintQuestion() {
    const q = questions[i];
    host.innerHTML = `
      <div class="quiz">
        <div class="quiz-top">
          <button class="btn quiz-exit">Back to modules</button>
          <span class="quiz-count">Question ${i + 1} of ${questions.length}</span>
        </div>
        <div class="track"><i style="width:${i / questions.length * 100}%"></i></div>

        <h2 class="quiz-q">${esc(q.q)}</h2>
        <div class="quiz-opts">
          ${q.options.map((o, n) =>
            `<button class="opt" data-n="${n}">
               <span class="opt-k">${String.fromCharCode(65 + n)}</span>
               <span class="opt-t">${esc(o)}</span>
             </button>`).join('')}
        </div>
        <div class="quiz-feed" hidden></div>
        <div class="quiz-actions">
          <button class="btn primary quiz-next" disabled>Check answer</button>
        </div>
      </div>`;
  }

  function reveal(n) {
    const q = questions[i];
    picked = n;
    const right = n === q.answer;
    if (right) correct++; else wrong.push({ ...q, chose: n });

    host.querySelectorAll('.opt').forEach(b => {
      const bn = Number(b.dataset.n);
      b.disabled = true;
      if (bn === q.answer) b.classList.add('right');
      else if (bn === n) b.classList.add('wrong');
    });

    const feed = host.querySelector('.quiz-feed');
    feed.hidden = false;
    feed.className = `quiz-feed ${right ? 'ok' : 'no'}`;
    feed.innerHTML = `<b>${right ? 'Correct' : 'Not quite'}</b><p>${esc(q.why)}</p>`;

    const next = host.querySelector('.quiz-next');
    next.disabled = false;
    next.textContent = i === questions.length - 1 ? 'See results' : 'Next question';
  }

  function paintResult() {
    const score = pct();
    const passed = score >= passMark;
    const improved = best === null || score > best;

    host.innerHTML = `
      <div class="quiz">
        <div class="quiz-result ${passed ? 'pass' : 'fail'}">
          <span class="res-ic">${icon(passed ? 'award' : 'refresh', 30)}</span>
          <b>${score}%</b>
          <span class="res-sub">${correct} of ${questions.length} correct &middot;
            pass mark ${passMark}%</span>
          <p class="res-msg">${passed
            ? (improved && best !== null ? 'Passed — and a new personal best.' : 'Passed. Module marked complete.')
            : `Not passed yet. Review the explanations below and try again — you need ${passMark}%.`}</p>
        </div>

        ${wrong.length ? `
          <h3 class="quiz-rev-h">What to review</h3>
          <div class="quiz-rev">
            ${wrong.map(w => `
              <div class="rev">
                <b>${esc(w.q)}</b>
                <span class="rev-a">${icon('check', 14)} ${esc(w.options[w.answer])}</span>
                <p>${esc(w.why)}</p>
              </div>`).join('')}
          </div>` : ''}

        <div class="quiz-actions">
          <button class="btn primary quiz-retry">Try again</button>
          <button class="btn quiz-exit">Back to modules</button>
        </div>
      </div>`;

    onFinish?.({ moduleId, score, passed, total: questions.length, correct });
  }

  host.addEventListener('click', e => {
    const opt = e.target.closest('.opt');
    if (opt && picked === null) { reveal(Number(opt.dataset.n)); return; }

    if (e.target.closest('.quiz-next')) {
      picked = null;
      i++;
      if (i >= questions.length) paintResult(); else paintQuestion();
      return;
    }
    if (e.target.closest('.quiz-retry')) {
      i = 0; picked = null; correct = 0; wrong.length = 0; paintQuestion(); return;
    }
    if (e.target.closest('.quiz-exit')) onExit?.();
  });

  paintQuestion();
}
