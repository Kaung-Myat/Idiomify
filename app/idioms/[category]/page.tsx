"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CategoryIcon,
  CATEGORY_VISUAL,
} from "@/components/idioms/categoryVisual";
import { IdiomListItem } from "@/components/idioms/IdiomListItem";
import {
  CATEGORIES,
  categoryFromSlug,
  getIdiomsByCategory,
  type Category,
} from "@/lib/content";
import { categoryLabel, fmt } from "@/lib/i18n";
import { useT } from "@/lib/locale-store";

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const t = useT();
  const [query, setQuery] = useState("");
  const raw = categoryFromSlug(params.category);
  const category = CATEGORIES.find((c) => c === raw) as Category | undefined;

  const items = useMemo(
    () => (category ? getIdiomsByCategory(category) : []),
    [category],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q),
    );
  }, [items, query]);

  if (!category) {
    return <p className="text-[var(--muted)]">{t.search.noMatchesTitle}</p>;
  }

  const visual = CATEGORY_VISUAL[category];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-5 py-6 sm:px-7">
        <Link
          href="/idioms"
          className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
        >
          {t.idioms.backToCategories}
        </Link>

        <div className="mt-4 flex flex-wrap items-start gap-4">
          <span
            className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--card-soft)]"
            style={{ color: visual.accent }}
          >
            <CategoryIcon category={category} className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--foam)] sm:text-4xl">
              {categoryLabel(t, category)}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {t.idioms.categoryBlurbs[visual.blurbKey]}
            </p>
            <p
              className="mt-3 text-sm font-semibold"
              style={{ color: visual.accent }}
            >
              {fmt(t.common.idiomsCount, { count: items.length })}
            </p>
          </div>
        </div>
      </header>

      <label className="block">
        <span className="sr-only">{t.idioms.filterPlaceholder}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.idioms.filterPlaceholder}
          className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--foam)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
          autoComplete="off"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-10 text-center text-sm text-[var(--muted)]">
          {fmt(t.search.noMatchesDescription, { query: query.trim() || "—" })}
        </p>
      ) : (
        <div className="grid gap-2.5">
          {filtered.map((idiom) => (
            <IdiomListItem
              key={idiom.id}
              idiom={idiom}
              accent={visual.accent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
