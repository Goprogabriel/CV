# Media library

All website imagery is referenced from the typed files in `src/content/`. Keep file names stable when replacing placeholders, or update the relevant `src` value there.

| Folder | Purpose | Recommended size |
| --- | --- | --- |
| `profile/` | Environmental and work-setting images | 1600 × 1200 px |
| `portraits/` | Primary and secondary portraits | 1600 × 2000 px |
| `experience/` | Professional case-study images | 2000 × 1400 px |
| `companies/` | General company imagery | 1600 × 1200 px |
| `company-logos/` | Supplied, licensed company marks | SVG or transparent WebP |
| `projects/` | Project screenshots and cover images | 1800 × 1200 px |
| `project-logos/` | Project wordmarks and icons | SVG or transparent WebP |
| `gallery/` | Personal archive images | 1600 px on the long edge |
| `backgrounds/` | Optional abstract/editorial backdrops | 2400 × 1600 px |
| `icons/` | Small UI or technology icons | SVG |
| `social/` | Social-specific imagery | 1200 × 630 px |

Prefer AVIF for photographic images with WebP as a safe fallback. Use SVG for original vector marks. Avoid PNG except where transparency or platform requirements make it necessary.

Naming convention: lowercase kebab-case, including subject and view, for example `gabriel-back-portrait-01.webp` or `partypal-home-screen.avif`. Do not add unlicensed photography or recreate company logos. Components still provide tasteful fallback blocks when an optional image is missing.

Image paths live in:

- `src/content/profile.ts` for portraits and profile images.
- `src/content/experience.ts` for company/case-study imagery.
- `src/content/projects.ts` for project screenshots.

Every image entry includes Danish and English alternative text. Update both descriptions when replacing an image.

## Current supplied assets

| File | Used in |
| --- | --- |
| `portraits/gabriel-startup-office.jpg` | Personal archive |
| `profile/gabriel-private-coding.jpg` | Profile, personal archive |
| `experience/gabriel-work-award.jpg` | Hero, professional case study, personal archive |
| `experience/crm-dashboard.jpg` | Nomad Properties CRM case study |
| `experience/crm-profile-preview.jpg` | Nomad Properties CRM case study |
| `projects/partypal-app-store-ranking.jpg` | PartyPal project card |
| `projects/busbus-euroman-article.jpg` | BUSBUS project card |
| `projects/mobile-systems-apps.jpg` | Mobile Systems Lab project card |
| `gallery/gabriel-travel-station.jpg` | Personal archive |
| `company-logos/nomad-properties.png` | Nomad Properties experience |
| `company-logos/estatetool.png` | Estatetool experience |
| `company-logos/we-are-safe.png` | We are Safe experience |
| `company-logos/roskilde-festival.png` | Roskilde Festival volunteer experience |
| `company-logos/memora.png` | Memora image-archive mark |

These are optimized, broadly compatible JPEG copies of the supplied PNG files. The source PNGs remain untouched outside the project. Replacing a JPEG with the same file name updates every place where that image is reused. AVIF or WebP variants can be added later when a tested fallback is kept.
