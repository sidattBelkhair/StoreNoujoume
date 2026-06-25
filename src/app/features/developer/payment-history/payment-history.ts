import { Component, OnInit, signal } from '@angular/core';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { TranslationService } from '../../../core/services/translation.service';
import { Transaction } from '../../../core/models/subscription.model';
import { unwrapPage } from '../../../core/utils/pagination.util';
import { LoadingSpinner } from '../../../shared/loading-spinner/loading-spinner';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-payment-history',
  imports: [LoadingSpinner, EmptyState, TranslatePipe],
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.scss',
})
export class PaymentHistory implements OnInit {
  readonly transactions = signal<Transaction[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly cancellingId = signal<number | null>(null);

  constructor(
    private subscriptionService: SubscriptionService,
    private ts: TranslationService
  ) {}

  ngOnInit(): void { this.fetch(); }

  private fetch(): void {
    this.loading.set(true);
    this.subscriptionService.getTransactions().subscribe({
      next: (res) => { this.transactions.set(unwrapPage(res.data).items); this.loading.set(false); },
      error: () => { this.error.set(this.ts.t('paymentHistory.error')); this.loading.set(false); },
    });
  }

  cancel(transaction: Transaction): void {
    if (!window.confirm(this.ts.t('paymentHistory.confirmCancel'))) return;
    this.cancellingId.set(transaction.id);
    this.subscriptionService.cancelTransaction(transaction.id).subscribe({
      next: () => { this.cancellingId.set(null); this.fetch(); },
      error: () => { this.cancellingId.set(null); window.alert(this.ts.t('paymentHistory.cancelFailed')); },
    });
  }

  statusLabel(status: Transaction['status']): string {
    const keys: Record<Transaction['status'], string> = {
      pending: 'paymentHistory.statusPending',
      approved: 'paymentHistory.statusApproved',
      rejected: 'paymentHistory.statusRejected',
      cancelled: 'paymentHistory.statusCancelled',
    };
    return this.ts.t(keys[status]);
  }
}
