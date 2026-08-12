import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <BrandLogo href="/" size="md" className="justify-center" />
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl text-[var(--foam)]">
        You’re offline
      </h1>
      <p className="mt-3 text-[var(--muted)] leading-relaxed">
        Idiomify needs a connection for live search and scoring. Reconnect, then
        try again — cached pages may still work.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard">
          <Button type="button">Back to overview</Button>
        </Link>
        <Link href="/">
          <Button type="button" variant="secondary">
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
