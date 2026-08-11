"use client";

import type { LearnerStats } from "@/lib/types";
import { fmt } from "@/lib/i18n";
import { useT } from "@/lib/locale-store";

type Props = {
  points: number;
  unlockedCount: number;
  totalBadges: number;
  stats: LearnerStats;
};

function StatCard({
  label,
  value,
  suffix = "",
  accent = "var(--accent)",
  hint,
  progress,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  accent?: string;
  hint?: string;
  progress?: number;
}) {
  const pct = Math.max(0, Math.min(100, progress ?? 0));

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p
        className="mt-2 font-[family-name:var(--font-display)] text-3xl"
        style={{ color: accent }}
      >
        {value}
        {suffix ? (
          <span className="ml-0.5 text-lg text-[var(--muted)]">{suffix}</span>
        ) : null}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>
      ) : null}
      {typeof progress === "number" ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--card-soft)]">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${pct}%`, background: accent }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function StatsOverview({
  points,
  unlockedCount,
  totalBadges,
  stats,
}: Props) {
  const t = useT();
  const pointGoal = 100;
  const gamesGoal = 5;
  const badgePct = totalBadges
    ? Math.round((unlockedCount / totalBadges) * 100)
    : 0;

  const metrics: {
    key: string;
    label: string;
    value: number;
    suffix?: string;
    accent: string;
    hint?: string;
    progress?: number;
  }[] = [
    {
      key: "searches",
      label: t.badges.statLabels.searches,
      value: stats.searches,
      accent: "#7eb6ff",
    },
    {
      key: "speaks",
      label: t.badges.statLabels.speaks,
      value: stats.speaks,
      accent: "#38b2ac",
    },
    {
      key: "best",
      label: t.badges.statLabels.bestScore,
      value: stats.bestSpeakScore,
      suffix: "%",
      accent: "#f5a623",
      progress: stats.bestSpeakScore,
      hint: t.badges.statHints.bestScore,
    },
    {
      key: "easy",
      label: t.badges.statLabels.easyRounds,
      value: stats.easyRounds,
      accent: "#38b2ac",
    },
    {
      key: "medium",
      label: t.badges.statLabels.mediumRounds,
      value: stats.mediumRounds,
      accent: "#f5a623",
    },
    {
      key: "hard",
      label: t.badges.statLabels.hardPasses,
      value: stats.hardPasses,
      accent: "#f07878",
    },
    {
      key: "games",
      label: t.badges.statLabels.gamesCompleted,
      value: stats.gamesCompleted,
      accent: "#c4a5ff",
      progress: (stats.gamesCompleted / gamesGoal) * 100,
      hint: fmt(t.badges.statHints.gamesGoal, { goal: gamesGoal }),
    },
    {
      key: "daily",
      label: t.badges.statLabels.dailyChallenges,
      value: stats.dailyChallenges ?? 0,
      accent: "#f5a623",
    },
  ];

  return (
    <section className="space-y-4">
      <div className="grid gap-4 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:grid-cols-[auto_1fr] sm:p-6">
        <div className="relative mx-auto grid h-36 w-36 place-items-center sm:mx-0">
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="color-mix(in oklab, var(--foam) 12%, transparent)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - Math.min(1, points / pointGoal))}`}
            />
          </svg>
          <div className="relative text-center">
            <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
              {points}
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              {t.badges.pointsLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
            {t.badges.overviewEyebrow}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--foam)] sm:text-3xl">
            {fmt(t.badges.overviewTitle, {
              unlocked: unlockedCount,
              total: totalBadges,
            })}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {fmt(t.badges.pointsToward, {
              points,
              goal: pointGoal,
            })}
          </p>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--muted)]">
              <span>{t.badges.collection}</span>
              <span>{badgePct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--card-soft)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500"
                style={{ width: `${badgePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <StatCard
            key={m.key}
            label={m.label}
            value={m.value}
            suffix={m.suffix}
            accent={m.accent}
            hint={m.hint}
            progress={m.progress}
          />
        ))}
      </div>
    </section>
  );
}
