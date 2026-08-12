"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/locale-store";

function HeroVisual() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Full-bleed atmosphere */}
      <div className="landing-hero-mesh absolute inset-0" />
      <div className="landing-hero-grid absolute inset-0 opacity-[0.35]" />

      {/* Product-context plane: oversized mic + score wave */}
      <div className="anim-float absolute -right-[12%] top-[18%] h-[70vmin] w-[70vmin] opacity-[0.18] sm:opacity-[0.22]">
        <svg viewBox="0 0 320 320" className="h-full w-full" fill="none">
          <circle cx="160" cy="150" r="78" stroke="var(--accent)" strokeWidth="2" />
          <circle cx="160" cy="150" r="108" stroke="var(--foam)" strokeOpacity="0.25" strokeWidth="1.5" />
          <rect x="140" y="88" width="40" height="92" rx="20" fill="var(--foam)" fillOpacity="0.9" />
          <path
            d="M118 150v8c0 23 19 42 42 42s42-19 42-42v-8"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path d="M160 200v36" stroke="var(--foam)" strokeWidth="6" strokeLinecap="round" />
          <path d="M132 236h56" stroke="var(--foam)" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[38%] opacity-50">
        <svg
          viewBox="0 0 1200 220"
          preserveAspectRatio="none"
          className="h-full w-full landing-wave"
        >
          <path
            d="M0 140 C120 90 180 180 300 130 C420 80 480 170 600 120 C720 70 780 160 900 110 C1020 60 1080 150 1200 100 L1200 220 L0 220 Z"
            fill="color-mix(in oklab, var(--accent) 18%, transparent)"
          />
          <path
            d="M0 160 C140 120 200 190 340 150 C480 110 540 190 680 145 C820 100 880 185 1020 140 C1100 115 1160 155 1200 135 L1200 220 L0 220 Z"
            fill="color-mix(in oklab, var(--foam) 8%, transparent)"
          />
        </svg>
      </div>
    </div>
  );
}

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
    <div className="relative">
      {/* Hero — one composition: brand, headline, support, CTA, full-bleed visual */}
      <section className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
        <HeroVisual />

        <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
          <div className="anim-hero-mark">
            <BrandLogo href="" size="lg" className="justify-center gap-3 sm:gap-4 [&>img]:h-14 [&>img]:w-14 sm:[&>img]:h-16 sm:[&>img]:w-16 [&>span]:text-4xl sm:[&>span]:text-5xl" />
          </div>

          <h1 className="anim-hero-title mt-8 text-balance text-2xl font-medium leading-snug tracking-tight text-[var(--foam)] sm:text-3xl md:text-[2rem]">
            {t.home.headline}
          </h1>

          <p className="anim-hero-sub mx-auto mt-4 max-w-lg text-pretty text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            {t.home.subtitle}
          </p>

          <div className="anim-hero-cta mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href={signupHref}>
              <Button
                type="button"
                className="min-w-[9.5rem] px-9 py-3 text-base transition hover:scale-[1.02] active:scale-[0.98]"
              >
                {t.home.getStarted}
              </Button>
            </Link>
            <Link href={loginHref}>
              <Button
                type="button"
                variant="secondary"
                className="min-w-[9.5rem] px-8 py-3 text-base transition hover:scale-[1.02] active:scale-[0.98]"
              >
                {t.auth.loginButton}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About — one job */}
      <section className="relative mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <RevealOnScroll>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Idiomify
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--foam)] sm:text-4xl">
            {t.home.aboutTitle}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
            {t.home.aboutBody}
          </p>
        </RevealOnScroll>
      </section>

      {/* Features — stacked rows, not a card dashboard */}
      <section className="relative border-y border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_55%,transparent)]">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <RevealOnScroll>
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--foam)] sm:text-4xl">
              {t.home.featuresTitle}
            </h2>
          </RevealOnScroll>

          <ul className="mt-12 divide-y divide-[var(--line)]">
            {featureKeys.map((key, index) => {
              const card = t.home.featureCards[key];
              return (
                <RevealOnScroll key={key} delayMs={index * 70}>
                  <li className="group flex gap-5 py-7 first:pt-2 last:pb-2 sm:gap-8">
                    <span
                      className="mt-1 w-8 shrink-0 font-semibold tabular-nums text-[var(--accent)]"
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--foam)] transition group-hover:text-[var(--accent)]">
                        {card.title}
                      </h3>
                      <p className="mt-2 max-w-xl text-[var(--muted)] leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </li>
                </RevealOnScroll>
              );
            })}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="relative mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <RevealOnScroll>
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--foam)] sm:text-4xl">
            {t.home.howTitle}
          </h2>
        </RevealOnScroll>

        <ol className="relative mt-12 space-y-0">
          <div
            className="absolute bottom-3 left-[15px] top-3 w-px bg-[var(--line)] sm:left-[19px]"
            aria-hidden
          />
          {stepKeys.map((key, i) => (
            <RevealOnScroll key={key} delayMs={i * 80}>
              <li className="relative flex gap-5 pb-10 last:pb-0 sm:gap-7">
                <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-sm font-bold text-[var(--ink)] shadow-[0_0_0_6px_color-mix(in_oklab,var(--ink)_88%,transparent)] sm:h-10 sm:w-10">
                  {i + 1}
                </span>
                <p className="pt-1.5 text-[var(--muted)] leading-relaxed sm:pt-2.5">
                  {t.home.steps[key]}
                </p>
              </li>
            </RevealOnScroll>
          ))}
        </ol>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden px-6 pb-24 pt-8 sm:pb-32">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_65%)]" />
        <RevealOnScroll>
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--foam)] sm:text-4xl">
              {t.home.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[var(--muted)] leading-relaxed">
              {t.home.ctaSubtitle}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href={signupHref}>
                <Button
                  type="button"
                  className="min-w-[9.5rem] px-9 py-3 text-base transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t.home.getStarted}
                </Button>
              </Link>
              <Link href={loginHref}>
                <Button type="button" variant="ghost" className="px-8 py-3 text-base">
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
