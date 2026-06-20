import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { AppCategory, NoujoumApp } from '../../../core/models/app.model';
import { AppCard } from '../../../shared/app-card/app-card';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';
import { EmptyState } from '../../../shared/empty-state/empty-state';

@Component({
  selector: 'app-category-detail',
  imports: [AppCard, LoadingSpinner, EmptyState],
  templateUrl: './category-detail.html',
  styleUrl: './category-detail.scss',
})
export class CategoryDetail implements OnInit, OnDestroy {
  readonly category = signal<AppCategory | null>(null);
  readonly apps = signal<NoujoumApp[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private categoryService: CategoryService
  ) {}

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    // Use paramMap observable so navigating /categories/1 → /categories/2
    // reloads even if Angular reuses the component instance.
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id) {
        this.error.set('Catégorie introuvable.');
        this.loading.set(false);
        return;
      }

      this.loading.set(true);
      this.error.set(null);
      this.category.set(null);
      this.apps.set([]);

      // GET /categories/{id} returns the category with its apps[] inline.
      // The /apps?category_id= filter is ignored server-side, so we use
      // this endpoint as the only reliable way to get per-category apps.
      this.categoryService.getById(id).subscribe({
        next: (res) => {
          this.category.set(res.data);
          this.apps.set(res.data.apps ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Impossible de charger la catégorie.');
          this.loading.set(false);
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
}
