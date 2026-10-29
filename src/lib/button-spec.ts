// The properties the design view shows for the primary button, read from the stylesheets so
// they always match the real button (DESIGN.md: the numbers come from the repo, never fixed).

const PX_PER_REM = 16;

function value(css: string, name: string): string {
  const m = css.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`--${name} not found`);
  return m[1].trim();
}

function px(length: string): number {
  const m = length.match(/^([\d.]+)(rem|px)$/);
  if (!m) throw new Error(`Not a length: ${length}`);
  return Math.round(Number(m[1]) * (m[2] === 'rem' ? PX_PER_REM : 1));
}

export interface ButtonSpec {
  corners: number;
  padding: [number, number];
  gap: number;
  text: string;
}

/** `tokens` is tokens.css and `global` is global.css. */
export function buttonSpec(tokens: string, global: string): ButtonSpec {
  const btn = global.match(/\n\.btn \{([^}]*)\}/)?.[1];
  if (!btn) throw new Error('.btn not found in global.css');
  const height = px(btn.match(/min-height:\s*([^;]+);/)![1].trim());
  const line = px(value(tokens, 'text-button-lh'));
  const size = px(value(tokens, 'text-button'));
  const varName = (prop: string) => btn.match(new RegExp(`${prop}:\\s*([^;]+);`))![1];
  const inline = varName('padding').match(/var\(--([\w-]+)\)\s*$/)![1];
  const gap = varName('gap').match(/var\(--([\w-]+)\)/)![1];
  const radius = varName('border-radius').match(/var\(--([\w-]+)\)/)![1];
  return {
    corners: px(value(tokens, radius)),
    padding: [(height - line) / 2, px(value(tokens, inline))],
    gap: px(value(tokens, gap)),
    text: `Geist SemiBold ${size}/${line}`,
  };
}
