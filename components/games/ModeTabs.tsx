"use client";

type ModeOption<T extends string> = {
  id: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  options: ModeOption<T>[];
  onChange: (value: T) => void;
};

export function ModeTabs<T extends string>({
  value,
  options,
  onChange,
}: Props<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              active
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--foam)]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
