"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/locale-store";

export default function LandingPage() {
  const t = useT();

  const featureKeys = [
    "pronunciation",
    "idioms",
    "games",
    "badges",
  ] as const;

  const stepKeys = ["1", "2", "3", "4"] as const;
  const signupHref = "/auth/signup?next=%2Fdashboard";
  const loginHref = "/auth/login?next=%2Fdashboard";

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 anim-glow"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, rgba(245,166,35,0.22), transparent 40%), radial-gradient(circle at 90% 80%, rgba(56,178,172,0.14), transparent 45%)",
        }}
      />

      {/* Hero */}
      <section className="relative mx-auto flex min-h-[90vh] max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
        <div className="anim-hero-mark anim-float mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.svg"
            alt=""
            width={88}
            height={88}
            className="mx-auto rounded-[22%] shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          />
        </div>

        <div className="anim-hero-title">
          <BrandLogo href="" size="lg" className="justify-center" />
        </div>

        <h1 className="anim-hero-title mt-6 max-w-2xl text-2xl text-[var(--foam)] sm:text-3xl">
          {t.home.headline}
        </h1>
        <p className="anim-hero-sub mx-auto mt-4 max-w-xl text-[var(--muted)]">
          {t.home.subtitle}
        </p>
        <div className="anim-hero-cta mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href={signupHref}>
            <Button
              type="button"
              className="px-10 py-3 text-base transition hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.home.getStarted}
            </Button>
          </Link>
          <Link href={loginHref}>
            <Button
              type="button"
              variant="secondary"
              className="px-8 py-3 text-base transition hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.auth.loginButton}
            </Button>
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <RevealOnScroll>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-12">
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
              {t.home.aboutTitle}
            </h2>
            <p className="mt-4 max-w-3xl text-[var(--muted)] leading-relaxed">
              {t.home.aboutBody}
            </p>
          </div>
        </RevealOnScroll>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <RevealOnScroll>
          <h2 className="text-center font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
            {t.home.featuresTitle}
          </h2>
        </RevealOnScroll>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {featureKeys.map((key, index) => {
            const card = t.home.featureCards[key];
            return (
              <RevealOnScroll key={key} delayMs={index * 90}>
                <article className="h-full rounded-2xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_80%,transparent)] p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/40 hover:bg-[var(--hover-fill)]">
                  <h3 className="text-lg font-semibold text-[var(--foam)]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {card.description}
                  </p>
                </article>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <RevealOnScroll>
          <h2 className="text-center font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
            {t.home.howTitle}
          </h2>
        </RevealOnScroll>
        <ol className="mx-auto mt-10 max-w-2xl space-y-4">
          {stepKeys.map((key, i) => (
            <RevealOnScroll key={key} delayMs={i * 100}>
              <li className="flex gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 transition duration-300 hover:border-[var(--accent)]/35">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-sm font-bold text-[var(--ink)]">
                  {i + 1}
                </span>
                <p className="text-[var(--muted)]">{t.home.steps[key]}</p>
              </li>
            </RevealOnScroll>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 py-20 pb-28">
        <RevealOnScroll>
          <div className="rounded-[2rem] border border-[var(--accent)]/30 bg-[var(--surface)] px-8 py-12 text-center shadow-[0_20px_50px_color-mix(in_oklab,var(--foam)_12%,transparent)]">
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
              {t.home.ctaTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[var(--muted)]">
              {t.home.ctaSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href={signupHref}>
                <Button
                  type="button"
                  className="px-10 py-3 text-base transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t.home.getStarted}
                </Button>
              </Link>
              <Link href={loginHref}>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-8 py-3 text-base"
                >
                  {t.auth.loginButton}
                </Button>
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
