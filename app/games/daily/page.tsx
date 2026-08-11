"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchDailyLeaderboard,
  type LeaderboardRow,
} from "@/lib/leaderboard";
import { todayKey } from "@/lib/games/utils";
import { useDailyScoresStore } from "@/lib/daily-scores-store";
import { useT } from "@/lib/locale-store";
import { fmt } from "@/lib/i18n";

const DailyChallengeRound = dynamic(
  () =>
    import("@/components/games/DailyChallengeRound").then(
      (m) => m.DailyChallengeRound,
    ),
  {
    loading: () => (
      <div className="grid min-h-[12rem] place-items-center rounded-3xl border border-[var(--line)] bg-[var(--surface)] text-sm text-[var(--muted)]">
        …
      </div>
    ),
  },
);

export default function DailyGamePage() {
  const t = useT();
  const dateKey = todayKey();
  const localBest = useDailyScoresStore((s) => s.bestFor(dateKey));
  const [rows, setRows] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    let alive = true;
    void fetchDailyLeaderboard(dateKey).then((data) => {
      if (alive) setRows(data);
    });
    return () => {
      alive = false;
    };
  }, [dateKey]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link href="/games" className="text-sm text-[var(--accent)]">
          {t.games.back}
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--foam)]">
          {t.games.daily.title}
        </h1>
        <p className="mt-2 text-[var(--muted)]">{t.games.daily.pageSubtitle}</p>
        {localBest > 0 ? (
          <p className="mt-2 text-sm font-semibold text-[var(--accent)]">
            {fmt(t.games.daily.todayBest, { score: localBest })}
          </p>
        ) : null}
      </header>

      <DailyChallengeRound />

      <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--foam)]">
          {t.games.daily.leaderboard}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {t.games.daily.leaderboardHint}
        </p>
        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            {localBest > 0
              ? fmt(t.games.daily.localOnly, { score: localBest })
              : t.games.daily.leaderboardEmpty}
          </p>
        ) : (
          <ol className="mt-4 space-y-2">
            {rows.map((row, i) => (
              <li
                key={`${row.userId}-${i}`}
                className="flex items-center justify-between rounded-xl border border-[var(--line)] px-3 py-2 text-sm"
              >
                <span className="text-[var(--foam)]">
                  <span className="mr-2 text-[var(--muted)]">#{i + 1}</span>
                  {row.displayName}
                </span>
                <span className="font-semibold text-[var(--accent)]">
                  {row.score}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
