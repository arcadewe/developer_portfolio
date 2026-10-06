import { FLAG_HITBOXES, PHYSICS, WORLD } from './game.constants';
import { BlockBounds, LevelBlock, PlatformBounds } from './game.models';

export const COLLISION_EPSILON_PX = 0.01;

export function blockBounds(block: LevelBlock, stageWidth: number): BlockBounds {
  const centerX = (block.leftPercent / 100) * stageWidth + block.offsetPx;
  const bottom = block.bottomPx - WORLD.groundOffsetPx;
  return {
    left: centerX - WORLD.blockSize / 2,
    right: centerX + WORLD.blockSize / 2,
    bottom,
    top: bottom + WORLD.blockSize,
  };
}

export function pipeBounds(stageWidth: number): BlockBounds {
  const centerX = (WORLD.pipeLeftPercent / 100) * stageWidth;
  return {
    left: centerX - WORLD.blockSize,
    right: centerX + WORLD.blockSize,
    bottom: 0,
    top: WORLD.blockSize * (WORLD.pipeBodyRows + 1),
  };
}

export function flagBounds(stageWidth: number): readonly BlockBounds[] {
  const centerX = (WORLD.flagLeftPercent / 100) * stageWidth;
  return Object.values(FLAG_HITBOXES).map((box) => ({
    left: centerX + box.left,
    right: centerX + box.right,
    bottom: box.bottom,
    top: box.top,
  }));
}

export function overlapsHorizontally(bounds: PlatformBounds, playerX: number): boolean {
  return playerX + PHYSICS.playerHalfWidthPx > bounds.left && playerX - PHYSICS.playerHalfWidthPx < bounds.right;
}

export function isTouching(bounds: BlockBounds, playerX: number, feet: number, marginPx: number): boolean {
  const reach = PHYSICS.playerHalfWidthPx + marginPx;
  const head = feet + PHYSICS.playerHeightPx;
  return (
    playerX + reach >= bounds.left &&
    playerX - reach <= bounds.right &&
    head + marginPx >= bounds.bottom &&
    feet - marginPx <= bounds.top
  );
}

export function surfaceHeightAt(platforms: readonly PlatformBounds[], playerX: number, feet: number): number {
  return platforms.reduce(
    (surface, platform) =>
      overlapsHorizontally(platform, playerX) && platform.top <= feet + COLLISION_EPSILON_PX ? Math.max(surface, platform.top) : surface,
    0,
  );
}
