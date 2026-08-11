"use client";

import { useEffect, useMemo, useState } from "react";
import { SpeakPanel } from "@/components/practice/SpeakPanel";
import { Button } from "@/components/ui/Button";
import { GameResult } from "@/components/games/GameResult";
import { games } from "@/lib/content";
import { shuffle } from "@/lib/games/utils";
import { fmt } from "@/lib/i18n";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

/** Seconds drop by this amount after each successful phrase. */
const DECREASE = 3;

export function MultiHardRound() {
  const t = useT();
  const challenges = useMemo(() => shuffle(games.multiHard), []);
  const [cIndex, setCIndex] = useState(0);
  const [pIndex, setPIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(
    challenges[0]?.startSeconds ?? 30,
  );
  const [running, setRunning] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const [passedPhrase, setPassedPhrase] = useState(false);
  const [passCount, setPassCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const completeHardAttempt = useLearnerStore((s) => s.completeHardAttempt);
  const recordSpeak = useLearnerStore((s) => s.recordSpeak);

  const challenge = challenges[cIndex];
  const phrase = challenge?.phrases[pIndex] ?? "";
  const totalPhrases = challenges.reduce((n, c) => n + c.phrases.length, 0);

  useEffect(() => {
    if (!running || attempted || finished) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      setAttempted(true);
      setPassedPhrase(false);
      completeHardAttempt(false);
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft, running, attempted, finished, completeHardAttempt]);

  function onScored(accuracy: number) {
    if (attempted || finished) return;
    setAttempted(true);
    setRunning(false);
    recordSpeak(accuracy, false);
    const ok = accuracy >= 80;
    setPassedPhrase(ok);
    completeHardAttempt(ok);
    if (ok) setPassCount((c) => c + 1);
  }

  function nextPhrase() {
    const nextP = pIndex + 1;
    if (nextP < challenge.phrases.length) {
      setPIndex(nextP);
      const nextSeconds = Math.max(
        8,
        challenge.startSeconds - nextP * DECREASE,
      );
      setSecondsLeft(nextSeconds);
      setRunning(true);
      setAttempted(false);
      setPassedPhrase(false);
      return;
    }

    if (cIndex + 1 >= challenges.length) {
      setFinished(true);
      return;
    }

    const nextC = challenges[cIndex + 1];
    setCIndex((i) => i + 1);
    setPIndex(0);
    setSecondsLeft(nextC.startSeconds);
    setRunning(true);
    setAttempted(false);
    setPassedPhrase(false);
  }

  function restart() {
    setCIndex(0);
    setPIndex(0);
    setSecondsLeft(challenges[0].startSeconds);
    setRunning(true);
    setAttempted(false);
    setPassedPhrase(false);
    setPassCount(0);
    setFinished(false);
  }

  if (!challenge) {
    return <p className="text-[var(--muted)]">{t.search.noMatchesTitle}</p>;
  }

  if (finished) {
    return (
      <GameResult
        title={t.games.hard.multiComplete}
        subtitle={fmt(t.games.hard.multiResult, {
          passed: passCount,
          total: totalPhrases,
          points: passCount * 30,
        })}
        onAgain={restart}
        againLabel={t.common.playAgain}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
            {fmt(t.games.hard.multiDrill, {
              challenge: cIndex + 1,
              total: challenges.length,
            })}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {fmt(t.games.hard.phraseOf, {
              current: pIndex + 1,
              total: challenge.phrases.length,
            })}
          </p>
        </div>
        <p
          className={`font-[family-name:var(--font-display)] text-3xl tabular-nums ${
            secondsLeft <= 5 ? "text-[var(--danger-fg)]" : "text-[var(--foam)]"
          }`}
        >
          {secondsLeft}s
        </p>
      </div>

      <p className="text-sm text-[var(--muted)]">{t.games.hard.multiHint}</p>

      <SpeakPanel
        target={phrase}
        showDemoButton
        disabled={attempted || !running}
        onScored={onScored}
      />

      {attempted ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className={`text-sm ${
              passedPhrase ? "text-[var(--ok-fg)]" : "text-[var(--danger-fg)]"
            }`}
          >
            {passedPhrase
              ? t.games.hard.passed
              : secondsLeft <= 0
                ? t.games.hard.timeUp
                : t.games.hard.belowThreshold}
          </p>
          <Button type="button" onClick={nextPhrase}>
            {cIndex + 1 >= challenges.length &&
            pIndex + 1 >= challenge.phrases.length
              ? t.common.finish
              : t.games.hard.nextDrill}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
