"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CategoryIcon,
  CATEGORY_VISUAL,
} from "@/components/idioms/categoryVisual";
import { DefinitionCard } from "@/components/search/DefinitionCard";
import {
  CATEGORIES,
  getIdiomById,
  slugifyCategory,
  type Category,
} from "@/lib/content";
import { categoryLabel } from "@/lib/i18n";
import { useT } from "@/lib/locale-store";

export default function IdiomDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useT();
  const idiom = getIdiomById(params.id);

  if (!idiom) {
    return <p className="text-[var(--muted)]">{t.search.noMatchesTitle}</p>;
  }

  const category = (CATEGORIES.find((c) => c === idiom.category) ??
    "Daily Life") as Category;
  const visual = CATEGORY_VISUAL[category];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
        <Link href="/idioms" className="hover:text-[var(--accent)]">
          {t.idioms.title}
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/idioms/${slugifyCategory(idiom.category)}`}
          className="inline-flex items-center gap-1.5 hover:text-[var(--accent)]"
        >
          <CategoryIcon
            category={category}
            className="h-3.5 w-3.5"
          />
          {categoryLabel(t, idiom.category)}
        </Link>
      </nav>

      <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-1">
        <DefinitionCard
          item={{
            kind: "idiom",
            id: idiom.id,
            term: idiom.term,
            category: idiom.category,
            definition: idiom.definition,
            example: idiom.example,
          }}
        />
      </div>
    </div>
  );
}
