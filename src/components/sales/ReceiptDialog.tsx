import React, { useRef } from 'react';
import { PrinterIcon } from 'lucide-react';
import { Transaction } from '../../types/data';
import { useT } from '../../contexts/LanguageContext';
import { Dialog } from '../Dialog';
import { Receipt } from './Receipt';
import { printReceipt } from '../../utils/print';
import { buttonClass } from '../../utils/ui';

/** Bill details with print, used by the Transactions and Customers pages. */
export function ReceiptDialog({ transaction, onClose }: {transaction: Transaction | null;onClose: () => void;}) {
  const t = useT();
  // Keep showing the last bill while the dialog animates closed.
  const last = useRef<Transaction | null>(transaction);
  if (transaction) last.current = transaction;
  const shown = last.current;

  return (
    <Dialog
      open={Boolean(transaction)}
      onClose={onClose}
      title={t('receipt.detailsTitle')}
      description={shown ? `${shown.id} · ${shown.source === 'pos' ? t('source.pos') : t('source.demo')}` : undefined}
      size="md"
      footer={
      <>
          <button type="button" onClick={onClose} className={buttonClass('secondary')}>
            {t('common.closeDialog')}
          </button>
          <button type="button" onClick={printReceipt} className={buttonClass('primary')} data-autofocus>
            <PrinterIcon className="h-4 w-4" aria-hidden="true" />
            {t('receipt.print')}
          </button>
        </>
      }>
      
      <div className="bg-canvas/60 p-5">{shown && <Receipt transaction={shown} />}</div>
    </Dialog>);

}