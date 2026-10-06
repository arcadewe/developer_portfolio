import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PortfolioFacade } from '../../core/portfolio.facade';

@Component({
  selector: 'app-mobile-menu',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.css',
})
export class MobileMenu {
  protected readonly portfolio = inject(PortfolioFacade);
  protected readonly menuOpen = signal(false);

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMenu();
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
