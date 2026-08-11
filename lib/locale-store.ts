"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_LOCALE,
  getTranslations,
  type Locale,
  type Translations,
} from "@/lib/i18n";

type LocaleStore = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    { name: "idiomify-locale" },
  ),
);

/** Slang-style typed translations hook: `const t = useT(); t.nav.home` */
export function useT(): Translations {
  const locale = useLocaleStore((s) => s.locale);
  return getTranslations(locale);
}

export function useLocale(): Locale {
  return useLocaleStore((s) => s.locale);
}
