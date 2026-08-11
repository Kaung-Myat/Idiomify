"use client";

import Link from "next/link";
import { useT } from "@/lib/locale-store";
import { todayKey } from "@/lib/games/utils";
import { useDailyScoresStore } from "@/lib/daily-scores-store";
import { fmt } from "@/lib/i18n";

export default function GamesHubPage() {
  const t = useT();
  const dateKey = todayKey();
  const best = useDailyScoresStore((s) => s.bestFor(dateKey));

  const modes = [
    {
      href: "/games/easy",
      title: t.games.easy.title,
      blurb: t.games.easy.hubBlurb,
      accent: "#38b2ac",
      modes: t.games.easy.modesList,
    },
    {
      href: "/games/medium",
      title: t.games.medium.title,
      blurb: t.games.medium.hubBlurb,
      accent: "#f5a623",
      modes: t.games.medium.modesList,
    },
    {
      href: "/games/hard",
      title: t.games.hard.title,
      blurb: t.games.hard.hubBlurb,
      accent: "#f07878",
      modes: t.games.hard.modesList,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          {t.games.eyebrow}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--foam)] sm:text-5xl">
          {t.games.title}
        </h1>
        <p className="mt-3 text-[var(--muted)]">{t.games.subtitle}</p>
      </header>

      <Link
        href="/games/daily"
        className="group relative flex flex-col rounded-3xl border border-[var(--accent)]/35 bg-[var(--surface)] p-6 transition hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between sm:p-7"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
            {t.games.daily.badge}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
            {t.games.daily.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            {t.games.daily.hubBlurb}
          </p>
          {best > 0 ? (
            <p className="mt-3 text-sm font-semibold text-[var(--accent)]">
              {fmt(t.games.daily.todayBest, { score: best })}
            </p>
          ) : null}
        </div>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition group-hover:gap-3 sm:mt-0">
          {t.games.daily.play}
          <span aria-hidden>→</span>
        </span>
      </Link>

      <div className="grid gap-4 md:grid-cols-3">
        {modes.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className="group flex flex-col rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40"
          >
            <span
              className="text-xs font-semibold uppercase tracking-[0.14em]"
              style={{ color: mode.accent }}
            >
              {mode.title}
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--foam)]">
              {mode.title}
            </h2>
            <p className="mt-2 flex-1 text-sm text-[var(--muted)]">
              {mode.blurb}
            </p>
            <p className="mt-4 text-xs text-[var(--foam)]/70">{mode.modes}</p>
            <span
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition group-hover:gap-2.5"
              style={{ color: mode.accent }}
            >
              {t.games.playLevel}
              <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
