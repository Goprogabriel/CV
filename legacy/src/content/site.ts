import type { Localized } from '@/types/content';

export const site = {
  name: 'Gabriel Back',
  monogram: 'GB',
  title: {
    da: 'Gabriel Back - Full-stack, teknisk produkt & drift',
    en: 'Gabriel Back - Full-stack, technical product & operations'
  } satisfies Localized,
  description: {
    da: 'Interaktivt CV og portfolio for Gabriel Back - Head of IT, full-stack udvikler og teknisk produktprofil i København.',
    en: 'Interactive CV and portfolio for Gabriel Back - Head of IT, full-stack developer and technical product professional in Copenhagen.'
  } satisfies Localized,
  availability: {
    da: 'Åben for roller og samarbejder, hvor produkt, udvikling og drift skal hænge sammen.',
    en: 'Open to roles and collaborations where product, development and operations must work as one.'
  } satisfies Localized,
  loaderWords: {
    da: ['Teknologi', 'Drift', 'Produkter', 'Systemer', 'Mennesker'],
    en: ['Technology', 'Operations', 'Products', 'Systems', 'People']
  } satisfies Localized<string[]>,
  nav: {
    profile: { da: 'Profil', en: 'Profile' },
    path: { da: 'Forløb', en: 'Path' },
    work: { da: 'Arbejde', en: 'Work' },
    projects: { da: 'Projekter', en: 'Projects' },
    contact: { da: 'Kontakt', en: 'Contact' }
  },
  liveUrl: 'https://goprogabriel.github.io/cv/',
  repositoryUrl: 'https://github.com/Goprogabriel/cv'
};
