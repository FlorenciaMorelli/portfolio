import type { Project, ProjectCategory, ProjectOverride, ProjectLink } from './types';
import { CATEGORIES } from './types';
import generated from '../data/projects.generated.json';
import manual from '../data/manual-projects.json';
import overrides from '../data/overrides.json';

const isProject = (value: unknown): value is Project => {
  if (!value || typeof value !== 'object') return false;
  const p = value as Partial<Project>;
  return (
    typeof p.slug === 'string' &&
    typeof p.name === 'string' &&
    !!p.description &&
    typeof p.category === 'string'
  );
};

/** Minimal slug used to match override keys (repo name or slug) to a project. */
const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const dedupeLinks = (links: ProjectLink[]): ProjectLink[] => {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (!link?.url) return false;
    const key = `${link.type}:${link.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/** Curation map: override keys are normalized to slugs so a repo name also works. */
const overrideMap: Map<string, ProjectOverride> = new Map(
  Object.entries(overrides as Record<string, ProjectOverride>).map(([key, value]) => [
    toSlug(key),
    value,
  ]),
);

function applyOverride(project: Project): Project {
  const o = overrideMap.get(project.slug);
  if (!o) return project;
  return {
    ...project,
    name: o.name ?? project.name,
    institution: o.institution ?? project.institution,
    category: o.category ?? project.category,
    technologies: o.technologies ?? project.technologies,
    image: o.image ?? project.image,
    featured: o.featured ?? project.featured,
    order: o.order ?? project.order,
    description: {
      es: o.description?.es ?? project.description.es,
      en: o.description?.en ?? project.description.en,
    },
    links: o.links ? dedupeLinks([...project.links, ...o.links]) : project.links,
  };
}

/**
 * Merge the GitHub snapshot with the manually curated projects, apply the central
 * overrides and sort. Manual entries win on slug collisions; featured items float to
 * the top, then we sort by the optional `order` field and finally by date (newest first).
 */
export function getProjects(): Project[] {
  const fromGithub = (generated as unknown[]).filter(isProject);
  const fromManual = (manual as unknown[]).filter(isProject);

  const bySlug = new Map<string, Project>();
  for (const project of [...fromGithub, ...fromManual]) {
    bySlug.set(project.slug, project);
  }

  return [...bySlug.values()].map(applyOverride).sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.order !== b.order) return a.order - b.order;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/** Categories that actually have at least one project, in canonical order. */
export function getUsedCategories(projects: Project[]): ProjectCategory[] {
  const present = new Set(projects.map((p) => p.category));
  return CATEGORIES.filter((c) => present.has(c));
}
