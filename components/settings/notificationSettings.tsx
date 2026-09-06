"use client";

import {
  Bell,
  BellOff,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";

type NotificationPreference =
  | "ALL"
  | "IMPORTANT"
  | "NONE";

type NotificationSettingsProps = {
  initialPreference: NotificationPreference;
};

export function NotificationSettings({
  initialPreference,
}: NotificationSettingsProps) {
  const [preference, setPreference] =
    useState<NotificationPreference>(
      initialPreference
    );

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
        "/api/settings/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            notificationPreference:
              preference,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to save notification settings."
        );
      }

      setSaved(true);
    } catch (error: any) {
      console.error(error);

      setError(
        error?.message ||
          "Unable to save notification settings."
      );
    } finally {
      setLoading(false);
    }
  }

  const options = [
    {
      value: "ALL" as const,
      title: "All notifications",
      description:
        "Tasks, reminders, habits and important updates.",
      icon: Bell,
    },
    {
      value: "IMPORTANT" as const,
      title: "Important only",
      description:
        "Only important reminders and alerts.",
      icon: ShieldAlert,
    },
    {
      value: "NONE" as const,
      title: "No notifications",
      description:
        "Keep notifications turned off.",
      icon: BellOff,
    },
  ];

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">
          Notifications
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose how much NEXUS should notify you.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {saved && (
        <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          Notification preferences updated.
        </div>
      )}

      <div className="space-y-3">
        {options.map((option) => {
          const Icon = option.icon;

          const selected =
            preference === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setPreference(option.value)
              }
              disabled={loading}
              aria-pressed={selected}
              className={[
                "flex w-full items-start gap-4 rounded-xl border p-5 text-left transition",
                selected
                  ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                  : "border-border bg-card hover:bg-muted",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  selected
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {option.title}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {option.description}
                </p>
              </div>

              <div
                className={[
                  "mt-1 h-4 w-4 rounded-full border",
                  selected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40",
                ].join(" ")}
              >
                {selected && (
                  <div className="m-1 h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                )}
              </div>
            </button>
          );
        })}
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
            "Save notifications"
          )}
        </button>
      </div>
    </section>
  );
}
