import React, { useEffect, useRef, useState } from 'react';
import { SendIcon } from 'lucide-react';
import { SectionId } from '../types/navigation';
import { useDemoData } from '../contexts/DemoDataContext';
import { useProfile } from '../contexts/ProfileContext';
import { firstName } from '../utils/profile';
import { answerQuestion, AssistantContext } from '../utils/assistant';
import { assistantSuggestions } from '../data/assistantSuggestions';
import { formatNumber, inr } from '../utils/format';
import { Panel } from '../components/Panel';
import { ChatEntry, ChatMessage } from '../components/assistant/ChatMessage';

const MAX_LENGTH = 200;

export function BusinessAssistant({ onNavigate }: {onNavigate: (s: SectionId) => void;}) {
  const { insights, period, settings, completed } = useDemoData();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<ChatEntry[]>(() => [
  {
    id: 'welcome',
    role: 'assistant',
    reply: {
      intent: 'greeting',
      text: `Namaste ${firstName(profile.merchantName)}! I answer questions using ${profile.shopName}'s demo sales and stock data. Pick a suggestion below or type your own question.`
    }
  }]
  );
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>();

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const ask = (raw: string) => {
    const question = raw.trim();
    if (!question) {
      setError('Type a question or pick a suggestion.');
      return;
    }
    if (question.length > MAX_LENGTH) {
      setError(`Please keep questions under ${MAX_LENGTH} characters.`);
      return;
    }
    if (thinking) return;
    setError(null);
    setInput('');
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', text: question }]);
    setThinking(true);

    // Answers are computed by rule-based logic from the same data as the dashboard.
    const ctx: AssistantContext = {
      period,
      settings,
      merchantName: profile.merchantName,
      shopName: profile.shopName,
      kpis: insights.current,
      prevKpis: insights.previous,
      stats: insights.stats,
      inventory: insights.inventory,
      rootCause: insights.rootCause,
      openAlerts: insights.alerts.filter((a) => !completed[a.id])
    };
    timerRef.current = window.setTimeout(() => {
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', reply: answerQuestion(question, ctx) }]);
      setThinking(false);
    }, 400);
  };

  const openActions = insights.alerts.filter((a) => !completed[a.id]).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="flex h-[calc(100vh-170px)] min-h-[520px] flex-col overflow-hidden rounded-xl border border-line bg-surface" aria-label="Chat with Karobar AI">
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Karobar AI Assistant</h2>
            <p className="text-xs text-ink-muted">Rule-based demo · no external AI service is called</p>
          </div>
          <button
            type="button"
            onClick={() => setMessages((m) => m.slice(0, 1))}
            disabled={messages.length <= 1 || thinking}
            className="rounded-md px-2 py-1 text-xs font-medium text-ink-soft hover:bg-canvas disabled:opacity-40">
            
            Clear chat
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-canvas/50 px-5 py-5" aria-live="polite">
          {messages.map((m) =>
          <ChatMessage key={m.id} entry={m} onNavigate={onNavigate} />
          )}
          {thinking &&
          <div className="flex items-center gap-3 text-sm text-ink-muted">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white" aria-hidden="true">K</span>
              Checking your data…
            </div>
          }
        </div>

        <div className="border-t border-line px-5 pb-4 pt-3">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {assistantSuggestions.map((s) =>
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              disabled={thinking}
              className="whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft transition-colors duration-150 hover:border-brand-600 hover:text-brand-700 disabled:opacity-50">
              
                {s}
              </button>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex gap-2">
            
            <label htmlFor="assistant-input" className="sr-only">Ask a question</label>
            <input
              id="assistant-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(null);
              }}
              maxLength={MAX_LENGTH + 20}
              placeholder="Ask about sales, profit, stock or priorities…"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'assistant-error' : undefined}
              className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500" />
            
            <button
              type="submit"
              disabled={thinking}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-700 disabled:opacity-60">
              
              <SendIcon className="h-4 w-4" aria-hidden="true" />
              Ask
            </button>
          </form>
          {error &&
          <p id="assistant-error" role="alert" className="mt-1.5 text-xs text-danger-700">
              {error}
            </p>
          }
        </div>
      </section>

      <aside className="space-y-6">
        <Panel title="Answers are based on">
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Period</dt>
              <dd className="font-medium text-ink">Last {period} days</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Orders analysed</dt>
              <dd className="font-medium tabular-nums text-ink">{formatNumber(insights.current.orders)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Revenue</dt>
              <dd className="font-medium tabular-nums text-ink">{inr(insights.current.revenue)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Products tracked</dt>
              <dd className="font-medium tabular-nums text-ink">{insights.stats.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Open actions</dt>
              <dd className="font-medium tabular-nums text-ink">{openActions}</dd>
            </div>
          </dl>
        </Panel>
        <Panel title="What I can answer">
          <ul className="space-y-1.5 text-sm text-ink-soft">
            <li>Why sales went up or down</li>
            <li>Most profitable products and margins</li>
            <li>What to restock and how much</li>
            <li>Slow-moving stock and cash tied up</li>
            <li>Best sellers and overall performance</li>
            <li>Today's top priorities</li>
          </ul>
          <p className="mt-4 text-xs text-ink-muted">
            Questions are matched to these topics with keyword rules. Anything else gets an honest "I can't answer that yet".
          </p>
        </Panel>
      </aside>
    </div>);

}