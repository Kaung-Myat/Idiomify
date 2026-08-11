"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/auth/PasswordField";
import { useT } from "@/lib/locale-store";
import { useAuth } from "@/lib/auth/useAuth";
import { useOnboardingStore } from "@/lib/onboarding-store";

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const start = useOnboardingStore((s) => s.start);

  const { state, signInWithPassword, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    const oauthErr = searchParams.get("error");
    if (oauthErr) setErr(decodeURIComponent(oauthErr));
    if (searchParams.get("registered") === "1") {
      setInfo(t.auth.signupOk);
    }
  }, [searchParams, t.auth.signupOk]);

  useEffect(() => {
    if (state.status === "authed") {
      start();
      router.replace(next);
    }
  }, [state, router, next, start]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await signInWithPassword(email, password);
      start();
      router.replace(next);
    } catch (e2: unknown) {
      const msg = e2 instanceof Error ? e2.message : "Login failed";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    setGoogleBusy(true);
    try {
      await signInWithGoogle(next);
    } catch (e2: unknown) {
      const msg = e2 instanceof Error ? e2.message : "Google login failed";
      setErr(msg);
      setGoogleBusy(false);
    }
  }

  const busy = submitting || googleBusy || state.status === "loading";

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_85%,transparent)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.svg"
          alt=""
          width={40}
          height={40}
          className="rounded-[22%]"
        />
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
          {t.auth.loginTitle}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {t.auth.loginSubtitle}
        </p>

        <Button
          type="button"
          variant="secondary"
          className="mt-6 flex w-full items-center justify-center gap-3"
          onClick={onGoogle}
          disabled={busy}
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t.auth.googleButton}
        </Button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--line)]" />
          <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
            {t.auth.orEmail}
          </span>
          <div className="h-px flex-1 bg-[var(--line)]" />
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm text-[var(--muted)]">
            {t.auth.emailLabel}
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card-soft)] px-4 py-3 text-[var(--foam)] outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <PasswordField
            label={t.auth.passwordLabel}
            hint={t.auth.passwordHint}
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
          />

          {err ? (
            <p className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
              {err}
            </p>
          ) : null}
          {info ? (
            <p className="rounded-xl border border-[var(--ok-border)] bg-[var(--ok-bg)] px-3 py-2 text-sm text-[var(--ok-fg)]">
              {info}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={busy}>
            {t.auth.loginButton}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          {t.auth.noAccount}{" "}
          <Link
            href={`/auth/signup?next=${encodeURIComponent(next)}`}
            className="font-medium text-[var(--accent)] hover:underline"
          >
            {t.auth.signupLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
