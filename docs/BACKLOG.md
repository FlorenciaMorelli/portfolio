# Backlog

Plan de trabajo priorizado con MoSCoW, organizado por fases. Cada fase entra como uno o
varios PR de `feature/*` hacia `main`.

## Prioridades

- **Must:** sin esto el rediseño no cumple su objetivo.
- **Should:** importante, pero el sitio funciona sin ello.
- **Could:** mejoras de pulido.

## Fase 0 — Cimientos · Must

- Scaffolding de Astro con `base: /portfolio` y `site` configurados.
- Tokens de diseño y estilos globales.
- Layout base con SEO, `hreflang` y arranque de tema sin parpadeo.

## Fase 1 — Automatización GitHub · Must

- Script `fetch-github-projects.mjs` (topic `portfolio`, `.portfolio.json`, releases).
- Esquema de datos y capa de merge (`src/lib/`).
- Snapshot como caché y fallback.
- Pruebas unitarias del normalizador.

## Fase 2 — Diseño y responsive · Must

- Header, Hero, Sobre mí, Proyectos, Contacto, Footer.
- Grilla de proyectos fluida y tarjetas.
- Filtros por categoría.
- Tema claro/oscuro y micro-interacciones.

## Fase 3 — Internacionalización · Must

- Diccionarios ES/EN y utilidades.
- Selector de idioma y rutas.
- `hreflang`, sitemap y CV por idioma.

## Fase 4 — CI/CD y deploy · Must

- Workflow de deploy (push a `main`, cron diario, manual).
- Workflow de CI en PR (tests + build).
- Pages servido desde Actions.

## Fase 5 — QA · Should

- Pruebas unitarias del merge de proyectos.
- E2E con Playwright + accesibilidad con axe.
- Validación en CI.

## Fase 6 — Pulido · Could

- Datos estructurados ampliados y portada Open Graph.
- Animaciones de entrada sutiles.
- Documentación y README.

## Pendientes conocidos

- Reemplazar la portada Open Graph (`public/assets/img/og-cover.png`).
- CV en inglés separado del de español.
- Migrar el resto de los repos al criterio del topic `portfolio`.
