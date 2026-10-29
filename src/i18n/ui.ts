export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

/** Parts of the work a job covers; each has the name and color of a hero mode. */
type Facet = 'analysis' | 'design' | 'development' | 'quality';

interface Job {
  role: string;
  org: string;
  orgUrl?: string;
  period: string;
  facets?: Facet[];
  tech?: string;
  /** Jobs without points are shown in the compact format. */
  points?: string[];
  caseStudy?: { slug: string; label: string };
}

type Dict = {
  meta: { title: string; description: string };
  nav: {
    about: string;
    experience: string;
    projects: string;
    contact: string;
    resume: string;
    resumeLong: string;
    menuOpen: string;
    menuClose: string;
    label: string;
  };
  hero: {
    /** The headline in three parts: on small screens the connector moves to the accent line. */
    title: { lead: string; connector: string; accent: string };
    /** Not shown on the page; feeds the JSON-LD jobTitle. */
    role: string;
    intro: string;
    viewProjects: string;
    contact: string;
    modes: {
      label: string;
      analysis: string;
      design: string;
      development: string;
      quality: string;
    };
    /** `{mode}` is replaced by the active mode name. */
    modeName: string;
    notes: { analysis: string; quality: string };
    tags: { quality: string };
  };
  about: {
    title: string;
    body: string[];
    skillsTitle: string;
    skillsCategories: Record<string, string>;
    photoAlt: string;
    howTitle: string;
    /** One line per facet; the facet names are in `hero.modes`. */
    how: { analysis: string; design: string; development: string; quality: string };
  };
  /** Decorative pieces of «Cómo trabajo» (aria-hidden): a ticket, a design view and a task. */
  lenses: {
    ticket: { kind: string; criteriaTitle: string; criteria: string[] };
    design: { file: string; panel: string; empty: string; layer: string; corners: string; padding: string; gap: string; text: string; fill: string };
    /** `count`: `{n}` and `{total}`; `unitTests`: the same, from the last `npm test` run. */
    task: { title: string; status: [string, string, string]; count: string; unitTests: string; details: string; assignee: string; labels: string; tags: string[] };
  };
  experience: {
    title: string;
    jobs: Job[];
  };
  projects: {
    title: string;
    intro: string;
    filters: Record<string, string>;
    empty: string;
    links: Record<string, string>;
    caseStudy: string;
    sourcedNote: string;
    client: string;
    /** `{studio}` is replaced by the studio name. */
    builtAt: string;
    /** `{n}` is replaced by the number of projects. */
    showAll: string;
  };
  caseStudy: {
    eyebrow: string;
    /** Accessible name of the breadcrumb (Projects / name). */
    breadcrumb: string;
    visit: string;
    studio: string;
    highlights: string;
    more: string;
  };
  contact: {
    title: string;
    intro: string;
    name: string;
    email: string;
    message: string;
    send: string;
  };
  footer: { rights: string };
  theme: { toLight: string; toDark: string };
  lang: { switchTo: string };
  a11y: { skip: string; toTop: string };
};

