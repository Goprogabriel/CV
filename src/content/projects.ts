import type { Project, TimelineEntry } from '@/types/content';

export const projects: Project[] = [
  {
    id: 'partypal', name: 'PartyPal',
    eyebrow: { da: 'Mobilprodukt · udgivet', en: 'Mobile product · shipped' },
    description: { da: 'En social app, der fik 600+ brugere i den første uge og nåede nr. 8 i den danske App Store.', en: 'A social app that gained 600+ users in its first week and reached No. 8 in the Danish App Store.' },
    status: { da: 'Udgivet', en: 'Shipped' },
    problem: { da: 'At gøre koordinering og fælles oplevelser enklere i en mobil kontekst.', en: 'Making coordination and shared experiences simpler in a mobile context.' },
    contribution: { da: 'Produkt, implementering, release og videreudvikling med React Native og Expo.', en: 'Product, implementation, release and iteration with React Native and Expo.' },
    technologies: ['React Native', 'Expo', 'TypeScript', 'App Store'],
    images: [{
      src: '/media/projects/partypal-app-store-ranking.jpg',
      alt: { da: 'PartyPal placeret som nummer 8 i den danske App Store', en: 'PartyPal ranked number 8 in the Danish App Store' },
      caption: { da: 'App Store / nr. 8 i Danmark', en: 'App Store / No. 8 in Denmark' },
      fit: 'contain',
      position: 'center'
    }]
  },
  {
    id: 'busbus', name: 'BUSBUS',
    eyebrow: { da: 'Operationsværktøj · privat projekt', en: 'Operations tool · private project' },
    description: { da: 'Planlægnings- og koordineringsværktøj til frivillige ved Roskilde Festivals største madbod.', en: 'A planning and coordination tool for volunteers at Roskilde Festival’s largest food stand.' },
    status: { da: 'Brugt i driften', en: 'Used in operations' },
    problem: { da: 'At skabe overblik over transport, vagter og mennesker i et hurtigt skiftende miljø.', en: 'Creating clarity across transport, shifts and people in a rapidly changing environment.' },
    contribution: { da: 'Designede arbejdsgangen og byggede løsningen fra behov til drift.', en: 'Designed the workflow and built the solution from need to operations.' },
    technologies: ['TypeScript', 'Operations design', 'Automation'],
    images: [{
      src: '/media/projects/busbus-euroman-article.jpg',
      alt: { da: 'Euroman-artikel om Roskilde Festivals madbod, hvor BUSBUS blev brugt til koordinering', en: 'Euroman article about the Roskilde Festival food stand where BUSBUS supported coordination' },
      caption: { da: 'Euroman / konteksten omkring BUSBUS', en: 'Euroman / the context around BUSBUS' },
      position: 'center 18%'
    }]
  },
  {
    id: 'mobile-lab', name: 'Mobile Systems Lab',
    eyebrow: { da: 'Mobile produkter · løbende', en: 'Mobile products · ongoing' },
    description: { da: 'En række apps, hvor jeg hurtigt omsætter en idé til et produkt, der kan udgives og testes af rigtige brugere.', en: 'A series of apps where I quickly turn an idea into a product that can be shipped and tested by real users.' },
    status: { da: 'Flere apps udgivet', en: 'Multiple apps shipped' },
    problem: { da: 'At validere produktidéer med en rigtig udgivelse frem for kun en prototype.', en: 'Validating product ideas through a real release rather than a prototype alone.' },
    contribution: { da: 'Koncept, design, udvikling, native integration og release.', en: 'Concept, design, development, native integration and release.' },
    technologies: ['Expo', 'React Native', 'Swift'],
    images: [{
      src: '/media/projects/mobile-systems-apps.jpg',
      alt: { da: 'Udvalgte apps udviklet og udgivet af Gabriel Back', en: 'Selected apps developed and shipped by Gabriel Back' },
      caption: { da: 'Udvalgte app-udgivelser', en: 'Selected app releases' },
      fit: 'contain'
    }]
  }
];

export const projectTimelineEntries: TimelineEntry[] = projects.slice(0, 2).map((project, index) => ({
  id: project.id,
  kind: 'project',
  organisation: 'Private project',
  startYear: index === 0 ? 2024 : 2025,
  title: { da: project.name, en: project.name },
  period: project.status,
  overview: project.description,
  details: { da: [project.problem.da, project.contribution.da], en: [project.problem.en, project.contribution.en] },
  technologies: project.technologies,
  images: project.images
}));
