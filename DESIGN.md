# Diseño

Sistema visual y guía de contenido del portfolio. La identidad evoluciona, no se reemplaza:
se mantienen navy, teal y lila con su aire técnico, y se rehacen la jerarquía, la escala
tipográfica, el espaciado y los componentes.

La fuente de verdad del diseño es el archivo de Figma
[Portfolio · Rediseño 2026](https://www.figma.com/design/Vd4boF5oBKaKZbjetAVhEc/Portfolio-%C2%B7-Redise%C3%B1o-2026),
con las páginas Portada, Fundamentos, Componentes, Home, Caso de estudio y Exploraciones. En
código, la fuente de verdad es `src/styles/tokens.css`. Este documento dice cómo se
corresponden.

**Estado:** diseño aprobado, pendiente de implementación. Los nombres CSS marcados como
nuevos todavía no existen en `tokens.css`; se crean en el P0 del plan del final.

## Principios

- Lo importante se entiende en 10 segundos: quién soy, qué hago y un trabajo real.
- El trabajo es el protagonista; la decoración se usa poco y con intención.
- Cada sección tiene su propia forma (dos columnas, lista, banda, grilla), así no se parecen
  entre sí.
- Movimiento sutil, siempre respetando `prefers-reduced-motion`.
- Accesible de entrada: contraste AA en todos los pares, foco visible y orden lógico.

## Color

Tres capas, igual que en Figma:

1. **Primitivos**: los valores crudos. Ningún componente los usa directo.
2. **Tema**: variables semánticas con un valor para claro y otro para oscuro. En CSS cambian
   según `data-theme`.
3. **Dimensiones**: espaciado, radios y bordes (ver más abajo).

En Figma, el plan gratuito permite un solo modo por colección, así que el tema vive en dos
colecciones con los mismos nombres: «Tema claro» y «Tema oscuro». Una pantalla pasa de un
tema al otro cambiando la colección. En CSS es una sola lista de variables con dos bloques
(`[data-theme='light']` y `[data-theme='dark']`).

### Primitivos

| Figma | CSS | Valor | Uso principal |
|-------|-----|-------|---------------|
| `navy/900` | `--navy-900` (alias `--brand-navy`) | `#000033` | Marca. Texto en claro, fondo en oscuro |
| `navy/850` | `--navy-850` | `#06063a` | Banda de proyectos en oscuro |
| `navy/800` | `--navy-800` | `#0c0c3a` | Superficies en oscuro |
| `navy/700` | `--navy-700` | `#1e1e5a` | Superficie alternativa y acento suave en oscuro |
| `navy/600` | `--navy-600` | `#2c2c5c` | Bordes en oscuro |
| `navy/500` | `--navy-500` | `#4a4a86` | Bordes fuertes y deshabilitado en oscuro |
| `lila/100` | `--lilac-100` | `#d2d2ff` | Hover del acento en oscuro |
| `lila/200` | `--lilac-200` (alias `--brand-lilac`) | `#bbbbf8` | Marca. Acento en oscuro |
| `lila/400` | `--lilac-400` | `#b9b9d6` | Texto secundario en oscuro |
| `lila/600` | `--lilac-600` | `#8a8ab0` | Texto terciario en oscuro |
| `teal/100` | `--teal-100` | `#e0f0f2` | Acento suave en claro |
| `teal/300` | `--teal-300` | `#5fd4c4` | Cursor «Análisis» en oscuro |
| `teal/500` | `--teal-500` (alias `--brand-teal`) | `#007788` | Marca. Logo, portada OG y CV |
| `teal/600` | `--teal-600` (alias `--brand-teal-text`) | `#006d7c` | Acento en claro (texto AA sobre papel) |
| `teal/700` | `--teal-700` (alias `--brand-teal-strong`) | `#00606e` | Hover del acento en claro |
| `gris/0` | `--gray-0` (alias `--white`) | `#ffffff` | Superficies en claro |
| `gris/50` | `--gray-50` | `#f5f5f7` | Superficie alternativa y banda en claro |
| `gris/100` | `--gray-100` | `#ececf0` | Fondo en claro |
| `gris/200` | `--gray-200` (alias `--paper`) | `#e3e3e3` | Marca. Texto en oscuro |
| `gris/300` | `--gray-300` | `#d9d9e1` | Bordes en claro |
| `gris/400` | `--gray-400` | `#b4b4c4` | Bordes fuertes y deshabilitado en claro |
| `gris/600` | `--gray-600` | `#616173` | Texto terciario en claro |
| `gris/700` | `--gray-700` | `#3a3a52` | Texto secundario en claro |

Primitivos con transparencia (solo para sombras):

| Figma | Valor |
|-------|-------|
| `sombra/navy-08`, `sombra/navy-12`, `sombra/navy-16` | `#000033` al 8, 12 y 16 % |
| `sombra/negro-40`, `sombra/negro-55`, `sombra/negro-65` | `#000000` al 40, 55 y 65 % |
| `brillo/teal-30` | `#006d7c` al 30 % |
| `brillo/lila-35` | `#bbbbf8` al 35 % |

Cambios respecto de la versión anterior: el fondo claro pasa de `#e3e3e3` a `#ececf0` (el
papel queda como texto del tema oscuro) y `--gray-100`, `--gray-300` y `--gray-500` cambian
de valor.

### Tema (semánticos)

| Figma | CSS | Claro | Oscuro |
|-------|-----|-------|--------|
| `fondo/base` | `--bg` | `gris/100` | `navy/900` |
| `fondo/superficie` | `--surface` (reemplaza `--bg-elevated`) | `gris/0` | `navy/800` |
| `fondo/superficie-alt` | `--surface-alt` | `gris/50` | `navy/700` |
| `fondo/banda` | `--bg-band` (nuevo) | `gris/50` | `navy/850` |
| `fondo/canvas-punto` | `--canvas-dot` (nuevo) | `gris/300` | `navy/600` |
| `texto/principal` | `--text` | `navy/900` | `gris/200` |
| `texto/secundario` | `--text-muted` | `gris/700` | `lila/400` |
| `texto/terciario` | `--text-faint` | `gris/600` | `lila/600` |
| `texto/acento` | `--accent` | `teal/600` | `lila/200` |
| `texto/sobre-acento` | `--accent-contrast` | `gris/0` | `navy/900` |
| `texto/deshabilitado` | `--text-disabled` (nuevo) | `gris/400` | `navy/500` |
| `borde/sutil` | `--border` | `gris/300` | `navy/600` |
| `borde/fuerte` | `--border-strong` (nuevo) | `gris/400` | `navy/500` |
| `acento/base` | `--accent` | `teal/600` | `lila/200` |
| `acento/hover` | `--accent-strong` | `teal/700` | `lila/100` |
| `acento/suave` | `--accent-soft` (ahora sólido) | `teal/100` | `navy/700` |
| `marca/logo` | `--brand` (nuevo) | `teal/500` | `lila/200` |
| `foco/anillo` | `--focus` (nuevo) | `teal/600` | `lila/200` |
| `cursor/analisis` · `cursor/texto-analisis` | `--cursor-analysis` · `--cursor-analysis-text` | `teal/500` · `gris/0` | `teal/300` · `navy/900` |
| `cursor/diseno` · `cursor/texto-diseno` | `--cursor-design` · `--cursor-design-text` | `lila/200` · `navy/900` | `lila/200` · `navy/900` |
| `cursor/desarrollo` · `cursor/texto-desarrollo` | `--cursor-dev` · `--cursor-dev-text` | `navy/900` · `gris/0` | `gris/200` · `navy/900` |
| `cursor/calidad` · `cursor/texto-calidad` | `--cursor-qa` · `--cursor-qa-text` | `gris/600` · `gris/0` | `lila/600` · `navy/900` |
| `sombra/suave`, `media`, `fuerte` | dentro de `--shadow-1`, `-2`, `-3` | `sombra/navy-08`, `-12`, `-16` | `sombra/negro-40`, `-55`, `-65` |
| `sombra/brillo-acento` | dentro de `--glow-accent` | `brillo/teal-30` | `brillo/lila-35` |

`texto/acento` y `acento/base` tienen el mismo valor y en CSS comparten `--accent`. Están
separados en Figma porque tienen alcances distintos (texto o relleno). `--bg-sunken` deja de
usarse.

### Contraste

Los 27 pares de texto y fondo del sistema pasan AA (4,5:1) en los dos temas. El más bajo es
`texto/terciario` sobre `fondo/superficie-alt` en oscuro, con 4,57:1. La tabla completa está
en Fundamentos › Contraste AA. Quedan fuera los cursores inactivos (al 35 %, decorativos y
con `aria-hidden`) y el texto deshabilitado, que WCAG exceptúa.

## Tipografía

- **Geist** para todo el sitio.
- **Geist Mono** para datos, fechas, tecnologías y anotaciones.
- **Instrument Serif Italic** solo en dos lugares: la palabra acento del titular del hero y el
  título «Hablemos.» de Contacto, que cierra la página con el mismo gesto.

Las tres están en Google Fonts: se cambia la URL del `@import` de `global.css` y el
`preconnect` sigue igual. No se suma ninguna dependencia.

Los estilos Desktop rigen desde 768 px y los Mobile por debajo. Los estilos Base son iguales en
los dos.

| Figma | CSS (propuesta) | Desktop | Mobile |
|-------|-----------------|---------|--------|
| `Desktop/Display titular` · `Mobile/…` | `--text-display` | Geist SemiBold 80/88, -2 % | 44/50, -2 % |
| `Desktop/Display acento` · `Mobile/…` | `--text-display-accent` | Instrument Serif Italic 96/100 | 52/56 |
| `Desktop/H2` · `Mobile/H2` | `--text-h2` | Geist SemiBold 48/56, -1,5 % | 32/40, -1 % |
| `Desktop/H2 acento` · `Mobile/H2 acento` | `--text-h2-accent` | Instrument Serif Italic 60/64 | 42/46 |
| `Desktop/H3` · `Mobile/H3` | `--text-h3` | Geist SemiBold 28/36, -1 % | 24/32, -0,5 % |
| `Desktop/H4` · `Mobile/H4` | `--text-h4` | Geist SemiBold 20/28 | 18/26 |
| `Desktop/Cifra` · `Mobile/Cifra` | `--text-stat` | Geist SemiBold 56/60, -2 % | 40/44, -2 % |
| `Desktop/Cuerpo destacado` · `Mobile/…` | `--text-lead` | Geist Regular 18/29 | 17/27 |
| `Base/Cuerpo` | `--text-base` | Geist Regular 16/26 | igual |
| `Base/Cuerpo chico` | `--text-sm` | Geist Regular 14/22 | igual |
| `Base/Botón` | `--text-button` | Geist SemiBold 15/20 | igual |
| `Base/Nav` | `--text-nav` | Geist Medium 14/20 | igual |
| `Base/Etiqueta` | `--text-label` | Geist Medium 13/18 | igual |
| `Base/Mono` | `--text-mono` | Geist Mono Regular 13/20 | igual |
| `Base/Mono chico` | `--text-mono-sm` | Geist Mono Medium 11/16 | igual |

`--font-sans` pasa a `'Geist', system-ui, sans-serif`, `--font-mono` a `'Geist Mono',
ui-monospace, monospace` y se suma `--font-accent: 'Instrument Serif', Georgia, serif`. La
escala modular 1.2 (`--text-xs` a `--text-4xl`) se reemplaza por los nombres de la tabla.

## Espaciado, radios y bordes

Escala en base 4. En CSS, el número del token pasa a ser el múltiplo de 4, igual que en
Figma, así que algunos nombres cambian de valor:

| Figma | CSS nuevo | px | CSS anterior |
|-------|-----------|----|--------------|
| `espacio/1` | `--space-1` | 4 | `--space-1` |
| `espacio/2` | `--space-2` | 8 | `--space-2` |
| `espacio/3` | `--space-3` | 12 | `--space-3` |
| `espacio/4` | `--space-4` | 16 | `--space-4` |
| `espacio/5` | `--space-5` | 20 | (nuevo; antes `--space-5` era 24) |
| `espacio/6` | `--space-6` | 24 | `--space-5` |
| `espacio/8` | `--space-8` | 32 | `--space-6` |
| `espacio/10` | `--space-10` | 40 | (nuevo) |
| `espacio/12` | `--space-12` | 48 | `--space-7` |
| `espacio/16` | `--space-16` | 64 | `--space-8` |
| `espacio/20` | `--space-20` | 80 | (nuevo) |
| `espacio/24` | `--space-24` | 96 | `--space-9` |
| `espacio/30` | `--space-30` | 120 | (nuevo) |

| Figma | CSS | px | Uso |
|-------|-----|----|-----|
| `radio/xs` | `--radius-xs` (nuevo) | 4 | Etiquetas, anotaciones, foco de links |
| `radio/sm` | `--radius-sm` | 8 (antes 6) | Botones de icono, controles del header |
| `radio/md` | `--radius-md` | 10 | Botones y campos |
| `radio/lg` | `--radius-lg` | 14 (antes 16) | Barra de modos |
| `radio/xl` | `--radius-xl` (nuevo) | 16 | Tarjetas, foto, bloques |
| `radio/pill` | `--radius-pill` | 999 | Filtros y cursores |
| `borde/ancho` | `--border-width` (nuevo) | 1 | Todos los bordes |
| `foco/ancho` · `foco/separacion` | en `:focus-visible` | 2 · 2 | Anillo de foco |

## Elevación y foco

| Figma | CSS | Claro | Oscuro | Uso |
|-------|-----|-------|--------|-----|
| `Elevación/…/1` | `--shadow-1` | `0 1px 2px` navy 8 % | `0 1px 2px` negro 40 % | Tarjetas en reposo |
| `Elevación/…/2` | `--shadow-2` | `0 8px 24px` navy 12 % | `0 8px 24px` negro 55 % | Hover de tarjetas, barra de modos, capturas |
| `Elevación/…/3` | `--shadow-3` | `0 16px 40px` navy 16 % | `0 16px 40px` negro 65 % | Menús y diálogos |
| `Elevación/…/Brillo acento` | `--glow-accent` | `0 8px 24px` teal 30 % | `0 0 28px` lila 35 % | Solo el hover del botón primario |
| `Foco/Claro` · `Foco/Oscuro` | `:focus-visible` | anillo `teal/600` | anillo `lila/200` | Todo lo interactivo |

En Figma, el foco es una sombra con spread (2 px del fondo y 4 px del anillo). En CSS sigue
siendo `outline: 2px solid var(--focus); outline-offset: 2px`, como hoy.

## Grilla y breakpoints

| | Mobile (< 768 px) | Desktop (≥ 1024 px) |
|--|-------------------|---------------------|
| Figma | `Grilla/Mobile 390` | `Grilla/Desktop 1440` |
| Columnas | 4 | 12 |
| Medianil | 16 px | 24 px |
| Márgenes | 20 px | 120 px |
| Contenedor | fluido | 1200 px (`--container-max: 75rem`) |

Entre 768 y 1023 px no hay pantalla diseñada: se resuelve con la grilla fluida, con
`--container-pad: clamp(1.25rem, 8.33vw, 7.5rem)`. Los breakpoints quedan en 768 px
(tipografía y layout de una columna) y 1024 px (grilla de 12 columnas). Los cortes viejos de
480 y 860 px se eliminan.

## Movimiento

Se mantienen los tokens actuales: `--ease: cubic-bezier(0.22, 0.61, 0.36, 1)`,
`--dur-fast: 140ms`, `--dur: 240ms` y `--dur-slow: 420ms`.

- Tarjetas: en hover se «seleccionan» como en Figma: borde `--accent` y cuatro manijas en las
  esquinas, en `--dur`. Con reduced motion el cambio es instantáneo.
- Botón primario: en hover, `--accent-strong` y `--glow-accent`.
- Link con flecha: en hover, la flecha se separa 4 px.
- Hero: está especificado en Exploraciones › «Hero lienzo · Ficha de interacción».
- Con `prefers-reduced-motion: reduce`, todos los cambios son instantáneos y los cursores del
  hero no siguen al mouse.

## Componentes

Cada componente de Figma tiene una descripción con su uso y su accesibilidad. Esta es la
correspondencia con el código:

| Figma | Código |
|-------|--------|
| Botón, Botón icono, Link, Etiqueta | `.btn` y utilidades de `global.css`; `Icon.astro` |
| Header, Enlace de navegación, Selector de idioma, Cambio de tema, Botón menú, Logo | `Header.astro`, `LangSwitcher.astro`, `ThemeToggle.astro` |
| Hero, Anotación, Cursor, Botón de modo, Barra de modos | `Hero.astro` |
| Bloque Sobre mí | `About.astro` |
| Encabezado de sección | componente nuevo, usado en todas las secciones |
| Ítem de experiencia, Faceta | `Experience.astro` |
| Filtros, Filtro, Caso destacado, Tarjeta de proyecto | `Projects.astro`, `ProjectCard.astro` y un componente nuevo para el caso destacado |
| Contacto, Campo | `Contact.astro` |
| Footer, Enlace social | `Footer.astro` |
| Encabezado del caso, Ficha, Cifra destacada, Par de capturas, Bloque de texto, Bloque Qué incluye, Tarjeta de decisión, Bloque stack | `CaseStudyPage.astro` |

Los íconos siguen siendo SVG inline (`Icon.astro`), con el set de Lucide como referencia de
trazo. Ya existen `menu`, `close`, `sun`, `moon`, `download`, `github`, `linkedin`, las
flechas y `external` (que cubre la flecha diagonal de los botones de icono). Faltan
`pen-tool`, `code-xml`, `check-check`, `clipboard-list`, `mouse-pointer-2`, `mail` y
`check`.

## Voz y contenido

Tono en primera persona, cercano y concreto: el sitio le habla a quien lo visita. Lo que se
evita:

- Frases de relleno o grandilocuentes.
- Pretítulos y etiquetas decorativas encima de los títulos.
- Emojis decorativos y signos de exclamación encadenados.
- Estructuras demasiado simétricas o repetitivas.
- La raya como signo de puntuación.

Audenpass se presenta como lo que es: un desarrollo para un cliente, hecho en Guia. No es un
negocio propio. Los lenguajes y herramientas van en Sobre mí y en cada proyecto, no en la
presentación.

Los textos viven en `src/i18n/ui.ts`, en castellano rioplatense con voseo y en inglés, a la
par. Las descripciones de proyectos salen de GitHub; si hace falta matizarlas por idioma, se
usa `.portfolio.json`.

## Plan de implementación del rediseño

Orden propuesto para la etapa de código. Cada bloque sale en una rama `feature/*` desde
`develop` y sigue el flujo `feature/*` → PR con squash → `develop` → PR con squash →
`staging` → PR con «Create a merge commit» → `main`. Los commits van en Conventional Commits
con la identidad de Florencia, sin `Co-authored-by` ni firmas. Esta sección se borra cuando
el rediseño esté implementado.

### P0. Lo que se ve en los primeros 10 segundos

1. **Tokens y fuentes** (`tokens.css`, `global.css`, `BaseLayout.astro`)
   - Reescribir primitivos, tema y dimensiones según las tablas de arriba, con alias para los
     nombres de marca actuales.
   - Renombrar el espaciado en todos los componentes (`--space-5` → `--space-6` y siguientes).
   - Cambiar el `@import` de Google Fonts a Geist, Geist Mono e Instrument Serif.
   - `:focus-visible` con `--focus`.
   - Breakpoints a 768 y 1024 px; `--container-max: 75rem`.
2. **Header** (`Header.astro`, `LangSwitcher.astro`, `ThemeToggle.astro`)
   - Enlace activo según la sección visible, con `aria-current`.
   - Selector «ES / EN», ícono de tema y «CV» como botón fantasma.
   - Menú mobile de pantalla completa, con `aria-expanded` y bloqueo del scroll.
   - Fondo transparente sobre el hero; al hacer scroll pasa a `--bg` con borde inferior.
3. **Hero** (`Hero.astro`, `ui.ts`)
   - Titular «Del requerimiento a producción.», con «producción.» en `--font-accent`. En mobile
     el corte es «Del requerimiento / a producción.».
   - Texto nuevo y botones «Ver proyectos» y «Escribime».
   - Lienzo con grilla de puntos (`--canvas-dot`), caja de selección, anotación, cuatro
     cursores y barra de modos, según la ficha de interacción: `radiogroup`, flechas,
     `aria-live`, sin JS queda el modo Diseño y la barra se oculta.
4. **Proyectos** (`Projects.astro`, `ProjectCard.astro`, `manual-projects.json`, `ui.ts`)
   - Banda con `--bg-band`.
   - Audenpass sale de la grilla y va en un bloque «Caso destacado» de 12 columnas, sobre el
     lienzo con grilla de puntos: «Cliente · Desarrollado en Guia», descripción, tres cifras
     (`highlights` de `case-studies.json`), «Ver caso de estudio» y enlace al sitio. A la
     derecha, el par de capturas dentro de una caja de selección con la etiqueta
     «audenpass.com». Hace falta un campo nuevo en `manual-projects.json` (por ejemplo
     `"client": true`).
   - Debajo, una fila pareja de 3 tarjetas estándar (2 en mobile).
   - Tarjeta estándar: categoría, institución, hasta 3 tecnologías y links como botones de
     icono con `aria-label`. El título es un enlace extendido (stretched link) que cubre
     la tarjeta y lleva al destino principal; los botones de icono quedan por encima, sin
     anidar enlaces.
   - Se muestran 4 proyectos (el destacado y 3 tarjetas) y el botón «Ver los {n} proyectos» despliega el resto. Con un
     filtro activo se ven todos los de esa categoría.

### P1. El resto de la home y el caso de estudio

5. **Sobre mí** (`About.astro`, `profile.json`, `public/assets/img/`, `ui.ts`)
   - Foto nueva: la de graduación con los verdes llevados al teal, recortada en 4:5 (800 ×
     1000). Va como `public/assets/img/me-2026.jpg` (o `.webp`) y se actualiza
     `profile.photo`.
   - Segundo párrafo: «…y en diciembre de 2024 me recibí de Técnica Universitaria en
     Programación de Sistemas en UCES.» / «…and in December 2024 I graduated as a Systems
     Programming Technician from UCES.».
   - «Cómo trabajo» con las cuatro facetas (Análisis, Diseño, Desarrollo, Calidad), cada una
     con el color de su cursor del hero (`--cursor-*`), y las
     tecnologías como listas compactas por grupo, en lugar de chips.
6. **Experiencia** (`Experience.astro`)
   - Fecha y modalidad en una columna, y el detalle en la otra.
   - Chips de facetas debajo del rol, con los colores de los cursores: Guia (Diseño, Desarrollo,
     Calidad), SMG (Análisis, Calidad) y Enivel7 (Desarrollo). Hace falta un campo `facets`
     por puesto en `ui.ts`.
   - El puesto de recepcionista pasa a formato compacto, sin bullets.
7. **Caso de estudio** (`CaseStudyPage.astro`)
   - Ruta «Proyectos / Audenpass» en lugar del pretítulo y del «Volver».
   - Etiqueta «Cliente · Desarrollado en Guia».
   - Ficha, portada con el par de capturas y cifras en tarjetas.
   - Bloques de texto en dos columnas, «Qué incluye» con checks en dos columnas, tarjetas de
     decisión numeradas y stack.
8. **Contacto y footer** (`Contact.astro`, `Footer.astro`)
   - Título «Hablemos.» con `--text-h2-accent` en `--accent`.
   - Dos columnas: texto y enlaces directos (mail, LinkedIn y GitHub) a la izquierda, y el
     formulario actual de formsubmit en una tarjeta a la derecha.
   - Campos con etiqueta visible y foco de acento.
   - Footer con logo, legales y enlaces sociales. Se quita «Hecho con Astro» (`footer.built` deja de usarse).

### P2. Calidad

9. **Estados**: hover, foco, activo y deshabilitado en botones, links, filtros, tarjetas y
   campos, según la página Componentes.
10. **Tema oscuro**: revisar cada sección con `data-theme='dark'`, sombras incluidas.
11. **Tests**:
    - Actualizar `tests/e2e/home.spec.ts` y `case-study.spec.ts` con los nuevos selectores, el
      botón «Ver los {n} proyectos» y la barra de modos (teclado y `aria-live`).
    - Mantener los chequeos de axe en los dos temas.
    - Ajustar `tests/unit/projects.test.ts` si cambia el modelo de proyecto.

### P3. Coherencia fuera del sitio

12. `scripts/generate-og.mjs` y `scripts/generate-cv.mjs` usan hex y fuentes propios: pasarlos
    a los valores nuevos y a Geist.
13. Al terminar, borrar esta sección y la de «Cambios respecto de la versión anterior».

### Textos nuevos para `ui.ts`

Son propuestas en castellano e inglés, para validar antes de implementar:

| Clave sugerida | Castellano | Inglés |
|----------------|------------|--------|
| `hero.title` | Del requerimiento a producción. | From requirement to production. |
| `hero.intro` | Soy Florencia Morelli, desarrolladora full stack y analista técnico-funcional. Me interesa el desarrollo de productos digitales de principio a fin: del análisis y el diseño al frontend, la integración y la calidad. | I'm Florencia Morelli, a full stack developer and technical-functional analyst. I'm interested in building digital products from start to finish: from analysis and design to frontend, integration and quality. |
| `hero.contact` | Escribime | Get in touch |
| `hero.modes.label` | Ver el titular desde | View the headline as |
| `hero.modes.*` | Análisis, Diseño, Desarrollo, Calidad | Analysis, Design, Development, Quality |
| `hero.notes.analysis` | Que en 10 segundos entiendas qué hago y cómo trabajo. | In 10 seconds, you know what I do and how I work. |
| `hero.notes.quality` | Contraste AA · Navegable con teclado · Respeta reduced motion | AA contrast · Keyboard accessible · Respects reduced motion |
| `about.howTitle` | Cómo trabajo | How I work |
| `about.how.analysis` | Requerimientos, historias de usuario y criterios de aceptación. | Requirements, user stories and acceptance criteria. |
| `about.how.design` | Sistemas de diseño y pantallas desktop y mobile en Figma. | Design systems and desktop and mobile screens in Figma. |
| `about.how.dev` | Frontends conectados a APIs e integraciones entre sistemas. | Frontends connected to APIs and integrations between systems. |
| `about.how.quality` | Pruebas, validaciones automatizadas y tests E2E. | Testing, automated validations and E2E tests. |
| `projects.client` | Cliente | Client |
| `projects.builtAt` | Desarrollado en {studio} | Built at {studio} |
| `projects.showAll` | Ver los {n} proyectos | See all {n} projects |
