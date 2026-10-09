import React, { useMemo } from 'react';
import { SectionId } from '../types/navigation';
import { useDemoData } from '../contexts/DemoDataContext';
import { useProfile } from '../contexts/ProfileContext';
import { useT } from '../contexts/LanguageContext';
import { dailySeries } from '../utils/analytics';
import { firstName, greetingFor } from '../utils/profile';
import { KpiStrip } from '../components/overview/KpiStrip';
import { RevenueTrendChart } from '../components/overview/RevenueTrendChart';
import { TopProducts } from '../components/overview/TopProducts';
import { RecentTransactions } from '../components/overview/RecentTransactions';
import { ActionCenter } from '../components/ActionCenter';

export function Overview({ onNavigate }: {onNavigate: (s: SectionId) => void;}) {
  const { insights, transactions, period } = useDemoData();
  const { profile } = useProfile();
  const t = useT();
  const series = useMemo(() => dailySeries(transactions, period), [transactions, period]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          {t('overview.greeting', { greeting: greetingFor(), name: firstName(profile.merchantName) })}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{t('overview.subtitle', { shop: profile.shopName, period })}</p>
      </div>

      <KpiStrip current={insights.current} previous={insights.previous} period={period} />

      <div className="grid gap-6 xl:grid-cols-3">
        <RevenueTrendChart series={series} className="xl:col-span-2" />
        <ActionCenter onNavigate={onNavigate} />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <TopProducts stats={insights.stats} className="xl:col-span-2" />
        <RecentTransactions className="xl:col-span-3" onViewAll={() => onNavigate('transactions')} />
      </div>
    </div>);

}