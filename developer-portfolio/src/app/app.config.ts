import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePortfolioI18n } from './core/i18n.providers';
import { StaticPortfolioRepository } from './data-access/static-portfolio.repository';
import { PortfolioRepository } from './domain/portfolio.repository';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePortfolioI18n(),
    { provide: PortfolioRepository, useExisting: StaticPortfolioRepository },
  ],
};
