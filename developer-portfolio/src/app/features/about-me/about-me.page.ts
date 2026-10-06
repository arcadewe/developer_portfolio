import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PortfolioFacade } from '../../core/portfolio.facade';
import { PageShell } from '../../layout/page-shell/page-shell';
import { PixelCard } from '../../shared/ui/pixel-card/pixel-card';
import { TagList } from '../../shared/ui/tag-list/tag-list';

@Component({
  selector: 'app-about-me-page',
  imports: [PageShell, PixelCard, TagList, TranslatePipe],
  templateUrl: './about-me.page.html',
  styleUrl: './about-me.page.css',
})
export class AboutMePage {
  protected readonly portfolio = inject(PortfolioFacade);
}
