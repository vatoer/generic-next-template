"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  storageKey?: string;
}

export const AppThemeProvider = ({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  storageKey = "app-theme",
}: ThemeProviderProps) => (
  <ThemeProvider
    attribute={attribute}
    defaultTheme={defaultTheme}
    enableSystem={enableSystem}
    storageKey={storageKey}
    disableTransitionOnChange={false}
  >
    {children}
  </ThemeProvider>
);
