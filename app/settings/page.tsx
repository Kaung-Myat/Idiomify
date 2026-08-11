"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  getUserDisplayName,
  getUserInitials,
  useAuth,
} from "@/lib/auth/useAuth";
import { useLearnerStore } from "@/lib/store";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { useT } from "@/lib/locale-store";
import { fmt } from "@/lib/i18n";
import { useThemeStore, type ThemeMode } from "@/lib/theme-store";
import {
  TEXT_SCALE_DEFAULT,
  TEXT_SCALE_MAX,
  TEXT_SCALE_MIN,
  TEXT_SCALE_STEP,
  useTextScaleStore,
} from "@/lib/text-scale-store";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const t = useT();
  const router = useRouter();
  const { state, signOut } = useAuth();
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const points = useLearnerStore((s) => s.points);
  const stats = useLearnerStore((s) => s.stats);
  const unlocked = useLearnerStore((s) => s.unlockedBadgeIds);
  const resetProgress = useLearnerStore((s) => s.resetProgress);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const textScale = useTextScaleStore((s) => s.scale);
  const setTextScale = useTextScaleStore((s) => s.setScale);

  const user = state.status === "authed" ? state.user : null;

  const themes: { id: ThemeMode; label: string; hint: string }[] = [
    {
      id: "dark",
      label: t.settings.themeDark,
      hint: t.settings.themeDarkHint,
    },
    {
      id: "light",
      label: t.settings.themeLight,
      hint: t.settings.themeLightHint,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          {t.settings.eyebrow}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--foam)]">
          {t.settings.title}
        </h1>
        <p className="mt-2 text-[var(--muted)]">{t.settings.subtitle}</p>
      </header>

      <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          {t.settings.themeTitle}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{t.settings.themeSubtitle}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {themes.map((opt) => {
            const active = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  active
                    ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_12%,transparent)]"
                    : "border-[var(--line)] hover:border-[var(--accent)]/40"
                }`}
              >
                <p className="font-semibold text-[var(--foam)]">{opt.label}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{opt.hint}</p>
                {active ? (
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                    {t.settings.themeActive}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--foam)]">
                {t.settings.textScaleTitle}
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {t.settings.textScaleSubtitle}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-[var(--accent)]">
              {fmt(t.settings.textScaleValue, {
                percent: Math.round(textScale * 100),
              })}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span
              className="text-xs font-semibold text-[var(--muted)]"
              aria-hidden
            >
              {t.settings.textScaleSmall}
            </span>
            <input
              type="range"
              min={Math.round(TEXT_SCALE_MIN * 100)}
              max={Math.round(TEXT_SCALE_MAX * 100)}
              step={Math.round(TEXT_SCALE_STEP * 100)}
              value={Math.round(textScale * 100)}
              onChange={(e) => setTextScale(Number(e.target.value) / 100)}
              aria-label={t.settings.textScaleTitle}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--card-soft)] accent-[var(--accent)]"
            />
            <span
              className="text-lg font-semibold text-[var(--muted)]"
              aria-hidden
            >
              {t.settings.textScaleLarge}
            </span>
          </div>
          {textScale !== TEXT_SCALE_DEFAULT ? (
            <button
              type="button"
              onClick={() => setTextScale(TEXT_SCALE_DEFAULT)}
              className="mt-3 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              {t.settings.textScaleReset}
            </button>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          {t.settings.accountTitle}
        </h2>
        {user ? (
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-lg font-semibold text-[var(--accent)]">
              {getUserInitials(user)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg text-[var(--foam)]">
                {getUserDisplayName(user)}
              </p>
              {user.email ? (
                <p className="truncate text-sm text-[var(--muted)]">{user.email}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-[var(--muted)]">{t.settings.notSignedIn}</p>
            <Link href="/auth/login?next=%2Fsettings" className="mt-3 inline-block">
              <Button type="button">{t.auth.loginButton}</Button>
            </Link>
          </div>
        )}
        {user ? (
          <Button
            type="button"
            variant="secondary"
            className="mt-5"
            onClick={async () => {
              await signOut();
              resetOnboarding();
              router.replace("/");
            }}
          >
            {t.auth.signOutButton}
          </Button>
        ) : null}
      </section>

      <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          {t.settings.progressTitle}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-soft)] px-4 py-3">
            <p className="text-xs text-[var(--muted)]">{t.badges.pointsLabel}</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--accent)]">
              {fmt(t.common.points, { count: points })}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-soft)] px-4 py-3">
            <p className="text-xs text-[var(--muted)]">{t.badges.collection}</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--foam)]">
              {fmt(t.console.statsBadges, { count: unlocked.length })}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-soft)] px-4 py-3">
            <p className="text-xs text-[var(--muted)]">
              {t.badges.statLabels.gamesCompleted}
            </p>
            <p className="mt-1 text-xl font-semibold text-[var(--foam)]">
              {stats.gamesCompleted}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-soft)] px-4 py-3">
            <p className="text-xs text-[var(--muted)]">
              {t.badges.statLabels.speaks}
            </p>
            <p className="mt-1 text-xl font-semibold text-[var(--foam)]">
              {stats.speaks}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="danger"
          className="mt-5"
          onClick={() => {
            if (confirm(t.settings.resetConfirm)) {
              resetProgress();
            }
          }}
        >
          {t.settings.resetProgress}
        </Button>
      </section>
    </div>
  );
}
