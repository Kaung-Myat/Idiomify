import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--ink)] hover:brightness-105 shadow-[0_8px_24px_rgba(245,166,35,0.25)]",
  secondary:
    "bg-[var(--surface)] text-[var(--foam)] border border-[var(--line)] hover:border-[var(--accent)]",
  ghost: "bg-transparent text-[var(--foam)] hover:bg-[var(--hover-fill)]",
  danger: "bg-red-500/90 text-white hover:bg-red-500",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
