
"use client";

import {
  Check,
  ExternalLink,
  HardDrive,
  Loader2,
  MessageCircle,
  Plus,
  Unplug,
} from "lucide-react";
import { useState } from "react";

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  connected: boolean;
};

export function IntegrationsSettings() {
  const [integrations, setIntegrations] =
    useState<Integration[]>([
      {
        id: "google",
        name: "Google",
        description:
          "Connect your Google account for authentication and Google services.",
        icon: GoogleIcon,
        connected: true,
      },
      {
        id: "drive",
        name: "Google Drive",
        description:
          "Store and access documents and files from your NEXUS workspace.",
        icon: HardDrive,
        connected: false,
      },
      {
        id: "telegram",
        name: "Telegram",
        description:
          "Receive NEXUS notifications and interact with your workspace.",
        icon: MessageCircle,
        connected: false,
      },
    ]);

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  function handleConnect(id: string) {
    setLoadingId(id);

    setTimeout(() => {
      setIntegrations((current) =>
        current.map((integration) =>
          integration.id === id
            ? {
                ...integration,
                connected: true,
              }
            : integration
        )
      );

      setLoadingId(null);
    }, 600);
  }

  function handleDisconnect(id: string) {
    setLoadingId(id);

    setTimeout(() => {
      setIntegrations((current) =>
        current.map((integration) =>
          integration.id === id
            ? {
                ...integration,
                connected: false,
              }
            : integration
        )
      );

      setLoadingId(null);
    }, 600);
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">
          Integrations
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Connect NEXUS to the tools and services
          you already use.
        </p>
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;

          const loading =
            loadingId === integration.id;

          return (
            <div
              key={integration.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">
                      {integration.name}
                    </h3>

                    {integration.connected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        <Check className="h-3 w-3" />
                        Connected
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {integration.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    integration.connected
                      ? handleDisconnect(
                          integration.id
                        )
                      : handleConnect(
                          integration.id
                        )
                  }
                  disabled={loading}
                  className={[
                    "flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition",
                    integration.connected
                      ? "border-border hover:bg-muted"
                      : "border-primary bg-primary text-primary-foreground hover:opacity-90",
                  ].join(" ")}
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : integration.connected ? (
                    <>
                      <Unplug className="h-3.5 w-3.5" />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
        <div className="flex items-start gap-3">
          <ExternalLink className="mt-0.5 h-4 w-4 text-muted-foreground" />

          <div>
            <p className="text-sm font-medium">
              More integrations are coming
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Calendar, automation and additional
              productivity integrations can be added
              here as the NEXUS ecosystem grows.
            </p>
          </div>
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
