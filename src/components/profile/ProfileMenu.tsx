import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, LogOutIcon, RotateCcwIcon, SlidersHorizontalIcon, UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useT } from '../../contexts/LanguageContext';
import { SectionId } from '../../types/navigation';
import { useProfile } from '../../contexts/ProfileContext';
import { ProfileAvatar } from './ProfileAvatar';

interface ProfileMenuProps {
  onNavigate: (s: SectionId) => void;
  onReset: () => void;
}

/** Avatar button in the top bar with My Profile / Business Settings / Reset Demo Data. */
export function ProfileMenu({ onNavigate, onReset }: ProfileMenuProps) {
  const { profile } = useProfile();
  const { user, logOut } = useAuth();
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
      const index = items.indexOf(document.activeElement as HTMLButtonElement);
      const next = e.key === 'ArrowDown' ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
      items[next]?.focus();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    const frame = requestAnimationFrame(() => menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (action: () => void) => {
    setOpen(false);
    action();
  };

  const item =
  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-150 focus:outline-none';

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('menu.accountFor', { name: profile.merchantName })}
        className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface py-0.5 pl-0.5 pr-2 transition-colors duration-150 hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        
        <ProfileAvatar profile={profile} size="sm" />
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-ink lg:inline">{profile.merchantName.split(' ')[0]}</span>
        <ChevronDownIcon className={`h-4 w-4 text-ink-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          ref={menuRef}
          role="menu"
          aria-label={t('menu.account')}
          initial={{ opacity: 0, scale: 0.97, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: 'top right' }}
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-line bg-surface p-1.5 shadow-xl">
          
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <ProfileAvatar profile={profile} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{profile.merchantName}</p>
                <p className="truncate text-xs text-ink-muted">{profile.shopName}</p>
                {user && <p className="truncate text-xs text-ink-muted">{user.email}</p>}
              </div>
            </div>
            <div className="my-1 border-t border-line" />
            <button type="button" role="menuitem" onClick={() => choose(() => onNavigate('profile'))} className={`${item} text-ink-soft hover:bg-canvas hover:text-ink focus:bg-canvas focus:text-ink`}>
              <UserIcon className="h-4 w-4" aria-hidden="true" />
              {t('menu.myProfile')}
            </button>
            <button type="button" role="menuitem" onClick={() => choose(() => onNavigate('settings'))} className={`${item} text-ink-soft hover:bg-canvas hover:text-ink focus:bg-canvas focus:text-ink`}>
              <SlidersHorizontalIcon className="h-4 w-4" aria-hidden="true" />
              {t('menu.settings')}
            </button>
            <div className="my-1 border-t border-line" />
            <button type="button" role="menuitem" onClick={() => choose(onReset)} className={`${item} text-ink-soft hover:bg-canvas hover:text-ink focus:bg-canvas focus:text-ink`}>
              <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
              {t('menu.reset')}
            </button>
            <div className="my-1 border-t border-line" />
            <button
            type="button"
            role="menuitem"
            onClick={() =>
            choose(() => {
              logOut();
              toast.success(t('toast.loggedOut'), { description: t('toast.loggedOutDesc') });
            })
            }
            className={`${item} text-danger-700 hover:bg-danger-50 focus:bg-danger-50`}>
            
              <LogOutIcon className="h-4 w-4" aria-hidden="true" />
              {t('menu.logout')}
            </button>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}