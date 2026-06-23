import { ui, defaultLocale, locales, type Locale } from './ui';

/** Resolve the active locale from a URL pathname (base-path aware). */
export function getLocaleFromUrl(url: URL): Locale {
  const segments = url.pathname.split('/').filter(Boolean);
  const candidate = segments.find((s) => (locales as readonly string[]).includes(s));
  return (candidate as Locale) ?? defaultLocale;
}

/** Strongly-typed translation accessor for a given locale. */
export function useTranslations(locale: Locale) {
  return ui[locale];
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'es' ? 'en' : 'es';
}

/**
 * Build a path for a locale honouring the Astro base path.
 * `import.meta.env.BASE_URL` already includes the configured base ("/portfolio/").
 */
export function localizedPath(locale: Locale, path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\//, '');
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const tail = clean ? `/${clean}` : '';
  return `${base}${prefix}${tail}` || '/';
}

export { locales, defaultLocale, type Locale };
