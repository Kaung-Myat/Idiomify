"use client";

import { useEffect, useMemo, useState } from "react";
import { SpeakPanel } from "@/components/practice/SpeakPanel";
import { Button } from "@/components/ui/Button";
import { GameResult } from "@/components/games/GameResult";
import { games } from "@/lib/content";
import { pickRandom } from "@/lib/games/utils";
import { fmt } from "@/lib/i18n";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

export function HardSpeakRound() {
  const t = useT();
  const prompts = useMemo(() => pickRandom(games.hard, 5), []);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(prompts[0].seconds);
  const [running, setRunning] = useState(true);
  const [passed, setPassed] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [passCount, setPassCount] = useState(0);
  const completeHardAttempt = useLearnerStore((s) => s.completeHardAttempt);
  const recordSpeak = useLearnerStore((s) => s.recordSpeak);

  const prompt = prompts[index];

  useEffect(() => {
    if (!running || attempted || finished) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      setAttempted(true);
      completeHardAttempt(false);
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, running, attempted, finished, completeHardAttempt]);

  function onScored(accuracy: number) {
    if (attempted || finished) return;
    setAttempted(true);
    setRunning(false);
    recordSpeak(accuracy, false);
    const ok = accuracy >= 80;
    setPassed(ok);
    completeHardAttempt(ok);
    if (ok) setPassCount((c) => c + 1);
  }

  function next() {
    if (index + 1 >= prompts.length) {
      setFinished(true);
      return;
    }
    const nextPrompt = prompts[index + 1];
    // Pressure rises: each drill gets a bit less time than the data default.
    const reduced = Math.max(8, nextPrompt.seconds - (index + 1) * 2);
    setIndex((i) => i + 1);
    setSecondsLeft(reduced);
    setRunning(true);
    setPassed(false);
    setAttempted(false);
  }

  function restart() {
    setIndex(0);
    setSecondsLeft(prompts[0].seconds);
    setRunning(true);
    setPassed(false);
    setAttempted(false);
    setFinished(false);
    setPassCount(0);
  }

  if (finished) {
    return (
      <GameResult
        title={t.games.hard.roundComplete}
        subtitle={fmt(t.games.hard.result, {
          passed: passCount,
          total: prompts.length,
        })}
        points={passCount * 30}
        onAgain={restart}
        againLabel={t.common.playAgain}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
        <p className="text-sm text-[var(--muted)]">
          {fmt(t.games.hard.drill, {
            current: index + 1,
            total: prompts.length,
          })}
        </p>
        <p
          className={`font-[family-name:var(--font-display)] text-2xl ${
            secondsLeft <= 5 ? "text-[var(--danger-fg)]" : "text-[var(--accent)]"
          }`}
        >
          {secondsLeft}s
        </p>
      </div>

      <SpeakPanel
        target={prompt.target}
        onScored={onScored}
        disabled={attempted || !running}
        showDemoButton
      />

      {attempted ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-soft)] p-4">
          <p className={passed ? "text-[var(--ok-fg)]" : "text-[var(--danger-fg)]"}>
            {passed
              ? t.games.hard.passed
              : secondsLeft <= 0 && !passed
                ? t.games.hard.timeUp
                : t.games.hard.belowThreshold}
          </p>
          <Button type="button" className="mt-3" onClick={next}>
            {index + 1 >= prompts.length
              ? t.common.finish
              : t.games.hard.nextDrill}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
