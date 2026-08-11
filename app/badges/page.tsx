"use client";

import { BadgeGrid } from "@/components/badges/BadgeGrid";
import { StatsOverview } from "@/components/badges/StatsOverview";
import { Button } from "@/components/ui/Button";
import { badges } from "@/lib/content";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

export default function BadgesPage() {
  const points = useLearnerStore((s) => s.points);
  const stats = useLearnerStore((s) => s.stats);
  const unlocked = useLearnerStore((s) => s.unlockedBadgeIds);
  const resetProgress = useLearnerStore((s) => s.resetProgress);
  const t = useT();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            {t.badges.eyebrow}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--foam)] sm:text-5xl">
            {t.badges.title}
          </h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            {t.badges.subtitle}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (confirm(t.badges.resetConfirm)) {
              resetProgress();
            }
          }}
        >
          {t.badges.reset}
        </Button>
      </header>

      <StatsOverview
        points={points}
        unlockedCount={unlocked.length}
        totalBadges={badges.length}
        stats={stats}
      />

      <BadgeGrid />
    </div>
  );
}
