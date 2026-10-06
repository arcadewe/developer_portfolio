import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, Signal, computed, effect, inject, signal, viewChild, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { readStorage, writeStorage } from '../../core/browser-storage';
import { PortfolioFacade } from '../../core/portfolio.facade';
import { Header } from '../../layout/header/header';
import { MobileMenu } from '../../layout/mobile-menu/mobile-menu';
import {
  COLLISION_EPSILON_PX,
  blockBounds,
  flagBounds,
  isTouching,
  overlapsHorizontally,
  pipeBounds,
  surfaceHeightAt,
} from './game/collision';
import {
  AUDIO_FILES,
  BACKGROUND_MUSIC_VOLUME,
  CLOUD_SURFACE_INSET_PX,
  COMPACT_WORLD,
  DEFAULT_MASTER_VOLUME,
  DOWN_KEYS,
  FLAG_CONTACT_MARGIN_PX,
  JUMP_KEYS,
  LEFT_KEYS,
  PHYSICS,
  RIGHT_KEYS,
  SPRITE_PATHS,
  VOLUME_STORAGE_KEY,
  WORLD,
  WORLD_SPRITES,
} from './game/game.constants';
import { BlockBounds, LevelBlock, PlatformBounds } from './game/game.models';
import { CLOUD_TILE_COUNT, createClouds, createLevelBlocks, createRange } from './game/level-data';
import { PLAYER_FRAMES, PlayerPose, isSpriteMirrored, playerFrameFile, resolvePlayerPose } from './game/player-sprites';
import { MoveDirection, TouchControls } from './touch-controls/touch-controls';
import { VolumeControl } from './volume-control/volume-control';

