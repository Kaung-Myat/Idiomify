"use client";

import { useEffect, type ReactNode } from "react";
import { applyThemeToDocument, useThemeStore } from "@/lib/theme-store";
import {
  applyTextScaleToDocument,
  useTextScaleStore,
} from "@/lib/text-scale-store";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const scale = useTextScaleStore((s) => s.scale);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  useEffect(() => {
    applyTextScaleToDocument(scale);
  }, [scale]);

  return children;
}
