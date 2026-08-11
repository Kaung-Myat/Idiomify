import { createClient } from "@supabase/supabase-js";
import {
  idioms as localIdioms,
  words as localWords,
  searchDefinitions as searchLocalDefinitions,
  lookupDefinition as lookupLocalDefinition,
} from "@/lib/content";
import type { DefinitionResult, Idiom, Word } from "@/lib/types";

export type ContentCatalog = {
  words: Word[];
  idioms: Idiom[];
  source: "supabase" | "json";
};

type CacheEntry = ContentCatalog & { at: number };

const TTL_MS = 60_000;
let cache: CacheEntry | null = null;

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function normalizeWord(row: Record<string, unknown>): Word | null {
  const id = String(row.id ?? "").trim();
  const term = String(row.term ?? "").trim();
  const definition = String(row.definition ?? "").trim();
  const example = String(row.example ?? "").trim();
  if (!id || !term || !definition || !example) return null;
  const phonetic = row.phonetic ? String(row.phonetic) : undefined;
  return { id, term, phonetic, definition, example };
}

function normalizeIdiom(row: Record<string, unknown>): Idiom | null {
  const id = String(row.id ?? "").trim();
  const term = String(row.term ?? "").trim();
  const category = String(row.category ?? "").trim();
  const definition = String(row.definition ?? "").trim();
  const example = String(row.example ?? "").trim();
  if (!id || !term || !category || !definition || !example) return null;
  return { id, term, category, definition, example };
}

async function fetchFromSupabase(): Promise<ContentCatalog | null> {
  const supabase = getAnonClient();
  if (!supabase) return null;

  const [wordsRes, idiomsRes] = await Promise.all([
    supabase
      .from("words")
      .select("id,term,phonetic,definition,example")
      .order("term"),
    supabase
      .from("idioms")
      .select("id,term,category,definition,example")
      .order("term"),
  ]);

  // Table missing / RLS / network → fall through to JSON
  if (wordsRes.error && idiomsRes.error) return null;

  const remoteWords = (wordsRes.data ?? [])
    .map((r) => normalizeWord(r as Record<string, unknown>))
    .filter((w): w is Word => Boolean(w));
  const remoteIdioms = (idiomsRes.data ?? [])
    .map((r) => normalizeIdiom(r as Record<string, unknown>))
    .filter((i): i is Idiom => Boolean(i));

  // Prefer remote when at least one table has rows; fill gaps from JSON
  if (remoteWords.length === 0 && remoteIdioms.length === 0) return null;

  return {
    words: remoteWords.length > 0 ? remoteWords : localWords,
    idioms: remoteIdioms.length > 0 ? remoteIdioms : localIdioms,
    source: "supabase",
  };
}

/** Supabase first (if seeded), otherwise bundled JSON. Cached ~60s. */
export async function loadCatalog(
  options?: { force?: boolean },
): Promise<ContentCatalog> {
  if (!options?.force && cache && Date.now() - cache.at < TTL_MS) {
    return cache;
  }

  try {
    const remote = await fetchFromSupabase();
    if (remote) {
      cache = { ...remote, at: Date.now() };
      return cache;
    }
  } catch {
    // ignore — JSON fallback
  }

  cache = {
    words: localWords,
    idioms: localIdioms,
    source: "json",
    at: Date.now(),
  };
  return cache;
}

function withCuratedSource(items: DefinitionResult[]): DefinitionResult[] {
  return items.map((item) => ({
    ...item,
    source: item.source ?? "curated",
  }));
}

export function searchCatalogDefinitions(
  catalog: ContentCatalog,
  query: string,
): DefinitionResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const wordHits: DefinitionResult[] = catalog.words
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
      source: "curated" as const,
    }));

  const idiomHits: DefinitionResult[] = catalog.idioms
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
      source: "curated" as const,
    }));

  return [...wordHits, ...idiomHits];
}

export function lookupCatalogDefinition(
  catalog: ContentCatalog,
  query: string,
): DefinitionResult | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const exactWord = catalog.words.find((w) => w.term.toLowerCase() === q);
  if (exactWord) {
    return {
      kind: "word",
      id: exactWord.id,
      term: exactWord.term,
      phonetic: exactWord.phonetic,
      definition: exactWord.definition,
      example: exactWord.example,
      source: "curated",
    };
  }

  const exactIdiom = catalog.idioms.find((i) => i.term.toLowerCase() === q);
  if (exactIdiom) {
    return {
      kind: "idiom",
      id: exactIdiom.id,
      term: exactIdiom.term,
      category: exactIdiom.category,
      definition: exactIdiom.definition,
      example: exactIdiom.example,
      source: "curated",
    };
  }

  return searchCatalogDefinitions(catalog, q)[0] ?? null;
}

/** Dedupe by term+kind; curated wins over dictionary. */
export function mergeDefinitionResults(
  curated: DefinitionResult[],
  external: DefinitionResult[],
): DefinitionResult[] {
  const seen = new Set(
    curated.map((r) => `${r.kind}:${r.term.toLowerCase()}`),
  );
  const extras = external.filter((r) => {
    const key = `${r.kind}:${r.term.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...withCuratedSource(curated), ...extras];
}

/** Sync helpers kept for client components that still import lib/content. */
export { searchLocalDefinitions, lookupLocalDefinition };
