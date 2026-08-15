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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Progress
          value={index + 1}
          max={questions.length}
          label={t.common.progress}
        />
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[var(--muted)]">
            {fmt(t.games.easy.lives, { count: lives })}
          </span>
          <span
            className={`font-semibold tabular-nums ${
              secondsLeft <= 3 ? "text-[var(--danger-fg)]" : "text-[var(--accent)]"
            }`}
          >
            {secondsLeft}s
          </span>
          {streak > 1 ? (
            <span className="text-[var(--ok-fg)]">
              {fmt(t.games.easy.streak, { count: streak })}
            </span>
          ) : null}
        </div>
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
            let style =
              "border-[var(--line)] hover:border-[var(--accent)] text-left";
            if (revealed) {
              if (i === question.answerIndex) {
                style = "border-[var(--ok-border)] bg-[var(--ok-bg)]";
              } else if (i === selected) {
                style = "border-[var(--danger-border)] bg-[var(--danger-bg)]";
              }
            }
            return (
              <button
                key={option}
                type="button"
                disabled={revealed}
                onClick={() => choose(i)}
                className={`rounded-xl border px-4 py-3 text-sm text-[var(--foam)] transition disabled:opacity-60 ${style}`}
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
