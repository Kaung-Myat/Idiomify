"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { badges as badgeDefs } from "@/lib/badges-data";
import { evaluateBadges } from "@/lib/badges-engine";
import type { LearnerProgressSnapshot } from "@/lib/progress/repository";
import type { LearnerStats } from "@/lib/types";

const emptyStats: LearnerStats = {
  searches: 0,
  speaks: 0,
  bestSpeakScore: 0,
  easyRounds: 0,
  mediumRounds: 0,
  hardPasses: 0,
  gamesCompleted: 0,
  dailyChallenges: 0,
};

type LearnerStore = {
  points: number;
  unlockedBadgeIds: string[];
  newlyUnlocked: string[];
  stats: LearnerStats;
  addPoints: (amount: number) => void;
  recordSearch: () => void;
  recordSpeak: (accuracy: number, awardPracticePoints?: boolean) => void;
  completeEasyRound: (correctCount: number) => void;
  completeMediumRound: (correctCount: number) => void;
  completeHardAttempt: (passed: boolean) => void;
  completeDailyChallenge: (score: number) => void;
  clearNewBadges: () => void;
  resetProgress: () => void;
  hydrateProgress: (snapshot: LearnerProgressSnapshot) => void;
  getProgressSnapshot: () => LearnerProgressSnapshot;
};

function syncBadges(
  points: number,
  stats: LearnerStats,
  current: string[],
): { unlockedBadgeIds: string[]; newlyUnlocked: string[] } {
  const computed = evaluateBadges(points, stats, badgeDefs);
  const newlyUnlocked = computed.filter((id) => !current.includes(id));
  return {
    unlockedBadgeIds: Array.from(new Set([...current, ...computed])),
    newlyUnlocked,
  };
}

export const useLearnerStore = create<LearnerStore>()(
  persist(
    (set, get) => ({
      points: 0,
      unlockedBadgeIds: [],
      newlyUnlocked: [],
      stats: emptyStats,

      getProgressSnapshot: () => ({
        points: get().points,
        stats: get().stats,
        unlockedBadgeIds: get().unlockedBadgeIds,
      }),

      hydrateProgress: (snapshot) => {
        const badgeUpdate = syncBadges(
          snapshot.points,
          snapshot.stats,
          snapshot.unlockedBadgeIds,
        );
        set({
          points: snapshot.points,
          stats: snapshot.stats,
          unlockedBadgeIds: badgeUpdate.unlockedBadgeIds,
          newlyUnlocked: [],
        });
      },

      addPoints: (amount) => {
        const points = get().points + amount;
        const badgeUpdate = syncBadges(points, get().stats, get().unlockedBadgeIds);
        set({ points, ...badgeUpdate });
      },

      recordSearch: () => {
        const stats = { ...get().stats, searches: get().stats.searches + 1 };
        const badgeUpdate = syncBadges(get().points, stats, get().unlockedBadgeIds);
        set({ stats, ...badgeUpdate });
      },

      recordSpeak: (accuracy, awardPracticePoints = true) => {
        const stats: LearnerStats = {
          ...get().stats,
          speaks: get().stats.speaks + 1,
          bestSpeakScore: Math.max(get().stats.bestSpeakScore, accuracy),
        };
        let points = get().points;
        if (awardPracticePoints && accuracy >= 80) {
          points += 15;
        }
        const badgeUpdate = syncBadges(points, stats, get().unlockedBadgeIds);
        set({ points, stats, ...badgeUpdate });
      },

      completeEasyRound: (correctCount) => {
        const points = get().points + correctCount * 10;
        const stats: LearnerStats = {
          ...get().stats,
          easyRounds: get().stats.easyRounds + 1,
          gamesCompleted: get().stats.gamesCompleted + 1,
        };
        const badgeUpdate = syncBadges(points, stats, get().unlockedBadgeIds);
        set({ points, stats, ...badgeUpdate });
      },

      completeMediumRound: (correctCount) => {
        const points = get().points + correctCount * 20;
        const stats: LearnerStats = {
          ...get().stats,
          mediumRounds: get().stats.mediumRounds + 1,
          gamesCompleted: get().stats.gamesCompleted + 1,
        };
        const badgeUpdate = syncBadges(points, stats, get().unlockedBadgeIds);
        set({ points, stats, ...badgeUpdate });
      },

      completeHardAttempt: (passed) => {
        let points = get().points;
        const stats: LearnerStats = {
          ...get().stats,
          gamesCompleted: get().stats.gamesCompleted + 1,
          hardPasses: get().stats.hardPasses + (passed ? 1 : 0),
        };
        if (passed) points += 30;
        const badgeUpdate = syncBadges(points, stats, get().unlockedBadgeIds);
        set({ points, stats, ...badgeUpdate });
      },

      completeDailyChallenge: (score) => {
        const bonus = Math.max(10, Math.round(score / 2));
        const points = get().points + bonus;
        const stats: LearnerStats = {
          ...get().stats,
          dailyChallenges: (get().stats.dailyChallenges ?? 0) + 1,
          gamesCompleted: get().stats.gamesCompleted + 1,
        };
        const badgeUpdate = syncBadges(points, stats, get().unlockedBadgeIds);
        set({ points, stats, ...badgeUpdate });
      },

      clearNewBadges: () => set({ newlyUnlocked: [] }),

      resetProgress: () =>
        set({
          points: 0,
          unlockedBadgeIds: [],
          newlyUnlocked: [],
          stats: emptyStats,
        }),
    }),
    {
      name: "idiomify-learner",
      partialize: (state) => ({
        points: state.points,
        unlockedBadgeIds: state.unlockedBadgeIds,
        stats: state.stats,
      }),
    },
  ),
);
