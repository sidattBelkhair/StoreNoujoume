import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NoujoumApp } from '../../core/models/app.model';
import { resolveAssetUrl } from '../../core/utils/asset-url.util';

@Component({
  selector: 'app-app-card',
  imports: [RouterLink],
  templateUrl: './app-card.html',
  styleUrl: './app-card.scss',
})
export class AppCard {
  readonly app = input.required<NoujoumApp>();
  readonly resolveAssetUrl = resolveAssetUrl;
}
