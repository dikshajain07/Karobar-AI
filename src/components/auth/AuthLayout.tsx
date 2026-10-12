import React from 'react';
import { motion } from 'framer-motion';
import { authHighlights } from '../../data/authHighlights';
import { ThemeToggle } from '../ThemeToggle';

interface AuthLayoutProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}

/** Split-screen shell for Login, Sign-Up and Forgot Password. */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-canvas text-ink">
      <aside className="hidden w-[44%] max-w-[560px] flex-col justify-between bg-sidebar p-10 text-white lg:flex xl:p-12">
        <p className="text-2xl font-bold tracking-tight">
          Karobar <span className="text-brand-500">AI</span>
        </p>
        <div>
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            Know why sales moved, what to restock, and what to do today.
          </h2>
          <ul className="mt-10 space-y-6">
            {authHighlights.map(({ icon: Icon, title: t, text }) =>
            <li key={t} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-[18px] w-[18px] text-brand-500" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium">{t}</p>
                  <p className="mt-0.5 text-sm text-navy-300">{text}</p>
                </div>
              </li>
            )}
          </ul>
        </div>
        <p className="text-xs text-navy-300">Prototype · sign-in is simulated and stored in this browser only</p>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <p className="text-xl font-bold tracking-tight lg:invisible">
            Karobar <span className="text-brand-600">AI</span>
          </p>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-start justify-center px-6 pb-12 pt-4 sm:items-center sm:px-10">
          <motion.div
            className="w-full max-w-[420px]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
            
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">{title}</h1>
            <div className="mt-1.5 text-sm text-ink-muted">{subtitle}</div>
            <div className="mt-8">{children}</div>
          </motion.div>
        </div>
      </main>
    </div>);

}