"use client";

import { Check, Moon, Sun } from "lucide-react";

import { useTheme } from "./themeProvider";
import type { ThemeName } from "@/themes/types";

const themeOrder: ThemeName[] = [
  "obsidian",
  "futuristic",
  "cyberpunk",
  "organic",
  "mission",
  "chai",
  "pink",
];

export function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Appearance
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose the visual language for your workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {themeOrder.map((themeName) => {
          const currentTheme = themes[themeName];
          const selected = theme === themeName;

          return (
            <button
              key={themeName}
              type="button"
              onClick={() => setTheme(themeName)}
              className={[
                "group relative overflow-hidden rounded-xl border text-left",
                "transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-lg",
                selected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border",
              ].join(" ")}
            >
              {/* Preview */}
              <div
                className="relative h-32 overflow-hidden p-3"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  color: currentTheme.colors.foreground,
                }}
              >
                {/* Mini application window */}
                <div
                  className="h-full overflow-hidden rounded-lg border p-2"
                  style={{
                    backgroundColor: currentTheme.colors.card,
                    borderColor: currentTheme.colors.border,
                  }}
                >
                  {/* Mini header */}
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex gap-1">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            currentTheme.colors.primary,
                        }}
                      />

                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            currentTheme.colors.accent,
                        }}
                      />

                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            currentTheme.colors.mutedForeground,
                        }}
                      />
                    </div>

                    <div
                      className="h-1.5 w-8 rounded-full"
                      style={{
                        backgroundColor:
                          currentTheme.colors.muted,
                      }}
                    />
                  </div>

                  {/* Mini content */}
                  <div className="flex gap-2">
                    <div
                      className="w-1/4 rounded"
                      style={{
                        backgroundColor:
                          currentTheme.colors.secondary,
                      }}
                    />

                    <div className="flex flex-1 flex-col gap-1.5">
                      <div
                        className="h-2 w-2/3 rounded"
                        style={{
                          backgroundColor:
                            currentTheme.colors.primary,
                        }}
                      />

                      <div
                        className="h-1.5 w-full rounded"
                        style={{
                          backgroundColor:
                            currentTheme.colors.muted,
                        }}
                      />

                      <div
                        className="h-1.5 w-4/5 rounded"
                        style={{
                          backgroundColor:
                            currentTheme.colors.muted,
                        }}
                      />

                      <div
                        className="mt-1 h-4 w-1/3 rounded"
                        style={{
                          backgroundColor:
                            currentTheme.colors.accent,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Selected */}
                {selected && (
                  <div
                    className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full"
                    style={{
                      backgroundColor:
                        currentTheme.colors.primary,
                      color:
                        currentTheme.colors.primaryForeground,
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground">
                      {currentTheme.label}
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {currentTheme.description}
                    </p>
                  </div>

                  <div className="shrink-0 text-muted-foreground">
                    {currentTheme.mode === "dark" ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Colour palette */}
                <div className="mt-4 flex gap-1.5">
                  {[
                    currentTheme.colors.primary,
                    currentTheme.colors.accent,
                    currentTheme.colors.secondary,
                    currentTheme.colors.muted,
                    currentTheme.colors.border,
                  ].map((color, index) => (
                    <span
                      key={index}
                      className="h-3 flex-1 rounded-sm border border-border/50"
                      style={{
                        backgroundColor: color,
                      }}
                    />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

