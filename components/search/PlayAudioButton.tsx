"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { speakText, stopSpeaking } from "@/lib/speech";
import { useT } from "@/lib/locale-store";

type Props = {
  text: string;
  /** Prefer remote pronunciation audio when available (Free Dictionary). */
  audioUrl?: string;
  className?: string;
};

const BARS = [0.35, 0.7, 0.45, 0.9, 0.55, 0.8, 0.4, 0.65];

export function PlayAudioButton({
  text,
  audioUrl,
  className = "",
}: Props) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  function stopAll() {
    stopSpeaking();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(false);
  }

  function toggle() {
    if (playing) {
      stopAll();
      return;
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlaying(true);
      audio.onended = () => setPlaying(false);
      audio.onerror = () => {
        // Fallback to speech synthesis if remote audio fails
        setPlaying(true);
        speakText(text, {
          onStart: () => setPlaying(true),
          onEnd: () => setPlaying(false),
        });
      };
      void audio.play().catch(() => {
        speakText(text, {
          onStart: () => setPlaying(true),
          onEnd: () => setPlaying(false),
        });
      });
      return;
    }

    setPlaying(true);
    speakText(text, {
      onStart: () => setPlaying(true),
      onEnd: () => setPlaying(false),
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? t.search.playingAudio : t.search.playAudio}
      className={`min-w-[7.5rem] ${className}`}
    >
      {playing ? (
        <span className="audio-wave flex h-4 items-end gap-[2px]" aria-hidden>
          {BARS.map((base, i) => (
            <span
              key={i}
              className="audio-wave-bar w-[2.5px] rounded-full bg-[var(--accent)]"
              style={{
                height: `${base * 100}%`,
                animationDelay: `${i * 70}ms`,
              }}
            />
          ))}
        </span>
      ) : (
        t.search.playAudio
      )}
    </Button>
  );
}
