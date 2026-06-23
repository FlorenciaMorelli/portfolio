export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

type Dict = {
  meta: { title: string; description: string };
  nav: { about: string; projects: string; contact: string; resume: string };
  hero: {
    greeting: string;
    role: string;
    intro: string;
    cta: string;
    viewProjects: string;
  };
  about: {
    title: string;
    body: string[];
    skillsTitle: string;
    photoAlt: string;
  };
  projects: {
    title: string;
    intro: string;
    filters: Record<string, string>;
    empty: string;
    links: Record<string, string>;
    sourcedNote: string;
  };
  contact: {
    title: string;
    intro: string;
    name: string;
    email: string;
    message: string;
    send: string;
  };
  footer: { built: string; rights: string };
  theme: { toLight: string; toDark: string };
  lang: { switchTo: string };
  a11y: { skip: string; toTop: string };
};

export const ui: Record<Locale, Dict> = {
  es: {
    meta: {
      title: 'Florencia Morelli — Desarrolladora de software',
      description:
        'Portfolio de Florencia Morelli, desarrolladora de software de Buenos Aires. Proyectos web, mobile y de videojuegos.',
    },
    nav: {
      about: 'Sobre mí',
      projects: 'Proyectos',
      contact: 'Contacto',
      resume: 'CV',
    },
    hero: {
      greeting: 'Hola, soy',
      role: 'Desarrolladora de software',
      intro:
        'Estudio desarrollo de software en Buenos Aires. Me interesa construir cosas que funcionen bien y aprender lenguajes nuevos por el camino.',
      cta: 'Conocé mi trabajo',
      viewProjects: 'Ver proyectos',
    },
    about: {
      title: 'Sobre mí',
      body: [
        'Soy Florencia Morelli, estudiante de la Tecnicatura en Desarrollo de Software en UCES.',
        'Empecé a programar en 2021. Llegué desde el diseño UX/UI y, mientras armaba interfaces, me terminó ganando la curiosidad por el cómo: lo que pasa detrás de la pantalla.',
        'Hoy me dedico al desarrollo de software y, en especial, al desarrollo de videojuegos.',
        'Acá hay una selección de proyectos de la carrera y algunos personales. Mirá los que te interesen.',
      ],
      skillsTitle: 'Tecnologías',
      photoAlt: 'Florencia Morelli',
    },
    projects: {
      title: 'Proyectos',
      intro: 'Una selección de trabajos académicos, personales y para clientes.',
      filters: {
        All: 'Todos',
        Web: 'Web',
        Mobile: 'Mobile',
        Games: 'Juegos',
        Design: 'Diseño',
      },
      empty: 'No hay proyectos en esta categoría todavía.',
      links: {
        repo: 'Ver repositorio',
        download: 'Descargar',
        website: 'Ver sitio',
        demo: 'Ver demo',
        presentation: 'Ver presentación',
        figma: 'Ver en Figma',
      },
      sourcedNote: 'Actualizado automáticamente desde GitHub.',
    },
    contact: {
      title: 'Hablemos',
      intro:
        'Escribime si querés que trabajemos juntos o si tenés alguna consulta. Respondo todo.',
      name: 'Nombre',
      email: 'Email',
      message: 'Mensaje',
      send: 'Enviar',
    },
    footer: {
      built: 'Hecho con Astro',
      rights: 'Todos los derechos reservados.',
    },
    theme: { toLight: 'Cambiar a tema claro', toDark: 'Cambiar a tema oscuro' },
    lang: { switchTo: 'Ver en inglés' },
    a11y: { skip: 'Saltar al contenido', toTop: 'Volver arriba' },
  },
  en: {
    meta: {
      title: 'Florencia Morelli — Software developer',
      description:
        'Portfolio of Florencia Morelli, a software developer from Buenos Aires. Web, mobile and game projects.',
    },
    nav: {
      about: 'About',
      projects: 'Projects',
      contact: 'Contact',
      resume: 'Resume',
    },
    hero: {
      greeting: "Hi, I'm",
      role: 'Software developer',
      intro:
        'I study software development in Buenos Aires. I like building things that work well and picking up new languages along the way.',
      cta: 'See my work',
      viewProjects: 'View projects',
    },
    about: {
      title: 'About me',
      body: [
        "I'm Florencia Morelli, a Software Development student at UCES.",
        'I started coding in 2021. I came in through UX/UI design and, while putting interfaces together, got hooked on the how — what happens behind the screen.',
        'These days I focus on software development, and game development in particular.',
        "Below is a selection of coursework and personal projects. Have a look at whatever catches your eye.",
      ],
      skillsTitle: 'Technologies',
      photoAlt: 'Florencia Morelli',
    },
    projects: {
      title: 'Projects',
      intro: 'A selection of academic, personal and client work.',
      filters: {
        All: 'All',
        Web: 'Web',
        Mobile: 'Mobile',
        Games: 'Games',
        Design: 'Design',
      },
      empty: 'No projects in this category yet.',
      links: {
        repo: 'View repository',
        download: 'Download',
        website: 'Visit site',
        demo: 'View demo',
        presentation: 'View presentation',
        figma: 'View on Figma',
      },
      sourcedNote: 'Updated automatically from GitHub.',
    },
    contact: {
      title: "Let's talk",
      intro:
        "Get in touch if you'd like to work together or have a question. I read everything.",
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send',
    },
    footer: {
      built: 'Built with Astro',
      rights: 'All rights reserved.',
    },
    theme: { toLight: 'Switch to light theme', toDark: 'Switch to dark theme' },
    lang: { switchTo: 'View in Spanish' },
    a11y: { skip: 'Skip to content', toTop: 'Back to top' },
  },
};
