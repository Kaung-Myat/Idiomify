import { NextResponse } from "next/server";
import {
  loadCatalog,
  lookupCatalogDefinition,
  mergeDefinitionResults,
  searchCatalogDefinitions,
} from "@/lib/content/repository";
import { fetchFreeDictionary } from "@/lib/dictionary/free-dictionary";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json(
      { error: "Missing query parameter q" },
      { status: 400 },
    );
  }

  const catalog = await loadCatalog();
  const curatedResults = searchCatalogDefinitions(catalog, q);
  const curatedMatch = lookupCatalogDefinition(catalog, q);

  const dictionaryResults = await fetchFreeDictionary(q);
  const results = mergeDefinitionResults(curatedResults, dictionaryResults);

  const match =
    curatedMatch ??
    dictionaryResults.find(
      (r) => r.term.toLowerCase() === q.toLowerCase(),
    ) ??
    results[0] ??
    null;

  return NextResponse.json({
    query: q,
    match,
    results,
    sources: {
      catalog: catalog.source,
      dictionary: dictionaryResults.length > 0,
    },
  });
}
