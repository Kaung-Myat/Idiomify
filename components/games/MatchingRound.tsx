"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GameResult } from "@/components/games/GameResult";
import { Progress } from "@/components/ui/Progress";
import { games } from "@/lib/content";
import { pickRandom, shuffle } from "@/lib/games/utils";
import { fmt } from "@/lib/i18n";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

export function MatchingRound() {
  const t = useT();
  const pairs = useMemo(() => pickRandom(games.matching, 6), []);
  const [leftOrder] = useState(() => shuffle(pairs.map((p) => p.id)));
  const [rightOrder] = useState(() => shuffle(pairs.map((p) => p.id)));
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(() => new Set());
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(
    null,
  );
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const completeEasyRound = useLearnerStore((s) => s.completeEasyRound);

  const byId = useMemo(
    () => Object.fromEntries(pairs.map((p) => [p.id, p])),
    [pairs],
  );

  const progress = matched.size;

  function pickLeft(id: string) {
    if (matched.has(id) || finished) return;
    setWrongPair(null);
    setSelectedLeft(id);
  }

  function pickRight(id: string) {
    if (!selectedLeft || matched.has(id) || finished) return;
    if (selectedLeft === id) {
      const next = new Set(matched);
      next.add(id);
      setMatched(next);
      setSelectedLeft(null);
      setWrongPair(null);
      if (next.size >= pairs.length) {
        completeEasyRound(pairs.length);
        setFinished(true);
      }
      return;
    }
    setMistakes((m) => m + 1);
    setWrongPair({ left: selectedLeft, right: id });
    setSelectedLeft(null);
  }

  function restart() {
    setSelectedLeft(null);
    setMatched(new Set());
    setWrongPair(null);
    setMistakes(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <GameResult
        title={t.games.easy.matchingComplete}
        subtitle={fmt(t.games.easy.matchingResult, {
          correct: pairs.length,
          total: pairs.length,
          mistakes,
        })}
        points={pairs.length * 10}
        onAgain={restart}
        againLabel={t.common.playAgain}
      />
    );
  }

  return (
    <div className="space-y-5">
      <Progress value={progress} max={pairs.length} label={t.common.progress} />
      <p className="text-sm text-[var(--muted)]">{t.games.easy.matchingHint}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            {t.games.easy.matchingTerms}
          </p>
          {leftOrder.map((id) => {
            const done = matched.has(id);
            const active = selectedLeft === id;
            const wrong = wrongPair?.left === id;
            return (
              <button
                key={`l-${id}`}
                type="button"
                disabled={done}
                onClick={() => pickLeft(id)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  done
                    ? "border-[var(--ok-border)] bg-[var(--ok-bg)] text-[var(--ok-fg)]"
                    : active
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foam)]"
                      : wrong
                        ? "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-fg)]"
                        : "border-[var(--line)] text-[var(--foam)] hover:border-[var(--accent)]"
                }`}
              >
                {byId[id]?.term}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            {t.games.easy.matchingDefs}
          </p>
          {rightOrder.map((id) => {
            const done = matched.has(id);
            const wrong = wrongPair?.right === id;
            return (
              <button
                key={`r-${id}`}
                type="button"
                disabled={done || !selectedLeft}
                onClick={() => pickRight(id)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  done
                    ? "border-[var(--ok-border)] bg-[var(--ok-bg)] text-[var(--ok-fg)]"
                    : wrong
                      ? "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-fg)]"
                      : "border-[var(--line)] text-[var(--foam)] hover:border-[var(--accent)] disabled:opacity-40"
                }`}
              >
                {byId[id]?.definition}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
