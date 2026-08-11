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

const HardSpeakRound = dynamic(
  () =>
    import("@/components/games/HardSpeakRound").then((m) => m.HardSpeakRound),
  { loading: GameModeFallback },
);
const MultiHardRound = dynamic(
  () =>
    import("@/components/games/MultiHardRound").then((m) => m.MultiHardRound),
  { loading: GameModeFallback },
);

type HardMode = "timed" | "multi";

export default function HardGamePage() {
  const t = useT();
  const [mode, setMode] = useState<HardMode>("timed");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link href="/games" className="text-sm text-[var(--accent)]">
          {t.games.back}
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--foam)]">
          {t.games.hard.pageTitle}
        </h1>
        <p className="mt-2 text-[var(--muted)]">{t.games.hard.pageSubtitle}</p>
      </header>

      <ModeTabs
        value={mode}
        onChange={setMode}
        options={[
          { id: "timed", label: t.games.hard.modeTimed },
          { id: "multi", label: t.games.hard.modeMulti },
        ]}
      />

      {mode === "timed" ? <HardSpeakRound /> : <MultiHardRound />}
    </div>
  );
}
