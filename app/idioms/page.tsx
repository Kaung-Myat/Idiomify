"use client";

import { CATEGORIES } from "@/lib/content";
import { CategoryCard } from "@/components/idioms/CategoryCard";
import { useT } from "@/lib/locale-store";

export default function IdiomsPage() {
  const t = useT();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          {t.idioms.eyebrow}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--foam)] sm:text-5xl">
          {t.idioms.title}
        </h1>
        <p className="mt-3 text-[var(--muted)]">{t.idioms.subtitle}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((category) => (
          <CategoryCard key={category} category={category} />
        ))}
      </div>
    </div>
  );
}
