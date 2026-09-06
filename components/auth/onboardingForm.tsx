
"use client";

import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useTheme } from "@/components/theme/themeProvider";
import type { ThemeName } from "@/themes/types";

type Props = {
  initialName?: string;
};

const themeOptions: {
  value: ThemeName;
  label: string;
}[] = [

  {
    value: "organic",
    label: "Organic",
  },
  {
    value: "chai",
    label: "Chai",
  },
  {
    value: "cyberpunk",
    label: "Cyberpunk",
  },
  {
    value: "futuristic",
    label: "Futuristic",
  },
  {
    value: "obsidian",
    label: "Obsidian",
  },
  {
    value: "pink",
    label: "Pretty in Pink",
  },
];

export function OnboardingForm({
  initialName = "",
}: Props) {
  const router = useRouter();

  const {
    theme: activeTheme,
    setTheme,
  } = useTheme();

  const [name, setName] =
    useState(initialName);

  const [weekStart, setWeekStart] =
    useState("MONDAY");

  const [
    notificationPreference,
    setNotificationPreference,
  ] = useState("ALL");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/onboarding",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
      body: JSON.stringify({ name: name.trim(), weekStart, notificationPreference, theme: activeTheme, }),
      
        }
      );

      const text =
        await response.text();

      let data: any = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to save your preferences."
        );
      }

      // Keep the selected theme immediately active.
      setTheme(activeTheme);

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error(
        "Onboarding failed:",
        error
      );

      setError(
        error?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <div>
        <p className="text-sm font-medium text-primary">
          Welcome to Pulse
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Let's set things up.
        </h1>

        <p className="mt-2 text-muted-foreground">
          A few quick preferences and your
          workspace will be ready.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium"
        >
          What should we call you?
        </label>

        <input
          id="name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Your name"
          required
          maxLength={100}
          disabled={loading}
          className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>

      {/* Week start */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">
            When does your week start?
          </label>

          <p className="text-xs text-muted-foreground">
            This controls how your weekly
            planning is displayed.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            {
              value: "MONDAY",
              title: "Monday",
              description:
                "Monday → Sunday",
            },
            {
              value: "SUNDAY",
              title: "Sunday",
              description:
                "Sunday → Saturday",
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setWeekStart(option.value)
              }
              disabled={loading}
              aria-pressed={
                weekStart === option.value
              }
              className={`rounded-lg border p-4 text-left transition ${
                weekStart === option.value
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border hover:bg-muted"
              }`}
            >
              <p className="font-medium">
                {option.title}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">
            Notifications
          </label>

          <p className="text-xs text-muted-foreground">
            Choose how much Pulse should
            notify you.
          </p>
        </div>

        <div className="space-y-2">
          {[
            {
              value: "ALL",
              title: "All notifications",
              description:
                "Tasks, reminders, habits and important updates.",
            },
            {
              value: "IMPORTANT",
              title: "Important only",
              description:
                "Only important reminders and alerts.",
            },
            {
              value: "NONE",
              title: "No notifications",
              description:
                "Keep notifications turned off.",
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setNotificationPreference(
                  option.value
                )
              }
              disabled={loading}
              aria-pressed={
                notificationPreference ===
                option.value
              }
              className={`w-full rounded-lg border p-4 text-left transition ${
                notificationPreference ===
                option.value
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border hover:bg-muted"
              }`}
            >
              <p className="font-medium">
                {option.title}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">
            Choose your theme
          </label>

          <p className="text-xs text-muted-foreground">
            You can change this later.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {themeOptions.map((option) => {
            const selected =
              activeTheme === option.value;

            return (
              <button
                key={option.value}
                type="button"
            onClick={() => { setTheme(option.value); }}
                disabled={loading}
                aria-pressed={selected}
                className={[
                  "relative rounded-lg border p-4 text-center",
                  "transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  "focus:outline-none focus:ring-2 focus:ring-ring/30",
                  selected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                    : "border-border hover:bg-muted",
                  loading
                    ? "cursor-not-allowed opacity-60"
                    : "",
                ].join(" ")}
              >
                {selected && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    ✓
                  </span>
                )}

                <span className="text-sm font-medium">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={
          loading || !name.trim()
        }
        className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Setting up your workspace...
          </>
        ) : (
          "Continue to Pulse"
        )}
      </button>
    </form>
  );
}
