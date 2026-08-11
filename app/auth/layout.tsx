import type { ReactNode } from "react";
import { Suspense } from "react";

function AuthFallback() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="rounded-3xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--surface)_85%,transparent)] p-8">
        <span className="mx-auto inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--accent)]" />
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AuthFallback />}>{children}</Suspense>;
}
