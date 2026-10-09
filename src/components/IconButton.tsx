import React from 'react';

interface IconButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

/** Square icon button with an accessible label and a hover/focus tooltip. */
export function IconButton({ label, onClick, children }: IconButtonProps) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft transition-[background-color,color,transform] duration-150 ease-out hover:bg-canvas hover:text-ink active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-30 mt-2 whitespace-nowrap rounded-md bg-contrast px-2 py-1 text-xs font-medium text-contrast-on opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        
        {label}
      </span>
    </span>);

}