"use client";

import Link from "next/link";
import { useT } from "@/lib/locale-store";

type Props = {
  href?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: { mark: 28, text: "text-lg" },
  md: { mark: 36, text: "text-xl" },
  lg: { mark: 56, text: "text-4xl sm:text-5xl" },
} as const;

export function BrandLogo({
  href = "/",
  showWordmark = true,
  size = "md",
  className = "",
}: Props) {
  const t = useT();
  const dim = SIZES[size];

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.svg"
        alt=""
        width={dim.mark}
        height={dim.mark}
        className="shrink-0 rounded-[22%] shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      />
      {showWordmark ? (
        <span
          className={`font-[family-name:var(--font-display)] font-semibold tracking-tight text-[var(--foam)] ${dim.text}`}
        >
          {t.app.name}
          <span className="text-[var(--accent)]">.</span>
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="group transition hover:opacity-95">
      {content}
    </Link>
  );
}
