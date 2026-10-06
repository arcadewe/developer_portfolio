import { Component, input } from '@angular/core';
import { PortfolioProject } from '../../../domain/portfolio.models';

@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.html',
  styleUrl: './project-card.css',
})
export class ProjectCard {
  readonly project = input.required<PortfolioProject>();
  readonly link = input('');
}