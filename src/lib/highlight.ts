// A tiny TypeScript highlighter for the decorative editor panels: enough for the site's own code,
// with the codigo/* colours of tokens.css. No dependencies.

export type TokenKind = 'keyword' | 'string' | 'function' | 'property' | 'number' | 'comment' | 'text';
export interface Token {
  kind: TokenKind;
  text: string;
}

const KEYWORDS = new Set([
  'const', 'let', 'var', 'for', 'of', 'in', 'if', 'else', 'return', 'export', 'function', 'new',
  'import', 'from', 'type', 'interface', 'true', 'false', 'null', 'undefined', 'await', 'async',
]);

const PATTERN = /(\/\/.*$)|('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(\.)?([A-Za-z_$][\w$]*)(\s*\()?|([^\w$'"`/.]+|[./])/g;

/** Splits one line of code into coloured tokens. */
export function highlightLine(line: string): Token[] {
  const tokens: Token[] = [];
  const push = (kind: TokenKind, text: string) => {
    const last = tokens.at(-1);
    if (last && last.kind === kind) last.text += text;
    else tokens.push({ kind, text });
  };
  for (const m of line.matchAll(PATTERN)) {
    const [, comment, string, number, dot, word, call, other] = m;
    if (comment) push('comment', comment);
    else if (string) push('string', string);
    else if (number) push('number', number);
    else if (word) {
      if (dot) push('text', dot);
      if (KEYWORDS.has(word)) push('keyword', word);
      else if (call) push('function', word);
      else if (dot) push('property', word);
      else push('text', word);
      if (call) push('text', call);
    } else if (other) push('text', other);
  }
  return tokens;
}

/** The lines from the first one containing `from` to the first one after it containing `to`, with their numbers. */
export function excerpt(source: string, from: string, to: string): { n: number; text: string }[] {
  const lines = source.split('\n');
  const start = lines.findIndex((l) => l.includes(from));
  const end = lines.findIndex((l, i) => i > start && l.includes(to));
  if (start < 0 || end < 0) throw new Error(`Excerpt not found: ${from} … ${to}`);
  return lines.slice(start, end + 1).map((text, i) => ({ n: start + i + 1, text }));
}
