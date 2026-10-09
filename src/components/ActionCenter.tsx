import React, { useState } from 'react';
import { ArrowRightIcon, CheckIcon, CheckCircle2Icon, Undo2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { SectionId } from '../types/navigation';
import { useDemoData } from '../contexts/DemoDataContext';
import { useT } from '../contexts/LanguageContext';
import { formatTime } from '../utils/format';
import { Panel } from './Panel';
import { SegmentedControl } from './SegmentedControl';
import { StatusPill, severityTone } from './StatusPill';
import { EmptyState } from './EmptyState';

type Filter = 'open' | 'done' | 'all';

export function ActionCenter({ onNavigate, className = '' }: {onNavigate: (s: SectionId) => void;className?: string;}) {
  const { insights, completed, toggleComplete } = useDemoData();
  const t = useT();
  const [filter, setFilter] = useState<Filter>('open');
  const alerts = insights.alerts;
  const doneCount = alerts.filter((a) => completed[a.id]).length;
  const visible = alerts.filter((a) =>
  filter === 'all' ? true : filter === 'open' ? !completed[a.id] : Boolean(completed[a.id])
  );

  const handleToggle = (id: string, title: string) => {
    const wasDone = Boolean(completed[id]);
    toggleComplete(id);
    toast(wasDone ? t('actions.toastReopened') : t('actions.toastDone'), { description: title });
  };

  return (
    <Panel
      title={t('actions.title')}
      description={t('actions.desc')}
      className={`flex flex-col ${className}`}
      bodyClassName="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-4"
      action={
      <SegmentedControl
        label={t('actions.filter')}
        value={filter}
        onChange={setFilter}
        options={[
        { value: 'open', label: t('actions.open') },
        { value: 'done', label: t('common.done') },
        { value: 'all', label: t('common.all') }]
        } />

      }>
      
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas" aria-hidden="true">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${alerts.length ? doneCount / alerts.length * 100 : 0}%` }} />
        </div>
        <p className="whitespace-nowrap text-xs text-ink-muted">{t('actions.progress', { done: doneCount, total: alerts.length })}</p>
      </div>

      {visible.length === 0 ?
      <EmptyState
        icon={CheckCircle2Icon}
        title={filter === 'done' ? t('actions.emptyDone') : t('actions.emptyOpen')}
        description={filter === 'done' ? t('actions.emptyDoneDesc') : t('actions.emptyOpenDesc')} /> :


      <ul className="mt-2 divide-y divide-line overflow-y-auto xl:max-h-[440px]">
          {visible.map((alert) => {
          const doneAt = completed[alert.id];
          return (
            <li key={alert.id} className="py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm font-medium ${doneAt ? 'text-ink-muted line-through' : 'text-ink'}`}>{alert.title}</p>
                  {doneAt ?
                <StatusPill tone="success">{t('common.done')}</StatusPill> :

                <StatusPill tone={severityTone(alert.severity)}>{t(`severity.${alert.severity}`)}</StatusPill>
                }
                </div>
                {!doneAt && <p className="mt-1 text-sm text-ink-muted">{alert.detail}</p>}
                <p className="mt-1 text-sm text-ink-soft">
                  <span className="font-medium text-ink">{t('actions.do')} </span>
                  {alert.recommendation}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <button
                  type="button"
                  onClick={() => handleToggle(alert.id, alert.title)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
                  doneAt ? 'border border-line text-ink-soft hover:bg-canvas' : 'bg-contrast text-contrast-on hover:bg-contrast/90'}`
                  }>
                  
                    {doneAt ? <Undo2Icon className="h-3.5 w-3.5" aria-hidden="true" /> : <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                    {doneAt ? t('actions.undo') : t('actions.markDone')}
                  </button>
                  <button
                  type="button"
                  onClick={() => onNavigate(alert.section)}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50">
                  
                    {t('actions.viewDetails')}
                    <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  {doneAt && <span className="text-xs text-ink-muted">{t('actions.completedAt', { time: formatTime(new Date(doneAt)) })}</span>}
                </div>
              </li>);

        })}
        </ul>
      }
    </Panel>);

}