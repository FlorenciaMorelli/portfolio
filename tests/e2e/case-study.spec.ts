import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Audenpass case study', () => {
  test('is linked from its project card', async ({ page }) => {
    await page.goto('/portfolio/');
    await page.getByRole('link', { name: 'Ver caso de estudio' }).click();
    await expect(page).toHaveURL(/\/portfolio\/proyectos\/audenpass\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Audenpass');
  });

  test('shows a breadcrumb, the client tag and the fact sheet', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    const crumbs = page.getByRole('navigation', { name: 'Ruta de navegación' });
    await expect(crumbs.getByRole('link', { name: 'Proyectos' })).toHaveAttribute('href', /\/#projects$/);
    await expect(crumbs.locator('[aria-current="page"]')).toHaveText('Audenpass');
    await expect(page.locator('.case__meta')).toContainText('Cliente');
    await expect(page.locator('.case__meta')).toContainText('Desarrollado en Guia');
    await expect(page.locator('.case__facts div')).toHaveCount(4);
    await expect(page.locator('.stats li')).toHaveCount(4);
  });

  test('numbers the decisions, lists what it includes and ends without a contact section', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    await expect(page.locator('.decision__num')).toHaveText(['01', '02', '03']);
    expect(await page.locator('.checks li').count()).toBeGreaterThan(3);
    await expect(page.locator('#contact')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Ver todos los proyectos' })).toHaveAttribute('href', /\/#projects$/);
    await expect(page.getByRole('link', { name: 'Ver sitio' })).toHaveAttribute('href', 'https://audenpass.com');
  });

  test('is translated in English', async ({ page }) => {
    await page.goto('/portfolio/en/projects/audenpass/');
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
    await expect(page.locator('.case__meta')).toContainText('Client');
    await expect(page.locator('.case__meta')).toContainText('Built at Guia');
  });

  test('switches to the English version of the same page', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    // On small screens the switch lives inside the collapsed menu.
    const menu = page.locator('[data-nav-toggle]');
    if (await menu.isVisible()) await menu.click();
    await page.locator('[data-lang-switch]:visible').first().click();
    await expect(page).toHaveURL(/\/portfolio\/en\/projects\/audenpass\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('gives every screenshot an alt text', async ({ page }) => {
    await page.goto('/portfolio/en/projects/audenpass/');
    for (const img of await page.locator('main img').all()) {
      await expect(img).toHaveAttribute('alt', /\w{3,}/);
    }
  });

  // Scoped to the page's own content: the shared header and footer are covered by the
  // home suite.
  test('has no critical accessibility violations', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const serious = results.violations.filter((v) =>
      ['critical', 'serious'].includes(v.impact ?? ''),
    );
    expect(serious).toEqual([]);
  });
});

// The number of the «n de n» counter that is showing.
const counter = (page: import('@playwright/test').Page) =>
  page.locator('.criteria__n > *').evaluateAll((els) => els.filter((el) => Number(getComputedStyle(el).opacity) > 0.5).map((el) => el.textContent));

test.describe('Qué incluye', () => {
  test('counts its items as criteria met, without announcing it', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    const items = await page.locator('#features .checks li').count();
    await expect(page.locator('.criteria')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.criteria')).toContainText(`de ${items}`);
    await expect(page.locator('.criteria')).toContainText('criterios cumplidos');
  });

  test('ticks the criteria one after another with the scroll', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    test.skip(!(await page.evaluate(() => CSS.supports('animation-timeline: view()'))), 'needs scroll timelines');
    const items = await page.locator('#features .checks li').count();
    const block = page.locator('.part__block--criteria');
    // Its top just at 80% of the window: nothing ticked yet.
    await block.evaluate((el) => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.8, behavior: 'instant' }));
    await expect.poll(() => counter(page)).toEqual(['0']);
    // Its bottom past 50%: every criterion met.
    await block.evaluate((el) => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().bottom - window.innerHeight * 0.45, behavior: 'instant' }));
    await expect.poll(() => counter(page)).toEqual([String(items)]);
    await expect(page.locator('.checks__mark').last()).toHaveCSS('opacity', '1');
  });
});

