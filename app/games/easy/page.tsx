"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import { ModeTabs } from "@/components/games/ModeTabs";
import { useT } from "@/lib/locale-store";

function GameModeFallback() {
  return (
    <div className="grid min-h-[12rem] place-items-center rounded-3xl border border-[var(--line)] bg-[var(--surface)] text-sm text-[var(--muted)]">
      …
    </div>
  );
}

const McqRound = dynamic(
  () => import("@/components/games/McqRound").then((m) => m.McqRound),
  { loading: GameModeFallback },
);
const MatchingRound = dynamic(
  () => import("@/components/games/MatchingRound").then((m) => m.MatchingRound),
  { loading: GameModeFallback },
);
const FlashcardRound = dynamic(
  () =>
    import("@/components/games/FlashcardRound").then((m) => m.FlashcardRound),
  { loading: GameModeFallback },
);
const SpeedRound = dynamic(
  () => import("@/components/games/SpeedRound").then((m) => m.SpeedRound),
  { loading: GameModeFallback },
);

type EasyMode = "mcq" | "matching" | "flash" | "speed";

export default function EasyGamePage() {
  const t = useT();
  const [mode, setMode] = useState<EasyMode>("mcq");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link href="/games" className="text-sm text-[var(--accent)]">
          {t.games.back}
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--foam)]">
          {t.games.easy.pageTitle}
        </h1>
        <p className="mt-2 text-[var(--muted)]">{t.games.easy.pageSubtitle}</p>
      </header>

      <ModeTabs
        value={mode}
        onChange={setMode}
        options={[
          { id: "mcq", label: t.games.easy.modeMcq },
          { id: "matching", label: t.games.easy.modeMatching },
          { id: "flash", label: t.games.easy.modeFlash },
          { id: "speed", label: t.games.easy.modeSpeed },
        ]}
      />

      {mode === "mcq" ? <McqRound /> : null}
      {mode === "matching" ? <MatchingRound /> : null}
      {mode === "flash" ? <FlashcardRound /> : null}
      {mode === "speed" ? <SpeedRound /> : null}
    </div>
  );
}
