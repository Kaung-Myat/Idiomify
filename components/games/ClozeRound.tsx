"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { games } from "@/lib/content";
import { fmt } from "@/lib/i18n";
import { normalizeText } from "@/lib/scoring";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

export function ClozeRound() {
  const t = useT();
  const questions = useMemo(() => games.medium, []);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const completeMediumRound = useLearnerStore((s) => s.completeMediumRound);

  const question = questions[index];
  const isCorrect =
    normalizeText(answer) === normalizeText(question.answer);

  function check() {
    if (revealed) return;
    setRevealed(true);
    if (normalizeText(answer) === normalizeText(question.answer)) {
      setCorrectCount((c) => c + 1);
    }
  }

  function next() {
    if (index + 1 >= questions.length) {
      completeMediumRound(correctCount);
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setRevealed(false);
  }

  function restart() {
    setIndex(0);
    setAnswer("");
    setRevealed(false);
    setCorrectCount(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
          {t.games.medium.roundComplete}
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          {fmt(t.games.medium.result, {
            correct: correctCount,
            total: questions.length,
            points: correctCount * 20,
          })}
        </p>
        <Button type="button" className="mt-6" onClick={restart}>
          {t.common.playAgain}
        </Button>
      </div>
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
          {t.games.medium.fillBlank}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--foam)]">
          {question.sentence}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {fmt(t.games.medium.hint, { hint: question.hint })}
        </p>
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={revealed}
          placeholder={t.games.medium.placeholder}
          className="mt-5 w-full rounded-xl border border-[var(--line)] bg-[var(--card-soft)] px-4 py-3 text-[var(--foam)] outline-none ring-[var(--accent)] focus:ring-2"
        />
        {revealed ? (
          <p
            className={`mt-3 text-sm ${
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
            <Button type="button" onClick={check} disabled={!answer.trim()}>
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
