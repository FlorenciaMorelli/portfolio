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
  /** A project built for a client: it gets the large featured block on the home. */
  client?: boolean;
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
  client?: boolean;
  order?: number;
  links?: ProjectLink[];
}

export type IconName =
  | 'github'
  | 'github-outline'
  | 'linkedin'
  | 'arrow-down'
  | 'arrow-up'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up-right'
  | 'check'
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
  | 'clipboard-list'
  | 'mail'
  | 'linkedin-outline';

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
  /** Day of the first commit (YYYY-MM-DD): a milestone of the work calendar. */
  firstCommit?: string;
  studio?: { name: string; url: string };
  facts: { label: LocalizedText; value: LocalizedText }[];
  /** `short` is the label used on the home; `home` marks the figures shown there. */
  highlights: { value: LocalizedText; label: LocalizedText; short?: LocalizedText; home?: boolean }[];
  cover: { desktop: Shot; mobile: Shot };
  sections: CaseStudySection[];
}
