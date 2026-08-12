"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getUserDisplayName,
  getUserInitials,
  useAuth,
} from "@/lib/auth/useAuth";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";
import { fmt } from "@/lib/i18n";
import { IconLogout } from "@/components/layout/NavIcons";

type Props = {
  compact?: boolean;
  showLoginWhenSignedOut?: boolean;
  loginNext?: string;
};

function resolveLoginNext(pathname: string, loginNext?: string) {
  if (loginNext) return loginNext;
  if (pathname === "/" || pathname.startsWith("/auth/")) return "/dashboard";
  return pathname || "/dashboard";
}

export function UserMenu({
  compact = false,
  showLoginWhenSignedOut = true,
  loginNext,
}: Props) {
  const t = useT();
  const pathname = usePathname();
  const { state } = useAuth();

  if (state.status === "loading") {
    return (
      <div
        className={`animate-pulse rounded-full bg-[var(--hover-fill)] ${compact ? "h-9 w-9" : "h-10 w-36"}`}
      />
    );
  }

  if (state.status !== "authed") {
    if (!showLoginWhenSignedOut) return null;
    const next = encodeURIComponent(resolveLoginNext(pathname, loginNext));
    return (
      <Link href={`/auth/login?next=${next}`}>
        <Button type="button" variant="secondary" className="text-sm">
          {t.auth.loginButton}
        </Button>
      </Link>
    );
  }

  const { user } = state;
  const initials = getUserInitials(user);

  // Compact = mobile header avatar → settings (no duplicate account card)
  if (compact) {
    return (
      <Link
        href="/settings"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-xs font-semibold text-[var(--accent)] active:scale-95"
        title={t.settings.title}
        aria-label={t.settings.title}
      >
        {initials}
      </Link>
    );
  }

  // Landing / marketing header only
  return (
    <Link
      href="/settings"
      className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 transition hover:border-[var(--accent)]/40"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-xs font-semibold text-[var(--accent)]">
        {initials}
      </span>
      <span className="hidden max-w-[8rem] truncate text-sm text-[var(--foam)] sm:inline">
        {getUserDisplayName(user)}
      </span>
    </Link>
  );
}

/** Combined points + account for sidebar footer (single place). */
export function SidebarAccountCard({ onNavigate }: { onNavigate?: () => void }) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { state, signOut } = useAuth();
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const points = useLearnerStore((s) => s.points);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (state.status === "loading") {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-soft)] p-3">
        <div className="h-16 animate-pulse rounded-xl bg-[var(--hover-fill)]" />
      </div>
    );
  }

  if (state.status !== "authed") {
    const next = encodeURIComponent(resolveLoginNext(pathname));
    return (
      <Link
        href={`/auth/login?next=${next}`}
        onClick={onNavigate}
        className="block rounded-2xl border border-[var(--line)] bg-[var(--card-soft)] px-4 py-3 text-center text-sm font-medium text-[var(--accent)] transition hover:border-[var(--accent)]/40"
      >
        {t.auth.loginButton}
      </Link>
    );
  }

  const { user } = state;
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      resetOnboarding();
      router.replace("/");
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-soft)] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {t.badges.pointsLabel}
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] px-2.5 py-1 text-sm font-bold text-[var(--accent)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
          {fmt(t.common.points, { count: ready ? points : 0 })}
        </span>
      </div>

      <Link
        href="/settings"
        onClick={onNavigate}
        className="mt-3 flex items-center gap-3 rounded-xl px-1 py-1 transition hover:bg-[var(--hover-fill)]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-sm font-semibold text-[var(--accent)]">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--foam)]">
            {displayName}
          </p>
          {user.email ? (
            <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
          ) : null}
        </div>
      </Link>

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--muted)] transition hover:bg-[var(--hover-fill)] hover:text-[var(--foam)]"
      >
        <IconLogout className="h-3.5 w-3.5" />
        {t.auth.signOutButton}
      </button>
    </div>
  );
}

/** @deprecated Use SidebarAccountCard */
export const UserSidebarCard = SidebarAccountCard;
