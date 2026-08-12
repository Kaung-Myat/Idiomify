"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { DefinitionCard } from "@/components/search/DefinitionCard";
import { IconSearch } from "@/components/layout/NavIcons";
import { EmptyState } from "@/components/ui/EmptyState";
import { categoryLabel } from "@/lib/i18n";
import { useLearnerStore } from "@/lib/store";
import { useSearchRecentsStore } from "@/lib/search-recents-store";
import { useT } from "@/lib/locale-store";
import type { DefinitionResult } from "@/lib/types";

const SearchDialog = dynamic(
  () =>
    import("@/components/search/SearchDialog").then((m) => m.SearchDialog),
  { ssr: false },
);

export default function SearchPage() {
  const t = useT();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<DefinitionResult | null>(null);
  const recordSearch = useLearnerStore((s) => s.recordSearch);
  const recents = useSearchRecentsStore((s) => s.recents);
  const addRecent = useSearchRecentsStore((s) => s.addRecent);

  const openDialog = useCallback(() => setDialogOpen(true), []);
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  function handleSelect(item: DefinitionResult) {
    setSelected(item);
    addRecent(item);
    recordSearch();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 md:space-y-6">
      <header className="md:pt-0">
        <h1 className="font-[family-name:var(--font-display)] text-[1.75rem] leading-tight tracking-tight text-[var(--foam)] md:text-4xl">
          {t.search.title}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)] md:mt-2 md:text-base">
          {t.search.subtitle}
        </p>
      </header>

      <button
        type="button"
        onClick={openDialog}
        className="flex min-h-[3.25rem] w-full items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 text-left shadow-[0_4px_16px_color-mix(in_oklab,var(--foam)_6%,transparent)] transition active:scale-[0.99] hover:border-[var(--accent)]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-[var(--accent)]">
          <IconSearch className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px] text-[var(--muted)]">
          {selected?.term || t.search.placeholder}
        </span>
      </button>

      {selected ? (
        <DefinitionCard item={selected} />
      ) : recents.length > 0 ? (
        <section className="space-y-2.5">
          <h2 className="px-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            {t.search.recents}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_4px_16px_color-mix(in_oklab,var(--foam)_5%,transparent)]">
            {recents.slice(0, 6).map((item, index) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() => handleSelect(item)}
                className={`flex w-full flex-col items-start gap-0.5 px-4 py-3.5 text-left transition active:bg-[var(--hover-fill)] hover:bg-[var(--hover-fill)] ${
                  index > 0 ? "border-t border-[var(--line)]" : ""
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                  {item.source === "dictionary"
                    ? t.search.sourceDictionary
                    : item.kind === "idiom"
                      ? item.category
                        ? categoryLabel(t, item.category)
                        : t.common.idiom
                      : t.common.word}
                </p>
                <p className="font-[family-name:var(--font-display)] text-lg text-[var(--foam)]">
                  {item.term}
                </p>
                <p className="line-clamp-1 text-sm text-[var(--muted)]">
                  {item.definition}
                </p>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          title={t.search.emptyTitle}
          description={t.search.emptyDescription}
        />
      )}

      {dialogOpen ? (
        <SearchDialog
          open={dialogOpen}
          onClose={closeDialog}
          onSelect={handleSelect}
        />
      ) : null}
    </div>
  );
}
