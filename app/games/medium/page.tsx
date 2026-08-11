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

const ClozeRound = dynamic(
  () => import("@/components/games/ClozeRound").then((m) => m.ClozeRound),
  { loading: GameModeFallback },
);
const ListeningRound = dynamic(
  () =>
    import("@/components/games/ListeningRound").then((m) => m.ListeningRound),
  { loading: GameModeFallback },
);
const ScrambleRound = dynamic(
  () => import("@/components/games/ScrambleRound").then((m) => m.ScrambleRound),
  { loading: GameModeFallback },
);
const DictationRound = dynamic(
  () =>
    import("@/components/games/DictationRound").then((m) => m.DictationRound),
  { loading: GameModeFallback },
);

type MediumMode = "cloze" | "listening" | "scramble" | "dictation";

export default function MediumGamePage() {
  const t = useT();
  const [mode, setMode] = useState<MediumMode>("cloze");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link href="/games" className="text-sm text-[var(--accent)]">
          {t.games.back}
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--foam)]">
          {t.games.medium.pageTitle}
        </h1>
        <p className="mt-2 text-[var(--muted)]">{t.games.medium.pageSubtitle}</p>
      </header>

      <ModeTabs
        value={mode}
        onChange={setMode}
        options={[
          { id: "cloze", label: t.games.medium.modeCloze },
          { id: "listening", label: t.games.medium.modeListening },
          { id: "scramble", label: t.games.medium.modeScramble },
          { id: "dictation", label: t.games.medium.modeDictation },
        ]}
      />

      {mode === "cloze" ? <ClozeRound /> : null}
      {mode === "listening" ? <ListeningRound /> : null}
      {mode === "scramble" ? <ScrambleRound /> : null}
      {mode === "dictation" ? <DictationRound /> : null}
    </div>
  );
}
