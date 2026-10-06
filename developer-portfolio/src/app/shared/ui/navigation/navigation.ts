import { Component, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { portfolioLinks } from '../../../domain/portfolio-links';

const LANGUAGE_STORAGE_KEY = 'developer-portfolio-lang';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation {
  protected readonly links = portfolioLinks;

  private readonly translate = inject(TranslateService);
  protected readonly currentLang = this.translate.currentLang;

  constructor() {
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLang) {
      this.translate.use(savedLang).subscribe();
    }
  }

  protected setLanguage(lang: string): void {
    this.translate.use(lang).subscribe();
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }
}