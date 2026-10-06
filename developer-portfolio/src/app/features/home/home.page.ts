import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, Signal, computed, effect, signal, viewChild, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Navigation } from '../../shared/ui/navigation/navigation';
import { AUDIO_FILES, BACKGROUND_MUSIC_VOLUME, COMPACT_WORLD, FLAG_CONTACT_MARGIN_PX, FLAG_HITBOXES, DEFAULT_MASTER_VOLUME, DOWN_KEYS, VOLUME_STORAGE_KEY, JUMP_KEYS, LEFT_KEYS, PHYSICS, RIGHT_KEYS, SPRITE_PATHS, WORLD, WORLD_SPRITES } from './home.constants';
import { portfolioLinks } from '../../domain/portfolio-links';
import { LevelBlock } from './home.models';
import { MobileMenu } from './mobile-menu/mobile-menu';
import { createClouds, createFloorTiles, createLevelBlocks } from './level-data';
import { PLAYER_FRAMES, PlayerPose, isSpriteMirrored, playerFrameFile, resolvePlayerPose } from './player-sprites';

const COLLISION_EPSILON_PX = 0.01;
const CLOUD_SURFACE_INSET_PX = 6;

interface PlatformBounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
}

interface BlockBounds extends PlatformBounds {
  readonly bottom: number;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [Navigation, MobileMenu, RouterLink, TranslatePipe],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  protected readonly spritePath = SPRITE_PATHS.world;
  protected readonly sprites = WORLD_SPRITES;
  protected readonly floorSpritePath = SPRITE_PATHS.world + WORLD_SPRITES.floor;

  protected readonly blockSize = WORLD.blockSize;
  protected readonly groundOffsetPx = WORLD.groundOffsetPx;
  protected readonly clouds = createClouds();
  protected readonly cloudTiles = [0, 1, 2, 3, 4, 5];
  protected readonly levelBlocks: readonly LevelBlock[] = createLevelBlocks();
  protected readonly pipeLeftPercent = WORLD.pipeLeftPercent;
  protected readonly flagLeftPercent = WORLD.flagLeftPercent;
  protected readonly pipeBodyRows = Array.from({ length: WORLD.pipeBodyRows }, (_, index) => index);
  protected readonly floorTiles = createFloorTiles(WORLD.floorColumns, WORLD.floorRows);

  protected readonly playerPosition = signal<number>(WORLD.initialPlayerPositionPercent);
  protected readonly verticalOffsetPosition = signal(0);
  protected readonly facingLeft = signal(false);
  private readonly playerPose = signal<PlayerPose>('idle');
  private readonly runFrameIndex = signal(0);
  protected readonly spriteMirrored = computed(() => isSpriteMirrored(this.playerPose(), this.facingLeft()));
  protected readonly playerSpritePath = computed(
    () => SPRITE_PATHS.character + playerFrameFile(this.playerPose(), this.runFrameIndex()),
  );

  protected readonly audioFiles = AUDIO_FILES;
  protected readonly compactScale = signal<number | null>(null);
  protected readonly compactFrame = computed(() => {
    const scale = this.compactScale();
    return scale === null ? null : { width: COMPACT_WORLD.widthPx * scale, height: COMPACT_WORLD.heightPx * scale };
  });
  protected readonly volume = signal(this.loadVolume());
  protected readonly volumePercent = computed(() => Math.round(this.volume() * 100));
  protected readonly backgroundMusicRef = viewChild<ElementRef<HTMLAudioElement>>('backgroundMusic');
  protected readonly jumpSoundRef = viewChild<ElementRef<HTMLAudioElement>>('jumpSound');
  protected readonly blockHitSoundRef = viewChild<ElementRef<HTMLAudioElement>>('blockHitSound');
  protected readonly coinSoundRef = viewChild<ElementRef<HTMLAudioElement>>('coinSound');
  protected readonly pipeSoundRef = viewChild<ElementRef<HTMLAudioElement>>('pipeSound');
  private readonly viewportRef = viewChild<ElementRef<HTMLElement>>('viewport');
  private readonly stageRef = viewChild<ElementRef<HTMLElement>>('stage');
  private readonly cloudRowRefs = viewChildren<ElementRef<HTMLElement>>('cloudRow');

