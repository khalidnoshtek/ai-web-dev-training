// Self-contained confetti. No CDN, no dependency — a few hundred paper rectangles
// on a full-screen canvas that removes itself when the last one falls off screen.
// Respects prefers-reduced-motion by simply not running.

// Noshtek brand tones only — orange range plus neutrals. Deliberately not a
// rainbow: the celebration should still look like the product.
const COLOURS = ['#ff8e01', '#ff5200', '#ffb347', '#ffffff', '#c9c9d1', '#ff7a29'];

export function confetti({ count = 160, duration = 3400 } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:200';
  document.body.appendChild(cv);

  const ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const size = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr); };
  size();

  const bits = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: -20 - Math.random() * innerHeight * 0.5,
    w: 6 + Math.random() * 6,
    h: 9 + Math.random() * 7,
    vy: 2 + Math.random() * 3.4,
    vx: -1.3 + Math.random() * 2.6,
    rot: Math.random() * Math.PI,
    vr: -0.13 + Math.random() * 0.26,
    c: COLOURS[(Math.random() * COLOURS.length) | 0]
  }));

  const started = performance.now();
  let raf = 0;

  function frame(now) {
    const life = now - started;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = 0;

    for (const b of bits) {
      b.x += b.vx; b.y += b.vy; b.rot += b.vr;
      b.vy += 0.035;                       // gravity
      if (b.y < innerHeight + 40) alive++;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.globalAlpha = life > duration - 700 ? Math.max(0, (duration - life) / 700) : 1;
      ctx.fillStyle = b.c;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }

    if (alive && life < duration) raf = requestAnimationFrame(frame);
    else { cancelAnimationFrame(raf); cv.remove(); removeEventListener('resize', size); }
  }

  addEventListener('resize', size);
  raf = requestAnimationFrame(frame);
}
