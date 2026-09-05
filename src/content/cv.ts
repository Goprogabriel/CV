export type Language = 'da' | 'en';
export type Section = 'about' | 'projects' | 'experience' | 'skills' | 'contact' | 'cv';
export type AppId = Section | 'terminal' | 'browser' | 'files' | 'editor' | 'settings';
export interface Project {
  id: string;
  name: string;
  category: string;
  year: string;
  summary: string;
  description: string;
  stack: string[];
  highlights: string[];
  accent: string;
  symbol: string;
  image?: string;
  url?: string;
}
export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  stack: string[];
  current?: boolean;
}
export interface CVContent {
  profile: {
    name: string;
    username: string;
    role: string;
    location: string;
    availability: string;
    tagline: string;
    bio: string[];
    interests: string[];
    facts: { value: string; label: string }[];
  };
  projects: Project[];
  experience: Experience[];
  skills: { name: string; description: string; items: string[] }[];
  education: { degree: string; school: string; period: string; description: string }[];
  contact: {
    email: string;
    phone: string;
    note: string;
    links: { label: string; url: string; display: string }[];
  };
}
// Facts verified against https://goprogabriel.github.io/cv/ and its existing
// project archive on 2026-09-05. Wording is edited; dates/metrics are not invented.
export const sourceURL = 'https://goprogabriel.github.io/cv/';
function makeCV(language: Language): CVContent {
  const t = (da: string, en: string) => (language === 'da' ? da : en);
  return {
    profile: {
      name: 'Gabriel Back',
      username: 'gabriel',
      role: t(
        'Head of IT · Full-stack udvikling · Teknisk produkt',
        'Head of IT · Full-stack engineering · Technical product',
      ),
      location: t('København, Danmark', 'Copenhagen, Denmark'),
      availability: t('Åben for det rette samarbejde', 'Open to the right collaboration'),
      tagline: t(
        'Fra et reelt behov til et produkt, der virker.',
        'From a real-world need to a product that works.',
      ),
      bio: [
        t(
          'Jeg bygger digitale produkter og tager ansvar for hele vejen fra idé til drift. Som Head of IT hos Nomad Properties forbinder jeg forretningens behov med arkitektur, kode og de arbejdsgange, der skal fungere hver dag.',
          'I build digital products and take ownership from the first idea through daily operation. As Head of IT at Nomad Properties, I connect business needs with architecture, code, and the workflows people depend on.',
        ),
        t(
          'Min vej begyndte tæt på brugerne: teknisk support, customer success og kvalitetssikring. Den erfaring følger med ind i udviklingen. Jeg undersøger problemet, før jeg vælger teknologien, og bygger løsninger, der er til at forstå, bruge og vedligeholde.',
          'My background is close to the user: technical support, customer success, and quality assurance. That experience shapes how I build. I understand the problem before choosing the technology, and create software that is clear to use and practical to maintain.',
        ),
        t(
          'Ved siden af arbejdet udvikler og udgiver jeg egne produkter. PartyPal fik over 600 brugere i sin første uge og nåede en ottendeplads i den danske App Store. På Roskilde Festival bidrager jeg frivilligt med driftsansvar og koordinering — og har bygget BUSBUS til arbejdet med frivillige.',
          'Alongside my work, I develop and ship my own products. PartyPal gained more than 600 users in its first week and reached No. 8 in the Danish App Store. At Roskilde Festival, I volunteer in operations and coordination, and built BUSBUS to support the volunteer team.',
        ),
      ],
      interests: [
        t('Tekniske produkter', 'Technical products'),
        t('Automation', 'Automation'),
        t('Mobile oplevelser', 'Mobile experiences'),
        t('Datakvalitet', 'Data quality'),
        t('Drift & mennesker', 'Operations & people'),
      ],
      facts: [
        { value: '600+', label: t('PartyPal-brugere i første uge', 'PartyPal users in week one') },
        { value: '#8', label: t('i den danske App Store', 'in the Danish App Store') },
        {
          value: t('Idé → drift', 'Idea → live'),
          label: t('Ansvar hele vejen', 'Ownership end to end'),
        },
      ],
    },
    projects: [
      {
        id: 'saelg-din-bolig',
        name: 'Hjemblik · Sælg din bolig',
        category: t('Bolig & mæglersøgning', 'Property & realtor discovery'),
        year: t('Udgivet', 'Live'),
        symbol: '⌂',
        accent: 'blue',
        url: 'https://saelgdinbolig.com/',
        summary: t(
          'Find den rette mægler. Start med din adresse.',
          'Find the right realtor. Start with your address.',
        ),
        description: t(
          'Hjemblik samler lokale ejendomsmæglere i et overskueligt katalog. Boligsælgere kan søge på deres adresse, sammenligne kontorer og undersøge lokale teams, før de tager næste skridt i salget.',
          'Hjemblik brings local realtors together in a clear directory. Home sellers can search by address, compare offices, and explore local teams before taking the next step towards selling.',
        ),
        stack: [],
        highlights: [
          t(
            'Adressebaseret søgning efter mæglere, der dækker lokalområdet.',
            'Address-based search for realtors covering the local area.',
          ),
          t(
            'Sammenligning af placering, specialer og anmeldelser, når de er tilgængelige.',
            'Compare locations, specialties, and ratings when available.',
          ),
          t(
            'Mæglerprofiler og boligguider gør det lettere at træffe et informeret valg.',
            'Realtor profiles and property guides support an informed decision.',
          ),
        ],
      },
      {
        id: 'check-in',
        name: 'Check In',
        category: t('Tryghed & mobilapp', 'Personal safety & mobile app'),
        year: t('Udgivet', 'Live'),
        symbol: '◎',
        accent: 'purple',
        url: 'https://check-in-system.com/',
        summary: t(
          'Del din plan. Giv dine nærmeste ro i maven.',
          'Share your plan. Give your people peace of mind.',
        ),
        description: t(
          'En iPhone-app til hverdagens ture og større eventyr. Brugeren sætter et forventet hjemkomsttidspunkt og deler planen med betroede kontakter, som kan følge timeren og se, når der kan være behov for at reagere.',
          'An iPhone app for everyday outings and bigger adventures. Users set an expected return time and share their plan with trusted contacts, who can follow the timer and see when attention may be needed.',
        ),
        stack: [],
        highlights: [
          t(
            'Sikkerhedstimere, der kan opdateres eller stoppes, når planerne ændrer sig.',
            'Safety timers that can be updated or stopped when plans change.',
          ),
          t(
            'Invitationer via sikre links og kontrol over, hvad der deles og med hvem.',
            'Secure invitation links and control over what is shared and with whom.',
          ),
          t(
            'Flersproget hjemmeside med guides til blandt andre rejsende, familier og vandrere.',
            'Multilingual website with guides for travellers, families, and hikers, among others.',
          ),
        ],
      },
      {
        id: 'nomad-crm',
        name: 'Nomad CRM',
        category: t('CRM & driftsplatform', 'CRM & operations platform'),
        year: t('I daglig drift', 'In daily use'),
        symbol: '◈',
        accent: 'blue',
        image: 'crm-dashboard.jpg',
        summary: t(
          'Ét overblik. Fra booking til daglig drift.',
          'One clear view. From bookings to daily operations.',
        ),
        description: t(
          'En samlet platform til bookingdata, kunder, opgaver, adgang og rapportering. Bygget til Nomad Properties’ arbejdsgange, så information bliver til handling i stedet for endnu et regneark.',
          'A unified platform for bookings, customers, tasks, access, and reporting. Built around Nomad Properties’ workflows to turn information into action rather than another spreadsheet.',
        ),
        stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Cloudflare', 'REST APIs'],
        highlights: [
          t(
            'Ansvar for produkt, datamodel og arkitektur samt implementering, release og drift.',
            'Own the product, data model, and architecture, as well as implementation, releases, and operations.',
          ),
          t(
            'Byggede dashboards, bookingflows, adgangsstyring, integrationer og automation.',
            'Built dashboards, booking flows, access control, integrations, and automation.',
          ),
        ],
      },
      {
        id: 'partypal',
        name: 'PartyPal',
        category: t('Social mobilapp', 'Social mobile app'),
        year: '2024',
        symbol: '✦',
        accent: 'purple',
        image: 'partypal-app-store-ranking.jpg',
        summary: t(
          'Fra idé til 600+ brugere på én uge.',
          'From an idea to 600+ users in one week.',
        ),
        description: t(
          'En social app, der hjælper mennesker med at finde fester i nærheden gennem swiping og matching. Jeg førte produktet fra koncept til en rigtig udgivelse og de første brugere.',
          'A social app that helps people discover nearby parties through swiping and matching. I took the product from its initial concept to a real release and its first users.',
        ),
        stack: ['React Native', 'Expo', 'TypeScript', 'App Store'],
        highlights: [
          t(
            'Over 600 brugere i første uge og nr. 8 i den danske App Store.',
            'More than 600 users in its first week and No. 8 in the Danish App Store.',
          ),
          t(
            'Koncept, interface, udvikling, App Store-release og den tidlige produktudvikling.',
            'Concept, interface design, development, App Store release, and early product iteration.',
          ),
        ],
      },
      {
        id: 'busbus',
        name: 'BUSBUS',
        category: t('Festival & frivillige', 'Festival & volunteer operations'),
        year: '2025',
        symbol: '⊞',
        accent: 'orange',
        image: 'busbus-site.jpg',
        summary: t(
          'Mindre koordinering. Mere festival.',
          'Less coordination overhead. More festival.',
        ),
        description: t(
          'Et tilmeldings- og koordineringssystem til de frivillige bag BUSBUS, en stor madbod på Roskilde Festival. Løsningen samler frivilligrejsen fra tilmelding til den praktiske planlægning.',
          'A registration and coordination system for the volunteers behind BUSBUS, a large food stand at Roskilde Festival. It connects the volunteer journey from sign-up to practical planning.',
        ),
        stack: ['JavaScript', 'Firebase', 'HTML', 'CSS', 'Operations'],
        highlights: [
          t(
            'Kortlagde arbejdsgangen og byggede løsningen fra behov til brug i driften.',
            'Mapped the workflow and built the solution from the initial need to operational use.',
          ),
          t(
            'Udviklede tilmelding, gruppehåndtering, bekræftelser og administrationsværktøjer.',
            'Developed sign-up, group handling, confirmations, and administration tools.',
          ),
        ],
      },
      {
        id: 'open-dictate',
        name: 'Open Dictate',
        category: t('Native desktopprodukt', 'Native desktop product'),
        year: t('Under udvikling', 'In development'),
        symbol: '⌁',
        accent: 'green',
        image: 'open-dictate-app.jpg',
        summary: t(
          'Tal naturligt. Skriv dér, hvor du arbejder.',
          'Speak naturally. Write where you already work.',
        ),
        description: t(
          'En dikteringsapp til macOS og Windows. Hold en genvej nede, tal, og indsæt bearbejdet tekst direkte i det program, du allerede bruger.',
          'A dictation app for macOS and Windows. Hold a shortcut, speak, and insert polished text directly into the application you are already using.',
        ),
        stack: ['Tauri', 'Rust', 'React', 'TypeScript', 'Firebase'],
        highlights: [
          t(
            'Produktretning, interfacedesign og desktoparkitektur.',
            'Product direction, interface design, and desktop architecture.',
          ),
          t(
            'Native integrationer, sikker lokal lagring, transskriptionsflows og betalingsinfrastruktur.',
            'Native integrations, secure local storage, transcription flows, and billing infrastructure.',
          ),
        ],
      },
      {
        id: 'sidste-runde',
        name: 'Sidste Runde',
        category: t('Socialt mobilspil', 'Social mobile game'),
        year: t('Udgivet på iOS', 'Released on iOS'),
        symbol: '↻',
        accent: 'purple',
        image: 'sidste-runde-app-store.jpg',
        summary: t(
          'En telefon. En vennegruppe. Nye historier.',
          'One phone. A group of friends. New stories.',
        ),
        description: t(
          'Et selskabsspil, hvor telefonen går på omgang, og sjove, akavede og uventede spørgsmål udfordrer, hvor godt vennerne kender hinanden.',
          'A pass-the-phone party game where funny, awkward, and unexpected prompts reveal how well a group of friends knows each other.',
        ),
        stack: ['iOS', 'Mobile product', 'Game design', 'App Store'],
        highlights: [
          t(
            'Designede spillets mekanik og byggede mobiloplevelsen.',
            'Designed the game loop and built the mobile experience.',
          ),
          t(
            'Håndterede hele publiceringen til App Store.',
            'Handled the complete App Store publishing process.',
          ),
        ],
      },
      {
        id: 'nomad-properties',
        name: 'Nomad Properties',
        category: t('Virksomhedswebsite', 'Company website'),
        year: t('Udgivet', 'Live'),
        symbol: '⌂',
        accent: 'blue',
        image: 'nomad-properties-site.jpg',
        summary: t(
          'Et klart vindue ind til en kompleks forretning.',
          'A clear introduction to a complex business.',
        ),
        description: t(
          'Et flersproget website for en virksomhed, der arbejder med boliger, ferieudlejning, hoteller, gæstekommunikation og klargøring. Indhold og navigation gør ydelserne konkrete for forskellige målgrupper.',
          'A multilingual website for a business working across homes, holiday rentals, hotels, guest communication, and property preparation. Its content and navigation make the services clear to different audiences.',
        ),
        stack: ['Web design', 'Responsive UI', 'Content', 'SEO'],
        highlights: [
          t(
            'Skabte struktur og indhold til ejere, gæster, virksomheder og hoteloperatører.',
            'Created structure and content for owners, guests, businesses, and hotel operators.',
          ),
          t(
            'Designede et responsivt interface med en sammenhængende fortælling om ydelserne.',
            'Designed a responsive interface with a coherent service story.',
          ),
        ],
      },
      {
        id: 'flower',
        name: 'Flower',
        category: t('Interaktiv webapp', 'Interactive web app'),
        year: t('Udgivet', 'Live'),
        symbol: '❋',
        accent: 'green',
        image: 'flower-site.jpg',
        summary: t(
          'En lille digital gestus, bygget til at blive delt.',
          'A small digital gesture, made to be shared.',
        ),
        description: t(
          'En legende buketbygger, hvor man vælger base, blomster og en personlig hilsen. Den færdige digitale buket kan deles som et link og åbnes med en animeret oplevelse.',
          'A playful bouquet builder where people choose a base, flowers, and a personal note. The finished digital bouquet can be shared as a link and opened through an animated experience.',
        ),
        stack: ['Next.js', 'TypeScript', 'Framer Motion', 'GitHub Pages'],
        highlights: [
          t(
            'Byggede den responsive editor og et delbart URL-format.',
            'Built the responsive editor and a shareable URL format.',
          ),
          t(
            'Udviklede animationen, der folder den færdige buket ud for modtageren.',
            'Developed the animation that reveals the finished bouquet to its recipient.',
          ),
        ],
      },
      {
        id: 'get-tested',
        name: 'GetTestedNow',
        category: t('Digital sundhedsservice', 'Digital health service'),
        year: t('Udgivet', 'Live'),
        symbol: '+',
        accent: 'blue',
        image: 'gettested-site.jpg',
        summary: t(
          'Et følsomt budskab. Et gennemtænkt flow.',
          'A sensitive message. A carefully considered flow.',
        ),
        description: t(
          'En privatlivsorienteret service til respektfulde, anonyme sundhedsbeskeder, der opfordrer en tidligere kontakt til at blive testet. Fokus er på at gøre en vanskelig handling enkel og tydelig.',
          'A privacy-minded service for respectful, anonymous health notifications that encourage a previous contact to get tested. The focus is on making a difficult action clear and manageable.',
        ),
        stack: ['Product design', 'Web app', 'Payments', 'SMS', 'Localization'],
        highlights: [
          t(
            'Designede modtagerflow, tydelig prissætning og flersproget indhold.',
            'Designed recipient handling, transparent pricing, and multilingual content.',
          ),
          t(
            'Indarbejdede sikkerhedsforanstaltninger i en rolig og direkte brugeroplevelse.',
            'Integrated safeguards into a calm, direct user experience.',
          ),
        ],
      },
      {
        id: 'let-there-be-light',
        name: 'LetThereBeLight',
        category: t('Interaktivt WebGPU-eksperiment', 'Interactive WebGPU experiment'),
        year: t('Eksperiment', 'Experiment'),
        symbol: '☼',
        accent: 'orange',
        image: 'let-there-be-light.jpg',
        summary: t(
          'Fang lyset. Flyt det med hænderne.',
          'Catch the light. Move it with your hands.',
        ),
        description: t(
          'En kamerabaseret browseroplevelse, hvor et virtuelt lys bevæger sig i en dybdebevidst scene. Jeg videreudviklede en TypeGPU-demo med håndsporing, gestik og fysisk bevægelse.',
          'A camera-based browser experience where a virtual light moves through a depth-aware scene. I extended a TypeGPU demo with hand tracking, gestures, and physical movement.',
        ),
        stack: ['TypeGPU', 'WebGPU', 'MediaPipe', 'DepthART', 'TypeScript'],
        highlights: [
          t(
            'Integrerede DepthART og sporing af begge hænder med MediaPipe.',
            'Integrated DepthART and two-hand tracking with MediaPipe.',
          ),
          t(
            'Tilføjede gestikhastighed, lysfysik og betjening med touch eller mus.',
            'Added gesture velocity, light physics, and touch or mouse controls.',
          ),
        ],
      },
    ],
    experience: [
      {
        id: 'nomad',
        company: 'Nomad Properties',
        role: 'Head of IT',
        period: t('2026 — nu', '2026 — present'),
        current: true,
        location: t('Teknologi, produkt & drift', 'Technology, product & operations'),
        summary: t(
          'Teknisk ejerskab — fra virksomhedens behov til systemerne i daglig drift.',
          'Technical ownership — from business needs to the systems used every day.',
        ),
        highlights: [
          t(
            'Ejer det tekniske produktlandskab og udvikler virksomhedens CRM- og driftssystem.',
            'Own the technical product landscape and develop the company’s CRM and operations system.',
          ),
          t(
            'Byggede platformen fra datamodel og API’er til dashboards, bookingflows og adgangsstyring.',
            'Built the platform from data model and APIs to dashboards, booking flows, and access control.',
          ),
          t(
            'Forbinder forretningsbehov med arkitektur, integrationer, automation og stabil drift.',
            'Connect business needs with architecture, integrations, automation, and reliable operations.',
          ),
        ],
        stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Cloudflare Workers', 'REST APIs', 'Auth'],
      },
      {
        id: 'estatetool',
        company: 'Estatetool A/S',
        role: 'Support & QA Specialist',
        period: '2025 — 2026',
        location: t('Support & kvalitetssikring', 'Support & quality assurance'),
        summary: t(
          'Gjorde brugerproblemer til viden, udviklingsteamet kunne handle på.',
          'Turned user problems into insight the product team could act on.',
        ),
        highlights: [
          t(
            'Fejlsøgte kundeproblemer og dokumenterede konkrete, reproducerbare fejl.',
            'Investigated customer issues and documented clear, reproducible bugs.',
          ),
          t(
            'Kvalitetssikrede releases og omsatte feedback til konkrete produktforbedringer.',
            'Quality-assured releases and translated feedback into specific product improvements.',
          ),
        ],
        stack: ['QA', 'Troubleshooting', 'Release testing', 'Customer feedback'],
      },
      {
        id: 'we-are-safe',
        company: 'We are Safe',
        role: 'Support, Customer Success & Key Accounts',
        period: '2022 — 2025',
        location: t('Kunder, ledelse & drift', 'Customers, leadership & operations'),
        summary: t(
          'Fra teknisk support til et bredere ansvar for kunder, team og arbejdsgange.',
          'From technical support to broader ownership of customers, the team, and workflows.',
        ),
        highlights: [
          t(
            'Voksede ind i ledelse, customer success og ansvar for key accounts.',
            'Progressed into leadership, customer success, and key account ownership.',
          ),
          t(
            'Arbejdede med supportkvalitet, kunderelationer og interne processer.',
            'Worked on support quality, customer relationships, and internal processes.',
          ),
          t(
            'Brugte CRM, SQL og Firebase til at skabe overblik og identificere forbedringer.',
            'Used CRM, SQL, and Firebase to improve visibility and identify opportunities.',
          ),
        ],
        stack: ['CRM', 'SQL', 'Firebase', 'Customer Success', 'Operations'],
      },
      {
        id: 'roskilde',
        company: 'Roskilde Festival',
        role: t(
          'Frivillig · driftsansvar & beredskab',
          'Volunteer · operations & emergency response',
        ),
        period: t('2024 — nu', '2024 — present'),
        current: true,
        location: t('Frivilligt arbejde', 'Volunteering'),
        summary: t(
          'Koordinering og ansvar, når planer skal fungere i virkeligheden.',
          'Coordination and ownership when plans need to work in practice.',
        ),
        highlights: [
          t(
            'Frivillig i flere roller, blandt andet som driftsansvarlig for beredskabet.',
            'Volunteer in several roles, including operations lead for emergency response.',
          ),
          t(
            'Koordinerer kritisk information mellem frivillige, politi og brandvæsen.',
            'Coordinate critical information between volunteers, police, and fire services.',
          ),
          t(
            'Byggede BUSBUS til planlægning og koordinering af frivillige.',
            'Built BUSBUS to support volunteer planning and coordination.',
          ),
        ],
        stack: ['Operations', 'Coordination', 'BUSBUS'],
      },
      {
        id: 'earlier',
        company: 'CIMT · SuperBrugsen · Føniks Computer',
        role: t(
          'Tidlig erfaring med service, IT & drift',
          'Early experience in service, IT & operations',
        ),
        period: t('Tidligere erfaring', 'Earlier experience'),
        location: t('Service & teknik', 'Service & technology'),
        summary: t(
          'Det praktiske fundament: forstå mennesker, løse problemer og få hverdagen til at fungere.',
          'A practical foundation: understand people, solve problems, and keep everyday work moving.',
        ),
        highlights: [
          t(
            'Erfaring fra CIMT Servicedesk, SuperBrugsen og Føniks Computer.',
            'Experience from CIMT Servicedesk, SuperBrugsen, and Føniks Computer.',
          ),
          t(
            'Opbyggede et praktisk blik for support, hardware, service og drift.',
            'Built a practical understanding of support, hardware, service, and operations.',
          ),
        ],
        stack: ['Service desk', 'Hardware', 'Operations'],
      },
    ],
    skills: [
      {
        name: t('Produkt & systemer', 'Product & systems'),
        description: t(
          'Afklar behovet. Design sammenhængen. Byg det rigtige.',
          'Clarify the need. Design the system. Build the right thing.',
        ),
        items: [
          'Product discovery',
          'Requirements',
          'Process mapping',
          'System design',
          'Data modelling',
          'UX flows',
          'QA',
          'Release planning',
        ],
      },
      {
        name: 'Web & mobile',
        description: t(
          'Gennemtænkte oplevelser på web, iOS og Android.',
          'Considered experiences across web, iOS, and Android.',
        ),
        items: [
          'Next.js',
          'React',
          'Astro',
          'React Native',
          'Expo',
          'TypeScript',
          'HTML / CSS',
          'Accessibility',
          'Responsive UI',
          'Swift',
        ],
      },
      {
        name: 'Backend & data',
        description: t(
          'Et solidt fundament for resten af produktet.',
          'A dependable foundation for the rest of the product.',
        ),
        items: [
          'Node.js',
          'PostgreSQL',
          'SQLite',
          'Firebase / NoSQL',
          'REST APIs',
          'Webhooks',
          'Authentication',
          'Authorisation',
          'Data migrations',
        ],
      },
      {
        name: t('Cloud & levering', 'Cloud & delivery'),
        description: t(
          'Fra kode til sikker release og synlig drift.',
          'From code to a reliable release and visible operations.',
        ),
        items: [
          'Cloudflare Workers',
          'Pages',
          'Storage',
          'GitHub Actions',
          'CI / CD',
          'Logging',
          'Monitoring',
          'Performance',
          'Security',
        ],
      },
      {
        name: t('Integration & automation', 'Integration & automation'),
        description: t(
          'Systemer, der taler sammen. Færre manuelle mellemled.',
          'Connected systems. Fewer manual handovers.',
        ),
        items: [
          'API integration',
          'Webhooks',
          'Scheduled jobs',
          'Workflow automation',
          'Data validation',
          'Data quality',
          'Internal tooling',
        ],
      },
      {
        name: t('Drift & mennesker', 'Operations & people'),
        description: t(
          'Teknisk ansvar tæt på dem, der bruger løsningen.',
          'Technical ownership close to the people using the product.',
        ),
        items: [
          'Technical support',
          'Customer Success',
          'Incident coordination',
          'Troubleshooting',
          'Key accounts',
          'Documentation',
          'Stakeholder management',
          'Release support',
        ],
      },
    ],
    education: [
      {
        degree: t('Matematik & Computer Science', 'Mathematics & Computer Science'),
        school: 'HTX',
        period: t('Afsluttet', 'Completed'),
        description: t(
          'Teknisk gymnasial uddannelse med matematik, computer science og projektledelse. Et fundament i teknisk problemløsning og tværfagligt projektarbejde.',
          'Upper secondary technical education covering mathematics, computer science, and project management. A foundation in technical problem-solving and interdisciplinary project work.',
        ),
      },
    ],
    contact: {
      email: 'gaphbahe@gmail.com',
      phone: '+45 21 95 62 25',
      note: t(
        'Har I et produkt, der skal fra idé til virkelighed — eller systemer, der skal hænge bedre sammen? Jeg er åben for roller og samarbejder, hvor produkt, udvikling og drift mødes.',
        'Have a product to take from idea to reality, or systems that need to work better together? I’m open to roles and collaborations that connect product, engineering, and operations.',
      ),
      links: [
        { label: 'GitHub', url: 'https://github.com/Goprogabriel', display: 'Goprogabriel' },
        {
          label: 'LinkedIn',
          url: 'https://www.linkedin.com/in/gabrielback/',
          display: 'Gabriel Back',
        },
      ],
    },
  };
}
export const cvByLanguage: Record<Language, CVContent> = { da: makeCV('da'), en: makeCV('en') };
export const cv = cvByLanguage.en;
export const initials = 'GB';
export function getSections(
  language: Language,
): { id: Section; label: string; description: string }[] {
  const t = (da: string, en: string) => (language === 'da' ? da : en);
  return [
    {
      id: 'about',
      label: t('Om mig', 'About'),
      description: t('Mennesket og måden at arbejde på', 'The person and the approach'),
    },
    {
      id: 'projects',
      label: t('Projekter', 'Projects'),
      description: t('Fra idé til noget, der bliver brugt', 'From an idea to something people use'),
    },
    {
      id: 'experience',
      label: t('Erfaring', 'Experience'),
      description: t('Roller, ansvar og resultater', 'Roles, ownership, and results'),
    },
    {
      id: 'skills',
      label: t('Kompetencer', 'Skills'),
      description: t('Værktøjerne bag arbejdet', 'The tools behind the work'),
    },
    {
      id: 'contact',
      label: t('Kontakt', 'Contact'),
      description: t(
        'Lad os bygge noget, der gør en forskel',
        'Let’s build something that matters',
      ),
    },
    { id: 'cv', label: 'CV', description: t('Hele profilen samlet', 'The complete profile') },
  ];
}
export const sections = getSections('en');
// Short editorial copy for the download. Full detail stays available in both CV views.
interface CompactCV {
  headline: string;
  intro: string;
  experience: { id: string; summary: string }[];
  projects: { id: string; result: string }[];
  skills: string;
}
const compactCV: Record<Language, CompactCV> = {
  da: {
    headline: 'Head of IT · Full-stack udvikler',
    intro:
      'Jeg bygger digitale produkter fra idé til drift. Med en baggrund i support, QA og customer success forbinder jeg brugernes behov med kode, der gør hverdagen lettere.',
    experience: [
      {
        id: 'nomad',
        summary:
          'Ansvar for CRM, API’er, integrationer og automatisering — fra arkitektur til daglig drift.',
      },
      {
        id: 'estatetool',
        summary:
          'Omsatte kundernes problemer til præcis fejlsøgning, release-test og produktforbedringer.',
      },
      {
        id: 'we-are-safe',
        summary:
          'Support, kunderelationer og ledelsesansvar. Udviklede interne arbejdsgange og værktøjer.',
      },
    ],
    projects: [
      { id: 'partypal', result: '600+ brugere i første uge. Nr. 8 i den danske App Store.' },
      {
        id: 'busbus',
        result:
          'Byggede tilmelding og koordinering af frivillige til Roskilde Festival, hvor jeg også bidrager til drift og beredskab.',
      },
    ],
    skills:
      'React / Next.js · TypeScript · React Native / Expo · Node.js · PostgreSQL · Cloudflare\nProduktudvikling · Automatisering · QA · Teknisk support',
  },
  en: {
    headline: 'Head of IT · Full-stack developer',
    intro:
      'I build digital products from idea to operation. With a background in support, QA and customer success, I turn user needs into software that makes everyday work easier.',
    experience: [
      {
        id: 'nomad',
        summary:
          'Own CRM, APIs, integrations and automation — from architecture to daily operation.',
      },
      {
        id: 'estatetool',
        summary:
          'Turned customer issues into precise investigations, release testing and product improvements.',
      },
      {
        id: 'we-are-safe',
        summary:
          'Support, customer relationships and team leadership. Built internal workflows and tools.',
      },
    ],
    projects: [
      { id: 'partypal', result: '600+ users in the first week. No. 8 in the Danish App Store.' },
      {
        id: 'busbus',
        result:
          'Built volunteer registration and coordination for Roskilde Festival, where I also volunteer in operations and emergency response.',
      },
    ],
    skills:
      'React / Next.js · TypeScript · React Native / Expo · Node.js · PostgreSQL · Cloudflare\nProduct development · Automation · QA · Technical support',
  },
};
export function cvText(language: Language = 'en'): string {
  const cv = cvByLanguage[language];
  const short = compactCV[language];
  const t = (da: string, en: string) => (language === 'da' ? da : en);
  return [
    cv.profile.name,
    short.headline,
    `${cv.profile.location} · ${cv.contact.phone}`,
    cv.contact.email,
    '',
    short.intro,
    '',
    t('ERFARING', 'EXPERIENCE'),
    ...short.experience.flatMap(({ id, summary }) => {
      const job = cv.experience.find((item) => item.id === id)!;
      return [`${job.company} | ${job.role} | ${job.period}`, summary, ''];
    }),
    t('UDVALGTE PROJEKTER', 'SELECTED PROJECTS'),
    ...short.projects.map(({ id, result }) => {
      const project = cv.projects.find((item) => item.id === id)!;
      return `${project.name} — ${result}`;
    }),
    '',
    t('KOMPETENCER', 'SKILLS'),
    short.skills,
    '',
    t('UDDANNELSE', 'EDUCATION'),
    ...cv.education.map((item) => `${item.school} · ${item.degree}`),
    '',
    `Portfolio: ${sourceURL}`,
    ...cv.contact.links.map((link) => `${link.label}: ${link.url}`),
    '',
  ].join('\n');
}
export function downloadText(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadCV(language: Language = 'en') {
  downloadText(`gabriel-back-cv-${language}.txt`, cvText(language));
}
