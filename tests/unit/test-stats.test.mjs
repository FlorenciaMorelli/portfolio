import { describe, it, expect } from 'vitest';
import { summarize } from '../../scripts/lib/test-stats.mjs';

describe('summarize', () => {
  it('keeps the totals and one line per file with its duration', () => {
    const report = {
      numTotalTests: 3,
      numPassedTests: 2,
      numFailedTests: 1,
      testResults: [
        { name: '/repo/tests/unit/a.test.mjs', startTime: 100, endTime: 112.4, assertionResults: [{ status: 'passed' }, { status: 'failed' }] },
        { name: '/repo/tests/unit/b.test.ts', startTime: 50, endTime: 58, assertionResults: [{ status: 'passed' }] },
      ],
    };
    expect(summarize(report)).toEqual({
      total: 3,
      passed: 2,
      failed: 1,
      files: [
        { file: 'a.test.mjs', tests: 2, passed: 1, ms: 12 },
        { file: 'b.test.ts', tests: 1, passed: 1, ms: 8 },
      ],
    });
  });
});
