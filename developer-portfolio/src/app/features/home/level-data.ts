import { portfolioLinks } from '../../domain/portfolio-links';
import { WORLD, WORLD_SPRITES } from './home.constants';
import { Cloud, LevelBlock } from './home.models';

export function createClouds(): readonly Cloud[] {
  return [
    { leftPercent: 14, topPx: 0, labelKey: 'nav.aboutMe', href: portfolioLinks.aboutMe },
    { leftPercent: 38, topPx: 28, labelKey: 'nav.experience', href: portfolioLinks.experience },
    { leftPercent: 62, topPx: 10, labelKey: 'nav.github', href: portfolioLinks.github },
    { leftPercent: 86, topPx: 34, labelKey: 'nav.courses', href: portfolioLinks.courses },
  ];
}

export function createLevelBlocks(): readonly LevelBlock[] {
  const tile = WORLD.blockSize;
  const lowRow = WORLD.groundOffsetPx + tile * 2;
  const highRow = lowRow + tile * 2;
  const question = WORLD_SPRITES.questionBlock;
  const brick = WORLD_SPRITES.brickBlock;

  return [
    { type: 'question', leftPercent: 22, offsetPx: 0, bottomPx: lowRow, spriteFile: question, url: portfolioLinks.questionBlockUrls[0] },
    { type: 'brick', leftPercent: 40, offsetPx: -tile * 2, bottomPx: lowRow, spriteFile: brick, url: '' },
    { type: 'question', leftPercent: 40, offsetPx: -tile, bottomPx: lowRow, spriteFile: question, url: portfolioLinks.questionBlockUrls[1] },
    { type: 'brick', leftPercent: 40, offsetPx: 0, bottomPx: lowRow, spriteFile: brick, url: '' },
    { type: 'question', leftPercent: 40, offsetPx: tile, bottomPx: lowRow, spriteFile: question, url: portfolioLinks.questionBlockUrls[2] },
    { type: 'brick', leftPercent: 40, offsetPx: tile * 2, bottomPx: lowRow, spriteFile: brick, url: '' },
    { type: 'question', leftPercent: 40, offsetPx: 0, bottomPx: highRow, spriteFile: question, url: portfolioLinks.questionBlockUrls[3] },
  ];
}

export function createFloorTiles(columns: number, rows: number): readonly number[] {
  return Array.from({ length: columns * rows }, (_, index) => index);
}
