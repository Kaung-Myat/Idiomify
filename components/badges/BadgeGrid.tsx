"use client";

import { useEffect, useState } from "react";
import { badges } from "@/lib/content";
import { badgeLabel } from "@/lib/i18n";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

const BADGE_VISUAL: Record<
  string,
  { accent: string; glyph: string }
> = {
  "first-word": { accent: "#7eb6ff", glyph: "Aa" },
  "perfect-score": { accent: "#f5a623", glyph: "100" },
  "easy-starter": { accent: "#38b2ac", glyph: "E" },
  "game-runner": { accent: "#c4a5ff", glyph: "5" },
  "hard-champion": { accent: "#f07878", glyph: "H" },
  "point-collector": { accent: "#f5a623", glyph: "★" },
  "daily-grinder": { accent: "#38b2ac", glyph: "D" },
};

export function BadgeGrid() {
  const unlocked = useLearnerStore((s) => s.unlockedBadgeIds);
  const t = useT();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--foam)]">
          {t.badges.collectionTitle}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {t.badges.collectionSubtitle}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => {
          const isUnlocked = ready && unlocked.includes(badge.id);
          const label = badgeLabel(t, badge.id);
          const visual = BADGE_VISUAL[badge.id] ?? {
            accent: "var(--accent)",
            glyph: "•",
          };

          return (
            <article
              key={badge.id}
              className={`relative rounded-3xl border p-5 transition ${
                isUnlocked
                  ? "border-[color-mix(in_oklab,var(--foam)_22%,transparent)] bg-[var(--surface)]"
                  : "border-[var(--line)] bg-[var(--card-soft)] opacity-75"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border text-lg font-bold ${
                    isUnlocked ? "" : "grayscale"
                  }`}
                  style={{
                    color: isUnlocked ? visual.accent : "var(--muted)",
                    borderColor: isUnlocked
                      ? `${visual.accent}66`
                      : "var(--line)",
                    background: "var(--card-soft)",
                  }}
                  aria-hidden
                >
                  {visual.glyph}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--foam)]">
                      {label.name}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        isUnlocked
                          ? "bg-[var(--accent)] text-[var(--ink)]"
                          : "bg-[var(--card-soft)] text-[var(--muted)]"
                      }`}
                    >
                      {isUnlocked ? t.badges.unlocked : t.badges.locked}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {label.description}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
