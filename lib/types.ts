export type Word = {
  id: string;
  term: string;
  phonetic?: string;
  definition: string;
  example: string;
};

export type Idiom = {
  id: string;
  term: string;
  category: string;
  definition: string;
  example: string;
};

export type DefinitionSource = "curated" | "dictionary";

export type DefinitionResult = {
  kind: "word" | "idiom";
  id: string;
  term: string;
  phonetic?: string;
  category?: string;
  definition: string;
  example: string;
  /** curated = local/JSON/Supabase; dictionary = Free Dictionary API */
  source?: DefinitionSource;
  audioUrl?: string;
};

export type EasyQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
};

export type MatchingPair = {
  id: string;
  term: string;
  definition: string;
};

export type MediumQuestion = {
  id: string;
  sentence: string;
  answer: string;
  hint: string;
};

export type ListeningQuestion = {
  id: string;
  speak: string;
  options: string[];
  answerIndex: number;
};

export type HardPrompt = {
  id: string;
  target: string;
  seconds: number;
};

export type MultiHardChallenge = {
  id: string;
  phrases: string[];
  startSeconds: number;
};

export type GamesData = {
  easy: EasyQuestion[];
  matching: MatchingPair[];
  medium: MediumQuestion[];
  listening: ListeningQuestion[];
  hard: HardPrompt[];
  multiHard: MultiHardChallenge[];
};

export type BadgeDef = {
  id: string;
  name: string;
  description: string;
  rule: string;
};

export type LearnerStats = {
  searches: number;
  speaks: number;
  bestSpeakScore: number;
  easyRounds: number;
  mediumRounds: number;
  hardPasses: number;
  gamesCompleted: number;
  dailyChallenges: number;
};

export type ScoreResult = {
  accuracy: number;
  feedback: string;
  normalizedTarget: string;
  normalizedTranscript: string;
};
