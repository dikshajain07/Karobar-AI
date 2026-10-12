import React from 'react';
import { BanknoteIcon, CreditCardIcon, ShoppingCartIcon, SmartphoneIcon, Trash2Icon } from 'lucide-react';
import { PaymentMethod } from '../../types/data';
import { PosCart } from '../../hooks/usePosCart';
import { useT } from '../../contexts/LanguageContext';
import { inr } from '../../utils/format';
import { buttonClass } from '../../utils/ui';
import { SegmentedControl } from '../SegmentedControl';
import { CustomerPicker } from './CustomerPicker';
import { QtyStepper } from './QtyStepper';

const PAYMENTS: {id: PaymentMethod;icon: typeof BanknoteIcon;}[] = [
{ id: 'UPI', icon: SmartphoneIcon },
{ id: 'Cash', icon: BanknoteIcon },
{ id: 'Card', icon: CreditCardIcon }];


export function BillSummary({ cart, onComplete }: {cart: PosCart;onComplete: () => void;}) {
  const t = useT();
  return (
    <div className="flex flex-col bg-surface-2 lg:min-h-0">
      <div className="border-b border-line p-4">
        <CustomerPicker value={cart.customerId} onChange={cart.setCustomerId} />
      </div>

      <div className="p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-ink">
            {t('bill.items')} <span className="text-ink-muted">({cart.itemCount})</span>
          </p>
          {cart.lines.length > 0 &&
          <button type="button" onClick={() => cart.lines.forEach((l) => cart.remove(l.productId))} className="text-xs font-medium text-ink-muted hover:text-danger-700">
              {t('bill.clear')}
            </button>
          }
        </div>
        {cart.lines.length === 0 ?
        <div className="flex flex-col items-center rounded-lg border border-dashed border-line px-4 py-8 text-center">
            <ShoppingCartIcon className="h-5 w-5 text-ink-muted" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-ink">{t('bill.empty')}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{t('bill.emptyDesc')}</p>
          </div> :

        <ul className="divide-y divide-line">
            {cart.lines.map((l) =>
          <li key={l.productId} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{l.product.name}</p>
                    <p className="text-xs text-ink-muted">{t('bill.each', { price: inr(l.product.price), stock: l.product.stock })}</p>
                  </div>
                  <button
                type="button"
                onClick={() => cart.remove(l.productId)}
                aria-label={t('bill.remove', { name: l.product.name })}
                className="rounded-md p-1 text-ink-muted transition-colors duration-150 hover:bg-danger-50 hover:text-danger-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-start justify-between gap-2">
                  <QtyStepper value={l.qty} max={l.product.stock} label={l.product.name} onChange={(q) => cart.setQty(l.productId, q)} />
                  <p className="pt-1.5 text-sm font-semibold tabular-nums text-ink">{inr(l.lineTotal)}</p>
                </div>
                {l.overStock && <p className="mt-1 text-xs text-danger-700">{t('bill.overStock', { count: l.product.stock })}</p>}
              </li>
          )}
          </ul>
        }
      </div>

      {/* Sticky checkout area */}
      <div className="space-y-4 border-t border-line bg-surface p-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="bill-discount" className="text-sm font-medium text-ink">
              {t('bill.discount')}
            </label>
            <SegmentedControl
              label={t('bill.discountType')}
              value={cart.discountMode}
              onChange={cart.setDiscountMode}
              options={[
              { value: 'amount', label: t('bill.discountAmount') },
              { value: 'percent', label: t('bill.discountPercent') }]
              } />
            
          </div>
          <input
            id="bill-discount"
            inputMode="decimal"
            value={cart.discountInput}
            onChange={(e) => cart.setDiscountInput(e.target.value)}
            placeholder={cart.discountMode === 'amount' ? '0' : '0%'}
            aria-invalid={cart.discountError ? true : undefined}
            aria-describedby={cart.discountError ? 'bill-discount-error' : undefined}
            className={`mt-2 h-9 w-full rounded-lg border px-3 text-sm tabular-nums text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500 ${
            cart.discountError ? 'border-danger-600 bg-danger-50' : 'border-line bg-surface'}`
            } />
          
          {cart.discountError &&
          <p id="bill-discount-error" className="mt-1 text-xs text-danger-700">
              {cart.discountError}
            </p>
          }
        </div>

        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between text-ink-soft">
            <dt>{t('bill.subtotal')}</dt>
            <dd className="tabular-nums">{inr(cart.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-ink-soft">
            <dt>{t('bill.discount')}</dt>
            <dd className="tabular-nums">{cart.discount > 0 ? `−${inr(cart.discount)}` : inr(0)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-2">
            <dt className="font-semibold text-ink">{t('bill.total')}</dt>
            <dd className="text-2xl font-semibold tabular-nums tracking-tight text-ink">{inr(cart.total)}</dd>
          </div>
        </dl>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">{t('filter.paymentMethod')}</legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('filter.paymentMethod')}>
            {PAYMENTS.map(({ id, icon: Icon }) => {
              const active = cart.payment === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => cart.setPayment(id)}
                  className={`flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  active ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-line bg-surface text-ink-soft hover:bg-canvas'}`
                  }>
                  
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {t(`payment.${id}`)}
                </button>);

            })}
          </div>
        </fieldset>

        <div>
          <button type="button" onClick={onComplete} disabled={Boolean(cart.blockingError)} className={buttonClass('primary', 'lg', 'w-full whitespace-nowrap text-[15px] font-semibold')}>
            {t('bill.complete', { amount: inr(cart.total) })}
          </button>
          {cart.blockingError && cart.lines.length > 0 && <p className="mt-1.5 text-center text-xs text-danger-700">{cart.blockingError}</p>}
        </div>
      </div>
    </div>);

}