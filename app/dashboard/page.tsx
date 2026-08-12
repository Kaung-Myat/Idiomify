"use client";

import Link from "next/link";
import { fmt } from "@/lib/i18n";
import { getUserDisplayName, useAuth } from "@/lib/auth/useAuth";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";
import { NavIcon, type NavIconKey } from "@/components/layout/NavIcons";
import { InstallAppDialog } from "@/components/pwa/InstallAppDialog";

const modules: {
  key: Exclude<NavIconKey, "console" | "settings">;
  href: string;
  accent: string;
}[] = [
  { key: "search", href: "/search", accent: "#f5a623" },
  { key: "idioms", href: "/idioms", accent: "#38b2ac" },
  { key: "practice", href: "/practice", accent: "#7eb6ff" },
  { key: "games", href: "/games", accent: "#c4a5ff" },
  { key: "badges", href: "/badges", accent: "#f07878" },
];

export default function DashboardPage() {
  const t = useT();
  const { state } = useAuth();
  const points = useLearnerStore((s) => s.points);
  const stats = useLearnerStore((s) => s.stats);
  const unlocked = useLearnerStore((s) => s.unlockedBadgeIds);

  const welcomeName =
    state.status === "authed"
      ? getUserDisplayName(state.user)
      : t.app.learner;

  const quickStats = [
    {
      label: t.badges.pointsLabel,
      value: fmt(t.common.points, { count: points }),
      accent: "var(--accent)",
    },
    {
      label: t.badges.statLabels.gamesCompleted,
      value: String(stats.gamesCompleted),
      accent: "var(--foam)",
    },
    {
      label: t.badges.statLabels.speaks,
      value: String(stats.speaks),
      accent: "var(--foam)",
    },
    {
      label: t.badges.collection,
      value: fmt(t.console.statsBadges, { count: unlocked.length }),
      accent: "var(--foam)",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] px-5 py-6 sm:px-7 sm:py-8">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          {t.console.eyebrow}
        </p>
        <p className="mt-3 text-sm font-medium text-[var(--muted)]">
          {fmt(t.console.welcome, { name: welcomeName })}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foam)] sm:text-5xl">
          {t.console.title}
        </h1>
        <p className="mt-3 max-w-xl text-[var(--muted)]">{t.console.subtitle}</p>
      </header>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          {t.console.statsTitle}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4"
            >
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                {stat.label}
              </p>
              <p
                className="mt-2 font-[family-name:var(--font-display)] text-2xl"
                style={{ color: stat.accent }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          {t.console.modulesTitle}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const card = t.console.cards[mod.key];
            return (
              <Link
                key={mod.key}
                href={mod.href}
                className="group flex flex-col rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/45"
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--card-soft)]"
                  style={{ color: mod.accent }}
                >
                  <NavIcon name={mod.key} className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl text-[var(--foam)] transition group-hover:text-[var(--accent)]">
                  {card.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                  {card.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] transition group-hover:gap-2.5">
                  {t.console.openModule}
                  <span aria-hidden>→</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <InstallAppDialog />
    </div>
  );
}
