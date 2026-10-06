export const LEFT_KEYS: ReadonlySet<string> = new Set(['ArrowLeft', 'a', 'A']);
export const RIGHT_KEYS: ReadonlySet<string> = new Set(['ArrowRight', 'd', 'D']);
export const JUMP_KEYS: ReadonlySet<string> = new Set(['ArrowUp', 'w', 'W']);
export const DOWN_KEYS: ReadonlySet<string> = new Set(['ArrowDown', 's', 'S']);

export const PHYSICS = {
  horizontalSpeedPercentPerSecond: 45,
  jumpVelocityPxPerSecond: 960,
  gravityPxPerSecondSquared: 2160,
  playerHalfWidthPx: 18,
  playerHeightPx: 45,
  runFrameSeconds: 0.09,
  minPositionPercent: 2,
  maxPositionPercent: 96,
} as const;

export const WORLD = {
  blockSize: 48,
  groundOffsetPx: 96,
  floorColumns: 64,
  floorRows: 3,
  initialPlayerPositionPercent: 48,
  pipeLeftPercent: 65,
  pipeBodyRows: 1,
  flagLeftPercent: 92,
} as const;

export const FLAG_HITBOXES = {
  pole: { left: -4, right: 4, bottom: 48, top: 240 },
  top: { left: -12, right: 12, bottom: 240, top: 270 },
  cloth: { left: 2, right: 50, bottom: 192, top: 240 },
} as const;

export const FLAG_CONTACT_MARGIN_PX = 2;
export const CLOUD_SURFACE_INSET_PX = 6;

export const COMPACT_WORLD = {
  mediaQuery: '(max-width: 800px)',
  widthPx: 1024,
  heightPx: 640,
} as const;

export const SPRITE_PATHS = {
  world: '/assets/images/sprites/',
  character: '/assets/images/characters_sprites/',
} as const;

export const WORLD_SPRITES = {
  floor: 'sprite-9-11.png',
  brickBlock: 'sprite-1-2.png',
  questionBlock: 'sprite-1-3.png',
  pipeLipLeft: 'sprite-1-15.png',
  pipeLipRight: 'sprite-1-16.png',
  pipeBodyLeft: 'sprite-2-15.png',
  pipeBodyRight: 'sprite-2-16.png',
  cloud: 'sprite-23-39.png',
  flagBottom: 'sprite-36-37.png',
  flagPole: 'sprite-36-36.png',
  flagTop: 'sprite-36-35.png',
  flagFlag: 'sprite-36-34.png',
} as const;

export const AUDIO_FILES = {
  backgroundMusic: '/assets/audio/theme.ogg',
  backgroundMusicFallback: '/assets/audio/theme.mp3',
  jump: '/assets/audio/jump.wav',
  blockHit: '/assets/audio/bump.wav',
  coin: '/assets/audio/coin.wav',
  pipe: '/assets/audio/pipe.wav',
} as const;

export const BACKGROUND_MUSIC_VOLUME = 0.35;
export const DEFAULT_MASTER_VOLUME = 0.7;
export const VOLUME_STORAGE_KEY = 'developer-portfolio-volume';
