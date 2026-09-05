# Gabriel OS — desktop CV

Gabriel Back’s Danish/English CV as an interactive, Linux/Xfce-inspired desktop. Built with React, TypeScript, Vite and Tailwind CSS. No backend, database, API keys, analytics or remote font dependencies.

## Run locally

Node.js 22.12+ and pnpm 11 are required.

```bash
pnpm install
pnpm dev
pnpm verify
```

`pnpm verify` runs typecheck, lint, behavior tests, and the production build. `pnpm preview` serves the root-path production build.

## Content and language

`src/content/cv.ts` contains the typed CV in Danish and English: profile, nine projects, professional and volunteer experience, education, skills, real contact details, and CV export. Facts come from [Gabriel’s existing CV](https://goprogabriel.github.io/cv/) and the project content preserved in `legacy/src/content/`, reviewed on 5 September 2026. Descriptions have been rewritten in both languages; unsupported dates or metrics have not been added. Project illustrations and Gabriel’s profile picture are in `public/images/`.

Use **DA / EN** in the top panel, the startup screen, or **Settings → Language** to switch. Open CV windows, terminal results, menus, and downloaded CVs update with the language. The language preference is saved locally. Commands and stable project IDs remain in English. User-created filenames and notes are preserved as written.

## Explore the CV

- **Terminal:** opens after the boot sequence. Use `/help`, `/about`, `/projects`, `/experience`, `/skills`, `/contact`, `/cv`, `/clear`. Click commands and results, or type e.g. `/projects partypal` or `/experience nomad` for inline details.
- **Keyboard:** ↑ / ↓ at the prompt browse command history without changing result selection. Tab completes a slash command; repeated Tab cycles matches. In result lists, ↑ / ↓ selects, Enter opens, and Escape returns to the prompt. Ctrl+L clears output.
- **Folders:** click or tap desktop icons, or use the Applications menu. CV file windows include section navigation, project/experience search, and detail views.
- **Export:** Download CV saves a compact `.txt` résumé in the selected language: a short profile, selected experience and results, skills, education, and contact links. Editorial copy and shared facts live in `src/content/cv.ts`; both interactive views retain the full CV.

## The desktop

- **Startup / power:** a brief boot sequence precedes the desktop. Skip is available; reduced-motion preferences shorten the sequence. The top-right power menu offers shutdown and restart. The powered-off screen has a power-on button. Restarting resets open windows and terminal history, while saved files, language, wallpaper, and icon positions remain.
- **Windows:** drag title bars, resize from edges and corners, minimize, maximize, restore, and close. Double-click a title bar to maximize/restore. The taskbar switches windows; its monitor button shows/restores the desktop. Mobile windows fill the available workspace.
- **Icons:** drag them to new positions. Click/tap opens; dragging suppresses opening. Alt+arrow moves a focused desktop icon with the keyboard. Arrange icons restores a grid. Positions persist locally and are constrained to the current viewport.
- **Create files:** right-click the desktop or use the taskbar folder-plus button. Create folders and text files; on touch, long-press an icon for its menu. My files provides creation buttons and folder navigation. Context menus include opening, renaming, moving nested files back to the desktop, and deletion with a confirmation dialog. In the file manager, drag a file onto a folder to move it; cycles and duplicate names are rejected.
- **Text editor:** notes autosave locally. Save/Ctrl+S confirms saving, and Download exports a real text file. Shift+Tab exits the text area when using the keyboard. Up to 150 local files and 100,000 characters per note are supported; available browser storage is the practical limit.
- **System controls:** the clock opens a navigable calendar. Network shows the browser’s real online/offline status. Sound controls adjust a local test tone. Settings includes language, three wallpapers, storage status, and icon arrangement.

Local files are stored under `gabriel-desktop-v1` in this origin’s `localStorage`; the language uses `gb-language`. They are not sent to Gabriel or written to the visitor’s actual filesystem. If storage is unavailable or full, the app keeps the current session working and displays a message to export notes. No raw shell commands are executed.

## Browser and Google

The desktop browser has an address bar, Google search, bookmarks, a start page, and session back/forward history. HTTP/HTTPS URLs and searches open in a real browser tab. It always provides a visible link if automatic opening is blocked.

**Google and many other websites forbid embedding.** Search results therefore open outside the simulated window; they are not imitated or proxied. The desktop browser does not request passwords, execute arbitrary schemes, or pretend to render external content. Browsing requires the visitor’s normal internet connection; it needs no API keys or paid services.

## Free GitHub Pages hosting

The existing repository is public: [Goprogabriel/cv](https://github.com/Goprogabriel/cv).

1. Push the project to `main`.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. `.github/workflows/deploy.yml` installs from the frozen lockfile, validates, builds, and deploys. It also supports manual dispatch.
4. Open the URL shown in the deployment job, normally `https://goprogabriel.github.io/cv/`.

The workflow takes its base path from GitHub Pages configuration, including custom domains. Outside the workflow, Vite accepts `BASE_PATH` or derives a subpath from `GITHUB_REPOSITORY`; local development defaults to `/`.

```bash
# Reproduce repository-subpath hosting:
BASE_PATH=/cv/ pnpm build
BASE_PATH=/cv/ pnpm preview
# http://localhost:4173/cv/
```

The desktop uses React state rather than URL routing, so refreshing the deployment URL needs no server rewrites. Every local image, font and script respects the base path. Startup runs again on refresh; local files and preferences are restored. Preparing the build does not push or publish it.

## Structure

- `src/content/cv.ts` — real bilingual content and text export
- `src/Locale.tsx` — shared locale and persisted language preference
- `src/commands.ts` — safe command parsing and completion
- `src/desktop.ts` — file validation, persistence recovery, folder moves, safe browser destinations
- `src/components/Content.tsx`, `FileManager.tsx`, `Terminal.tsx` — both CV navigation modes
- `src/components/BootScreen.tsx`, `DesktopIcon.tsx`, `Window.tsx` — desktop interactions
- `src/components/LocalFiles.tsx`, `FileDialog.tsx`, `BrowserApp.tsx` — local documents and browser
- `src/App.tsx`, `src/styles.css` — desktop state, panels, system menus and responsive styling
- `tests/` — command, localization, export, persistence, file operation, URL and window-bound checks

The previous Astro source and media remain in `legacy/` for reference. That directory and its old CV PDFs, models and WebAssembly files are excluded from deployment. This is an independent desktop-inspired design, not an official Kali Linux or Xfce product.