export const ui: Record<Locale, Dict> = {
  es: {
    meta: {
      title: 'Florencia Morelli - Desarrolladora y analista funcional',
      description:
        'Portfolio de Florencia Morelli, desarrolladora y analista técnico-funcional de Buenos Aires. Integración de sistemas, APIs y desarrollo web, mobile y de videojuegos.',
    },
    nav: {
      about: 'Sobre mí',
      experience: 'Experiencia',
      projects: 'Proyectos',
      contact: 'Contacto',
      resume: 'CV',
      resumeLong: 'Descargar CV',
      menuOpen: 'Abrir menú',
      menuClose: 'Cerrar menú',
      label: 'Principal',
    },
    hero: {
      title: { lead: 'Del requerimiento', connector: 'a', accent: 'producción.' },
      role: 'Desarrolladora y analista técnico-funcional',
      intro:
        'Soy Florencia Morelli, desarrolladora full stack y analista técnico-funcional. Me interesa el desarrollo de productos digitales de principio a fin: del análisis y el diseño al desarrollo, la integración y la calidad.',
      viewProjects: 'Ver proyectos',
      contact: 'Escribime',
      modes: {
        label: 'Ver el titular desde',
        analysis: 'Análisis',
        design: 'Diseño',
        development: 'Desarrollo',
        quality: 'Calidad',
      },
      modeName: 'Modo {mode}',
      notes: {
        analysis: 'Como cliente, quiero tener mi sitio web, para que más gente me conozca.',
        quality: 'Contraste AA · Navegable con teclado · Respeta reduced motion',
      },
      tags: { quality: '3 de 3' },
    },
    about: {
      title: 'Sobre mí',
      body: [
        'Soy desarrolladora y analista técnico-funcional. Trabajo en integración de sistemas, APIs REST/SOAP, análisis de requerimientos y testing, con metodologías Agile/Scrum.',
        'Llegué a la programación desde el diseño UX/UI en 2021 y en diciembre de 2024 me recibí de Técnica Universitaria en Programación de Sistemas en UCES.',
        'Con Juan Tomás Martínez cofundé Guia, donde hice el diseño y el frontend de Audenpass, nuestro primer proyecto. Hoy busco sumarme al desarrollo de productos digitales en general: del diseño y el frontend a la integración y la calidad. También me apasiona el desarrollo de videojuegos.',
      ],
      skillsTitle: 'Tecnologías',
      skillsCategories: {
        web: 'Desarrollo web',
        mobile: 'Mobile',
        games: 'Videojuegos',
        backend: 'Backend',
        data: 'Bases de datos',
        tools: 'Herramientas',
      },
      photoAlt: 'Florencia Morelli con toga y birrete, en su graduación',
      howTitle: 'Cómo trabajo',
      how: {
        analysis: 'Requerimientos, historias de usuario y criterios de aceptación.',
        design: 'Sistemas de diseño y pantallas desktop y mobile en Figma.',
        development: 'Frontends conectados a APIs e integraciones entre sistemas.',
        quality: 'Pruebas, validaciones automatizadas y tests E2E.',
      },
    },
    lenses: {
      ticket: {
        kind: 'Historia de usuario',
        criteriaTitle: 'Criterios de aceptación',
        criteria: [
          'Pasan las pruebas unitarias antes de publicar',
          'Contraste AA en todos los pares, en claro y oscuro',
          'Navegable con teclado, con foco visible',
          'Respeta reduced motion',
        ],
      },
      design: {
        file: 'Portfolio · Rediseño 2026',
        panel: 'Diseño',
        empty: 'Sin selección',
        layer: 'Capa',
        corners: 'Esquinas',
        padding: 'Padding',
        gap: 'Gap',
        text: 'Texto',
        fill: 'Relleno',
      },
      task: {
        title: 'Pruebas UAT satisfactorias',
        status: ['Por hacer', 'En curso', 'Listo'],
        count: '{n} de {total}',
        unitTests: 'Pruebas unitarias en verde ({n} de {total})',
        details: 'Detalles',
        assignee: 'Responsable',
        labels: 'Etiquetas',
        tags: ['pruebas', 'accesibilidad'],
      },
    },
    experience: {
      title: 'Experiencia',
      jobs: [
        {
          role: 'Cofundadora · Desarrolladora frontend y diseñadora UX/UI',
          org: 'Guia (Desarrollos Guia)',
          orgUrl: 'https://desarrollosguia.com/',
          period: 'Sep 2026 – Actualidad',
          facets: ['analysis', 'design', 'development', 'quality'],
          tech: 'React, TypeScript, Tailwind CSS, TanStack Query, OpenAPI, Playwright, Figma',
          points: [
            'Audenpass, el primer proyecto del estudio: una plataforma de venta de entradas para eventos, en producción para un cliente.',
            'Diseño completo en Figma: sistema de diseño, pantallas desktop y mobile y modo oscuro.',
            'Frontend completo en React y TypeScript, conectado a la API a través de un contrato OpenAPI.',
            'Relación con el cliente, planificación, entregas por etapas y pruebas de aceptación.',
            'Del primer commit a producción en unas tres semanas y media, dos días antes de la fecha comprometida.',
          ],
          caseStudy: { slug: 'audenpass', label: 'Leé el caso de estudio de Audenpass' },
        },
        {
          role: 'Analista técnico-funcional',
          org: 'Diagnóstico Maipú - SMG · Laboratory Information Systems (LIS)',
          period: 'Dic 2024 – Actualidad',
          facets: ['analysis', 'quality'],
          tech: 'JSON, XML, APIs REST/SOAP, Postman, Agile',
          points: [
            'Análisis funcional y técnico de requerimientos para módulos críticos del sistema.',
            'Integraciones entre sistemas (LIS, ERP) mediante APIs y servicios web.',
            'Diseño y ejecución de pruebas; automatización de validaciones con Postman y Newman.',
            'Análisis de logs y tráfico entre sistemas para depurar y corregir errores.',
            'Documentación técnica, historias de usuario y criterios de aceptación.',
          ],
        },
        {
          role: 'Desarrolladora web front-end',
          org: 'Enivel7 - Máximo Pinasco / Ford',
          period: 'Ago 2023 – Sep 2023',
          facets: ['development'],
          tech: 'HTML5, CSS3, JavaScript, Responsive',
          points: [
            'Desarrollo de la interfaz web con HTML5, CSS3 y JavaScript.',
            'Diseño responsive para dispositivos móviles y de escritorio.',
            'Integración de elementos interactivos para mejorar la usabilidad.',
          ],
        },
        {
          role: 'Recepcionista y administrativa',
          org: 'Diagnóstico Maipú',
          period: 'May 2020 – Dic 2024',
        },
      ],
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
      caseStudy: 'Ver caso de estudio',
      sourcedNote: 'Catálogo actualizado automáticamente desde GitHub.',
      client: 'Cliente',
      builtAt: 'Desarrollado en {studio}',
      showAll: 'Ver los {n} proyectos',
    },
    caseStudy: {
      eyebrow: 'Caso de estudio',
      breadcrumb: 'Ruta de navegación',
      visit: 'Ver sitio',
      studio: 'Conocé Guia',
      highlights: 'En números',
      more: 'Ver todos los proyectos',
    },
    contact: {
      title: 'Hablemos.',
      intro:
        'Escribime si querés que trabajemos juntos o si tenés alguna consulta. Respondo todo.',
      name: 'Nombre',
      email: 'Email',
      message: 'Mensaje',
      send: 'Enviar',
    },
    footer: {
      rights: 'Todos los derechos reservados.',
    },
    theme: { toLight: 'Cambiar a tema claro', toDark: 'Cambiar a tema oscuro' },
    lang: { switchTo: 'Ver en inglés' },
    a11y: { skip: 'Saltar al contenido', toTop: 'Volver arriba' },
  },
  en: {
    meta: {
      title: 'Florencia Morelli - Developer and functional analyst',
      description:
        'Portfolio of Florencia Morelli, a developer and technical-functional analyst from Buenos Aires. Systems integration, APIs and web, mobile and game development.',
    },
    nav: {
      about: 'About',
      experience: 'Experience',
      projects: 'Projects',
      contact: 'Contact',
      resume: 'Resume',
      resumeLong: 'Download CV',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      label: 'Main',
    },
    hero: {
      title: { lead: 'From requirement', connector: 'to', accent: 'production.' },
      role: 'Developer and technical-functional analyst',
      intro:
        "I'm Florencia Morelli, a full stack developer and technical-functional analyst. I'm interested in building digital products from start to finish: from analysis and design to development, integration and quality.",
      viewProjects: 'View projects',
      contact: 'Get in touch',
      modes: {
        label: 'View the headline as',
        analysis: 'Analysis',
        design: 'Design',
        development: 'Development',
        quality: 'Quality',
      },
      modeName: '{mode} mode',
      notes: {
        analysis: 'As a client, I want my own website, so that more people get to know me.',
        quality: 'AA contrast · Keyboard accessible · Respects reduced motion',
      },
      tags: { quality: '3 of 3' },
    },
    about: {
      title: 'About me',
      body: [
        "I'm a developer and technical-functional analyst. I work on systems integration, REST/SOAP APIs, requirements analysis and testing, using Agile/Scrum.",
        'I came into programming through UX/UI design in 2021 and in December 2024 I earned a Technical Degree in Systems Programming from UCES.',
        "With Juan Tomás Martínez I co-founded Guia, where I did the design and frontend of Audenpass, our first project. These days I want to work on digital products as a whole: from design and frontend to integration and quality. I'm also passionate about game development.",
      ],
      skillsTitle: 'Technologies',
      skillsCategories: {
        web: 'Web',
        mobile: 'Mobile',
        games: 'Games',
        backend: 'Backend',
        data: 'Databases',
        tools: 'Tools',
      },
      photoAlt: 'Florencia Morelli in cap and gown at her graduation',
      howTitle: 'How I work',
      how: {
        analysis: 'Requirements, user stories and acceptance criteria.',
        design: 'Design systems and desktop and mobile screens in Figma.',
        development: 'Frontends connected to APIs and integrations between systems.',
        quality: 'Testing, automated validations and E2E tests.',
      },
    },
    lenses: {
      ticket: {
        kind: 'User story',
        criteriaTitle: 'Acceptance criteria',
        criteria: [
          'Unit tests pass before publishing',
          'AA contrast on every pair, in light and dark',
          'Keyboard accessible, with visible focus',
          'Respects reduced motion',
        ],
      },
      design: {
        file: 'Portfolio · 2026 redesign',
        panel: 'Design',
        empty: 'Nothing selected',
        layer: 'Layer',
        corners: 'Corners',
        padding: 'Padding',
        gap: 'Gap',
        text: 'Text',
        fill: 'Fill',
      },
      task: {
        title: 'UAT tests passed',
        status: ['To do', 'In progress', 'Done'],
        count: '{n} of {total}',
        unitTests: 'Unit tests passing ({n} of {total})',
        details: 'Details',
        assignee: 'Assignee',
        labels: 'Labels',
        tags: ['tests', 'accessibility'],
      },
    },
    experience: {
      title: 'Experience',
      jobs: [
        {
          role: 'Co-founder · Frontend developer and UX/UI designer',
          org: 'Guia (Desarrollos Guia)',
          orgUrl: 'https://desarrollosguia.com/',
          period: 'Sep 2026 – Present',
          facets: ['analysis', 'design', 'development', 'quality'],
          tech: 'React, TypeScript, Tailwind CSS, TanStack Query, OpenAPI, Playwright, Figma',
          points: [
            "Audenpass, the studio's first project: an event ticketing platform, live in production for a client.",
            'End-to-end design in Figma: design system, desktop and mobile screens, and dark mode.',
            'The entire frontend in React and TypeScript, connected to the API through an OpenAPI contract.',
            'Client relationship, planning, staged deliveries and acceptance testing.',
            'From first commit to production in about three and a half weeks, two days ahead of the committed date.',
          ],
          caseStudy: { slug: 'audenpass', label: 'Read the Audenpass case study' },
        },
        {
          role: 'Technical-functional analyst',
          org: 'Diagnóstico Maipú - SMG · Laboratory Information Systems (LIS)',
          period: 'Dec 2024 – Present',
          facets: ['analysis', 'quality'],
          tech: 'JSON, XML, REST/SOAP APIs, Postman, Agile',
          points: [
            'Functional and technical analysis of requirements for critical system modules.',
            'Integrations between systems (LIS, ERP) through APIs and web services.',
            'Design and execution of tests; validation automation with Postman and Newman.',
            'Analysis of logs and traffic between systems to debug and fix errors.',
            'Technical documentation, user stories and acceptance criteria.',
          ],
        },
        {
          role: 'Front-end web developer',
          org: 'Enivel7 - Máximo Pinasco / Ford',
          period: 'Aug 2023 – Sep 2023',
          facets: ['development'],
          tech: 'HTML5, CSS3, JavaScript, Responsive',
          points: [
            'Built the web interface with HTML5, CSS3 and JavaScript.',
            'Responsive design for mobile and desktop devices.',
            'Integration of interactive elements to improve usability.',
          ],
        },
        {
          role: 'Receptionist and administrative assistant',
          org: 'Diagnóstico Maipú',
          period: 'May 2020 – Dec 2024',
        },
      ],
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
      caseStudy: 'Read the case study',
      sourcedNote: 'Catalog updated automatically from GitHub.',
      client: 'Client',
      builtAt: 'Built at {studio}',
      showAll: 'See all {n} projects',
    },
    caseStudy: {
      eyebrow: 'Case study',
      breadcrumb: 'Breadcrumb',
      visit: 'Visit site',
      studio: 'About Guia',
      highlights: 'By the numbers',
      more: 'See all projects',
    },
    contact: {
      title: "Let's talk.",
      intro:
        "Get in touch if you'd like to work together or have a question. I read everything.",
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send',
    },
    footer: {
      rights: 'All rights reserved.',
    },
    theme: { toLight: 'Switch to light theme', toDark: 'Switch to dark theme' },
    lang: { switchTo: 'View in Spanish' },
    a11y: { skip: 'Skip to content', toTop: 'Back to top' },
  },
};
