import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { collectTestStats } from './scripts/lib/test-stats.mjs';

const site = 'https://florenciamorelli.github.io';
const base = '/portfolio';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    // Test counts shown on the site come from a real run of the unit tests (scripts/lib/test-stats.mjs).
    {
      name: 'test-stats',
      hooks: {
        'astro:config:setup': ({ logger }) => {
          const stats = collectTestStats();
          logger.info(`${stats.passed} of ${stats.total} unit tests passing`);
        },
      },
    },
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-AR', en: 'en' },
      },
    }),
  ],
});
