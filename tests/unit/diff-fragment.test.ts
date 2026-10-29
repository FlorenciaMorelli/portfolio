import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';

// The decision card «Del Figma al código» shows a real change: the spacing scale in commit eb6004c.
function show(rev: string): string | null {
  try {
    return execFileSync('git', ['show', rev], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null; // a shallow checkout (CI) may not have that commit
  }
}

describe('the diff of the decision card', () => {
  const before = show('eb6004c^:src/styles/tokens.css');
  const after = show('eb6004c:src/styles/tokens.css');
  it.skipIf(!before || !after)('matches the tokens.css lines of commit eb6004c', () => {
    expect(before).toContain('--space-5: 1.5rem;');
    expect(before).toContain('--space-6: 2rem;');
    expect(after).toContain('--space-5: 1.25rem;');
    expect(after).toContain('--space-6: 1.5rem;');
  });
});
