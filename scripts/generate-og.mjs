#!/usr/bin/env node
// Renders the Open Graph cover (1200x630) by screenshotting an HTML card with
// Playwright (already a dev dependency). Run on demand with `npm run og`; the
// resulting PNG is committed as a static asset, so it is not part of the build.

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { readTokens, readFontsUrl, withAlpha } from './lib/tokens.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/assets/img/og-cover.png');

const NAME = 'Florencia Morelli';
const ROLE = 'Desarrolladora y analista técnico-funcional';
const SITE = 'florenciamorelli.github.io/portfolio';

// Colours and fonts come from the site's own tokens (src/styles/tokens.css, global.css).
const c = await readTokens();
const fontsUrl = await readFontsUrl();

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${fontsUrl}" rel="stylesheet" />
<style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px;
    background-color: ${c['navy-900']};
    background-image:
      radial-gradient(60% 90% at 85% 15%, ${withAlpha(c['lilac-200'], 0.22)}, transparent 70%),
      radial-gradient(circle, ${c['navy-600']} 1.5px, transparent 2px);
    background-size: auto, 24px 24px;
    color: ${c['gray-200']};
    font-family: 'Geist', system-ui, sans-serif;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 72px 80px;
  }
  .top { display: flex; align-items: center; gap: 20px; }
  .mark {
    width: 64px; height: 64px; border-radius: 12px;
    background: ${c['lilac-200']}; color: ${c['navy-900']};
    font-family: 'Geist Mono', monospace; font-weight: 500; font-size: 26px;
    display: grid; place-items: center; letter-spacing: 1px;
  }
  .eyebrow { font-family: 'Geist Mono', monospace; font-size: 22px; color: ${c['lilac-200']}; letter-spacing: 2px; }
  .name {
    font-weight: 600; letter-spacing: -0.02em;
    font-size: 96px; line-height: 1.05; color: ${c['gray-0']};
  }
  .role { font-size: 34px; color: ${c['lilac-200']}; margin-top: 18px; font-weight: 500; }
  .bar { width: 96px; height: 6px; background: ${c['lilac-200']}; border-radius: 999px; margin: 28px 0 0; }
  .foot { display: flex; justify-content: space-between; align-items: center; }
  .site { font-family: 'Geist Mono', monospace; font-size: 24px; color: ${c['gray-200']}; }
  .links { font-family: 'Geist Mono', monospace; font-size: 22px; color: ${c['lilac-600']}; }
</style>
</head>
<body>
  <div class="top">
    <div class="mark">FM</div>
    <div class="eyebrow">PORTFOLIO</div>
  </div>
  <div>
    <div class="name">${NAME}</div>
    <div class="role">${ROLE}</div>
    <div class="bar"></div>
  </div>
  <div class="foot">
    <div class="site">${SITE}</div>
    <div class="links">GitHub · LinkedIn</div>
  </div>
</body>
</html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await mkdir(dirname(OUT), { recursive: true });
  await page.screenshot({ path: OUT });
  console.log(`[og] Wrote ${OUT}`);
} finally {
  await browser.close();
}
