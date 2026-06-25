import { Injectable, signal, effect } from '@angular/core';
import EN from '../../../langs/en.json';
import FR from '../../../langs/fr.json';
import AR from '../../../langs/ar.json';

export type Lang = 'en' | 'fr' | 'ar';

type TranslationTree = Record<string, Record<string, string>>;

const TRANSLATIONS: Record<Lang, TranslationTree> = { en: EN, fr: FR, ar: AR };
const STORAGE_KEY = 'app_lang';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly lang = signal<Lang>(this.readStoredLang());

  constructor() {
    effect(() => {
      const lang = this.lang();
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    });
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  /** Resolve a dot-notation key like 'profile.title' */
  t(key: string): string {
    const [page, prop] = key.split('.');
    return TRANSLATIONS[this.lang()][page]?.[prop] ?? key;
  }

  private readStoredLang(): Lang {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    return stored && stored in TRANSLATIONS ? stored : 'fr';
  }
}
