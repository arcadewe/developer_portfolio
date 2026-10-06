import { Component, output } from '@angular/core';

export type MoveDirection = 'left' | 'right';

@Component({
  selector: 'app-touch-controls',
  templateUrl: './touch-controls.html',
  styleUrl: './touch-controls.css',
})
export class TouchControls {
  readonly moveStart = output<MoveDirection>();
  readonly moveEnd = output<MoveDirection>();
  readonly jump = output<void>();
  readonly enter = output<void>();

  protected start(direction: MoveDirection, event: PointerEvent): void {
    event.preventDefault();
    this.moveStart.emit(direction);
  }

  protected press(action: 'jump' | 'enter', event: PointerEvent): void {
    event.preventDefault();
    if (action === 'jump') {
      this.jump.emit();
      return;
    }

    this.enter.emit();
  }
}
