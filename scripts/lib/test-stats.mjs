// Runs the unit tests and keeps a summary for the site: the «Calidad» pieces show how many tests
// pass, never a fixed number. Called from an Astro integration (astro.config.mjs), so it runs on
// every build and dev start. If a test fails, the build fails: the site never says «en verde»
// when it is not.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const STATS = resolve(root, '.astro/test-stats.json');

/** Vitest's JSON report reduced to what the site shows. */
export function summarize(report) {
  const files = report.testResults.map((file) => ({
    file: basename(file.name),
    tests: file.assertionResults.length,
    passed: file.assertionResults.filter((t) => t.status === 'passed').length,
    ms: Math.max(0, Math.round(file.endTime - file.startTime)),
  }));
  return {
    total: report.numTotalTests,
    passed: report.numPassedTests,
    failed: report.numFailedTests,
    files,
  };
}

export function collectTestStats() {
  const out = resolve(root, '.astro/vitest-report.json');
  mkdirSync(dirname(out), { recursive: true });
  try {
    execFileSync(process.execPath, [resolve(root, 'node_modules/vitest/vitest.mjs'), 'run', '--reporter=json', `--outputFile=${out}`], {
      cwd: root,
      stdio: 'pipe',
    });
  } catch {
    throw new Error('Unit tests failed: run `npm test`. The site only shows test counts when every test passes.');
  }
  const stats = summarize(JSON.parse(readFileSync(out, 'utf8')));
  writeFileSync(STATS, JSON.stringify(stats, null, 2));
  return stats;
}
