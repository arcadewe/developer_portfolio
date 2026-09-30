import { Component } from '@angular/core';
import { portfolioLinks } from '../../../domain/portfolio-links';

@Component({
  selector: 'app-navigation',
  standalone: true,
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation {
  protected readonly links = portfolioLinks;
}