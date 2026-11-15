"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/providers";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted"
    >
      {/* Both icons render on the server; CSS shows the right one so there is no hydration mismatch. */}
      <Moon className="h-5 w-5 dark:hidden" aria-hidden />
      <Sun className="hidden h-5 w-5 dark:block" aria-hidden />
    </button>
  );
}
