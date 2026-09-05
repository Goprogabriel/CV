# Gabriel Back — CV

Min personlige CV- og portfolio-side som et interaktivt Linux-inspireret skrivebord.

Åbn siden her: [goprogabriel.github.io/cv](https://goprogabriel.github.io/cv/)

Siden indeholder:

- dansk og engelsk CV
- terminal med søgbare kommandoer og projektdetaljer
- desktop med mapper, vinduer og filhåndtering
- projekter som [Hjemblik](https://saelgdinbolig.com/), [Check In](https://check-in-system.com/), PartyPal og BUSBUS
- kort CV-download i `.txt`-format
- boot-sekvens, browser, Google-søgning og lokale tekstfiler

Projektet er bygget med React, TypeScript, Vite og Tailwind CSS. Det er en statisk side uden backend, database eller API-nøgler og hostes gratis på GitHub Pages.

## Kør lokalt

```bash
pnpm install
pnpm dev
```

Kør `pnpm verify` for typecheck, lint, tests og production build.

CV-indholdet ligger samlet i [`src/content/cv.ts`](src/content/cv.ts), så profil, erfaring og projekter nemt kan opdateres ét sted.
