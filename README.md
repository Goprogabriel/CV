<div align="center">

# Gabriel Back — Interactive CV & Portfolio

### An editorial profile about the systems I have built and the path that led me here.

## [View live portfolio →](https://goprogabriel.github.io/)

[![Astro](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222?logo=github)](https://pages.github.com/)
[![Accessibility](https://img.shields.io/badge/Accessibility-keyboard%20%2B%20reduced%20motion-0D463D)](#accessibility-and-performance)

![Wide preview of Gabriel Back's portfolio](public/og/portfolio-preview.png)

</div>

This is not a template résumé. It is a bilingual, static editorial portfolio that gives recruiters a fast, readable path through my work while offering a more exploratory career orbit for visitors who want to interact.

## Design and interaction

- A warm European editorial system with large serif typography, strict rules and forest-green fields.
- A clear, no-JavaScript reading experience alongside a draggable circular career map.
- A full-screen navigation layer, lightweight page progress, project drag rail and accessible image viewer.
- Danish and English routes with centralized, typed content.
- Dedicated A4 print views and direct downloads of manually maintained CV PDFs.
- Deliberate motion powered by GSAP, ScrollTrigger and Draggable, with native scrolling and reduced-motion alternatives.

## Main interactions

The career orbit can be dragged with mouse or touch, reacts gently to scroll, snaps to milestones and supports arrow, Home and End keys. Mobile users receive a compact disclosure list instead. Projects can be explored in a touch-friendly scroll-snap rail, with the same information repeated below as a conventional accessible list.

## Technology

Astro · TypeScript · semantic HTML · CSS custom properties · GSAP · ScrollTrigger · Draggable · GitHub Actions · GitHub Pages

No React runtime, backend, API or fake contact form is included. Heavy motion code is dynamically imported only when motion is allowed.

## Screenshots

The wide preview above is the repository banner. Add final captures after replacing portrait/project placeholders:

- `public/media/social/portfolio-desktop.webp` — recommended 1920 × 1200.
- `public/media/social/portfolio-mobile.webp` — recommended 828 × 1792.

Then reference them here with normal Markdown image links.

## Project structure

```text
src/
  components/       focused Astro components by section
  content/          bilingual, typed profile data
  layouts/          document shell and SEO metadata
  pages/            Danish, English, print and 404 routes
  scripts/          progressively enhanced interactions
  styles/           global editorial design system
  types/            shared content models
  utils/            GitHub Pages-safe path helpers
public/
  documents/cv/     manually exported CV PDFs
  media/            replaceable portfolio imagery
  og/               social preview artwork
```

## Local development

Requirements: Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:4321`. Run the full quality gate before publishing:

```bash
pnpm verify
pnpm preview
```

## Editing content

Personal content is not hardcoded inside visual components. Start here:

- `src/content/profile.ts` — headline, biography, approach and personal facts.
- `src/content/experience.ts` — roles and professional case studies.
- `src/content/projects.ts` — private projects, links and screenshots.
- `src/content/education.ts` — education and earlier milestones.
- `src/content/skills.ts` — honest skill groupings.
- `src/content/socials.ts` — email, phone, LinkedIn and GitHub.
- `src/content/site.ts` — metadata, navigation and availability.

Every localized value has `da` and `en` fields. Missing portrait, project and professional screenshots are clearly marked as placeholders. Replace them without touching visual components.

To activate a replacement image, copy it to the path declared by the content entry and change that entry’s `placeholder` value from `true` to `false`. The shared media component then renders the real lazy-loaded image automatically.

## Replacing images and CV files

Read [`public/media/README.md`](public/media/README.md) for folder purposes, sizes, formats and naming rules. Avoid unlicensed stock imagery and only use company logos you have permission to publish.

Replace the two PDFs in `public/documents/cv/` while preserving their filenames. The print-friendly HTML views remain available at `/print/` and `/en/print/`.

## GitHub Pages deployment

If this folder is not yet a Git repository, initialize it first with `git init -b main`, add the intended GitHub remote, commit and push. Otherwise, continue with the existing repository.

1. Push to a repository whose default branch is `main`.
2. In **Settings → Pages**, choose **GitHub Actions** as the source.
3. Push to `main` or run **Deploy portfolio to GitHub Pages** manually.

The workflow automatically detects:

- `username.github.io` repositories and builds at `/`.
- Project repositories and builds with `BASE_PATH=repository-name`.

To test a project subpath locally:

```bash
SITE_URL=https://goprogabriel.github.io BASE_PATH=my-portfolio pnpm build
pnpm preview
```

## Custom domain

Set the repository Actions variable `SITE_URL` to the full custom origin and optionally `BASE_PATH` if the site lives below a path. Add a `public/CNAME` file containing only the real domain when you own and configure it; no fake domain is enabled in this repository. Update the live link near the top of this README and `src/content/site.ts` at the same time.

## Accessibility and performance

- Keyboard-operable menu, orbit, tabs, disclosures and lightbox.
- Visible focus styles, landmarks, semantic headings and descriptive labels.
- Mobile list alternatives for advanced interactions.
- `prefers-reduced-motion` disables the loader and major movement.
- Static HTML keeps the complete résumé readable when JavaScript is unavailable.
- Lazy-image-ready media structure, stable placeholder ratios and no default video or 3D scene.

Final photographs should be exported as responsive AVIF/WebP assets before launch. Run Lighthouse against the deployed URL after adding real imagery.

## License and contact

Code is available under the [MIT License](LICENSE). Personal copy, CV content and imagery remain Gabriel Back’s personal material.

[Email](mailto:gaphbahe@gmail.com) · [LinkedIn](https://www.linkedin.com/in/gabrielback/) · [GitHub](https://github.com/Goprogabriel)
