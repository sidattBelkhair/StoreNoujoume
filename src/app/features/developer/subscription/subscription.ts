import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location, DecimalPipe } from '@angular/common';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { TranslationService } from '../../../core/services/translation.service';
import { SubscriptionPackage, SubscriptionStatus, PaymentInfo } from '../../../core/models/subscription.model';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-subscription',
  imports: [FormsModule, DecimalPipe, LoadingSpinner, TranslatePipe],
  templateUrl: './subscription.html',
  styleUrl: './subscription.scss',
})
export class Subscription implements OnInit {
  readonly status = signal<SubscriptionStatus | null>(null);
  readonly packages = signal<SubscriptionPackage[]>([]);
  readonly paymentInfo = signal<PaymentInfo | null>(null);
  readonly selectedPackage = signal<SubscriptionPackage | null>(null);
  readonly loading = signal(true);
  readonly paymentInfoLoading = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  paymentDate = '';
  notes = '';
  proofFile: File | null = null;

  constructor(
    private location: Location,
    private subscriptionService: SubscriptionService,
    private ts: TranslationService
  ) {}

  goBack(): void { this.location.back(); }

  ngOnInit(): void {
    this.subscriptionService.getStatus().subscribe({
      next: (res) => this.status.set(res.data),
      error: () => this.status.set(null),
    });
    this.subscriptionService.getPackages().subscribe({
      next: (res) => { this.packages.set(res.data); this.loading.set(false); },
      error: () => { this.errorMessage.set(this.ts.t('subscription.errorLoad')); this.loading.set(false); },
    });
  }

  selectPackage(pkg: SubscriptionPackage): void {
    this.selectedPackage.set(pkg);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.paymentInfoLoading.set(true);
    this.subscriptionService.getPaymentInfo().subscribe({
      next: (res) => { this.paymentInfo.set(res.data); this.paymentInfoLoading.set(false); },
      error: () => { this.paymentInfo.set(null); this.paymentInfoLoading.set(false); },
    });
  }

  cancelSelection(): void {
    this.selectedPackage.set(null);
    this.paymentInfo.set(null);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  onProofSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.proofFile = file ?? null;
  }

  originalPrice(pkg: SubscriptionPackage): number {
    return Math.round(pkg.price / (1 - (pkg.discount_percent ?? 0) / 100));
  }

  submitPayment(): void {
    if (!this.paymentDate) { this.errorMessage.set(this.ts.t('payment.errorFields')); return; }
    if (!this.proofFile) { this.errorMessage.set(this.ts.t('payment.errorFields')); return; }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.subscriptionService.submitPayment(
      this.selectedPackage()!.id,
      this.proofFile!,
      this.paymentDate,
      this.notes || undefined
    ).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set(this.ts.t('payment.success'));
        this.selectedPackage.set(null);
        this.paymentInfo.set(null);
      },
      error: (err: { error?: { message?: string } }) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message || this.ts.t('payment.errorSubmit'));
      },
    });
  }

  packageDescription(pkg: SubscriptionPackage): string {
    const months = pkg.duration_months;
    let key: string;
    if (months === 1) key = 'subscription.descMonthly';
    else if (months === 3) key = 'subscription.descQuarterly';
    else if (months === 12) key = 'subscription.descAnnual';
    else key = 'subscription.descMonths';
    return this.ts.t(key);
  }
}
