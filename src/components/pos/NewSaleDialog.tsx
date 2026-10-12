import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2Icon, PlusIcon, PrinterIcon, ReceiptTextIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Product, Transaction } from '../../types/data';
import { useDemoData } from '../../contexts/DemoDataContext';
import { useT } from '../../contexts/LanguageContext';
import { usePosCart } from '../../hooks/usePosCart';
import { inr } from '../../utils/format';
import { printReceipt } from '../../utils/print';
import { buttonClass } from '../../utils/ui';
import { Dialog } from '../Dialog';
import { Receipt } from '../sales/Receipt';
import { ProductPicker } from './ProductPicker';
import { BillSummary } from './BillSummary';

interface NewSaleDialogProps {
  open: boolean;
  initialCustomerId?: string;
  onClose: () => void;
  onViewTransactions: () => void;
}

/** Billing / POS. The cart lives here, so closing by accident doesn't lose the bill. */
export function NewSaleDialog({ open, initialCustomerId, onClose, onViewTransactions }: NewSaleDialogProps) {
  const { products, addSale, nextInvoiceId, resetToken } = useDemoData();
  const t = useT();
  const cart = usePosCart(products);
  const [receipt, setReceipt] = useState<Transaction | null>(null);
  const cartRef = useRef(cart);
  cartRef.current = cart;

  useEffect(() => {
    if (open && initialCustomerId) cartRef.current.setCustomerId(initialCustomerId);
  }, [open, initialCustomerId]);

  // A demo reset invalidates any bill in progress.
  useEffect(() => {
    cartRef.current.reset();
    setReceipt(null);
  }, [resetToken]);

  const handleAdd = (p: Product) => {
    const result = cart.add(p.id);
    if (result === 'out') toast.error(t('sale.toastOut', { name: p.name }));
    if (result === 'max') toast.error(t('sale.toastMax', { stock: p.stock, name: p.name }), { description: t('sale.toastMaxDesc') });
  };

  const handleComplete = () => {
    if (cart.blockingError) {
      toast.error(cart.blockingError);
      return;
    }
    const result = addSale(cart.toDraft());
    if (!result.ok) {
      toast.error(t('sale.toastFailed'), { description: result.error });
      return;
    }
    setReceipt(result.transaction);
    cart.reset();
    toast.success(t('sale.toastDone', { amount: inr(result.transaction.total) }), {
      description: t('sale.toastDoneDesc', { id: result.transaction.id })
    });
  };

  const handleClose = () => {
    onClose();
    if (receipt) window.setTimeout(() => setReceipt(null), 200);
  };

  if (receipt) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        title={t('sale.completedTitle')}
        description={t('sale.completedDesc', { id: receipt.id, amount: inr(receipt.total), payment: t(`payment.${receipt.payment}`) })}
        size="md"
        footer={
        <>
            <button type="button" onClick={onViewTransactions} className={buttonClass('ghost')}>
              <ReceiptTextIcon className="h-4 w-4" aria-hidden="true" />
              {t('sale.viewTransactions')}
            </button>
            <button type="button" onClick={printReceipt} className={buttonClass('secondary')}>
              <PrinterIcon className="h-4 w-4" aria-hidden="true" />
              {t('receipt.print')}
            </button>
            <button type="button" onClick={() => setReceipt(null)} className={buttonClass('primary')} data-autofocus>
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              {t('sale.startNew')}
            </button>
          </>
        }>
        
        <div className="bg-canvas/60 p-5">
          <p className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-brand-700">
            <CheckCircle2Icon className="h-5 w-5" aria-hidden="true" />
            {t('sale.recorded')}
          </p>
          <Receipt transaction={receipt} />
        </div>
      </Dialog>);

  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={t('sale.title')}
      description={t('sale.desc', { id: nextInvoiceId })}
      size="xl"
      tall
      bodyClassName="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
      
      <div className="grid lg:h-full lg:grid-cols-[minmax(0,1fr)_400px]">
        <ProductPicker products={products} qtyInCart={cart.qtyInCart} onAdd={handleAdd} />
        <BillSummary cart={cart} onComplete={handleComplete} />
      </div>
    </Dialog>);

}