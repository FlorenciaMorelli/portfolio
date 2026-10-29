// The site's single motion system (DESIGN.md, Movimiento). Elements opt in with classes and
// attributes and the CSS lives in global.css. Without JavaScript nothing here runs, and every
// element keeps its final, static state.

interface WatchOptions {
  rootMargin?: string;
  threshold?: number;
}

type OnChange = (entry: IntersectionObserverEntry) => void;

// One IntersectionObserver per set of options, shared by every element that uses it.
const observers = new Map<string, { observer: IntersectionObserver; callbacks: WeakMap<Element, OnChange> }>();

/** Calls `onChange` every time `el` enters or leaves the area set by the options. Returns a stop function. */
export function watch(el: Element, options: WatchOptions, onChange: OnChange): () => void {
  const key = `${options.rootMargin ?? '0px'}|${options.threshold ?? 0}`;
  let entry = observers.get(key);
  if (!entry) {
    const callbacks = new WeakMap<Element, OnChange>();
    const observer = new IntersectionObserver(
      (changes) => {
        for (const change of changes) callbacks.get(change.target)?.(change);
      },
      { rootMargin: options.rootMargin, threshold: options.threshold },
    );
    entry = { observer, callbacks };
    observers.set(key, entry);
  }
  const { observer, callbacks } = entry;
  callbacks.set(el, onChange);
  observer.observe(el);
  return () => {
    observer.unobserve(el);
    callbacks.delete(el);
  };
}

/**
 * `.reveal`: the element comes in once, when it enters the view (10% above the bottom edge).
 * With `data-reveal-at="0.4"` it waits until that fraction of it is in view.
 */
export function reveal(root: ParentNode = document): void {
  for (const el of root.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)')) {
    const at = Number(el.dataset.revealAt ?? 0);
    const stop = watch(el, { rootMargin: '0px 0px -10% 0px', threshold: at }, (change) => {
      if (!change.isIntersecting || change.intersectionRatio + 0.01 < at) return;
      el.classList.add('is-visible');
      stop();
    });
  }
}
