// The hero cursors leave the hero and travel the page (home, wide screens, with motion): each one
// belongs to a lens and a section, so it floats along the side margin, its label changes to the
// name of the section and, when that section's title nears, it goes to the title and clicks it.
// Everything is arithmetic on the scroll position: the places are measured once (on load, on
// resize and when the page changes height), never while scrolling. Only transform and opacity.

import type { Mode } from './hero-modes';

const SIDE: Record<Mode, 'left' | 'right'> = { analysis: 'left', quality: 'left', design: 'right', development: 'right' };
// Where each cursor floats on the screen while it waits (a fraction of the window height).
const REST_Y: Record<Mode, number> = { analysis: 0.3, design: 0.22, development: 0.62, quality: 0.72 };
const PHASE: Record<Mode, number> = { analysis: 0, design: 1.7, development: 3.1, quality: 4.4 };

const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

/** Position of an element in the page, from the layout (it ignores transforms). */
function pageOffset(el: HTMLElement): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return { x, y };
}

interface Traveller {
  el: HTMLElement;
  mode: Mode;
  title: HTMLElement | null;
  /** Where the cursor sits at the top of the page (window coordinates), and where its title is (page coordinates). */
  spot: { x: number; y: number };
  target: { x: number; y: number };
  label: HTMLElement | null;
  home: string;
  away: string;
}

export function startJourney(hero: HTMLElement, els: HTMLElement[], follow: { setEnabled(on: boolean): void }): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = window.matchMedia('(min-width: 1280px)');
  const travellers: Traveller[] = els.map((el) => {
    const mode = el.dataset.cursor as Mode;
    const label = el.querySelector<HTMLElement>('.hero__cursor-label');
    return {
      el,
      mode,
      title: document.querySelector<HTMLElement>(`[data-lens-title="${mode}"]`),
      spot: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      label,
      home: label?.textContent ?? '',
      away: el.dataset.awayLabel ?? '',
    };
  });

  let active = false;
  let frame = 0;
  let vw = 0;
  let vh = 0;

  const measure = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    for (const t of travellers) {
      // Back in its place in the hero to read where it is, then fixed to the window.
      t.el.classList.remove('is-journey');
      t.el.style.removeProperty('left');
      t.el.style.removeProperty('top');
      const r = t.el.getBoundingClientRect();
      t.spot = { x: r.left, y: r.top + window.scrollY };
      t.el.style.left = `${t.spot.x}px`;
      t.el.style.top = `${t.spot.y}px`;
      t.el.classList.add('is-journey');
      if (t.title) {
        // From the layout (offsets), not from the screen: the blocks come toward you with a
        // transform, and that must not move the place the cursor is headed for.
        const at = pageOffset(t.title);
        // The tip of the arrow lands inside the title, a little in from its left edge.
        t.target = { x: at.x + Math.min(t.title.offsetWidth * 0.55, 150), y: at.y + t.title.offsetHeight * 0.55 };
      }
    }
  };

  const render = () => {
    frame = 0;
    const s = window.scrollY;
    const away = s > 30;
    follow.setEnabled(!away);
    const rest = smooth(s / (vh * 0.7));
    for (const t of travellers) {
      const restX = SIDE[t.mode] === 'left' ? 24 : vw - 150;
      const restY = vh * REST_Y[t.mode];
      // Floating on the screen, a little different for each cursor as the page moves.
      const wander = { x: Math.sin(s / 520 + PHASE[t.mode]) * 14, y: Math.cos(s / 430 + PHASE[t.mode]) * 12 };
      let x = t.spot.x + (restX + wander.x - t.spot.x) * rest;
      let y = t.spot.y - 0 + (restY + wander.y - t.spot.y) * rest;
      let clicking = false;
      let gone = 1;
      if (t.title) {
        const titleY = t.target.y - s;
        const w = smooth((vh * 0.92 - titleY) / (vh * 0.42));
        x += (t.target.x - x) * w;
        y += (titleY - y) * w;
        clicking = w > 0.985;
        // Once the title has gone up, the cursor goes with it.
        gone = Math.min(1, Math.max(0, (titleY + 160) / 160));
        t.title.toggleAttribute('data-selected', clicking && gone > 0.2);
      }
      // Cursors start at their hero place: at the top of the page nothing moves.
      t.el.style.translate = `${(x - t.spot.x).toFixed(1)}px ${(y - t.spot.y).toFixed(1)}px`;
      t.el.style.opacity = gone.toFixed(2);
      t.el.classList.toggle('is-away', away);
      t.el.classList.toggle('is-click', clicking);
      const text = away ? t.away : t.home;
      if (t.label && t.label.textContent !== text) t.label.textContent = text;
    }
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  const start = () => {
    if (active) return;
    active = true;
    measure();
    render();
    window.addEventListener('scroll', schedule, { passive: true });
  };
  const stop = () => {
    if (!active) return;
    active = false;
    window.removeEventListener('scroll', schedule);
    follow.setEnabled(true);
    for (const t of travellers) {
      t.el.classList.remove('is-journey', 'is-away', 'is-click');
      for (const prop of ['left', 'top', 'translate', 'opacity']) t.el.style.removeProperty(prop);
      if (t.label) t.label.textContent = t.home;
      t.title?.removeAttribute('data-selected');
    }
  };
  const sync = () => (wide.matches && !reduced.matches ? start() : stop());

  wide.addEventListener('change', sync);
  reduced.addEventListener('change', sync);
  // The places change with the window, with the web fonts and with the height of the page.
  new ResizeObserver(() => {
    if (!active) return;
    measure();
    schedule();
  }).observe(document.body);
  document.fonts?.ready.then(() => active && (measure(), schedule()));
  sync();
}
