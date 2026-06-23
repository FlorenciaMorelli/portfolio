#!/usr/bin/env node
// Builds src/data/projects.generated.json from public GitHub repos tagged with
// the `portfolio` topic. Designed to never break the build: on any failure it
// keeps the previous snapshot (or writes an empty list if none exists yet).

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { normalizeRepo } from './lib/normalize.mjs';

const USERNAME = 'FlorenciaMorelli';
const TOPIC = 'portfolio';
const API = 'https://api.github.com';
// The portfolio repo itself carries the topic but should not list itself.
const EXCLUDED_REPOS = new Set(['portfolio']);

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = resolve(__dirname, '../src/data/projects.generated.json');

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': `${USERNAME}-portfolio-build`,
  'X-GitHub-Api-Version': '2022-11-28',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function gh(path) {
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}`);
  return res.json();
}

async function searchTaggedRepos() {
  const query = encodeURIComponent(`user:${USERNAME} topic:${TOPIC} fork:false archived:false`);
  const data = await gh(`/search/repositories?q=${query}&per_page=100&sort=pushed`);
  return (data.items ?? []).filter((repo) => !EXCLUDED_REPOS.has(repo.name.toLowerCase()));
}

async function fetchOverride(repo) {
  try {
    const data = await gh(`/repos/${repo.full_name}/contents/.portfolio.json`);
    if (!data?.content) return null;
    const json = Buffer.from(data.content, data.encoding || 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function fetchLatestRelease(repo) {
  try {
    return await gh(`/repos/${repo.full_name}/releases/latest`);
  } catch {
    return null;
  }
}

async function readExistingSnapshot() {
  try {
    return JSON.parse(await readFile(OUT_FILE, 'utf8'));
  } catch {
    return null;
  }
}

async function writeSnapshot(projects) {
  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(projects, null, 2)}\n`, 'utf8');
}

async function main() {
  if (!token) {
    console.warn('[projects] No GITHUB_TOKEN set; using unauthenticated rate limit (60/h).');
  }

  let repos;
  try {
    repos = await searchTaggedRepos();
  } catch (error) {
    console.warn(`[projects] GitHub search failed: ${error.message}`);
    if (existsSync(OUT_FILE)) {
      console.warn('[projects] Keeping the previous snapshot.');
      return;
    }
    await writeSnapshot([]);
    console.warn('[projects] No previous snapshot; wrote an empty list.');
    return;
  }

  const projects = [];
  for (const repo of repos) {
    const [override, release] = await Promise.all([
      fetchOverride(repo),
      fetchLatestRelease(repo),
    ]);
    projects.push(normalizeRepo({ repo, override, release }));
  }

  const previous = await readExistingSnapshot();
  if (projects.length === 0 && Array.isArray(previous) && previous.length > 0) {
    console.warn('[projects] Search returned 0 repos; keeping the previous snapshot.');
    return;
  }

  await writeSnapshot(projects);
  console.log(`[projects] Wrote ${projects.length} project(s) to the snapshot.`);
}

main().catch(async (error) => {
  console.warn(`[projects] Unexpected error: ${error.message}`);
  if (!existsSync(OUT_FILE)) await writeSnapshot([]);
  process.exit(0);
});
