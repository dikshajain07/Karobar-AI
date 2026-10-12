import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react';

/** Form-level success or error message with a subtle entrance. */
export function FormAlert({ message, tone = 'error' }: {message: string | null;tone?: 'error' | 'success';}) {
  return (
    <AnimatePresence initial={false}>
      {message &&
      <motion.div
        role={tone === 'error' ? 'alert' : 'status'}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        className={`flex gap-2 rounded-lg px-3 py-2.5 text-sm ${
        tone === 'error' ? 'bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-600/20' : 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/20'}`
        }>
        
          {tone === 'error' ? <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <CircleCheckIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
          <span>{message}</span>
        </motion.div>
      }
    </AnimatePresence>);

}