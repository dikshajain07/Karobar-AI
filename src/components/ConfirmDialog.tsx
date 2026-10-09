import React from 'react';
import { TriangleAlertIcon } from 'lucide-react';
import { Dialog } from './Dialog';
import { useT } from '../contexts/LanguageContext';
import { buttonClass } from '../utils/ui';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, tone = 'danger' }: ConfirmDialogProps) {
  const t = useT();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
      <>
          <button type="button" onClick={onClose} className={buttonClass('secondary')} data-autofocus>
            {t('common.cancel')}
          </button>
          <button type="button" onClick={onConfirm} className={buttonClass(tone)}>
            {confirmLabel}
          </button>
        </>
      }>
      
      <div className="flex gap-3 px-5 py-4">
        {tone === 'danger' &&
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-50 text-danger-700">
            <TriangleAlertIcon className="h-4 w-4" aria-hidden="true" />
          </span>
        }
        <div className="text-sm leading-relaxed text-ink-soft">{description}</div>
      </div>
    </Dialog>);

}