import type { MediaAsset } from '@/types/content';

export const gallery: MediaAsset[] = [
  {
    src: '/media/portraits/gabriel-startup-office.jpg',
    alt: { da: 'Gabriel Back i et startupkontor sammen med en kollega', en: 'Gabriel Back in a startup office with a colleague' },
    caption: { da: 'Startupårene / idéer bliver til produkter', en: 'Startup years / turning ideas into products' },
    brandMark: '/media/company-logos/memora.png',
    position: 'center 38%'
  },
  {
    src: '/media/profile/gabriel-private-coding.jpg',
    alt: { da: 'Gabriel Back viser kode på sin bærbare computer', en: 'Gabriel Back showing code on his laptop' },
    caption: { da: 'Aftenarbejde / løsningen bliver bygget', en: 'After hours / building the solution' },
    position: 'center 32%'
  },
  {
    src: '/media/experience/gabriel-work-award.jpg',
    alt: { da: 'Gabriel Back sammen med kolleger og en arbejdspris', en: 'Gabriel Back with colleagues and a workplace award' },
    caption: { da: 'Et resultat skabt som hold', en: 'An outcome built as a team' },
    brandMark: '/media/company-logos/memora.png',
    position: 'center 34%'
  },
  {
    src: '/media/gallery/gabriel-travel-station.jpg',
    alt: { da: 'Gabriel Back på en metrostation på ferie', en: 'Gabriel Back at a metro station while travelling' },
    caption: { da: 'Nysgerrigheden tager også med ud', en: 'Curiosity travels too' },
    position: 'center 42%'
  }
];
