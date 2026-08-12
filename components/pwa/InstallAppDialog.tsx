"use client";

import { useEffect, useId, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/locale-store";
import {
  dismissInstallPrompt,
  isIosSafari,
  isStandaloneDisplay,
  usePwaInstallStore,
  wasInstallDismissed,
} from "@/lib/pwa-install-store";

export function InstallAppDialog() {
  const t = useT();
  const titleId = useId();
  const deferredPrompt = usePwaInstallStore((s) => s.deferredPrompt);
  const clearDeferredPrompt = usePwaInstallStore((s) => s.clearDeferredPrompt);
  const [open, setOpen] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay() || wasInstallDismissed()) return;

    const ios = isIosSafari();
    setIosHint(ios);

    // Wait briefly so the dashboard paints first, and so Chromium can fire
    // beforeinstallprompt after the service worker is ready (production).
    const timer = window.setTimeout(() => {
      if (isStandaloneDisplay() || wasInstallDismissed()) return;
      const canPrompt = Boolean(usePwaInstallStore.getState().deferredPrompt);
      // Dev has no SW installability — still show the dialog so you can review UX.
      const forceDevPreview = process.env.NODE_ENV === "development";
      if (canPrompt || ios || forceDevPreview) setOpen(true);
    }, 900);

    return () => window.clearTimeout(timer);
  }, []);

  // If the install event arrives after mount, open then (unless dismissed).
  useEffect(() => {
    if (!deferredPrompt || open) return;
    if (isStandaloneDisplay() || wasInstallDismissed()) return;
    setOpen(true);
  }, [deferredPrompt, open]);

  if (!open) return null;

  function close() {
    dismissInstallPrompt();
    setOpen(false);
  }

  async function handleInstall() {
    const promptEvent = usePwaInstallStore.getState().deferredPrompt;
    if (!promptEvent) return;
    setBusy(true);
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      clearDeferredPrompt();
      if (choice.outcome === "accepted") {
        setOpen(false);
      } else {
        dismissInstallPrompt();
        setOpen(false);
      }
    } catch {
      dismissInstallPrompt();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label={t.common.close}
        onClick={close}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl animate-[rise_0.28s_ease-out] sm:rounded-3xl sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex justify-center sm:hidden" aria-hidden>
          <span className="mb-3 h-1 w-10 rounded-full bg-[color-mix(in_oklab,var(--foam)_22%,transparent)]" />
        </div>

        <div className="flex justify-center">
          <BrandLogo href="" size="md" className="justify-center" />
        </div>

        <h2
          id={titleId}
          className="mt-5 text-center font-[family-name:var(--font-display)] text-2xl text-[var(--foam)]"
        >
          {t.pwa.installTitle}
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-[var(--muted)]">
          {iosHint && !deferredPrompt
            ? t.pwa.installIosBody
            : deferredPrompt
              ? t.pwa.installBody
              : t.pwa.installDevBody}
        </p>

        {iosHint && !deferredPrompt ? (
          <ol className="mt-5 space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--card-soft)] px-4 py-3 text-left text-sm text-[var(--foam)]">
            <li>1. {t.pwa.iosStepShare}</li>
            <li>2. {t.pwa.iosStepAdd}</li>
            <li>3. {t.pwa.iosStepConfirm}</li>
          </ol>
        ) : null}

        {!deferredPrompt && !iosHint ? (
          <p className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--card-soft)] px-4 py-3 text-left text-sm text-[var(--muted)]">
            {t.pwa.installHint}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          {deferredPrompt ? (
            <Button
              type="button"
              className="min-h-11 w-full sm:flex-1"
              disabled={busy}
              onClick={() => void handleInstall()}
            >
              {busy ? t.pwa.installing : t.pwa.installButton}
            </Button>
          ) : null}
          <Button
            type="button"
            variant={deferredPrompt ? "secondary" : "primary"}
            className="min-h-11 w-full sm:flex-1"
            onClick={close}
          >
            {deferredPrompt ? t.pwa.notNow : t.common.close}
          </Button>
        </div>
      </div>
    </div>
  );
}
