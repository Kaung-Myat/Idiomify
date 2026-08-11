import { NextResponse } from "next/server";
import { badges, games, CATEGORIES } from "@/lib/content";
import { loadCatalog } from "@/lib/content/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "all";
  const catalog = await loadCatalog();

  if (type === "words") {
    return NextResponse.json({
      words: catalog.words,
      source: catalog.source,
    });
  }
  if (type === "idioms") {
    return NextResponse.json({
      idioms: catalog.idioms,
      categories: CATEGORIES,
      source: catalog.source,
    });
  }
  if (type === "games") return NextResponse.json({ games });
  if (type === "badges") return NextResponse.json({ badges });

  return NextResponse.json({
    words: catalog.words,
    idioms: catalog.idioms,
    games,
    badges,
    categories: CATEGORIES,
    source: catalog.source,
  });
}
