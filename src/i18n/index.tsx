import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { LanguageSetting } from '@/types';

import { en } from './en';
import { pl } from './pl';

const translations = { en, pl };

type DotPaths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPaths<T[K]>}`;
    }[keyof T & string];

export type TranslationKey = DotPaths<typeof en>;
export type TFunction = (key: TranslationKey, options?: Record<string, unknown>) => string;

export function resolveLocale(language: LanguageSetting): string {
  if (language !== 'system') return language;
  const device = getLocales()[0]?.languageCode;
  return device === 'pl' ? 'pl' : 'en';
}

interface I18nContextValue {
  t: TFunction;
  locale: string;
  language: LanguageSetting;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  language,
  children,
}: {
  language: LanguageSetting;
  children: ReactNode;
}) {
  const locale = resolveLocale(language);

  const value = useMemo<I18nContextValue>(() => {
    const instance = new I18n(translations);
    instance.enableFallback = true;
    instance.locale = locale;
    const t: TFunction = (key, options) => instance.t(key, options ?? {}) as string;
    return { t, locale, language };
  }, [locale, language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
