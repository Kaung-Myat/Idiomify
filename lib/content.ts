import wordsData from "@/data/words.json";
import idiomsData from "@/data/idioms.json";
import gamesData from "@/data/games.json";
import { badges } from "@/lib/badges-data";
import type {
  DefinitionResult,
  GamesData,
  Idiom,
  Word,
} from "@/lib/types";

export const words = wordsData as Word[];
export const idioms = idiomsData as Idiom[];
export const games = gamesData as GamesData;
export { badges };

export const CATEGORIES = [
  "Business",
  "Daily Life",
  "Emotions",
  "Travel",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function slugifyCategory(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function categoryFromSlug(slug: string): string | undefined {
  return CATEGORIES.find((c) => slugifyCategory(c) === slug);
}

export function getIdiomsByCategory(category: string): Idiom[] {
  return idioms.filter(
    (idiom) => idiom.category.toLowerCase() === category.toLowerCase(),
  );
}

export function getIdiomById(id: string): Idiom | undefined {
  return idioms.find((idiom) => idiom.id === id);
}

export function getWordById(id: string): Word | undefined {
  return words.find((word) => word.id === id);
}

export function searchDefinitions(query: string): DefinitionResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const wordHits: DefinitionResult[] = words
    .filter(
      (w) =>
        w.term.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q),
    )
    .map((w) => ({
      kind: "word" as const,
      id: w.id,
      term: w.term,
      phonetic: w.phonetic,
      definition: w.definition,
      example: w.example,
    }));

  const idiomHits: DefinitionResult[] = idioms
    .filter(
      (i) =>
        i.term.toLowerCase().includes(q) ||
        i.definition.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q),
    )
    .map((i) => ({
      kind: "idiom" as const,
      id: i.id,
      term: i.term,
      category: i.category,
      definition: i.definition,
      example: i.example,
    }));

  return [...wordHits, ...idiomHits];
}

export function lookupDefinition(query: string): DefinitionResult | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const exactWord = words.find((w) => w.term.toLowerCase() === q);
  if (exactWord) {
    return {
      kind: "word",
      id: exactWord.id,
      term: exactWord.term,
      phonetic: exactWord.phonetic,
      definition: exactWord.definition,
      example: exactWord.example,
    };
  }

  const exactIdiom = idioms.find((i) => i.term.toLowerCase() === q);
  if (exactIdiom) {
    return {
      kind: "idiom",
      id: exactIdiom.id,
      term: exactIdiom.term,
      category: exactIdiom.category,
      definition: exactIdiom.definition,
      example: exactIdiom.example,
    };
  }

  const results = searchDefinitions(q);
  return results[0] ?? null;
}

export function allPracticeTargets(): {
  id: string;
  term: string;
  example: string;
}[] {
  return [
    ...words.map((w) => ({ id: w.id, term: w.term, example: w.example })),
    ...idioms.map((i) => ({ id: i.id, term: i.term, example: i.example })),
  ];
}
