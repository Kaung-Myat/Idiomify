"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GameResult } from "@/components/games/GameResult";
import { Progress } from "@/components/ui/Progress";
import { SpeakPanel } from "@/components/practice/SpeakPanel";
import { games } from "@/lib/content";
import {
  hashString,
  mulberry32,
  normalizeAnswer,
  scrambleWords,
  shuffleWith,
  todayKey,
} from "@/lib/games/utils";
import { fmt } from "@/lib/i18n";
import { speakText } from "@/lib/speech";
import { useDailyScoresStore } from "@/lib/daily-scores-store";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";
import { submitDailyScore } from "@/lib/leaderboard";
import { getUserDisplayName, useAuth } from "@/lib/auth/useAuth";

type Step =
  | {
      kind: "mcq";
      id: string;
      prompt: string;
      options: string[];
      answerIndex: number;
    }
  | {
      kind: "cloze";
      id: string;
      sentence: string;
      answer: string;
      hint: string;
    }
  | {
      kind: "scramble";
      id: string;
      answer: string;
      hint: string;
      tiles: string[];
    }
  | { kind: "dictation"; id: string; speak: string }
  | { kind: "speak"; id: string; target: string };

function buildDailySteps(dateKey: string): Step[] {
  const rand = mulberry32(hashString(`idiomify-daily-${dateKey}`));
  const easy = shuffleWith(games.easy, rand);
  const medium = shuffleWith(games.medium, rand);
  const listening = shuffleWith(games.listening, rand);
  const hard = shuffleWith(games.hard, rand);

  const mcq = easy[0];
  const cloze = medium[0];
  const scrambleSrc = medium[1] ?? medium[0];
  const dictation = listening[0];
  const speak = hard[0];

  return [
    {
      kind: "mcq",
      id: mcq.id,
      prompt: mcq.prompt,
      options: mcq.options,
      answerIndex: mcq.answerIndex,
    },
    {
      kind: "cloze",
      id: cloze.id,
      sentence: cloze.sentence,
      answer: cloze.answer,
      hint: cloze.hint,
    },
    {
      kind: "scramble",
      id: scrambleSrc.id,
      answer: scrambleSrc.answer,
      hint: scrambleSrc.hint,
      tiles: scrambleWords(scrambleSrc.answer, rand),
    },
    {
      kind: "dictation",
      id: dictation.id,
      speak: dictation.speak,
    },
    {
      kind: "speak",
      id: speak.id,
      target: speak.target,
    },
  ];
}

