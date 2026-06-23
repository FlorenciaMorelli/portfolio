# Portfolio

Mi portfolio personal. Sitio estático hecho con [Astro](https://astro.build), con los
proyectos importados desde GitHub y publicado en GitHub Pages.

🔗 https://florenciamorelli.github.io/portfolio/

---

## Cómo correrlo

Requiere Node 20 o superior.

```bash
npm install
npm run dev        # entorno local en http://localhost:4321/portfolio
```

Otros comandos:

```bash
npm run fetch:projects   # actualiza el snapshot de proyectos desde GitHub
npm run build            # genera el sitio en dist/ (corre fetch:projects antes)
npm run preview          # sirve el build de dist/
npm test                 # pruebas unitarias (Vitest)
npm run test:e2e         # pruebas end-to-end (Playwright)
```

## Cómo se arman los proyectos

La lista sale de varias capas que se combinan en el build. La más local gana:

1. **GitHub (automático).** Cualquier repo público con el topic `portfolio` se importa
   solo: descripción, lenguaje, topics (como tecnologías), homepage y última release. El
   resultado queda cacheado en `src/data/projects.generated.json`.
2. **`.portfolio.json`** (opcional, dentro de un repo). Override desde el propio repo.
   Ver [`.portfolio.example.json`](.portfolio.example.json).
3. **`src/data/overrides.json`** (acá, central). El lugar para pulir nombre, descripción
   ES/EN, imagen, categoría, destacado y links de cada proyecto sin tocar los repos.
   Pisa a las capas anteriores.
4. **`src/data/manual-projects.json`.** Trabajos que no son repos (diseño, sitios de
   clientes).

### Sumar un proyecto desde GitHub

1. En el repo, agregar el topic `portfolio` (sección About → engranaje → Topics).
2. Aparece solo en el próximo build con lo que haya en GitHub.

### Pulir un proyecto (recomendado)

Editar `src/data/overrides.json`. La clave es el nombre del repo (o su slug). Las imágenes
pueden ser una URL o una ruta local dentro de `public/` (por ejemplo
`assets/projects/mi-captura.png`). Ejemplo:

```json
{
  "mi-repo": {
    "name": "Nombre lindo",
    "description": { "es": "Texto en español.", "en": "Text in English." },
    "image": "assets/projects/mi-repo.png"
  }
}
```

Los cambios en este archivo se ven en `npm run dev` sin volver a correr el fetch.

El sitio se reconstruye solo una vez por día; para verlo antes, correr el workflow
*Deploy* a mano (Actions → Deploy → Run workflow).

## Idiomas

Español en `/` e inglés en `/en/`. Los textos están en `src/i18n/`.

## Estructura

```
scripts/        importador de GitHub
src/data/       proyectos (generado + manual) y perfil
src/i18n/       textos ES/EN
src/components/ secciones y UI
src/pages/      rutas (es, en, 404)
docs/           análisis, backlog, arquitectura, devops, QA
DESIGN.md       sistema de diseño y guía de contenido
```

## Tecnologías

Astro · TypeScript · CSS · Vitest · Playwright · GitHub Actions
