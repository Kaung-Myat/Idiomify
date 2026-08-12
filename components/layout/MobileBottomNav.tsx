"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon, type NavIconKey } from "@/components/layout/NavIcons";
import { useT } from "@/lib/locale-store";

/** Primary tabs — native-style floating dock (5 items). */
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

/** Native-feeling floating bottom navigation (mobile only). */
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
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
      aria-label="Main"
    >
      <div className="pointer-events-auto mx-auto flex max-w-md items-stretch justify-between gap-0.5 rounded-[1.65rem] border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_92%,transparent)] px-1.5 pb-1.5 pt-1.5 shadow-[0_8px_32px_color-mix(in_oklab,var(--foam)_20%,transparent)] backdrop-blur-2xl">
        {MOBILE_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const isCenter = item.key === "practice";

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-0.5 transition active:scale-[0.94] ${
                active ? "text-[var(--accent)]" : "text-[var(--muted)]"
              }`}
            >
              <span
                className={`grid place-items-center rounded-2xl transition ${
                  isCenter
                    ? active
                      ? "mb-0.5 h-12 w-12 -mt-5 bg-[var(--accent)] text-[var(--ink)] shadow-[0_8px_22px_color-mix(in_oklab,var(--accent)_48%,transparent)]"
                      : "mb-0.5 h-12 w-12 -mt-5 bg-[color-mix(in_oklab,var(--accent)_90%,var(--foam))] text-[var(--ink)] shadow-[0_6px_18px_color-mix(in_oklab,var(--accent)_32%,transparent)]"
                    : active
                      ? "h-9 w-9 bg-[color-mix(in_oklab,var(--accent)_16%,transparent)]"
                      : "h-9 w-9"
                }`}
              >
                <NavIcon
                  name={item.key}
                  className={isCenter ? "h-5 w-5" : "h-5 w-5"}
                />
              </span>
              <span
                className={`max-w-full truncate px-0.5 text-[11px] leading-none ${
                  active ? "font-semibold" : "font-medium"
                }`}
              >
                {labels[item.key] ?? item.key}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
