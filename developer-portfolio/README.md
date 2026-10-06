# Developer Portfolio — World 1-1

[Español](README.es.md)

A personal developer portfolio built as a playable, Super Mario–style level. Visitors run, jump and bump blocks to reach the different sections of the site, or use the regular navigation if they just want to read.

Built with **Angular 21** and deployed to **Firebase Hosting**.

## Features

- **Playable home page**: an 8-bit level with physics, collisions, a running/jumping character and a camera that follows the player on small screens.
- **Interactive elements**
  - **Cloud titles**: About me, Experience, Github and Courses sit on clouds you can also stand on.
  - **Question blocks**: hitting one from below opens the LinkedIn profile.
  - **Pipe**: standing on it and pressing down opens the GitHub profile.
  - **Flag**: touching the pole, top or flag downloads the CV (PDF).
- **Content pages**: About me (skills), Experience (timeline) and Courses.
- **English and Spanish**, switchable from the top-right corner. The choice is remembered.
- **Sound**: background music and effects, with a volume slider that is remembered between visits.
- **Responsive**: on screens 800px wide or less, the level keeps a fixed layout and zooms in on the player, the titles move into a burger menu, and on-screen touch controls appear.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | `←` `→` or `A` `D` | ◀ ▶ |
| Jump | `↑` or `W` | ▲ |
| Enter pipe | `↓` or `S` (on top of the pipe) | ▼ |

## Getting started

Requirements: [Node.js](https://nodejs.org/) 24 LTS (includes npm).

```bash
npm install
npm start
```

Open `http://localhost:4200/`. The page reloads automatically when you change a file.

| Command | What it does |
|---|---|
| `npm start` | Runs the development server |
| `npm run build` | Builds the production site into `dist/developer-portfolio/browser` |
| `npm test` | Runs the unit tests (Vitest) |
| `npm run watch` | Rebuilds on every change (development configuration) |

## Project structure

```
content/                  Site data and copy (edit these to change what the site says)
  en.json, es.json        UI text, experience and courses per language
  profile.json            Social links and CV path
  site.json               Navigation entries (clouds and mobile menu)
  skills.json             Skill groups on the About me page
public/assets/            Static files: sprites, audio and documents (CV)
src/styles/               Global CSS: fonts, design tokens, foundation
src/app/
  domain/                 Models, locales and the abstract PortfolioRepository
  data-access/            StaticPortfolioRepository and translation loader over content/
  core/                   App-wide services: PortfolioFacade, LanguageService, i18n providers, storage
  layout/                 Header, language switcher, mobile menu and the page shell
  shared/ui/              Reusable presentational components (pixel card, tag list, project card)
  features/
    home/                 The World 1-1 page
      game/               Constants, models, level data, collision and sprite helpers
      touch-controls/     On-screen mobile controls
      volume-control/     Volume slider
    about-me/, experience/, courses/
```

### How data flows

Pages never read JSON directly. They use `PortfolioFacade` (`core/`), which asks `PortfolioRepository` (`domain/`) for data. The current implementation, `StaticPortfolioRepository` (`data-access/`), reads the files in `content/`. To load content from somewhere else, such as an API, write a new repository and provide it in `app.config.ts`.

Translations use `@ngx-translate/core` with a custom loader that serves `content/en.json` and `content/es.json` from the bundle, so no extra network request is needed.

## Editing content

| To change | Edit |
|---|---|
| Any text on the site | `content/en.json` and `content/es.json` (keep both in step) |
| Experience entries | `experience.items` in both language files |
| Courses | `courses.items` in both language files |
| Skills on About me | `content/skills.json` |
| GitHub / LinkedIn links | `content/profile.json` |
| The CV that the flag downloads | Replace `public/assets/documents/daniel-caballero-resume.pdf`, or change `cv.path` in `content/profile.json` |
| Navigation entries | `content/site.json` |
| Level layout, physics, sprites and sounds | `src/app/features/home/game/` |
| Colors, fonts and shared styles | `src/styles/tokens.css` |

## Deployment

Every push to `main` builds the site and deploys it to Firebase Hosting through GitHub Actions (`.github/workflows/firebase-hosting-merge.yml`).

The workflow needs the repository secret `FIREBASE_SERVICE_ACCOUNT_DEVELOPER_PORTFOLIO_863DD`, which holds a Firebase service account key for the `developer-portfolio-863dd` project.

To deploy manually instead:

```bash
npm run build
npx firebase-tools deploy --only hosting
```

## Credits

- Music: "Overworld Theme" by Louswan and "Short Chiptune Loop" by 2D_PlatformerGuy (CC0), from [OpenGameArt](https://opengameart.org/).
- Sound effects: "8-Bit Sound Effect Pack Vol. 001" by Shades (CC0), from [OpenGameArt](https://opengameart.org/content/8-bit-sound-effect-pack-vol-001).
- Fonts: Press Start 2P and Space Grotesk, from Google Fonts.
- This is a personal, non-commercial fan tribute. Super Mario is a trademark of Nintendo, which is not affiliated with this project.
