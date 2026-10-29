import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface TestStats {
  total: number;
  passed: number;
  failed: number;
  files: { file: string; tests: number; passed: number; ms: number }[];
}

/** Summary of the last unit test run, written at the start of every build (astro.config.mjs). */
export function testStats(): TestStats {
  return JSON.parse(readFileSync(resolve(process.cwd(), '.astro/test-stats.json'), 'utf8'));
}
