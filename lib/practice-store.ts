"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type PracticeStore = {
  target: string;
  setTarget: (target: string) => void;
};

export const usePracticeStore = create<PracticeStore>()(
  persist(
    (set) => ({
      target: "",
      setTarget: (target) => set({ target }),
    }),
    { name: "idiomify-practice" },
  ),
);
