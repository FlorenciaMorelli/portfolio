import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-AR', en: 'en' },
      },
    }),
  ],
});
