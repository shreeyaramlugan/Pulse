"use client";

import {
  Camera,
  Loader2,
  Mail,
  User,
  Globe2,
} from "lucide-react";
import { useState } from "react";

type ProfileSettingsProps = {
  initialName: string;
  email: string;
  avatarUrl?: string | null;
  initialTimezone: string;
};

export function ProfileSettings({
  initialName,
  email,
  avatarUrl,
  initialTimezone,
}: ProfileSettingsProps) {
  const [name, setName] = useState(initialName);
  const [timezone, setTimezone] =
    useState(initialTimezone);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch(
        "/api/settings/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name,
            timezone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to save profile."
        );
      }

      setSaved(true);
    } catch (error: any) {
      console.error(error);

      setError(
        error?.message ||
          "Unable to save profile."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Profile
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and
          regional settings.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {saved && (
        <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          Your profile has been updated.
        </div>
      )}

      {/* Avatar */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-8 w-8" />
              </div>
            )}

            <button
              type="button"
              disabled
              title="Avatar uploads coming soon"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              Profile picture
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Your Google profile picture is used
              automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Personal information */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="settings-name"
              className="text-sm font-medium"
            >
              Name
            </label>

            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                id="settings-name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                maxLength={100}
                disabled={loading}
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="settings-email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                id="settings-email"
                value={email}
                readOnly
                className="h-11 w-full cursor-not-allowed rounded-lg border border-input bg-muted/40 pl-10 pr-4 text-sm text-muted-foreground outline-none"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Your email is managed through Firebase
              Authentication.
            </p>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <label
              htmlFor="settings-timezone"
              className="text-sm font-medium"
            >
              Timezone
            </label>

            <div className="relative">
              <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <select
                id="settings-timezone"
                value={timezone}
                onChange={(event) =>
                  setTimezone(event.target.value)
                }
                disabled={loading}
                className="h-11 w-full appearance-none rounded-lg border border-input bg-background px-4 pl-10 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
              >
                <option value="Africa/Johannesburg">
                  Africa/Johannesburg
                </option>

                <option value="UTC">
                  UTC
                </option>

                <option value="Europe/London">
                  Europe/London
                </option>

                <option value="Europe/Paris">
                  Europe/Paris
                </option>

                <option value="America/New_York">
                  America/New_York
                </option>

                <option value="America/Los_Angeles">
                  America/Los_Angeles
                </option>

                <option value="Asia/Kolkata">
                  Asia/Kolkata
                </option>

                <option value="Asia/Tokyo">
                  Asia/Tokyo
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={
              loading || !name.trim()
            }
            className="flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

