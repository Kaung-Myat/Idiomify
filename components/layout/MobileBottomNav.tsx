"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon, type NavIconKey } from "@/components/layout/NavIcons";
import { useT } from "@/lib/locale-store";

/** Primary tabs — Telegram-style density (5 items). */
const MOBILE_NAV: { href: string; key: NavIconKey }[] = [
  { href: "/dashboard", key: "console" },
  { href: "/search", key: "search" },
  { href: "/practice", key: "practice" },
  { href: "/games", key: "games" },
  { href: "/settings", key: "settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Telegram-style floating bottom navigation (mobile only). */
export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useT();

  const labels: Partial<Record<(typeof MOBILE_NAV)[number]["key"], string>> = {
    console: t.nav.console,
    search: t.nav.search,
    practice: t.nav.practice,
    games: t.nav.games,
    settings: t.nav.settings,
  };

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.65rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="Main"
    >
      <div className="pointer-events-auto mx-auto flex max-w-[22rem] items-end justify-between gap-1 rounded-[1.75rem] border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_82%,transparent)] px-2 py-2 shadow-[0_10px_36px_color-mix(in_oklab,var(--foam)_16%,transparent)] backdrop-blur-2xl">
        {MOBILE_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const isCenter = item.key === "practice";

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-0.5 py-1.5 transition active:scale-[0.96] ${
                active
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <span
                className={`grid place-items-center rounded-2xl transition ${
                  isCenter
                    ? active
                      ? "h-11 w-11 -mt-3 bg-[var(--accent)] text-[var(--ink)] shadow-[0_8px_20px_color-mix(in_oklab,var(--accent)_45%,transparent)]"
                      : "h-11 w-11 -mt-3 bg-[color-mix(in_oklab,var(--accent)_88%,var(--foam))] text-[var(--ink)] shadow-[0_6px_16px_color-mix(in_oklab,var(--accent)_30%,transparent)]"
                    : active
                      ? "h-8 w-8 bg-[color-mix(in_oklab,var(--accent)_16%,transparent)]"
                      : "h-8 w-8"
                }`}
              >
                <NavIcon
                  name={item.key}
                  className={isCenter ? "h-5 w-5" : "h-[18px] w-[18px]"}
                />
              </span>
              <span className="max-w-full truncate px-0.5 text-[10px] font-medium leading-tight">
                {labels[item.key] ?? item.key}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
