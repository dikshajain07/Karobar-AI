export type BusinessCategory = 'Grocery' | 'Clothing' | 'Electronics' | 'Pharmacy' | 'General Store' | 'Other';

export type CurrencyCode = 'INR';

/** The merchant using the app. Stored separately from customers and transactions. */
export interface MerchantProfile {
  merchantName: string;
  /** Optional custom initials (1–3 letters); falls back to the name */
  avatarInitials: string;
  /** Optional http(s) image URL */
  avatarUrl: string;
  shopName: string;
  category: BusinessCategory;
  /** 10-digit mobile, optional */
  phone: string;
  email: string;
  address: string;
  currency: CurrencyCode;
}