"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/locale-store";

export type TargetOption = {
  id: string;
  term: string;
  example: string;
};

type Props = {
  options: TargetOption[];
  value: string;
  onChange: (term: string) => void;
};

export function TargetPicker({ options, value, onChange }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const titleId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = options.find((o) => o.term === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.term.toLowerCase().includes(q) ||
        o.example.toLowerCase().includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 30);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  function select(term: string) {
    onChange(term);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_6px_20px_color-mix(in_oklab,var(--foam)_6%,transparent)] sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          {t.practice.chooseTarget}
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-display)] text-xl text-[var(--foam)] sm:text-2xl">
              {value}
            </p>
            {selected?.example ? (
              <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                {selected.example}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 w-full shrink-0 sm:w-auto"
            onClick={() => setOpen(true)}
          >
            {t.practice.changeTarget}
          </Button>
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-label={t.common.close}
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl sm:mx-4 sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
              <div>
                <h2
                  id={titleId}
                  className="font-[family-name:var(--font-display)] text-xl text-[var(--foam)]"
                >
                  {t.practice.chooseTarget}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {t.practice.pickHint}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:bg-[var(--hover-fill)] hover:text-[var(--foam)]"
              >
                {t.common.close}
              </button>
            </div>

            <div className="border-b border-[var(--line)] px-5 py-3">
              <label className="sr-only" htmlFor="target-search">
                {t.practice.searchTargets}
              </label>
              <input
                ref={searchRef}
                id="target-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.practice.searchTargets}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--foam)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
              />
            </div>

            <ul className="app-scroll flex-1 overflow-y-auto overscroll-contain px-2 py-2">
              {filtered.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                  {t.practice.noTargetsFound}
                </li>
              ) : (
                filtered.map((item) => {
                  const isActive = item.term === value;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => select(item.term)}
                        className={`flex w-full flex-col items-start gap-0.5 rounded-xl px-4 py-3 text-left transition ${
                          isActive
                            ? "bg-[var(--accent)]/15 ring-1 ring-[var(--accent)]/50"
                            : "hover:bg-[var(--hover-fill)]"
                        }`}
                      >
                        <span className="font-semibold text-[var(--foam)]">
                          {item.term}
                        </span>
                        {item.example ? (
                          <span className="line-clamp-2 text-sm text-[var(--muted)]">
                            {item.example}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
