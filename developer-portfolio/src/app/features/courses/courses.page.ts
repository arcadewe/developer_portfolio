import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { CourseItem } from '../../domain/portfolio-content';
import { PageShell } from '../../shared/ui/page-shell/page-shell';

@Component({
  selector: 'app-courses-page',
  standalone: true,
  imports: [PageShell],
  templateUrl: './courses.page.html',
  styleUrl: './courses.page.css',
})
export class CoursesPage {
  private readonly translate = inject(TranslateService);
  protected readonly items = toSignal(this.translate.stream('courses.items'), { initialValue: [] as readonly CourseItem[] });

  protected asItems(value: unknown): readonly CourseItem[] {
    return Array.isArray(value) ? value : [];
  }
}
