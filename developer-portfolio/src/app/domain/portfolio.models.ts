export type SocialPlatform = 'github' | 'linkedin';

export interface Profile {
  readonly socials: Readonly<Record<SocialPlatform, string>>;
  readonly cv: { readonly path: string };
}

export interface NavigationLink {
  readonly labelKey: string;
  readonly href: string;
  readonly external: boolean;
}

export interface SkillGroup {
  readonly titleKey: string;
  readonly skills: readonly string[];
}

export interface ExperienceItem {
  readonly role: string;
  readonly company: string;
  readonly period: string;
  readonly highlights: readonly string[];
  readonly stack: readonly string[];
}

export interface CourseItem {
  readonly title: string;
  readonly provider: string;
  readonly year: string;
  readonly summary: string;
  readonly topics: readonly string[];
}

export interface PortfolioProject {
  readonly title: string;
  readonly summary: string;
  readonly stack: readonly string[];
  readonly sprite: string;
}
