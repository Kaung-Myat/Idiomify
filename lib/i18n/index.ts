import en from "@/i18n/en.json";
import my from "@/i18n/my.json";

export type Locale = "en" | "my";

export type Translations = typeof en;

export const LOCALES: Locale[] = ["en", "my"];

export const DEFAULT_LOCALE: Locale = "my";

export const translations: Record<Locale, Translations> = {
  en,
  my,
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? translations[DEFAULT_LOCALE];
}

/** Interpolate `{key}` placeholders — slang-style parameters. */
export function fmt(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(params[key] ?? `{${key}}`),
  );
}

export function feedbackKeyForScore(accuracy: number): keyof Translations["feedback"] {
  if (accuracy >= 95) return "excellent";
  if (accuracy >= 80) return "great";
  if (accuracy >= 60) return "close";
  if (accuracy >= 40) return "keepPracticing";
  return "tryAgain";
}

export function categoryLabel(
  t: Translations,
  category: string,
): string {
  const map = t.categories as Record<string, string>;
  return map[category] ?? category;
}

export function badgeLabel(
  t: Translations,
  id: string,
): { name: string; description: string } {
  const items = t.badges.items as Record<string, { name: string; description: string }>;
  return items[id] ?? { name: id, description: "" };
}
