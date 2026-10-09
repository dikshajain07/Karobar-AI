import { Language } from '../../types/i18n';
import { shellEn } from './en/shell';
import { overviewEn } from './en/overview';
import { salesEn } from './en/sales';
import { inventoryEn } from './en/inventory';
import { insightsEn } from './en/insights';
import { shellHi } from './hi/shell';
import { overviewHi } from './hi/overview';
import { salesHi } from './hi/sales';
import { inventoryHi } from './hi/inventory';
import { insightsHi } from './hi/insights';
import { shellHinglish } from './hinglish/shell';
import { overviewHinglish } from './hinglish/overview';
import { salesHinglish } from './hinglish/sales';
import { inventoryHinglish } from './hinglish/inventory';
import { insightsHinglish } from './hinglish/insights';

/** English is the source of truth: every key must exist in Hindi and Hinglish too (enforced by types). */
const en = { ...shellEn, ...overviewEn, ...salesEn, ...inventoryEn, ...insightsEn };

export type TKey = keyof typeof en;

const hi: Record<TKey, string> = { ...shellHi, ...overviewHi, ...salesHi, ...inventoryHi, ...insightsHi };
const hinglish: Record<TKey, string> = { ...shellHinglish, ...overviewHinglish, ...salesHinglish, ...inventoryHinglish, ...insightsHinglish };

export const dictionaries: Record<Language, Record<TKey, string>> = { en, hi, hinglish };
