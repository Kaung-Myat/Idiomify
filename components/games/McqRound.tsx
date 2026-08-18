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

export function McqRound() {
  const t = useT();
  const questions = useMemo(() => pickRandom(games.easy, 8), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const completeEasyRound = useLearnerStore((s) => s.completeEasyRound);

  const question = questions[index];
  const revealed = selected !== null;

  function choose(optionIndex: number) {
    if (revealed || finished) return;
    setSelected(optionIndex);
    if (optionIndex === question.answerIndex) {
      setCorrectCount((c) => c + 1);
    }
  }

  function next() {
    if (index + 1 >= questions.length) {
      completeEasyRound(correctCount);
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <GameResult
        title={t.games.easy.roundComplete}
        subtitle={fmt(t.games.easy.result, {
          correct: correctCount,
          total: questions.length,
        })}
        points={correctCount * 10}
        onAgain={restart}
        againLabel={t.common.playAgain}
      />
    );
  }

  return (
    <div className="space-y-5">
      <Progress
        value={index + 1}
        max={questions.length}
        label={t.common.progress}
      />
      <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
          {fmt(t.games.easy.question, { number: index + 1 })}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--foam)]">
          {question.prompt}
        </h2>
        <div className="mt-5 grid gap-2">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={`${question.id}-${i}`}
                type="button"
                disabled={revealed}
                onClick={() => choose(i)}
                className={`rounded-xl border px-4 py-3 text-left text-sm text-[var(--foam)] transition disabled:cursor-default disabled:opacity-100 ${
                  isSelected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {revealed ? (
          <div className="mt-5 flex justify-end">
            <Button type="button" onClick={next}>
              {index + 1 >= questions.length ? t.common.finish : t.common.next}
            </Button>
          </div>
        ) : null}
      </article>
    </div>
  );
}
