# DevOps

Flujo de trabajo del repositorio, integración continua y despliegue.

## Flujo de ramas

`feature → develop → staging → main`.

- `main` es producción. Es la rama protegida y la única que dispara el deploy a Pages.
- `staging` es la rama de QA: ahí se revisa una entrega completa antes de producción.
- `develop` es la rama de integración: junta las features de una entrega.
- El trabajo se hace en ramas cortas `feature/*` o `fix/*`, que salen de `develop`.

Recorrido de un cambio:

1. Crear `feature/...` desde `develop`.
2. PR de la feature hacia `develop`, con **squash**. CI corre (tests y build) y tiene que
   pasar.
3. PR de `develop` hacia `staging`, con **squash**: es la entrega para revisar.
4. PR de `staging` hacia `main`, con **«Create a merge commit»**. Al mergear, se publica.

Después de cada entrega se sincronizan las ramas:

1. Con el diff de `origin/staging` contra `origin/develop` vacío, en `develop`:
   `git merge -s ours origin/staging`.
2. Después del merge a `main`, `staging` avanza con `git merge --ff-only origin/main`.
3. `staging` se mergea en `develop`.

Las ramas viejas (`release/*`, `hotfix`, `legacy-html`) quedan archivadas.

### Commits

Convención `tipo(scope): mensaje` con tipos `feat`, `fix`, `docs`, `style`, `refactor`,
`test`, `chore`. Mensajes en primera persona, sin pies de firma automáticos.

Si al trabajar cambia `src/data/projects.generated.json` (el snapshot de proyectos), va en
un PR `chore/` aparte.

## Integración continua

`.github/workflows/ci.yml` corre en los PR hacia `develop`, `staging` y `main`, y en cada
push a `staging`:

1. `npm ci`
2. `npm test` (Vitest)
3. `npm run build`

## Datos que se generan

- **Pruebas unitarias:** cada build (`astro build` o `astro dev`) corre vitest y guarda el
  resumen en `.astro/test-stats.json`, que muestran las piezas de Calidad. Si una prueba
  falla, el build falla.
- **Calendario de trabajo** (Experiencia): `npm run work-days` lee, con tu sesión de `gh`, los
  días con commits de los repositorios de Enivel7 y Guia y escribe solo el día y el puesto en
  `src/data/work-days.json`. Los repositorios son privados: se listan en
  `scripts/work-days.local.json`, que no se versiona (ver `scripts/work-days.example.json`).
  Conviene correrlo antes de cada entrega. Los días de Diagnóstico Maipú y SMG salen de sus
  reglas en `src/lib/work-calendar.ts`.

## Despliegue

`.github/workflows/deploy.yml` publica a GitHub Pages desde Actions:

- **Disparadores:** push a `main`, `schedule` (cron diario a las 06:00 UTC) y manual
  (`workflow_dispatch`).
- **Build:** `npm run build`, que antes corre el importador de GitHub con `GITHUB_TOKEN`.
- **Publicación:** `upload-pages-artifact` + `deploy-pages`.

El cron es lo que cubre RF10: un repo recién etiquetado con `portfolio` aparece al día
siguiente sin tener que tocar el código. Para verlo antes, se corre el workflow a mano.

## Configuración de GitHub Pages (una sola vez)

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Confirmar que `astro.config.mjs` tiene `site: https://florenciamorelli.github.io` y
   `base: /portfolio`.
3. El primer deploy se dispara al hacer merge a `main` o corriendo el workflow a mano.

## Hosting

GitHub Pages, sin costo y sin dominio propio. El sitio queda en
`https://florenciamorelli.github.io/portfolio/`.
