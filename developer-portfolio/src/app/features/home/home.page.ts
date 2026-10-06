import { Component, ElementRef, HostListener, OnDestroy, OnInit, Signal, computed, signal, viewChild } from '@angular/core';
import { portfolioLinks } from '../../domain/portfolio-links';
import { Navigation } from '../../shared/ui/navigation/navigation';

const LEFT_KEYS = new Set(['ArrowLeft', 'a', 'A']);
const RIGHT_KEYS = new Set(['ArrowRight', 'd', 'D']);
const JUMP_KEYS = new Set(['ArrowUp', 'w', 'W']);

interface LevelBlock {
  readonly type: 'question' | 'brick';
  readonly leftPercent: number;
  readonly bottomPx: number;
  readonly spriteFile: string;
}

interface Cloud {
  readonly leftPercent: number;
  readonly topPx: number;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [Navigation],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePage implements OnInit, OnDestroy {
  private static readonly HORIZONTAL_SPEED_PERCENT_PER_SECOND = 45;
  private static readonly JUMP_VELOCITY_PX_PER_SECOND = 840;
  private static readonly GRAVITY_PX_PER_SECOND_SQUARED = 2160;
  private static readonly BLOCK_HIT_TOLERANCE_PERCENT = 4;
  private static readonly WALK_FRAME_SECONDS = 0.09;

  protected readonly spritePath = '/assets/images/sprites/';
  protected readonly characterSpritePath = '/assets/images/characters_sprites/';
  protected readonly walkFrames = this.createWalkFrames(9, 22);
  protected readonly currentFrameIndex = signal(0);
  protected readonly playerSpritePath = computed(() => this.characterSpritePath + this.walkFrames[this.currentFrameIndex()]);
  protected readonly floorSpritePath = this.spritePath + 'sprite-9-11.png';

  protected readonly brickBlockSpriteFile = 'sprite-1-2.png';
  protected readonly questionBlockSpriteFile = 'sprite-1-3.png';
  protected readonly pipeSpriteFile = '';
  protected readonly cloudSpriteFile = 'sprite-23-39.png';
  protected readonly clouds: readonly Cloud[] = this.createClouds();
  protected readonly flagBottomSpriteFile = 'sprite-36-37.png';
  protected readonly flagPoleSpriteFile = 'sprite-36-36.png';
  protected readonly flagTopSpriteFile = 'sprite-36-35.png';
  protected readonly flagFlagSpriteFile = 'sprite-36-34.png';

  protected readonly backgroundMusicFile = '';
  protected readonly jumpSoundFile = '';
  protected readonly blockHitSoundFile = '';

  protected readonly backgroundMusicRef = viewChild<ElementRef<HTMLAudioElement>>('backgroundMusic');
  protected readonly jumpSoundRef = viewChild<ElementRef<HTMLAudioElement>>('jumpSound');
  protected readonly blockHitSoundRef = viewChild<ElementRef<HTMLAudioElement>>('blockHitSound');

  protected readonly blockSize = 48;
  protected readonly floorTiles = this.createFloorTiles(64, 3);
  protected readonly playerPosition = signal(48);
  protected readonly verticalOffsetPosition = signal(0);
  protected readonly groundOffsetPx = 96;
  protected readonly levelBlocks: readonly LevelBlock[] = this.createLevelBlocks();

  private readonly heldKeys = new Set<string>();
  private readonly hitQuestionBlocks = new Set<number>();
  private verticalVelocity = 0;
  private lastFrameTime: number | null = null;
  private animationFrameId: number | null = null;
  private currentCollisionBlockIndex: number | null = null;
  private backgroundMusicStarted = false;
  private walkFrameTimer = 0;

  @HostListener('window:keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    if (!LEFT_KEYS.has(event.key) && !RIGHT_KEYS.has(event.key) && !JUMP_KEYS.has(event.key)) {
      return;
    }

    event.preventDefault();
    this.ensureBackgroundMusicStarted();

    if (JUMP_KEYS.has(event.key)) {
      this.jump();
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

  ngOnInit(): void {
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private jump(): void {
    const isGrounded = this.verticalOffsetPosition() === 0;
    if (!isGrounded) {
      return;
    }

    this.verticalVelocity = HomePage.JUMP_VELOCITY_PX_PER_SECOND;
    this.playSound(this.jumpSoundFile, this.jumpSoundRef);
  }

  private readonly tick = (timestamp: number): void => {
    const deltaSeconds = this.lastFrameTime === null ? 0 : (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    this.updateHorizontalPosition(deltaSeconds);
    this.updateVerticalPosition(deltaSeconds);
    this.checkBlockCollisions();

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  private updateHorizontalPosition(deltaSeconds: number): void {
    let movingLeft = false;
    let movingRight = false;

    for (const key of this.heldKeys) {
      movingLeft ||= LEFT_KEYS.has(key);
      movingRight ||= RIGHT_KEYS.has(key);
    }

    const isMoving = movingLeft !== movingRight;

    if (!isMoving) {
      this.walkFrameTimer = 0;
      this.currentFrameIndex.set(0);
      return;
    }

    const direction = movingLeft ? -1 : 1;
    this.playerPosition.update((position) =>
      Math.max(2, Math.min(96, position + direction * HomePage.HORIZONTAL_SPEED_PERCENT_PER_SECOND * deltaSeconds)),
    );

    this.advanceWalkFrame(deltaSeconds);
  }

  private advanceWalkFrame(deltaSeconds: number): void {
    this.walkFrameTimer += deltaSeconds;

    if (this.walkFrameTimer < HomePage.WALK_FRAME_SECONDS) {
      return;
    }

    this.walkFrameTimer = 0;
    this.currentFrameIndex.update((index) => (index + 1) % this.walkFrames.length);
  }

  private updateVerticalPosition(deltaSeconds: number): void {
    const isResting = this.verticalOffsetPosition() === 0 && this.verticalVelocity === 0;
    if (isResting) {
      return;
    }

    this.verticalVelocity -= HomePage.GRAVITY_PX_PER_SECOND_SQUARED * deltaSeconds;
    const nextOffset = this.verticalOffsetPosition() + this.verticalVelocity * deltaSeconds;

    if (nextOffset <= 0) {
      this.verticalOffsetPosition.set(0);
      this.verticalVelocity = 0;
      return;
    }

    this.verticalOffsetPosition.set(nextOffset);
  }

  private checkBlockCollisions(): void {
    const isRisingIntoABlock = this.verticalVelocity > 0;
    if (!isRisingIntoABlock) {
      this.currentCollisionBlockIndex = null;
      return;
    }

    const playerBottom = this.groundOffsetPx + this.verticalOffsetPosition();
    const playerLeft = this.playerPosition();

    const hitIndex = this.levelBlocks.findIndex(
      (block, index) =>
        index !== this.currentCollisionBlockIndex &&
        Math.abs(block.leftPercent - playerLeft) < HomePage.BLOCK_HIT_TOLERANCE_PERCENT &&
        playerBottom >= block.bottomPx &&
        playerBottom <= block.bottomPx + this.blockSize,
    );

    if (hitIndex === -1) {
      return;
    }

    this.currentCollisionBlockIndex = hitIndex;
    this.onBlockHit(this.levelBlocks[hitIndex], hitIndex);
  }

  private onBlockHit(block: LevelBlock, index: number): void {
    this.playSound(this.blockHitSoundFile, this.blockHitSoundRef);

    if (block.type === 'question' && !this.hitQuestionBlocks.has(index)) {
      this.hitQuestionBlocks.add(index);
      this.openQuestionBlockLink();
    }
  }

  private openQuestionBlockLink(): void {
    const url = portfolioLinks.questionBlockUrl;
    if (!url) {
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  private ensureBackgroundMusicStarted(): void {
    if (this.backgroundMusicStarted || !this.backgroundMusicFile) {
      return;
    }

    this.backgroundMusicStarted = true;
    this.playSound(this.backgroundMusicFile, this.backgroundMusicRef);
  }

  private playSound(file: string, ref: Signal<ElementRef<HTMLAudioElement> | undefined>): void {
    if (!file) {
      return;
    }

    const audio = ref()?.nativeElement;
    if (!audio) {
      return;
    }

    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }

  private createWalkFrames(start: number, end: number): readonly string[] {
    return Array.from({ length: end - start + 1 }, (_, index) => `sprite-${start + index}.png`);
  }

  private createClouds(): readonly Cloud[] {
    return [
      { leftPercent: 14, topPx: 0 },
      { leftPercent: 38, topPx: 28 },
      { leftPercent: 62, topPx: 10 },
      { leftPercent: 86, topPx: 34 },
    ];
  }

  private createLevelBlocks(): readonly LevelBlock[] {
    const rowOneBottom = this.groundOffsetPx + this.blockSize;
    const rowTwoBottom = rowOneBottom + this.blockSize;

    return [
      { type: 'question', leftPercent: 18, bottomPx: rowOneBottom, spriteFile: this.questionBlockSpriteFile },
      { type: 'brick', leftPercent: 26, bottomPx: rowOneBottom, spriteFile: this.brickBlockSpriteFile },
      { type: 'question', leftPercent: 32, bottomPx: rowOneBottom, spriteFile: this.questionBlockSpriteFile },
      { type: 'brick', leftPercent: 38, bottomPx: rowOneBottom, spriteFile: this.brickBlockSpriteFile },
      { type: 'brick', leftPercent: 44, bottomPx: rowOneBottom, spriteFile: this.brickBlockSpriteFile },
      { type: 'question', leftPercent: 32, bottomPx: rowTwoBottom, spriteFile: this.questionBlockSpriteFile },
    ];
  }

  private createFloorTiles(columns: number, rows: number): readonly number[] {
    return Array.from({ length: columns * rows }, (_, index) => index);
  }
}