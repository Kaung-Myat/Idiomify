"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DefinitionResult } from "@/lib/types";

const MAX_RECENTS = 8;

type SearchRecentsStore = {
  recents: DefinitionResult[];
  addRecent: (item: DefinitionResult) => void;
  removeRecent: (id: string, kind: DefinitionResult["kind"]) => void;
  clearRecents: () => void;
};

export const useSearchRecentsStore = create<SearchRecentsStore>()(
  persist(
    (set) => ({
      recents: [],
      addRecent: (item) =>
        set((state) => {
          const without = state.recents.filter(
            (r) => !(r.id === item.id && r.kind === item.kind),
          );
          return { recents: [item, ...without].slice(0, MAX_RECENTS) };
        }),
      removeRecent: (id, kind) =>
        set((state) => ({
          recents: state.recents.filter(
            (r) => !(r.id === id && r.kind === kind),
          ),
        })),
      clearRecents: () => set({ recents: [] }),
    }),
    { name: "idiomify-search-recents" },
  ),
);