@Component({
  selector: 'app-home-page',
  imports: [Header, MobileMenu, RouterLink, TouchControls, TranslatePipe, VolumeControl],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  private readonly portfolio = inject(PortfolioFacade);

  protected readonly spritePath = SPRITE_PATHS.world;
  protected readonly sprites = WORLD_SPRITES;
  protected readonly floorSpritePath = SPRITE_PATHS.world + WORLD_SPRITES.floor;
  protected readonly audioFiles = AUDIO_FILES;

  protected readonly groundOffsetPx = WORLD.groundOffsetPx;
  protected readonly pipeLeftPercent = WORLD.pipeLeftPercent;
  protected readonly flagLeftPercent = WORLD.flagLeftPercent;
  protected readonly clouds = createClouds(this.portfolio.navigation);
  protected readonly cloudTiles = createRange(CLOUD_TILE_COUNT);
  protected readonly levelBlocks = createLevelBlocks(this.portfolio.profile.socials.linkedin);
  protected readonly pipeBodyRows = createRange(WORLD.pipeBodyRows);
  protected readonly floorTiles = createRange(WORLD.floorColumns * WORLD.floorRows);

  protected readonly playerPosition = signal<number>(WORLD.initialPlayerPositionPercent);
  protected readonly verticalOffsetPosition = signal(0);
  private readonly facingLeft = signal(false);
  private readonly playerPose = signal<PlayerPose>('idle');
  private readonly runFrameIndex = signal(0);
  protected readonly spriteMirrored = computed(() => isSpriteMirrored(this.playerPose(), this.facingLeft()));
  protected readonly playerSpritePath = computed(
    () => SPRITE_PATHS.character + playerFrameFile(this.playerPose(), this.runFrameIndex()),
  );

  protected readonly compactScale = signal<number | null>(null);
  protected readonly compactFrame = computed(() => {
    const scale = this.compactScale();
    return scale === null ? null : { width: COMPACT_WORLD.widthPx * scale, height: COMPACT_WORLD.heightPx * scale };
  });
  protected readonly volume = signal(this.loadVolume());
  protected readonly volumePercent = computed(() => Math.round(this.volume() * 100));

  private readonly backgroundMusicRef = viewChild<ElementRef<HTMLAudioElement>>('backgroundMusic');
  private readonly jumpSoundRef = viewChild<ElementRef<HTMLAudioElement>>('jumpSound');
  private readonly blockHitSoundRef = viewChild<ElementRef<HTMLAudioElement>>('blockHitSound');
  private readonly coinSoundRef = viewChild<ElementRef<HTMLAudioElement>>('coinSound');
  private readonly pipeSoundRef = viewChild<ElementRef<HTMLAudioElement>>('pipeSound');
  private readonly viewportRef = viewChild<ElementRef<HTMLElement>>('viewport');
  private readonly stageRef = viewChild<ElementRef<HTMLElement>>('stage');
  private readonly cloudRowRefs = viewChildren<ElementRef<HTMLElement>>('cloudRow');

  private readonly heldDirections = new Set<MoveDirection>();
  private verticalVelocity = 0;
  private isGrounded = true;
  private isRunning = false;
  private isTouchingFlag = false;
  private runFrameTimer = 0;
  private lastFrameTime: number | null = null;
  private animationFrameId: number | null = null;
  private backgroundMusicStarted = false;

  constructor() {
    effect(() => {
      const volume = this.volume();
      const music = this.backgroundMusicRef()?.nativeElement;
      if (music) {
        music.volume = volume * BACKGROUND_MUSIC_VOLUME;
      }

      for (const ref of [this.jumpSoundRef, this.blockHitSoundRef, this.coinSoundRef, this.pipeSoundRef]) {
        const audio = ref()?.nativeElement;
        if (audio) {
          audio.volume = volume;
        }
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    if (event.target instanceof HTMLInputElement) {
      return;
    }

    const direction = this.keyToDirection(event.key);
    if (!direction && !JUMP_KEYS.has(event.key) && !DOWN_KEYS.has(event.key)) {
      return;
    }

    event.preventDefault();

    if (JUMP_KEYS.has(event.key)) {
      this.onJump();
      return;
    }

    if (DOWN_KEYS.has(event.key)) {
      this.enterPipe();
      return;
    }

    if (direction) {
      this.onMoveStart(direction);
    }
  }

  @HostListener('window:keyup', ['$event'])
  protected onKeyUp(event: KeyboardEvent): void {
    const direction = this.keyToDirection(event.key);
    if (direction) {
      this.onMoveEnd(direction);
    }
  }

  @HostListener('window:blur')
  protected onWindowBlur(): void {
    this.heldDirections.clear();
  }

  @HostListener('window:resize')
  protected onResize(): void {
    this.updateCompactScale();
  }

  ngOnInit(): void {
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  ngAfterViewInit(): void {
    this.updateCompactScale();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  protected onMoveStart(direction: MoveDirection): void {
    this.ensureBackgroundMusicStarted();
    this.heldDirections.add(direction);
  }

  protected onMoveEnd(direction: MoveDirection): void {
    this.heldDirections.delete(direction);
  }

  protected onJump(): void {
    this.ensureBackgroundMusicStarted();
    if (!this.isGrounded) {
      return;
    }

    this.isGrounded = false;
    this.verticalVelocity = PHYSICS.jumpVelocityPxPerSecond;
    this.playSound(this.jumpSoundRef);
  }

  protected onVolumeChange(percent: number): void {
    this.volume.set(percent / 100);
    writeStorage(VOLUME_STORAGE_KEY, String(percent / 100));
  }

  protected enterPipe(): void {
    const stageWidth = this.stageWidth();
    if (!this.isGrounded || stageWidth === 0) {
      return;
    }

    const pipe = pipeBounds(stageWidth);
    const playerX = this.playerX(stageWidth);
    const isOnPipe = Math.abs(this.verticalOffsetPosition() - pipe.top) <= COLLISION_EPSILON_PX && playerX >= pipe.left && playerX <= pipe.right;
    if (!isOnPipe) {
      return;
    }

    this.heldDirections.clear();
    this.playSound(this.pipeSoundRef);
    this.openInNewTab(this.portfolio.profile.socials.github);
  }

  private readonly tick = (timestamp: number): void => {
    const deltaSeconds = this.lastFrameTime === null ? 0 : (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    const stageWidth = this.stageWidth();
    if (stageWidth > 0) {
      this.updateHorizontalPosition(deltaSeconds, stageWidth);
      this.updateVerticalPosition(deltaSeconds, stageWidth);
      this.checkFlagContact(stageWidth);
    }

    this.updatePlayerAnimation(deltaSeconds);
    this.followPlayer();

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  private keyToDirection(key: string): MoveDirection | null {
    if (LEFT_KEYS.has(key)) {
      return 'left';
    }

    return RIGHT_KEYS.has(key) ? 'right' : null;
  }

  private stageWidth(): number {
    return this.stageRef()?.nativeElement.offsetWidth ?? 0;
  }

  private playerX(stageWidth: number): number {
    return (this.playerPosition() / 100) * stageWidth;
  }

  private updateCompactScale(): void {
    const viewport = this.viewportRef()?.nativeElement;
    if (!viewport || !window.matchMedia(COMPACT_WORLD.mediaQuery).matches) {
      this.compactScale.set(null);
      return;
    }

    this.compactScale.set(Math.max(viewport.clientHeight / COMPACT_WORLD.heightPx, viewport.clientWidth / COMPACT_WORLD.widthPx));
  }

  private solidBounds(stageWidth: number): readonly BlockBounds[] {
    return [...this.levelBlocks.map((block) => blockBounds(block, stageWidth)), pipeBounds(stageWidth), ...flagBounds(stageWidth)];
  }

  private cloudPlatformBounds(): readonly PlatformBounds[] {
    const stage = this.stageRef()?.nativeElement;
    if (!stage) {
      return [];
    }

    const scale = this.compactScale() ?? 1;
    const stageRect = stage.getBoundingClientRect();
    return this.cloudRowRefs().map(({ nativeElement }) => {
      const rowRect = nativeElement.getBoundingClientRect();
      return {
        left: (rowRect.left - stageRect.left) / scale,
        right: (rowRect.right - stageRect.left) / scale,
        top: (stageRect.bottom - rowRect.top) / scale - WORLD.groundOffsetPx - CLOUD_SURFACE_INSET_PX,
      };
    });
  }

  private updateHorizontalPosition(deltaSeconds: number, stageWidth: number): void {
    const movingLeft = this.heldDirections.has('left');
    const movingRight = this.heldDirections.has('right');
    this.isRunning = movingLeft !== movingRight;
    if (!this.isRunning) {
      return;
    }

    const direction = movingLeft ? -1 : 1;
    this.facingLeft.set(movingLeft);

    const minX = (PHYSICS.minPositionPercent / 100) * stageWidth;
    const maxX = (PHYSICS.maxPositionPercent / 100) * stageWidth;
    const step = (direction * PHYSICS.horizontalSpeedPercentPerSecond * stageWidth * deltaSeconds) / 100;
    let nextX = Math.max(minX, Math.min(maxX, this.playerX(stageWidth) + step));

    const feet = this.verticalOffsetPosition();
    const head = feet + PHYSICS.playerHeightPx;

    for (const bounds of this.solidBounds(stageWidth)) {
      const overlapsVertically = feet < bounds.top - COLLISION_EPSILON_PX && head > bounds.bottom + COLLISION_EPSILON_PX;
      if (overlapsVertically && overlapsHorizontally(bounds, nextX)) {
        nextX = direction > 0 ? bounds.left - PHYSICS.playerHalfWidthPx : bounds.right + PHYSICS.playerHalfWidthPx;
      }
    }

    this.playerPosition.set((nextX / stageWidth) * 100);
  }

  private updateVerticalPosition(deltaSeconds: number, stageWidth: number): void {
    const playerX = this.playerX(stageWidth);
    const feet = this.verticalOffsetPosition();
    const surface = surfaceHeightAt([...this.cloudPlatformBounds(), ...this.solidBounds(stageWidth)], playerX, feet);

    if (feet <= surface + COLLISION_EPSILON_PX && this.verticalVelocity <= 0) {
      this.verticalOffsetPosition.set(surface);
      this.verticalVelocity = 0;
      this.isGrounded = true;
      return;
    }

    this.isGrounded = false;
    this.verticalVelocity -= PHYSICS.gravityPxPerSecondSquared * deltaSeconds;
    let nextFeet = feet + this.verticalVelocity * deltaSeconds;

    if (this.verticalVelocity > 0) {
      nextFeet = this.resolveHeadCollision(playerX, feet, nextFeet, stageWidth);
    } else if (nextFeet <= surface) {
      nextFeet = surface;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    }

    this.verticalOffsetPosition.set(nextFeet);
  }

  private resolveHeadCollision(playerX: number, feet: number, nextFeet: number, stageWidth: number): number {
    const head = feet + PHYSICS.playerHeightPx;
    const nextHead = nextFeet + PHYSICS.playerHeightPx;
    let hitIndex = -1;
    let lowestBottom = Infinity;

    this.solidBounds(stageWidth).forEach((bounds, index) => {
      const isCrossed = bounds.bottom >= head - COLLISION_EPSILON_PX && bounds.bottom < nextHead;
      if (isCrossed && overlapsHorizontally(bounds, playerX) && bounds.bottom < lowestBottom) {
        lowestBottom = bounds.bottom;
        hitIndex = index;
      }
    });

    if (hitIndex === -1) {
      return nextFeet;
    }

    this.verticalVelocity = 0;
    if (hitIndex < this.levelBlocks.length) {
      this.onBlockHit(this.levelBlocks[hitIndex]);
    }
    return lowestBottom - PHYSICS.playerHeightPx;
  }

  private onBlockHit(block: LevelBlock): void {
    this.playSound(this.blockHitSoundRef);

    if (block.type === 'question') {
      this.playSound(this.coinSoundRef);
      this.openInNewTab(block.url);
    }
  }

  private checkFlagContact(stageWidth: number): void {
    const playerX = this.playerX(stageWidth);
    const feet = this.verticalOffsetPosition();
    const touching = flagBounds(stageWidth).some((bounds) => isTouching(bounds, playerX, feet, FLAG_CONTACT_MARGIN_PX));

    if (touching && !this.isTouchingFlag) {
      this.downloadCv();
    }

    this.isTouchingFlag = touching;
  }

  private downloadCv(): void {
    const path = this.portfolio.profile.cv.path;
    if (!path) {
      return;
    }

    this.playSound(this.coinSoundRef);
    const link = document.createElement('a');
    link.href = path;
    link.download = path.split('/').pop() ?? 'cv.pdf';
    link.click();
  }

  private openInNewTab(url: string): void {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  private followPlayer(): void {
    const viewport = this.viewportRef()?.nativeElement;
    const stage = this.stageRef()?.nativeElement;
    if (!viewport || !stage) {
      return;
    }

    const scale = this.compactScale() ?? 1;
    const playerX = this.playerX(stage.offsetWidth) * scale;
    const playerY = (stage.offsetHeight - WORLD.groundOffsetPx - this.verticalOffsetPosition() - PHYSICS.playerHeightPx / 2) * scale;

    if (viewport.scrollWidth > viewport.clientWidth) {
      viewport.scrollLeft = playerX - viewport.clientWidth / 2;
    }

    if (viewport.scrollHeight > viewport.clientHeight) {
      viewport.scrollTop = playerY - viewport.clientHeight / 2;
    }
  }

  private updatePlayerAnimation(deltaSeconds: number): void {
    const pose = resolvePlayerPose(!this.isGrounded, this.isRunning);
    this.playerPose.set(pose);

    if (pose !== 'run') {
      this.runFrameTimer = 0;
      this.runFrameIndex.set(0);
      return;
    }

    this.runFrameTimer += deltaSeconds;
    if (this.runFrameTimer < PHYSICS.runFrameSeconds) {
      return;
    }

    this.runFrameTimer = 0;
    this.runFrameIndex.update((index) => (index + 1) % PLAYER_FRAMES.run.length);
  }

  private loadVolume(): number {
    const saved = readStorage(VOLUME_STORAGE_KEY);
    const value = Number(saved);
    return saved !== null && value >= 0 && value <= 1 ? value : DEFAULT_MASTER_VOLUME;
  }

  private ensureBackgroundMusicStarted(): void {
    if (this.backgroundMusicStarted || !this.backgroundMusicRef()) {
      return;
    }

    this.backgroundMusicStarted = true;
    this.playSound(this.backgroundMusicRef);
  }

  private playSound(ref: Signal<ElementRef<HTMLAudioElement> | undefined>): void {
    const audio = ref()?.nativeElement;
    if (!audio) {
      return;
    }

    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }
}
