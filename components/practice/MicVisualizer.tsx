"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { IconMic, IconStop } from "@/components/layout/NavIcons";

type Props = {
  active: boolean;
  processing?: boolean;
  /** 0–1 voice level; prefer levelRef to avoid parent re-renders */
  level?: number;
  levelRef?: MutableRefObject<number>;
  disabled?: boolean;
  label: string;
  stopLabel: string;
  processingLabel: string;
  onClick: () => void;
};

const BAR_COUNT = 28;
const BAR_MAX_PX = 56;

function barScale(i: number, level: number, phase: number, live: boolean) {
  const center = (BAR_COUNT - 1) / 2;
  const dist = Math.abs(i - center) / center;
  const envelope = 1 - dist * 0.72;
  const wave =
    Math.sin(i * 0.48 + phase) * 0.5 +
    Math.sin(i * 0.91 - phase * 1.35) * 0.28 +
    0.5;
  if (!live) {
    return 0.1 + (i % 3) * 0.025;
  }
  const idle = 0.16 + wave * 0.1;
  return Math.min(1, idle + level * envelope * (0.5 + wave * 0.5));
}

export function MicVisualizer({
  active,
  processing = false,
  level = 0,
  levelRef: externalLevelRef,
  disabled = false,
  label,
  stopLabel,
  processingLabel,
  onClick,
}: Props) {
  const [visualLive, setVisualLive] = useState(active);
  const levelRef = useRef(level);
  const activeRef = useRef(active);
  const visualLiveRef = useRef(visualLive);
  const smoothRef = useRef(0);
  const phaseRef = useRef(0);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ring1Ref = useRef<HTMLSpanElement | null>(null);
  const ring2Ref = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  levelRef.current = externalLevelRef?.current ?? level;
  activeRef.current = active;
  visualLiveRef.current = visualLive;

  useEffect(() => {
    if (active) {
      setVisualLive(true);
      return;
    }
    const timer = window.setTimeout(() => setVisualLive(false), 420);
    return () => window.clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    const paintIdle = () => {
      for (let i = 0; i < BAR_COUNT; i++) {
        const el = barRefs.current[i];
        if (!el) continue;
        const scale = barScale(i, 0, 0, false);
        el.style.transform = `scaleY(${scale})`;
        el.style.opacity = "0.2";
      }
      if (ring1Ref.current) ring1Ref.current.style.opacity = "0";
      if (ring2Ref.current) ring2Ref.current.style.opacity = "0";
    };

    const tick = () => {
      const source = externalLevelRef?.current ?? levelRef.current;
      const isActive = activeRef.current;
      const goal = isActive ? Math.min(1, Math.max(0, source)) : 0;
      const alpha = isActive ? 0.28 : 0.12;
      smoothRef.current += (goal - smoothRef.current) * alpha;
      if (smoothRef.current < 0.002) smoothRef.current = 0;

      const live =
        isActive || smoothRef.current > 0.01 || visualLiveRef.current;
      phaseRef.current += live ? 0.07 + smoothRef.current * 0.14 : 0;
      const lvl = smoothRef.current;

      for (let i = 0; i < BAR_COUNT; i++) {
        const el = barRefs.current[i];
        if (!el) continue;
        const scale = barScale(i, lvl, phaseRef.current, live);
        el.style.transform = `scaleY(${scale})`;
        el.style.opacity = String(live ? 0.4 + scale * 0.6 : 0.2);
      }

      if (ring1Ref.current) {
        ring1Ref.current.style.opacity = live
          ? String(0.28 + lvl * 0.45)
          : "0";
      }
      if (ring2Ref.current) {
        ring2Ref.current.style.opacity = live
          ? String(0.16 + lvl * 0.4)
          : "0";
      }

      if (live) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        runningRef.current = false;
        paintIdle();
      }
    };

    const startLoop = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    };

    if (active || visualLive) startLoop();
    else paintIdle();

    return () => {
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
    };
  }, [active, visualLive, externalLevelRef]);

  const ariaLabel = processing
    ? processingLabel
    : active
      ? stopLabel
      : label;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative grid place-items-center">
        <span
          ref={ring1Ref}
          className="mic-ring mic-ring-1"
          style={{ opacity: 0 }}
          aria-hidden
        />
        <span
          ref={ring2Ref}
          className="mic-ring mic-ring-2"
          style={{ opacity: 0 }}
          aria-hidden
        />

        <button
          type="button"
          onClick={onClick}
          disabled={disabled || processing}
          aria-pressed={active}
          aria-label={ariaLabel}
          className={`relative z-10 grid h-[5.5rem] w-[5.5rem] place-items-center rounded-full transition-[background-color,box-shadow,transform,color,border-radius] duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 sm:h-24 sm:w-24 ${
            active
              ? "scale-[1.02] bg-[var(--danger-fg)] text-white shadow-[0_0_0_6px_color-mix(in_oklab,var(--danger-fg)_28%,transparent)]"
              : "bg-[var(--accent)] text-[var(--ink)] shadow-[0_12px_40px_color-mix(in_oklab,var(--accent)_35%,transparent)] hover:brightness-105 active:scale-[0.97]"
          }`}
        >
          {processing ? (
            <span className="mic-spin h-8 w-8 rounded-full border-2 border-current/25 border-t-current" />
          ) : active ? (
            <IconStop className="h-8 w-8" aria-hidden />
          ) : (
            <IconMic className="h-9 w-9" aria-hidden />
          )}
        </button>
      </div>

      <div
        className="flex h-14 items-end justify-center gap-[3px]"
        aria-hidden
      >
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <span
            key={i}
            ref={(el) => {
              barRefs.current[i] = el;
            }}
            className="mic-bar w-[3px] rounded-full bg-[var(--accent)]"
            style={{
              height: `${BAR_MAX_PX}px`,
              transform: "scaleY(0.12)",
              opacity: 0.22,
            }}
          />
        ))}
      </div>

      {processing ? (
        <p className="rounded-full border border-[var(--line)] bg-[var(--hover-fill)] px-4 py-2 text-sm text-[var(--muted)]">
          {processingLabel}
        </p>
      ) : active ? (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="inline-flex min-h-11 min-w-[8.5rem] items-center justify-center gap-2 rounded-full border border-[var(--danger-border)] bg-[var(--danger-bg)] px-5 text-sm font-semibold text-[var(--danger-fg)] shadow-sm transition active:scale-[0.98] hover:brightness-105 disabled:opacity-50"
        >
          <IconStop className="h-3.5 w-3.5" aria-hidden />
          {stopLabel}
        </button>
      ) : (
        <p className="max-w-[16rem] text-center text-sm text-[var(--muted)]">
          {label}
        </p>
      )}
    </div>
  );
}
