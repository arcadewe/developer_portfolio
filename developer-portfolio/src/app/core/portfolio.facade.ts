import { Injectable, computed, inject } from '@angular/core';
import { PortfolioRepository } from '../domain/portfolio.repository';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class PortfolioFacade {
  private readonly repository = inject(PortfolioRepository);
  private readonly language = inject(LanguageService);

  readonly profile = this.repository.getProfile();
  readonly navigation = this.repository.getNavigation();
  readonly skillGroups = this.repository.getSkillGroups();
  readonly experiences = computed(() => this.repository.getExperiences(this.language.locale()));
  readonly courses = computed(() => this.repository.getCourses(this.language.locale()));
}
