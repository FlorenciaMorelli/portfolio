# Requerimientos

Análisis funcional del portfolio. Define qué tiene que hacer el sitio y bajo qué
condiciones se da por cumplido.

## Objetivo

Tener un portfolio profesional, bilingüe y fácil de mantener, donde los proyectos se
actualicen de la forma más automática posible a partir de mi actividad en GitHub.

## Pre-requisitos

- Cuenta de GitHub con repos públicos.
- Node 20 o superior.
- GitHub Pages habilitado con *source* en GitHub Actions.
- `GITHUB_TOKEN` disponible en CI (lo provee Actions) para no chocar con el límite de
  60 pedidos por hora de la API sin autenticar.

## Requisitos funcionales

| ID | Requisito |
|----|-----------|
| RF1 | Importar automáticamente los repos públicos con topic `portfolio`: nombre, descripción, URL, homepage, topics (tecnologías), lenguaje principal, fecha de último push y última release. |
| RF2 | Permitir enriquecer cada repo con un `.portfolio.json` opcional (categoría, destacado, orden, portada, links extra, descripciones ES/EN). |
| RF3 | Permitir cargar proyectos manuales que no son repos. |
| RF4 | Unificar ambas fuentes, evitar duplicados por slug y ordenar (destacados primero, después por fecha descendente). |
| RF5 | Filtrar proyectos por categoría desde el cliente. |
| RF6 | Ofrecer el sitio en español e inglés, con selector y rutas separadas (`/`, `/en/`). |
| RF7 | Tema claro/oscuro con preferencia recordada y respeto por la del sistema. |
| RF8 | Secciones: inicio, sobre mí, tecnologías, proyectos, contacto y descarga de CV. |
| RF9 | Formulario de contacto funcional sin backend propio. |
| RF10 | Reconstruir y publicar el sitio de forma programada para reflejar repos recién etiquetados sin necesidad de un commit. |

## Requisitos no funcionales

| ID | Requisito | Medida |
|----|-----------|--------|
| RNF1 | Performance | Lighthouse ≥ 95 en Performance, Best Practices y SEO. JS mínimo. |
| RNF2 | Accesibilidad | WCAG 2.1 AA. Sin violaciones críticas o serias en axe. Navegable por teclado. |
| RNF3 | Responsive | De 360px a 1440px+ sin scroll horizontal ni roturas. |
| RNF4 | SEO | Meta tags, Open Graph, `hreflang`, sitemap y datos estructurados de tipo `Person`. |
| RNF5 | Mantenibilidad | Componentes reutilizables, tokens centralizados, datos desacoplados de la vista. |
| RNF6 | Robustez | Si la API de GitHub falla, el build usa el último snapshot y no rompe. |
| RNF7 | Privacidad | Sin rastros de herramientas de generación en commits, código ni metadatos. |

## Criterios de aceptación

- Al etiquetar un repo con el topic `portfolio`, aparece en ambos idiomas tras el
  siguiente build.
- Al quitar el topic, desaparece en el siguiente build.
- Con la API de GitHub caída, el sitio se construye igual usando el snapshot previo.
- Cambiar de idioma mantiene la sección y el tema actuales.
- Las pruebas de accesibilidad y performance cumplen RNF1 y RNF2 en CI.
