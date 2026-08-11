"use client";

import { alignWords, type WordDiffToken } from "@/lib/scoring";
import { useT } from "@/lib/locale-store";

function TokenSpan({ token }: { token: WordDiffToken }) {
  const styles: Record<WordDiffToken["status"], string> = {
    match: "text-[var(--foam)]",
    mismatch: "rounded bg-[var(--warn-bg)] px-1.5 text-[var(--warn-fg)]",
    missing: "rounded bg-[var(--danger-bg)] px-1.5 text-[var(--danger-fg)] line-through",
    extra: "rounded bg-[var(--info-bg)] px-1.5 text-[var(--info-fg)]",
  };
  return <span className={styles[token.status]}>{token.text}</span>;
}

function LegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      {label}
    </span>
  );
}

type Props = {
  target: string;
  transcript: string;
};

export function TranscriptDiff({ target, transcript }: Props) {
  const t = useT();
  const cleanTranscript = transcript.replace(/^\(demo\)\s*/i, "").trim();
  if (!cleanTranscript) return null;

  const { targetTokens, heardTokens } = alignWords(target, cleanTranscript);
  const hasDiff =
    targetTokens.some((x) => x.status !== "match") ||
    heardTokens.some((x) => x.status !== "match");

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-[var(--line)] bg-[var(--card-soft)] p-4 text-sm">
      <p className="text-xs text-[var(--muted)]">{t.speak.diffNote}</p>
      <div>
        <p className="mb-1 text-xs uppercase tracking-wide text-[var(--muted)]">
          {t.speak.targetWords}
        </p>
        <p className="flex flex-wrap gap-1.5 leading-relaxed">
          {targetTokens.map((token, i) => (
            <TokenSpan key={`t-${i}-${token.text}`} token={token} />
          ))}
        </p>
      </div>
      <div>
        <p className="mb-1 text-xs uppercase tracking-wide text-[var(--muted)]">
          {t.speak.heardWords}
        </p>
        <p className="flex flex-wrap gap-1.5 leading-relaxed">
          {heardTokens.map((token, i) => (
            <TokenSpan key={`h-${i}-${token.text}`} token={token} />
          ))}
        </p>
      </div>
      {hasDiff ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--muted)]">
          <LegendItem color="var(--danger-fg)" label={t.speak.legendMissing} />
          <LegendItem color="var(--warn-fg)" label={t.speak.legendMismatch} />
          <LegendItem color="var(--info-fg)" label={t.speak.legendExtra} />
        </div>
      ) : (
        <p className="text-xs text-[var(--ok-fg)]">{t.speak.diffPerfect}</p>
      )}
    </div>
  );
}
