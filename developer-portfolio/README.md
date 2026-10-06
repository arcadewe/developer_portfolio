# DeveloperPortfolio

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.23.

## Project structure

```
content/                  Site data and copy (edit these to change what the site says)
  en.json, es.json        UI text, experience and courses per language
  profile.json            Social links and CV path
  site.json               Navigation entries (clouds and mobile menu)
  skills.json             Skill groups on the About me page
public/assets/            Sprites, audio and documents served as static files
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

Pages read data through `PortfolioFacade`, which delegates to `PortfolioRepository`. To load content from somewhere else, provide a different repository in `app.config.ts`.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
