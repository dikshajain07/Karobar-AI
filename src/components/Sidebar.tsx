import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PanelLeftCloseIcon, PanelLeftOpenIcon, XIcon } from 'lucide-react';
import { SectionId } from '../types/navigation';
import { navGroups, navItems } from '../data/navigation';
import { useDemoData } from '../contexts/DemoDataContext';
import { useProfile } from '../contexts/ProfileContext';
import { useT } from '../contexts/LanguageContext';
import { businessCategoryKey } from '../utils/profile';
import { ProfileAvatar } from './profile/ProfileAvatar';

interface SidebarProps {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ active, onNavigate, mobileOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const { insights, completed } = useDemoData();
  const { profile } = useProfile();
  const t = useT();
  const openAlerts = insights.alerts.filter((a) => !completed[a.id]).length;

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, onClose]);

  /** Shared markup for the desktop sidebar (optionally compact) and the mobile drawer. */
  const renderContent = (compact: boolean, isMobile: boolean) =>
  <div className="flex h-full flex-col">
      <div className={`flex h-16 shrink-0 items-center ${compact ? 'justify-center' : 'justify-between px-5'}`}>
        {compact ?
      <p className="text-lg font-bold tracking-tight text-white" aria-label="Karobar AI">
            KA
          </p> :

      <p className="text-2xl font-bold tracking-tight text-white">
            Karobar <span className="text-brand-500">AI</span>
          </p>
      }
        {isMobile &&
      <button type="button" onClick={onClose} aria-label={t('sidebar.closeNav')} className="rounded-md p-1 text-navy-300 hover:text-white">
            <XIcon className="h-5 w-5" />
          </button>
      }
      </div>

      <nav aria-label={t('sidebar.mainNav')} className={`flex-1 px-3 pt-2 ${compact ? '' : 'overflow-y-auto'}`}>
        {navGroups.map((group) => {
        const items = navItems.filter((i) => i.group === group.id && !i.hidden);
        return (
          <div key={group.id} className="mb-4">
              {group.showLabel && (
            compact ?
            <div className="mx-2 mb-2 border-t border-white/10" aria-hidden="true" /> :

            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy-300/80">{t(group.labelKey)}</p>)
            }
              <ul className="space-y-0.5">
                {items.map((item) => {
                const isActive = item.id === active;
                const Icon = item.icon;
                const label = t(item.labelKey);
                const showBadge = item.id === 'overview' && openAlerts > 0;
                return (
                  <li key={item.id}>
                      <button
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={compact ? label : undefined}
                      className={`group relative flex w-full items-center rounded-lg py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      compact ? 'justify-center' : 'gap-3 px-3'} ${
                      isActive ? 'bg-white/10 text-white' : 'text-navy-200 hover:bg-white/5 hover:text-white'}`}>
                      
                        <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-brand-500' : 'text-navy-300 group-hover:text-white'}`} aria-hidden="true" />
                        {!compact && <span className="flex-1 truncate text-left">{label}</span>}
                        {showBadge && (
                      compact ?
                      <span className="absolute right-3 top-1.5 h-2 w-2 rounded-full bg-brand-500" aria-hidden="true" /> :

                      <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white" aria-label={t('sidebar.openActions', { count: openAlerts })}>
                              {openAlerts}
                            </span>)
                      }
                        {compact &&
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute left-full top-1/2 z-40 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-navy-950 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                        
                            {label}
                          </span>
                      }
                      </button>
                    </li>);

              })}
              </ul>
            </div>);

      })}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <button
        type="button"
        onClick={() => onNavigate('profile')}
        title={compact ? `${profile.shopName} — ${t('nav.profile')}` : undefined}
        aria-label={compact ? t('nav.profile') : undefined}
        className={`flex w-full items-center rounded-lg py-1.5 text-left transition-colors duration-150 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        compact ? 'justify-center' : 'gap-3 px-2'}`
        }>
        
          <ProfileAvatar profile={profile} size="sm" />
          {!compact &&
        <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-white">{profile.shopName}</span>
              <span className="block truncate text-xs text-navy-300">{t(businessCategoryKey(profile.category))}</span>
            </span>
        }
        </button>
        {!isMobile &&
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        aria-expanded={!collapsed}
        className={`mt-2 flex w-full items-center rounded-lg py-2 text-sm text-navy-300 transition-colors duration-150 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        compact ? 'justify-center' : 'gap-3 px-3'}`
        }>
        
            {compact ? <PanelLeftOpenIcon className="h-[18px] w-[18px]" aria-hidden="true" /> : <PanelLeftCloseIcon className="h-[18px] w-[18px]" aria-hidden="true" />}
            {!compact && t('sidebar.collapseShort')}
          </button>
      }
      </div>
    </div>;


  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden bg-sidebar transition-[width] duration-200 ease-out lg:block ${collapsed ? 'w-[72px]' : 'w-[248px]'}`}>
        
        {renderContent(collapsed, false)}
      </aside>
      <AnimatePresence>
        {mobileOpen &&
        <>
            <motion.div
            className="fixed inset-0 z-40 bg-navy-950/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true" />
          
            <motion.aside
            className="fixed inset-y-0 left-0 z-50 w-[264px] bg-sidebar lg:hidden"
            initial={{ x: -264 }}
            animate={{ x: 0 }}
            exit={{ x: -264 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}>
            
              {renderContent(false, true)}
            </motion.aside>
          </>
        }
      </AnimatePresence>
    </>);

}