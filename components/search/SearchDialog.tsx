"use client";

import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { IconSearch } from "@/components/layout/NavIcons";
import { categoryLabel, fmt } from "@/lib/i18n";
import { searchDefinitions } from "@/lib/content";
import { useSearchRecentsStore } from "@/lib/search-recents-store";
import { useT } from "@/lib/locale-store";
import type { DefinitionResult } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (item: DefinitionResult) => void;
  initialQuery?: string;
};

export function SearchDialog({
  open,
  onClose,
  onSelect,
  initialQuery = "",
}: Props) {
  const t = useT();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const recents = useSearchRecentsStore((s) => s.recents);
  const clearRecents = useSearchRecentsStore((s) => s.clearRecents);
  const removeRecent = useSearchRecentsStore((s) => s.removeRecent);

  const trimmed = query.trim();
  const deferredQuery = useDeferredValue(trimmed);
  const results = useMemo(
    () => (deferredQuery ? searchDefinitions(deferredQuery) : []),
    [deferredQuery],
  );

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, initialQuery, onClose]);

  if (!open) return null;

  function pick(item: DefinitionResult) {
    onSelect(item);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[12vh] sm:px-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label={t.common.close}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[76vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
          <IconSearch className="h-5 w-5 shrink-0 text-[var(--muted)]" />
          <label className="sr-only" htmlFor="search-dialog-input">
            {t.search.title}
          </label>
          <input
            ref={inputRef}
            id="search-dialog-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            className="min-w-0 flex-1 bg-transparent text-base text-[var(--foam)] outline-none placeholder:text-[var(--muted)]"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:bg-[var(--hover-fill)] hover:text-[var(--foam)]"
          >
            {t.common.close}
          </button>
        </div>

        <h2 id={titleId} className="sr-only">
          {t.search.title}
        </h2>

        <div className="app-scroll min-h-0 flex-1 overflow-y-auto">
          {!trimmed ? (
            <div className="px-2 py-2">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
                  {t.search.recents}
                </p>
                {recents.length > 0 ? (
                  <button
                    type="button"
                    onClick={clearRecents}
                    className="text-xs text-[var(--muted)] hover:text-[var(--foam)]"
                  >
                    {t.search.clearRecents}
                  </button>
                ) : null}
              </div>

              {recents.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-[var(--muted)]">
                  {t.search.noRecents}
                </p>
              ) : (
                <ul>
                  {recents.map((item) => (
                    <li key={`${item.kind}-${item.id}`} className="group relative">
                      <button
                        type="button"
                        onClick={() => pick(item)}
                        className="flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-3 text-left hover:bg-[var(--hover-fill)]"
                      >
                        <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--accent)]">
                          {item.kind === "idiom"
                            ? item.category
                              ? categoryLabel(t, item.category)
                              : t.common.idiom
                            : t.common.word}
                        </span>
                        <span className="font-semibold text-[var(--foam)]">
                          {item.term}
                        </span>
                        <span className="line-clamp-1 text-sm text-[var(--muted)]">
                          {item.definition}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRecent(item.id, item.kind)}
                        className="absolute right-2 top-2 rounded-md px-2 py-1 text-xs text-[var(--muted)] opacity-0 hover:bg-[var(--hover-fill)] hover:text-[var(--foam)] group-hover:opacity-100"
                        aria-label={t.search.removeRecent}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : deferredQuery && results.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--muted)]">
              {fmt(t.search.noMatchesDescription, { query: deferredQuery })}
            </p>
          ) : (
            <ul className="px-2 py-2">
              {results.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <button
                    type="button"
                    onClick={() => pick(item)}
                    className="flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-3 text-left hover:bg-[var(--hover-fill)]"
                  >
                    <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--accent)]">
                      {item.kind === "idiom"
                        ? item.category
                          ? categoryLabel(t, item.category)
                          : t.common.idiom
                        : t.common.word}
                    </span>
                    <span className="font-semibold text-[var(--foam)]">
                      {item.term}
                      {item.phonetic ? (
                        <span className="ml-2 font-normal text-[var(--muted)]">
                          {item.phonetic}
                        </span>
                      ) : null}
                    </span>
                    <span className="line-clamp-2 text-sm text-[var(--muted)]">
                      {item.definition}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
