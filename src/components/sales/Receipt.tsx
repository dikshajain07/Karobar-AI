import React, { useMemo } from 'react';
import { Transaction } from '../../types/data';
import { useDemoData } from '../../contexts/DemoDataContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useT } from '../../contexts/LanguageContext';
import { formatPhone } from '../../utils/customers';
import { formatLongDate, inr } from '../../utils/format';

/** Printable bill. The `receipt-print` class is what printReceipt() prints. */
export function Receipt({ transaction: tx }: {transaction: Transaction;}) {
  const { products } = useDemoData();
  const { profile } = useProfile();
  const t = useT();
  const names = useMemo(() => new Map(products.map((p) => [p.id, p.name])), [products]);

  return (
    <article className="receipt-print mx-auto w-full max-w-sm rounded-xl border border-line bg-surface p-6 text-sm text-ink" aria-label={t('receipt.aria', { id: tx.id })}>
      <header className="text-center">
        <p className="text-base font-semibold">{profile.shopName}</p>
        {profile.address && <p className="mt-0.5 text-xs text-ink-muted">{profile.address}</p>}
        <p className="text-xs text-ink-muted">
          {profile.phone ? `${formatPhone(profile.phone)} · ` : ''}
          {t('receipt.billedWith')}
        </p>
      </header>

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-y border-dashed border-line py-3 text-xs">
        <dt className="text-ink-muted">{t('receipt.billNo')}</dt>
        <dd className="text-right font-medium tabular-nums">{tx.id}</dd>
        <dt className="text-ink-muted">{t('receipt.date')}</dt>
        <dd className="text-right tabular-nums">
          {formatLongDate(tx.date)}, {tx.time}
        </dd>
        <dt className="text-ink-muted">{t('col.customer')}</dt>
        <dd className="truncate text-right">{tx.customer}</dd>
        <dt className="text-ink-muted">{t('col.payment')}</dt>
        <dd className="text-right">{t(`payment.${tx.payment}`)}</dd>
      </dl>

      <table className="mt-3 w-full text-xs">
        <thead>
          <tr className="text-left text-ink-muted">
            <th scope="col" className="pb-1.5 font-medium">{t('common.item')}</th>
            <th scope="col" className="pb-1.5 text-right font-medium">{t('receipt.qty')}</th>
            <th scope="col" className="pb-1.5 text-right font-medium">{t('receipt.rate')}</th>
            <th scope="col" className="pb-1.5 text-right font-medium">{t('col.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {tx.lines.map((l) => {
            const rate = l.listPrice ?? l.unitPrice;
            return (
              <tr key={l.productId} className="align-top">
                <td className="py-1 pr-2">{names.get(l.productId) ?? t('common.item')}</td>
                <td className="py-1 text-right tabular-nums">{l.qty}</td>
                <td className="py-1 text-right tabular-nums">{inr(rate)}</td>
                <td className="py-1 text-right tabular-nums">{inr(rate * l.qty)}</td>
              </tr>);

          })}
        </tbody>
      </table>

      <dl className="mt-3 space-y-1 border-t border-dashed border-line pt-3 text-xs">
        <div className="flex justify-between">
          <dt className="text-ink-muted">{t('bill.subtotal')}</dt>
          <dd className="tabular-nums">{inr(tx.subtotal)}</dd>
        </div>
        {tx.discount > 0 &&
        <div className="flex justify-between">
            <dt className="text-ink-muted">{t('bill.discount')}</dt>
            <dd className="tabular-nums">−{inr(tx.discount)}</dd>
          </div>
        }
        <div className="flex items-baseline justify-between pt-1">
          <dt className="text-sm font-semibold">{t('receipt.totalPaid')}</dt>
          <dd className="text-base font-semibold tabular-nums">{inr(tx.total)}</dd>
        </div>
      </dl>

      <p className="mt-5 text-center text-xs text-ink-muted">{t('receipt.thanks')}</p>
    </article>);

}