import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { AppService } from '../../../core/services/app.service';
import { CategoryService } from '../../../core/services/category.service';
import { NoujoumApp, AppCategory } from '../../../core/models/app.model';
import { unwrapPage } from '../../../core/utils/pagination.util';
import { AppCard } from '../../../shared/app-card/app-card';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { Pagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-app-list',
  imports: [FormsModule, AppCard, LoadingSpinner, EmptyState, Pagination],
  templateUrl: './app-list.html',
  styleUrl: './app-list.scss',
})
export class AppList implements OnInit {
  readonly apps = signal<NoujoumApp[]>([]);
  readonly categories = signal<AppCategory[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);

  search = '';
  categoryId: number | null = null;
  sort: 'recent' | 'downloads' | 'rating' = 'recent';

  private searchSubject = new Subject<string>();

  constructor(
    private appService: AppService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories.set(res.data),
      error: () => this.categories.set([]),
    });

    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.currentPage.set(1);
      this.fetchApps();
    });

    this.fetchApps();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.fetchApps();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.fetchApps();
  }

  private fetchApps(): void {
    this.loading.set(true);
    this.error.set(null);
    this.appService
      .getAll({
        page: this.currentPage(),
        search: this.search || undefined,
        category_id: this.categoryId ?? undefined,
        sort: this.sort,
      })
      .subscribe({
        next: (res) => {
          const page = unwrapPage(res.data);
          this.apps.set(page.items);
          this.lastPage.set(page.lastPage);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Impossible de charger les applications. Réessaie plus tard.');
          this.loading.set(false);
        },
      });
  }
}
