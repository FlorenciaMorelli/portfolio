# Diseño

Sistema visual y guía de contenido del portfolio. La idea es evolucionar la identidad que
ya venía usando, no reemplazarla: misma paleta y tipografías, mejor estructura.

## Principios

- Claridad antes que decoración. El trabajo es el protagonista.
- Espacio en blanco generoso y una jerarquía tipográfica marcada.
- Movimiento sutil, siempre respetando `prefers-reduced-motion`.
- Accesible de entrada: contraste, foco visible y orden lógico.

## Color

Definido en `src/styles/tokens.css`. Paleta base:

| Token | Valor | Uso |
|-------|-------|-----|
| Navy | `#000033` | Texto en claro, fondo en oscuro |
| Teal | `#007788` | Acento en tema claro |
| Lilac | `#bbbbf8` | Acento en tema oscuro |
| Paper | `#e3e3e3` | Fondo en tema claro |

Los componentes nunca usan estos valores directo: leen variables semánticas
(`--bg`, `--text`, `--accent`, `--border`, etc.) que cambian según `data-theme`. Para
agregar o ajustar un color, se toca solo el archivo de tokens.

## Tipografía

- **Fira Mono** para títulos, etiquetas y datos. Le da el aire técnico.
- **Poppins** para el cuerpo.
- Escala modular de razón 1.2, con variables `--text-xs` a `--text-4xl`.

## Espaciado y layout

- Escala de espaciado en base 4 (`--space-1` … `--space-9`).
- Contenedor con ancho máximo legible (`--container-max`) y padding fluido, en lugar del
  ancho rígido anterior.
- Grilla de proyectos con `auto-fill` y `minmax`, que se adapta sola a cada pantalla.
- Breakpoints de referencia: 480, 768, 860 y 1024px.

## Componentes

Header, Hero, Sobre mí, Proyectos (filtros + tarjetas), Contacto y Footer. Cada uno vive
en `src/components/` con sus estilos acotados. Los íconos son SVG inline
(`Icon.astro`), sin fuente de íconos externa.

## Voz y contenido

Tono en primera persona, cercano y concreto. Lo que se evita:

- Frases de relleno o grandilocuentes.
- Emojis decorativos y signos de exclamación encadenados.
- Estructuras demasiado simétricas o repetitivas.

Los textos viven en `src/i18n/ui.ts`, en español e inglés. Las descripciones de proyectos
salen de GitHub; si hace falta matizarlas por idioma, se usa `.portfolio.json`.
