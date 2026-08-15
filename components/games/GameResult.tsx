"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { fmt } from "@/lib/i18n";
import { useT } from "@/lib/locale-store";

type Props = {
  title: string;
  subtitle: string;
  /** Points awarded for this round (shown prominently). */
  points: number;
  onAgain: () => void;
  againLabel: string;
  extra?: ReactNode;
};

export function GameResult({
  title,
  subtitle,
  points,
  onAgain,
  againLabel,
  extra,
}: Props) {
  const t = useT();

  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center sm:p-8">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
        {t.games.roundCompleteEyebrow}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
        {title}
      </h2>
      <p className="mt-2 text-[var(--muted)]">{subtitle}</p>
      <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-5">
        <p className="font-[family-name:var(--font-display)] text-5xl tabular-nums text-[var(--accent)]">
          {fmt(t.games.pointsEarned, { count: points })}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {t.games.pointsEarnedLabel}
        </p>
      </div>
      {extra}
      <Button type="button" className="mt-6" onClick={onAgain}>
        {againLabel}
      </Button>
    </div>
  );
}
