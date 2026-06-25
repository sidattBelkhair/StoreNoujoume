import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppService } from '../../../core/services/app.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { TranslationService, Lang } from '../../../core/services/translation.service';
import { User } from '../../../core/models/user.model';
import { NoujoumApp } from '../../../core/models/app.model';
import { SubscriptionStatus } from '../../../core/models/subscription.model';
import { unwrapPage } from '../../../core/utils/pagination.util';
import { resolveAssetUrl } from '../../../core/utils/asset-url.util';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, LoadingSpinner, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  readonly resolveAssetUrl = resolveAssetUrl;
  readonly profile = signal<User | null>(null);
  readonly subscriptionStatus = signal<SubscriptionStatus | null>(null);
  readonly myApps = signal<NoujoumApp[]>([]);
  readonly loading = signal(true);
  readonly deletingId = signal<number | null>(null);

  get currentLang() { return this.ts.lang; }

  constructor(
    private authService: AuthService,
    private appService: AppService,
    private subscriptionService: SubscriptionService,
    public ts: TranslationService
  ) {}

  setLang(lang: Lang): void {
    this.ts.setLang(lang);
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (res) => this.profile.set(res.data),
      error: () => this.profile.set(this.authService.currentUser()),
    });

    this.subscriptionService.getStatus().subscribe({
      next: (res) => this.subscriptionStatus.set(res.data),
      error: () => this.subscriptionStatus.set(null),
    });

    this.appService.getMyApps().subscribe({
      next: (res) => { this.myApps.set(unwrapPage(res.data).items); this.loading.set(false); },
      error: () => { this.myApps.set([]); this.loading.set(false); },
    });
  }

  deleteApp(app: NoujoumApp): void {
    const msg = this.ts.t('dashboard.deleteConfirm').replace('{name}', app.app_name);
    if (!window.confirm(msg)) return;

    this.deletingId.set(app.id);
    this.appService.delete(app.id).subscribe({
      next: () => { this.myApps.set(this.myApps().filter((a) => a.id !== app.id)); this.deletingId.set(null); },
      error: () => { this.deletingId.set(null); window.alert(this.ts.t('dashboard.deleteError')); },
    });
  }

  statusLabel(app: NoujoumApp): string {
    return app.is_approved ? this.ts.t('dashboard.statusApproved') : this.ts.t('dashboard.statusPending');
  }
}
