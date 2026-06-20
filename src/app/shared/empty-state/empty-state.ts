import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  imports: [],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  readonly message = input('Aucun résultat trouvé.');
  // Accepts any Material Symbol name. Default matches the mobile app's grid icon.
  readonly icon = input('apps');
}
