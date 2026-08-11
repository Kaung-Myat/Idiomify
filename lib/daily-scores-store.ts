"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type DailyEntry = {
  dateKey: string;
  score: number;
  updatedAt: number;
};

type DailyScoresStore = {
  entries: DailyEntry[];
  saveToday: (dateKey: string, score: number) => void;
  bestFor: (dateKey: string) => number;
};

export const useDailyScoresStore = create<DailyScoresStore>()(
  persist(
    (set, get) => ({
      entries: [],
      saveToday: (dateKey, score) => {
        const existing = get().entries.find((e) => e.dateKey === dateKey);
        if (existing && existing.score >= score) return;
        const rest = get().entries.filter((e) => e.dateKey !== dateKey);
        set({
          entries: [
            { dateKey, score, updatedAt: Date.now() },
            ...rest,
          ].slice(0, 60),
        });
      },
      bestFor: (dateKey) =>
        get().entries.find((e) => e.dateKey === dateKey)?.score ?? 0,
    }),
    { name: "idiomify-daily-scores" },
  ),
);
