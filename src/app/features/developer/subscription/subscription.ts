import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location, DecimalPipe } from '@angular/common';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { SubscriptionPackage, SubscriptionStatus, PaymentInfo } from '../../../core/models/subscription.model';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-subscription',
  imports: [FormsModule, DecimalPipe, LoadingSpinner],
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
    private subscriptionService: SubscriptionService
  ) {}

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.subscriptionService.getStatus().subscribe({
      next: (res) => this.status.set(res.data),
      error: () => this.status.set(null),
    });

    this.subscriptionService.getPackages().subscribe({
      next: (res) => {
        this.packages.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger les forfaits.');
        this.loading.set(false);
      },
    });
  }

  selectPackage(pkg: SubscriptionPackage): void {
    this.selectedPackage.set(pkg);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.paymentInfoLoading.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.subscriptionService.getPaymentInfo().subscribe({
      next: (res) => {
        this.paymentInfo.set(res.data);
        this.paymentInfoLoading.set(false);
      },
      error: () => {
        this.paymentInfo.set(null);
        this.paymentInfoLoading.set(false);
      },
    });
  }

  cancelSelection(): void {
    this.selectedPackage.set(null);
    this.paymentInfo.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  onProofSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.proofFile = input.files?.[0] || null;
  }

  submitPayment(): void {
    const pkg = this.selectedPackage();
    if (!pkg || !this.proofFile || !this.paymentDate) {
      this.errorMessage.set('Merci de remplir tous les champs et joindre une preuve de paiement.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.subscriptionService.submitPayment(pkg.id, this.proofFile, this.paymentDate, this.notes || undefined).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set('Ton paiement a été soumis. Il sera vérifié sous peu.');
        this.selectedPackage.set(null);
        this.proofFile = null;
        this.paymentDate = '';
        this.notes = '';
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message || 'La soumission du paiement a échoué.');
      },
    });
  }

  originalPrice(pkg: SubscriptionPackage): number {
    if (!pkg.discount_percent) return pkg.price;
    return Math.round(pkg.price / (1 - pkg.discount_percent / 100));
  }

  packageDescription(pkg: SubscriptionPackage): string {
    if (pkg.duration_months === 1) return 'Abonnement mensuel pour publier vos applications';
    if (pkg.duration_months === 3) return 'Abonnement trimestriel avec réduction';
    if (pkg.duration_months >= 12) return 'Abonnement annuel avec la meilleure valeur';
    return `Abonnement ${pkg.duration_months} mois`;
  }
}
