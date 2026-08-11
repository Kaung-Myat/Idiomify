"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { NavIcon, IconSidebarToggle, type NavIconKey } from "@/components/layout/NavIcons";
import { SidebarAccountCard } from "@/components/layout/UserMenu";
import { useT } from "@/lib/locale-store";

const NAV: { href: string; key: NavIconKey }[] = [
  { href: "/dashboard", key: "console" },
  { href: "/search", key: "search" },
  { href: "/idioms", key: "idioms" },
  { href: "/practice", key: "practice" },
  { href: "/games", key: "games" },
  { href: "/badges", key: "badges" },
  { href: "/settings", key: "settings" },
];

const DESKTOP_KEY = "idiomify-sidebar-open";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  desktopOpen: boolean;
  onCloseDesktop: () => void;
};

export function ConsoleSidebar({ desktopOpen, onCloseDesktop }: Props) {
  const pathname = usePathname();
  const t = useT();

  const labels: Record<NavIconKey, string> = {
    console: t.nav.console,
    search: t.nav.search,
    idioms: t.nav.idioms,
    practice: t.nav.practice,
    games: t.nav.games,
    badges: t.nav.badges,
    settings: t.nav.settings,
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden w-[17.5rem] flex-col border-r border-[var(--line)] bg-[var(--sidebar-bg)] transition-transform duration-300 ease-out md:flex ${
        desktopOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[var(--line)] px-4 py-4">
        <div className="min-w-0">
          <BrandLogo href="/dashboard" size="sm" />
          <p className="mt-2 text-xs text-[var(--muted)]">{t.app.tagline}</p>
        </div>
        <button
          type="button"
          onClick={onCloseDesktop}
          className="group relative mt-0.5 rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--hover-fill)] hover:text-[var(--foam)]"
          aria-label={t.sidebar.close}
          title={t.sidebar.close}
        >
          <IconSidebarToggle className="h-5 w-5" />
        </button>
      </div>
      <div className="app-scroll min-h-0 flex-1 overflow-y-auto">
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-[var(--hover-fill)] hover:text-[var(--foam)]"
                }`}
              >
                {active ? (
                  <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-[var(--accent)]" />
                ) : null}
                <NavIcon
                  name={item.key}
                  className={`h-[18px] w-[18px] shrink-0 ${active ? "text-[var(--accent)]" : "text-[var(--muted)] group-hover:text-[var(--foam)]"}`}
                />
                <span className="font-medium">{labels[item.key]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto shrink-0 border-t border-[var(--line)] p-3">
        <SidebarAccountCard />
      </div>
    </aside>
  );
}

export function useConsoleSidebar() {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DESKTOP_KEY);
      if (stored === "0") setDesktopOpen(false);
      if (stored === "1") setDesktopOpen(true);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DESKTOP_KEY, desktopOpen ? "1" : "0");
    } catch {
      // ignore
    }
  }, [desktopOpen, hydrated]);

  return {
    desktopOpen,
    openDesktop: () => setDesktopOpen(true),
    closeDesktop: () => setDesktopOpen(false),
    toggleDesktop: () => setDesktopOpen((v) => !v),
  };
}
