import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  readonly activeScreenshot = signal<string | null>(null);
  readonly copied = signal(false);
  readonly lightboxIndex = signal<number | null>(null);

  constructor(
    private route: ActivatedRoute,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set("Application introuvable.");
      this.loading.set(false);
      return;
    }

    this.appService.getById(id).subscribe({
      next: (res) => {
        this.app.set(res.data);
        this.activeScreenshot.set(res.data.screenshots?.[0] ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Impossible de charger cette application.");
        this.loading.set(false);
      },
    });
  }

  selectScreenshot(url: string): void {
    this.activeScreenshot.set(url);
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
}
