import { NextResponse } from "next/server";
import { demoScore, scoreSpeech } from "@/lib/scoring";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      target?: string;
      transcript?: string;
      demo?: boolean;
    };

    const target = body.target?.trim() ?? "";
    if (!target) {
      return NextResponse.json({ error: "target is required" }, { status: 400 });
    }

    if (body.demo) {
      return NextResponse.json(demoScore(target));
    }

    const transcript = body.transcript?.trim() ?? "";
    if (!transcript) {
      return NextResponse.json(
        { error: "transcript is required unless demo=true" },
        { status: 400 },
      );
    }

    return NextResponse.json(scoreSpeech(target, transcript));
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
