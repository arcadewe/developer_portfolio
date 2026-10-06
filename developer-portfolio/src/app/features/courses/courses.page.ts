import { Component, inject } from '@angular/core';
import { PortfolioFacade } from '../../core/portfolio.facade';
import { PageShell } from '../../layout/page-shell/page-shell';
import { PixelCard } from '../../shared/ui/pixel-card/pixel-card';
import { TagList } from '../../shared/ui/tag-list/tag-list';

@Component({
  selector: 'app-courses-page',
  imports: [PageShell, PixelCard, TagList],
  templateUrl: './courses.page.html',
  styleUrl: './courses.page.css',
})
export class CoursesPage {
  protected readonly portfolio = inject(PortfolioFacade);
}
