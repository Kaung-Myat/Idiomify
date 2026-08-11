"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/lib/locale-store";

export function LocaleHtml() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    const lang = locale === "my" ? "my" : "en";
    document.documentElement.lang = lang;
    document.documentElement.dataset.locale = lang;
  }, [locale]);

  return null;
}
