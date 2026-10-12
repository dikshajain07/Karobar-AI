import React from 'react';

interface PanelProps {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** White card used to group a dashboard section. */
export function Panel({ title, description, action, children, className = '', bodyClassName = 'p-5' }: PanelProps) {
  return (
    <section className={`min-w-0 rounded-xl border border-line bg-surface ${className}`}>
      {title &&
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      }
      <div className={bodyClassName}>{children}</div>
    </section>);

}