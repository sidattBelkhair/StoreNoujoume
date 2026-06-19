import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppService } from '../../core/services/app.service';
import { CategoryService } from '../../core/services/category.service';
import { NoujoumApp, AppCategory } from '../../core/models/app.model';
import { AppCard } from '../../shared/app-card/app-card';
import { CategoryCard } from '../../shared/category-card/category-card';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-home',
  imports: [RouterLink, AppCard, CategoryCard, LoadingSpinner],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  readonly stats = signal<{ total_apps: number; total_developers: number } | null>(null);
  readonly categories = signal<AppCategory[]>([]);
  readonly featuredApps = signal<NoujoumApp[]>([]);
  readonly popularApps = signal<NoujoumApp[]>([]);
  readonly loading = signal(true);

  constructor(
    private appService: AppService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.appService.getStats().subscribe({
      next: (res) => this.stats.set(res.data),
      error: () => this.stats.set(null),
    });

    this.categoryService.getAll().subscribe({
      next: (res) => this.categories.set(res.data.slice(0, 8)),
      error: () => this.categories.set([]),
    });

    this.appService.getFeatured().subscribe({
      next: (res) => this.featuredApps.set(res.data),
      error: () => this.featuredApps.set([]),
    });

    this.appService.getMostDownloaded().subscribe({
      next: (res) => {
        this.popularApps.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.popularApps.set([]);
        this.loading.set(false);
      },
    });
  }
}
