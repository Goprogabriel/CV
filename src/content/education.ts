import type { TimelineEntry } from '@/types/content';

export const education: TimelineEntry[] = [
  {
    id: 'htx', kind: 'education', organisation: 'HTX', startYear: 2018,
    title: { da: 'Matematik & Computer Science', en: 'Mathematics & Computer Science' },
    period: { da: 'Afsluttet', en: 'Completed' },
    overview: { da: 'Teknisk gymnasial uddannelse med matematik, computer science og projektledelse.', en: 'Upper secondary technical education in mathematics, computer science and project management.' },
    details: { da: ['Teknisk fundament og tværfagligt projektarbejde.'], en: ['Technical foundation and interdisciplinary project work.'] },
    technologies: ['Mathematics', 'Computer Science', 'Project management']
  }
];

export const earlierMilestones: TimelineEntry[] = [
  {
    id: 'earlier-work', kind: 'milestone', organisation: 'CIMT · SuperBrugsen · Føniks Computer', startYear: 2019,
    title: { da: 'Tidlig erfaring med service, teknik og drift', en: 'Early experience across service, technology and operations' },
    period: { da: 'Tidligere erfaring', en: 'Earlier experience' },
    overview: { da: 'Roller, der opbyggede et praktisk blik for support, mennesker og systemer.', en: 'Roles that built a practical understanding of support, people and systems.' },
    details: { da: ['CIMT Servicedesk, SuperBrugsen og Føniks Computer.'], en: ['CIMT Servicedesk, SuperBrugsen and Føniks Computer.'] },
    technologies: ['Service desk', 'Hardware', 'Operations']
  }
];
