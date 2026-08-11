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
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--foam)]">
          {t.search.title}
        </h1>
        <p className="mt-2 text-[var(--muted)]">{t.search.subtitle}</p>
      </header>

      <button
        type="button"
        onClick={openDialog}
        className="flex w-full items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 text-left transition hover:border-[var(--accent)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      >
        <IconSearch className="h-5 w-5 shrink-0 text-[var(--muted)]" />
        <span className="flex-1 text-[var(--muted)]">
          {selected?.term || t.search.placeholder}
        </span>
        <span className="rounded-lg border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--muted)]">
          {t.search.openSearch}
        </span>
      </button>

      {selected ? (
        <DefinitionCard item={selected} />
      ) : recents.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
            {t.search.recents}
          </h2>
          <div className="grid gap-3">
            {recents.slice(0, 4).map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-left transition hover:border-[var(--accent)]/40"
              >
                <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--accent)]">
                  {item.kind === "idiom"
                    ? item.category
                      ? categoryLabel(t, item.category)
                      : t.common.idiom
                    : t.common.word}
                </p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--foam)]">
                  {item.term}
                </p>
                <p className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">
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
