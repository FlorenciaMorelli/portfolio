// Reads the design tokens from src/styles/tokens.css, so the generated assets (OG cover,
// resumes) use the same colours and fonts as the site instead of copies of them.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const TOKENS = resolve(here, '../../src/styles/tokens.css');
const GLOBAL = resolve(here, '../../src/styles/global.css');

/** Primitive colours of the stylesheet, e.g. `{ 'navy-900': '#000033' }`. Only the first
    block counts: that is where the primitives live (the theme blocks also have raw values). */
export function parseTokens(css) {
  const colours = {};
  const block = css.slice(0, css.indexOf('}') + 1);
  for (const m of block.matchAll(/^\s*--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/gm)) {
    colours[m[1]] = m[2].toLowerCase();
  }
  return colours;
}

/** Colours of one theme with the aliases resolved, e.g. `{ 'code-bg': '#f5f5f7' }`. */
export function parseTheme(css, theme) {
  const start = css.indexOf(`[data-theme='${theme}'] {`);
  if (start < 0) throw new Error(`No [data-theme='${theme}'] block in tokens.css`);
  const block = css.slice(start, css.indexOf('}', start));
  const primitives = parseTokens(css);
  const colours = {};
  for (const m of block.matchAll(/^\s*--([a-z0-9-]+):\s*([^;]+);/gm)) {
    const value = m[2].trim();
    const alias = value.match(/^var\(--([a-z0-9-]+)\)$/)?.[1];
    if (alias && primitives[alias]) colours[m[1]] = primitives[alias];
    else if (/^#[0-9a-fA-F]{6}$/.test(value)) colours[m[1]] = value.toLowerCase();
  }
  return colours;
}

/** WCAG 2.2 contrast ratio of two `#rrggbb` colours. */
export function contrastRatio(a, b) {
  const luminance = (hex) => {
    const n = parseInt(hex.slice(1, 7), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** The Google Fonts stylesheet URL that global.css imports (Geist, Geist Mono, Instrument Serif). */
export function parseFontsUrl(css) {
  return css.match(/@import url\('(https:\/\/fonts\.googleapis\.com[^']+)'\)/)?.[1];
}

export async function readTokens() {
  return parseTokens(await readFile(TOKENS, 'utf8'));
}

export async function readTheme(theme) {
  return parseTheme(await readFile(TOKENS, 'utf8'), theme);
}

export async function readFontsUrl() {
  const url = parseFontsUrl(await readFile(GLOBAL, 'utf8'));
  if (!url) throw new Error('No Google Fonts @import found in global.css');
  return url;
}

/** `#rrggbb` plus an alpha (0 to 1) as `rgba(...)`. */
export function withAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
