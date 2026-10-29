import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// On small screens the theme and language controls live inside the collapsed menu.
async function openMenu(page: Page) {
  const toggle = page.locator('[data-nav-toggle]');
  if (await toggle.isVisible()) await toggle.click();
}

test.describe('Spanish home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
  });

  test('renders the hero and projects', async ({ page }) => {
    await expect(page).toHaveTitle(/Florencia Morelli/);
    await expect(page.getByRole('heading', { level: 1, name: 'Del requerimiento a producción.' })).toBeVisible();
    await expect(page.locator('[data-grid] article')).not.toHaveCount(0);
  });

  test('filters projects by category', async ({ page }) => {
    const games = page.locator('[data-filter="Games"]');
    await games.click();
    await expect(games).toHaveAttribute('aria-pressed', 'true');
    const visible = page.locator('[data-grid] article:visible');
    await expect(visible).not.toHaveCount(0);
    for (const card of await visible.all()) {
      await expect(card).toHaveAttribute('data-category', 'Games');
    }
  });

  test('toggles the theme and remembers it', async ({ page }) => {
    const html = page.locator('html');
    const before = await html.getAttribute('data-theme');
    await openMenu(page);
    await page.locator('[data-theme-toggle]').first().click();
    await expect(html).not.toHaveAttribute('data-theme', before ?? '');
    await page.reload();
    await expect(html).not.toHaveAttribute('data-theme', before ?? '');
  });

  test('switches language to English', async ({ page }) => {
    await openMenu(page);
    await page.getByRole('link', { name: /english|inglés/i }).click();
    await expect(page).toHaveURL(/\/portfolio\/en\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  for (const theme of ['light', 'dark']) {
    test(`has no critical accessibility violations in the ${theme} theme`, async ({ page }) => {
      // Idle hero cursors are solid (cursor/*-idle tokens) and pass AA, so nothing is excluded.
      await page.evaluate((t) => localStorage.setItem('theme', t), theme);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      // Measure colours at rest, not halfway through an entrance fade.
      await page.evaluate(() =>
        Promise.all(document.getAnimations().filter((a) => a instanceof CSSTransition).map((a) => a.finished)),
      );
      // The How I work thumbnails sleep at 35% until scrolled to (decorative, aria-hidden, ficha 1):
      // their complete state is checked with reduced motion.
      const results = await new AxeBuilder({ page }).exclude('.facet__thumb').withTags(['wcag2a', 'wcag2aa']).analyze();
      const serious = results.violations.filter((v) =>
        ['critical', 'serious'].includes(v.impact ?? ''),
      );
      expect(serious).toEqual([]);
    });
  }
});

test.describe('About', () => {
  test('shows the photo, the four facets and the technologies by group', async ({ page }) => {
    await page.goto('/portfolio/');
    const about = page.locator('#about');
    const photo = about.getByRole('img', { name: 'Florencia Morelli con toga y birrete, en su graduación' });
    await expect(photo).toHaveAttribute('src', /me-2026\.jpg$/);
    await expect(about.getByRole('heading', { level: 3, name: 'Cómo trabajo' })).toBeVisible();
    for (const name of ['Análisis', 'Diseño', 'Desarrollo', 'Calidad']) {
      await expect(about.getByRole('heading', { level: 4, name })).toBeVisible();
    }
    await expect(about.getByRole('heading', { level: 3, name: 'Tecnologías' })).toBeVisible();
    await expect(about.locator('.stack__row')).toHaveCount(6);
    await expect(about.locator('.stack__row').first()).toContainText('HTML');
  });

  test('mentions the degree and its date, and has three paragraphs', async ({ page }) => {
    await page.goto('/portfolio/');
    const text = page.locator('.about__text p');
    await expect(text).toHaveCount(3);
    await expect(text.nth(1)).toContainText('en diciembre de 2024 me recibí de Técnica Universitaria en Programación de Sistemas en UCES');
  });

  test('is translated in English', async ({ page }) => {
    await page.goto('/portfolio/en/');
    const about = page.locator('#about');
    await expect(about.getByRole('heading', { level: 3, name: 'How I work' })).toBeVisible();
    await expect(about.locator('.about__text p').nth(1)).toContainText('in December 2024 I earned a Technical Degree in Systems Programming from UCES');
  });
});

test.describe('How I work', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
  });

  test('each card shows its tool as a decorative thumbnail', async ({ page }) => {
    const thumbs = page.locator('#about .facet__thumb > .lens');
    await expect(thumbs).toHaveCount(4);
    for (const thumb of await thumbs.all()) await expect(thumb).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('#about .facet').first()).toContainText('Requerimientos, historias de usuario');
  });

  test('the task shows the real unit test count of the last run', async ({ page }) => {
    const stats = JSON.parse(readFileSync('.astro/test-stats.json', 'utf8'));
    expect(stats.failed).toBe(0);
    await expect(page.locator('#about .task')).toContainText(`Pruebas unitarias en verde (${stats.passed} de ${stats.total})`);
  });

  test('the editor shows real lines of src/lib/motion.ts with their numbers', async ({ page }) => {
    const source = readFileSync('src/lib/motion.ts', 'utf8').split('\n');
    const rows = page.locator('#about .editor__lines li');
    expect(await rows.count()).toBeGreaterThan(3);
    for (const row of await rows.all()) {
      const n = Number(await row.locator('.editor__n').textContent());
      const code = (await row.locator('code').textContent()) ?? '';
      expect(source[n - 1].trim()).toBe(code.trim());
    }
  });

  test('the design view measures the real button', async ({ page }) => {
    const button = page.locator('#about .design-view__button');
    await button.scrollIntoViewIfNeeded();
    // Its own size, not the zoomed-out one on the canvas.
    const size = await button.evaluate((el: HTMLElement) => `${el.offsetWidth} × ${el.offsetHeight}`);
    await expect(page.locator('#about [data-measure]')).toHaveText(size);
    expect(size).toMatch(/× 46$/);
  });

  test('the ticket and the editor have a blinking caret, the design view and the task a mouse', async ({ page }) => {
    await expect(page.locator('#about .ticket .lens__caret')).toHaveCount(1);
    await expect(page.locator('#about .editor__lines .lens__caret')).toHaveCount(1);
    await expect(page.locator('#about .ticket .lens__caret')).toHaveCSS('animation-name', 'lens-blink');
    await expect(page.locator('#about .design-view .lens__pointer')).toHaveCount(1);
    await expect(page.locator('#about .task .lens__pointer')).toHaveCount(1);
  });

  test('the task ends as Finalizado, the one the mouse clicked', async ({ page }) => {
    await expect(page.locator('#about .task__chip--done')).toContainText('Finalizado');
    await expect(page.locator('#about .task__chip--doing')).toContainText('En curso');
  });

  test('the mouse grows the design view button as the card wakes up', async ({ page }) => {
    test.skip(!(await page.evaluate(() => CSS.supports('animation-timeline: view()'))), 'needs scroll timelines');
    const target = page.locator('#about .design-view__target');
    const scale = () => target.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    expect(await scale()).toBeCloseTo(0.8, 1);
    await page.locator('.facet--design').evaluate((el) => {
      const r = el.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top + r.height / 2 - window.innerHeight * 0.3);
    });
    await expect.poll(scale).toBeCloseTo(0.96, 1);
  });

  test('a thumbnail wakes up as its card nears the middle of the window', async ({ page }) => {
    test.skip(!(await page.evaluate(() => CSS.supports('animation-timeline: view()'))), 'needs scroll timelines');
    const card = page.locator('.facet--analysis');
    const thumb = card.locator('.facet__thumb');
    // Below the fold: asleep.
    expect(Number(await thumb.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(0.5);
    // Its centre at the middle of the window: awake.
    await card.evaluate((el) => {
      const r = el.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top + r.height / 2 - window.innerHeight / 2 + 4);
    });
    await expect.poll(() => thumb.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
  });

  test('hover completes a sleeping thumbnail and adds the accent border', async ({ page }) => {
    test.skip(!(await page.evaluate(() => CSS.supports('animation-timeline: view()') && matchMedia('(hover: hover)').matches)), 'needs scroll timelines and a pointer');
    const card = page.locator('.facet--quality');
    // Bring only its top into view, so the scroll progress is still low.
    await card.evaluate((el) => window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.8));
    const thumb = card.locator('.facet__thumb');
    expect(Number(await thumb.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(0.6);
    await card.hover();
    await expect.poll(() => thumb.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
    await expect(page.locator('#about .task__chip--done')).toHaveCSS('opacity', '1');
  });
});

test.describe('Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
  });

  test('lists four jobs with the date on one side and the facets of each', async ({ page }) => {
    const jobs = page.locator('#experience .job');
    await expect(jobs).toHaveCount(4);
    await expect(jobs.nth(0).locator('.job__when')).toHaveText('Sep 2026 – Actualidad');
    await expect(jobs.nth(0).locator('.facet-chip')).toHaveText(['Análisis', 'Diseño', 'Desarrollo', 'Calidad']);
    await expect(jobs.nth(1).locator('.facet-chip')).toHaveText(['Análisis', 'Calidad']);
    await expect(jobs.nth(2).locator('.facet-chip')).toHaveText(['Desarrollo']);
  });

  test('only Guia links its organisation, and the case study is linked', async ({ page }) => {
    const jobs = page.locator('#experience .job');
    await expect(jobs.nth(0).getByRole('link', { name: 'Guia (Desarrollos Guia)' })).toHaveAttribute('href', 'https://desarrollosguia.com/');
    await expect(jobs.nth(1).locator('.job__org a')).toHaveCount(0);
    await expect(jobs.nth(0).getByRole('link', { name: /caso de estudio de Audenpass/ })).toHaveAttribute('href', /\/proyectos\/audenpass\/$/);
  });

  test('shows the receptionist role in the compact format, without bullets', async ({ page }) => {
    const job = page.locator('#experience .job').nth(3);
    await expect(job).toHaveClass(/job--compact/);
    await expect(job.getByRole('heading', { level: 3 })).toHaveText('Recepcionista y administrativa');
    await expect(job.locator('.job__when')).toHaveText('May 2020 – Dic 2024');
    await expect(job.locator('.job__points')).toHaveCount(0);
    await expect(job.locator('.facet-chip')).toHaveCount(0);
  });

  test('is translated in English', async ({ page }) => {
    await page.goto('/portfolio/en/');
    const jobs = page.locator('#experience .job');
    await expect(jobs.nth(0).locator('.job__when')).toHaveText('Sep 2026 – Present');
    await expect(jobs.nth(3).locator('.job__when')).toHaveText('May 2020 – Dec 2024');
    await expect(jobs.nth(0).locator('.facet-chip')).toHaveText(['Analysis', 'Design', 'Development', 'Quality']);
  });
});

