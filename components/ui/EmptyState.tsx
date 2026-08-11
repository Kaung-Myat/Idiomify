export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--card-soft)] p-8 text-center">
      <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--foam)]">
        {title}
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
    </div>
  );
}
