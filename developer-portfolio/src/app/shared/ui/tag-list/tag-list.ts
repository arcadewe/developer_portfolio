import { Component, input } from '@angular/core';

export type TagTone = 'paper' | 'sky' | 'brick';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.html',
  styleUrl: './tag-list.css',
})
export class TagList {
  readonly tags = input.required<readonly string[]>();
  readonly tone = input<TagTone>('paper');
}
