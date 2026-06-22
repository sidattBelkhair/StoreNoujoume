import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { AppService } from '../../core/services/app.service';
import { CategoryService } from '../../core/services/category.service';
import { AppCategory, NoujoumApp } from '../../core/models/app.model';
import { unwrapPage } from '../../core/utils/pagination.util';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { resolveAssetUrl } from '../../core/utils/asset-url.util';

// Cahier des charges section 15 : la recherche doit aussi filtrer par
// catégorie, secteur d'activité et type d'application (en plus du texte
// libre, déjà géré par le backend).
const APP_TYPES: { value: string; label: string }[] = [
  { value: 'mobile', label: 'Application mobile' },
  { value: 'web', label: 'Application web' },
  { value: 'desktop', label: 'Application desktop' },
  { value: 'saas', label: 'SaaS / Cloud' },
  { value: 'api', label: 'API / Service' },
  { value: 'plugin', label: 'Plugin / Extension' },
  { value: 'template', label: 'Template / Modèle' },
];
const BUSINESS_SECTORS = ['Commerce', 'Services', 'Industrie', 'Santé', 'Éducation', 'Agriculture'];

@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink, LoadingSpinner],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit, OnDestroy {
  readonly resolveAssetUrl = resolveAssetUrl;
  readonly appTypes = APP_TYPES;
  readonly businessSectors = BUSINESS_SECTORS;

  query = '';
  categoryId: number | null = null;
  sector: string | null = null;
  appType: string | null = null;

  readonly categories = signal<AppCategory[]>([]);
  readonly results = signal<NoujoumApp[]>([]);
  readonly loading = signal(false);
  readonly searched = signal(false);
  readonly error = signal<string | null>(null);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Résultats bruts du backend (texte libre), avant filtres catégorie/secteur/type
  // appliqués côté client.
  private rawResults: NoujoumApp[] = [];

  private searchSubject = new Subject<string>();
  private sub?: Subscription;

  constructor(
    private appService: AppService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (res) => this.categories.set(res.data),
      error: () => this.categories.set([]),
    });

    this.sub = this.searchSubject.pipe(debounceTime(350)).subscribe((q) => this.runSearch(q));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onQueryChange(): void {
    if (!this.query.trim() && !this.hasActiveFilters()) {
      this.searched.set(false);
      this.rawResults = [];
      this.results.set([]);
      return;
    }
    this.searchSubject.next(this.query);
  }

  // Un filtre seul (sans texte) doit aussi permettre de parcourir les apps —
  // on relance donc la requête backend (search vide = toutes les apps).
  onFilterChange(): void {
    if (!this.query.trim() && !this.hasActiveFilters()) {
      this.searched.set(false);
      this.rawResults = [];
      this.results.set([]);
      return;
    }
    this.runSearch(this.query);
  }

  private hasActiveFilters(): boolean {
    return this.categoryId != null || this.sector != null || this.appType != null;
  }

  clearSearch(): void {
    this.query = '';
    this.categoryId = null;
    this.sector = null;
    this.appType = null;
    this.rawResults = [];
    this.results.set([]);
    this.searched.set(false);
    this.error.set(null);
    this.searchInput?.nativeElement.focus();
  }

  private runSearch(query: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.appService.getAll({ search: query, per_page: 100 }).subscribe({
      next: (res) => {
        this.rawResults = unwrapPage(res.data).items;
        this.applyClientFilters();
        this.searched.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('La recherche a échoué. Réessaie plus tard.');
        this.loading.set(false);
      },
    });
  }

  private applyClientFilters(): void {
    const filtered = this.rawResults.filter((app) => {
      if (this.categoryId != null && app.category_id !== this.categoryId) return false;
      if (this.sector && !(app.business_sectors ?? []).includes(this.sector)) return false;
      if (this.appType && app.app_type !== this.appType) return false;
      return true;
    });
    this.results.set(filtered);
  }
}
