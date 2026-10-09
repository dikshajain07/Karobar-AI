import React, { useState } from 'react';
import { ChevronRightIcon, MenuIcon, PlusIcon } from 'lucide-react';
import { SectionId } from '../types/navigation';
import { PeriodDays } from '../types/data';
import { navGroups, navItems } from '../data/navigation';
import { useDemoData } from '../contexts/DemoDataContext';
import { useT } from '../contexts/LanguageContext';
import { dateForDaysAgo } from '../utils/transactions';
import { formatDate } from '../utils/format';
import { buttonClass } from '../utils/ui';
import { ThemeToggle } from './ThemeToggle';
import { LanguageMenu } from './LanguageMenu';
import { ProfileMenu } from './profile/ProfileMenu';
import { SegmentedControl } from './SegmentedControl';
import { ResetDemoDialog } from './ResetDemoDialog';

const PERIODS: PeriodDays[] = [7, 14, 30, 90];

interface TopBarProps {
  section: SectionId;
  onOpenMenu: () => void;
  onNewSale: () => void;
  onNavigate: (s: SectionId) => void;
}

export function TopBar({ section, onOpenMenu, onNewSale, onNavigate }: TopBarProps) {
  const { period, setPeriod } = useDemoData();
  const t = useT();
  const [resetOpen, setResetOpen] = useState(false);
  const meta = navItems.find((n) => n.id === section) ?? navItems[0];
  const groupKey = navGroups.find((g) => g.id === meta.group)?.labelKey ?? 'navGroup.Dashboard';
  const fmt = (d: Date) => formatDate(d, { day: 'numeric', month: 'short' });
  const rangeLabel = `${fmt(dateForDaysAgo(period - 1))} – ${fmt(dateForDaysAgo(0))}`;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={t('topbar.openNav')}
          className="rounded-md p-1.5 text-ink-soft hover:bg-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden">
          
          <MenuIcon className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <nav aria-label={t('topbar.breadcrumb')}>
            <ol className="flex items-center gap-1 text-xs text-ink-muted">
              <li>Karobar AI</li>
              <li aria-hidden="true">
                <ChevronRightIcon className="h-3 w-3" />
              </li>
              <li>{t(groupKey)}</li>
            </ol>
          </nav>
          <h1 className="truncate text-lg font-semibold leading-tight text-ink">{t(meta.labelKey)}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {meta.usesPeriod &&
          <div className="flex items-center gap-2">
              <span className="hidden text-xs text-ink-muted xl:inline">{rangeLabel}</span>
              <SegmentedControl
              label={t('topbar.period')}
              options={PERIODS.map((p) => ({ value: p, label: t('topbar.periodOption', { count: p }) }))}
              value={period}
              onChange={setPeriod} />
            
            </div>
          }
          <LanguageMenu />
          <ThemeToggle />
          <button type="button" onClick={onNewSale} className={buttonClass('primary', 'md', 'whitespace-nowrap font-semibold')}>
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            {t('topbar.newSale')}
          </button>
          <ProfileMenu onNavigate={onNavigate} onReset={() => setResetOpen(true)} />
        </div>
      </div>
      <ResetDemoDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </header>);

}
