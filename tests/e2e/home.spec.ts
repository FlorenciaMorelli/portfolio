import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Spanish home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio/');
  });

  test('renders the hero and projects', async ({ page }) => {
    await expect(page).toHaveTitle(/Florencia Morelli/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Florencia Morelli');
    await expect(page.locator('[data-grid] article')).not.toHaveCount(0);
  });

  test('filters projects by category', async ({ page }) => {
    const games = page.locator('[data-filter="Games"]');
    await games.click();
    await expect(games).toHaveAttribute('aria-selected', 'true');
    const visible = page.locator('[data-grid] article:visible');
    await expect(visible).not.toHaveCount(0);
    for (const card of await visible.all()) {
      await expect(card).toHaveAttribute('data-category', 'Games');
    }
  });

  test('toggles the theme and remembers it', async ({ page }) => {
    const html = page.locator('html');
    const before = await html.getAttribute('data-theme');
    await page.locator('[data-theme-toggle]').first().click();
    await expect(html).not.toHaveAttribute('data-theme', before ?? '');
    await page.reload();
    await expect(html).not.toHaveAttribute('data-theme', before ?? '');
  });

  test('switches language to English', async ({ page }) => {
    await page.getByRole('link', { name: /english|inglés/i }).click();
    await expect(page).toHaveURL(/\/portfolio\/en\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('has no critical accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const serious = results.violations.filter((v) =>
      ['critical', 'serious'].includes(v.impact ?? ''),
    );
    expect(serious).toEqual([]);
  });
});

test.describe('English home', () => {
  test('renders translated navigation', async ({ page }) => {
    await page.goto('/portfolio/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
  });
});
