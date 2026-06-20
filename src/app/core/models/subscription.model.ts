export interface SubscriptionPackage {
  id: number;
  name: string;
  duration_months: number;
  price: number;
  price_per_month: number;
  discount_percent: number | null;
  is_popular: boolean;
  is_best_value: boolean;
  features: string[];
}

export interface SubscriptionStatus {
  has_active_subscription: boolean;
  plan_name: string | null;
  expires_at: string | null;
  days_remaining: number | null;
}

export interface PaymentInfo {
  bank_name: string;
  account_number: string;
  phone: string;
  instructions: string;
}

export interface PaymentSubmitPayload {
  package_id: number;
  transaction_image: File;
  paid_at: string;
  notes?: string;
}

export interface Transaction {
  id: number;
  package_name: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  payment_date: string;
  created_at: string;
}
