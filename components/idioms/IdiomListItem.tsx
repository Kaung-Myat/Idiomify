"use client";

import Link from "next/link";
import type { Idiom } from "@/lib/types";

type Props = {
  idiom: Idiom;
  accent?: string;
};

export function IdiomListItem({ idiom, accent = "var(--accent)" }: Props) {
  return (
    <Link
      href={`/idioms/detail/${idiom.id}`}
      className="group flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 transition hover:-translate-y-px hover:border-[color-mix(in_oklab,var(--foam)_28%,transparent)] sm:gap-4 sm:px-5"
    >
      <span
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ background: accent }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-[var(--foam)] transition group-hover:text-[var(--accent)]">
          {idiom.term}
        </h2>
        <p className="mt-1 text-sm leading-snug text-[var(--foam)]/75">
          {idiom.definition}
        </p>
        <p className="mt-1.5 line-clamp-1 text-xs italic text-[var(--muted)]">
          “{idiom.example}”
        </p>
      </div>
      <span
        className="mt-1 shrink-0 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
        aria-hidden
      >
        →
      </span>
    </Link>
  );
}
