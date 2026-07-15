import type { CaseStudy, TimelineEntry } from '@/types/content';

export const experience: TimelineEntry[] = [
  {
    id: 'nomad', kind: 'experience', organisation: 'Nomad Properties', startYear: 2026,
    title: { da: 'Head of IT', en: 'Head of IT' },
    period: { da: '2026 — nu', en: '2026 — present' },
    overview: { da: 'Ejer det tekniske produktlandskab og udvikler virksomhedens CRM- og driftssystem.', en: 'Own the technical product landscape and build the company’s CRM and operations system.' },
    details: {
      da: ['Byggede platformen fra datamodel og API’er til dashboards og brugerflows.', 'Forbinder forretningsbehov med sikker arkitektur, integrationer og stabil drift.'],
      en: ['Built the platform from data model and APIs to dashboards and user flows.', 'Connect business needs with secure architecture, integrations and reliable operations.']
    },
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Cloudflare Workers', 'REST APIs', 'Auth'],
    logo: '/media/company-logos/nomad-properties.png'
  },
  {
    id: 'estatetool', kind: 'experience', organisation: 'Estatetool A/S', startYear: 2025,
    title: { da: 'Supporter & QA Specialist', en: 'Support & QA Specialist' },
    period: { da: '2025 — 2026', en: '2025 — 2026' },
    overview: { da: 'Gjorde brugerfeedback og fejl til konkrete produktforbedringer.', en: 'Turned user feedback and issues into concrete product improvements.' },
    details: {
      da: ['Fejlsøgte, kvalitetssikrede releases og dokumenterede reproducerbare fejl.', 'Skabte en kortere vej fra kundeproblem til produktbeslutning.'],
      en: ['Troubleshot, quality-assured releases and documented reproducible issues.', 'Created a shorter path from customer problem to product decision.']
    },
    technologies: ['QA', 'Troubleshooting', 'Release testing', 'Customer feedback'],
    logo: '/media/company-logos/estatetool.png'
  },
  {
    id: 'we-are-safe', kind: 'experience', organisation: 'We are Safe', startYear: 2022,
    title: { da: 'Support, Customer Success & Key Accounts', en: 'Support, Customer Success & Key Accounts' },
    period: { da: '2022 — 2025', en: '2022 — 2025' },
    overview: { da: 'Voksede fra teknisk support til ledelse, customer success og key accounts.', en: 'Progressed from technical support into leadership, customer success and key accounts.' },
    details: {
      da: ['Tog ansvar for supportkvalitet, kunderelationer og interne arbejdsgange.', 'Brugte CRM, SQL og Firebase til at skabe overblik og forbedringer.'],
      en: ['Owned support quality, customer relationships and internal workflows.', 'Used CRM, SQL and Firebase to create visibility and improvements.']
    },
    technologies: ['CRM', 'SQL', 'Firebase', 'Customer Success', 'Operations'],
    logo: '/media/company-logos/we-are-safe.png'
  },
  {
    id: 'roskilde', kind: 'volunteer', organisation: 'Roskilde Festival', startYear: 2024,
    title: { da: 'Frivillig — bl.a. driftsansvarlig for beredskabet', en: 'Volunteer — including Operations Lead for Emergency Response' },
    period: { da: '2024 — nu', en: '2024 — present' },
    overview: { da: 'Driftsansvar og koordinering i et miljø, hvor beslutninger skal fungere med det samme.', en: 'Operational ownership and coordination where decisions must work immediately.' },
    details: {
      da: ['Koordinerer kritisk information mellem frivillige, politi og brandvæsen.', 'Byggede BUSBUS til planlægning og koordinering af frivillige.'],
      en: ['Coordinate critical information across volunteers, police and fire services.', 'Built BUSBUS to plan and coordinate volunteers.']
    },
    technologies: ['Operations', 'Coordination', 'BUSBUS'],
    logo: '/media/company-logos/roskilde-festival.png'
  }
];

export const caseStudies: CaseStudy[] = [
  {
    id: 'crm-platform', organisation: 'Nomad Properties',
    title: { da: 'CRM fra data til daglig drift', en: 'CRM from data to daily operations' },
    situation: { da: 'Bookingdata, opgaver og rapportering var fordelt på flere arbejdsgange.', en: 'Booking data, tasks and reporting were spread across several workflows.' },
    challenge: { da: 'Flere datakilder, roller og krav til sikker adgang.', en: 'Multiple data sources, roles and secure access requirements.' },
    responsibility: { da: 'Produkt, datamodel, arkitektur, kode, release og drift.', en: 'Product, data model, architecture, code, release and operations.' },
    work: { da: 'Dashboard, bookingflow, auth, integrationer og automation.', en: 'Dashboard, booking flows, authentication, integrations and automation.' },
    result: { da: 'Én platform, der omsætter data til handling i driften.', en: 'One platform turning data into operational action.' },
    learning: { da: 'Den bedste tekniske løsning begynder med at kortlægge ansvar og undtagelser i arbejdsgangen.', en: 'The best technical solution begins by mapping ownership and exceptions in the workflow.' },
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Cloudflare', 'REST APIs'],
    images: [
      {
        src: '/media/experience/crm-dashboard.jpg',
        alt: { da: 'Dashboard i CRM- og driftssystemet med bookingtal, grafer og lokationskort', en: 'CRM and operations dashboard with booking metrics, charts and a location map' },
        caption: { da: 'Dashboard / driftsoverblik', en: 'Dashboard / operational overview' },
        fit: 'contain'
      },
      {
        src: '/media/experience/crm-profile-preview.jpg',
        alt: { da: 'Profilvisning i CRM-systemet med kontakt- og udlejningsdata', en: 'CRM profile view with contact and rental data' },
        caption: { da: 'Profilvisning / samlet kundedata', en: 'Profile view / consolidated customer data' },
        fit: 'contain'
      }
    ]
  },
  {
    id: 'support-loop', organisation: 'Estatetool A/S · We are Safe',
    title: { da: 'Support som produktinput', en: 'Support as product input' },
    situation: { da: 'Kundeteams ser ofte fejlmønstre først.', en: 'Customer teams often see issue patterns first.' },
    challenge: { da: 'Feedback skulle være konkret og reproducerbar.', en: 'Feedback had to be concrete and reproducible.' },
    responsibility: { da: 'Fejlsøgning, QA, release-test og formidling.', en: 'Troubleshooting, QA, release testing and communication.' },
    work: { da: 'Gjorde observationer til prioriterbare produktinput.', en: 'Turned observations into actionable product input.' },
    result: { da: 'Kortere vej fra kundeproblem til teknisk beslutning.', en: 'A shorter path from customer problem to technical decision.' },
    learning: { da: 'Support er en produktfunktion, når signalerne behandles systematisk.', en: 'Support becomes a product function when its signals are handled systematically.' },
    technologies: ['QA', 'Release testing', 'SQL', 'CRM', 'Customer Success'],
    images: []
  }
];
