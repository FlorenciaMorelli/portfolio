# DevOps

Flujo de trabajo del repositorio, integración continua y despliegue.

## Flujo de ramas

`feature → PR → staging → main`.

- `main` es producción. Es la rama protegida y la única que dispara el deploy a Pages.
- `staging` es la rama de integración y QA. Todo pasa por acá antes de producción.
- El trabajo se hace en ramas cortas `feature/*` o `fix/*`, que salen de `staging`.

Recorrido de un cambio:

1. Crear `feature/...` desde `staging`.
2. PR de la feature hacia `staging`. CI corre (tests + build) y tiene que pasar.
3. Merge a `staging`. Ahí se valida la integración.
4. PR de `staging` hacia `main`. Al mergear, se publica.

Las ramas viejas (`develop`, `release/*`, `hotfix`, `legacy-html`) quedan archivadas:
ya no se despliega desde `develop`.

### Commits

Convención `tipo(scope): mensaje` con tipos `feat`, `fix`, `docs`, `style`, `refactor`,
`test`, `chore`. Mensajes en primera persona, sin pies de firma automáticos.

## Integración continua

`.github/workflows/ci.yml` corre en los PR hacia `staging` y `main`, y en cada push a
`staging`:

1. `npm ci`
2. `npm test` (Vitest)
3. `npm run build`

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
