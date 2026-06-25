import { Component, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../core/services/category.service';
import { TranslationService } from '../../core/services/translation.service';
import { AppCategory } from '../../core/models/app.model';
import { CategoryCard } from '../../shared/category-card/category-card';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-categories',
  imports: [CategoryCard, LoadingSpinner, EmptyState, TranslatePipe],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  readonly categories = signal<AppCategory[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor(
    private categoryService: CategoryService,
    private ts: TranslationService
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => { this.categories.set(res.data); this.loading.set(false); },
      error: () => { this.error.set(this.ts.t('categories.error')); this.loading.set(false); },
    });
  }
}
