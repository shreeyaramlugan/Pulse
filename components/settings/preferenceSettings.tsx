
"use client";

import {
  CalendarDays,
  Coins,
  Languages,
  Clock3,
  Loader2,
} from "lucide-react";
import { useState } from "react";

type PreferenceSettingsProps = {
  initialWeekStartsOn: number;
  initialCurrency: string;
  initialDateFormat: string;
  initialTimeFormat: string;
  initialLanguage: string;
};

export function PreferenceSettings({
  initialWeekStartsOn,
  initialCurrency,
  initialDateFormat,
  initialTimeFormat,
  initialLanguage,
}: PreferenceSettingsProps) {
  const [weekStartsOn, setWeekStartsOn] =
    useState(initialWeekStartsOn);

  const [currency, setCurrency] =
    useState(initialCurrency);

  const [dateFormat, setDateFormat] =
    useState(initialDateFormat);

  const [timeFormat, setTimeFormat] =
    useState(initialTimeFormat);

  const [language, setLanguage] =
    useState(initialLanguage);

  const [loading, setLoading] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch(
        "/api/settings/preferences",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            weekStartsOn,
            currency,
            dateFormat,
            timeFormat,
            language,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to save preferences."
        );
      }

      setSaved(true);
    } catch (error: any) {
      console.error(error);

      setError(
        error?.message ||
          "Unable to save preferences."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">
          Preferences
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Configure how NEXUS displays dates,
          times and your workspace.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {saved && (
        <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          Your preferences have been updated.
        </div>
      )}

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {/* Week start */}
        <div className="p-6">
          <div className="mb-4 flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 text-muted-foreground" />

            <div>
              <h3 className="text-sm font-semibold">
                Week starts on
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Used for weekly planning and
                calendar views.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: 1,
                label: "Monday",
                description:
                  "Monday → Sunday",
              },
              {
                value: 0,
                label: "Sunday",
                description:
                  "Sunday → Saturday",
              },
            ].map((option) => {
              const selected =
                weekStartsOn === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setWeekStartsOn(
                      option.value
                    )
                  }
                  disabled={loading}
                  className={[
                    "rounded-lg border p-4 text-left transition",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted",
                  ].join(" ")}
                >
                  <p className="text-sm font-medium">
                    {option.label}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Currency */}
        <div className="p-6">
          <div className="mb-4 flex items-start gap-3">
            <Coins className="mt-0.5 h-5 w-5 text-muted-foreground" />

            <div>
              <h3 className="text-sm font-semibold">
                Currency
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Used for invoices, expenses and
                financial tracking.
              </p>
            </div>
          </div>

          <select
            value={currency}
            onChange={(event) =>
              setCurrency(event.target.value)
            }
            disabled={loading}
            className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            <option value="ZAR">
              ZAR — South African Rand
            </option>

            <option value="USD">
              USD — US Dollar
            </option>

            <option value="EUR">
              EUR — Euro
            </option>

            <option value="GBP">
              GBP — British Pound
            </option>
          </select>
        </div>

        {/* Date format */}
        <div className="p-6">
          <div className="mb-4 flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 text-muted-foreground" />

            <div>
              <h3 className="text-sm font-semibold">
                Date format
              </h3>
            </div>
          </div>

          <select
            value={dateFormat}
            onChange={(event) =>
              setDateFormat(event.target.value)
            }
            disabled={loading}
            className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            <option value="DD/MM/YYYY">
              DD/MM/YYYY — 06/09/2026
            </option>

            <option value="MM/DD/YYYY">
              MM/DD/YYYY — 09/06/2026
            </option>

            <option value="YYYY-MM-DD">
              YYYY-MM-DD — 2026-09-06
            </option>
          </select>
        </div>

        {/* Time format */}
        <div className="p-6">
          <div className="mb-4 flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 text-muted-foreground" />

            <div>
              <h3 className="text-sm font-semibold">
                Time format
              </h3>
            </div>
          </div>

          <select
            value={timeFormat}
            onChange={(event) =>
              setTimeFormat(event.target.value)
            }
            disabled={loading}
            className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            <option value="24H">
              24-hour — 18:30
            </option>

            <option value="12H">
              12-hour — 6:30 PM
            </option>
          </select>
        </div>

        {/* Language */}
        <div className="p-6">
          <div className="mb-4 flex items-start gap-3">
            <Languages className="mt-0.5 h-5 w-5 text-muted-foreground" />

            <div>
              <h3 className="text-sm font-semibold">
                Language
              </h3>
            </div>
          </div>

          <select
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value)
            }
            disabled={loading}
            className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            <option value="en">
              English
            </option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save preferences"
          )}
        </button>
      </div>
    </section>
  );
}
