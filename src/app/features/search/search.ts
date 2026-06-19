import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { AppService } from '../../core/services/app.service';
import { NoujoumApp } from '../../core/models/app.model';
import { unwrapPage } from '../../core/utils/pagination.util';
import { AppCard } from '../../shared/app-card/app-card';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { EmptyState } from '../../shared/empty-state/empty-state';

@Component({
  selector: 'app-search',
  imports: [FormsModule, AppCard, LoadingSpinner, EmptyState],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit {
  query = '';
  readonly results = signal<NoujoumApp[]>([]);
  readonly loading = signal(false);
  readonly searched = signal(false);
  readonly error = signal<string | null>(null);

  private searchSubject = new Subject<string>();

  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(400)).subscribe((value) => this.runSearch(value));
  }

  onQueryChange(): void {
    if (!this.query.trim()) {
      this.searched.set(false);
      this.results.set([]);
      return;
    }
    this.searchSubject.next(this.query);
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
