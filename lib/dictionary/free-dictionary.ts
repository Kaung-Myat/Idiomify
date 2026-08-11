import type { DefinitionResult } from "@/lib/types";

const FREE_DICT_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";
const TIMEOUT_MS = 4500;

type FreeDictMeaning = {
  partOfSpeech?: string;
  definitions?: {
    definition?: string;
    example?: string;
  }[];
};

type FreeDictEntry = {
  word?: string;
  phonetic?: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings?: FreeDictMeaning[];
};

function pickPhonetic(entry: FreeDictEntry): string | undefined {
  if (entry.phonetic?.trim()) return entry.phonetic.trim();
  const fromList = entry.phonetics?.find((p) => p.text?.trim())?.text?.trim();
  return fromList || undefined;
}

function pickAudio(entry: FreeDictEntry): string | undefined {
  const url = entry.phonetics?.find((p) => p.audio?.trim())?.audio?.trim();
  return url || undefined;
}

function looksLikeIdiom(term: string): boolean {
  return term.trim().includes(" ");
}

/** Map Free Dictionary API payload → Idiomify definition cards. */
export function mapFreeDictionaryEntries(
  query: string,
  entries: FreeDictEntry[],
): DefinitionResult[] {
  const results: DefinitionResult[] = [];
  const q = query.trim().toLowerCase();

  for (const entry of entries.slice(0, 2)) {
    const term = (entry.word ?? query).trim();
    if (!term) continue;

    const meaning = entry.meanings?.[0];
    const def = meaning?.definitions?.[0];
    if (!def?.definition) continue;

    const example =
      def.example?.trim() ||
      meaning?.definitions?.find((d) => d.example?.trim())?.example?.trim() ||
      `Example usage of “${term}”.`;

    const kind = looksLikeIdiom(term) ? "idiom" : "word";
    const id = `dict-${kind}-${term.toLowerCase().replace(/\s+/g, "-")}`;

    results.push({
      kind,
      id,
      term,
      phonetic: pickPhonetic(entry),
      definition: def.definition,
      example,
      source: "dictionary",
      audioUrl: pickAudio(entry),
    });
  }

  // Prefer exact-term match first
  results.sort((a, b) => {
    const ae = a.term.toLowerCase() === q ? 0 : 1;
    const be = b.term.toLowerCase() === q ? 0 : 1;
    return ae - be;
  });

  return results;
}

/**
 * Live lookup via Free Dictionary API (no API key).
 * Returns [] on miss, timeout, or network error.
 */
export async function fetchFreeDictionary(
  query: string,
): Promise<DefinitionResult[]> {
  const q = query.trim();
  if (!q || q.length > 80) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      `${FREE_DICT_URL}/${encodeURIComponent(q.toLowerCase())}`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 },
      },
    );

    if (res.status === 404) return [];
    if (!res.ok) return [];

    const data = (await res.json()) as FreeDictEntry[] | { title?: string };
    if (!Array.isArray(data) || data.length === 0) return [];

    return mapFreeDictionaryEntries(q, data);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
