import { describe, it, expect } from 'vitest';
import { getProjects, getUsedCategories } from '../../src/lib/projects';
import { CATEGORIES } from '../../src/lib/types';

describe('getProjects', () => {
  const projects = getProjects();

  it('returns a non-empty list', () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it('has unique slugs', () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('places featured projects before the rest', () => {
    const firstNonFeatured = projects.findIndex((p) => !p.featured);
    const lastFeatured = projects.map((p) => p.featured).lastIndexOf(true);
    if (firstNonFeatured !== -1 && lastFeatured !== -1) {
      expect(lastFeatured).toBeLessThan(firstNonFeatured);
    }
  });

  it('gives every project a localized description', () => {
    for (const p of projects) {
      expect(p.description.es).toBeTruthy();
      expect(p.description.en).toBeTruthy();
    }
  });
});

describe('getUsedCategories', () => {
  it('returns categories in canonical order', () => {
    const used = getUsedCategories(getProjects());
    const indexes = used.map((c) => CATEGORIES.indexOf(c));
    const sorted = [...indexes].sort((a, b) => a - b);
    expect(indexes).toEqual(sorted);
  });
});
