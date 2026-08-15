"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GameResult } from "@/components/games/GameResult";
import { Progress } from "@/components/ui/Progress";
import { games } from "@/lib/content";
import { pickRandom } from "@/lib/games/utils";
import { fmt } from "@/lib/i18n";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

export function FlashcardRound() {
  const t = useT();
  const deck = useMemo(() => pickRandom(games.matching, 6), []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [finished, setFinished] = useState(false);
  const completeEasyRound = useLearnerStore((s) => s.completeEasyRound);

  const card = deck[index];

  function mark(know: boolean) {
    const nextKnown = known + (know ? 1 : 0);
    if (know) setKnown(nextKnown);
    if (index + 1 >= deck.length) {
      completeEasyRound(nextKnown);
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setFlipped(false);
  }

  function restart() {
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <GameResult
        title={t.games.easy.flashComplete}
        subtitle={fmt(t.games.easy.flashResult, {
          correct: known,
          total: deck.length,
        })}
        points={known * 10}
        onAgain={restart}
        againLabel={t.common.playAgain}
      />
    );
  }

  return (
    <div className="space-y-5">
      <Progress value={index + 1} max={deck.length} label={t.common.progress} />
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="relative min-h-[220px] w-full rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center transition hover:border-[var(--accent)]/50"
      >
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
          {flipped ? t.games.easy.flashBack : t.games.easy.flashFront}
        </p>
        <p className="mt-6 font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
          {flipped ? card.definition : card.term}
        </p>
        <p className="mt-6 text-sm text-[var(--muted)]">
          {t.games.easy.flashTap}
        </p>
      </button>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={!flipped}
          onClick={() => mark(false)}
        >
          {t.games.easy.flashStillLearning}
        </Button>
        <Button type="button" disabled={!flipped} onClick={() => mark(true)}>
          {t.games.easy.flashGotIt}
        </Button>
      </div>
    </div>
  );
}
