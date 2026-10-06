import { NavigationLink } from '../../../domain/portfolio.models';
import { WORLD, WORLD_SPRITES } from './game.constants';
import { CloudPlatform, LevelBlock } from './game.models';

const CLOUD_POSITIONS = [
  { leftPercent: 14, topPx: 0 },
  { leftPercent: 38, topPx: 28 },
  { leftPercent: 62, topPx: 10 },
  { leftPercent: 86, topPx: 34 },
] as const;

export const CLOUD_TILE_COUNT = 6;

export function createClouds(navigation: readonly NavigationLink[]): readonly CloudPlatform[] {
  return CLOUD_POSITIONS.slice(0, navigation.length).map((position, index) => ({ ...position, link: navigation[index] }));
}

export function createLevelBlocks(questionBlockUrl: string): readonly LevelBlock[] {
  const tile = WORLD.blockSize;
  const lowRow = WORLD.groundOffsetPx + tile * 2;
  const highRow = lowRow + tile * 2;
  const question = (leftPercent: number, offsetPx: number, bottomPx: number): LevelBlock => ({
    type: 'question',
    leftPercent,
    offsetPx,
    bottomPx,
    spriteFile: WORLD_SPRITES.questionBlock,
    url: questionBlockUrl,
  });
  const brick = (leftPercent: number, offsetPx: number, bottomPx: number): LevelBlock => ({
    type: 'brick',
    leftPercent,
    offsetPx,
    bottomPx,
    spriteFile: WORLD_SPRITES.brickBlock,
    url: '',
  });

  return [
    question(22, 0, lowRow),
    brick(40, -tile * 2, lowRow),
    question(40, -tile, lowRow),
    brick(40, 0, lowRow),
    question(40, tile, lowRow),
    brick(40, tile * 2, lowRow),
    question(40, 0, highRow),
  ];
}

export function createRange(length: number): readonly number[] {
  return Array.from({ length }, (_, index) => index);
}
