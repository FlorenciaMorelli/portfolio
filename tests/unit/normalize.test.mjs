import { describe, it, expect } from 'vitest';
import {
  slugify,
  prettifyName,
  inferCategory,
  pickTechnologies,
  buildLinks,
  localizedDescription,
  normalizeRepo,
} from '../../scripts/lib/normalize.mjs';

const repo = {
  name: 'Cool Project',
  full_name: 'FlorenciaMorelli/cool-project',
  html_url: 'https://github.com/FlorenciaMorelli/cool-project',
  description: 'A cool project',
  homepage: 'https://example.com',
  language: 'Kotlin',
  topics: ['portfolio', 'android', 'kotlin'],
  pushed_at: '2024-05-01T00:00:00Z',
};

describe('slugify', () => {
  it('normalizes names with accents and spaces', () => {
    expect(slugify('Cotizador ED-IT')).toBe('cotizador-ed-it');
    expect(slugify('Diseño Móvil')).toBe('diseno-movil');
  });
});

describe('prettifyName', () => {
  it('turns separators into a readable title', () => {
    expect(prettifyName('wc_match_predictor_frontend')).toBe('Wc Match Predictor Frontend');
  });
  it('keeps intentional casing', () => {
    expect(prettifyName('whatToWatch')).toBe('WhatToWatch');
    expect(prettifyName('UCExchangeS')).toBe('UCExchangeS');
  });
});

describe('inferCategory', () => {
  it('respects an explicit override', () => {
    expect(inferCategory(repo, { category: 'Games' })).toBe('Games');
  });
  it('detects mobile from topics', () => {
    expect(inferCategory(repo)).toBe('Mobile');
  });
  it('falls back to Web', () => {
    expect(inferCategory({ topics: ['cli'], language: 'Go' })).toBe('Web');
  });
});

describe('pickTechnologies', () => {
  it('drops the control topic and adds the language', () => {
    const techs = pickTechnologies(repo);
    expect(techs).not.toContain('portfolio');
    expect(techs).toContain('Kotlin');
  });
  it('prefers an override', () => {
    expect(pickTechnologies(repo, { technologies: ['Custom'] })).toEqual(['Custom']);
  });
});

describe('buildLinks', () => {
  it('builds repo and website links and dedupes', () => {
    const links = buildLinks(repo, null, null);
    expect(links).toContainEqual({ type: 'repo', url: repo.html_url });
    expect(links).toContainEqual({ type: 'website', url: 'https://example.com' });
  });
  it('adds a download link from a release asset', () => {
    const release = { assets: [{ browser_download_url: 'https://example.com/app.apk' }] };
    const links = buildLinks(repo, null, release);
    expect(links).toContainEqual({ type: 'download', url: 'https://example.com/app.apk' });
  });
});

describe('localizedDescription', () => {
  it('uses GitHub description for both locales by default', () => {
    expect(localizedDescription(repo)).toEqual({ es: 'A cool project', en: 'A cool project' });
  });
  it('honours per-locale overrides', () => {
    const override = { description: { es: 'Proyecto', en: 'Project' } };
    expect(localizedDescription(repo, override)).toEqual({ es: 'Proyecto', en: 'Project' });
  });
});

describe('normalizeRepo', () => {
  it('produces a complete project record', () => {
    const project = normalizeRepo({ repo });
    expect(project).toMatchObject({
      slug: 'cool-project',
      name: 'Cool Project',
      category: 'Mobile',
      source: 'github',
      featured: false,
    });
    expect(project.date).toBe('2024-05-01T00:00:00Z');
  });
});