test.describe('Work calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
  });

  const wide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 768;

  test('is decorative, with real buttons for the years', async ({ page }) => {
    await expect(page.locator('.cal__body')).toHaveAttribute('aria-hidden', 'true');
    const years = page.getByRole('group', { name: 'Días trabajados' }).getByRole('button');
    test.skip(!wide(page), 'one year at a time is the desktop view');
    await expect(years.last()).toHaveAttribute('aria-pressed', 'true');
    await expect(years.first()).toHaveText('2020');
  });

  test('paints two jobs darker and draws another year on request', async ({ page }) => {
    test.skip(!wide(page), 'one year at a time is the desktop view');
    await expect(page.locator('.cal__view--year [data-d="2026-09-28"]')).toHaveAttribute('data-l', '4');
    await page.getByRole('button', { name: '2023' }).click();
    await expect(page.getByRole('button', { name: '2023' })).toHaveAttribute('aria-pressed', 'true');
    // A Saturday at Diagnóstico Maipú with a commit for Enivel7.
    await expect(page.locator('.cal__view--year [data-d="2023-08-26"]')).toHaveAttribute('data-l', '4');
    await expect(page.locator('.cal__view--year [data-d="2023-08-27"]')).toHaveAttribute('data-l', '2');
  });

  test('shows the job of a day on hover, with the milestone', async ({ page }) => {
    test.skip(!wide(page), 'desktop view');
    const day = page.locator('.cal__view--year [data-d="2026-09-28"]');
    await day.scrollIntoViewIfNeeded();
    await day.hover();
    const tip = page.locator('[data-tip]');
    await expect(tip).toContainText('lun 28 sep 2026');
    await expect(tip).toContainText('SMG · Analista técnico-funcional');
    await expect(tip).toContainText('Guia · Cofundadora y desarrolladora');
    await expect(tip).toContainText('Primer commit de Audenpass');
    await expect(tip).toHaveCSS('opacity', '1');
  });

  test('fits inside its card on any screen, without being cut', async ({ page }) => {
    for (const width of [320, 360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(100);
      const fit = await page.evaluate(() => {
        const card = document.querySelector('[data-calendar]')!.getBoundingClientRect();
        const grid = [...document.querySelectorAll('.cal__view .cal__weeks')].find((el) => (el as HTMLElement).offsetParent)!.getBoundingClientRect();
        return { cardRight: card.right, gridRight: grid.right, page: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      });
      expect(fit.gridRight, `${width}px`).toBeLessThanOrEqual(fit.cardRight);
      expect(fit.page, `${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test('shows the last six months on small screens', async ({ page }) => {
    test.skip(wide(page), 'mobile view');
    await expect(page.locator('.cal__six')).toHaveText('Últimos 6 meses');
    await expect(page.locator('.cal__view--six')).toBeVisible();
    await expect(page.locator('.cal__view--year')).toBeHidden();
  });

  test('the weeks appear with the scroll', async ({ page }) => {
    test.skip(!(await page.evaluate(() => CSS.supports('animation-timeline: view()'))), 'needs scroll timelines');
    const last = page.locator('.cal__view:visible .cal__week').last();
    expect(Number(await last.evaluate((el) => getComputedStyle(el).opacity))).toBe(0);
    await page.locator('[data-calendar]').evaluate((el) => window.scrollTo(0, window.scrollY + el.getBoundingClientRect().bottom - window.innerHeight * 0.4));
    await expect.poll(() => last.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
  });
});

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
  });

  test('shows the client case first and only a few cards until asked', async ({ page }) => {
    const featured = page.locator('[data-featured]');
    await expect(featured.getByRole('heading', { level: 3, name: 'Audenpass' })).toBeVisible();
    await expect(featured).toContainText('Cliente');
    await expect(featured).toContainText('Desarrollado en Guia');
    await expect(featured.locator('.featured__stats li')).toHaveCount(3);
    // Three cards next to the featured case from 1024px, two below.
    const wide = (page.viewportSize()?.width ?? 0) >= 1024;
    await expect(page.locator('[data-card]:visible')).toHaveCount(wide ? 3 : 2);
    await expect(page.locator('.projects__note')).toHaveText('Catálogo actualizado automáticamente desde GitHub.');
  });

  test('«Ver los {n} proyectos» reveals the rest and then goes away', async ({ page }) => {
    const total = await page.locator('[data-card]').count();
    const more = page.getByRole('button', { name: `Ver los ${total + 1} proyectos` });
    await more.click();
    await expect(page.locator('[data-card]:visible')).toHaveCount(total);
    await expect(more).toBeHidden();
  });

  test('the new cards come in one after another and the keyboard lands on the first', async ({ page }) => {
    const total = await page.locator('[data-card]').count();
    const limit = (page.viewportSize()?.width ?? 0) >= 1024 ? 3 : 2;
    await page.getByRole('button', { name: `Ver los ${total + 1} proyectos` }).click();
    const entering = page.locator('[data-card].is-entering');
    await expect(entering).toHaveCount(total - limit);
    await expect(entering.nth(1)).toHaveCSS('animation-delay', '0.04s');
    await expect(page.locator(`[data-card][data-rank="${limit + 1}"] .card__link`)).toBeFocused();
  });

  test('a filter brings its cards in, 30ms apart', async ({ page }) => {
    await page.getByRole('button', { name: 'Juegos' }).click();
    const entering = page.locator('[data-card].is-entering');
    expect(await entering.count()).toBeGreaterThan(1);
    await expect(entering.nth(1)).toHaveCSS('animation-delay', '0.03s');
  });

  test('the featured case notes its E2E suites once the box is in view', async ({ page }) => {
    const note = page.locator('.featured__note');
    await expect(note).toHaveAttribute('aria-hidden', 'true');
    await expect(note).toHaveText('E2E19 suites con Playwright');
    await expect(note).toHaveCSS('opacity', '0');
    await page.locator('.featured__frame').scrollIntoViewIfNeeded();
    await expect(note).toHaveCSS('opacity', '1');
    await expect(page.locator('.featured__handle').first()).toHaveCSS('transform', 'none');
  });

  test('the diagonal arrow of a card leans on hover', async ({ page }) => {
    test.skip(!(await page.evaluate(() => matchMedia('(hover: hover)').matches)), 'needs a pointer');
    const button = page.locator('[data-card]:visible .card__actions a:has(svg.icon-arrow-up-right)').first();
    // The cards move with the scroll: put it in the middle of the window, where it is at rest.
    await button.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(300);
    await button.hover();
    await expect(button.locator('svg')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 2, -2)');
  });

  test('a filter shows every project of that category and no «Ver los» button', async ({ page }) => {
    await page.locator('[data-filter="Web"]').click();
    await expect(page.getByRole('button', { name: /^Ver los \d+ proyectos$/ })).toBeHidden();
    await expect(page.locator('[data-featured]')).toBeVisible();
    const visible = page.locator('[data-card]:visible');
    expect(await visible.count()).toBeGreaterThan(3);
    for (const card of await visible.all()) {
      await expect(card).toHaveAttribute('data-category', 'Web');
    }
    await page.locator('[data-filter="Games"]').click();
    await expect(page.locator('[data-featured]')).toBeHidden();
  });

  test('cards use a stretched title link with labelled icon buttons and no nested links', async ({ page }) => {
    const card = page.locator('[data-card]:visible').first();
    await expect(card.locator('.card__link')).toHaveAttribute('href', /^https?:/);
    for (const button of await card.locator('.icon-btn').all()) {
      await expect(button).toHaveAttribute('aria-label', /\w{3,}/);
    }
    expect(await page.locator('a a').count()).toBe(0);
    expect(await card.locator('.tag--tech').count()).toBeLessThanOrEqual(3);
  });
});

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
  });

  test('turns solid once the page scrolls', async ({ page }) => {
    const header = page.locator('[data-header]');
    await expect(header).not.toHaveClass(/is-scrolled/);
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(header).toHaveClass(/is-scrolled/);
  });

  test('marks the link of the section in view with aria-current', async ({ page }) => {
    await expect(page.locator('[data-section][aria-current]')).toHaveCount(0);
    await page.evaluate(() => document.getElementById('projects')?.scrollIntoView());
    await expect(page.locator('[data-section="projects"]')).toHaveAttribute('aria-current', 'true');
    await expect(page.locator('[data-section][aria-current]')).toHaveCount(1);
  });

  test('changes section when the next one crosses 40% of the window', async ({ page }) => {
    const height = page.viewportSize()?.height ?? 720;
    // Top of Experience just below the 40% line, then just above it.
    const goTo = (offset: number) =>
      page.evaluate(
        ([o, h]) => {
          const top = document.getElementById('experience')!.getBoundingClientRect().top + window.scrollY;
          window.scrollTo(0, top - h * 0.4 + o);
        },
        [offset, height],
      );
    await goTo(-20);
    await expect(page.locator('[data-section="about"]')).toHaveAttribute('aria-current', 'true');
    await goTo(20);
    await expect(page.locator('[data-section="experience"]')).toHaveAttribute('aria-current', 'true');
    await expect(page.locator('[data-section][aria-current]')).toHaveCount(1);
  });

  test('slides one marker under the current link, as wide as the link', async ({ page }) => {
    const marker = page.locator('[data-nav-marker]');
    test.skip(!(await page.locator('[data-section="about"]').isVisible()), 'the marker is desktop only');
    await expect(marker).toHaveCSS('opacity', '0');
    await page.evaluate(() => document.getElementById('experience')?.scrollIntoView());
    await expect(marker).toHaveAttribute('data-shown', '');
    const link = await page.locator('[data-section="experience"]').boundingBox();
    await expect
      .poll(async () => {
        const box = await marker.boundingBox();
        return box && link ? [Math.round(box.x - link.x), Math.round(box.width - link.width)] : null;
      })
      .toEqual([0, 0]);
  });

  test('switches theme without animating the page colours', async ({ page }) => {
    await openMenu(page);
    const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.locator('[data-theme-toggle]').first().click();
    // Right after the click the background already has the new colour.
    const after = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(after).not.toBe(before);
    expect(await page.evaluate(() => getComputedStyle(document.body).transitionDuration)).toBe('0s');
  });

  test('opens and closes the mobile menu with the keyboard', async ({ page }) => {
    const toggle = page.locator('[data-nav-toggle]');
    test.skip(!(await toggle.isVisible()), 'the menu only exists below 1024px');
    const nav = page.locator('#primary-nav');
    await expect(nav).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toBeVisible();
    // The links come in one after another.
    await expect(nav.locator('li').nth(3)).toHaveCSS('transition-delay', /0\.12s|120ms/);
    await expect(nav.locator('li').first()).toHaveCSS('opacity', '1');
    await expect(page.locator('html')).toHaveClass(/menu-open/);
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).toBeHidden();
    await expect(toggle).toBeFocused();
  });
});

test.describe('Hero', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
  });

  test('starts in Design mode with the mode bar as a radiogroup', async ({ page }) => {
    const bar = page.getByRole('radiogroup', { name: 'Ver el titular desde' });
    await expect(bar.getByRole('radio')).toHaveCount(4);
    await expect(bar.getByRole('radio', { name: 'Diseño' })).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[data-hero]')).toHaveAttribute('data-mode', 'design');
  });

  test('changes mode with the arrow keys, wraps around and announces the note', async ({ page }) => {
    const note = page.locator('[data-note]');
    await expect(note).toHaveAttribute('aria-live', 'polite');
    await page.getByRole('radio', { name: 'Diseño' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Desarrollo' })).toBeFocused();
    await expect(page.getByRole('radio', { name: 'Desarrollo' })).toHaveAttribute('aria-checked', 'true');
    await expect(note).toHaveText('class="hero__title"');
    await page.keyboard.press('End');
    await expect(page.getByRole('radio', { name: 'Calidad' })).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Análisis' })).toHaveAttribute('aria-checked', 'true');
    await expect(note).toHaveText('Como cliente, quiero tener mi sitio web, para que más gente me conozca.');
    await page.keyboard.press('Home');
    await expect(page.getByRole('radio', { name: 'Análisis' })).toBeFocused();
  });

  test('keeps a single tab stop on the bar and never changes the headline', async ({ page }) => {
    await page.getByRole('radio', { name: 'Calidad' }).click();
    await expect(page.getByRole('radio', { name: 'Diseño' })).toHaveAttribute('tabindex', '-1');
    await expect(page.getByRole('radio', { name: 'Calidad' })).toHaveAttribute('tabindex', '0');
    await expect(page.getByRole('heading', { level: 1, name: 'Del requerimiento a producción.' })).toBeVisible();
  });

  test('switches mode when a cursor is clicked', async ({ page }) => {
    const cursor = page.locator('[data-cursor="quality"]');
    test.skip(!(await cursor.isVisible()), 'the cursors only show from 1280px');
    await cursor.hover();
    await expect(cursor.locator('.hero__cursor-hand')).toBeVisible();
    await expect(cursor.locator('.hero__cursor-arrow')).toBeHidden();
    await cursor.click();
    await expect(page.locator('[data-hero]')).toHaveAttribute('data-mode', 'quality');
    await expect(page.getByRole('radio', { name: 'Calidad' })).toHaveAttribute('aria-checked', 'true');
  });

  test('slides the active background to the new mode', async ({ page }) => {
    const thumb = page.locator('[data-thumb]');
    const box = async (sel: string) => {
      const b = await page.locator(sel).boundingBox();
      return b && [Math.round(b.x), Math.round(b.width)];
    };
    await expect.poll(() => box('[data-thumb]')).toEqual(await box('.hero__mode[data-mode="design"]'));
    await page.getByRole('radio', { name: 'Calidad' }).click();
    await expect.poll(() => box('[data-thumb]')).toEqual(await box('.hero__mode[data-mode="quality"]'));
    await expect(thumb).toHaveCSS('transition-duration', '0.24s');
  });

  test('cursors lean at most 12px toward the mouse', async ({ page }) => {
    const cursor = page.locator('[data-cursor="design"]');
    test.skip(!(await cursor.isVisible()), 'the cursors only show from 1280px');
    const before = await cursor.boundingBox();
    await page.mouse.move(5, 5);
    await page.mouse.move(10, 700, { steps: 4 });
    await page.waitForTimeout(1200);
    const transform = await cursor.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform));
    expect(Math.hypot(transform.m41, transform.m42)).toBeGreaterThan(2);
    expect(Math.hypot(transform.m41, transform.m42)).toBeLessThanOrEqual(12.5);
    expect(before).not.toBeNull();
  });

  test('each lens shows its piece of work in place of the headline, which stays in the page', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1, name: 'Del requerimiento a producción.' });
    const scenes = { analysis: '.ticket', development: '.editor', quality: '.task' };
    // Design is the headline itself.
    await expect(h1).toHaveCSS('opacity', '1');
    for (const [mode, selector] of Object.entries(scenes)) {
      await page.locator(`.hero__mode[data-mode="${mode}"]`).click();
      const scene = page.locator(`.hero__scene--${mode}`);
      await expect(scene).toHaveAttribute('aria-hidden', 'true');
      await expect(scene).toHaveCSS('visibility', 'visible');
      await expect(scene.locator(selector)).toBeVisible();
      // The headline fades out but keeps its place and its text: nothing moves and a screen reader still reads it.
      await expect(h1).toHaveCSS('opacity', '0');
      await expect(h1).toContainText('producción.');
    }
    await page.locator('.hero__mode[data-mode="design"]').click();
    await expect(h1).toHaveCSS('opacity', '1');
    await expect(page.locator('.hero__scene--quality')).toHaveCSS('visibility', 'hidden');
  });

  test('the ticket and the task show the headline being typed, and the editor its real line', async ({ page }) => {
    for (const [mode, scene] of [['analysis', '.ticket'], ['quality', '.task']]) {
      await page.locator(`.hero__mode[data-mode="${mode}"]`).click();
      const typed = page.locator(`.hero__scene--${mode} ${scene} [data-typed]`);
      // It starts empty and is typed letter by letter, with the caret after it.
      await expect(typed).not.toHaveText('Del requerimiento a producción.');
      await expect(typed).toHaveText('Del requerimiento a producción.', { timeout: 4000 });
      await expect(page.locator(`.hero__scene--${mode} ${scene} .lens__caret`).first()).toBeAttached();
    }
    await page.locator('.hero__mode[data-mode="development"]').click();
    const line = page.locator('.hero__scene--development .editor__headline');
    // The real line of src/i18n/ui.ts, with the caret right after «producción.».
    await expect(line).toContainText("title: { lead: 'Del requerimiento', connector: 'a', accent: 'producción.");
    await expect(line.locator('.lens__caret')).toHaveCount(1);
    expect(await line.evaluate((el) => el.innerHTML.indexOf('lens__caret') > el.innerHTML.indexOf('producci'))).toBe(true);
    // The criteria of the task are about the headline.
    await expect(page.locator('.hero__scene--quality .lens__checks')).toContainText('El titular dice «Del requerimiento a producción.»');
    await expect(page.locator('.hero__scene--quality .lens__checks')).toContainText('Un lector de pantalla lo lee completo');
  });

  test('the selection box only stays around the headline in Design mode', async ({ page }) => {
    const box = page.locator('[data-box]');
    const transparent = 'rgba(0, 0, 0, 0)';
    for (const mode of ['analysis', 'development', 'quality']) {
      await page.locator(`.hero__mode[data-mode="${mode}"]`).click();
      await expect(box).toHaveCSS('border-top-color', transparent);
    }
    await page.locator('.hero__mode[data-mode="design"]').click();
    await expect(box).not.toHaveCSS('border-top-color', transparent);
  });

  test('each scene takes the space of the Design mode, annotation and box, and the annotation is not shown', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, 'the annotation floats above the box from 1024px');
    const area = async () => {
      const a = await page.locator('.hero__annot').boundingBox();
      const b = await page.locator('[data-box]').boundingBox();
      return { top: Math.round(a!.y), bottom: Math.round(b!.y + b!.height) };
    };
    const design = await area();
    for (const mode of ['analysis', 'development', 'quality']) {
      await page.locator(`.hero__mode[data-mode="${mode}"]`).click();
      const scene = await page.locator(`.hero__scene--${mode}`).boundingBox();
      expect(Math.abs(Math.round(scene!.y) - design.top)).toBeLessThanOrEqual(3);
      expect(Math.abs(Math.round(scene!.y + scene!.height) - design.bottom)).toBeLessThanOrEqual(3);
      await expect(page.locator('.hero__annot')).toHaveCSS('opacity', '0');
      // Still there for screen readers: the live region says what changed.
      await expect(page.locator('[data-note]')).toHaveAttribute('aria-live', 'polite');
      await expect(page.locator('[data-note]')).not.toHaveText('');
    }
  });

  test('the box keeps its size when the mode changes', async ({ page }) => {
    const box = page.locator('[data-box]');
    const size = async () => box.evaluate((el) => `${el.offsetWidth}x${el.offsetHeight}`);
    const before = await size();
    for (const mode of ['analysis', 'development', 'quality', 'design']) {
      await page.locator(`.hero__mode[data-mode="${mode}"]`).click();
      expect(await size()).toBe(before);
    }
  });

  test('hides the cursors below 1280px so they never cover the text', async ({ page }) => {
    await page.setViewportSize({ width: 1180, height: 820 });
    await expect(page.locator('.hero__cursors')).toBeHidden();
    await page.setViewportSize({ width: 820, height: 733 });
    await expect(page.locator('.hero__cursors')).toBeHidden();
  });

  test('links to Projects and Contact', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Ver proyectos' })).toHaveAttribute('href', '#projects');
    await expect(page.getByRole('link', { name: 'Escribime' })).toHaveAttribute('href', '#contact');
  });
});

test.describe('Contact and footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
  });

  test('has the title with a full stop, direct links and the form in a card', async ({ page }) => {
    const contact = page.locator('#contact');
    await expect(contact.getByRole('heading', { level: 2, name: 'Hablemos.' })).toBeVisible();
    await expect(contact.getByRole('link', { name: 'florenciamorelliIT@gmail.com' })).toHaveAttribute('href', 'mailto:florenciamorelliIT@gmail.com');
    await expect(contact.getByRole('link', { name: 'linkedin.com/in/florenciamorelli' })).toHaveAttribute('href', /linkedin\.com\/in\/florenciamorelli/);
    await expect(contact.getByRole('link', { name: 'github.com/FlorenciaMorelli' })).toHaveAttribute('href', 'https://github.com/FlorenciaMorelli');
    await expect(contact.locator('form')).toHaveAttribute('action', 'https://formsubmit.co/florenciamorelliIT@gmail.com');
  });

  test('labels every field and keeps the form fields required', async ({ page }) => {
    const form = page.locator('#contact form');
    for (const name of ['Nombre', 'Email', 'Mensaje']) {
      await expect(form.getByLabel(name)).toBeVisible();
      await expect(form.getByLabel(name)).toHaveAttribute('required', '');
    }
    await expect(form.getByRole('button', { name: 'Enviar' })).toBeVisible();
  });

  test('has a footer with the logo, the rights and labelled social links, without the Astro credit', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toContainText('Florencia Morelli');
    await expect(footer).toContainText('Todos los derechos reservados.');
    await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/FlorenciaMorelli');
    await expect(footer.getByRole('link', { name: 'LinkedIn' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Volver arriba' })).toHaveAttribute('href', '#top');
    await expect(footer).not.toContainText('Astro');
    await expect(footer).toContainText('Buenos Aires, Argentina');
  });

  test('shows the English version of the title', async ({ page }) => {
    await page.goto('/portfolio/en/');
    await expect(page.locator('#contact').getByRole('heading', { level: 2, name: "Let's talk." })).toBeVisible();
    await expect(page.locator('footer')).toContainText('All rights reserved.');
  });
});

// Interactive states from the Components page: hover, active, focus and disabled.
test.describe('Contact form', () => {
  // Never sends anything to formsubmit: the background request is answered here.
  const answer = (page: Page, body: object, status = 200, delay = 600) =>
    page.route('https://formsubmit.co/ajax/**', async (route) => {
      await new Promise((r) => setTimeout(r, delay));
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    });

  const fill = async (page: Page) => {
    const form = page.locator('[data-contact-form]');
    await form.getByLabel('Nombre').fill('Prueba');
    await form.getByLabel('Email').fill('prueba@example.com');
    await form.getByLabel('Mensaje').fill('Mensaje de prueba');
    return form;
  };

  test('shows Enviando and then Enviado, and announces both', async ({ page }) => {
    await answer(page, { success: 'true' });
    await page.goto('/portfolio/');
    const form = await fill(page);
    const button = form.locator('button[type="submit"]');
    await button.click();
    await expect(form).toHaveAttribute('data-state', 'sending');
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toContainText('Enviando');
    await expect(form.locator('[data-status-text]')).toHaveText('Enviando');
    await expect(form).toHaveAttribute('data-state', 'sent');
    await expect(button).toContainText('Enviado');
    await expect(form.locator('[data-status-text]')).toHaveText('Enviado');
    await expect(form.locator('.contact__send-check')).toHaveCSS('opacity', '1');
    await expect(form.getByLabel('Nombre')).toHaveValue('');
  });

  test('shows the error with an icon, a strong border and the email', async ({ page }) => {
    await answer(page, { success: 'false' }, 500, 0);
    await page.goto('/portfolio/');
    const form = await fill(page);
    await form.locator('button[type="submit"]').click();
    await expect(form).toHaveAttribute('data-state', 'error');
    const error = form.locator('.contact__status-error');
    await expect(error).toBeVisible();
    await expect(error).toContainText('No se pudo enviar. Probá de nuevo o escribime a');
    await expect(error.getByRole('link')).toHaveAttribute('href', /^mailto:/);
    await expect(error).toHaveCSS('border-top-width', '2px');
    await expect(form.locator('[data-status]')).toHaveAttribute('aria-live', 'polite');
  });
});

test.describe('Footer canvas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
  });

  test('labels the selection box with its real size, once in view', async ({ page }) => {
    const box = page.locator('[data-footer-box]');
    const label = page.locator('.site-footer__label');
    await expect(label).toHaveAttribute('aria-hidden', 'true');
    await expect(label).toHaveCSS('opacity', '0');
    await box.scrollIntoViewIfNeeded();
    const size = await box.evaluate((el: HTMLElement) => `${el.offsetWidth} × ${el.offsetHeight}`);
    await expect(label).toHaveText(`footer · ${size}`);
    await expect(label).toHaveCSS('opacity', '1');
    await expect(page.locator('.site-footer__handle').first()).toHaveCSS('transform', 'none');
  });

  test('has a decorative cursor per lens at the corners, only on wide screens', async ({ page }) => {
    const cursors = page.locator('.site-footer__cursors');
    await expect(cursors).toHaveAttribute('aria-hidden', 'true');
    const wide = (page.viewportSize()?.width ?? 0) >= 1280;
    if (wide) await expect(cursors.locator('[data-footer-cursor]')).toHaveCount(4);
    await expect(cursors).toBeVisible({ visible: wide });
  });

  test('back to top: the arrow rises on hover and the page goes up', async ({ page }) => {
    const top = page.getByRole('link', { name: 'Volver arriba' });
    await top.scrollIntoViewIfNeeded();
    if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
      await top.hover();
      await expect(top.locator('svg')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -2)');
    }
    await top.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  });
});

test.describe('Navigation to the case', () => {
  test('the screenshot pair has the same view-transition-name on the home and on the case', async ({ page }) => {
    await page.goto('/portfolio/');
    const home = await page.locator('.featured__shots').evaluate((el) => getComputedStyle(el).getPropertyValue('view-transition-name'));
    await page.goto('/portfolio/proyectos/audenpass/');
    const caseName = await page.locator('.pair--cover').evaluate((el) => getComputedStyle(el).getPropertyValue('view-transition-name'));
    expect([home, caseName]).toEqual(['pair', 'pair']);
    // Names must be unique on a page: no other element carries it.
    expect(await page.locator('.pair').evaluateAll((els) => els.filter((el) => getComputedStyle(el).viewTransitionName === 'pair').length)).toBe(1);
  });

  test('navigates as usual with the normal focus order', async ({ page }) => {
    await page.goto('/portfolio/');
    await page.getByRole('link', { name: 'Ver caso de estudio' }).click();
    await expect(page).toHaveURL(/\/proyectos\/audenpass\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Audenpass');
    // The page scripts start as in any navigation: the header marker and the theme toggle work.
    await expect(page.locator('[data-header]')).toBeAttached();
    await expect(page.locator('.pair--cover')).toBeVisible();
  });
});

test.describe('Navigation with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('does not opt in to view transitions', async ({ page }) => {
    await page.goto('/portfolio/');
    const rule = await page.evaluate(() => [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => r.cssText.startsWith('@view-transition')); } catch { return false; } }));
    expect(rule).toBe(false);
  });
});

test.describe('Cursors travelling the page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
    test.skip(!(await page.locator('[data-cursor="analysis"]').isVisible()), 'the cursors only show from 1280px');
  });

  test('they start in the hero with their lens name and leave it with the name of their section', async ({ page }) => {
    const cursor = page.locator('[data-cursor="analysis"]');
    await expect(cursor.locator('.hero__cursor-label')).toHaveText('Análisis');
    await expect(cursor).not.toHaveClass(/is-away/);
    await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
    await expect(cursor).toHaveClass(/is-away/);
    await expect(cursor.locator('.hero__cursor-label')).toHaveText('Sobre mí');
    await expect(page.locator('[data-cursor="design"] .hero__cursor-label')).toHaveText('Proyectos');
    await expect(page.locator('[data-cursor="development"] .hero__cursor-label')).toHaveText('Experiencia');
    await expect(page.locator('[data-cursor="quality"] .hero__cursor-label')).toHaveText('Contacto');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(cursor.locator('.hero__cursor-label')).toHaveText('Análisis');
  });

  test('each one goes to the title of its section and clicks it', async ({ page }) => {
    const pairs = [['analysis', 'Sobre mí'], ['development', 'Experiencia'], ['design', 'Proyectos'], ['quality', 'Hablemos.']];
    for (const [lens, text] of pairs) {
      const title = page.locator(`[data-lens-title="${lens}"]`);
      await title.evaluate((el) => window.scrollTo({ top: (el as HTMLElement).getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4, behavior: 'instant' }));
      await expect(title).toHaveText(text);
      const cursor = page.locator(`[data-cursor="${lens}"]`);
      // It arrives, presses (the arrow shrinks, a ring spreads), releases and only then the title is selected.
      await expect(cursor).toHaveClass(/is-press/);
      await expect(title).not.toHaveAttribute('data-selected', '');
      await expect(title).toHaveAttribute('data-selected', '');
      await expect(cursor).toHaveClass(/is-click/);
      await expect(cursor).not.toHaveClass(/is-press/);
      const [c, t] = await Promise.all([cursor.boundingBox(), title.boundingBox()]);
      // The tip of the arrow is inside the title.
      expect(c!.x).toBeGreaterThan(t!.x - 4);
      expect(c!.x).toBeLessThan(t!.x + t!.width);
      expect(c!.y).toBeGreaterThan(t!.y - 6);
      expect(c!.y).toBeLessThan(t!.y + t!.height);
    }
  });

  test('they are decorative and never take the mouse once they have left', async ({ page }) => {
    await expect(page.locator('.hero__cursors')).toHaveAttribute('aria-hidden', 'true');
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
    await expect(page.locator('[data-cursor="design"]')).toHaveCSS('pointer-events', 'none');
  });
});

test.describe('Cursors travelling with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  test('stay in the hero', async ({ page }) => {
    await page.goto('/portfolio/');
    test.skip(!(await page.locator('[data-cursor="analysis"]').isVisible()), 'the cursors only show from 1280px');
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
    await expect(page.locator('[data-cursor="analysis"]')).not.toHaveClass(/is-journey|is-away/);
    await expect(page.locator('[data-cursor="analysis"] .hero__cursor-label')).toHaveText('Análisis');
  });
});

test.describe('Depth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
    test.skip(!(await page.evaluate(() => CSS.supports('animation-timeline: view()'))), 'needs scroll timelines');
  });

  test('the hero recedes as the page scrolls and the blocks come toward you', async ({ page }) => {
    const hero = page.locator('.hero__inner');
    expect(Number(await hero.evaluate((el) => getComputedStyle(el).opacity))).toBe(1);
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }));
    await expect.poll(() => hero.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(0.5);
    // A block that is still below the window has not come yet.
    const job = page.locator('#experience .job').last();
    expect(Number(await job.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(0.1);
    await job.evaluate((el) => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.4, behavior: 'instant' }));
    await expect.poll(() => job.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
    await expect(job).toHaveCSS('transform', 'none');
  });
});

test.describe('Depth with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  test('has no scroll animation', async ({ page }) => {
    await page.goto('/portfolio/');
    await expect(page.locator('.hero__inner')).toHaveCSS('animation-name', 'none');
    await expect(page.locator('#experience .job').first()).toHaveCSS('animation-name', 'none');
  });
});

test.describe('Lenses by section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
  });

  test('the header marker takes the colour of the lens of the section in view', async ({ page }) => {
    test.skip(!(await page.locator('[data-section="about"]').isVisible()), 'the marker is desktop only');
    const colour = async (id: string) => {
      await page.evaluate((i) => document.getElementById(i)?.scrollIntoView({ behavior: 'instant' }), id);
      await expect(page.locator(`[data-section="${id}"]`)).toHaveAttribute('aria-current', 'true');
      return page.locator('[data-nav-marker]').evaluate((el) => getComputedStyle(el).backgroundColor);
    };
    const colours = [await colour('about'), await colour('experience'), await colour('projects')];
    expect(new Set(colours).size).toBe(3);
  });
});

test.describe('States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
  });

  const style = (page: Page, selector: string, prop: string) =>
    page.locator(selector).first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

  test('the primary button gets the accent glow on hover and loses it when pressed', async ({ page }) => {
    const button = page.locator('.hero__actions .btn--primary');
    await button.scrollIntoViewIfNeeded();
    expect(await style(page, '.hero__actions .btn--primary', 'box-shadow')).toBe('none');
    await button.hover();
    await expect.poll(() => style(page, '.hero__actions .btn--primary', 'box-shadow')).not.toBe('none');
    await page.mouse.down();
    await expect.poll(() => style(page, '.hero__actions .btn--primary', 'box-shadow')).toBe('none');
    // Pressed, it sinks 1px.
    await expect.poll(() => style(page, '.hero__actions .btn--primary', 'transform')).toBe('matrix(1, 0, 0, 1, 0, 1)');
    await page.mouse.up();
  });

  test('an underlined link thickens its line on hover', async ({ page }) => {
    const link = page.locator('.contact__links a').first();
    await link.scrollIntoViewIfNeeded();
    expect(await style(page, '.contact__links a', 'text-decoration-thickness')).toBe('1px');
    await link.hover();
    await expect.poll(() => style(page, '.contact__links a', 'text-decoration-thickness')).toBe('2px');
  });

  test('the secondary button fills on hover', async ({ page }) => {
    const rest = await style(page, '.hero__actions .btn--secondary', 'background-color');
    await page.locator('.hero__actions .btn--secondary').hover();
    await expect.poll(() => style(page, '.hero__actions .btn--secondary', 'background-color')).not.toBe(rest);
  });

  test('a disabled button is flat, muted and not clickable-looking', async ({ page }) => {
    await page.locator('#contact button[type=submit]').evaluate((el) => ((el as HTMLButtonElement).disabled = true));
    expect(await style(page, '#contact button[type=submit]', 'cursor')).toBe('not-allowed');
    expect(await style(page, '#contact button[type=submit]', 'box-shadow')).toBe('none');
    await page.locator('#contact button[type=submit]').hover({ force: true });
    expect(await style(page, '#contact button[type=submit]', 'box-shadow')).toBe('none');
  });

  test('the pressed filter is filled with the accent and the others are not', async ({ page }) => {
    const all = await style(page, '[data-filter="All"]', 'background-color');
    const web = await style(page, '[data-filter="Web"]', 'background-color');
    expect(all).not.toBe(web);
    await page.locator('[data-filter="Web"]').click();
    await expect.poll(() => style(page, '[data-filter="Web"]', 'background-color')).toBe(all);
  });

  test('keyboard focus draws a visible ring on links, buttons and fields', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const ring = await page.evaluate(() => {
      const s = getComputedStyle(document.activeElement as Element);
      return { style: s.outlineStyle, width: s.outlineWidth };
    });
    expect(ring).toEqual({ style: 'solid', width: '2px' });

    const field = page.locator('#contact input[name=name]');
    await field.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(field).toBeFocused();
    const accent = await page.evaluate(() => {
      const probe = document.createElement('i');
      probe.style.color = 'var(--accent)';
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    await expect.poll(() => field.evaluate((el) => getComputedStyle(el).borderTopColor)).toBe(accent);
    expect(await field.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  });

  test('a disabled field and its label are muted', async ({ page }) => {
    await page.locator('#contact input[name=name]').evaluate((el) => ((el as HTMLInputElement).disabled = true));
    expect(await style(page, '#contact input[name=name]', 'cursor')).toBe('not-allowed');
    const label = await page.locator('#contact .field').first().locator('span').evaluate((el) => getComputedStyle(el).color);
    const text = await page.locator('#contact .field').nth(1).locator('span').evaluate((el) => getComputedStyle(el).color);
    expect(label).not.toBe(text);
  });
});

// Every .reveal element must already be in its final place, without scrolling to it.
async function expectRevealsSettled(page: Page) {
  const states = await page.locator('.reveal').evaluateAll((els) =>
    els.map((el) => {
      const cs = getComputedStyle(el);
      return `${cs.opacity} ${cs.transform}`;
    }),
  );
  expect(states.length).toBeGreaterThan(0);
  expect(new Set(states)).toEqual(new Set(['1 none']));
}

test.describe('Motion', () => {
  test('reveals a block once, when it scrolls into view', async ({ page }) => {
    await page.goto('/portfolio/');
    const job = page.locator('#experience .job').first();
    await expect(job).not.toHaveClass(/is-visible/);
    await job.scrollIntoViewIfNeeded();
    await expect(job).toHaveClass(/is-visible/);
    await expect(job).toHaveCSS('opacity', '1');
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(job).toHaveClass(/is-visible/);
  });
});

test.describe('Reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('shows every revealed block in its final state', async ({ page }) => {
    await page.goto('/portfolio/');
    await expectRevealsSettled(page);
    await page.goto('/portfolio/proyectos/audenpass/');
    await expectRevealsSettled(page);
  });

  test('moves the section marker without sliding', async ({ page }) => {
    await page.goto('/portfolio/');
    test.skip(!(await page.locator('[data-section="about"]').isVisible()), 'the marker is desktop only');
    await page.evaluate(() => document.getElementById('projects')?.scrollIntoView());
    await expect(page.locator('[data-nav-marker]')).toHaveCSS('transition-duration', /^1e-05s/);
  });

  test('keeps the hero cursors still', async ({ page }) => {
    await page.goto('/portfolio/');
    const cursor = page.locator('[data-cursor="design"]');
    test.skip(!(await cursor.isVisible()), 'the cursors only show from 1280px');
    await page.mouse.move(10, 700, { steps: 4 });
    await page.waitForTimeout(400);
    await expect(cursor).toHaveCSS('transform', 'none');
    await expect(cursor.locator('.hero__cursor-float')).toHaveCSS('translate', 'none');
  });

  for (const theme of ['light', 'dark']) {
    test(`the complete thumbnails pass AA in the ${theme} theme`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
      await page.goto('/portfolio/');
      const results = await new AxeBuilder({ page }).include('.facets').withTags(['wcag2a', 'wcag2aa']).analyze();
      expect(results.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([]);
    });
  }

  test('stops the carets from blinking', async ({ page }) => {
    await page.goto('/portfolio/');
    await expect(page.locator('#about .ticket .lens__caret')).toHaveCSS('animation-name', 'none');
  });

  test('shows the How I work thumbnails complete', async ({ page }) => {
    await page.goto('/portfolio/');
    for (const thumb of await page.locator('.facet__thumb').all()) {
      await expect(thumb).toHaveCSS('opacity', '1');
      await expect(thumb).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    }
    await expect(page.locator('#about .task__chip--done')).toHaveCSS('opacity', '1');
    await expect(page.locator('#about .task__chip').first()).toHaveCSS('opacity', '0');
  });

  test('shows the work calendar complete', async ({ page }) => {
    await page.goto('/portfolio/');
    const weeks = page.locator('.cal__view:visible .cal__week');
    await expect(weeks.first()).toHaveCSS('opacity', '1');
    await expect(weeks.last()).toHaveCSS('opacity', '1');
  });

  test('shows the footer label and handles in place', async ({ page }) => {
    await page.goto('/portfolio/');
    await expect(page.locator('.site-footer__label')).toHaveCSS('opacity', '1');
    await expect(page.locator('.site-footer__handle').first()).toHaveCSS('transform', 'none');
  });

  test('shows the featured case note and handles in place', async ({ page }) => {
    await page.goto('/portfolio/');
    await expect(page.locator('.featured__note')).toHaveCSS('opacity', '1');
    await expect(page.locator('.featured__handle').first()).toHaveCSS('transform', 'none');
  });

  test('shows filtered cards without an entrance', async ({ page }) => {
    await page.goto('/portfolio/');
    await page.getByRole('button', { name: 'Juegos' }).click();
    await expect(page.locator('[data-card]:visible').first()).toHaveCSS('animation-name', 'none');
  });

  test('sends the form without the pulse', async ({ page }) => {
    await page.route('https://formsubmit.co/ajax/**', async (route) => {
      await new Promise((r) => setTimeout(r, 800));
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' });
    });
    await page.goto('/portfolio/');
    const form = page.locator('[data-contact-form]');
    await form.getByLabel('Nombre').fill('Prueba');
    await form.getByLabel('Email').fill('prueba@example.com');
    await form.getByLabel('Mensaje').fill('Mensaje de prueba');
    await form.locator('button[type="submit"]').click();
    await expect(form).toHaveAttribute('data-state', 'sending');
    await expect(form.locator('.contact__send-dots span').first()).toHaveCSS('animation-name', 'none');
  });

  test('keeps the scroll-linked progress at its end', async ({ page }) => {
    await page.goto('/portfolio/');
    expect(await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--p').trim())).toBe('1');
  });

  test('the pressed primary button only changes colour', async ({ page }) => {
    await page.goto('/portfolio/');
    const button = page.locator('.hero__actions .btn--primary');
    await button.hover();
    await page.mouse.down();
    await expect(button).toHaveCSS('box-shadow', 'none');
    await expect(button).toHaveCSS('transform', 'none');
    await page.mouse.up();
  });
});

test.describe('Without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows every revealed block in its final state', async ({ page }) => {
    await page.goto('/portfolio/');
    await expectRevealsSettled(page);
  });

  test('keeps the plain form post', async ({ page }) => {
    await page.goto('/portfolio/');
    const form = page.locator('[data-contact-form]');
    await expect(form).toHaveAttribute('action', /^https:\/\/formsubmit\.co\/[^/]+@/);
    await expect(form).toHaveAttribute('method', 'POST');
  });

  test('shows the featured case note', async ({ page }) => {
    await page.goto('/portfolio/');
    await expect(page.locator('.featured__note')).toHaveCSS('opacity', '1');
  });

  test('shows this year in the work calendar, complete and without year buttons', async ({ page }) => {
    await page.goto('/portfolio/');
    await expect(page.locator('.cal__years')).toBeHidden();
    await expect(page.locator('.cal__view:visible .cal__week').last()).toHaveCSS('opacity', '1');
  });

  test('shows the How I work thumbnails complete', async ({ page }) => {
    await page.goto('/portfolio/');
    for (const thumb of await page.locator('.facet__thumb').all()) await expect(thumb).toHaveCSS('opacity', '1');
    await expect(page.locator('#about .ticket .lens__tick').last()).toHaveCSS('opacity', '1');
  });
});

test.describe('Hero scenes with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  test('the scene is complete at once', async ({ page }) => {
    await page.goto('/portfolio/');
    await page.locator('.hero__mode[data-mode="quality"]').click();
    await expect(page.locator('.hero__scene--quality')).toHaveCSS('animation-name', 'none');
    await expect(page.locator('.hero__scene--quality .task__chip--done')).toHaveCSS('opacity', '1');
    // Not typed: the whole headline is there at once.
    await expect(page.locator('.hero__scene--quality [data-typed]')).toHaveText('Del requerimiento a producción.');
  });
});

test.describe('Hero without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('stays in Design mode and hides the mode bar', async ({ page }) => {
    await page.goto('/portfolio/');
    await expect(page.getByRole('heading', { level: 1, name: 'Del requerimiento a producción.' })).toBeVisible();
    await expect(page.locator('[data-hero]')).toHaveAttribute('data-mode', 'design');
    await expect(page.getByRole('radiogroup')).toBeHidden();
  });
});

test.describe('English home', () => {
  test('renders translated navigation', async ({ page }) => {
    await page.goto('/portfolio/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await openMenu(page);
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
  });
});
