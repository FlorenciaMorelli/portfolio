# Diseño

Sistema visual y guía de contenido del portfolio. La identidad evoluciona, no se reemplaza:
se mantienen navy, teal y lila con su aire técnico, y se rehacen la jerarquía, la escala
tipográfica, el espaciado y los componentes.

La fuente de verdad del diseño es el archivo de Figma
[Portfolio · Rediseño 2026](https://www.figma.com/design/Vd4boF5oBKaKZbjetAVhEc/Portfolio-%C2%B7-Redise%C3%B1o-2026),
con las páginas Portada, Fundamentos, Componentes, Home, Caso de estudio, Movimiento v2 y
Exploraciones. Las pantallas «· v2» de Home y Caso de estudio son el estado a implementar. En
código, la fuente de verdad es `src/styles/tokens.css`. Este documento dice cómo se
corresponden.

**Estado:** implementado. La portada OG y el CV generados leen sus colores y fuentes de
`tokens.css` y `global.css`, así que cambian junto con el sistema. La segunda etapa
(movimiento por scroll, elementos de código y footer nuevo) se implementa en los PR
`feature/movimiento-*`.

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
| `navy/750` | `--navy-750` | `#182a4f` | Fondo de las líneas agregadas del diff en oscuro |
| `navy/700` | `--navy-700` | `#1e1e5a` | Superficie alternativa y acento suave en oscuro |
| `navy/600` | `--navy-600` | `#2c2c5c` | Bordes en oscuro |
| `navy/500` | `--navy-500` | `#4a4a86` | Bordes fuertes y deshabilitado en oscuro |
| `lila/100` | `--lilac-100` | `#d2d2ff` | Hover del acento en oscuro |
| `lila/200` | `--lilac-200` (alias `--brand-lilac`) | `#bbbbf8` | Marca. Acento en oscuro |
| `lila/400` | `--lilac-400` | `#b9b9d6` | Texto secundario en oscuro |
| `lila/600` | `--lilac-600` | `#8a8ab0` | Texto terciario en oscuro |
| `lila/700` | `--lilac-700` | `#5c4fa0` | Funciones del código en claro |
| `teal/100` | `--teal-100` | `#e0f0f2` | Acento suave en claro |
| `teal/200` | `--teal-200` | `#8fe3d6` | Propiedades del código en oscuro |
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

### Tema (semánticos)

| Figma | CSS | Claro | Oscuro |
|-------|-----|-------|--------|
| `fondo/base` | `--bg` | `gris/100` | `navy/900` |
| `fondo/superficie` | `--surface` (reemplaza `--bg-elevated`) | `gris/0` | `navy/800` |
| `fondo/superficie-alt` | `--surface-alt` | `gris/50` | `navy/700` |
| `fondo/banda` | `--bg-band` | `gris/50` | `navy/850` |
| `fondo/canvas-punto` | `--canvas-dot` | `gris/400` | `navy/600` |
| `texto/principal` | `--text` | `navy/900` | `gris/200` |
| `texto/secundario` | `--text-muted` | `gris/700` | `lila/400` |
| `texto/terciario` | `--text-faint` | `gris/600` | `lila/600` |
| `texto/acento` | `--accent` | `teal/600` | `lila/200` |
| `texto/sobre-acento` | `--accent-contrast` | `gris/0` | `navy/900` |
| `texto/deshabilitado` | `--text-disabled` | `gris/400` | `navy/500` |
| `borde/sutil` | `--border` | `gris/300` | `navy/600` |
| `borde/fuerte` | `--border-strong` | `gris/400` | `navy/500` |
| `acento/base` | `--accent` | `teal/600` | `lila/200` |
| `acento/hover` | `--accent-strong` | `teal/700` | `lila/100` |
| `acento/suave` | `--accent-soft` (ahora sólido) | `teal/100` | `navy/700` |
| `marca/logo` | `--brand` | `teal/500` | `lila/200` |
| `foco/anillo` | `--focus` | `teal/600` | `lila/200` |
| `cursor/analisis` · `cursor/texto-analisis` | `--cursor-analysis` · `--cursor-analysis-text` | `teal/500` · `gris/0` | `teal/300` · `navy/900` |
| `cursor/diseno` · `cursor/texto-diseno` | `--cursor-design` · `--cursor-design-text` | `lila/200` · `navy/900` | `lila/200` · `navy/900` |
| `cursor/desarrollo` · `cursor/texto-desarrollo` | `--cursor-dev` · `--cursor-dev-text` | `navy/900` · `gris/0` | `gris/200` · `navy/900` |
| `cursor/calidad` · `cursor/texto-calidad` | `--cursor-qa` · `--cursor-qa-text` | `gris/600` · `gris/0` | `lila/600` · `navy/900` |
| `cursor/*-inactivo` · `cursor/texto-*-inactivo` | `--cursor-analysis-idle`, `--cursor-design-idle`, `--cursor-dev-idle`, `--cursor-qa-idle` · `…-idle-text` | ver abajo · `navy/900` | ver abajo · `gris/0` |
| `sombra/suave`, `media`, `fuerte` | dentro de `--shadow-1`, `-2`, `-3` | `sombra/navy-08`, `-12`, `-16` | `sombra/negro-40`, `-55`, `-65` |
| `sombra/brillo-acento` | dentro de `--glow-accent` | `brillo/teal-30` | `brillo/lila-35` |

La grilla de puntos es la variable `--canvas-dot`, no una imagen: la usan el hero, el caso
destacado y el footer.

**Cursores inactivos.** Son el cursor al 35 % sobre `fondo/base`, en color sólido (ya no se
usa opacidad). Son valores crudos, como en Figma:

| Figma | CSS | Claro | Oscuro |
|-------|-----|-------|--------|
| `cursor/analisis-inactivo` | `--cursor-analysis-idle` | `#99c3cc` | `#214a66` |
| `cursor/diseno-inactivo` | `--cursor-design-idle` | `#dbdbf3` | `#414178` |
| `cursor/desarrollo-inactivo` | `--cursor-dev-idle` | `#9999ae` | `#4f4f71` |
| `cursor/calidad-inactivo` | `--cursor-qa-idle` | `#bbbbc4` | `#30305f` |

**Código.** Colores del panel de editor, el diff y los resultados de pruebas:

| Figma | CSS | Claro | Oscuro |
|-------|-----|-------|--------|
| `codigo/fondo` | `--code-bg` | `gris/50` | `navy/800` |
| `codigo/linea-activa` | `--code-line-active` | `gris/100` | `navy/700` |
| `codigo/texto` | `--code-text` | `navy/900` | `gris/200` |
| `codigo/comentario` | `--code-comment` | `gris/600` | `lila/600` |
| `codigo/palabra-clave` | `--code-keyword` | `teal/700` | `lila/200` |
| `codigo/cadena` | `--code-string` | `navy/500` | `teal/300` |
| `codigo/funcion` | `--code-function` | `lila/700` | `lila/100` |
| `codigo/numero` | `--code-number` | `gris/700` | `lila/400` |
| `codigo/propiedad` | `--code-property` | `teal/600` | `teal/200` |
| `codigo/numero-linea` | `--code-line-number` | `gris/600` | `lila/600` |
| `codigo/diff-agregado-fondo` · `-texto` | `--code-diff-add-bg` · `--code-diff-add-text` | `teal/100` · `teal/700` | `navy/750` · `teal/300` |
| `codigo/diff-quitado-fondo` · `-texto` | `--code-diff-del-bg` · `--code-diff-del-text` | `gris/100` · `gris/700` | `navy/700` · `lila/400` |

**Contribuciones.** Días del calendario de trabajo. Se usan 0 (sin trabajo), 2 (un trabajo) y
4 (dos trabajos); 1 y 3 quedan definidos.

| Figma | CSS | Claro | Oscuro |
|-------|-----|-------|--------|
| `contribuciones/0` | `--contrib-0` | `gris/300` | `navy/700` |
| `contribuciones/1` | `--contrib-1` | `#b2d3d8` | `#404073` |
| `contribuciones/2` | `--contrib-2` | `#80b6be` | `#646499` |
| `contribuciones/3` | `--contrib-3` | `#40929d` | `#8f8fc8` |
| `contribuciones/4` | `--contrib-4` | `teal/600` | `lila/200` |

`texto/acento` y `acento/base` tienen el mismo valor y en CSS comparten `--accent`. Están
separados en Figma porque tienen alcances distintos (texto o relleno). `--bg-sunken` deja de
usarse.

### Contraste

Los 27 pares de texto y fondo del sistema pasan AA (4,5:1) en los dos temas. El más bajo es
`texto/terciario` sobre `fondo/superficie-alt` en oscuro, con 4,57:1. La tabla completa está
en Fundamentos › Contraste AA. Queda fuera solo el texto deshabilitado, que WCAG exceptúa.

Los 22 pares del código, el diff y los cursores inactivos también pasan AA en los dos temas
(Fundamentos › «Contraste AA · Código»). El más bajo es `codigo/comentario` y
`codigo/numero-linea` sobre `codigo/linea-activa` en oscuro, con 4,57:1. Un test unitario
(`tests/unit/tokens.test.mjs`) los calcula desde `tokens.css`.

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
| `espacio/10` | `--space-10` | 40 | |
| `espacio/12` | `--space-12` | 48 | `--space-7` |
| `espacio/16` | `--space-16` | 64 | `--space-8` |
| `espacio/20` | `--space-20` | 80 | |
| `espacio/24` | `--space-24` | 96 | `--space-9` |
| `espacio/30` | `--space-30` | 120 | |

| Figma | CSS | px | Uso |
|-------|-----|----|-----|
| `radio/xs` | `--radius-xs` | 4 | Etiquetas, anotaciones, foco de links |
| `radio/sm` | `--radius-sm` | 8 (antes 6) | Botones de icono, controles del header |
| `radio/md` | `--radius-md` | 10 | Botones y campos |
| `radio/lg` | `--radius-lg` | 14 (antes 16) | Barra de modos |
| `radio/xl` | `--radius-xl` | 16 | Tarjetas, foto, bloques |
| `radio/pill` | `--radius-pill` | 999 | Filtros y cursores |
| `borde/ancho` | `--border-width` | 1 | Todos los bordes |
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

Entre 768 y 1023 px se usa la grilla fluida, con
`--container-pad: clamp(1.25rem, 8.33vw, 7.5rem)`. El hero tiene su pantalla a 820 px
(«Hero · 820»): titular en dos líneas, «Del requerimiento» a 64/72 y «a producción.» a 76/80,
sin cursores. Son estilos propios del hero, no tokens. Los breakpoints quedan en 768 px
(tipografía y layout de una columna) y 1024 px (grilla de 12 columnas). Los cortes viejos de
480 y 860 px se eliminan.

## Movimiento

Se mantienen los tokens: `--ease: cubic-bezier(0.22, 0.61, 0.36, 1)`, `--dur-fast: 140ms`,
`--dur: 240ms` y `--dur-slow: 420ms`. El detalle está en Figma, página «Movimiento v2»: nueve
fichas con fotogramas de 0, 50 y 100 % y la tabla de 27 microinteracciones.

**Reglas**

- Solo se mueven `transform` y `opacity`.
- Con más presencia que en las fichas: `.reveal` entra desde 32 px, los checks de «Qué incluye» crecen desde .2 y la anotación del caso destacado sube 20 px. El calendario de trabajo queda como en la ficha.
- Con `prefers-reduced-motion: reduce` y sin JavaScript se ve el estado final, estático.
- Los elementos que se mueven son decorativos (`aria-hidden`) y lo que cambia con el scroll no
  se anuncia. El contenido real ya está en el HTML.
- Cada movimiento cuenta algo (un criterio que se cumple, un día trabajado, una línea que se
  escribe); no es adorno.

**Un solo mecanismo.** `src/lib/motion.ts` (observers compartidos, `watch` y `reveal`) y
las reglas de `global.css`. Cada componente lo importa; no se arma otro:

- «Una vez al entrar»: `.reveal`, con variantes por atributo (escalonado, retraso y pasos
  internos).
- «Ligado al progreso del scroll»: `[data-scroll]` anima `--p` de 0 a 1, con ease in-out (arranca y frena suave), con
  `animation-timeline: view()` dentro de `@supports`, en el tramo de `--scroll-range`. Los
  hijos lo traducen a `opacity` y `transform` con `var(--p, 1)`. Sin soporte, queda el estado
  final. No hay JavaScript que lea el layout en cada frame. Soporte: Chrome 115, Safari 26 y
  Firefox 159.
- El indicador de sección del header usa el mismo observer.

**Un hilo conductor: las cuatro lentes.** Los cuatro cursores del hero salen del hero y recorren la
página (desde 1280 px y con movimiento). Cada uno pertenece a una lente y a una sección: Análisis a
Sobre mí, Desarrollo a Experiencia, Diseño a Proyectos y Calidad a Contacto. Al salir, el rótulo pasa
del nombre de la lente al de la sección; flotan en los márgenes y, cuando el título de su sección
se acerca, el cursor va al título y hace clic: el título queda seleccionado, con una caja y cuatro
manijas del color de la lente, como en el lienzo. Después se va con el título. La rayita del header
toma el color de la lente de la sección a la vista (`--lens-ink-*`). El footer reúne los cuatro.
Los títulos y el texto no cambian de color: el de Diseño no tendría contraste AA. Las posiciones se
miden una vez (al cargar y al cambiar el tamaño), nunca mientras se scrollea.

**Profundidad.** Es el movimiento que recorre toda la página: el contenido no sube por la pantalla,
viene hacia vos. Cada bloque (`.reveal`, `.depth`) crece desde un poco más chico mientras sube y
aparece, y se aleja, más chico y más tenue, al salir. El hero retrocede igual con la primera
pantalla de scroll. Es CSS puro atado al scroll (`view()` y `scroll()`), solo `transform` y
`opacity`; sin soporte, sin JS o con reduced motion rige el fundido de `.reveal` o la página estática.

**Fichas**

| Ficha | Lugar | Disparador |
|-------|-------|------------|
| 1 | Sobre mí · Cómo trabajo: miniatura de cada lente (opacity .35 a 1, 40 px a 0 y escala .88 a 1) | Progreso del scroll; el hover la completa |
| 2 | Experiencia · Calendario de trabajo | Progreso del scroll |
| 3 | Proyectos · anotación «E2E» del caso destacado | Una vez al entrar |
| 4 | Caso de estudio · Qué incluye | Progreso del scroll |
| 5 | Caso de estudio · Decisiones técnicas | Afuera por ahora: no hay fragmentos publicables de Audenpass |
| 6 | Caso de estudio · Stack | Una vez al entrar |
| 7 | Contacto | Sin movimiento por scroll |
| 8 | De la home al caso de estudio | Al navegar |
| 9 | Header · Indicador de sección | Sección visible (40 % de la ventana) |

**Microinteracciones (resumen)**

- Tarjetas: en hover se «seleccionan» como en Figma: borde `--accent`, manijas de escala .6 a
  1 y `--shadow-1`, en `--dur`.
- Botón primario: en hover, `--accent-strong` y `--glow-accent`; activo, baja 1 px y sin
  brillo.
- Enlace en línea: color `--accent-strong` y subrayado de 1 a 2 px. Enlace con flecha: la
  flecha se separa 4 px.
- Cursores del hero: siguen al mouse con un desplazamiento máximo de 10 a 12 px, cada uno con
  su retardo y su fase, y derivan ±3 px en reposo.
- Cambio de tema: el ícono se cruza (sol y luna); los colores de la página cambian sin animar.
- Envío del formulario: Enviar, Enviando, Enviado y Error, anunciados con `aria-live`. El
  error usa ícono, texto y borde fuerte; no hay color de error en el sistema.
- De la home al caso: transiciones de vista nativas del navegador entre documentos
  (`@view-transition`), sin el router de Astro, así los scripts de cada página arrancan como
  siempre. Sin soporte o con reduced motion, es una navegación común.

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
| Ticket de requerimiento, Vista de diseño, Panel de editor, Detalle de tarea | miniaturas de «Cómo trabajo» en Sobre mí (decorativas, `aria-hidden`) |
| Calendario de trabajo | Experiencia, arriba de la lista de puestos (decorativo; los años son botones reales) |
| Footer · Lienzo | `Footer.astro` |

Los componentes de código son decorativos: `aria-hidden`, sin foco y sin scroll interno. En
mobile usan fragmentos más cortos, con «…», sin wrap. Su estado estático es «Completo». Los
números que muestran (pruebas, líneas, contraste, días) salen del repositorio o del build,
nunca de un valor fijo. Terminal, Flujo, Verificador de contraste y Marcas de accesibilidad
están dibujados en Figma pero no se usan en ninguna pantalla.

**Footer nuevo (Lienzo).** Caja de selección con etiqueta de medida y manijas, cursores en
las esquinas (ocultos en mobile) y grilla de puntos. Contenido: logo, «© año · Todos los
derechos reservados.», «Buenos Aires, Argentina» (`cv.json`), GitHub, LinkedIn y volver
arriba. Plan B aprobado: la dirección «README».

**Dónde se suman los elementos nuevos**

- Experiencia: el calendario de trabajo reemplaza las líneas entre puestos.
- Proyectos: el caso destacado suma la anotación «E2E · n suites con Playwright».
- Caso de estudio: «Qué incluye» suma «n de n criterios cumplidos» y «Stack» pasa a archivo
  de dependencias.

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

Datos de la segunda etapa: Guia lleva cuatro facetas (Análisis, Diseño, Desarrollo y Calidad)
y no lleva «Remoto» en la columna de fechas. Diagnóstico Maipú empieza en mayo de 2020. La
nota de Proyectos dice «Catálogo actualizado automáticamente desde GitHub.».

Audenpass se presenta como lo que es: un desarrollo para un cliente, hecho en Guia. No es un
negocio propio. Los lenguajes y herramientas van en Sobre mí y en cada proyecto, no en la
presentación.

Los textos viven en `src/i18n/ui.ts`, en castellano rioplatense con voseo y en inglés, a la
par. Las descripciones de proyectos salen de GitHub; si hace falta matizarlas por idioma, se
usa `.portfolio.json`.
