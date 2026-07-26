export interface ShowcaseProject {
  id: string;
  name: string;
  category: string;
  status: string;
  summary: string;
  contribution: string;
  technologies: string[];
  image: string;
  imageAlt: string;
  imageFit?: 'cover' | 'contain';
  imagePosition?: string;
}

export const showcaseProjects: ShowcaseProject[] = [
  {
    id: 'open-dictate',
    name: 'Open Dictate',
    category: 'Desktop product',
    status: 'In development',
    summary:
      'A native voice-dictation app for macOS and Windows. Hold a shortcut, speak naturally, and insert polished text into the app you were already using.',
    contribution:
      'Product direction, interface design, desktop architecture, native integrations, secure local storage, transcription flows and billing infrastructure.',
    technologies: ['Tauri', 'Rust', 'React', 'TypeScript', 'Firebase'],
    image: '/media/projects/open-dictate-app.jpg',
    imageAlt: 'Open Dictate onboarding screen showing its voice-to-text workflow',
    imagePosition: 'center top'
  },
  {
    id: 'busbus',
    name: 'BUSBUS',
    category: 'Festival operations',
    status: 'Live in use',
    summary:
      'A registration and coordination system for the volunteer team behind BUSBUS, a large food stand at Roskilde Festival.',
    contribution:
      'Mapped the volunteer journey and built the public sign-up flow, group handling, confirmations and the administration tools used before the festival.',
    technologies: ['JavaScript', 'Firebase', 'HTML', 'CSS', 'Operations'],
    image: '/media/projects/busbus-site.jpg',
    imageAlt: 'The BUSBUS volunteer registration website on mobile',
    imagePosition: 'center top'
  },
  {
    id: 'partypal',
    name: 'PartyPal',
    category: 'Social iOS app',
    status: 'Shipped',
    summary:
      'A social app for finding nearby parties through swiping and matching. It gained more than 600 users in its first week and reached No. 8 in the Danish App Store.',
    contribution:
      'Took the product from concept and interface design through implementation, App Store release and early user growth.',
    technologies: ['React Native', 'Expo', 'TypeScript', 'App Store'],
    image: '/media/projects/partypal-app-store-ranking.jpg',
    imageAlt: 'PartyPal shown at number eight in the Danish App Store',
    imageFit: 'contain'
  },
  {
    id: 'sidste-runde',
    name: 'Sidste Runde',
    category: 'Party game',
    status: 'On the App Store',
    summary:
      'A pass-the-phone party game built around funny, awkward and unexpected prompts that reveal how well a group of friends knows each other.',
    contribution:
      'Designed the game loop, built the mobile experience and handled the complete iOS publishing process.',
    technologies: ['iOS', 'Mobile product', 'Game design', 'App Store'],
    image: '/media/projects/sidste-runde-app-store.jpg',
    imageAlt: 'Sidste Runde product page in the App Store',
    imagePosition: 'center top'
  },
  {
    id: 'nomad-crm',
    name: 'CRM — Nomad',
    category: 'Internal platform',
    status: 'In daily use',
    summary:
      'A purpose-built CRM and operations platform that brings bookings, customer data, tasks, access and reporting into one working system.',
    contribution:
      'Own the product end to end, from workflow discovery and data modelling to architecture, dashboards, integrations, releases and day-to-day operation.',
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Cloudflare', 'APIs'],
    image: '/media/experience/crm-dashboard.jpg',
    imageAlt: 'Nomad CRM dashboard with booking metrics, charts and a location map',
    imageFit: 'contain'
  },
  {
    id: 'nomad-properties',
    name: 'Nomad Properties',
    category: 'Company website',
    status: 'Live',
    summary:
      'The public website for a property operations company managing homes, holiday rentals, hotels, guest communication, cleaning and preparation.',
    contribution:
      'Created a clear multilingual product and service story with a responsive editorial interface built for owners, guests, companies and hotel operators.',
    technologies: ['Web design', 'Responsive UI', 'Content', 'SEO'],
    image: '/media/projects/nomad-properties-site.jpg',
    imageAlt: 'Nomad Properties website home page on mobile',
    imagePosition: 'center top'
  },
  {
    id: 'flower',
    name: 'Flower',
    category: 'Interactive web app',
    status: 'Live',
    summary:
      'A playful bouquet builder where people choose a base, flowers and a personal note, then share the finished digital bouquet through a link.',
    contribution:
      'Built the responsive builder, shareable URL format and animated bouquet-opening experience as a small, complete consumer product.',
    technologies: ['Next.js', 'TypeScript', 'Framer Motion', 'GitHub Pages'],
    image: '/media/projects/flower-site.jpg',
    imageAlt: 'Flower bouquet builder website on mobile',
    imagePosition: 'center top'
  },
  {
    id: 'get-tested',
    name: 'GetTestedNow',
    category: 'Health service',
    status: 'Live',
    summary:
      'A privacy-minded service for sending respectful, anonymous health notifications that encourage a previous contact to get tested.',
    contribution:
      'Designed a calm, direct flow around a sensitive task, including recipient handling, transparent pricing, safeguards and multilingual content.',
    technologies: ['Product design', 'Web app', 'Payments', 'SMS', 'Localization'],
    image: '/media/projects/gettested-site.jpg',
    imageAlt: 'GetTestedNow anonymous health notification flow on mobile',
    imagePosition: 'center top'
  }
];
