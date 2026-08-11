"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  title: string;
  subtitle: string;
  onAgain: () => void;
  againLabel: string;
  extra?: ReactNode;
};

export function GameResult({
  title,
  subtitle,
  onAgain,
  againLabel,
  extra,
}: Props) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center sm:p-8">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
        Round complete
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
        {title}
      </h2>
      <p className="mt-2 text-[var(--muted)]">{subtitle}</p>
      {extra}
      <Button type="button" className="mt-6" onClick={onAgain}>
        {againLabel}
      </Button>
    </div>
  );
}
