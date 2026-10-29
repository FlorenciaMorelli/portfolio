import { describe, it, expect } from 'vitest';
import {
  readTokens,
  readTheme,
  readFontsUrl,
  parseTokens,
  parseTheme,
  parseFontsUrl,
  contrastRatio,
  withAlpha,
} from '../../scripts/lib/tokens.mjs';

describe('parseTokens', () => {
  it('reads hex primitives and skips aliases and other values', () => {
    const css = `:root {\n  --navy-900: #000033;\n  --brand-navy: var(--navy-900);\n  --space-4: 1rem;\n  --Teal-600: #006D7C;\n  --teal-600: #006D7C;\n}`;
    expect(parseTokens(css)).toEqual({ 'navy-900': '#000033', 'teal-600': '#006d7c' });
  });
});

describe('parseTheme', () => {
  it('resolves aliases to primitives and keeps raw values', () => {
    const css = `:root {\n  --gray-50: #f5f5f7;\n}\n[data-theme='dark'] {\n  --code-bg: var(--gray-50);\n  --cursor-qa-idle: #30305F;\n  --shadow-1: 0 1px 2px red;\n}`;
    expect(parseTheme(css, 'dark')).toEqual({ 'code-bg': '#f5f5f7', 'cursor-qa-idle': '#30305f' });
  });
});

describe('contrastRatio', () => {
  it('follows the WCAG formula', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1);
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

// Code, diff and idle cursor pairs from Fundamentos › «Contraste AA · Código» in Figma.
const codePairs = [
  ...['code-text', 'code-comment', 'code-keyword', 'code-string', 'code-function', 'code-number', 'code-property', 'code-line-number'].flatMap(
    (text) => [
      [text, 'code-bg'],
      [text, 'code-line-active'],
    ],
  ),
  ['code-diff-add-text', 'code-diff-add-bg'],
  ['code-diff-del-text', 'code-diff-del-bg'],
  ...['analysis', 'design', 'dev', 'qa'].map((m) => [`cursor-${m}-idle-text`, `cursor-${m}-idle`]),
];

describe.each(['light', 'dark'])('the %s theme', (theme) => {
  it('passes AA (4.5:1) in the 22 code and idle cursor pairs', async () => {
    const c = await readTheme(theme);
    expect(codePairs).toHaveLength(22);
    for (const [text, bg] of codePairs) {
      expect(c[text], text).toBeDefined();
      expect(c[bg], bg).toBeDefined();
      expect(contrastRatio(c[text], c[bg]), `${text} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
