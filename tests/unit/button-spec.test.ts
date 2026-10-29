import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buttonSpec } from '../../src/lib/button-spec';

describe('buttonSpec', () => {
  it('reads the primary button from the real stylesheets', () => {
    const spec = buttonSpec(readFileSync('src/styles/tokens.css', 'utf8'), readFileSync('src/styles/global.css', 'utf8'));
    // The values of the «Botón» component in Figma.
    expect(spec).toEqual({ corners: 10, padding: [13, 20], gap: 8, text: 'Geist SemiBold 15/20' });
  });
});
