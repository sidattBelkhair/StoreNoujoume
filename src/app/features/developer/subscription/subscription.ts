import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { SubscriptionPackage, SubscriptionStatus, PaymentInfo } from '../../../core/models/subscription.model';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-subscription',
  imports: [FormsModule, LoadingSpinner],
  templateUrl: './subscription.html',
  styleUrl: './subscription.scss',
})
export class Subscription implements OnInit {
  readonly status = signal<SubscriptionStatus | null>(null);
  readonly packages = signal<SubscriptionPackage[]>([]);
  readonly paymentInfo = signal<PaymentInfo | null>(null);
  readonly selectedPackage = signal<SubscriptionPackage | null>(null);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  paymentDate = '';
  notes = '';
  proofFile: File | null = null;

  constructor(private subscriptionService: SubscriptionService) {}

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

    this.subscriptionService.getPaymentInfo().subscribe({
      next: (res) => this.paymentInfo.set(res.data),
      error: () => this.paymentInfo.set(null),
    });
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
}
