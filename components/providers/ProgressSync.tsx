"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import {
  fetchLearnerProgress,
  upsertLearnerProgress,
} from "@/lib/progress/repository";
import { useLearnerStore } from "@/lib/store";

const SAVE_DEBOUNCE_MS = 900;

export function ProgressSync() {
  const { state } = useAuth();
  const hydratingRef = useRef(false);
  const userId =
    state.status === "authed" ? state.user.id : null;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    (async () => {
      hydratingRef.current = true;
      try {
        const remote = await fetchLearnerProgress(userId);
        if (cancelled) return;

        if (remote) {
          useLearnerStore.getState().hydrateProgress(remote);
        } else {
          await upsertLearnerProgress(
            userId,
            useLearnerStore.getState().getProgressSnapshot(),
          );
        }
      } catch (err) {
        console.error("Failed to sync learner progress:", err);
      } finally {
        hydratingRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = useLearnerStore.subscribe((current, previous) => {
      if (hydratingRef.current) return;

      const changed =
        current.points !== previous.points ||
        current.unlockedBadgeIds.length !== previous.unlockedBadgeIds.length ||
        JSON.stringify(current.stats) !== JSON.stringify(previous.stats);

      if (!changed) return;

      clearTimeout(timer);
      timer = setTimeout(() => {
        upsertLearnerProgress(
          userId,
          useLearnerStore.getState().getProgressSnapshot(),
        ).catch((err) => console.error("Failed to save learner progress:", err));
      }, SAVE_DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [userId]);

  return null;
}
