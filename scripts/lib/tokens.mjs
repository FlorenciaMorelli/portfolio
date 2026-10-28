// Reads the design tokens from src/styles/tokens.css, so the generated assets (OG cover,
// resumes) use the same colours and fonts as the site instead of copies of them.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const TOKENS = resolve(here, '../../src/styles/tokens.css');
const GLOBAL = resolve(here, '../../src/styles/global.css');

/** Primitive colours of the stylesheet, e.g. `{ 'navy-900': '#000033' }`. */
export function parseTokens(css) {
  const colours = {};
  for (const m of css.matchAll(/^\s*--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/gm)) {
    colours[m[1]] = m[2].toLowerCase();
  }
  return colours;
}

/** The Google Fonts stylesheet URL that global.css imports (Geist, Geist Mono, Instrument Serif). */
export function parseFontsUrl(css) {
  return css.match(/@import url\('(https:\/\/fonts\.googleapis\.com[^']+)'\)/)?.[1];
}

export async function readTokens() {
  return parseTokens(await readFile(TOKENS, 'utf8'));
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
