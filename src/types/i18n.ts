export type Language = 'en' | 'hi' | 'hinglish';

/** Values that can be inserted into a message, e.g. t('kpi.ordersHint', { count: 12 }) */
export type TVars = Record<string, string | number>;