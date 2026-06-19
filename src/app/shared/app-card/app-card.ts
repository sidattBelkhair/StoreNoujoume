import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NoujoumApp } from '../../core/models/app.model';

@Component({
  selector: 'app-app-card',
  imports: [RouterLink],
  templateUrl: './app-card.html',
  styleUrl: './app-card.scss',
})
export class AppCard {
  readonly app = input.required<NoujoumApp>();
}
