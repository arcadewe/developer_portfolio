import { Component, HostListener, OnDestroy, signal } from '@angular/core';
import { Navigation } from '../../shared/ui/navigation/navigation';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [Navigation],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePage implements OnDestroy {
  private static readonly JUMP_VELOCITY = 14;
  private static readonly GRAVITY = 0.6;

  protected readonly spritePath = '/assets/images/sprites/';
  protected readonly playerSpritePath = this.spritePath + 'sprite-38-12.png';
  protected readonly floorSpritePath = this.spritePath + 'sprite-1-2.png';
  protected readonly floorTiles = this.createFloorTiles(64, 3);
  protected readonly playerPosition = signal(48);
  protected readonly verticalOffsetPosition = signal(0);
  protected readonly groundOffsetPx = 96;

  private verticalVelocity = 0;
  private animationFrameId: number | null = null;

  @HostListener('window:keydown', ['$event'])
  protected movePlayer(event: KeyboardEvent): void {
    if (!['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D', 'w', 'W', 'ArrowUp'].includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
      this.jump();
      return;
    }

    const direction = event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a' ? -1 : 1;
    this.playerPosition.update((position) => Math.max(2, Math.min(96, position + direction * 2)));
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private jump(): void {
    if (this.verticalOffsetPosition() !== 0) {
      return; // already airborne, ignore repeated jump presses
    }

    this.verticalVelocity = HomePage.JUMP_VELOCITY;
    this.animationFrameId = requestAnimationFrame(this.stepJump);
  }

  private readonly stepJump = (): void => {
    this.verticalVelocity -= HomePage.GRAVITY;
    const nextOffset = this.verticalOffsetPosition() + this.verticalVelocity;

    if (nextOffset <= 0) {
      this.verticalOffsetPosition.set(0);
      this.verticalVelocity = 0;
      this.animationFrameId = null;
      return; // back at floor level, stop the loop
    }

    this.verticalOffsetPosition.set(nextOffset);
    this.animationFrameId = requestAnimationFrame(this.stepJump);
  };

  private createFloorTiles(columns: number, rows: number): readonly number[] {
    return Array.from({ length: columns * rows }, (_, index) => index);
  }
}