import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Audenpass case study', () => {
  test('is linked from its project card', async ({ page }) => {
    await page.goto('/portfolio/');
    await page.getByRole('link', { name: 'Ver caso de estudio' }).click();
    await expect(page).toHaveURL(/\/portfolio\/proyectos\/audenpass\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Audenpass');
  });

  test('switches to the English version of the same page', async ({ page }) => {
    await page.goto('/portfolio/proyectos/audenpass/');
    // On small screens the switch lives inside the collapsed menu.
    const menu = page.locator('[data-nav-toggle]');
    if (await menu.isVisible()) await menu.click();
    await page.locator('[data-lang-switch]').first().click();
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
