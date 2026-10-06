import { Component, input } from '@angular/core';

export type PixelCardTone = 'paper' | 'brick';

@Component({
  selector: 'app-pixel-card',
  template: '<ng-content />',
  styleUrl: './pixel-card.css',
  host: { '[class]': "'tone-' + tone()" },
})
export class PixelCard {
  readonly tone = input<PixelCardTone>('paper');
}
