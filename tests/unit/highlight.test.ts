import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { highlightLine, excerpt, splitAt } from '../../src/lib/highlight';

describe('highlightLine', () => {
  it('colours keywords, calls, properties and strings', () => {
    expect(highlightLine("    el.classList.add('is-visible');")).toEqual([
      { kind: 'text', text: '    el.' },
      { kind: 'property', text: 'classList' },
      { kind: 'text', text: '.' },
      { kind: 'function', text: 'add' },
      { kind: 'text', text: '(' },
      { kind: 'string', text: "'is-visible'" },
      { kind: 'text', text: ');' },
    ]);
    expect(highlightLine('for (const el of items) {').map((t) => t.kind)).toEqual(['keyword', 'text', 'keyword', 'text', 'keyword', 'text']);
  });

  it('keeps every character', () => {
    const line = "  const stop = watch(el, { rootMargin: '0px 0px -10% 0px', threshold: at }, (change) => {";
    expect(highlightLine(line).map((t) => t.text).join('')).toBe(line);
  });
});

describe('excerpt', () => {
  it('returns real lines of the motion module with their numbers', () => {
    const source = readFileSync('src/lib/motion.ts', 'utf8');
    const lines = excerpt(source, 'export function reveal', "el.classList.add('is-visible')");
    expect(lines[0].text).toContain('export function reveal');
    expect(source.split('\n')[lines[0].n - 1]).toBe(lines[0].text);
    expect(lines.at(-1)?.text).toContain('is-visible');
  });
});

describe('splitAt', () => {
  it('splits tokens in the middle of one, keeping every character', () => {
    const line = "accent: 'producción.' },";
    const tokens = highlightLine(line);
    const [before, after] = splitAt(tokens, line.indexOf('producción.') + 'producción.'.length);
    expect(before.map((t) => t.text).join('')).toBe("accent: 'producción.");
    expect(after.map((t) => t.text).join('')).toBe("' },");
    expect(before.at(-1)?.kind).toBe('string');
    expect(after[0].kind).toBe('string');
  });

  it('can take lines before the first match', () => {
    const src = 'a\nb\nneedle\nc\nend';
    expect(excerpt(src, 'needle', 'end', 1).map((l) => l.n)).toEqual([2, 3, 4, 5]);
  });
});
