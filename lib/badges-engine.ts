import type { BadgeDef, LearnerStats } from "@/lib/types";

export function evaluateBadges(
  points: number,
  stats: LearnerStats,
  badgeDefs: BadgeDef[],
): string[] {
  const unlocked: string[] = [];

  for (const badge of badgeDefs) {
    let ok = false;
    switch (badge.id) {
      case "first-word":
        ok = stats.searches >= 1 || stats.speaks >= 1;
        break;
      case "perfect-score":
        ok = stats.bestSpeakScore >= 95;
        break;
      case "easy-starter":
        ok = stats.easyRounds >= 1;
        break;
      case "game-runner":
        ok = stats.gamesCompleted >= 5;
        break;
      case "hard-champion":
        ok = stats.hardPasses >= 1;
        break;
      case "point-collector":
        ok = points >= 100;
        break;
      case "daily-grinder":
        ok = (stats.dailyChallenges ?? 0) >= 1;
        break;
      default:
        ok = false;
    }
    if (ok) unlocked.push(badge.id);
  }

  return unlocked;
}
