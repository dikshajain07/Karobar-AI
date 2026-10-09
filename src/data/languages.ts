import { Language } from '../types/i18n';

/** Language names are always shown in their own script so people can recognise them. */
export const languages: {id: Language;nativeName: string;hint: string;htmlLang: string;dateLocale: string;}[] = [
{ id: 'en', nativeName: 'English', hint: 'English', htmlLang: 'en', dateLocale: 'en-IN' },
{ id: 'hi', nativeName: 'हिंदी', hint: 'Hindi', htmlLang: 'hi', dateLocale: 'hi-IN' },
{ id: 'hinglish', nativeName: 'Hinglish', hint: 'Hindi in English letters', htmlLang: 'hi-Latn', dateLocale: 'en-IN' }];