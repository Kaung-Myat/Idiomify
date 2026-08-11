"use client";

import { useEffect, useRef, useState } from "react";
import { useLocaleStore, useT } from "@/lib/locale-store";
import type { Locale } from "@/lib/i18n";

type Props = {
  /** floating = desktop pill; compact = mobile app-bar short code */
  variant?: "floating" | "inline" | "compact";
};

const SHORT: Record<Locale, string> = {
  en: "EN",
  my: "MY",
};

export function LocaleSwitcher({ variant = "inline" }: Props) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const options: { value: Locale; label: string }[] = [
    { value: "en", label: t.locale.en },
    { value: "my", label: t.locale.my },
  ];

  const current = options.find((o) => o.value === locale) ?? options[0];
  const compact = variant === "compact";

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "inline") {
    return (
      <label className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
        <span className="sr-only">{t.locale.label}</span>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--foam)] outline-none ring-[var(--accent)] focus:ring-1"
          aria-label={t.locale.label}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t.locale.label}: ${current.label}`}
        title={current.label}
        className={
          compact
            ? "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-full border border-[var(--accent)] bg-[var(--surface)] px-2.5 text-xs font-bold tracking-wide text-[var(--accent)] transition hover:bg-[var(--hover-fill)] active:scale-[0.98]"
            : "inline-flex items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foam)] shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition hover:bg-[var(--hover-fill)] active:scale-[0.98]"
        }
      >
        {compact ? (
          SHORT[locale]
        ) : (
          <>
            <span
              className="grid h-5 w-5 place-items-center rounded-full border border-[var(--accent)] text-[10px] font-bold text-[var(--accent)]"
              aria-hidden
            >
              Aa
            </span>
            {current.label}
            <svg
              viewBox="0 0 12 12"
              className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path d="M2.5 4.5 6 8l3.5-3.5" />
            </svg>
          </>
        )}
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[10rem] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] py-1 shadow-xl"
        >
          {options.map((opt) => {
            const active = opt.value === locale;
            return (
              <li key={opt.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    setLocale(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[var(--hover-fill)] ${
                    active
                      ? "font-semibold text-[var(--accent)]"
                      : "text-[var(--foam)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-6 text-xs font-bold tracking-wide text-[var(--muted)]">
                      {SHORT[opt.value]}
                    </span>
                    {opt.label}
                  </span>
                  {active ? <span aria-hidden>✓</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
