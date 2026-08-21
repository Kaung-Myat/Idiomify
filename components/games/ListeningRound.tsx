"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GameResult } from "@/components/games/GameResult";
import { Progress } from "@/components/ui/Progress";
import { games } from "@/lib/content";
import { pickRandom } from "@/lib/games/utils";
import { fmt } from "@/lib/i18n";
import { isSpeechSynthesisSupported, speakText, stopSpeaking } from "@/lib/speech";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

export function ListeningRound() {
  const t = useT();
  const questions = useMemo(() => pickRandom(games.listening, 6), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [played, setPlayed] = useState(false);
  const completeMediumRound = useLearnerStore((s) => s.completeMediumRound);

  const question = questions[index];
  const revealed = selected !== null;
  const canSpeak = isSpeechSynthesisSupported();

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    stopSpeaking();
  }, [index]);

  function playAudio() {
    if (!canSpeak) return;
    speakText(question.speak);
    setPlayed(true);
  }

  function choose(optionIndex: number) {
    if (revealed || finished || !played) return;
    setSelected(optionIndex);
    if (optionIndex === question.answerIndex) {
      setCorrectCount((c) => c + 1);
    }
  }

  function next() {
    stopSpeaking();
    if (index + 1 >= questions.length) {
      completeMediumRound(correctCount);
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setPlayed(false);
  }

  function restart() {
    stopSpeaking();
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
    setPlayed(false);
  }

  if (finished) {
    return (
      <GameResult
        title={t.games.medium.listeningComplete}
        subtitle={fmt(t.games.medium.listeningResult, {
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
      <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--accent)]">
          {fmt(t.games.medium.listeningQuestion, { number: index + 1 })}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--foam)]">
          {t.games.medium.listeningPrompt}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {t.games.medium.listeningHint}
        </p>

        <Button
          type="button"
          className="mt-5"
          onClick={playAudio}
          disabled={!canSpeak}
        >
          {played ? t.games.medium.replayAudio : t.games.medium.playAudio}
        </Button>

        {!canSpeak ? (
          <p className="mt-3 text-sm text-[var(--danger-fg)]">
            {t.games.medium.audioUnsupported}
          </p>
        ) : !played ? (
          <p className="mt-3 text-sm text-[var(--warn-fg)]">
            {t.games.medium.listenFirst}
          </p>
        ) : null}

        <div className="mt-5 grid gap-2">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={option}
                type="button"
                disabled={!played || revealed}
                onClick={() => choose(i)}
                className={`rounded-xl border px-4 py-3 text-left text-sm text-[var(--foam)] transition disabled:opacity-40 ${
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
