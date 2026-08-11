"use client";

import type { DefinitionResult } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { PlayAudioButton } from "@/components/search/PlayAudioButton";
import { categoryLabel } from "@/lib/i18n";
import { useT } from "@/lib/locale-store";
import Link from "next/link";

type Props = {
  item: DefinitionResult;
};

export function DefinitionCard({ item }: Props) {
  const t = useT();
  const practiceHref = `/practice?target=${encodeURIComponent(item.term)}`;
  const kindLabel =
    item.kind === "idiom"
      ? item.category
        ? categoryLabel(t, item.category)
        : t.common.idiom
      : t.common.word;

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
            {kindLabel}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
            {item.term}
          </h2>
          {item.phonetic ? (
            <p className="mt-1 text-sm text-[var(--muted)]">{item.phonetic}</p>
          ) : null}
        </div>
        <PlayAudioButton text={item.term} />
      </div>
      <p className="mt-4 text-[var(--foam)]">{item.definition}</p>
      <p className="mt-3 text-sm italic text-[var(--muted)]">
        “{item.example}”
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={practiceHref}>
          <Button type="button">{t.search.practiceSpeaking}</Button>
        </Link>
        <Link href="/games">
          <Button type="button" variant="ghost">
            {t.home.playGames}
          </Button>
        </Link>
      </div>
    </article>
  );
}
