import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppCategory } from '../../core/models/app.model';

@Component({
  selector: 'app-category-card',
  imports: [RouterLink],
  templateUrl: './category-card.html',
  styleUrl: './category-card.scss',
})
export class CategoryCard {
  readonly category = input.required<AppCategory>();
}
