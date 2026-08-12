"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SpeakPanel } from "@/components/practice/SpeakPanel";
import { TargetPicker } from "@/components/practice/TargetPicker";
import { allPracticeTargets } from "@/lib/content";
import { usePracticeStore } from "@/lib/practice-store";
import { useLearnerStore } from "@/lib/store";
import { useT } from "@/lib/locale-store";

function PracticeInner() {
  const searchParams = useSearchParams();
  const targets = useMemo(() => allPracticeTargets(), []);
  const fallback = targets[0]?.term || "break the ice";
  const paramTarget = searchParams.get("target")?.trim() ?? "";
  const persistTarget = usePracticeStore((s) => s.setTarget);
  const [target, setTarget] = useState(paramTarget || fallback);
  const recordSpeak = useLearnerStore((s) => s.recordSpeak);
  const t = useT();

  useEffect(() => {
    function applySaved() {
      if (paramTarget) {
        setTarget(paramTarget);
        persistTarget(paramTarget);
        return;
      }
      const saved = usePracticeStore.getState().target;
      if (saved) setTarget(saved);
    }

    if (usePracticeStore.persist.hasHydrated()) {
      applySaved();
      return;
    }

    return usePracticeStore.persist.onFinishHydration(applySaved);
  }, [paramTarget, persistTarget]);

  useEffect(() => {
    if (!paramTarget) return;
    setTarget(paramTarget);
    persistTarget(paramTarget);
  }, [paramTarget, persistTarget]);

  function handleTargetChange(next: string) {
    setTarget(next);
    persistTarget(next);
  }

  const options = useMemo(() => {
    const extras: { id: string; term: string; example: string }[] = [];
    for (const term of [paramTarget, target]) {
      if (
        term &&
        !targets.some((item) => item.term === term) &&
        !extras.some((e) => e.term === term)
      ) {
        extras.push({ id: `custom-${term}`, term, example: "" });
      }
    }
    return [...extras, ...targets];
  }, [targets, paramTarget, target]);

  return (
    <div className="mx-auto max-w-2xl space-y-5 md:space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-[1.75rem] leading-tight tracking-tight text-[var(--foam)] md:text-4xl">
          {t.practice.title}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)] md:mt-2 md:text-base">
          {t.practice.subtitle}
        </p>
      </header>

      <TargetPicker
        options={options}
        value={target}
        onChange={handleTargetChange}
      />

      <SpeakPanel
        target={target}
        onScored={(accuracy) => recordSpeak(accuracy, true)}
      />
    </div>
  );
}

export default function PracticePage() {
  const t = useT();

  return (
    <Suspense
      fallback={<p className="text-[var(--muted)]">{t.common.loadingPractice}</p>}
    >
      <PracticeInner />
    </Suspense>
  );
}
