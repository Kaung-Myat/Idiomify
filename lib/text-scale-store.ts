"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const TEXT_SCALE_MIN = 0.85;
export const TEXT_SCALE_MAX = 1.3;
export const TEXT_SCALE_STEP = 0.05;
export const TEXT_SCALE_DEFAULT = 1;

const STORAGE_KEY = "idiomify-text-scale";

type TextScaleStore = {
  scale: number;
  setScale: (scale: number) => void;
};

function clampScale(value: number) {
  const stepped =
    Math.round(value / TEXT_SCALE_STEP) * TEXT_SCALE_STEP;
  return Math.min(
    TEXT_SCALE_MAX,
    Math.max(TEXT_SCALE_MIN, Number(stepped.toFixed(2))),
  );
}

export function applyTextScaleToDocument(scale: number) {
  if (typeof document === "undefined") return;
  const next = clampScale(scale);
  document.documentElement.style.setProperty("--text-scale", String(next));
  document.documentElement.style.fontSize = `${next * 100}%`;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // ignore
  }
}

export function readStoredTextScale(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return TEXT_SCALE_DEFAULT;
    const n = Number(raw);
    if (Number.isFinite(n)) return clampScale(n);
  } catch {
    // ignore
  }
  return TEXT_SCALE_DEFAULT;
}

export const useTextScaleStore = create<TextScaleStore>()(
  persist(
    (set) => ({
      scale: TEXT_SCALE_DEFAULT,
      setScale: (scale) => {
        const next = clampScale(scale);
        applyTextScaleToDocument(next);
        set({ scale: next });
      },
    }),
    {
      name: "idiomify-text-scale-store",
      partialize: (s) => ({ scale: s.scale }),
      onRehydrateStorage: () => (state) => {
        if (state?.scale) applyTextScaleToDocument(state.scale);
      },
    },
  ),
);
