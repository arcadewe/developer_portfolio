import { CourseItem, ExperienceItem } from './portfolio.models';

export interface PortfolioCopy {
  readonly nav: Readonly<Record<string, string>>;
  readonly experience: {
    readonly level: string;
    readonly items: readonly ExperienceItem[];
  };
  readonly courses: {
    readonly items: readonly CourseItem[];
  };
}
