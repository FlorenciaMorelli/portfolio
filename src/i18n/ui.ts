export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

interface Job {
  role: string;
  org: string;
  period: string;
  tech?: string;
  points: string[];
}

type Dict = {
  meta: { title: string; description: string };
  nav: { about: string; experience: string; projects: string; contact: string; resume: string };
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
    skillsCategories: Record<string, string>;
    photoAlt: string;
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
      title: 'Florencia Morelli — Desarrolladora y analista funcional',
      description:
        'Portfolio de Florencia Morelli, desarrolladora y analista técnico-funcional de Buenos Aires. Integración de sistemas, APIs y desarrollo web, mobile y de videojuegos.',
    },
    nav: {
      about: 'Sobre mí',
      experience: 'Experiencia',
      projects: 'Proyectos',
      contact: 'Contacto',
      resume: 'CV',
    },
    hero: {
      greeting: 'Hola, soy',
      role: 'Desarrolladora y analista técnico-funcional',
      intro:
        'Trabajo en integración de sistemas, APIs y testing, y construyo proyectos web, mobile y de videojuegos. Me interesa el desarrollo frontend y los productos digitales.',
      cta: 'Conocé mi trabajo',
      viewProjects: 'Ver proyectos',
    },
    about: {
      title: 'Sobre mí',
      body: [
        'Soy desarrolladora y analista técnico-funcional. Trabajo en integración de sistemas, APIs REST/SOAP, análisis de requerimientos y testing, con metodologías Agile/Scrum.',
        'Llegué a la programación desde el diseño UX/UI en 2021 y me formé en la Tecnicatura Universitaria en Programación de Sistemas en UCES.',
        'Hoy busco sumar mi perfil de desarrollo web y frontend en productos digitales. También me apasiona el desarrollo de videojuegos.',
        'Acá hay una selección de proyectos académicos, personales y para clientes. Mirá los que te interesen.',
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
      photoAlt: 'Florencia Morelli',
    },
    experience: {
      title: 'Experiencia',
      jobs: [
        {
          role: 'Analista técnico-funcional',
          org: 'Diagnóstico Maipú — SMG · Laboratory Information Systems (LIS)',
          period: 'Dic 2024 – Actualidad',
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
          org: 'Enivel7 — Máximo Pinasco / Ford',
          period: 'Ago 2023 – Sep 2023',
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
          period: 'Jul 2021 – Dic 2024',
          points: [
            'Optimización de procesos administrativos y documentación operativa.',
            'Coordinación interáreas, gestión de datos y capacitación de personal.',
          ],
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
      title: 'Florencia Morelli — Developer and functional analyst',
      description:
        'Portfolio of Florencia Morelli, a developer and technical-functional analyst from Buenos Aires. Systems integration, APIs and web, mobile and game development.',
    },
    nav: {
      about: 'About',
      experience: 'Experience',
      projects: 'Projects',
      contact: 'Contact',
      resume: 'Resume',
    },
    hero: {
      greeting: "Hi, I'm",
      role: 'Developer and technical-functional analyst',
      intro:
        'I work on systems integration, APIs and testing, and I build web, mobile and game projects. I am drawn to frontend development and digital products.',
      cta: 'See my work',
      viewProjects: 'View projects',
    },
    about: {
      title: 'About me',
      body: [
        "I'm a developer and technical-functional analyst. I work on systems integration, REST/SOAP APIs, requirements analysis and testing, using Agile/Scrum.",
        'I came into programming through UX/UI design in 2021 and trained as a Systems Programming Technician at UCES.',
        "These days I'm looking to bring my web and frontend development into digital products. I'm also passionate about game development.",
        'Below is a selection of academic, personal and client projects. Have a look at whatever catches your eye.',
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
      photoAlt: 'Florencia Morelli',
    },
    experience: {
      title: 'Experience',
      jobs: [
        {
          role: 'Technical-functional analyst',
          org: 'Diagnóstico Maipú — SMG · Laboratory Information Systems (LIS)',
          period: 'Dec 2024 – Present',
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
          org: 'Enivel7 — Máximo Pinasco / Ford',
          period: 'Aug 2023 – Sep 2023',
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
          period: 'Jul 2021 – Dec 2024',
          points: [
            'Streamlined administrative processes and operational documentation.',
            'Cross-team coordination, data management and staff training.',
          ],
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
