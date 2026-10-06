import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-volume-control',
  imports: [TranslatePipe],
  templateUrl: './volume-control.html',
  styleUrl: './volume-control.css',
})
export class VolumeControl {
  readonly percent = input.required<number>();
  readonly percentChange = output<number>();

  protected onInput(event: Event): void {
    this.percentChange.emit(Number((event.target as HTMLInputElement).value));
  }
}
