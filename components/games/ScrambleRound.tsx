"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GameResult } from "@/components/games/GameResult";
import { Progress } from "@/components/ui/Progress";
import { games } from "@/lib/content";
import { scrambleWords, pickRandom } from "@/lib/games/utils";
import { fmt } from "@/lib/i18n";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

type Tile = { id: string; word: string };

export function ScrambleRound() {
  const t = useT();
  const questions = useMemo(() => pickRandom(games.medium, 5), []);
  const [index, setIndex] = useState(0);
  const [built, setBuilt] = useState<Tile[]>([]);
  const [pool, setPool] = useState<Tile[]>(() =>
    scrambleWords(questions[0].answer).map((word, i) => ({
      id: `${questions[0].id}-${i}-${word}`,
      word,
    })),
  );
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const completeMediumRound = useLearnerStore((s) => s.completeMediumRound);

  const question = questions[index];
  const attempt = built.map((t) => t.word).join(" ");
  const isCorrect = attempt.toLowerCase() === question.answer.toLowerCase();

  function loadQuestion(i: number) {
    const q = questions[i];
    setPool(
      scrambleWords(q.answer).map((word, wi) => ({
        id: `${q.id}-${wi}-${word}`,
        word,
      })),
    );
    setBuilt([]);
    setRevealed(false);
  }

  function pickFromPool(tile: Tile) {
    if (revealed) return;
    setPool((p) => p.filter((x) => x.id !== tile.id));
    setBuilt((b) => [...b, tile]);
  }

  function removeFromBuilt(tile: Tile) {
    if (revealed) return;
    setBuilt((b) => b.filter((x) => x.id !== tile.id));
    setPool((p) => [...p, tile]);
  }

  function check() {
    if (revealed || built.length === 0) return;
    setRevealed(true);
    if (isCorrect) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (index + 1 >= questions.length) {
      completeMediumRound(correctCount);
      setFinished(true);
      return;
    }
    const ni = index + 1;
    setIndex(ni);
    loadQuestion(ni);
  }

  function restart() {
    setIndex(0);
    setCorrectCount(0);
    setFinished(false);
    loadQuestion(0);
  }

  if (finished) {
    return (
      <GameResult
        title={t.games.medium.scrambleComplete}
        subtitle={fmt(t.games.medium.scrambleResult, {
          correct: correctCount,
          total: questions.length,
        })}
        points={correctCount * 20}
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
      <article className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
          {t.games.medium.modeScramble}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl text-[var(--foam)] sm:text-2xl">
          {question.sentence}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {fmt(t.games.medium.hint, { hint: question.hint })}
        </p>

        <div className="mt-5 min-h-[3.25rem] rounded-2xl border border-dashed border-[var(--line)] bg-[var(--card-soft)] px-3 py-3">
          <div className="flex flex-wrap gap-2">
            {built.length === 0 ? (
              <span className="text-sm text-[var(--muted)]">
                {t.games.medium.scrambleBuild}
              </span>
            ) : (
              built.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  disabled={revealed}
                  onClick={() => removeFromBuilt(tile)}
                  className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1.5 text-sm text-[var(--foam)]"
                >
                  {tile.word}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {pool.map((tile) => (
            <button
              key={tile.id}
              type="button"
              disabled={revealed}
              onClick={() => pickFromPool(tile)}
              className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--foam)] transition hover:border-[var(--accent)]"
            >
              {tile.word}
            </button>
          ))}
        </div>

        {revealed ? (
          <p
            className={`mt-4 text-sm ${
              isCorrect ? "text-[var(--ok-fg)]" : "text-[var(--danger-fg)]"
            }`}
          >
            {isCorrect
              ? t.common.correct
              : fmt(t.games.medium.notQuite, { answer: question.answer })}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          {!revealed ? (
            <Button
              type="button"
              onClick={check}
              disabled={built.length === 0}
            >
              {t.common.check}
            </Button>
          ) : (
            <Button type="button" onClick={next}>
              {index + 1 >= questions.length ? t.common.finish : t.common.next}
            </Button>
          )}
        </div>
      </article>
    </div>
  );
}
