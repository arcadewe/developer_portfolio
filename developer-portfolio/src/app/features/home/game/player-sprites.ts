export type PlayerPose = 'idle' | 'run' | 'jump';

export const PLAYER_FRAMES = {
  idle: ['sprite-14.png'],
  run: ['sprite-11.png', 'sprite-12.png', 'sprite-13.png'],
  jump: ['sprite-22.png'],
} as const satisfies Record<PlayerPose, readonly string[]>;

export function resolvePlayerPose(isAirborne: boolean, isRunning: boolean): PlayerPose {
  if (isAirborne) {
    return 'jump';
  }
  return isRunning ? 'run' : 'idle';
}

export function playerFrameFile(pose: PlayerPose, runFrameIndex: number): string {
  const frames = PLAYER_FRAMES[pose];
  return frames[runFrameIndex % frames.length];
}

export const NATIVE_FACING = {
  idle: 'left',
  run: 'left',
  jump: 'right',
} as const satisfies Record<PlayerPose, 'left' | 'right'>;

export function isSpriteMirrored(pose: PlayerPose, facingLeft: boolean): boolean {
  const nativeFacesLeft = NATIVE_FACING[pose] === 'left';
  return nativeFacesLeft !== facingLeft;
}
