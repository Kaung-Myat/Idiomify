"use client";

import { create } from "zustand";

export type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type PwaInstallState = {
  deferredPrompt: BeforeInstallPromptEventLike | null;
  setDeferredPrompt: (event: BeforeInstallPromptEventLike | null) => void;
  clearDeferredPrompt: () => void;
};

export const usePwaInstallStore = create<PwaInstallState>((set) => ({
  deferredPrompt: null,
  setDeferredPrompt: (event) => set({ deferredPrompt: event }),
  clearDeferredPrompt: () => set({ deferredPrompt: null }),
}));

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || iosStandalone;
}

export function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const chrome = /CriOS|Chrome|EdgiOS|FxiOS/.test(ua);
  return iOS && webkit && !chrome;
}

const DISMISS_KEY = "idiomify-pwa-install-dismissed";
const DISMISS_DAYS = 14;

export function wasInstallDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function dismissInstallPrompt() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}
