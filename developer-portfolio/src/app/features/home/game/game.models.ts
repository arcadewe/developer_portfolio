import { NavigationLink } from '../../../domain/portfolio.models';

export type BlockType = 'question' | 'brick';

export interface LevelBlock {
  readonly type: BlockType;
  readonly leftPercent: number;
  readonly offsetPx: number;
  readonly bottomPx: number;
  readonly spriteFile: string;
  readonly url: string;
}

export interface CloudPlatform {
  readonly leftPercent: number;
  readonly topPx: number;
  readonly link: NavigationLink;
}

export interface PlatformBounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
}

export interface BlockBounds extends PlatformBounds {
  readonly bottom: number;
}