test.describe('Qué incluye with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('shows every check and the full count', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    const items = await page.locator('#features .checks li').count();
    await expect(page.locator('.checks__mark').first()).toHaveCSS('opacity', '1');
    await expect(page.locator('.checks__mark').last()).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    await expect.poll(() => counter(page)).toEqual([String(items)]);
  });
});

test.describe('Qué incluye without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows every check', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    await expect(page.locator('.checks__mark').last()).toHaveCSS('opacity', '1');
  });
});

test.describe('Stack', () => {
  test('is a dependency file whose list is real text', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    await expect(page.locator('.deps__bar')).toHaveAttribute('aria-hidden', 'true');
    const items = page.getByRole('list').filter({ has: page.getByText('Playwright', { exact: true }) });
    await expect(items.getByRole('listitem')).toHaveCount(16);
  });

  test('writes the technologies one by one, 40ms apart, once in view', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    const items = page.locator('.deps__list li');
    await expect(items.first()).toHaveCSS('opacity', '0');
    await expect(items.nth(2)).toHaveCSS('transition-delay', '0.08s');
    await page.locator('.deps').scrollIntoViewIfNeeded();
    await expect(page.locator('.deps')).toHaveClass(/is-visible/);
    await expect(items.last()).toHaveCSS('opacity', '1');
  });
});

test.describe('Stack with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('shows the whole list', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    await expect(page.locator('.deps__list li').last()).toHaveCSS('opacity', '1');
  });
});

test.describe('Decisiones técnicas', () => {
  test('each decision shows its evidence, decorative and from the repository', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    const evidence = page.locator('.decision__evidence > .lens');
    await expect(evidence).toHaveCount(3);
    for (const piece of await evidence.all()) await expect(piece).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.diff')).toContainText('--space-5: 1.25rem;');
    const stats = JSON.parse((await import('node:fs')).readFileSync('.astro/test-stats.json', 'utf8'));
    await expect(page.locator('.results__sum')).toHaveText(`${stats.passed} / ${stats.total}`);
    await expect(page.locator('.decision h3').first()).toBeVisible();
  });

  test('the evidence wakes up as its card nears the middle of the window', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    test.skip(!(await page.evaluate(() => CSS.supports('animation-timeline: view()'))), 'needs scroll timelines');
    const card = page.locator('.decision').first();
    const evidence = card.locator('.decision__evidence');
    await card.evaluate((el) => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.9, behavior: 'instant' }));
    expect(Number(await evidence.evaluate((el) => getComputedStyle(el).opacity))).toBeLessThan(0.6);
    await card.evaluate((el) => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2 - window.innerHeight * 0.3, behavior: 'instant' }));
    await expect.poll(() => evidence.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
  });
});

test.describe('Decisiones técnicas with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  test('shows every fragment complete', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    for (const piece of await page.locator('.decision__evidence').all()) await expect(piece).toHaveCSS('opacity', '1');
    await expect(page.locator('.diff__add').last()).toHaveCSS('opacity', '1');
  });
});

test('the case study has no horizontal scroll', async ({ page }) => {
  await page.goto('/portfolio/proyectos/audenpass/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test.describe('Cover on small screens', () => {
  test('the phone goes centred under the desktop screenshot, smaller', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    test.skip((page.viewportSize()?.width ?? 1000) >= 768, 'mobile view');
    const [d, m] = await Promise.all([page.locator('.pair--cover .pair__desktop').boundingBox(), page.locator('.pair--cover .pair__mobile').boundingBox()]);
    expect(m!.y).toBeGreaterThan(d!.y + d!.height - 2);
    expect(m!.width).toBeLessThan(d!.width * 0.6);
    // Centred in the width of the desktop screenshot.
    expect(Math.abs(m!.x + m!.width / 2 - (d!.x + d!.width / 2))).toBeLessThanOrEqual(2);
  });

  test('the footer logo goes to the start page', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    await page.locator('footer').getByRole('link', { name: 'Florencia Morelli' }).click();
    await expect(page).toHaveURL(/\/portfolio\/?$/);
  });
});
