export type Locale = 'da' | 'en';
export type Localized<T = string> = Record<Locale, T>;

export type EntryKind = 'experience' | 'education' | 'project' | 'volunteer' | 'milestone';

export interface MediaAsset {
  src: string;
  alt: Localized;
  caption?: Localized;
  brandMark?: string;
  placeholder?: boolean;
  fit?: 'cover' | 'contain';
  position?: string;
}

export interface TimelineEntry {
  id: string;
  kind: EntryKind;
  title: Localized;
  organisation: string;
  period: Localized;
  startYear: number;
  overview: Localized;
  details: Localized<string[]>;
  technologies: string[];
  logo?: string;
  images?: MediaAsset[];
  href?: string;
}

export interface Project {
  id: string;
  name: string;
  eyebrow: Localized;
  description: Localized;
  status: Localized;
  problem: Localized;
  contribution: Localized;
  technologies: string[];
  repo?: string;
  demo?: string;
  images: MediaAsset[];
}

export interface CaseStudy {
  id: string;
  title: Localized;
  organisation: string;
  situation: Localized;
  challenge: Localized;
  responsibility: Localized;
  work: Localized;
  result: Localized;
  learning: Localized;
  technologies: string[];
  images: MediaAsset[];
}

export interface SkillGroup {
  id: string;
  title: Localized;
  description: Localized;
  skills: string[];
}
