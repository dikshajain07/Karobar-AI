export type Category =
'Staples' |
'Edible Oil' |
'Dairy' |
'Snacks' |
'Beverages' |
'Household' |
'Personal Care';

export interface Product {
  id: string;
  name: string;
  category: Category;
  /** Current selling price in INR */
  price: number;
  /** Current purchase cost in INR */
  cost: number;
  /** Units currently on the shelf (decreases with every sale) */
  stock: number;
  /** Days the supplier takes to deliver (editable in the demo) */
  leadTimeDays: number;
  supplier: string;
  /** Used only to generate demo transactions */
  baseDailyDemand: number;
}

export interface Customer {
  id: string;
  name: string;
  /** 10-digit Indian mobile number, without +91 */
  phone?: string;
  /** yyyy-mm-dd, only for customers added in the app */
  createdAt?: string;
}

export interface OrderLine {
  productId: string;
  qty: number;
  /** Net price per unit after any bill discount — used by all analytics */
  unitPrice: number;
  unitCost: number;
  /** Shelf price per unit before discount (POS sales only) */
  listPrice?: number;
}

export type PaymentMethod = 'UPI' | 'Cash' | 'Card';
export type SaleSource = 'demo' | 'pos';

export interface Transaction {
  id: string;
  /** yyyy-mm-dd */
  date: string;
  /** 0 = today */
  daysAgo: number;
  /** HH:mm */
  time: string;
  customerId: string;
  customer: string;
  payment: PaymentMethod;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  total: number;
  source: SaleSource;
}

export interface SaleDraft {
  customerId: string;
  items: {productId: string;qty: number;}[];
  /** Discount in rupees */
  discount: number;
  payment: PaymentMethod;
}

export type PeriodDays = 7 | 14 | 30 | 90;

/** Business (inventory) rules. Merchant/shop details live in the separate MerchantProfile. */
export interface ShopSettings {
  targetCoverageDays: number;
  safetyBufferPct: number;
  slowMovingDays: number;
}