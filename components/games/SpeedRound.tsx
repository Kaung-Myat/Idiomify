"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GameResult } from "@/components/games/GameResult";
import { Progress } from "@/components/ui/Progress";
import { games } from "@/lib/content";
import { pickRandom } from "@/lib/games/utils";
import { fmt } from "@/lib/i18n";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

const SECONDS = 8;
const LIVES = 3;

export function SpeedRound() {
  const t = useT();
  const questions = useMemo(() => pickRandom(games.easy, 8), []);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS);
  const [lives, setLives] = useState(LIVES);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const completeEasyRound = useLearnerStore((s) => s.completeEasyRound);

  const question = questions[index];
  const revealed = selected !== null;

  useEffect(() => {
    if (finished || revealed) return;
    if (secondsLeft <= 0) {
      miss();
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, revealed, finished, index]);

  function finishRound(finalCorrect: number) {
    completeEasyRound(finalCorrect);
    setFinished(true);
  }

  function advance(nextLives: number, nextCorrect: number) {
    if (nextLives <= 0 || index + 1 >= questions.length) {
      finishRound(nextCorrect);
      return;
    }
    setIndex((i) => i + 1);
    setSecondsLeft(SECONDS);
    setSelected(null);
  }

  function miss() {
    const nextLives = lives - 1;
    setLives(nextLives);
    setStreak(0);
    setSelected(-1);
    window.setTimeout(() => advance(nextLives, correctCount), 650);
  }

  function choose(optionIndex: number) {
    if (revealed || finished) return;
    setSelected(optionIndex);
    const ok = optionIndex === question.answerIndex;
    if (ok) {
      const nextCorrect = correctCount + 1;
      const nextStreak = streak + 1;
      setCorrectCount(nextCorrect);
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
      window.setTimeout(() => advance(lives, nextCorrect), 500);
    } else {
      const nextLives = lives - 1;
      setLives(nextLives);
      setStreak(0);
      window.setTimeout(() => advance(nextLives, correctCount), 650);
    }
  }

  function restart() {
    setIndex(0);
    setSecondsLeft(SECONDS);
    setLives(LIVES);
    setCorrectCount(0);
    setSelected(null);
    setFinished(false);
    setStreak(0);
    setBestStreak(0);
  }

  if (finished) {
    return (
      <GameResult
        title={t.games.easy.speedComplete}
        subtitle={fmt(t.games.easy.speedResult, {
          correct: correctCount,
          total: questions.length,
          streak: bestStreak,
        })}
        points={correctCount * 10}
        onAgain={restart}
        againLabel={t.common.playAgain}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            {t.games.easy.livesLabel}
          </p>
          <div
            className="mt-1.5 flex items-center gap-1.5"
            aria-label={fmt(t.games.easy.lives, { count: lives })}
          >
            {Array.from({ length: LIVES }, (_, i) => (
              <span
                key={i}
                className={`inline-block h-4 w-4 rounded-full ${
                  i < lives
                    ? "bg-[var(--accent)]"
                    : "bg-[var(--line)]"
                }`}
              />
            ))}
            <span className="ml-1 text-sm font-semibold tabular-nums text-[var(--foam)]">
              {lives}/{LIVES}
            </span>
          </div>
        </div>
        <p
          className={`font-[family-name:var(--font-display)] text-2xl tabular-nums ${
            secondsLeft <= 3 ? "text-[var(--danger-fg)]" : "text-[var(--accent)]"
          }`}
        >
          {secondsLeft}s
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Progress
            value={index + 1}
            max={questions.length}
            label={t.common.progress}
          />
        </div>
        {streak > 1 ? (
          <span className="shrink-0 text-sm font-semibold text-[var(--ok-fg)]">
            {fmt(t.games.easy.streak, { count: streak })}
          </span>
        ) : null}
      </div>

      <article className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
          {t.games.easy.modeSpeed}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--foam)]">
          {question.prompt}
        </h2>
        <div className="mt-5 grid gap-2">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={option}
                type="button"
                disabled={revealed}
                onClick={() => choose(i)}
                className={`rounded-xl border px-4 py-3 text-left text-sm text-[var(--foam)] transition disabled:opacity-60 ${
                  isSelected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 disabled:opacity-100"
                    : "border-[var(--line)] hover:border-[var(--accent)]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        {revealed && selected === -1 ? (
          <p className="mt-3 text-sm text-[var(--danger-fg)]">{t.games.easy.timeUp}</p>
        ) : null}
      </article>
      <p className="text-center text-xs text-[var(--muted)]">
        {t.games.easy.speedHint}
      </p>
      <div className="hidden">
        <Button type="button" onClick={restart}>
          {t.common.playAgain}
        </Button>
      </div>
    </div>
  );
}
