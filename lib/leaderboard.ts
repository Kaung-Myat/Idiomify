import { createClient } from "@/lib/supabase/client";

export type LeaderboardRow = {
  displayName: string;
  score: number;
  userId?: string | null;
};

export async function submitDailyScore(input: {
  dateKey: string;
  score: number;
  displayName: string;
  userId: string | null;
}): Promise<void> {
  try {
    if (!input.userId) return;
    const supabase = createClient();

    await supabase.from("daily_scores").upsert(
      {
        user_id: input.userId,
        date_key: input.dateKey,
        score: input.score,
        display_name: input.displayName.slice(0, 64),
      },
      { onConflict: "user_id,date_key" },
    );
  } catch {
    // Leaderboard is optional — local score still counts.
  }
}

export async function fetchDailyLeaderboard(
  dateKey: string,
): Promise<LeaderboardRow[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("daily_scores")
      .select("display_name, score, user_id")
      .eq("date_key", dateKey)
      .order("score", { ascending: false })
      .limit(10);

    if (error || !data) return [];

    return data.map((row) => ({
      displayName: row.display_name as string,
      score: row.score as number,
      userId: row.user_id as string,
    }));
  } catch {
    return [];
  }
}
