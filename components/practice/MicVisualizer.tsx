"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { IconMic } from "@/components/layout/NavIcons";

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

  const status = processing
    ? processingLabel
    : active
      ? stopLabel
      : label;

  return (
    <div className="flex flex-col items-center gap-5">
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
          aria-label={status}
          className={`relative z-10 grid h-24 w-24 place-items-center rounded-full transition-[background-color,box-shadow,transform,color] duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 ${
            active
              ? "scale-[1.02] bg-red-500 text-white shadow-[0_0_0_6px_rgba(239,68,68,0.22)]"
              : "bg-[var(--accent)] text-[var(--ink)] shadow-[0_12px_40px_rgba(245,166,35,0.35)] hover:brightness-105 active:scale-[0.98]"
          }`}
        >
          {processing ? (
            <span className="mic-spin h-8 w-8 rounded-full border-2 border-current/25 border-t-current" />
          ) : (
            <IconMic className="h-9 w-9 transition-transform duration-300" aria-hidden />
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

      <p
        className={`text-sm transition-colors duration-300 ${
          active || processing
            ? "text-[var(--accent)]"
            : "text-[var(--muted)]"
        }`}
      >
        {status}
      </p>
    </div>
  );
}
