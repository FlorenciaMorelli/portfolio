// Canvas cursors that lean toward the mouse (hero and footer, microinteractions 8 and 22).
// Each one moves 10 to 12px at most and catches up with its own delay (120 to 260ms). Not with
// reduced motion, touch or narrow screens. Positions are measured once per window size, never
// on every move, and the listener is passive.

const REACH = [11, 12, 10, 12];
const DELAY = [120, 200, 260, 160];

export function followPointer(area: HTMLElement, elements: HTMLElement[]): void {
  const cursors = elements.map((el, i) => ({ el, x: 0, y: 0, tx: 0, ty: 0, cx: 0, cy: 0, reach: REACH[i % 4], delay: DELAY[i % 4] }));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = window.matchMedia('(min-width: 1280px) and (pointer: fine)');
  let frame = 0;
  let last = 0;
  // Resting centres of the cursors in page coordinates.
  let measuredAt = '';
  const measure = () => {
    const key = `${window.innerWidth}x${window.innerHeight}`;
    if (key === measuredAt) return;
    measuredAt = key;
    for (const c of cursors) {
      const r = c.el.getBoundingClientRect();
      c.cx = r.left - c.x + r.width / 2 + window.scrollX;
      c.cy = r.top - c.y + r.height / 2 + window.scrollY;
    }
  };

  const step = (now: number) => {
    const dt = last ? Math.min(now - last, 64) : 16;
    last = now;
    let moving = false;
    for (const c of cursors) {
      const k = 1 - Math.exp(-dt / c.delay);
      c.x += (c.tx - c.x) * k;
      c.y += (c.ty - c.y) * k;
      if (Math.abs(c.tx - c.x) > 0.05 || Math.abs(c.ty - c.y) > 0.05) moving = true;
      c.el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0)`;
    }
    frame = moving ? requestAnimationFrame(step) : 0;
    if (!frame) last = 0;
  };
  const run = () => {
    if (!frame) frame = requestAnimationFrame(step);
  };
  const settle = () => {
    cursors.forEach((c) => ((c.tx = 0), (c.ty = 0)));
    if (reduced.matches || !wide.matches) {
      cursors.forEach((c) => ((c.x = 0), (c.y = 0), c.el.style.removeProperty('transform')));
    } else run();
  };

  window.addEventListener(
    'pointermove',
    (e) => {
      if (reduced.matches || !wide.matches) return;
      measure();
      for (const c of cursors) {
        const dx = e.pageX - c.cx;
        const dy = e.pageY - c.cy;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = c.reach * Math.min(1, dist / 360);
        c.tx = (dx / dist) * pull;
        c.ty = (dy / dist) * pull;
      }
      run();
    },
    { passive: true },
  );
  area.addEventListener('pointerleave', settle);
  reduced.addEventListener('change', settle);
  wide.addEventListener('change', settle);
}
