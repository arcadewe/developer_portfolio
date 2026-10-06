export interface LevelBlock {
  readonly type: 'question' | 'brick';
  readonly leftPercent: number;
  readonly offsetPx: number;
  readonly bottomPx: number;
  readonly spriteFile: string;
  readonly url: string;
}

export interface Cloud {
  readonly leftPercent: number;
  readonly topPx: number;
  readonly labelKey: string;
  readonly href: string;
}
