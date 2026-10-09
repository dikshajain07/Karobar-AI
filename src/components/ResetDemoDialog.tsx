import React from 'react';
import { toast } from 'sonner';
import { useDemoData } from '../contexts/DemoDataContext';
import { useT } from '../contexts/LanguageContext';
import { ConfirmDialog } from './ConfirmDialog';

export function ResetDemoDialog({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { resetDemo, salesCount } = useDemoData();
  const t = useT();
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={t('reset.title')}
      confirmLabel={t('reset.confirm')}
      description={
      <>
          {t('reset.desc1')} <span className="font-medium text-ink">{t('reset.sales', { count: salesCount })}</span>
          {t('reset.desc2')}
        </>
      }
      onConfirm={() => {
        resetDemo();
        onClose();
        toast.success(t('reset.toast'), { description: t('reset.toastDesc') });
      }} />);


}