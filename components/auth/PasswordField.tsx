"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { useT } from "@/lib/locale-store";

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
};

function IconEye({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2.75 2.75 0 0 0 3.8 3.8" />
      <path d="M9.9 5.6A10.4 10.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3.1 3.5" />
      <path d="M6.1 6.1A17.4 17.4 0 0 0 2.5 12S6 18.5 12 18.5c1.1 0 2.1-.2 3.1-.5" />
    </svg>
  );
}

export function PasswordField({
  label,
  hint,
  value,
  onChange,
  id,
  className = "",
  ...inputProps
}: Props) {
  const t = useT();
  const autoId = useId();
  const inputId = id ?? autoId;
  const [visible, setVisible] = useState(false);

  return (
    <label className="block text-sm text-[var(--muted)]" htmlFor={inputId}>
      {label}
      <span className="relative mt-2 block">
        <input
          {...inputProps}
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-[var(--line)] bg-[var(--card-soft)] py-3 pl-4 pr-12 text-[var(--foam)] outline-none ring-[var(--accent)] focus:ring-2 ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--hover-fill)] hover:text-[var(--foam)]"
          aria-label={visible ? t.auth.hidePassword : t.auth.showPassword}
          aria-pressed={visible}
        >
          {visible ? (
            <IconEyeOff className="h-5 w-5" />
          ) : (
            <IconEye className="h-5 w-5" />
          )}
        </button>
      </span>
      {hint ? (
        <span className="mt-1 block text-xs text-[var(--muted)]">{hint}</span>
      ) : null}
    </label>
  );
}
