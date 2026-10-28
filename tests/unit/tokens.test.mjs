import { describe, it, expect } from 'vitest';
import { readTokens, readFontsUrl, parseTokens, parseFontsUrl, withAlpha } from '../../scripts/lib/tokens.mjs';

describe('parseTokens', () => {
  it('reads hex primitives and skips aliases and other values', () => {
    const css = `:root {\n  --navy-900: #000033;\n  --brand-navy: var(--navy-900);\n  --space-4: 1rem;\n  --Teal-600: #006D7C;\n  --teal-600: #006D7C;\n}`;
    expect(parseTokens(css)).toEqual({ 'navy-900': '#000033', 'teal-600': '#006d7c' });
  });
});

describe('parseFontsUrl', () => {
  it('finds the Google Fonts import', () => {
    const css = `@import url('https://fonts.googleapis.com/css2?family=Geist&display=swap');\n@import './tokens.css';`;
    expect(parseFontsUrl(css)).toBe('https://fonts.googleapis.com/css2?family=Geist&display=swap');
  });
});

describe('withAlpha', () => {
  it('turns a hex colour and an alpha into rgba', () => {
    expect(withAlpha('#bbbbf8', 0.22)).toBe('rgba(187, 187, 248, 0.22)');
  });
});

describe('the real stylesheets', () => {
  it('give the generators the colours they use', async () => {
    const c = await readTokens();
    for (const name of ['navy-900', 'navy-600', 'lilac-200', 'lilac-600', 'gray-0', 'gray-200', 'gray-600', 'gray-700', 'teal-600']) {
      expect(c[name], name).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(c['navy-900']).toBe('#000033');
  });

  it('import Geist, Geist Mono and Instrument Serif', async () => {
    const url = await readFontsUrl();
    expect(url).toContain('family=Geist:');
    expect(url).toContain('family=Geist+Mono');
    expect(url).toContain('family=Instrument+Serif');
  });
});
