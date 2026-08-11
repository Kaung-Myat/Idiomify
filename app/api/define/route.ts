import { NextResponse } from "next/server";
import { lookupDefinition, searchDefinitions } from "@/lib/content";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json(
      { error: "Missing query parameter q" },
      { status: 400 },
    );
  }

  const exact = lookupDefinition(q);
  const results = searchDefinitions(q);

  return NextResponse.json({
    query: q,
    match: exact,
    results,
  });
}
