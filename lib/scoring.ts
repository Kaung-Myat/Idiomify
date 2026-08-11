import type { ScoreResult } from "@/lib/types";

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(0),
  );

  for (let i = 0; i < rows; i++) matrix[i][0] = i;
  for (let j = 0; j < cols; j++) matrix[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

export function similarityPercent(target: string, transcript: string): number {
  const a = normalizeText(target);
  const b = normalizeText(transcript);
  if (!a || !b) return 0;
  if (a === b) return 100;

  const distance = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  const score = Math.round((1 - distance / maxLen) * 100);
  return Math.max(0, Math.min(100, score));
}

export function feedbackForScore(accuracy: number): string {
  if (accuracy >= 95) return "Excellent match — nearly perfect!";
  if (accuracy >= 80) return "Great match — clear and confident.";
  if (accuracy >= 60) return "Close! Listen to the reference and try again.";
  if (accuracy >= 40) return "Keep practicing — slow down and enunciate.";
  return "Try again — speak the target phrase clearly.";
}

export type WordDiffStatus = "match" | "mismatch" | "missing" | "extra";

export type WordDiffToken = {
  text: string;
  status: WordDiffStatus;
};

/**
 * Word-level alignment via LCS so UI can highlight mismatches.
 * This is ASR text similarity feedback — not phoneme diagnostics.
 */
export function alignWords(
  target: string,
  transcript: string,
): { targetTokens: WordDiffToken[]; heardTokens: WordDiffToken[] } {
  const targetWords = normalizeText(target).split(" ").filter(Boolean);
  const heardWords = normalizeText(transcript).split(" ").filter(Boolean);

  const n = targetWords.length;
  const m = heardWords.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array(m + 1).fill(0),
  );

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (targetWords[i - 1] === heardWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const matchedTarget = new Set<number>();
  const matchedHeard = new Set<number>();
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (targetWords[i - 1] === heardWords[j - 1]) {
      matchedTarget.add(i - 1);
      matchedHeard.add(j - 1);
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i -= 1;
    } else {
      j -= 1;
    }
  }

  const targetTokens: WordDiffToken[] = targetWords.map((text, idx) => ({
    text,
    status: matchedTarget.has(idx) ? "match" : "missing",
  }));
  const heardTokens: WordDiffToken[] = heardWords.map((text, idx) => ({
    text,
    status: matchedHeard.has(idx) ? "match" : "extra",
  }));

  for (let ti = 0; ti < targetTokens.length; ti++) {
    if (targetTokens[ti].status !== "missing") continue;
    const nearIdx = heardTokens.findIndex(
      (h, hi) => h.status === "extra" && Math.abs(hi - ti) <= 1,
    );
    if (nearIdx >= 0) {
      targetTokens[ti].status = "mismatch";
      heardTokens[nearIdx].status = "mismatch";
    }
  }

  return { targetTokens, heardTokens };
}

export function scoreSpeech(target: string, transcript: string): ScoreResult {
  const accuracy = similarityPercent(target, transcript);
  return {
    accuracy,
    feedback: feedbackForScore(accuracy),
    normalizedTarget: normalizeText(target),
    normalizedTranscript: normalizeText(transcript),
  };
}

/** Deterministic demo score for venue fallback (not random). */
export function demoScore(target: string): ScoreResult {
  const seed = normalizeText(target).length;
  const accuracy = 82 + (seed % 14); // 82–95
  return {
    accuracy,
    feedback: feedbackForScore(accuracy) + " (Demo Mode)",
    normalizedTarget: normalizeText(target),
    normalizedTranscript: normalizeText(target),
  };
}
