"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fmt } from "@/lib/i18n";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

export function PointsPill() {
  const points = useLearnerStore((s) => s.points);
  const t = useT();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <Link
      href="/badges"
      className="inline-flex max-w-[5.75rem] items-center gap-1 truncate rounded-full border border-[var(--accent)]/35 bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] px-2.5 py-2 text-xs font-bold text-[var(--accent)] transition active:scale-95 hover:border-[var(--accent)]/60 sm:max-w-none sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm"
      title={t.badges.title}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
      <span className="truncate">{fmt(t.common.points, { count: ready ? points : 0 })}</span>
    </Link>
  );
}
