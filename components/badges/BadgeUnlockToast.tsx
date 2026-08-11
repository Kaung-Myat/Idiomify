"use client";

import { useEffect } from "react";
import { badgeLabel } from "@/lib/i18n";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

export function BadgeUnlockToast() {
  const newlyUnlocked = useLearnerStore((s) => s.newlyUnlocked);
  const clearNewBadges = useLearnerStore((s) => s.clearNewBadges);
  const t = useT();

  useEffect(() => {
    if (newlyUnlocked.length === 0) return;
    const timer = setTimeout(() => clearNewBadges(), 4200);
    return () => clearTimeout(timer);
  }, [newlyUnlocked, clearNewBadges]);

  if (newlyUnlocked.length === 0) return null;

  const label = badgeLabel(t, newlyUnlocked[0]);

  return (
    <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-50 max-w-sm animate-[rise_0.35s_ease-out] rounded-2xl border border-[var(--accent)]/40 bg-[var(--surface)] p-4 shadow-2xl md:bottom-6 md:right-6">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
        {t.badges.unlockToast}
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-lg text-[var(--foam)]">
        {label.name}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">{label.description}</p>
    </div>
  );
}
