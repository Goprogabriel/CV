import type { Localized, MediaAsset } from '@/types/content';

export const profile = {
  name: 'Gabriel Back',
  role: {
    da: 'Head of IT · Full-stack & teknisk produkt',
    en: 'Head of IT · Full-stack development · technical product'
  } satisfies Localized,
  location: { da: 'København, Danmark', en: 'Copenhagen, Denmark' } satisfies Localized,
  headline: {
    da: 'Jeg bygger digitale produkter fra idé til drift.',
    en: 'I build digital products from idea to operations.'
  } satisfies Localized,
  shortIntro: {
    da: 'Head of IT og full-stack profil med ansvar for produkt, kode, integrationer og stabil drift.',
    en: 'Head of IT and full-stack professional responsible for product, code, integrations and reliable operations.'
  } satisfies Localized,
  longIntro: {
    da: 'Jeg kombinerer produktforståelse, full-stack udvikling og drift. Jeg kan afklare behovet, vælge arkitektur, bygge løsningen og tage ansvar efter release.',
    en: 'I combine product understanding, full-stack development and operations. I can clarify the need, choose the architecture, build the solution and own it after release.'
  } satisfies Localized,
  approach: {
    da: 'Det reducerer overleveringer og giver løsninger, der passer til både forretningen, brugerne og den daglige drift.',
    en: 'That reduces handovers and creates solutions that fit the business, its users and day-to-day operations.'
  } satisfies Localized,
  focus: {
    da: 'Full-stack produktudvikling fra idé til færdigt og udgivet produkt.',
    en: 'Full-stack product development from idea to a finished, shipped product.'
  } satisfies Localized,
  interests: ['Technical product', 'Operations design', 'Automation', 'Mobile products', 'Data quality'],
  facts: {
    da: ['600+ brugere i en apps første uge', '#8 i den danske App Store', 'Frivillig driftsansvarlig på Roskilde Festival'],
    en: ['600+ users in an app’s first week', '#8 in the Danish App Store', 'Volunteer operations lead at Roskilde Festival']
  } satisfies Localized<string[]>
};

export const profileMedia = [
  {
    src: '/media/experience/gabriel-work-award.jpg',
    alt: { da: 'Gabriel Back sammen med kolleger i forbindelse med en arbejdspris', en: 'Gabriel Back with colleagues at a workplace award' },
    caption: { da: 'Arbejde / resultater skabt sammen', en: 'Work / results built together' },
    position: 'center 36%'
  },
  {
    src: '/media/profile/gabriel-private-coding.jpg',
    alt: { da: 'Gabriel Back arbejder på kode på sin bærbare computer', en: 'Gabriel Back working on code on his laptop' },
    caption: { da: 'Full-stack udvikling / produktet tager form', en: 'Full-stack development / shaping the product' },
    position: 'center 38%'
  }
] satisfies [MediaAsset, MediaAsset];
