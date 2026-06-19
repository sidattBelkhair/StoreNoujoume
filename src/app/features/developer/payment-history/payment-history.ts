import { Component, OnInit, signal } from '@angular/core';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { Transaction } from '../../../core/models/subscription.model';
import { unwrapPage } from '../../../core/utils/pagination.util';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';
import { EmptyState } from '../../../shared/empty-state/empty-state';

@Component({
  selector: 'app-payment-history',
  imports: [LoadingSpinner, EmptyState],
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.scss',
})
export class PaymentHistory implements OnInit {
  readonly transactions = signal<Transaction[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly cancellingId = signal<number | null>(null);

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit(): void {
    this.fetch();
  }

  private fetch(): void {
    this.loading.set(true);
    this.subscriptionService.getTransactions().subscribe({
      next: (res) => {
        this.transactions.set(unwrapPage(res.data).items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Impossible de charger l'historique des paiements.");
        this.loading.set(false);
      },
    });
  }

  cancel(transaction: Transaction): void {
    const confirmed = window.confirm('Annuler cette transaction ?');
    if (!confirmed) return;

    this.cancellingId.set(transaction.id);
    this.subscriptionService.cancelTransaction(transaction.id).subscribe({
      next: () => {
        this.cancellingId.set(null);
        this.fetch();
      },
      error: () => {
        this.cancellingId.set(null);
        window.alert("L'annulation a échoué.");
      },
    });
  }

  statusLabel(status: Transaction['status']): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'cancelled': return 'Annulé';
    }
  }
}
