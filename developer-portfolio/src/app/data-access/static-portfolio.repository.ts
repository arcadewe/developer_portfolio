import { Injectable } from '@angular/core';
import en from '../../../content/en.json';
import es from '../../../content/es.json';
import profile from '../../../content/profile.json';
import site from '../../../content/site.json';
import skills from '../../../content/skills.json';
import { Locale } from '../domain/locale';
import { PortfolioCopy } from '../domain/portfolio-copy';
import { PortfolioRepository } from '../domain/portfolio.repository';
import { CourseItem, ExperienceItem, NavigationLink, Profile, SkillGroup, SocialPlatform } from '../domain/portfolio.models';

const copies = { en, es } satisfies Record<Locale, PortfolioCopy>;

interface SiteNavigationEntry {
  readonly labelKey: string;
  readonly path?: string;
  readonly social?: string;
}

@Injectable({ providedIn: 'root' })
export class StaticPortfolioRepository extends PortfolioRepository {
  private readonly profile: Profile = profile;
  private readonly navigation = site.navigation.map((entry: SiteNavigationEntry) => this.toNavigationLink(entry));

  override getProfile(): Profile {
    return this.profile;
  }

  override getNavigation(): readonly NavigationLink[] {
    return this.navigation;
  }

  override getSkillGroups(): readonly SkillGroup[] {
    return skills;
  }

  override getCopy(locale: Locale): PortfolioCopy {
    return copies[locale];
  }

  override getExperiences(locale: Locale): readonly ExperienceItem[] {
    return this.getCopy(locale).experience.items;
  }

  override getCourses(locale: Locale): readonly CourseItem[] {
    return this.getCopy(locale).courses.items;
  }

  private toNavigationLink(entry: SiteNavigationEntry): NavigationLink {
    if (entry.path) {
      return { labelKey: entry.labelKey, href: entry.path, external: false };
    }

    if (entry.social && entry.social in this.profile.socials) {
      return { labelKey: entry.labelKey, href: this.profile.socials[entry.social as SocialPlatform], external: true };
    }

    throw new Error(`Navigation entry ${entry.labelKey} in content/site.json needs a path or a known social`);
  }
}
