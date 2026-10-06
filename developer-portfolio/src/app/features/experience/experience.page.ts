import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ExperienceItem } from '../../domain/portfolio-content';
import { PageShell } from '../../shared/ui/page-shell/page-shell';

@Component({
  selector: 'app-experience-page',
  standalone: true,
  imports: [PageShell, TranslatePipe],
  templateUrl: './experience.page.html',
  styleUrl: './experience.page.css',
})
export class ExperiencePage {
  private readonly translate = inject(TranslateService);
  protected readonly items = toSignal(this.translate.stream('experience.items'), { initialValue: [] as readonly ExperienceItem[] });

  protected asItems(value: unknown): readonly ExperienceItem[] {
    return Array.isArray(value) ? value : [];
  }
}
