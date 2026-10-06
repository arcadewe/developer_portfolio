import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Navigation } from '../navigation/navigation';

@Component({
  selector: 'app-page-shell',
  standalone: true,
  imports: [Navigation, RouterLink, TranslatePipe],
  templateUrl: './page-shell.html',
  styleUrl: './page-shell.css',
})
export class PageShell {
  readonly titleKey = input.required<string>();
}
