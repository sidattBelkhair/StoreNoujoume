import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { TranslationService } from '../../../core/services/translation.service';
import { AppCategory, NoujoumApp } from '../../../core/models/app.model';
import { AppCard } from '../../../shared/app-card/app-card';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-category-detail',
  imports: [AppCard, LoadingSpinner, EmptyState, TranslatePipe],
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
    private categoryService: CategoryService,
    private titleService: Title,
    private metaService: Meta,
    private ts: TranslationService
  ) {}

  goBack(): void { this.location.back(); }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id) {
        this.error.set(this.ts.t('categoryDetail.error'));
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      this.error.set(null);
      this.category.set(null);
      this.apps.set([]);

      this.categoryService.getById(id).subscribe({
        next: (res) => {
          this.category.set(res.data);
          this.apps.set(res.data.apps ?? []);
          this.loading.set(false);
          this.updateSeoTags(res.data);
        },
        error: () => {
          this.error.set(this.ts.t('categoryDetail.error'));
          this.loading.set(false);
        },
      });
    });
  }

  ngOnDestroy(): void { this.routeSub?.unsubscribe(); }

  private updateSeoTags(category: AppCategory): void {
    const title = `${category.name} - Noujoum Store`;
    const description = (category.description || '').slice(0, 160);
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
  }
}
