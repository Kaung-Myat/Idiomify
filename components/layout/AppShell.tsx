"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  ConsoleSidebar,
  useConsoleSidebar,
} from "@/components/layout/ConsoleSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { IconSidebarToggle } from "@/components/layout/NavIcons";
import { PointsPill } from "@/components/layout/PointsPill";
import { UserMenu } from "@/components/layout/UserMenu";
import { BadgeUnlockToast } from "@/components/badges/BadgeUnlockToast";
import { ProgressSync } from "@/components/providers/ProgressSync";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { useT } from "@/lib/locale-store";
import { useAuth } from "@/lib/auth/useAuth";

const CONSOLE_PATHS = [
  "/dashboard",
  "/search",
  "/idioms",
  "/practice",
  "/games",
  "/badges",
  "/settings",
];

function isConsoleRoute(pathname: string) {
  return CONSOLE_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isAuthRoute(pathname: string) {
  return pathname.startsWith("/auth/");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const start = useOnboardingStore((s) => s.start);
  const [ready, setReady] = useState(false);
  const { state: authState } = useAuth();
  const nextUrl = useMemo(() => pathname, [pathname]);
  const { desktopOpen, openDesktop, closeDesktop } = useConsoleSidebar();

  const isLanding = pathname === "/";
  const inConsole = isConsoleRoute(pathname);
  const isAuthed = authState.status === "authed";
  const authLoading = authState.status === "loading";

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (isAuthed) start();
  }, [isAuthed, start]);

  useEffect(() => {
    if (!ready || authLoading) return;

    if (isLanding && isAuthed) {
      router.replace("/dashboard");
      return;
    }

    if (inConsole && !isAuthed) {
      const next = encodeURIComponent(nextUrl);
      router.replace(`/auth/login?next=${next}`);
    }
  }, [
    ready,
    authLoading,
    isLanding,
    inConsole,
    isAuthed,
    router,
    nextUrl,
  ]);

  if (isLanding || isAuthRoute(pathname)) {
    return (
      <div className="min-h-screen">
        <ProgressSync />
        <header className="absolute inset-x-0 top-0 z-40">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
            <BrandLogo href="/" size="sm" />
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
              {!isAuthRoute(pathname) ? (
                <UserMenu compact={false} loginNext="/dashboard" />
              ) : null}
            </div>
          </div>
        </header>
        <main
          className={
            isAuthRoute(pathname)
              ? "flex min-h-screen items-center justify-center px-4 pb-8 pt-20"
              : undefined
          }
        >
          {children}
        </main>
      </div>
    );
  }

  // Keep chrome available while auth resolves; only block protected console routes.
  if (inConsole && (authLoading || (!isAuthed && ready))) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--accent)]" />
          <span className="text-sm">{t.app.name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-dvh max-h-dvh overflow-hidden">
      <ProgressSync />
      <ConsoleSidebar desktopOpen={desktopOpen} onCloseDesktop={closeDesktop} />
      <MobileBottomNav />

      {/* Mobile app bar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] pt-[env(safe-area-inset-top)] backdrop-blur-xl md:hidden">
        <div className="flex h-14 items-center gap-2 px-3">
          <div className="min-w-0 flex-1 overflow-hidden">
            <BrandLogo
              href="/dashboard"
              size="sm"
              className="gap-1.5 [&>span]:truncate [&>span]:text-base"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <PointsPill />
            <UserMenu compact />
            <LocaleSwitcher variant="compact" />
          </div>
        </div>
      </header>

      {/* Desktop floating chrome */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden items-start justify-between gap-3 p-3 sm:p-4 md:flex">
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={openDesktop}
            className={`rounded-xl p-2.5 text-[var(--foam)] transition hover:bg-[var(--hover-fill)] ${
              desktopOpen ? "invisible pointer-events-none" : ""
            }`}
            aria-label={t.sidebar.open}
            title={t.sidebar.open}
          >
            <IconSidebarToggle className="h-5 w-5" />
          </button>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <LocaleSwitcher variant="floating" />
        </div>
      </div>

      <div
        className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden transition-[padding] duration-300 ease-out ${
          desktopOpen ? "md:pl-[17.5rem]" : "md:pl-0"
        }`}
      >
        <main className="app-scroll min-h-0 flex-1 overflow-x-auto overflow-y-auto px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[calc(3.5rem+env(safe-area-inset-top))] sm:px-6 md:px-8 md:pb-8 md:pt-8">
          {children}
        </main>
      </div>

      <BadgeUnlockToast />
    </div>
  );
}
