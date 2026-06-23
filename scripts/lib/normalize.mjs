// Pure helpers for turning GitHub API data into the portfolio's project schema.
// No network or filesystem here so the logic can be unit-tested in isolation.

const CONTROL_TOPICS = new Set(['portfolio', 'showcase']);

const CATEGORY_HINTS = {
  Games: ['game', 'games', 'gamedev', 'godot', 'unity', 'unreal', 'sfml', 'gdscript'],
  Mobile: ['mobile', 'android', 'ios', 'kotlin', 'flutter', 'react-native', 'swift'],
  Design: ['design', 'ux', 'ui', 'ux-ui', 'figma', 'prototype'],
};

const VALID_CATEGORIES = new Set(['Web', 'Mobile', 'Games', 'Design']);

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Turn a repo slug into a more readable title without flattening intentional
// casing: `wc_match_predictor_frontend` -> "Wc Match Predictor Frontend",
// while `whatToWatch` and `UCExchangeS` keep their shape.
export function prettifyName(value) {
  return String(value)
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function inferCategory(repo, override) {
  if (override?.category && VALID_CATEGORIES.has(override.category)) {
    return override.category;
  }
  const haystack = [...(repo.topics ?? []), repo.language ?? '']
    .map((t) => String(t).toLowerCase())
    .filter(Boolean);

  for (const [category, hints] of Object.entries(CATEGORY_HINTS)) {
    if (haystack.some((t) => hints.includes(t))) return category;
  }
  return 'Web';
}

export function pickTechnologies(repo, override) {
  if (Array.isArray(override?.technologies) && override.technologies.length) {
    return override.technologies;
  }
  const language = repo.language ?? '';
  // Topics arrive lowercase; drop control topics and any topic that just repeats
  // the language, so the properly cased language name is the one we show.
  const fromTopics = (repo.topics ?? []).filter((t) => {
    const low = t.toLowerCase();
    return !CONTROL_TOPICS.has(low) && low !== language.toLowerCase();
  });
  return language ? [...fromTopics, language] : fromTopics;
}

function dedupeLinks(links) {
  const seen = new Set();
  return links.filter((link) => {
    if (!link?.url) return false;
    const key = `${link.type}:${link.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildLinks(repo, override, release) {
  const links = [{ type: 'repo', url: repo.html_url }];

  if (repo.homepage) {
    links.push({ type: 'website', url: repo.homepage });
  }
  const asset = release?.assets?.find((a) => a.browser_download_url);
  if (asset) {
    links.push({ type: 'download', url: asset.browser_download_url });
  }
  if (Array.isArray(override?.links)) {
    for (const link of override.links) {
      if (link?.type && link?.url) links.push({ type: link.type, url: link.url });
    }
  }
  return dedupeLinks(links);
}

export function localizedDescription(repo, override) {
  const base = repo.description ?? '';
  const desc = override?.description;
  if (desc && typeof desc === 'object') {
    return { es: desc.es ?? base, en: desc.en ?? base };
  }
  if (typeof desc === 'string' && desc) {
    return { es: desc, en: desc };
  }
  return { es: base, en: base };
}

export function normalizeRepo({ repo, override = null, release = null }) {
  return {
    slug: slugify(override?.slug ?? repo.name),
    name: override?.name ?? prettifyName(repo.name),
    institution: override?.institution ?? undefined,
    description: localizedDescription(repo, override),
    image: override?.image ?? undefined,
    technologies: pickTechnologies(repo, override),
    category: inferCategory(repo, override),
    links: buildLinks(repo, override, release),
    date: override?.date ?? repo.pushed_at ?? repo.created_at ?? new Date().toISOString(),
    featured: Boolean(override?.featured),
    order: Number.isFinite(override?.order) ? override.order : 999,
    source: 'github',
  };
}
