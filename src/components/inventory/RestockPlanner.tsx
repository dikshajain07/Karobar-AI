import React, { useMemo, useState } from 'react';
import { ClipboardCopyIcon, DownloadIcon, PackageCheckIcon, RotateCcwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useDemoData } from '../../contexts/DemoDataContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useT } from '../../contexts/LanguageContext';
import { InventoryRow, STATUS_ORDER, URGENT_STATUSES, stockStatusKey } from '../../utils/inventory';
import { formatDaysLeft, inr } from '../../utils/format';
import { Panel } from '../Panel';
import { IntegerInput } from '../IntegerInput';
import { StatusPill, stockTone } from '../StatusPill';
import { EmptyState } from '../EmptyState';

export function RestockPlanner({ rows }: {rows: InventoryRow[];}) {
  const { settings, updateSettings, updateProduct } = useDemoData();
  const { profile } = useProfile();
  const t = useT();
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const candidates = useMemo(
    () => rows.filter((r) => r.recommendedQty > 0).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
    [rows]
  );

  // Urgent items are ticked by default; others can be added manually.
  const isIncluded = (r: InventoryRow) => included[r.product.id] ?? URGENT_STATUSES.includes(r.status);
  const qtyFor = (r: InventoryRow) => overrides[r.product.id] ?? r.recommendedQty;

  const chosen = candidates.filter(isIncluded);
  const totalUnits = chosen.reduce((s, r) => s + qtyFor(r), 0);
  const totalCost = chosen.reduce((s, r) => s + qtyFor(r) * r.product.cost, 0);

  const listText = () =>
  chosen.
  map((r) => t('restock.listLine', { name: r.product.name, qty: qtyFor(r), supplier: r.product.supplier, amount: inr(qtyFor(r) * r.product.cost) })).
  join('\n');

  const handleCopy = () => {
    if (!navigator.clipboard) {
      toast.error(t('restock.copyUnavailable'));
      return;
    }
    navigator.clipboard.
    writeText(`${t('restock.listTitle', { shop: profile.shopName })}\n${listText()}\n${t('restock.listTotal', { amount: inr(totalCost) })}`).
    then(() => toast.success(t('restock.copied'))).
    catch(() => toast.error(t('restock.copyBlocked')));
  };

  const handleDownload = () => {
    // CSV headers stay in English so spreadsheet tools and suppliers read them consistently.
    const header = 'Product,Supplier,Order quantity,Unit cost (INR),Line cost (INR)';
    const lines = chosen.map((r) =>
    [`"${r.product.name}"`, `"${r.product.supplier}"`, qtyFor(r), r.product.cost, qtyFor(r) * r.product.cost].join(',')
    );
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'karobar-purchase-list.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('restock.downloaded'), { description: t('restock.downloadedDesc', { count: chosen.length, amount: inr(totalCost) }) });
  };

  return (
    <Panel title={t('restock.title')} description={t('restock.formula')} bodyClassName="pb-0">
      <div className="flex flex-wrap items-end gap-6 border-b border-line px-5 pb-4 pt-4">
        <div>
          <p className="mb-1 text-xs font-medium text-ink-soft">{t('restock.coverage')}</p>
          <IntegerInput label={t('restock.coverage')} value={settings.targetCoverageDays} min={1} max={90} onCommit={(v) => updateSettings({ targetCoverageDays: v })} />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-ink-soft">{t('restock.buffer')}</p>
          <IntegerInput label={t('restock.buffer')} value={settings.safetyBufferPct} min={0} max={100} onCommit={(v) => updateSettings({ safetyBufferPct: v })} />
        </div>
        <p className="max-w-md text-xs text-ink-muted">{t('restock.demandNote')}</p>
      </div>

      {candidates.length === 0 ?
      <EmptyState icon={PackageCheckIcon} title={t('restock.empty')} description={t('restock.emptyDesc')} /> :

      <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-ink-muted">
                <th scope="col" className="w-10 py-2 pl-5"><span className="sr-only">{t('restock.include')}</span></th>
                <th scope="col" className="px-3 py-2 font-medium">{t('inv.colProduct')}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{t('inv.colAvg')}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{t('inv.colInStock')}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{t('inv.colLead')}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{t('restock.suggested')}</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">{t('restock.orderQty')}</th>
                <th scope="col" className="px-5 py-2 text-right font-medium">{t('restock.cost')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {candidates.map((r) => {
              const on = isIncluded(r);
              const edited = overrides[r.product.id] !== undefined;
              return (
                <tr key={r.product.id} className={`align-top ${on ? '' : 'text-ink-muted'}`}>
                    <td className="py-3 pl-5">
                      <input
                      type="checkbox"
                      checked={on}
                      onChange={(e) => setIncluded((s) => ({ ...s, [r.product.id]: e.target.checked }))}
                      aria-label={t('restock.includeItem', { name: r.product.name })}
                      className="h-4 w-4 rounded border-line accent-brand-600" />
                    
                    </td>
                    <td className="px-3 py-3">
                      <p className={`font-medium ${on ? 'text-ink' : 'text-ink-muted'}`}>{r.product.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <StatusPill tone={stockTone(r.status)}>{t(stockStatusKey(r.status))}</StatusPill>
                        <span className="text-xs text-ink-muted">
                          {r.product.stock <= 0 ? t('inv.emptyShelf') : t('inv.left', { days: formatDaysLeft(r.daysOfStock) })}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.avgDailyDemand.toFixed(1)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.product.stock}</td>
                    <td className="px-3 py-2.5 text-right">
                      <IntegerInput label={t('restock.leadFor', { name: r.product.name })} value={r.product.leadTimeDays} min={1} max={30} className="w-16" onCommit={(v) => updateProduct(r.product.id, { leadTimeDays: v })} />
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.recommendedQty}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-start justify-end gap-1">
                        {edited &&
                      <button
                        type="button"
                        onClick={() =>
                        setOverrides((s) => {
                          const next = { ...s };
                          delete next[r.product.id];
                          return next;
                        })
                        }
                        aria-label={t('restock.resetQty', { name: r.product.name })}
                        className="mt-1 rounded p-0.5 text-ink-muted hover:text-ink">
                        
                            <RotateCcwIcon className="h-3.5 w-3.5" />
                          </button>
                      }
                        <IntegerInput label={t('restock.qtyFor', { name: r.product.name })} value={qtyFor(r)} min={0} max={9999} onCommit={(v) => setOverrides((s) => ({ ...s, [r.product.id]: v }))} />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">{inr(qtyFor(r) * r.product.cost)}</td>
                  </tr>);

            })}
            </tbody>
          </table>
        </div>
      }

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
        <p className="text-sm text-ink-soft">{t('restock.summary', { items: chosen.length, units: totalUnits, amount: inr(totalCost) })}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={chosen.length === 0}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors duration-150 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50">
            
            <ClipboardCopyIcon className="h-4 w-4" aria-hidden="true" />
            {t('restock.copy')}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={chosen.length === 0}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">
            
            <DownloadIcon className="h-4 w-4" aria-hidden="true" />
            {t('restock.download')}
          </button>
        </div>
      </div>
    </Panel>);

}