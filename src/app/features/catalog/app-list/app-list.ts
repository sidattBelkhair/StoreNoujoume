import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { AppService } from '../../../core/services/app.service';
import { CategoryService } from '../../../core/services/category.service';
import { TranslationService } from '../../../core/services/translation.service';
import { NoujoumApp, AppCategory } from '../../../core/models/app.model';
import { unwrapPage } from '../../../core/utils/pagination.util';
import { AppCard } from '../../../shared/app-card/app-card';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { Pagination } from '../../../shared/pagination/pagination';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

const CLIENT_PAGE_SIZE = 12;
const FETCH_ALL_PER_PAGE = 200;

@Component({
  selector: 'app-app-list',
  imports: [FormsModule, AppCard, LoadingSpinner, EmptyState, Pagination, TranslatePipe],
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

  private allApps: NoujoumApp[] = [];
  private searchSubject = new Subject<string>();

  constructor(
    private appService: AppService,
    private categoryService: CategoryService,
    private ts: TranslationService
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories.set(res.data),
      error: () => this.categories.set([]),
    });

    this.searchSubject.pipe(debounceTime(400)).subscribe(() => this.fetchApps());
    this.fetchApps();
  }

  onSearchChange(): void { this.searchSubject.next(this.search); }
  onCategoryChange(): void { this.applyClientFilters(true); }
  onSortChange(): void { this.fetchApps(); }
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.applyClientFilters();
  }

  private fetchApps(): void {
    this.loading.set(true);
    this.error.set(null);
    this.appService.getAll({ per_page: FETCH_ALL_PER_PAGE, search: this.search || undefined, sort: this.sort }).subscribe({
      next: (res) => {
        this.allApps = unwrapPage(res.data).items;
        this.applyClientFilters(true);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.ts.t('appList.error'));
        this.loading.set(false);
      },
    });
  }

  private applyClientFilters(resetPage = false): void {
    const filtered = this.categoryId == null
      ? this.allApps
      : this.allApps.filter((app) => app.category_id === this.categoryId);

    const lastPage = Math.max(1, Math.ceil(filtered.length / CLIENT_PAGE_SIZE));
    const page = resetPage ? 1 : Math.min(this.currentPage(), lastPage);

    this.currentPage.set(page);
    this.lastPage.set(lastPage);
    this.apps.set(filtered.slice((page - 1) * CLIENT_PAGE_SIZE, page * CLIENT_PAGE_SIZE));
  }
}
