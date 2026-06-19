import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/app.model';
import {
  PaymentInfo,
  SubscriptionPackage,
  SubscriptionStatus,
  Transaction,
} from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // /subscription/packages renvoie un tableau brut sous data (vérifié par curl) ;
  // /subscription/transactions reste paginé Laravel imbriqué comme /apps.
  getPackages(): Observable<ApiResponse<SubscriptionPackage[]>> {
    return this.http.get<ApiResponse<SubscriptionPackage[]>>(
      `${this.api}/subscription/packages`
    );
  }

  getStatus(): Observable<ApiResponse<SubscriptionStatus>> {
    return this.http.get<ApiResponse<SubscriptionStatus>>(`${this.api}/subscription/status`);
  }

  getPaymentInfo(): Observable<ApiResponse<PaymentInfo>> {
    return this.http.get<ApiResponse<PaymentInfo>>(`${this.api}/subscription/payment-info`);
  }

  submitPayment(packageId: number, proofFile: File, paymentDate: string, notes?: string) {
    const formData = new FormData();
    formData.append('package_id', String(packageId));
    formData.append('proof_file', proofFile);
    formData.append('payment_date', paymentDate);
    if (notes) formData.append('notes', notes);
    return this.http.post<ApiResponse<Transaction>>(`${this.api}/subscription/payment`, formData);
  }

  getTransactions(): Observable<PaginatedResponse<Transaction>> {
    return this.http.get<PaginatedResponse<Transaction>>(`${this.api}/subscription/transactions`);
  }

  cancelTransaction(id: number): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.api}/subscription/transactions/${id}/cancel`,
      {}
    );
  }
}
