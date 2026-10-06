import { Component, HostListener, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Cloud } from '../home.models';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.css',
})
export class MobileMenu {
  readonly clouds = input.required<readonly Cloud[]>();
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
