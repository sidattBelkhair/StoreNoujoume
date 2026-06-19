import { Component, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../core/services/category.service';
import { AppCategory } from '../../core/models/app.model';
import { CategoryCard } from '../../shared/category-card/category-card';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { EmptyState } from '../../shared/empty-state/empty-state';

@Component({
  selector: 'app-categories',
  imports: [CategoryCard, LoadingSpinner, EmptyState],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  readonly categories = signal<AppCategory[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.categories.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les catégories.');
        this.loading.set(false);
      },
    });
  }
}
