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
