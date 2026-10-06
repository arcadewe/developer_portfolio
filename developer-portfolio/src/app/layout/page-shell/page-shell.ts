import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Header } from '../header/header';

@Component({
  selector: 'app-page-shell',
  imports: [Header, RouterLink, TranslatePipe],
  templateUrl: './page-shell.html',
  styleUrl: './page-shell.css',
})
export class PageShell {
  readonly titleKey = input.required<string>();
}
