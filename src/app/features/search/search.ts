import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { AppService } from '../../core/services/app.service';
import { NoujoumApp } from '../../core/models/app.model';
import { unwrapPage } from '../../core/utils/pagination.util';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { resolveAssetUrl } from '../../core/utils/asset-url.util';

@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink, LoadingSpinner],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit, OnDestroy {
  readonly resolveAssetUrl = resolveAssetUrl;
  query = '';
  readonly results = signal<NoujoumApp[]>([]);
  readonly loading = signal(false);
  readonly searched = signal(false);
  readonly error = signal<string | null>(null);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private searchSubject = new Subject<string>();
  private sub?: Subscription;

  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.sub = this.searchSubject.pipe(debounceTime(350)).subscribe((q) => this.runSearch(q));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onQueryChange(): void {
    if (!this.query.trim()) {
      this.searched.set(false);
      this.results.set([]);
      return;
    }
    this.searchSubject.next(this.query);
  }

  clearSearch(): void {
    this.query = '';
    this.results.set([]);
    this.searched.set(false);
    this.error.set(null);
    this.searchInput?.nativeElement.focus();
  }

  private runSearch(query: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.appService.getAll({ search: query }).subscribe({
      next: (res) => {
        this.results.set(unwrapPage(res.data).items);
        this.searched.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('La recherche a échoué. Réessaie plus tard.');
        this.loading.set(false);
      },
    });
  }
}
