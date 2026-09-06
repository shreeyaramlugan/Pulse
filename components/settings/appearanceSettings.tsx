"use client";

import { ThemeSelector } from "@/components/theme/themeSelector";

export function AppearanceSettings() {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Appearance
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose the visual language for your
          NEXUS workspace.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <ThemeSelector />
      </div>
    </section>
  );
}