import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { aboutMeSkillGroups } from '../../domain/portfolio-content';
import { PageShell } from '../../shared/ui/page-shell/page-shell';

@Component({
  selector: 'app-about-me-page',
  standalone: true,
  imports: [PageShell, TranslatePipe],
  templateUrl: './about-me.page.html',
  styleUrl: './about-me.page.css',
})
export class AboutMePage {
  protected readonly skillGroups = aboutMeSkillGroups;
}
