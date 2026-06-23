# Arquitectura

## Enfoque

Sitio estático generado con Astro. Todo se resuelve en tiempo de build: no hay servidor
ni base de datos. El contenido dinámico (los proyectos) se trae de GitHub durante el
build y queda fijado en el HTML final, lo que da un sitio rápido, barato de hostear y
fácil de mantener.

## Estructura

```
astro.config.mjs            site + base:/portfolio + i18n
scripts/
  fetch-github-projects.mjs  importador (IO de red)
  lib/normalize.mjs          transformación pura (testeable)
src/
  data/
    projects.generated.json  snapshot de GitHub (caché y fallback)
    overrides.json            curación central por repo (nombre, textos, imagen)
    manual-projects.json      proyectos que no son repos
    profile.json              bio, skills, redes, CV
  i18n/ ui.ts, utils.ts       textos y helpers ES/EN
  lib/ types.ts, projects.ts, url.ts
  components/                 secciones y UI
  layouts/BaseLayout.astro    head, SEO, hreflang, tema
  pages/ index.astro, en/index.astro, 404.astro
  styles/ tokens.css, global.css
```

## Flujo de datos de los proyectos

1. `fetch-github-projects.mjs` busca repos con `user:FlorenciaMorelli topic:portfolio`.
2. Por cada repo lee sus metadatos, intenta leer `.portfolio.json` y la última release.
3. `normalize.mjs` transforma cada repo al esquema interno (`Project`).
4. Se escribe `projects.generated.json`. Ese archivo es a la vez caché y red de
   seguridad: si la API falla, se conserva el último válido (RNF6).
5. En el build, `src/lib/projects.ts` fusiona el snapshot con `manual-projects.json`,
   deduplica por slug (lo manual gana), aplica `overrides.json` encima (la curación
   central pisa lo de GitHub) y ordena.
6. Las páginas renderizan estático. El filtrado por categoría es el único JavaScript de
   la sección de proyectos, y trabaja sobre el HTML ya presente.

## Decisiones

- **Astro** por su salida estática, el i18n nativo y el costo cero de JS por defecto.
- **Snapshot versionado** para que el sitio buildee aunque GitHub no responda y para
  tener historial de cómo cambió la lista.
- **Separación IO / lógica pura** en `scripts/`: la transformación se testea sin red.
- **Tokens en CSS** y temas por `data-theme` para mantener el diseño en un solo lugar.
- **i18n** con español por defecto sin prefijo (`/`) e inglés en `/en/`.
