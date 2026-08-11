"use client";

import Link from "next/link";
import {
  CategoryIcon,
  CATEGORY_VISUAL,
} from "@/components/idioms/categoryVisual";
import type { Category } from "@/lib/content";
import { getIdiomsByCategory, slugifyCategory } from "@/lib/content";
import { categoryLabel, fmt } from "@/lib/i18n";
import { useT } from "@/lib/locale-store";

type Props = {
  category: Category;
};

export function CategoryCard({ category }: Props) {
  const t = useT();
  const visual = CATEGORY_VISUAL[category];
  const items = getIdiomsByCategory(category);
  const samples = items.slice(0, 3);
  const blurb = t.idioms.categoryBlurbs[visual.blurbKey];

  return (
    <Link
      href={`/idioms/${slugifyCategory(category)}`}
      className="group relative flex flex-col rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--foam)_28%,transparent)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--card-soft)]"
          style={{ color: visual.accent }}
        >
          <CategoryIcon category={category} className="h-5 w-5" />
        </span>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            color: visual.accent,
            background: `color-mix(in oklab, ${visual.accent} 16%, transparent)`,
          }}
        >
          {fmt(t.common.idiomsCount, { count: items.length })}
        </span>
      </div>

      <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl text-[var(--foam)] sm:text-[1.7rem]">
        {categoryLabel(t, category)}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{blurb}</p>

      <ul className="mt-5 space-y-2 border-t border-[var(--line)] pt-4">
        {samples.map((idiom) => (
          <li
            key={idiom.id}
            className="truncate text-sm text-[var(--foam)]/85"
          >
            <span style={{ color: visual.accent }} className="mr-2">
              ·
            </span>
            {idiom.term}
          </li>
        ))}
      </ul>

      <span
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition group-hover:gap-2.5"
        style={{ color: visual.accent }}
      >
        {t.idioms.browseCategory}
        <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
