import { Component, input } from '@angular/core';
import { PortfolioProject } from '../../../domain/portfolio-content';

@Component({
  selector: 'app-project-card',
  standalone: true,
  templateUrl: './project-card.html',
  styleUrl: './project-card.css',
})
export class ProjectCard {
  readonly project = input.required<PortfolioProject>();
  readonly link = input('');
}