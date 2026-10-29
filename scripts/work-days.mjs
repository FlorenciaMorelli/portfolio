// Days with commits for the work calendar in Experiencia. Run by hand, with your own `gh` login:
//   npm run work-days
// The repositories are private, so they are listed in scripts/work-days.local.json (not
// versioned; see scripts/work-days.example.json). Only the day and the job are written to
// src/data/work-days.json: no repository names and no commit messages.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(resolve(root, 'scripts/work-days.local.json'), 'utf8'));
const OUT = resolve(root, 'src/data/work-days.json');
const TIME_ZONE = 'America/Argentina/Buenos_Aires';

/** The local day (YYYY-MM-DD in Buenos Aires) of an ISO date. */
export function localDay(iso) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date(iso));
}

function gh(path) {
  const out = execFileSync('gh', ['api', '--paginate', path, '--jq', '.[]'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return out.trim() ? out.trim().split('\n').map((line) => JSON.parse(line)) : [];
}

function repos(entry) {
  if (!entry.startsWith('org:')) return [entry];
  return gh(`orgs/${entry.slice(4)}/repos?per_page=100`).map((r) => r.full_name);
}

const days = {};
for (const [job, entries] of Object.entries(config.jobs)) {
  const set = new Set();
  for (const repo of entries.flatMap(repos)) {
    for (const author of config.authors) {
      for (const commit of gh(`repos/${repo}/commits?author=${encodeURIComponent(author)}&per_page=100`)) {
        set.add(localDay(commit.commit.author.date));
      }
    }
  }
  days[job] = [...set].sort();
  console.log(`${job}: ${days[job].length} days`);
}

writeFileSync(OUT, `${JSON.stringify({ updated: localDay(new Date().toISOString()), days }, null, 2)}\n`);
console.log(`Written ${OUT}`);
