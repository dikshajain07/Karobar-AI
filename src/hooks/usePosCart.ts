import { useCallback, useMemo, useState } from 'react';
import { PaymentMethod, Product, SaleDraft } from '../types/data';
import { WALK_IN_ID } from '../data/customers';
import { inr } from '../utils/format';
import { translate } from '../utils/i18n';

export type DiscountMode = 'amount' | 'percent';
export type AddResult = 'added' | 'max' | 'out';

interface CartItem {
  productId: string;
  qty: number;
}

export interface CartLine extends CartItem {
  product: Product;
  lineTotal: number;
  overStock: boolean;
}

/** All billing logic: cart items, discount, totals and validation. */
export function usePosCart(products: Product[]) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState(WALK_IN_ID);
  const [discountMode, setDiscountMode] = useState<DiscountMode>('amount');
  const [discountInput, setDiscountInput] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('UPI');

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const lines: CartLine[] = items.
  filter((i) => byId.has(i.productId)).
  map((i) => {
    const product = byId.get(i.productId)!;
    return { ...i, product, lineTotal: i.qty * product.price, overStock: i.qty > product.stock };
  });

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);

  // Discount: validated inline, converted to rupees.
  let discount = 0;
  let discountError: string | null = null;
  const raw = discountInput.trim();
  if (raw !== '') {
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) discountError = translate('bill.errPositive');else
    if (discountMode === 'percent' && n > 100) discountError = translate('bill.errPercent');else
    if (discountMode === 'amount' && n > subtotal) discountError = translate('bill.errOverSubtotal', { amount: inr(subtotal) });else
    discount = discountMode === 'percent' ? Math.round(subtotal * n / 100) : Math.round(n);
  }
  const total = Math.max(0, subtotal - discount);

  const blockingError =
  lines.length === 0 ?
  translate('bill.errEmpty') :
  lines.some((l) => l.overStock) ?
  translate('bill.errOverStock') :
  discountError;

  const qtyInCart = useCallback((productId: string) => items.find((i) => i.productId === productId)?.qty ?? 0, [items]);

  const add = (productId: string): AddResult => {
    const product = byId.get(productId);
    if (!product || product.stock <= 0) return 'out';
    if (qtyInCart(productId) >= product.stock) return 'max';
    setItems((prev) =>
    prev.some((i) => i.productId === productId) ?
    prev.map((i) => i.productId === productId ? { ...i, qty: Math.min(product.stock, i.qty + 1) } : i) :
    [{ productId, qty: 1 }, ...prev]
    );
    return 'added';
  };

  const setQty = (productId: string, qty: number) =>
  setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, qty } : i));

  const remove = (productId: string) => setItems((prev) => prev.filter((i) => i.productId !== productId));

  const reset = () => {
    setItems([]);
    setCustomerId(WALK_IN_ID);
    setDiscountMode('amount');
    setDiscountInput('');
    setPayment('UPI');
  };

  const toDraft = (): SaleDraft => ({
    customerId,
    items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
    discount,
    payment
  });

  return {
    lines,
    subtotal,
    itemCount,
    discount,
    discountError,
    total,
    blockingError,
    customerId,
    setCustomerId,
    discountMode,
    setDiscountMode,
    discountInput,
    setDiscountInput,
    payment,
    setPayment,
    qtyInCart,
    add,
    setQty,
    remove,
    reset,
    toDraft
  };
}

export type PosCart = ReturnType<typeof usePosCart>;
