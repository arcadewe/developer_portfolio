import { Component, inject } from '@angular/core';
import { PortfolioFacade } from '../../core/portfolio.facade';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

@Component({
  selector: 'app-header',
  imports: [LanguageSwitcher],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly portfolio = inject(PortfolioFacade);
}
