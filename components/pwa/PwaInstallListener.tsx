"use client";

import { useEffect } from "react";
import {
  type BeforeInstallPromptEventLike,
  usePwaInstallStore,
} from "@/lib/pwa-install-store";

/** Captures the browser install prompt early (before dashboard mounts). */
export function PwaInstallListener() {
  const setDeferredPrompt = usePwaInstallStore((s) => s.setDeferredPrompt);
  const clearDeferredPrompt = usePwaInstallStore((s) => s.clearDeferredPrompt);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEventLike);
    }

    function onInstalled() {
      clearDeferredPrompt();
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [setDeferredPrompt, clearDeferredPrompt]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) void reg.unregister();
    });
  }, []);

  return null;
}
