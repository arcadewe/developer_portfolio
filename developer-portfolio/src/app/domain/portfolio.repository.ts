import { Locale } from './locale';
import { PortfolioCopy } from './portfolio-copy';
import { CourseItem, ExperienceItem, NavigationLink, Profile, SkillGroup } from './portfolio.models';

export abstract class PortfolioRepository {
  abstract getProfile(): Profile;
  abstract getNavigation(): readonly NavigationLink[];
  abstract getSkillGroups(): readonly SkillGroup[];
  abstract getCopy(locale: Locale): PortfolioCopy;
  abstract getExperiences(locale: Locale): readonly ExperienceItem[];
  abstract getCourses(locale: Locale): readonly CourseItem[];
}
