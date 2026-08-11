"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type OnboardingStore = {
  hasStarted: boolean;
  start: () => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasStarted: false,
      start: () => set({ hasStarted: true }),
      reset: () => set({ hasStarted: false }),
    }),
    { name: "idiomify-onboarding" },
  ),
);
