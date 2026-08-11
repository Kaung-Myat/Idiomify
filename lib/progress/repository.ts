import { createClient } from "@/lib/supabase/client";
import type { LearnerStats } from "@/lib/types";

export type LearnerProgressSnapshot = {
  points: number;
  stats: LearnerStats;
  unlockedBadgeIds: string[];
};

type LearnerProgressRow = {
  user_id: string;
  points: number;
  stats: LearnerStats;
  unlocked_badge_ids: string[];
  updated_at: string;
};

const defaultStats: LearnerStats = {
  searches: 0,
  speaks: 0,
  bestSpeakScore: 0,
  easyRounds: 0,
  mediumRounds: 0,
  hardPasses: 0,
  gamesCompleted: 0,
  dailyChallenges: 0,
};

function normalizeStats(raw: Partial<LearnerStats> | null | undefined): LearnerStats {
  return {
    searches: raw?.searches ?? 0,
    speaks: raw?.speaks ?? 0,
    bestSpeakScore: raw?.bestSpeakScore ?? 0,
    easyRounds: raw?.easyRounds ?? 0,
    mediumRounds: raw?.mediumRounds ?? 0,
    hardPasses: raw?.hardPasses ?? 0,
    gamesCompleted: raw?.gamesCompleted ?? 0,
    dailyChallenges: raw?.dailyChallenges ?? 0,
  };
}

function rowToSnapshot(row: LearnerProgressRow): LearnerProgressSnapshot {
  return {
    points: row.points,
    stats: normalizeStats(row.stats),
    unlockedBadgeIds: row.unlocked_badge_ids ?? [],
  };
}

export async function fetchLearnerProgress(
  userId: string,
): Promise<LearnerProgressSnapshot | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("learner_progress")
    .select("user_id, points, stats, unlocked_badge_ids, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToSnapshot(data as LearnerProgressRow);
}

export async function upsertLearnerProgress(
  userId: string,
  snapshot: LearnerProgressSnapshot,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("learner_progress").upsert(
    {
      user_id: userId,
      points: snapshot.points,
      stats: snapshot.stats ?? defaultStats,
      unlocked_badge_ids: snapshot.unlockedBadgeIds,
    },
    { onConflict: "user_id" },
  );

  if (error) throw error;
}
