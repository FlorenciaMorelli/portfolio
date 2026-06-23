# QA

Estrategia de pruebas para sostener la robustez del sitio.

## Niveles

### Unitarias — Vitest

`tests/unit/`. Cubren la lógica que no depende de la red:

- `normalize.test.mjs`: slug, inferencia de categoría, armado de tecnologías y links,
  descripciones por idioma y normalización completa de un repo.
- `projects.test.ts`: el merge de proyectos no deja slugs duplicados, ubica los
  destacados primero, mantiene descripciones en ambos idiomas y respeta el orden de
  categorías.

```bash
npm test
```

### End-to-end y accesibilidad — Playwright

`tests/e2e/`. Levantan el build real y verifican comportamiento de usuario:

- La home carga hero y proyectos.
- El filtro por categoría muestra solo las tarjetas correctas.
- El cambio de tema persiste tras recargar.
- El cambio de idioma navega a `/en/` y actualiza el atributo `lang`.
- axe no reporta violaciones críticas ni serias (WCAG A/AA).
- La home en inglés muestra la navegación traducida.

Se corre en Chrome de escritorio y en un viewport mobile.

```bash
npx playwright install   # una vez, para bajar los navegadores
npm run test:e2e
```

## Checklist manual antes de publicar

- [ ] Responsive de 360px a 1440px sin scroll horizontal.
- [ ] Navegación completa por teclado, foco visible.
- [ ] Tema oscuro y claro con contraste correcto.
- [ ] Links de cada proyecto abren a destino.
- [ ] Formulario de contacto envía y redirige bien.
- [ ] Lighthouse ≥ 95 en Performance, Best Practices y SEO.
- [ ] Sin rastros de herramientas de generación en el diff.

## Robustez del importador

El caso de la API caída se cubre por diseño: el script atrapa los errores, conserva el
snapshot previo y termina con código 0, así el build nunca se cae por GitHub. La forma
rápida de probarlo es correr `npm run fetch:projects` con un `GITHUB_TOKEN` inválido y
confirmar que `projects.generated.json` no se vacía.
