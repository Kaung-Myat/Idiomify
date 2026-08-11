import { NextResponse } from "next/server";
import {
  badges,
  games,
  idioms,
  words,
  CATEGORIES,
} from "@/lib/content";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "all";

  if (type === "words") return NextResponse.json({ words });
  if (type === "idioms") return NextResponse.json({ idioms, categories: CATEGORIES });
  if (type === "games") return NextResponse.json({ games });
  if (type === "badges") return NextResponse.json({ badges });

  return NextResponse.json({
    words,
    idioms,
    games,
    badges,
    categories: CATEGORIES,
  });
}
