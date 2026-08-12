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
    item.source === "dictionary"
      ? t.search.sourceDictionary
      : item.kind === "idiom"
        ? item.category
          ? categoryLabel(t, item.category)
          : t.common.idiom
        : t.common.word;

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_6px_20px_color-mix(in_oklab,var(--foam)_6%,transparent)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            {kindLabel}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-[1.65rem] leading-tight text-[var(--foam)] sm:text-3xl">
            {item.term}
          </h2>
          {item.phonetic ? (
            <p className="mt-1 text-sm text-[var(--muted)]">{item.phonetic}</p>
          ) : null}
        </div>
        <PlayAudioButton text={item.term} audioUrl={item.audioUrl} />
      </div>
      <p className="mt-4 leading-relaxed text-[var(--foam)]">{item.definition}</p>
      <p className="mt-3 text-sm italic leading-relaxed text-[var(--muted)]">
        “{item.example}”
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link href={practiceHref} className="sm:w-auto">
          <Button type="button" className="min-h-11 w-full sm:w-auto">
            {t.search.practiceSpeaking}
          </Button>
        </Link>
        <Link href="/games" className="sm:w-auto">
          <Button type="button" variant="ghost" className="min-h-11 w-full sm:w-auto">
            {t.home.playGames}
          </Button>
        </Link>
      </div>
    </article>
  );
}
