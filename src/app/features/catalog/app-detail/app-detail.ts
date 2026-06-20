import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AppService } from '../../../core/services/app.service';
import { NoujoumApp } from '../../../core/models/app.model';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { resolveAssetUrl } from '../../../core/utils/asset-url.util';

@Component({
  selector: 'app-app-detail',
  imports: [LoadingSpinner, EmptyState],
  templateUrl: './app-detail.html',
  styleUrl: './app-detail.scss',
})
export class AppDetail implements OnInit {
  readonly resolveAssetUrl = resolveAssetUrl;
  readonly app = signal<NoujoumApp | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeScreenshotIndex = signal(0);
  readonly copied = signal(false);
  readonly lightboxIndex = signal<number | null>(null);
  readonly favorited = signal(false);

  @ViewChild('screenshotsRef') screenshotsRef!: ElementRef<HTMLElement>;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private appService: AppService
  ) {}

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Application introuvable.');
      this.loading.set(false);
      return;
    }
    this.appService.getById(id).subscribe({
      next: (res) => {
        this.app.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger cette application.');
        this.loading.set(false);
      },
    });
  }

  scrollToShot(index: number): void {
    this.activeScreenshotIndex.set(index);
    const el = this.screenshotsRef?.nativeElement;
    if (!el) return;
    const count = this.app()?.screenshots?.length ?? 1;
    el.scrollTo({ left: index * (el.scrollWidth / count), behavior: 'smooth' });
  }

  onShotScroll(event: Event): void {
    const el = event.target as HTMLElement;
    const count = this.app()?.screenshots?.length ?? 1;
    const index = Math.round(el.scrollLeft / (el.scrollWidth / count));
    this.activeScreenshotIndex.set(Math.min(index, count - 1));
  }

  openLightbox(index: number): void {
    this.lightboxIndex.set(index);
  }

  closeLightbox(): void {
    this.lightboxIndex.set(null);
  }

  nextScreenshot(): void {
    const shots = this.app()?.screenshots ?? [];
    const index = this.lightboxIndex();
    if (index === null || !shots.length) return;
    this.lightboxIndex.set((index + 1) % shots.length);
  }

  prevScreenshot(): void {
    const shots = this.app()?.screenshots ?? [];
    const index = this.lightboxIndex();
    if (index === null || !shots.length) return;
    this.lightboxIndex.set((index - 1 + shots.length) % shots.length);
  }

  onLightboxKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') this.nextScreenshot();
    if (event.key === 'ArrowLeft') this.prevScreenshot();
    if (event.key === 'Escape') this.closeLightbox();
  }

  share(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  toggleFavorite(): void {
    this.favorited.set(!this.favorited());
  }

  fillStyle(filled: boolean): string {
    return filled ? "'FILL' 1" : "'FILL' 0";
  }

  pricingLabel(): string {
    const app = this.app();
    if (!app) return '';
    if (app.pricing) return app.pricing;
    const map: Record<string, string> = { free: 'Gratuit', paid: 'Payant', freemium: 'Freemium' };
    return app.pricing_model ? (map[app.pricing_model] ?? app.pricing_model) : '';
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  }

  whatsappHref(number: string): string {
    const clean = number.replace(/\D/g, '');
    return `https://wa.me/${clean}`;
  }
}
