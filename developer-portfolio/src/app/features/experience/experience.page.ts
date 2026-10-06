import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PortfolioFacade } from '../../core/portfolio.facade';
import { PageShell } from '../../layout/page-shell/page-shell';
import { PixelCard } from '../../shared/ui/pixel-card/pixel-card';
import { TagList } from '../../shared/ui/tag-list/tag-list';

@Component({
  selector: 'app-experience-page',
  imports: [PageShell, PixelCard, TagList, TranslatePipe],
  templateUrl: './experience.page.html',
  styleUrl: './experience.page.css',
})
export class ExperiencePage {
  protected readonly portfolio = inject(PortfolioFacade);
}
