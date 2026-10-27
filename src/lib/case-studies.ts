import type { CaseStudy } from './types';
import { localizedPath, type Locale } from '../i18n/utils';
import caseStudies from '../data/case-studies.json';

const studies = caseStudies as Record<string, CaseStudy>;

/** Route segment for the case study pages in each language. */
const SEGMENT: Record<Locale, string> = { es: 'proyectos', en: 'projects' };

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return studies[slug];
}

export function caseStudySlugs(): string[] {
  return Object.keys(studies);
}

/** Base-aware path to a case study, e.g. `/portfolio/en/projects/audenpass/`. */
export function caseStudyPath(locale: Locale, slug: string): string {
  return `${localizedPath(locale, `${SEGMENT[locale]}/${slug}`)}/`;
}
