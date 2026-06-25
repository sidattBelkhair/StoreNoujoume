import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { AppService } from '../../../core/services/app.service';
import { TranslationService } from '../../../core/services/translation.service';
import { NoujoumApp } from '../../../core/models/app.model';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { resolveAssetUrl } from '../../../core/utils/asset-url.util';

@Component({
  selector: 'app-app-detail',
  imports: [LoadingSpinner, EmptyState, TranslatePipe],
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
    private appService: AppService,
    private titleService: Title,
    private metaService: Meta,
    private ts: TranslationService
  ) {}

  goBack(): void { this.location.back(); }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set(this.ts.t('appDetail.notFound'));
      this.loading.set(false);
      return;
    }
    this.appService.getById(id).subscribe({
      next: (res) => {
        this.app.set(res.data);
        this.loading.set(false);
        this.updateSeoTags(res.data);
      },
      error: () => {
        this.error.set(this.ts.t('appDetail.loadError'));
        this.loading.set(false);
      },
    });
  }

  private updateSeoTags(app: NoujoumApp): void {
    const title = `${app.app_name} - Noujoum Store`;
    const description = (app.tagline || app.description || '').slice(0, 160);
    const image = app.icon_url ? resolveAssetUrl(app.icon_url) : '';
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'keywords', content: (app.tags ?? []).join(', ') });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    if (image) this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:url', content: window.location.href });
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

  openLightbox(index: number): void { this.lightboxIndex.set(index); }
  closeLightbox(): void { this.lightboxIndex.set(null); }

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

  toggleFavorite(): void { this.favorited.set(!this.favorited()); }

  fillStyle(filled: boolean): string {
    return filled ? "'FILL' 1" : "'FILL' 0";
  }

  pricingLabel(): string {
    const app = this.app();
    if (!app) return '';
    if (app.pricing) return app.pricing;
    const map: Record<string, string> = {
      free: this.ts.t('appDetail.free'),
      paid: this.ts.t('appDetail.paid'),
      freemium: this.ts.t('appDetail.freemium'),
    };
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
