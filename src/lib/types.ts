export type ProjectCategory = 'Web' | 'Mobile' | 'Games' | 'Design';

export type ProjectLinkType =
  | 'repo'
  | 'download'
  | 'website'
  | 'demo'
  | 'presentation'
  | 'figma';

export interface ProjectLink {
  type: ProjectLinkType;
  url: string;
}

export interface LocalizedText {
  es: string;
  en: string;
}

export interface Project {
  slug: string;
  name: string;
  institution?: string;
  description: LocalizedText;
  image?: string;
  imageAlt?: LocalizedText;
  technologies: string[];
  category: ProjectCategory;
  links: ProjectLink[];
  date: string;
  featured: boolean;
  order: number;
  source: 'github' | 'manual';
}

export const CATEGORIES: ProjectCategory[] = ['Web', 'Mobile', 'Games', 'Design'];

/** Central curation applied on top of a project, keyed by repo name or slug. */
export interface ProjectOverride {
  name?: string;
  institution?: string;
  category?: ProjectCategory;
  technologies?: string[];
  description?: Partial<LocalizedText>;
  image?: string;
  imageAlt?: LocalizedText;
  featured?: boolean;
  order?: number;
  links?: ProjectLink[];
}

export type IconName =
  | 'github'
  | 'linkedin'
  | 'arrow-down'
  | 'arrow-up'
  | 'arrow-right'
  | 'arrow-left'
  | 'sun'
  | 'moon'
  | 'external'
  | 'download'
  | 'figma'
  | 'presentation'
  | 'globe'
  | 'menu'
  | 'close'
  | 'pen-tool'
  | 'code-xml'
  | 'check-check'
  | 'clipboard-list';

/** A screenshot with its alt text in both languages. Paths live under `public/`. */
export interface Shot {
  src: string;
  alt: LocalizedText;
  width: number;
  height: number;
}

export interface CaseStudySection {
  id: string;
  title: LocalizedText;
  body?: { es: string[]; en: string[] };
  list?: { es: string[]; en: string[] };
  cards?: { title: LocalizedText; body: LocalizedText }[];
  gallery?: { caption: LocalizedText; desktop: Shot; mobile: Shot }[];
  note?: LocalizedText;
  tags?: string[];
}

/**
 * Long-form write-up of a project. Keyed by the project's slug, so a project with a
 * case study gets a link from its card automatically.
 */
export interface CaseStudy {
  name: string;
  summary: LocalizedText;
  website?: string;
  studio?: { name: string; url: string };
  facts: { label: LocalizedText; value: LocalizedText }[];
  highlights: { value: LocalizedText; label: LocalizedText }[];
  cover: { desktop: Shot; mobile: Shot };
  sections: CaseStudySection[];
}
