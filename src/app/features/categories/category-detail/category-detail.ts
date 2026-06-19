import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { AppService } from '../../../core/services/app.service';
import { AppCategory, NoujoumApp } from '../../../core/models/app.model';
import { unwrapPage } from '../../../core/utils/pagination.util';
import { AppCard } from '../../../shared/app-card/app-card';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { Pagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-category-detail',
  imports: [AppCard, LoadingSpinner, EmptyState, Pagination],
  templateUrl: './category-detail.html',
  styleUrl: './category-detail.scss',
})
export class CategoryDetail implements OnInit {
  readonly category = signal<AppCategory | null>(null);
  readonly apps = signal<NoujoumApp[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);

  private categoryId = 0;

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.categoryId) {
      this.error.set('Catégorie introuvable.');
      this.loading.set(false);
      return;
    }

    this.categoryService.getById(this.categoryId).subscribe({
      next: (res) => this.category.set(res.data),
      error: () => this.error.set('Impossible de charger la catégorie.'),
    });

    this.fetchApps();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.fetchApps();
  }

  private fetchApps(): void {
    this.loading.set(true);
    this.appService.getAll({ category_id: this.categoryId, page: this.currentPage() }).subscribe({
      next: (res) => {
        const page = unwrapPage(res.data);
        this.apps.set(page.items);
        this.lastPage.set(page.lastPage);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les applications.');
        this.loading.set(false);
      },
    });
  }
}
