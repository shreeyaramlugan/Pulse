
"use client";

import {
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Mail,
  Shield,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

type SecuritySettingsProps = {
  email: string;
  providers: string[];
};

export function SecuritySettings({
  email,
  providers,
}: SecuritySettingsProps) {
  const [loading, setLoading] =
    useState(false);

  async function handleSignOutEverywhere() {
    const confirmed = window.confirm(
      "Sign out of all NEXUS sessions?"
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const hasGoogle =
    providers.includes("GOOGLE");

  const hasEmail =
    providers.includes("EMAIL");

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">
          Authentication
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage how you sign in and access your
          NEXUS account.
        </p>
      </div>

      {/* Authentication methods */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-6">
          <h3 className="text-sm font-semibold">
            Authentication methods
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            These providers are linked to your
            Firebase account.
          </p>
        </div>

        <div className="divide-y divide-border">
          {/* Email */}
          {hasEmail && (
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">
                  Email & password
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {email}
                </p>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </span>
            </div>
          )}

          {/* Google */}
          {hasGoogle && (
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <GoogleIcon />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">
                  Google
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Sign in with your Google account.
                </p>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Session */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-6">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 text-muted-foreground" />

            <div>
              <h3 className="text-sm font-semibold">
                Session security
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Manage your active NEXUS authentication
                session.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
            <Smartphone className="mt-0.5 h-5 w-5 text-muted-foreground" />

            <div>
              <p className="text-sm font-medium">
                Current session
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                You are currently signed in to this
                NEXUS workspace.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <LogOut className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold">
              Sign out
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Sign out of your current NEXUS session.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOutEverywhere}
            disabled={loading}
            className="rounded-lg border border-border px-4 py-2 text-xs font-medium transition hover:bg-muted disabled:opacity-60"
          >
            {loading
              ? "Signing out..."
              : "Sign out"}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5">
        <div className="border-b border-destructive/20 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />

            <div>
              <h3 className="text-sm font-semibold text-destructive">
                Danger zone
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                These actions can permanently affect
                your account.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm font-medium">
              Delete account
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Permanently delete your NEXUS account
              and associated data.
            </p>
          </div>

          <button
            type="button"
            disabled
            className="rounded-lg border border-destructive/30 px-4 py-2 text-xs font-medium text-destructive opacity-60"
          >
            Delete account
          </button>
        </div>
      </div>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M21.35 12.27c0-.79-.07-1.55-.23-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.39Z"
      />

      <path
        fill="currentColor"
        d="M12 21.98c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-4.69-4.03H3.3v2.51A9.74 9.74 0 0 0 12 21.98Z"
      />

      <path
        fill="currentColor"
        d="M6.54 14.09a5.86 5.86 0 0 1 0-3.73V7.85H3.3a9.97 9.97 0 0 0 0 8.75l3.24-2.51Z"
      />

      <path
        fill="currentColor"
        d="M12 6.33c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.41 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.35l3.24 2.51C7.31 8.05 9.46 6.33 12 6.33Z"
      />
    </svg>
  );
}