  private readonly heldKeys = new Set<string>();
  private readonly hitQuestionBlocks = new Set<number>();
  private verticalVelocity = 0;
  private isGrounded = true;
  private lastFrameTime: number | null = null;
  private animationFrameId: number | null = null;
  private backgroundMusicStarted = false;
  private runFrameTimer = 0;
  private isRunning = false;
  private isTouchingFlag = false;

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

    if (!LEFT_KEYS.has(event.key) && !RIGHT_KEYS.has(event.key) && !JUMP_KEYS.has(event.key) && !DOWN_KEYS.has(event.key)) {
      return;
    }

    event.preventDefault();
    this.ensureBackgroundMusicStarted();

    if (JUMP_KEYS.has(event.key)) {
      this.jump();
      return;
    }

    if (DOWN_KEYS.has(event.key)) {
      this.enterPipe();
      return;
    }

    this.heldKeys.add(event.key);
  }

  @HostListener('window:keyup', ['$event'])
  protected onKeyUp(event: KeyboardEvent): void {
    this.heldKeys.delete(event.key);
  }

  @HostListener('window:blur')
  protected onWindowBlur(): void {
    this.heldKeys.clear();
  }

  protected onVolumeInput(event: Event): void {
    const percent = Number((event.target as HTMLInputElement).value);
    this.volume.set(percent / 100);

    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(percent / 100));
    } catch {
      return;
    }
  }

  private loadVolume(): number {
    try {
      const saved = Number(localStorage.getItem(VOLUME_STORAGE_KEY));
      const hasSaved = localStorage.getItem(VOLUME_STORAGE_KEY) !== null && saved >= 0 && saved <= 1;
      return hasSaved ? saved : DEFAULT_MASTER_VOLUME;
    } catch {
      return DEFAULT_MASTER_VOLUME;
    }
  }

  protected pressControl(key: string, event: PointerEvent): void {
    event.preventDefault();
    this.ensureBackgroundMusicStarted();
    this.heldKeys.add(key);
  }

  protected releaseControl(key: string): void {
    this.heldKeys.delete(key);
  }

  protected downControl(event: PointerEvent): void {
    event.preventDefault();
    this.enterPipe();
  }

  protected jumpControl(event: PointerEvent): void {
    event.preventDefault();
    this.ensureBackgroundMusicStarted();
    this.jump();
  }

  @HostListener('window:resize')
  protected onResize(): void {
    this.updateCompactScale();
  }

  ngAfterViewInit(): void {
    this.updateCompactScale();
  }

  ngOnInit(): void {
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private jump(): void {
    if (!this.isGrounded) {
      return;
    }

    this.isGrounded = false;
    this.verticalVelocity = PHYSICS.jumpVelocityPxPerSecond;
    this.playSound(this.jumpSoundRef);
  }

  private enterPipe(): void {
    const stageWidth = this.stageWidth();
    if (!this.isGrounded || stageWidth === 0) {
      return;
    }

    const pipe = this.pipeBounds(stageWidth);
    const playerX = (this.playerPosition() / 100) * stageWidth;
    const isOnPipe = Math.abs(this.verticalOffsetPosition() - pipe.top) <= COLLISION_EPSILON_PX && playerX >= pipe.left && playerX <= pipe.right;
    if (!isOnPipe) {
      return;
    }

    this.heldKeys.clear();
    this.playSound(this.pipeSoundRef);
    window.open(portfolioLinks.github, '_blank', 'noopener,noreferrer');
  }

  private readonly tick = (timestamp: number): void => {
    const deltaSeconds = this.lastFrameTime === null ? 0 : (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    this.updateHorizontalPosition(deltaSeconds);
    this.updateVerticalPosition(deltaSeconds);
    this.updatePlayerAnimation(deltaSeconds);
    this.checkFlagContact();
    this.followPlayer();

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  private stageWidth(): number {
    return this.stageRef()?.nativeElement.offsetWidth ?? 0;
  }

  private updateCompactScale(): void {
    const viewport = this.viewportRef()?.nativeElement;
    if (!viewport || !window.matchMedia(COMPACT_WORLD.mediaQuery).matches) {
      this.compactScale.set(null);
      return;
    }

    const scale = Math.max(viewport.clientHeight / COMPACT_WORLD.heightPx, viewport.clientWidth / COMPACT_WORLD.widthPx);
    this.compactScale.set(scale);
  }

  private blockBounds(block: LevelBlock, stageWidth: number): BlockBounds {
    const centerX = (block.leftPercent / 100) * stageWidth + block.offsetPx;
    const bottom = block.bottomPx - WORLD.groundOffsetPx;
    return {
      left: centerX - WORLD.blockSize / 2,
      right: centerX + WORLD.blockSize / 2,
      bottom,
      top: bottom + WORLD.blockSize,
    };
  }

  private pipeBounds(stageWidth: number): BlockBounds {
    const centerX = (WORLD.pipeLeftPercent / 100) * stageWidth;
    return {
      left: centerX - WORLD.blockSize,
      right: centerX + WORLD.blockSize,
      bottom: 0,
      top: WORLD.blockSize * (WORLD.pipeBodyRows + 1),
    };
  }

  private flagBounds(stageWidth: number): readonly BlockBounds[] {
    const centerX = (WORLD.flagLeftPercent / 100) * stageWidth;
    return Object.values(FLAG_HITBOXES).map((box) => ({
      left: centerX + box.left,
      right: centerX + box.right,
      bottom: box.bottom,
      top: box.top,
    }));
  }

  private solidBounds(stageWidth: number): readonly BlockBounds[] {
    return [
      ...this.levelBlocks.map((block) => this.blockBounds(block, stageWidth)),
      this.pipeBounds(stageWidth),
      ...this.flagBounds(stageWidth),
    ];
  }

  private checkFlagContact(): void {
    const stageWidth = this.stageWidth();
    if (stageWidth === 0) {
      return;
    }

    const playerX = (this.playerPosition() / 100) * stageWidth;
    const feet = this.verticalOffsetPosition();
    const head = feet + PHYSICS.playerHeightPx;
    const reach = PHYSICS.playerHalfWidthPx + FLAG_CONTACT_MARGIN_PX;

    const isTouching = this.flagBounds(stageWidth).some(
      (bounds) =>
        playerX + reach >= bounds.left &&
        playerX - reach <= bounds.right &&
        head + FLAG_CONTACT_MARGIN_PX >= bounds.bottom &&
        feet - FLAG_CONTACT_MARGIN_PX <= bounds.top,
    );

    if (isTouching && !this.isTouchingFlag) {
      this.downloadCv();
    }

    this.isTouchingFlag = isTouching;
  }

  private downloadCv(): void {
    if (!portfolioLinks.cv) {
      return;
    }

    this.playSound(this.coinSoundRef);
    const link = document.createElement('a');
    link.href = portfolioLinks.cv;
    link.download = portfolioLinks.cv.split('/').pop() ?? 'cv.pdf';
    link.click();
  }

  private overlapsHorizontally(bounds: PlatformBounds, playerX: number): boolean {
    return playerX + PHYSICS.playerHalfWidthPx > bounds.left && playerX - PHYSICS.playerHalfWidthPx < bounds.right;
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

  private surfaceHeightAt(playerX: number, feetOffset: number, stageWidth: number): number {
    let surface = 0;

    for (const platform of this.cloudPlatformBounds()) {
      if (this.overlapsHorizontally(platform, playerX) && platform.top <= feetOffset + COLLISION_EPSILON_PX) {
        surface = Math.max(surface, platform.top);
      }
    }

    for (const bounds of this.solidBounds(stageWidth)) {
      if (this.overlapsHorizontally(bounds, playerX) && bounds.top <= feetOffset + COLLISION_EPSILON_PX) {
        surface = Math.max(surface, bounds.top);
      }
    }

    return surface;
  }

  private updateHorizontalPosition(deltaSeconds: number): void {
    let movingLeft = false;
    let movingRight = false;

    for (const key of this.heldKeys) {
      movingLeft ||= LEFT_KEYS.has(key);
      movingRight ||= RIGHT_KEYS.has(key);
    }

    this.isRunning = movingLeft !== movingRight;
    const stageWidth = this.stageWidth();
    if (!this.isRunning || stageWidth === 0) {
      return;
    }

    const direction = movingLeft ? -1 : 1;
    this.facingLeft.set(movingLeft);

    const minX = (PHYSICS.minPositionPercent / 100) * stageWidth;
    const maxX = (PHYSICS.maxPositionPercent / 100) * stageWidth;
    const step = (direction * PHYSICS.horizontalSpeedPercentPerSecond * stageWidth * deltaSeconds) / 100;
    let nextX = Math.max(minX, Math.min(maxX, (this.playerPosition() / 100) * stageWidth + step));

    const feet = this.verticalOffsetPosition();
    const head = feet + PHYSICS.playerHeightPx;

    for (const bounds of this.solidBounds(stageWidth)) {
      const overlapsVertically = feet < bounds.top - COLLISION_EPSILON_PX && head > bounds.bottom + COLLISION_EPSILON_PX;
      if (overlapsVertically && this.overlapsHorizontally(bounds, nextX)) {
        nextX = direction > 0 ? bounds.left - PHYSICS.playerHalfWidthPx : bounds.right + PHYSICS.playerHalfWidthPx;
      }
    }

    this.playerPosition.set((nextX / stageWidth) * 100);
  }

  private updateVerticalPosition(deltaSeconds: number): void {
    const stageWidth = this.stageWidth();
    if (stageWidth === 0) {
      return;
    }

    const playerX = (this.playerPosition() / 100) * stageWidth;
    const feet = this.verticalOffsetPosition();
    const surface = this.surfaceHeightAt(playerX, feet, stageWidth);

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
      if (isCrossed && this.overlapsHorizontally(bounds, playerX) && bounds.bottom < lowestBottom) {
        lowestBottom = bounds.bottom;
        hitIndex = index;
      }
    });

    if (hitIndex === -1) {
      return nextFeet;
    }

    this.verticalVelocity = 0;
    if (hitIndex < this.levelBlocks.length) {
      this.onBlockHit(this.levelBlocks[hitIndex], hitIndex);
    }
    return lowestBottom - PHYSICS.playerHeightPx;
  }

  private onBlockHit(block: LevelBlock, index: number): void {
    this.playSound(this.blockHitSoundRef);

    if (block.type === 'question' && !this.hitQuestionBlocks.has(index)) {
      this.hitQuestionBlocks.add(index);
      this.playSound(this.coinSoundRef);
      this.openQuestionBlockLink(block.url);
    }
  }

  private openQuestionBlockLink(url: string): void {
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private followPlayer(): void {
    const viewport = this.viewportRef()?.nativeElement;
    const stage = this.stageRef()?.nativeElement;
    if (!viewport || !stage) {
      return;
    }

    const scale = this.compactScale() ?? 1;
    const playerX = (this.playerPosition() / 100) * stage.offsetWidth * scale;
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

  private ensureBackgroundMusicStarted(): void {
    const music = this.backgroundMusicRef()?.nativeElement;
    if (this.backgroundMusicStarted || !music) {
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