export function DailyChallengeRound() {
  const t = useT();
  const dateKey = todayKey();
  const steps = useMemo(() => buildDailySteps(dateKey), [dateKey]);
  const { state: auth } = useAuth();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [built, setBuilt] = useState<string[]>([]);
  const [pool, setPool] = useState<string[]>([]);
  const [played, setPlayed] = useState(false);
  const completeDailyChallenge = useLearnerStore((s) => s.completeDailyChallenge);
  const recordSpeak = useLearnerStore((s) => s.recordSpeak);
  const saveLocal = useDailyScoresStore((s) => s.saveToday);
  const todayBest = useDailyScoresStore((s) => s.bestFor(dateKey));

  const step = steps[index];

  useEffect(() => {
    setRevealed(false);
    setSelected(null);
    setTextAnswer("");
    setPlayed(false);
    if (step.kind === "scramble") {
      setPool([...step.tiles]);
      setBuilt([]);
    } else {
      setPool([]);
      setBuilt([]);
    }
  }, [index, step]);

  function awardAndAdvance(points: number) {
    const nextScore = score + points;
    setScore(nextScore);
    if (index + 1 >= steps.length) {
      completeDailyChallenge(nextScore);
      saveLocal(dateKey, nextScore);
      const displayName =
        auth.status === "authed" ? getUserDisplayName(auth.user) : "Guest";
      void submitDailyScore({
        dateKey,
        score: nextScore,
        displayName,
        userId: auth.status === "authed" ? auth.user.id : null,
      });
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
  }

  function checkMcq(i: number) {
    if (revealed || step.kind !== "mcq") return;
    setSelected(i);
    setRevealed(true);
    const ok = i === step.answerIndex;
    window.setTimeout(() => awardAndAdvance(ok ? 20 : 0), 500);
  }

  function checkText(expected: string, pts: number) {
    if (revealed) return;
    setRevealed(true);
    const ok = normalizeAnswer(textAnswer) === normalizeAnswer(expected);
    window.setTimeout(() => awardAndAdvance(ok ? pts : 0), 600);
  }

  function checkScramble() {
    if (revealed || step.kind !== "scramble") return;
    setRevealed(true);
    const ok =
      normalizeAnswer(built.join(" ")) === normalizeAnswer(step.answer);
    window.setTimeout(() => awardAndAdvance(ok ? 25 : 0), 600);
  }

  function onSpeak(accuracy: number) {
    if (revealed || step.kind !== "speak") return;
    setRevealed(true);
    recordSpeak(accuracy, false);
    window.setTimeout(
      () => awardAndAdvance(accuracy >= 80 ? 40 : Math.round(accuracy / 4)),
      500,
    );
  }

  function restart() {
    setIndex(0);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    const pointsEarned = Math.max(10, Math.round(score / 2));
    return (
      <GameResult
        title={t.games.daily.complete}
        subtitle={fmt(t.games.daily.result, {
          score,
          best: Math.max(todayBest, score),
        })}
        points={pointsEarned}
        onAgain={restart}
        againLabel={t.common.playAgain}
        extra={
          <p className="mt-3 text-sm text-[var(--muted)]">
            {t.games.daily.leaderboardHint}
          </p>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Progress
          value={index + 1}
          max={steps.length}
          label={t.games.daily.progress}
        />
        <p className="text-sm font-semibold text-[var(--accent)]">
          {fmt(t.games.daily.scoreLabel, { score })}
        </p>
      </div>

      {step.kind === "mcq" ? (
        <article className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
            {t.games.daily.stepMcq}
          </p>
          <h2 className="mt-2 text-xl text-[var(--foam)]">{step.prompt}</h2>
          <div className="mt-4 grid gap-2">
            {step.options.map((opt, i) => {
              const isSelected = selected === i;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={revealed}
                  onClick={() => checkMcq(i)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm text-[var(--foam)] transition disabled:opacity-100 ${
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--line)] hover:border-[var(--accent)]"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </article>
      ) : null}

      {step.kind === "cloze" ? (
        <article className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
            {t.games.daily.stepCloze}
          </p>
          <h2 className="mt-2 text-xl text-[var(--foam)]">{step.sentence}</h2>
          <input
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={revealed}
            className="mt-4 w-full rounded-xl border border-[var(--line)] bg-[var(--card-soft)] px-4 py-3 text-[var(--foam)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
            placeholder={t.games.medium.placeholder}
          />
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              disabled={revealed || !textAnswer.trim()}
              onClick={() => checkText(step.answer, 25)}
            >
              {t.common.check}
            </Button>
          </div>
        </article>
      ) : null}

      {step.kind === "scramble" ? (
        <article className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
            {t.games.daily.stepScramble}
          </p>
          <div className="mt-4 flex min-h-12 flex-wrap gap-2 rounded-2xl border border-dashed border-[var(--line)] p-3">
            {built.map((w, i) => (
              <button
                key={`${w}-${i}`}
                type="button"
                disabled={revealed}
                onClick={() => {
                  setBuilt((b) => b.filter((_, j) => j !== i));
                  setPool((p) => [...p, w]);
                }}
                className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1.5 text-sm"
              >
                {w}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {pool.map((w, i) => (
              <button
                key={`${w}-p-${i}`}
                type="button"
                disabled={revealed}
                onClick={() => {
                  setPool((p) => p.filter((_, j) => j !== i));
                  setBuilt((b) => [...b, w]);
                }}
                className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-sm"
              >
                {w}
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              disabled={revealed || built.length === 0}
              onClick={checkScramble}
            >
              {t.common.check}
            </Button>
          </div>
        </article>
      ) : null}

      {step.kind === "dictation" ? (
        <article className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
            {t.games.daily.stepDictation}
          </p>
          <Button
            type="button"
            className="mt-4"
            onClick={() => {
              speakText(step.speak);
              setPlayed(true);
            }}
          >
            {played ? t.games.medium.replayAudio : t.games.medium.playAudio}
          </Button>
          <input
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={!played || revealed}
            className="mt-4 w-full rounded-xl border border-[var(--line)] bg-[var(--card-soft)] px-4 py-3 text-[var(--foam)] outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
            placeholder={t.games.medium.dictationPlaceholder}
          />
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              disabled={!played || revealed || !textAnswer.trim()}
              onClick={() => checkText(step.speak, 30)}
            >
              {t.common.next}
            </Button>
          </div>
        </article>
      ) : null}

      {step.kind === "speak" ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
            {t.games.daily.stepSpeak}
          </p>
          <SpeakPanel
            target={step.target}
            showDemoButton
            disabled={revealed}
            onScored={onSpeak}
          />
        </div>
      ) : null}
    </div>
  );
}
