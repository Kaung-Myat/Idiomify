"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MicVisualizer } from "@/components/practice/MicVisualizer";
import { TranscriptDiff } from "@/components/practice/TranscriptDiff";
import { demoScore, scoreSpeech } from "@/lib/scoring";
import { feedbackKeyForScore, fmt } from "@/lib/i18n";
import { useT } from "@/lib/locale-store";
import {
  getSpeechRecognition,
  isSpeechSupported,
  speakText,
  type SpeechRecognitionLike,
} from "@/lib/speech";

type Props = {
  target: string;
  onScored?: (accuracy: number, fromDemo: boolean) => void;
  showDemoButton?: boolean;
  disabled?: boolean;
};

export function SpeakPanel({
  target,
  onScored,
  showDemoButton = true,
  disabled = false,
}: Props) {
  const t = useT();
  const [listening, setListening] = useState(false);
  const [recording, setRecording] = useState(false);
  const [pythonBusy, setPythonBusy] = useState(false);
  const voiceLevelRef = useRef(0);
  const [transcript, setTranscript] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const supported = isSpeechSupported();
  const pythonSupported =
    typeof window !== "undefined" &&
    "mediaDevices" in navigator &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    "MediaRecorder" in window;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const pythonChunksRef = useRef<BlobPart[]>([]);
  const stopAutoTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setTranscript("");
    setAccuracy(null);
    setFeedback("");
    setError("");
    setRecording(false);
    setPythonBusy(false);
    voiceLevelRef.current = 0;
  }, [target]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      stopVoiceMeter();
    };
  }, []);

  function stopVoiceMeter(opts?: { snap?: boolean }) {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    analyserRef.current = null;
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    if (opts?.snap) {
      voiceLevelRef.current = 0;
      return;
    }
    // Soft handoff so the visualizer can ease out instead of snapping flat.
    voiceLevelRef.current = Math.min(voiceLevelRef.current, 0.18);
    window.setTimeout(() => {
      voiceLevelRef.current = 0;
    }, 280);
  }

  function startVoiceMeter(stream: MediaStream) {
    stopVoiceMeter({ snap: true });
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        void ctx.resume();
      }
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.82;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      let smoothed = 0;
      let frame = 0;

      const tick = () => {
        const node = analyserRef.current;
        if (!node) return;
        node.getByteFrequencyData(data);
        // Focus on speech-ish mid bands
        let sum = 0;
        const start = 2;
        const end = Math.min(data.length, 64);
        for (let i = start; i < end; i++) sum += data[i];
        const avg = sum / (end - start) / 255;
        const raw = Math.min(1, Math.pow(avg * 2.05, 0.85));
        smoothed = smoothed * 0.62 + raw * 0.38;
        frame += 1;
        // Ref-only updates — MicVisualizer reads this without re-rendering SpeakPanel
        voiceLevelRef.current = smoothed;
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // Visualization is optional — recording still works.
    }
  }

  function localizedFeedback(acc: number, fromDemo = false) {
    const key = feedbackKeyForScore(acc);
    const message = t.feedback[key];
    return fromDemo ? message + t.speak.demoSuffix : message;
  }

  function applyPythonScore(nextTranscript: string, acc: number) {
    setTranscript(nextTranscript);
    setAccuracy(acc);
    setFeedback(localizedFeedback(acc, false));
    onScored?.(acc, false);
  }

  function applyScore(nextTranscript: string, fromDemo = false) {
    const acc = fromDemo
      ? demoScore(target).accuracy
      : scoreSpeech(target, nextTranscript).accuracy;
    setTranscript(fromDemo ? `(demo) ${target}` : nextTranscript);
    setAccuracy(acc);
    setFeedback(localizedFeedback(acc, fromDemo));
    onScored?.(acc, fromDemo);
  }

  function startListening() {
    setError("");
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setError(t.speak.notSupported);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? "";
      applyScore(text, false);
    };
    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? t.speak.micDenied
          : fmt(t.speak.speechError, { error: event.error }),
      );
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function stopPythonRecording() {
    if (stopAutoTimerRef.current) {
      window.clearTimeout(stopAutoTimerRef.current);
      stopAutoTimerRef.current = null;
    }
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      // ignore
    }
    try {
      mediaStreamRef.current?.getTracks().forEach((tr) => tr.stop());
    } catch {
      // ignore
    }
    stopVoiceMeter();
    setRecording(false);
  }

  async function startPythonScore() {
    setError("");

    if (pythonBusy || disabled) return;

    const url =
      process.env.NEXT_PUBLIC_PYTHON_SCORE_URL ||
      "http://localhost:8000/score";

    try {
      setPythonBusy(true);

      if (listening) stopListening();

      if (
        !("mediaDevices" in navigator) ||
        typeof navigator.mediaDevices.getUserMedia !== "function" ||
        !("MediaRecorder" in window)
      ) {
        setError(t.speak.pythonUnsupported);
        if (supported) startListening();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaStreamRef.current = stream;
      startVoiceMeter(stream);

      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
      ];
      const mimeType = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m));

      pythonChunksRef.current = [];
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0)
          pythonChunksRef.current.push(event.data);
      };

      const stopAfterMs = 4000;

      const blobPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          const blobType = recorder.mimeType || "audio/webm";
          resolve(new Blob(pythonChunksRef.current, { type: blobType }));
        };
      });

      recorder.start();
      setRecording(true);
      stopAutoTimerRef.current = window.setTimeout(
        () => stopPythonRecording(),
        stopAfterMs,
      );

      const blob = await blobPromise;
      stopAutoTimerRef.current = null;

      const form = new FormData();
      form.append("target", target);
      form.append("audio", blob, "speech.webm");

      const res = await fetch(url, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        if (res.status >= 500) {
          throw new Error("server");
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const json = (await res.json()) as {
        accuracy?: number;
        transcript?: string;
        error?: string;
      };

      if (typeof json.accuracy !== "number") {
        throw new Error(json.error ?? "Invalid response");
      }

      applyPythonScore(json.transcript ?? target, json.accuracy);
    } catch (err) {
      const message =
        err instanceof TypeError
          ? t.speak.pythonOffline
          : err instanceof Error && err.message === "server"
            ? t.speak.pythonServerError
            : t.speak.pythonFailed;
      setError(message);
      if (supported) startListening();
    } finally {
      setPythonBusy(false);
      setRecording(false);
      mediaRecorderRef.current = null;
      mediaStreamRef.current = null;
      stopVoiceMeter();
    }
  }

  function toggleMic() {
    if (disabled || pythonBusy) return;
    if (recording) {
      stopPythonRecording();
      return;
    }
    if (listening) {
      stopListening();
      return;
    }
    void startPythonScore();
  }

  // Soft waveform while Web Speech is listening (no second mic stream).
  useEffect(() => {
    if (!listening || recording) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      voiceLevelRef.current =
        0.28 +
        Math.sin(elapsed * 5.5) * 0.16 +
        Math.sin(elapsed * 9.2) * 0.1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      voiceLevelRef.current = 0;
    };
  }, [listening, recording]);

  // If the parent disables the panel (Hard timer timeout), ensure recording stops.
  useEffect(() => {
    if (disabled && recording) stopPythonRecording();
  }, [disabled, recording]);

  const isLive = recording || listening;
  const isProcessing = pythonBusy && !recording;

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_6px_20px_color-mix(in_oklab,var(--foam)_6%,transparent)] sm:p-6">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
        {t.speak.targetPhrase}
      </p>
      <p className="mt-2 text-center font-[family-name:var(--font-display)] text-[1.65rem] leading-snug text-[var(--foam)] sm:text-3xl">
        {target}
      </p>

      <div className="mt-7 sm:mt-8">
        <MicVisualizer
          active={isLive}
          processing={isProcessing}
          levelRef={voiceLevelRef}
          disabled={disabled}
          label={t.speak.tapToSpeak}
          stopLabel={t.speak.stop}
          processingLabel={t.speak.processing}
          onClick={toggleMic}
        />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 w-full sm:w-auto"
          onClick={() => speakText(target)}
          disabled={disabled || pythonBusy || isLive}
        >
          {t.speak.hearReference}
        </Button>
        {showDemoButton ? (
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 w-full sm:w-auto"
            disabled={disabled || pythonBusy || isLive}
            onClick={() => applyScore(target, true)}
          >
            {t.speak.demoMode}
          </Button>
        ) : null}
      </div>

      {!pythonSupported && !supported ? (
        <p className="mt-3 text-center text-sm text-[var(--warn-fg)]">
          {t.speak.unsupported}
        </p>
      ) : null}
      {error ? (
        <div className="mt-4 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          <p>{error}</p>
          <p className="mt-1 text-xs opacity-80">{t.speak.errorHint}</p>
        </div>
      ) : null}

      {accuracy !== null ? (
        <div className="mt-6 space-y-4 border-t border-[var(--line)] pt-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
            <div
              className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-4 border-[var(--accent)] font-[family-name:var(--font-display)] text-2xl text-[var(--foam)]"
              aria-label={fmt(t.speak.matchAccuracy, { accuracy })}
            >
              {accuracy}%
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">{t.speak.matchScore}</p>
              <p className="mt-1 text-[var(--foam)]">{feedback}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {t.speak.scoringNote}
              </p>
            </div>
          </div>
          {transcript ? (
            <TranscriptDiff target={target} transcript={transcript} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
