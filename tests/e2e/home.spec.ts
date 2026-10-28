import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

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

  test('has no critical accessibility violations', async ({ page }) => {
    // The hero cursors are decorative copies of the mode bar and inactive ones sit at 35%
    // opacity by design (DESIGN.md, Contraste), so they are left out of the contrast check.
    const results = await new AxeBuilder({ page })
      .exclude('.hero__cursors')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const serious = results.violations.filter((v) =>
      ['critical', 'serious'].includes(v.impact ?? ''),
    );
    expect(serious).toEqual([]);
  });
});

test.describe('About', () => {
  test('shows the photo, the four facets and the technologies by group', async ({ page }) => {
    await page.goto('/portfolio/');
    const about = page.locator('#about');
    const photo = about.getByRole('img', { name: 'Florencia Morelli' });
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

test.describe('Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
  });

  test('lists four jobs with date and mode on one side and the facets of each', async ({ page }) => {
    const jobs = page.locator('#experience .job');
    await expect(jobs).toHaveCount(4);
    await expect(jobs.nth(0).locator('.job__when')).toContainText('Sep 2026');
    await expect(jobs.nth(0).locator('.job__when')).toContainText('Remoto');
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
    await expect(job.locator('.job__points')).toHaveCount(0);
    await expect(job.locator('.facet-chip')).toHaveCount(0);
  });

  test('is translated in English', async ({ page }) => {
    await page.goto('/portfolio/en/');
    const jobs = page.locator('#experience .job');
    await expect(jobs.nth(0).locator('.job__when')).toContainText('Remote');
    await expect(jobs.nth(0).locator('.facet-chip')).toHaveText(['Analysis', 'Design', 'Development', 'Quality']);
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
  });

  test('«Ver los {n} proyectos» reveals the rest and then goes away', async ({ page }) => {
    const total = await page.locator('[data-card]').count();
    const more = page.getByRole('button', { name: `Ver los ${total + 1} proyectos` });
    await more.click();
    await expect(page.locator('[data-card]:visible')).toHaveCount(total);
    await expect(more).toBeHidden();
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

  test('opens and closes the mobile menu with the keyboard', async ({ page }) => {
    const toggle = page.locator('[data-nav-toggle]');
    test.skip(!(await toggle.isVisible()), 'the menu only exists below 1024px');
    const nav = page.locator('#primary-nav');
    await expect(nav).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toBeVisible();
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
    test.skip(!(await cursor.isVisible()), 'the cursors only show from 1024px');
    await cursor.hover();
    await expect(cursor.locator('.hero__cursor-hand')).toBeVisible();
    await expect(cursor.locator('.hero__cursor-arrow')).toBeHidden();
    await cursor.click();
    await expect(page.locator('[data-hero]')).toHaveAttribute('data-mode', 'quality');
    await expect(page.getByRole('radio', { name: 'Calidad' })).toHaveAttribute('aria-checked', 'true');
  });

  test('links to Projects and Contact', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Ver proyectos' })).toHaveAttribute('href', '#projects');
    await expect(page.getByRole('link', { name: 'Escribime' })).toHaveAttribute('href', '#contact');
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
