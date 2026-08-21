"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GameResult } from "@/components/games/GameResult";
import { Progress } from "@/components/ui/Progress";
import { games } from "@/lib/content";
import { normalizeAnswer, pickRandom } from "@/lib/games/utils";
import { fmt } from "@/lib/i18n";
import { isSpeechSynthesisSupported, speakText, stopSpeaking } from "@/lib/speech";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

export function DictationRound() {
  const t = useT();
  const questions = useMemo(() => pickRandom(games.listening, 5), []);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [played, setPlayed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const completeMediumRound = useLearnerStore((s) => s.completeMediumRound);

  const question = questions[index];
  const canSpeak = isSpeechSynthesisSupported();

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    stopSpeaking();
  }, [index]);

  function play() {
    if (!canSpeak) return;
    speakText(question.speak);
    setPlayed(true);
  }

  function next() {
    if (!played || !answer.trim()) return;
    stopSpeaking();
    const ok = normalizeAnswer(answer) === normalizeAnswer(question.speak);
    const nextCorrect = correctCount + (ok ? 1 : 0);
    if (index + 1 >= questions.length) {
      completeMediumRound(nextCorrect);
      setCorrectCount(nextCorrect);
      setFinished(true);
      return;
    }
    setCorrectCount(nextCorrect);
    setIndex((i) => i + 1);
    setAnswer("");
    setPlayed(false);
  }

  function restart() {
    stopSpeaking();
    setIndex(0);
    setAnswer("");
    setPlayed(false);
    setCorrectCount(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <GameResult
        title={t.games.medium.dictationComplete}
        subtitle={fmt(t.games.medium.dictationResult, {
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
          {t.games.medium.modeDictation}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--foam)]">
          {t.games.medium.dictationPrompt}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {t.games.medium.dictationHint}
        </p>

        <Button
          type="button"
          className="mt-5"
          onClick={play}
          disabled={!canSpeak}
        >
          {played ? t.games.medium.replayAudio : t.games.medium.playAudio}
        </Button>

        {!canSpeak ? (
          <p className="mt-3 text-sm text-[var(--danger-fg)]">
            {t.games.medium.audioUnsupported}
          </p>
        ) : null}

        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!played}
          placeholder={t.games.medium.dictationPlaceholder}
          className="mt-5 w-full rounded-xl border border-[var(--line)] bg-[var(--card-soft)] px-4 py-3 text-[var(--foam)] outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-50"
        />

        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            onClick={next}
            disabled={!played || !answer.trim()}
          >
            {index + 1 >= questions.length ? t.common.finish : t.common.next}
          </Button>
        </div>
      </article>
    </div>
  );
}
