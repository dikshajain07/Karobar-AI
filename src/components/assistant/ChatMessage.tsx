import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { AssistantReply } from '../../utils/assistant';
import { SectionId } from '../../types/navigation';

export interface ChatEntry {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  reply?: AssistantReply;
}

export function ChatMessage({ entry, onNavigate }: {entry: ChatEntry;onNavigate: (s: SectionId) => void;}) {
  if (entry.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[80%] rounded-2xl rounded-br-md bg-contrast px-4 py-2.5 text-sm text-contrast-on">{entry.text}</p>
      </div>);

  }

  const reply = entry.reply;
  if (!reply) return null;

  return (
    <div className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white" aria-hidden="true">
        K
      </span>
      <div className="min-w-0 max-w-[85%] rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3">
        <p className="text-sm leading-relaxed text-ink">{reply.text}</p>
        {reply.bullets && reply.bullets.length > 0 &&
        <ul className="mt-2 space-y-1.5">
            {reply.bullets.map((b) =>
          <li key={b} className="flex gap-2 text-sm text-ink-soft">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
                {b}
              </li>
          )}
          </ul>
        }
        {reply.footnote && <p className="mt-2.5 text-xs text-ink-muted">{reply.footnote}</p>}
        {reply.link &&
        <button
          type="button"
          onClick={() => onNavigate(reply.link!.section)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-600">
          
            {reply.link.label}
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        }
      </div>
    </div>);

}