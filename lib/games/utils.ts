/** Deterministic PRNG for daily challenges (mulberry32). */
export function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffleWith<T>(items: T[], rand: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function shuffle<T>(items: T[]): T[] {
  return shuffleWith(items, Math.random);
}

/** Shuffle then take up to `count` items (fresh random set each call). */
export function pickRandom<T>(items: T[], count: number): T[] {
  if (count >= items.length) return shuffle(items);
  return shuffle(items).slice(0, Math.max(0, count));
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function scrambleWords(phrase: string, rand: () => number = Math.random): string[] {
  const words = phrase.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return words;
  let scrambled = shuffleWith(words, rand);
  // Avoid identical order when possible
  let guard = 0;
  while (
    scrambled.join(" ") === words.join(" ") &&
    words.length > 1 &&
    guard < 8
  ) {
    scrambled = shuffleWith(words, rand);
    guard += 1;
  }
  return scrambled;
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
