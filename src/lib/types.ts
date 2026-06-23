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
  featured?: boolean;
  order?: number;
  links?: ProjectLink[];
}

export type IconName =
  | 'github'
  | 'linkedin'
  | 'arrow-down'
  | 'arrow-up'
  | 'sun'
  | 'moon'
  | 'external'
  | 'download'
  | 'figma'
  | 'presentation'
  | 'globe'
  | 'menu'
  | 'close';
