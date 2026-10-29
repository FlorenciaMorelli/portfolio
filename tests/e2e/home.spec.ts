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
    await expect(page.locator('.task')).toContainText(`Pruebas unitarias en verde (${stats.passed} de ${stats.total})`);
  });

  test('the editor shows real lines of src/lib/motion.ts with their numbers', async ({ page }) => {
    const source = readFileSync('src/lib/motion.ts', 'utf8').split('\n');
    const rows = page.locator('.editor__lines li');
    expect(await rows.count()).toBeGreaterThan(3);
    for (const row of await rows.all()) {
      const n = Number(await row.locator('.editor__n').textContent());
      const code = (await row.locator('code').textContent()) ?? '';
      expect(source[n - 1].trim()).toBe(code.trim());
    }
  });

  test('the design view measures the real button', async ({ page }) => {
    const button = page.locator('.design-view__button');
    await button.scrollIntoViewIfNeeded();
    // Its own size, not the zoomed-out one on the canvas.
    const size = await button.evaluate((el: HTMLElement) => `${el.offsetWidth} × ${el.offsetHeight}`);
    await expect(page.locator('[data-measure]')).toHaveText(size);
    expect(size).toMatch(/× 46$/);
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
    await expect(page.locator('.task__chip--done')).toHaveCSS('opacity', '1');
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
  });

  test('shows the English version of the title', async ({ page }) => {
    await page.goto('/portfolio/en/');
    await expect(page.locator('#contact').getByRole('heading', { level: 2, name: "Let's talk." })).toBeVisible();
    await expect(page.locator('footer')).toContainText('All rights reserved.');
  });
});

// Interactive states from the Components page: hover, active, focus and disabled.
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

  test('shows the How I work thumbnails complete', async ({ page }) => {
    await page.goto('/portfolio/');
    for (const thumb of await page.locator('.facet__thumb').all()) {
      await expect(thumb).toHaveCSS('opacity', '1');
      await expect(thumb).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    }
    await expect(page.locator('.task__chip--done')).toHaveCSS('opacity', '1');
    await expect(page.locator('.task__chip').first()).toHaveCSS('opacity', '0');
  });

  test('shows the work calendar complete', async ({ page }) => {
    await page.goto('/portfolio/');
    const weeks = page.locator('.cal__view:visible .cal__week');
    await expect(weeks.first()).toHaveCSS('opacity', '1');
    await expect(weeks.last()).toHaveCSS('opacity', '1');
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
    await expect(page.locator('.ticket .lens__tick').last()).toHaveCSS('opacity', '1');
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
